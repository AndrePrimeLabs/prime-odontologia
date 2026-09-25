/**
 * PrimeOsHub — BMC Routes
 * Full CRUD for all 9 Business Model Canvas blocks
 * All routes are org-scoped (multi-tenant via req.orgId)
 */

import { Router, Request, Response, NextFunction } from 'express'
import { Pool } from 'pg'
import { RedisClientType } from 'redis'
import { z } from 'zod'
import { AppError } from '../../middleware/errorHandler'

// Keep validation local to this route module so it does not depend on an
// unavailable middleware module.
function validate(schema: z.ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      next(new AppError(400, result.error.issues.map(issue => issue.message).join('; ')))
      return
    }
    req.body = result.data
    next()
  }
}

// ── Schemas ────────────────────────────────────────────────────────────────

const KeyActivitySchema = z.object({
  name:        z.string().min(1).max(255),
  category:    z.string().max(100).optional(),
  owner_id:    z.string().uuid().optional(),
  status:      z.enum(['active', 'inactive', 'archived']).default('active'),
  priority:    z.number().int().min(1).max(5).default(3),
  kpi_target:  z.number().optional(),
  kpi_actual:  z.number().optional(),
  frequency:   z.string().max(50).optional(),
})

const KeyResourceSchema = z.object({
  name:          z.string().min(1).max(255),
  resource_type: z.enum(['HUMAN', 'PHYSICAL', 'INTELLECTUAL', 'FINANCIAL']),
  unit_value:    z.number().optional(),
  currency:      z.string().length(3).default('BRL'),
  quantity:      z.number().default(1),
  location:      z.string().max(255).optional(),
  status:        z.enum(['available', 'in_use', 'depleted']).default('available'),
})

const ValuePropositionSchema = z.object({
  name:           z.string().min(1).max(255),
  description:    z.string().optional(),
  gain_creators:  z.array(z.string()).default([]),
  pain_relievers: z.array(z.string()).default([]),
  fit_score:      z.number().min(0).max(10).optional(),
  is_active:      z.boolean().default(true),
  segment_ids:    z.array(z.string().uuid()).default([]),
})

const CostStructureSchema = z.object({
  name:      z.string().min(1).max(255),
  cost_type: z.enum(['FIXED', 'VARIABLE', 'SEMI_VARIABLE', 'COGS']),
  amount:    z.number().positive(),
  currency:  z.string().length(3).default('BRL'),
  frequency: z.string().max(50).optional(),
  is_fixed:  z.boolean().default(true),
  tax_code:  z.string().max(50).optional(),
})

const RevenueStreamSchema = z.object({
  name:        z.string().min(1).max(255),
  stream_type: z.enum(['SUBSCRIPTION', 'ONE_TIME', 'LICENSING', 'USAGE', 'ASSET_SALE']),
  segment_id:  z.string().uuid().optional(),
  amount:      z.number().optional(),
  currency:    z.string().length(3).default('BRL'),
  mrr:         z.number().optional(),
  churn_rate:  z.number().min(0).max(1).optional(),
  start_date:  z.string().optional(),
})

const CustomerSegmentSchema = z.object({
  name:            z.string().min(1).max(255),
  market_vertical: z.enum([
    'RETAIL','SERVICES','HOSPITALITY','HEALTH','EDUCATION',
    'CONSTRUCTION','TECH','LOGISTICS','AGRICULTURE','MANUFACTURING','FINANCIAL'
  ]),
  size_estimate: z.number().int().optional(),
  geography:     z.string().max(255).optional(),
  demographics:  z.record(z.unknown()).optional(),
  ltv_avg:       z.number().optional(),
  is_active:     z.boolean().default(true),
})

// ── Route factory ──────────────────────────────────────────────────────────

export function bmcRouter(db: Pool, _cache: RedisClientType): Router {
  const r = Router()

  // ── Helper: list + create for any BMC table ──────────────────────────────
  function crudBlock(table: string, schema: z.ZodTypeAny, fields: string[]) {
    // LIST
    r.get(`/${table}`, async (req: Request, res: Response) => {
      const { rows } = await db.query(
        `SELECT * FROM primeos.${table}
         WHERE org_id = $1 AND deleted_at IS NULL
         ORDER BY created_at DESC`,
        [req.orgId]
      )
      res.json({ data: rows, count: rows.length })
    })

    // GET ONE
    r.get(`/${table}/:id`, async (req: Request, res: Response) => {
      const { rows } = await db.query(
        `SELECT * FROM primeos.${table} WHERE id = $1 AND org_id = $2 AND deleted_at IS NULL`,
        [req.params.id, req.orgId]
      )
      if (!rows[0]) throw new AppError(404, 'Not found')
      res.json({ data: rows[0] })
    })

    // CREATE
    r.post(`/${table}`, validate(schema), async (req: Request, res: Response) => {
      const cols = fields.filter(f => req.body[f] !== undefined)
      const vals = cols.map(f => req.body[f])
      const placeholders = cols.map((_, i) => `$${i + 2}`)
      const { rows } = await db.query(
        `INSERT INTO primeos.${table} (org_id, ${cols.join(', ')})
         VALUES ($1, ${placeholders.join(', ')})
         RETURNING *`,
        [req.orgId, ...vals]
      )
      res.status(201).json({ data: rows[0] })
    })

    // UPDATE
    r.patch(`/${table}/:id`, validate(schema.partial()), async (req: Request, res: Response) => {
      const cols = fields.filter(f => req.body[f] !== undefined)
      if (!cols.length) throw new AppError(400, 'No fields to update')
      const sets = cols.map((f, i) => `${f} = $${i + 3}`)
      const { rows } = await db.query(
        `UPDATE primeos.${table}
         SET ${sets.join(', ')}, updated_at = NOW()
         WHERE id = $1 AND org_id = $2 AND deleted_at IS NULL
         RETURNING *`,
        [req.params.id, req.orgId, ...cols.map(f => req.body[f])]
      )
      if (!rows[0]) throw new AppError(404, 'Not found')
      res.json({ data: rows[0] })
    })

    // SOFT DELETE
    r.delete(`/${table}/:id`, async (req: Request, res: Response) => {
      const { rowCount } = await db.query(
        `UPDATE primeos.${table} SET deleted_at = NOW()
         WHERE id = $1 AND org_id = $2 AND deleted_at IS NULL`,
        [req.params.id, req.orgId]
      )
      if (!rowCount) throw new AppError(404, 'Not found')
      res.json({ success: true })
    })
  }

  // ── Register all 9 blocks ─────────────────────────────────────────────────
  crudBlock('bmc_key_activities',
    KeyActivitySchema,
    ['name','category','owner_id','status','priority','kpi_target','kpi_actual','frequency'])

  crudBlock('bmc_key_resources',
    KeyResourceSchema,
    ['name','resource_type','unit_value','currency','quantity','location','status'])

  crudBlock('bmc_cost_structure',
    CostStructureSchema,
    ['name','cost_type','amount','currency','frequency','is_fixed','tax_code'])

  crudBlock('bmc_revenue_streams',
    RevenueStreamSchema,
    ['name','stream_type','segment_id','amount','currency','mrr','churn_rate','start_date'])

  crudBlock('bmc_key_partners',
    z.object({
      name:           z.string().min(1).max(255),
      partner_type:   z.enum(['SUPPLIER','ALLIANCE','JV','BUYER','COOPETITOR']).optional(),
      motivation:     z.string().optional(),
      sla_level:      z.string().max(50).optional(),
      contract_start: z.string().optional(),
      contract_end:   z.string().optional(),
      status:         z.enum(['active','inactive','expired']).default('active'),
    }),
    ['name','partner_type','motivation','sla_level','contract_start','contract_end','status'])

  crudBlock('bmc_customer_relationships',
    z.object({
      segment_id:        z.string().uuid().optional(),
      relationship_type: z.enum(['PERSONAL','SELF_SERVICE','AUTOMATED','COMMUNITY','CO_CREATION']).optional(),
      channel_id:        z.string().uuid().optional(),
      nps_score:         z.number().min(0).max(10).optional(),
      csat:              z.number().min(0).max(10).optional(),
      churn_risk:        z.number().min(0).max(1).optional(),
      ltv:               z.number().optional(),
    }),
    ['segment_id','relationship_type','channel_id','nps_score','csat','churn_risk','ltv'])

  crudBlock('bmc_channels',
    z.object({
      name:                  z.string().min(1).max(255),
      channel_type:          z.enum(['DIRECT','INDIRECT','DIGITAL','PHYSICAL','PARTNER']).optional(),
      phase:                 z.enum(['AWARENESS','EVALUATION','PURCHASE','DELIVERY','AFTERSALES']).optional(),
      cost_per_acquisition:  z.number().optional(),
      conversion_rate:       z.number().min(0).max(1).optional(),
      is_active:             z.boolean().default(true),
    }),
    ['name','channel_type','phase','cost_per_acquisition','conversion_rate','is_active'])

  crudBlock('bmc_customer_segments', CustomerSegmentSchema,
    ['name','market_vertical','size_estimate','geography','demographics','ltv_avg','is_active'])

  // ── Value Propositions with M2M segment mapping ───────────────────────────
  r.get('/bmc_value_propositions', async (req: Request, res: Response) => {
    const { rows } = await db.query(
      `SELECT vp.*,
              COALESCE(json_agg(vsm.segment_id) FILTER (WHERE vsm.segment_id IS NOT NULL), '[]') AS segment_ids
       FROM primeos.bmc_value_propositions vp
       LEFT JOIN primeos.vp_segment_map vsm ON vsm.vp_id = vp.id
       WHERE vp.org_id = $1 AND vp.deleted_at IS NULL
       GROUP BY vp.id ORDER BY vp.created_at DESC`,
      [req.orgId]
    )
    res.json({ data: rows, count: rows.length })
  })

  r.post('/bmc_value_propositions', validate(ValuePropositionSchema), async (req: Request, res: Response) => {
    const client = await db.connect()
    try {
      await client.query('BEGIN')
      const { segment_ids, ...body } = req.body
      const { rows } = await client.query(
        `INSERT INTO primeos.bmc_value_propositions
           (org_id, name, description, gain_creators, pain_relievers, fit_score, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [req.orgId, body.name, body.description, body.gain_creators,
         body.pain_relievers, body.fit_score, body.is_active]
      )
      const vp = rows[0]
      if (segment_ids?.length) {
        for (const sid of segment_ids) {
          await client.query(
            `INSERT INTO primeos.vp_segment_map (vp_id, segment_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
            [vp.id, sid]
          )
        }
      }
      await client.query('COMMIT')
      res.status(201).json({ data: { ...vp, segment_ids: segment_ids ?? [] } })
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  })

  // ── BMC Dashboard summary ─────────────────────────────────────────────────
  r.get('/dashboard', async (req: Request, res: Response) => {
    const [ka, kr, vp, cs, rs, kp, cr, ch, cseg] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM primeos.bmc_key_activities       WHERE org_id=$1 AND deleted_at IS NULL`, [req.orgId]),
      db.query(`SELECT COUNT(*) FROM primeos.bmc_key_resources        WHERE org_id=$1 AND deleted_at IS NULL`, [req.orgId]),
      db.query(`SELECT COUNT(*) FROM primeos.bmc_value_propositions   WHERE org_id=$1 AND deleted_at IS NULL`, [req.orgId]),
      db.query(`SELECT COALESCE(SUM(amount),0) AS total FROM primeos.bmc_cost_structure WHERE org_id=$1 AND deleted_at IS NULL`, [req.orgId]),
      db.query(`SELECT COALESCE(SUM(mrr),0) AS total_mrr FROM primeos.bmc_revenue_streams WHERE org_id=$1 AND deleted_at IS NULL`, [req.orgId]),
      db.query(`SELECT COUNT(*) FROM primeos.bmc_key_partners         WHERE org_id=$1 AND deleted_at IS NULL AND status='active'`, [req.orgId]),
      db.query(`SELECT AVG(nps_score) AS avg_nps FROM primeos.bmc_customer_relationships WHERE org_id=$1 AND deleted_at IS NULL`, [req.orgId]),
      db.query(`SELECT COUNT(*) FROM primeos.bmc_channels             WHERE org_id=$1 AND deleted_at IS NULL AND is_active=true`, [req.orgId]),
      db.query(`SELECT COUNT(*) FROM primeos.bmc_customer_segments    WHERE org_id=$1 AND deleted_at IS NULL AND is_active=true`, [req.orgId]),
    ])

    res.json({
      data: {
        key_activities:      Number(ka.rows[0].count),
        key_resources:       Number(kr.rows[0].count),
        value_propositions:  Number(vp.rows[0].count),
        total_monthly_cost:  Number(cs.rows[0].total),
        total_mrr:           Number(rs.rows[0].total_mrr),
        total_arr:           Number(rs.rows[0].total_mrr) * 12,
        active_partners:     Number(kp.rows[0].count),
        avg_nps:             Number(cr.rows[0].avg_nps ?? 0).toFixed(1),
        active_channels:     Number(ch.rows[0].count),
        active_segments:     Number(cseg.rows[0].count),
      }
    })
  })

  return r
}
