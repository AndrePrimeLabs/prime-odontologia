/**
 * PrimeOsHub — Core API
 * Entry point: Express app with full middleware stack
 * github.com/enterprises/PrimeOsHub / primeos-core
 */

import express, { Application, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import { Pool } from 'pg'
import { createClient } from 'redis'
import pino from 'pino'

import { authRouter }      from './routes/auth'
import { orgsRouter }      from './routes/organizations'
import { bmcRouter }       from './routes/bmc'
import { modulesRouter }   from './routes/modules'
import { agentsRouter }    from './routes/agents'
import { integrationsRouter } from './routes/integrations'
import { webhooksRouter }  from './routes/webhooks'

import { authMiddleware }  from './middleware/auth'
import { tenantMiddleware } from './middleware/tenant'
import { rateLimiter }     from './middleware/rateLimiter'
import { errorHandler }    from './middleware/errorHandler'
import { requestLogger }   from './middleware/requestLogger'
import { wsHandler }       from './ws/wsHandler'

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
})

// ── Database pool ──────────────────────────────────────────────────────────
export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
})

// ── Redis client ───────────────────────────────────────────────────────────
export const cache = createClient({ url: process.env.REDIS_URL })
cache.on('error', (err) => logger.error({ err }, 'Redis error'))

// ── App factory ────────────────────────────────────────────────────────────
export async function createApp(): Promise<{ app: Application; httpServer: ReturnType<typeof createServer> }> {
  await cache.connect()
  logger.info('Redis connected')

  await db.query('SELECT 1')
  logger.info('PostgreSQL connected')

  const app = express()

  // ── Core middleware ──────────────────────────────────────────────────────
  app.use(helmet())
  app.use(compression())
  app.use(cors({
    origin: (process.env.CORS_ORIGINS ?? 'http://localhost:5173').split(','),
    credentials: true,
  }))
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true }))
  app.use(requestLogger(logger))
  app.use(rateLimiter(cache))

  // ── Health ───────────────────────────────────────────────────────────────
  app.get('/health', async (_req: Request, res: Response) => {
    try {
      await db.query('SELECT 1')
      await cache.ping()
      res.json({
        status: 'ok',
        version: process.env.npm_package_version ?? '0.0.1',
        timestamp: new Date().toISOString(),
        services: { postgres: 'ok', redis: 'ok' },
      })
    } catch (err) {
      res.status(503).json({ status: 'degraded', error: String(err) })
    }
  })

  // ── Public routes ────────────────────────────────────────────────────────
  app.use('/api/v1/auth',     authRouter(db, cache))
  app.use('/api/v1/webhooks', webhooksRouter(db, cache))   // WhatsApp, GitHub

  // ── Protected routes (require JWT + tenant) ──────────────────────────────
  app.use('/api/v1', authMiddleware(cache), tenantMiddleware(db))
  app.use('/api/v1/orgs',         orgsRouter(db, cache))
  app.use('/api/v1/bmc',          bmcRouter(db, cache))
  app.use('/api/v1/modules',      modulesRouter(db, cache))
  app.use('/api/v1/agents',       agentsRouter(db, cache))
  app.use('/api/v1/integrations', integrationsRouter(db, cache))

  // ── Error handler ────────────────────────────────────────────────────────
  app.use(errorHandler(logger))

  // ── WebSocket ────────────────────────────────────────────────────────────
  const httpServer = createServer(app)
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' })
  wsHandler(wss, cache, logger)

  return { app, httpServer }
}
