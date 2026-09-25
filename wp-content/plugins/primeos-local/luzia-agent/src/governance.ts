/**
 * Luzia — PrimeOsHub System Governance Agent
 * Internal AI agent for policy enforcement, compliance, and system health
 * github.com/enterprises/PrimeOsHub / luzia-agent
 */

import Anthropic from '@anthropic-ai/sdk'
import { Pool } from 'pg'
import { createClient, RedisClientType } from 'redis'
import pino from 'pino'
import { NemoclawClient } from './nemoclaw'
import { AlertManager }   from './alerts'
import type { GovernanceReport, PolicyViolation, HealthMetrics } from './types'

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' })

// ── Luzia system prompt ────────────────────────────────────────────────────
const LUZIA_SYSTEM = `
Você é Luzia, o agente de governança interna da PrimeOsHub.
Sua função é monitorar, analisar e reportar o estado do sistema para os administradores.

RESPONSABILIDADES:
1. Monitorar saúde de todos os serviços e módulos
2. Detectar anomalias em dados, performance e segurança
3. Verificar conformidade com LGPD e políticas internas
4. Gerar relatórios executivos de governança
5. Alertar administradores sobre problemas críticos
6. Auditar ações de agentes IA (Clara, OpenClaw plugins)

FORMATO DE RESPOSTA:
- Sempre estruture análises em: RESUMO → PROBLEMAS → RECOMENDAÇÕES → AÇÕES IMEDIATAS
- Use escala de severidade: CRÍTICO | ALTO | MÉDIO | BAIXO | INFO
- Seja precisa e técnica — você fala com administradores de sistema

RESTRIÇÕES (NemoClaw policy):
- Nunca modifique dados de produção diretamente
- Apenas leia, analise e recomende — ações destrutivas requerem confirmação humana
- Todo acesso a dados sensíveis deve ser logado no audit_log
`.trim()

// ── Governance checks ──────────────────────────────────────────────────────
interface GovernanceCheck {
  name:     string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
  query?:   string
  fn?:      (db: Pool, ctx: GovernanceContext) => Promise<CheckResult>
}

interface CheckResult {
  passed:   boolean
  message:  string
  data?:    unknown
  action?:  string
}

interface GovernanceContext {
  intervalMs: number
  runId:      string
  startedAt:  string
}

const GOVERNANCE_CHECKS: GovernanceCheck[] = [
  {
    name: 'inactive_orgs_check',
    severity: 'LOW',
    fn: async (db) => {
      const { rows } = await db.query(`
        SELECT COUNT(*) AS cnt FROM primeos.organizations
        WHERE updated_at < NOW() - INTERVAL '30 days'
      `)
      const cnt = Number(rows[0].cnt)
      return {
        passed:  cnt === 0,
        message: cnt > 0 ? `${cnt} organização(ões) inativa(s) há +30 dias` : 'Todas as orgs ativas',
        data:    { inactive_count: cnt },
        action:  cnt > 0 ? 'Revisar e potencialmente arquivar orgs inativas' : undefined,
      }
    }
  },
  {
    name: 'audit_log_gaps',
    severity: 'HIGH',
    fn: async (db) => {
      const { rows } = await db.query(`
        SELECT table_name, COUNT(*) AS actions
        FROM primeos.audit_log
        WHERE created_at > NOW() - INTERVAL '24 hours'
        GROUP BY table_name
        ORDER BY actions DESC
      `)
      const hasSuspicious = rows.some(r => Number(r.actions) > 10000)
      return {
        passed:  !hasSuspicious,
        message: hasSuspicious
          ? 'Volume anômalo detectado no audit_log (>10k ações/tabela/24h)'
          : `Audit log normal: ${rows.length} tabelas com atividade`,
        data:    rows,
        action:  hasSuspicious ? 'Investigar possível abuso de API ou loop de sistema' : undefined,
      }
    }
  },
  {
    name: 'revenue_data_integrity',
    severity: 'CRITICAL',
    fn: async (db) => {
      const { rows } = await db.query(`
        SELECT COUNT(*) AS cnt FROM primeos.bmc_revenue_streams
        WHERE mrr < 0 OR amount < 0
      `)
      const cnt = Number(rows[0].cnt)
      return {
        passed:  cnt === 0,
        message: cnt > 0
          ? `ALERTA: ${cnt} registro(s) de receita com valor negativo detectado`
          : 'Integridade de dados de receita: OK',
        data:    { negative_revenue_count: cnt },
        action:  cnt > 0 ? 'Auditoria imediata dos registros de receita corrompidos' : undefined,
      }
    }
  },
  {
    name: 'lgpd_compliance_check',
    severity: 'CRITICAL',
    fn: async (db) => {
      // Check for PII data in fields that shouldn't have it
      const { rows } = await db.query(`
        SELECT COUNT(*) AS cnt FROM primeos.audit_log
        WHERE new_data::text LIKE '%cpf%'
           OR new_data::text LIKE '%senha%'
           OR new_data::text LIKE '%password%'
        AND created_at > NOW() - INTERVAL '7 days'
      `)
      const cnt = Number(rows[0].cnt)
      return {
        passed:  cnt === 0,
        message: cnt > 0
          ? `LGPD RISCO: Possível PII detectada em campos não criptografados (${cnt} registros)`
          : 'LGPD: Nenhuma PII detectada em campos não protegidos',
        data:    { pii_risk_count: cnt },
        action:  cnt > 0 ? 'Revisão urgente de conformidade LGPD — notificar DPO' : undefined,
      }
    }
  },
  {
    name: 'soft_delete_orphans',
    severity: 'MEDIUM',
    fn: async (db) => {
      const { rows } = await db.query(`
        SELECT COUNT(*) AS cnt FROM primeos.bmc_key_activities
        WHERE deleted_at IS NOT NULL
          AND deleted_at < NOW() - INTERVAL '90 days'
      `)
      const cnt = Number(rows[0].cnt)
      return {
        passed:  cnt < 100,
        message: `${cnt} registros soft-deleted há +90 dias (candidates para hard delete)`,
        data:    { old_soft_deleted: cnt },
        action:  cnt >= 100 ? 'Executar job de purga de dados antigos' : undefined,
      }
    }
  },
  {
    name: 'agent_activity_audit',
    severity: 'HIGH',
    fn: async (db) => {
      const { rows } = await db.query(`
        SELECT actor_id, COUNT(*) AS actions, MAX(created_at) AS last_action
        FROM primeos.audit_log
        WHERE actor_id IN (
          SELECT id::text FROM primeos.organizations WHERE name LIKE '%agent%'
        )
        AND created_at > NOW() - INTERVAL '1 hour'
        GROUP BY actor_id
      `)
      const highActivity = rows.filter(r => Number(r.actions) > 500)
      return {
        passed:  highActivity.length === 0,
        message: highActivity.length > 0
          ? `Agente com atividade anômala detectado: ${highActivity.length} agente(s) com >500 ações/hora`
          : `Atividade de agentes IA normal (${rows.length} agentes ativos)`,
        data:    rows,
        action:  highActivity.length > 0 ? 'Verificar Clara/OpenClaw — possível loop de agente' : undefined,
      }
    }
  },
]

// ── Luzia governance engine ────────────────────────────────────────────────
export class LuziaAgent {
  private anthropic: Anthropic
  private db:        Pool
  private redis:     RedisClientType
  private nemoclaw:  NemoclawClient
  private alerts:    AlertManager

  constructor() {
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    this.db        = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 })
    this.redis     = createClient({ url: process.env.REDIS_URL }) as RedisClientType
    this.nemoclaw  = new NemoclawClient(process.env.NEMOCLAW_URL!)
    this.alerts    = new AlertManager(process.env.LUZIA_ALERT_WEBHOOK!)
  }

  async init(): Promise<void> {
    await this.redis.connect()
    await this.nemoclaw.connect()
    logger.info('Luzia governance agent initialized')
    this.startGovernanceLoop()
  }

  // ── Continuous governance loop ────────────────────────────────────────────
  private startGovernanceLoop(): void {
    const intervalMs = Number(process.env.GOVERNANCE_INTERVAL_MS ?? 60_000)

    const run = async () => {
      try {
        await this.runGovernanceCycle()
      } catch (err) {
        logger.error({ err }, 'Luzia: governance cycle error')
      }
    }

    run() // immediate first run
    setInterval(run, intervalMs)
    logger.info({ intervalMs }, 'Luzia: governance loop started')
  }

  // ── Single governance cycle ───────────────────────────────────────────────
  async runGovernanceCycle(): Promise<GovernanceReport> {
    const runId     = crypto.randomUUID()
    const startedAt = new Date().toISOString()
    const ctx: GovernanceContext = { intervalMs: Number(process.env.GOVERNANCE_INTERVAL_MS ?? 60000), runId, startedAt }

    logger.info({ runId }, 'Luzia: starting governance cycle')

    // Run all checks in parallel
    const results = await Promise.allSettled(
      GOVERNANCE_CHECKS.map(async (check) => {
        const result = check.fn
          ? await check.fn(this.db, ctx)
          : { passed: true, message: 'No check function defined' }
        return { check: check.name, severity: check.severity, ...result }
      })
    )

    const violations: PolicyViolation[] = []
    const passed: string[] = []

    for (const r of results) {
      if (r.status === 'rejected') {
        logger.error({ error: r.reason }, 'Luzia: check failed')
        continue
      }
      if (!r.value.passed) {
        violations.push({
          check:    r.value.check,
          severity: r.value.severity,
          message:  r.value.message,
          action:   r.value.action,
          data:     r.value.data,
        })
      } else {
        passed.push(r.value.check)
      }
    }

    // Alert on critical/high violations
    const critical = violations.filter(v => v.severity === 'CRITICAL')
    const high     = violations.filter(v => v.severity === 'HIGH')

    if (critical.length > 0 || high.length > 0) {
      const aiAnalysis = await this.analyzeViolationsWithAI(violations)
      await this.alerts.sendAlert({
        runId,
        severity:   critical.length > 0 ? 'CRITICAL' : 'HIGH',
        violations,
        aiAnalysis,
        timestamp:  new Date().toISOString(),
      })
    }

    // Get system health metrics
    const metrics = await this.collectHealthMetrics()

    const report: GovernanceReport = {
      runId,
      startedAt,
      completedAt:      new Date().toISOString(),
      totalChecks:      GOVERNANCE_CHECKS.length,
      passedChecks:     passed.length,
      violations,
      healthMetrics:    metrics,
    }

    // Store report in Redis (keep last 100)
    await this.redis.lPush('luzia:reports', JSON.stringify(report))
    await this.redis.lTrim('luzia:reports', 0, 99)

    logger.info({ runId, violations: violations.length, passed: passed.length }, 'Luzia: cycle complete')
    return report
  }

  // ── AI-powered violation analysis ─────────────────────────────────────────
  private async analyzeViolationsWithAI(violations: PolicyViolation[]): Promise<string> {
    const response = await this.anthropic.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 512,
      system:     LUZIA_SYSTEM,
      messages: [{
        role: 'user',
        content: `Analise estas violações detectadas no sistema PrimeOsHub e forneça um relatório executivo conciso:

${JSON.stringify(violations, null, 2)}

Formato: RESUMO (1 parágrafo) → AÇÕES IMEDIATAS (lista) → RISCO GERAL (CRÍTICO/ALTO/MÉDIO/BAIXO)`
      }],
    })

    return (response.content[0] as Anthropic.TextBlock).text
  }

  // ── Health metrics collection ─────────────────────────────────────────────
  private async collectHealthMetrics(): Promise<HealthMetrics> {
    const [orgCount, activeUsers, totalMRR, auditEvents] = await Promise.all([
      this.db.query(`SELECT COUNT(*) FROM primeos.organizations`),
      this.db.query(`SELECT COUNT(*) FROM primeos.audit_log WHERE created_at > NOW() - INTERVAL '24 hours'`),
      this.db.query(`SELECT COALESCE(SUM(mrr),0) AS total FROM primeos.bmc_revenue_streams WHERE deleted_at IS NULL`),
      this.db.query(`SELECT COUNT(*) FROM primeos.audit_log WHERE created_at > NOW() - INTERVAL '1 hour'`),
    ])

    return {
      totalOrgs:       Number(orgCount.rows[0].count),
      activeEvents24h: Number(activeUsers.rows[0].count),
      totalMRR:        Number(totalMRR.rows[0].total),
      auditEvents1h:   Number(auditEvents.rows[0].count),
      collectedAt:     new Date().toISOString(),
    }
  }
}
