/**
 * Clara — OpenClaw Tool Registry
 * All skills/tools available to Clara during her agentic loop
 */

import Anthropic from '@anthropic-ai/sdk'
import type { PrimeOSClient } from './primeos-client'
import type { ConversationContext } from './types'

export class ToolRegistry {
  constructor(private primeos: PrimeOSClient) {}

  getToolDefinitions(): Anthropic.Tool[] {
    return [
      {
        name: 'get_org_info',
        description: 'Busca informações da organização do cliente pelo telefone ou org_id. Use quando precisar identificar o cliente.',
        input_schema: {
          type: 'object' as const,
          properties: {
            phone:  { type: 'string', description: 'Número de telefone WhatsApp' },
            org_id: { type: 'string', description: 'UUID da organização (se já conhecido)' },
          },
        },
      },
      {
        name: 'capture_lead',
        description: 'Captura um novo lead/prospecto interessado na PrimeOsHub. Use quando o cliente demonstrar interesse e fornecer dados de contato.',
        input_schema: {
          type: 'object' as const,
          properties: {
            name:    { type: 'string', description: 'Nome do prospecto' },
            email:   { type: 'string', description: 'Email do prospecto' },
            company: { type: 'string', description: 'Nome da empresa' },
            segment: {
              type: 'string',
              enum: ['RETAIL','SERVICES','HOSPITALITY','HEALTH','EDUCATION',
                     'CONSTRUCTION','TECH','LOGISTICS','AGRICULTURE','MANUFACTURING','FINANCIAL'],
              description: 'Segmento de mercado da empresa'
            },
            interest: { type: 'string', description: 'Módulos ou funcionalidades de interesse' },
          },
          required: ['name', 'segment'],
        },
      },
      {
        name: 'schedule_demo',
        description: 'Agenda uma demonstração do PrimeOsHub para o cliente.',
        input_schema: {
          type: 'object' as const,
          properties: {
            org_id:       { type: 'string' },
            contact_name: { type: 'string' },
            contact_email:{ type: 'string' },
            preferred_date: { type: 'string', description: 'Data preferida (YYYY-MM-DD)' },
            preferred_time: { type: 'string', description: 'Horário preferido (HH:MM)' },
            segment:      { type: 'string' },
            modules:      { type: 'array', items: { type: 'string' }, description: 'Módulos de interesse' },
          },
          required: ['contact_name', 'contact_email', 'preferred_date'],
        },
      },
      {
        name: 'get_module_status',
        description: 'Verifica o status e métricas de um módulo específico da organização.',
        input_schema: {
          type: 'object' as const,
          properties: {
            org_id:      { type: 'string', description: 'UUID da organização' },
            module_name: {
              type: 'string',
              enum: ['finances','marketing','sales','operations','bmc'],
              description: 'Nome do módulo'
            },
          },
          required: ['org_id', 'module_name'],
        },
      },
      {
        name: 'get_bmc_summary',
        description: 'Retorna um resumo do Business Model Canvas da organização.',
        input_schema: {
          type: 'object' as const,
          properties: {
            org_id: { type: 'string', description: 'UUID da organização' },
          },
          required: ['org_id'],
        },
      },
      {
        name: 'create_support_ticket',
        description: 'Cria um ticket de suporte para o cliente quando há um problema técnico.',
        input_schema: {
          type: 'object' as const,
          properties: {
            org_id:      { type: 'string' },
            title:       { type: 'string', description: 'Título resumido do problema' },
            description: { type: 'string', description: 'Descrição detalhada do problema' },
            priority:    { type: 'string', enum: ['low','medium','high','critical'], default: 'medium' },
            module:      { type: 'string', description: 'Módulo afetado' },
          },
          required: ['org_id', 'title', 'description'],
        },
      },
      {
        name: 'escalate_to_human',
        description: 'Escala a conversa para um atendente humano. Use quando o cliente estiver muito insatisfeito ou quando o problema for muito complexo.',
        input_schema: {
          type: 'object' as const,
          properties: {
            org_id: { type: 'string' },
            reason: { type: 'string', description: 'Motivo da escalação' },
            urgency:{ type: 'string', enum: ['normal','urgent'], default: 'normal' },
          },
          required: ['reason'],
        },
      },
      {
        name: 'get_pricing_info',
        description: 'Retorna informações de preços e planos da PrimeOsHub para o segmento do cliente.',
        input_schema: {
          type: 'object' as const,
          properties: {
            segment: { type: 'string', description: 'Segmento de mercado do cliente' },
            modules: { type: 'array', items: { type: 'string' }, description: 'Módulos de interesse' },
          },
        },
      },
    ]
  }

  async execute(
    toolName: string,
    input: Record<string, unknown>,
    ctx: ConversationContext
  ): Promise<Record<string, unknown>> {
    switch (toolName) {
      case 'get_org_info':
        return this.getOrgInfo(input, ctx)
      case 'capture_lead':
        return this.captureLead(input, ctx)
      case 'schedule_demo':
        return this.scheduleDemo(input)
      case 'get_module_status':
        return this.getModuleStatus(input)
      case 'get_bmc_summary':
        return this.getBMCSummary(input)
      case 'create_support_ticket':
        return this.createSupportTicket(input)
      case 'escalate_to_human':
        return this.escalateToHuman(input, ctx)
      case 'get_pricing_info':
        return this.getPricingInfo(input)
      default:
        return { error: `Tool ${toolName} not found` }
    }
  }

  private async getOrgInfo(input: Record<string, unknown>, ctx: ConversationContext) {
    try {
      const org = await this.primeos.getOrgByPhone(
        (input.phone as string) ?? ctx.phone
      )
      if (org) {
        ctx.orgId = org.id
        ctx.orgName = org.name
        ctx.marketVertical = org.market_vertical
      }
      return org ?? { found: false, message: 'Organização não encontrada' }
    } catch {
      return { found: false, message: 'Erro ao buscar organização' }
    }
  }

  private async captureLead(input: Record<string, unknown>, ctx: ConversationContext) {
    try {
      const lead = await this.primeos.createLead({
        orgId:    ctx.orgId ?? 'prospect',
        phone:    ctx.phone,
        name:     input.name as string,
        email:    input.email as string,
        company:  input.company as string,
        segment:  input.segment as string,
        interest: input.interest as string,
        source:   'whatsapp-clara',
      })
      return { success: true, lead, message: 'Lead capturado com sucesso' }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  }

  private async scheduleDemo(input: Record<string, unknown>) {
    try {
      const demo = await this.primeos.scheduleDemo({
        contactName:  input.contact_name as string,
        contactEmail: input.contact_email as string,
        date:         input.preferred_date as string,
        time:         input.preferred_time as string,
        segment:      input.segment as string,
        modules:      input.modules as string[],
      })
      return { success: true, demo,
        message: `Demo agendada para ${input.preferred_date} às ${input.preferred_time}` }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  }

  private async getModuleStatus(input: Record<string, unknown>) {
    return this.primeos.getModuleStatus(
      input.org_id as string,
      input.module_name as string
    )
  }

  private async getBMCSummary(input: Record<string, unknown>) {
    return this.primeos.getBMCSummary(input.org_id as string)
  }

  private async createSupportTicket(input: Record<string, unknown>) {
    return this.primeos.createTicket({
      orgId:       input.org_id as string,
      title:       input.title as string,
      description: input.description as string,
      priority:    (input.priority as string) ?? 'medium',
      module:      input.module as string,
      source:      'clara-whatsapp',
    })
  }

  private async escalateToHuman(input: Record<string, unknown>, ctx: ConversationContext) {
    await this.primeos.createEscalation({
      orgId:   ctx.orgId ?? 'unknown',
      phone:   ctx.phone,
      reason:  input.reason as string,
      urgency: (input.urgency as string) ?? 'normal',
      history: ctx.history,
    })
    return {
      success: true,
      message: 'Escalado para equipe humana',
      eta: input.urgency === 'urgent' ? '15 minutos' : '2 horas',
    }
  }

  private async getPricingInfo(input: Record<string, unknown>) {
    return {
      segment: input.segment,
      plans: [
        { name: 'Basic',        price: 'R$ 197/mês', highlights: ['4 módulos', '5 usuários', 'Suporte email'] },
        { name: 'Professional', price: 'R$ 497/mês', highlights: ['Clara incluída', 'Luzia incluída', '25 usuários', 'Integrações'] },
        { name: 'Enterprise',   price: 'R$ 1.497/mês', highlights: ['Usuários ilimitados', 'CSM dedicado', 'SLA 99.9%', 'ERP connector'] },
        { name: 'White-Label',  price: 'Sob consulta', highlights: ['Marca própria', 'Multi-tenant', 'Infra dedicada'] },
      ],
      demo_link: 'https://primeos.app/demo',
      contact:   'comercial@primeos.app',
    }
  }
}
