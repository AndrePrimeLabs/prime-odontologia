/**
 * Clara — PrimeOsHub WhatsApp Virtual Assistant
 * Built on OpenClaw framework, secured by NemoClaw sandbox
 * github.com/enterprises/PrimeOsHub / clara-agent
 */

import Anthropic from '@anthropic-ai/sdk'
import { createClient, RedisClientType } from 'redis'
import pino from 'pino'
import { NemoclawClient }  from './nemoclaw'
import { PrimeOSClient }   from './primeos-client'
import { WhatsAppClient }  from './whatsapp'
import { ToolRegistry }    from './tools'
import type { WAMessage, ConversationContext, AgentResponse } from './types'

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' })

// ── Clara system prompt ────────────────────────────────────────────────────
const CLARA_SYSTEM = `
Você é Clara, a assistente virtual inteligente da PrimeOsHub — a plataforma digital empresarial
que serve todos os 11 segmentos de mercado: Varejo, Serviços, Hotelaria, Saúde, Educação,
Construção, Tecnologia, Logística, Agronegócio, Manufatura e Serviços Financeiros.

PERSONALIDADE:
- Profissional, calorosa e eficiente
- Responde sempre em português brasileiro, a menos que o cliente escreva em inglês ou espanhol
- Respostas concisas e claras — máximo 3 parágrafos por mensagem
- Usa emojis com moderação (máximo 2 por mensagem)

CAPACIDADES:
- Captura de leads e onboarding de novos clientes
- Agendamento de demonstrações e reuniões
- Suporte de nível 1 para todos os módulos PrimeOsHub
- Consulta ao sistema interno via ferramentas (tools)
- Escalação para humano quando necessário

RESTRIÇÕES (aplicadas pelo NemoClaw):
- Nunca compartilhar dados de outros clientes
- Nunca realizar pagamentos ou operações financeiras irreversíveis sem confirmação
- Sempre coletar org_id antes de acessar dados do sistema
- Redirecionar para suporte humano se o cliente expressar frustração intensa

ORGANIZAÇÃO ATUAL: {{ORG_NAME}}
SEGMENTO: {{MARKET_VERTICAL}}
`.trim()

// ── Agent class ────────────────────────────────────────────────────────────
export class ClaraAgent {
  private anthropic:  Anthropic
  private redis:      RedisClientType
  private nemoclaw:   NemoclawClient
  private primeos:    PrimeOSClient
  private whatsapp:   WhatsAppClient
  private tools:      ToolRegistry

  constructor() {
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    this.redis     = createClient({ url: process.env.REDIS_URL }) as RedisClientType
    this.nemoclaw  = new NemoclawClient(process.env.NEMOCLAW_URL!)
    this.primeos   = new PrimeOSClient(process.env.PRIMEOS_API_URL!, process.env.PRIMEOS_API_KEY!)
    this.whatsapp  = new WhatsAppClient(process.env.WHATSAPP_TOKEN!, process.env.WHATSAPP_PHONE_ID!)
    this.tools     = new ToolRegistry(this.primeos)
  }

  async init(): Promise<void> {
    await this.redis.connect()
    await this.nemoclaw.connect()
    logger.info('Clara agent initialized')
  }

  // ── Main message handler ──────────────────────────────────────────────────
  async handleMessage(msg: WAMessage): Promise<void> {
    const { from, text, messageId } = msg

    logger.info({ from, messageId }, 'Clara: incoming message')

    // Load conversation context from Redis (7-day TTL)
    const ctx = await this.loadContext(from)

    // Build message history for Claude
    const messages: Anthropic.MessageParam[] = [
      ...ctx.history,
      { role: 'user', content: text }
    ]

    // Build system prompt with org context
    const system = CLARA_SYSTEM
      .replace('{{ORG_NAME}}', ctx.orgName ?? 'Não identificada')
      .replace('{{MARKET_VERTICAL}}', ctx.marketVertical ?? 'Geral')

    try {
      // Run through NemoClaw security check before calling AI
      await this.nemoclaw.validateRequest({
        agentId:  'clara',
        orgId:    ctx.orgId,
        input:    text,
        policy:   'clara-whatsapp-policy',
      })

      // Agentic loop with tool use
      const response = await this.runAgenticLoop(system, messages, ctx)

      // Save updated context
      ctx.history.push({ role: 'user', content: text })
      ctx.history.push({ role: 'assistant', content: response.text })
      if (ctx.history.length > 40) ctx.history = ctx.history.slice(-40) // keep last 20 turns
      await this.saveContext(from, ctx)

      // Send reply via WhatsApp
      await this.whatsapp.sendMessage(from, response.text)

      // If Clara captured a lead, sync to PrimeOS CRM
      if (response.capturedLead) {
        await this.primeos.createLead({
          orgId:   ctx.orgId!,
          phone:   from,
          name:    response.capturedLead.name,
          email:   response.capturedLead.email,
          segment: response.capturedLead.segment,
          source:  'whatsapp-clara',
        })
      }

    } catch (err: any) {
      if (err.code === 'NEMOCLAW_POLICY_VIOLATION') {
        logger.warn({ from, err: err.message }, 'NemoClaw blocked request')
        await this.whatsapp.sendMessage(from,
          'Desculpe, não consigo processar essa solicitação. ' +
          'Por favor, entre em contato com nosso suporte humano. 🙏')
        return
      }
      logger.error({ err, from }, 'Clara: error handling message')
      await this.whatsapp.sendMessage(from,
        'Tive um problema técnico momentâneo. Já estou notificando a equipe. ' +
        'Por favor, tente novamente em alguns instantes.')
    }
  }

  // ── Agentic loop (tool use) ───────────────────────────────────────────────
  private async runAgenticLoop(
    system: string,
    messages: Anthropic.MessageParam[],
    ctx: ConversationContext,
    maxIterations = 5
  ): Promise<AgentResponse> {
    let capturedLead = null

    for (let i = 0; i < maxIterations; i++) {
      const response = await this.anthropic.messages.create({
        model:      'claude-sonnet-4-6',
        max_tokens: 1024,
        system,
        messages,
        tools:      this.tools.getToolDefinitions(),
      })

      // Pure text response — done
      if (response.stop_reason === 'end_turn') {
        const text = response.content
          .filter(b => b.type === 'text')
          .map(b => (b as Anthropic.TextBlock).text)
          .join('')
        return { text, capturedLead }
      }

      // Tool use — execute tools and continue loop
      if (response.stop_reason === 'tool_use') {
        messages.push({ role: 'assistant', content: response.content })

        const toolResults: Anthropic.ToolResultBlockParam[] = []

        for (const block of response.content) {
          if (block.type !== 'tool_use') continue

          logger.info({ tool: block.name, orgId: ctx.orgId }, 'Clara: executing tool')

          // NemoClaw validates every tool call
          await this.nemoclaw.validateToolCall({
            agentId: 'clara',
            orgId:   ctx.orgId,
            tool:    block.name,
            input:   block.input as Record<string, unknown>,
          })

          const result = await this.tools.execute(block.name, block.input as Record<string, unknown>, ctx)

          // Check if lead was captured
          if (block.name === 'capture_lead' && result.success) {
            capturedLead = result.lead
          }

          toolResults.push({
            type:        'tool_result',
            tool_use_id: block.id,
            content:     JSON.stringify(result),
          })
        }

        messages.push({ role: 'user', content: toolResults })
        continue
      }

      break
    }

    return { text: 'Entendido! Como mais posso ajudar? 😊', capturedLead }
  }

  // ── Context management ────────────────────────────────────────────────────
  private async loadContext(phone: string): Promise<ConversationContext> {
    const key  = `clara:ctx:${phone}`
    const raw  = await this.redis.get(key)
    if (raw) return JSON.parse(raw)
    return { phone, history: [], orgId: null, orgName: null, marketVertical: null }
  }

  private async saveContext(phone: string, ctx: ConversationContext): Promise<void> {
    const key = `clara:ctx:${phone}`
    await this.redis.setEx(key, 60 * 60 * 24 * 7, JSON.stringify(ctx)) // 7-day TTL
  }
}
