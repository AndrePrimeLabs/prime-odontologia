// @ts-nocheck
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Database, ChevronDown, ChevronUp, Download, Loader2 } from "lucide-react";
import { primeos } from "@/api/primeosClient";
import { cn } from "@/lib/utils";

const ALL_ENTITIES = [
  // ── CLÍNICA & PACIENTES ──
  {
    group: "Clínica & Pacientes",
    color: "blue",
    entities: [
      {
        name: "PatientRecord",
        desc: "Prontuário completo do paciente: dados pessoais, histórico médico, alergias, medicamentos, exames, prescrições, check-ups e documentos.",
        fields: [
          { name: "patient_name", type: "string", required: true },
          { name: "patient_id / cpf / rg", type: "string" },
          { name: "patient_phone / email", type: "string" },
          { name: "date_of_birth", type: "date" },
          { name: "gender / marital_status / occupation", type: "enum/string" },
          { name: "address", type: "object" },
          { name: "blood_type", type: "enum" },
          { name: "allergies", type: "array<object>" },
          { name: "current_medications", type: "array<object>" },
          { name: "medical_conditions", type: "array<string>" },
          { name: "past_treatments", type: "array<object>" },
          { name: "x_rays / documents", type: "array<object>" },
          { name: "prescriptions", type: "array<object>" },
          { name: "checkup_schedule", type: "array<object>" },
          { name: "emergency_contact", type: "object" },
          { name: "insurance_info", type: "object" },
          { name: "consents", type: "array<object>" },
          { name: "status", type: "enum: ativo/inativo/arquivado" },
        ]
      },
      {
        name: "Appointment",
        desc: "Agendamentos de consultas: paciente, serviço, data/hora, dentista, recurso, status, pagamento e sincronização com EHR.",
        fields: [
          { name: "patient_name", type: "string", required: true },
          { name: "patient_id / patient_phone", type: "string" },
          { name: "service_type", type: "enum: consultation/follow_up/procedure/checkup/emergency/therapy/diagnostic" },
          { name: "date / time / duration_minutes", type: "date/string/number" },
          { name: "status", type: "enum: scheduled/confirmed/in_progress/completed/cancelled/no_show" },
          { name: "provider / dentist_id", type: "string" },
          { name: "resource_id / resource_name", type: "string" },
          { name: "reminder_sent / reminder_confirmed", type: "boolean/enum" },
          { name: "price / payment_status / payment_method / payment_date", type: "number/enum" },
          { name: "invoice_number", type: "string" },
          { name: "ehr_synced / ehr_id / ehr_system", type: "boolean/string" },
          { name: "follow_up_required / follow_up_days / follow_up_notes", type: "boolean/number/string" },
        ]
      },
      {
        name: "ClinicalNote",
        desc: "Notas clínicas ligadas a consultas/pacientes.",
        fields: [
          { name: "patient_id / appointment_id", type: "string" },
          { name: "content / title", type: "string" },
          { name: "date", type: "date" },
          { name: "author", type: "string" },
        ]
      },
      {
        name: "Dentist",
        desc: "Cadastro dos dentistas: especialidades, disponibilidade e configurações de agenda.",
        fields: [
          { name: "name / email / phone", type: "string" },
          { name: "specialty", type: "string" },
          { name: "color / active", type: "string/boolean" },
        ]
      },
      {
        name: "Resource",
        desc: "Recursos físicos (cadeiras, salas) disponíveis para agendamento.",
        fields: [
          { name: "name / type / color / active", type: "string/boolean" },
        ]
      },
      {
        name: "DentistBlockout",
        desc: "Bloqueios de agenda de dentistas (folgas, reuniões etc.).",
        fields: [
          { name: "dentist_id / start / end", type: "string/datetime" },
          { name: "reason", type: "string" },
        ]
      },
    ]
  },

  // ── CRM & CLIENTES ──
  {
    group: "CRM & Clientes",
    color: "purple",
    entities: [
      {
        name: "Customer",
        desc: "Base de clientes/pacientes: perfil, segmento, fonte, LTV, tags e campos customizados.",
        fields: [
          { name: "name", type: "string", required: true },
          { name: "email / phone / company", type: "string" },
          { name: "segment", type: "enum: enterprise/small_business/individual/partner" },
          { name: "status", type: "enum: lead/prospect/active/inactive/churned" },
          { name: "value_tier", type: "enum: high/medium/low" },
          { name: "source", type: "enum: referral/website/social_media/whatsapp/google/cold_outreach/other" },
          { name: "lifetime_value / birth_date / profession", type: "number/date/string" },
          { name: "interests / city / state", type: "string" },
          { name: "tags", type: "array<string>" },
          { name: "custom_fields", type: "object" },
          { name: "last_contact_date", type: "date" },
        ]
      },
      {
        name: "Lead",
        desc: "Pipeline de leads com pontuação automática de IA, segmentação, workflows e rastreamento de conversão.",
        fields: [
          { name: "name / phone / email", type: "string", required: true },
          { name: "interesse", type: "enum: invisalign/ortodontia/limpeza/clareamento/implante/protese/estetica/checkup/outro" },
          { name: "status", type: "enum: novo/em_conversa/avaliacao/orcamento/fechado/perdido" },
          { name: "temperatura", type: "enum: frio/morno/quente" },
          { name: "canal_conversao / fonte_original", type: "enum" },
          { name: "valor_estimado / lead_score / ai_score", type: "number" },
          { name: "ai_classification / ai_conversion_probability", type: "string/number" },
          { name: "ai_analysis", type: "object: reasons/strengths/weaknesses/next_best_action" },
          { name: "workflow_ativo / workflow_etapa", type: "string/number" },
          { name: "ultima_interacao / total_interacoes", type: "datetime/number" },
          { name: "tags / segmento", type: "array/enum" },
          { name: "origem_canal_id / campanha_id", type: "string" },
        ]
      },
      {
        name: "Interaction",
        desc: "Registro de interações com clientes/leads (ligações, mensagens, e-mails etc.).",
        fields: [
          { name: "customer_id / lead_id", type: "string" },
          { name: "type / channel / content", type: "string/enum" },
          { name: "date / duration", type: "datetime/number" },
          { name: "outcome / next_action", type: "string" },
        ]
      },
      {
        name: "LeadInteraction",
        desc: "Histórico de interações específico por lead.",
        fields: [
          { name: "lead_id / type / notes / date", type: "string/datetime" },
        ]
      },
      {
        name: "CustomerSegment",
        desc: "Segmentos de clientes com critérios automáticos, ações sugeridas e estimativa de impacto de receita.",
        fields: [
          { name: "name / descricao / icon / cor / ativo", type: "string/boolean" },
          { name: "criterios", type: "object: min_appointments/min_total_spent/days_since_last_visit/tags/status/service_types/city" },
          { name: "actions", type: "array<object>: label/type/channels/priority/message_template" },
          { name: "estimated_revenue_impact / total_leads", type: "string/number" },
          { name: "ai_generated / ai_rationale", type: "boolean/string" },
        ]
      },
      {
        name: "ClientJourney",
        desc: "Etapas da jornada do cliente e touchpoints registrados.",
        fields: [
          { name: "customer_id / stage / touchpoints", type: "string/array" },
        ]
      },
      {
        name: "CRMAppointment",
        desc: "Agendamentos gerenciados pelo CRM (separado da agenda clínica).",
        fields: [
          { name: "customer_id / date / type / status / notes", type: "string/date/enum" },
        ]
      },
      {
        name: "CRMSyncSettings",
        desc: "Configurações de sincronização entre o CRM e sistemas externos.",
        fields: [
          { name: "provider / sync_fields / last_sync / is_active", type: "string/array/datetime/boolean" },
        ]
      },
    ]
  },

  // ── FINANCEIRO ──
  {
    group: "Financeiro",
    color: "green",
    entities: [
      {
        name: "FinancialTransaction",
        desc: "Transações financeiras: receitas e despesas com suporte a pagamentos parciais, boletos, Stripe e recorrência.",
        fields: [
          { name: "type", type: "enum: receita/despesa", required: true },
          { name: "category", type: "enum: consulta/procedimento/material/aluguel/salario/marketing/impostos/...", required: true },
          { name: "description / amount", type: "string/number", required: true },
          { name: "date / due_date / scheduled_payment_date", type: "date" },
          { name: "status", type: "enum: pago/pendente/vencido/cancelado/parcial" },
          { name: "payment_method", type: "enum: dinheiro/pix/cartao_credito/cartao_debito/boleto/transferencia/outro" },
          { name: "amount_paid / partial_payments", type: "number/array" },
          { name: "patient_name / patient_id / patient_email", type: "string" },
          { name: "supplier / invoice_number / invoice_url", type: "string" },
          { name: "boleto_id / boleto_url / boleto_barcode / boleto_status", type: "string/enum" },
          { name: "stripe_payment_link / stripe_session_id", type: "string" },
          { name: "is_recurring / recurrence_period / recurrence_day", type: "boolean/enum/number" },
          { name: "reminder_sent_at / reminder_count", type: "datetime/number" },
        ]
      },
      {
        name: "FinancialGoal",
        desc: "Metas financeiras com rastreamento automático por categoria de transação.",
        fields: [
          { name: "name / type / target_amount", type: "string/enum/number", required: true },
          { name: "current_amount / monthly_contribution", type: "number" },
          { name: "deadline / start_date", type: "date" },
          { name: "status", type: "enum: em_andamento/concluida/atrasada/cancelada" },
          { name: "auto_track_category / auto_track_type", type: "string/enum" },
          { name: "color", type: "string" },
        ]
      },
      {
        name: "Budget",
        desc: "Orçamentos mensais/trimestrais/anuais por categoria, com alertas de limite.",
        fields: [
          { name: "name / period / year / category / type / budgeted_amount", type: "string/enum/number", required: true },
          { name: "month / quarter", type: "number" },
          { name: "alert_threshold", type: "number (% padrão 80)" },
        ]
      },
      {
        name: "Expense",
        desc: "Despesas detalhadas (complementa FinancialTransaction para estrutura de custos).",
        fields: [
          { name: "category / amount / date / supplier / notes", type: "string/number/date" },
        ]
      },
      {
        name: "Asset",
        desc: "Ativos e equipamentos da clínica com depreciação.",
        fields: [
          { name: "name / category / purchase_date / value / depreciation_rate", type: "string/date/number" },
        ]
      },
    ]
  },

  // ── MARKETING & VENDAS ──
  {
    group: "Marketing & Vendas",
    color: "orange",
    entities: [
      {
        name: "Campaign",
        desc: "Campanhas de marketing com orçamento, metas e fluxos de WhatsApp.",
        fields: [
          { name: "name", type: "string", required: true },
          { name: "oferta", type: "enum: invisalign/ortodontia/limpeza/clareamento/implante/estetica/..." },
          { name: "status", type: "enum: planejamento/ativa/pausada/encerrada" },
          { name: "canal_principal_id / estrategia_id", type: "string" },
          { name: "orcamento / meta_leads / meta_conversao", type: "number" },
          { name: "data_inicio / data_fim", type: "date" },
          { name: "whatsapp_flow / landing_page", type: "string" },
        ]
      },
      {
        name: "MarketingStrategy",
        desc: "Estratégias de marketing com planos de ação e KPIs.",
        fields: [
          { name: "name / description / status / kpis / actions", type: "string/array" },
        ]
      },
      {
        name: "MarketingChannel",
        desc: "Canais de marketing (Instagram, Google Ads, WhatsApp etc.) com métricas.",
        fields: [
          { name: "name / type / status / budget / leads_generated / conversion_rate", type: "string/number" },
        ]
      },
      {
        name: "MarketingMetric",
        desc: "Métricas de performance de marketing por período.",
        fields: [
          { name: "channel_id / date / impressions / clicks / leads / cost / conversions", type: "string/date/number" },
        ]
      },
      {
        name: "Channel",
        desc: "Canais de atendimento (WhatsApp, Instagram, telefone etc.).",
        fields: [
          { name: "name / type / active / config", type: "string/boolean/object" },
        ]
      },
      {
        name: "Sale",
        desc: "Vendas realizadas com produtos, valores, canal, status de pagamento.",
        fields: [
          { name: "customer_name / total_amount", type: "string/number", required: true },
          { name: "customer_id / products", type: "string/array" },
          { name: "channel", type: "enum: whatsapp/direct/website/phone/in_person" },
          { name: "status", type: "enum: pending/confirmed/processing/shipped/delivered/cancelled/refunded" },
          { name: "payment_status", type: "enum: pending/partial/paid/refunded" },
          { name: "currency / notes / whatsapp_order_id", type: "string" },
        ]
      },
      {
        name: "Product",
        desc: "Catálogo de produtos e serviços oferecidos.",
        fields: [
          { name: "name / description / price / category / active", type: "string/number/boolean" },
        ]
      },
      {
        name: "SalesScript",
        desc: "Scripts de vendas por tratamento/objeção.",
        fields: [
          { name: "title / treatment / stage / script_content / objections", type: "string/array" },
        ]
      },
      {
        name: "ABTest",
        desc: "Testes A/B de campanhas e mensagens.",
        fields: [
          { name: "name / variant_a / variant_b / metric / status / results", type: "string/object" },
        ]
      },
      {
        name: "EmailSequence",
        desc: "Sequências de e-mail automatizadas.",
        fields: [
          { name: "name / trigger / steps / status / active", type: "string/array/boolean" },
        ]
      },
      {
        name: "CRMWorkflow",
        desc: "Workflows de CRM automatizados por gatilho.",
        fields: [
          { name: "name / trigger / steps / status / active", type: "string/array/boolean" },
        ]
      },
    ]
  },

  // ── OPERAÇÕES & PROCESSOS ──
  {
    group: "Operações & Processos",
    color: "indigo",
    entities: [
      {
        name: "Task",
        desc: "Tarefas operacionais com checklist, subtarefas, recorrência, progresso e vinculação com POPs.",
        fields: [
          { name: "titulo / data_vencimento", type: "string/datetime", required: true },
          { name: "descricao / observacoes", type: "string" },
          { name: "categoria", type: "enum: operacional/clinico/administrativo/marketing/qualidade/gestao" },
          { name: "prioridade", type: "enum: baixa/media/alta/critica" },
          { name: "status", type: "enum: pendente/em_andamento/concluida/atrasada/cancelada" },
          { name: "responsaveis", type: "array<string>" },
          { name: "progresso / data_conclusao", type: "number/datetime" },
          { name: "subtarefas / checklist", type: "array<object>" },
          { name: "pop_id / pop_codigo", type: "string" },
          { name: "recorrente / frequencia_recorrencia / proxima_ocorrencia", type: "boolean/enum/datetime" },
          { name: "template_id / tarefa_pai_id", type: "string" },
        ]
      },
      {
        name: "POP",
        desc: "Procedimentos Operacionais Padrão com checklist, indicadores, versionamento e arquivo PDF.",
        fields: [
          { name: "codigo / nome / responsavel / frequencia", type: "string/enum", required: true },
          { name: "objetivo / descricao", type: "string" },
          { name: "categoria", type: "enum: operacional/clinico/administrativo/marketing/qualidade/gestao" },
          { name: "checklist / pontos_atencao / indicadores", type: "array<string>" },
          { name: "status / versao", type: "enum/string" },
          { name: "arquivo_url / favorito / tags", type: "string/boolean/array" },
          { name: "historico_versoes", type: "array<object>" },
        ]
      },
      {
        name: "SOP",
        desc: "Standard Operating Procedures por área (Sales, CRM, Marketing, Operations...).",
        fields: [
          { name: "name / area", type: "string/enum", required: true },
          { name: "owner / goal / primary_offer / kpi_principal", type: "string" },
          { name: "status", type: "enum: Active/Draft/Archived" },
          { name: "content / last_update", type: "string/date" },
        ]
      },
      {
        name: "Activity",
        desc: "Registro de atividades internas e externas da equipe.",
        fields: [
          { name: "type / title / date / assigned_to / status / notes", type: "string/date/enum" },
        ]
      },
      {
        name: "AutomationWorkflow",
        desc: "Workflows de automação internos do sistema.",
        fields: [
          { name: "name / trigger / steps / status / last_run", type: "string/array/datetime" },
        ]
      },
      {
        name: "KnowledgeBase",
        desc: "Base de conhecimento interna com artigos e FAQs.",
        fields: [
          { name: "title / category / content / tags / status", type: "string/array/enum" },
        ]
      },
      {
        name: "Document",
        desc: "Documentos gerais armazenados no sistema.",
        fields: [
          { name: "name / type / file_url / category / notes", type: "string/enum" },
        ]
      },
      {
        name: "MedicalRecord",
        desc: "Prontuários médicos simplificados (separado do PatientRecord completo).",
        fields: [
          { name: "patient_id / appointment_id / notes / date", type: "string/date" },
        ]
      },
    ]
  },

  // ── ESTOQUE ──
  {
    group: "Estoque & Materiais",
    color: "yellow",
    entities: [
      {
        name: "InventoryItem",
        desc: "Itens de estoque da clínica: quantidade, ponto de reposição, fornecedor, custo e validade.",
        fields: [
          { name: "name / quantity_on_hand / reorder_point", type: "string/number", required: true },
          { name: "description / sku / unit", type: "string" },
          { name: "category", type: "enum: consumivel/instrumental/medicamento/protecao_epi/radiologia/laboratorio/limpeza/outros" },
          { name: "reorder_quantity / unit_cost", type: "number" },
          { name: "supplier / supplier_contact", type: "string" },
          { name: "last_restock_date / expiry_date", type: "date" },
          { name: "location / notes / is_active", type: "string/boolean" },
        ]
      },
    ]
  },

  // ── SUPORTE & ENGAJAMENTO ──
  {
    group: "Suporte & Engajamento",
    color: "pink",
    entities: [
      {
        name: "SupportTicket",
        desc: "Tickets de suporte ao cliente com prioridade, status e resolução.",
        fields: [
          { name: "customer_id / subject / description / status / priority / assigned_to / resolved_at", type: "string/enum/datetime" },
        ]
      },
      {
        name: "FollowUpRule",
        desc: "Regras de follow-up automático (lembrete de consulta, cobrança, pós-atendimento, paciente inativo).",
        fields: [
          { name: "name / trigger / message_template", type: "string", required: true },
          { name: "channel", type: "enum: email/whatsapp_link/both" },
          { name: "days_offset / is_active / last_run / total_sent", type: "number/boolean/datetime" },
          { name: "subject", type: "string" },
        ]
      },
      {
        name: "FollowUpLog",
        desc: "Histórico de envios de follow-up com status e erros.",
        fields: [
          { name: "rule_name / patient_name / trigger / status", type: "string/enum", required: true },
          { name: "channel / message_sent / error / reference_id", type: "string" },
          { name: "patient_email / patient_phone / rule_id", type: "string" },
        ]
      },
      {
        name: "FollowUp",
        desc: "Follow-ups individuais agendados por cliente.",
        fields: [
          { name: "customer_id / type / date / notes / status", type: "string/date/enum" },
        ]
      },
      {
        name: "ReminderSchedule",
        desc: "Agendamentos de lembretes com templates de e-mail e WhatsApp.",
        fields: [
          { name: "name / hours_before / channels", type: "string/number/array", required: true },
          { name: "is_active / applies_to_segments / applies_to_services", type: "boolean/array" },
          { name: "email_subject / email_body / whatsapp_message", type: "string" },
          { name: "last_run_at / total_sent", type: "datetime/number" },
        ]
      },
      {
        name: "UserEngagement",
        desc: "Métricas de engajamento por usuário/paciente.",
        fields: [
          { name: "user_id / event / date / metadata", type: "string/datetime/object" },
        ]
      },
      {
        name: "UserPoints",
        desc: "Sistema de gamificação — pontos por usuário.",
        fields: [
          { name: "user_id / points / source / date", type: "string/number/date" },
        ]
      },
      {
        name: "UserBadge",
        desc: "Badges/conquistas do sistema de gamificação.",
        fields: [
          { name: "user_id / badge_type / awarded_at / metadata", type: "string/datetime/object" },
        ]
      },
    ]
  },

  // ── PRIME OS ──
  {
    group: "Prime OS (SEO & Growth)",
    color: "violet",
    entities: [
      {
        name: "ProjetoSEO",
        desc: "Projetos de SEO para clientes: fases, planos, tráfego, KPIs e receita mensal.",
        fields: [
          { name: "projeto / cliente", type: "string", required: true },
          { name: "website / contato_principal / telefone / email_cliente", type: "string" },
          { name: "fase_atual", type: "enum: analise/planejamento/execucao/monitoramento/relatorio" },
          { name: "status_operacional", type: "enum: backlog/em_andamento/aguardando_cliente/finalizado" },
          { name: "plano_contratado", type: "enum: basico/intermediario/avancado" },
          { name: "receita_mensal / trafego_inicial / trafego_atual", type: "number" },
          { name: "data_inicio / previsao_entrega", type: "date" },
          { name: "responsavel / kpis_meta / estrategia / plano_execucao", type: "string" },
        ]
      },
      {
        name: "TarefaSEO",
        desc: "Tarefas operacionais de SEO vinculadas a projetos.",
        fields: [
          { name: "tarefa / projeto_id", type: "string", required: true },
          { name: "projeto_nome / responsavel / notas", type: "string" },
          { name: "tipo_atividade", type: "enum: auditoria_tecnica/pesquisa_palavrachave/producao_conteudo/link_building/otimizacao_onpage/relatorio" },
          { name: "prioridade", type: "enum: alta/media/baixa" },
          { name: "status", type: "enum: a_fazer/em_execucao/revisao/concluido" },
          { name: "prazo", type: "date" },
        ]
      },
      {
        name: "PalavraChave",
        desc: "Keywords monitoradas por projeto com volume, dificuldade, posição e meta.",
        fields: [
          { name: "keyword / projeto_id", type: "string", required: true },
          { name: "projeto_nome / pagina_relacionada", type: "string" },
          { name: "volume_busca / dificuldade / posicao_atual / meta_posicao", type: "number" },
          { name: "intencao", type: "enum: informacional/comercial/transacional" },
        ]
      },
      {
        name: "ConteudoSEO",
        desc: "Calendário editorial de conteúdo SEO: briefing → redação → revisão → publicado.",
        fields: [
          { name: "titulo / projeto_id", type: "string", required: true },
          { name: "keyword_principal / meta_descricao / url_final", type: "string" },
          { name: "tipo_conteudo", type: "enum: blog_post/pagina_pilar/landing_page" },
          { name: "status_editorial", type: "enum: briefing/redacao/revisao/publicado" },
          { name: "data_publicacao / responsavel / notas", type: "date/string" },
        ]
      },
      {
        name: "Backlink",
        desc: "Backlinks conquistados por projeto com autoridade de domínio e status.",
        fields: [
          { name: "dominio_origem / projeto_id", type: "string", required: true },
          { name: "projeto_nome / url_destino", type: "string" },
          { name: "autoridade_dominio", type: "number (DA 0-100)" },
          { name: "tipo_link", type: "enum: dofollow/nofollow" },
          { name: "status", type: "enum: ativo/inativo/perdido" },
          { name: "data_publicacao", type: "date" },
        ]
      },
      {
        name: "RelatorioSEO",
        desc: "Relatórios mensais de SEO por projeto com métricas de tráfego e backlinks.",
        fields: [
          { name: "titulo / projeto_id", type: "string", required: true },
          { name: "projeto_nome / data_relatorio", type: "string/date" },
          { name: "trafego_organico / palavras_primeira_pagina / novos_backlinks / crescimento_percentual", type: "number" },
          { name: "conclusoes / recomendacoes / arquivo_pdf", type: "string" },
        ]
      },
      {
        name: "PrimeGrowthStage",
        desc: "Estágios do framework Prime Growth (Stage 1→4): foco, objetivos e progresso de receita.",
        fields: [
          { name: "stage_name", type: "string", required: true },
          { name: "revenue_range / primary_focus / core_objective / notas", type: "string" },
          { name: "status", type: "enum: not_started/active/completed" },
          { name: "receita_atual / receita_meta", type: "number" },
          { name: "avaliacoes_agendadas / taxa_comparecimento / taxa_fechamento / leads_semana / custo_por_lead", type: "number" },
        ]
      },
      {
        name: "PrimeFunnelLead",
        desc: "Leads no funil Prime: da captação à consulta de avaliação e fechamento.",
        fields: [
          { name: "nome", type: "string", required: true },
          { name: "lead_source", type: "enum: instagram/whatsapp/google/indicacao/trafego_pago/outro" },
          { name: "status", type: "enum: lead/contato/avaliacao_marcada/compareceu/proposta_enviada/fechado/perdido" },
          { name: "ticket_estimado / procedimento / telefone / email", type: "number/string" },
          { name: "data_entrada / motivo_perda / notas", type: "date/string" },
        ]
      },
      {
        name: "PrimeDelegationTask",
        desc: "Tarefas de delegação com DPS Score (Delegation Priority Score) para priorização.",
        fields: [
          { name: "tarefa", type: "string", required: true },
          { name: "sistema", type: "enum: marketing/comercial/clinica/experiencia_paciente/financeiro/gestao" },
          { name: "atual_responsavel / responsavel_ideal / notas", type: "string" },
          { name: "frequencia", type: "enum: diaria/semanal/mensal/trimestral/ad_hoc" },
          { name: "frequency_score / annoyance_level / impact_on_business / simplicity_to_delegate", type: "number (1-5)" },
          { name: "dps_score", type: "number (soma dos 4 scores, max 20)" },
          { name: "documentado / delegado", type: "boolean" },
          { name: "tipo_documentacao / sop_link", type: "enum/string" },
          { name: "status", type: "enum: brain_dump/scored/assigned/documented/delegated/optimized" },
        ]
      },
    ]
  },

  // ── SISTEMA & RELATÓRIOS ──
  {
    group: "Sistema & Relatórios",
    color: "slate",
    entities: [
      {
        name: "MobileApp",
        desc: "Registro de apps mobile do sistema.",
        fields: [{ name: "name / platform / version / status", type: "string/enum" }]
      },
      {
        name: "AppVersion",
        desc: "Versões de apps com changelog.",
        fields: [{ name: "app_id / version / changelog / release_date", type: "string/date" }]
      },
      {
        name: "AppReview",
        desc: "Avaliações de app recebidas.",
        fields: [{ name: "app_id / rating / comment / user_id / date", type: "string/number/date" }]
      },
      {
        name: "AppAnalytics",
        desc: "Métricas de uso dos apps.",
        fields: [{ name: "app_id / event / date / user_id / metadata", type: "string/date/object" }]
      },
      {
        name: "ReportSchedule",
        desc: "Agendamento de relatórios automáticos.",
        fields: [{ name: "name / type / frequency / recipients / last_sent / next_send", type: "string/array/datetime" }]
      },
      {
        name: "CustomDashboard",
        desc: "Dashboards customizados por usuário.",
        fields: [{ name: "user_id / name / widgets / layout", type: "string/array/object" }]
      },
      {
        name: "KeyPartner",
        desc: "Parceiros-chave do Business Model Canvas.",
        fields: [{ name: "name / type / contribution / status", type: "string/enum" }]
      },
      {
        name: "ValueProposition",
        desc: "Proposta de valor do canvas de negócios.",
        fields: [{ name: "title / description / target_segment / benefits", type: "string/array" }]
      },
      {
        name: "BusinessStrategy",
        desc: "Estratégias de negócio documentadas.",
        fields: [{ name: "name / objective / actions / kpis / status", type: "string/array/enum" }]
      },
      {
        name: "Content",
        desc: "Conteúdos de marketing (posts, vídeos, artigos).",
        fields: [{ name: "title / type / platform / status / published_at / file_url", type: "string/enum/datetime" }]
      },
      {
        name: "MarketingMetric",
        desc: "Métricas de performance de marketing.",
        fields: [{ name: "channel / period / impressions / clicks / leads / cost / roas", type: "string/number" }]
      },
    ]
  },
];

const colorMap = {
  blue:   { bg: "bg-blue-100",   text: "text-blue-700",   border: "border-blue-200",   dot: "bg-blue-500" },
  purple: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200", dot: "bg-purple-500" },
  green:  { bg: "bg-green-100",  text: "text-green-700",  border: "border-green-200",  dot: "bg-green-500" },
  orange: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-500" },
  indigo: { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200", dot: "bg-indigo-500" },
  yellow: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200", dot: "bg-yellow-500" },
  pink:   { bg: "bg-pink-100",   text: "text-pink-700",   border: "border-pink-200",   dot: "bg-pink-500" },
  violet: { bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-200", dot: "bg-violet-500" },
  slate:  { bg: "bg-slate-100",  text: "text-slate-700",  border: "border-slate-200",  dot: "bg-slate-400" },
};

function EntityCard({ entity, color }) {
  const [open, setOpen] = useState(false);
  const c = colorMap[color] || colorMap.slate;

  return (
    <div className={cn("rounded-xl border bg-white shadow-sm overflow-hidden", open && c.border)}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", c.dot)} />
          <div>
            <p className="font-semibold text-slate-900 text-sm">{entity.name}</p>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{entity.desc}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          <Badge className={cn("text-xs border", c.bg, c.text, c.border)}>
            {entity.fields.length} campos
          </Badge>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-3">
          <p className="text-xs text-slate-600 mb-3">{entity.desc}</p>
          <div className="space-y-1">
            {entity.fields.map((f, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <code className={cn("font-mono font-medium px-1.5 py-0.5 rounded flex-shrink-0", c.bg, c.text)}>{f.name}</code>
                <span className="text-slate-400 flex-1">{f.type}</span>
                {f.required && <Badge className="text-xs bg-red-50 text-red-600 border border-red-200 flex-shrink-0">required</Badge>}
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3 italic">
            + campos automáticos: <code className="font-mono">id · created_date · updated_date · created_by</code>
          </p>
        </div>
      )}
    </div>
  );
}

export default function DatabaseMap() {
  const [search, setSearch] = useState("");
  const [expandAll, setExpandAll] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    const response = await primeos.functions.invoke('exportAllData');
    const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prime_backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
    setExporting(false);
  };

  const totalEntities = ALL_ENTITIES.reduce((s, g) => s + g.entities.length, 0);
  const totalFields = ALL_ENTITIES.reduce((s, g) => s + g.entities.reduce((ss, e) => ss + e.fields.length, 0), 0);

  const filtered = search.trim()
    ? ALL_ENTITIES.map(g => ({
        ...g,
        entities: g.entities.filter(e =>
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.desc.toLowerCase().includes(search.toLowerCase()) ||
          e.fields.some(f => f.name.toLowerCase().includes(search.toLowerCase()))
        )
      })).filter(g => g.entities.length > 0)
    : ALL_ENTITIES;

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Database Map</h1>
              <p className="text-sm text-slate-500">Mapeamento completo de todas as entidades do sistema</p>
            </div>
          </div>

          {/* Export button */}
          <div className="mt-3">
            <Button onClick={handleExport} disabled={exporting} className="bg-slate-800 hover:bg-slate-900">
              {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              {exporting ? "Exportando..." : "Exportar tudo (.json)"}
            </Button>
          </div>

          {/* Summary */}
          <div className="flex gap-4 mt-4 flex-wrap">
            {[
              { label: "Entidades", value: totalEntities },
              { label: "Grupos", value: ALL_ENTITIES.length },
              { label: "Campos totais", value: totalFields },
            ].map((s, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-center shadow-sm">
                <p className="text-xl font-bold text-indigo-600">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar entidade ou campo..."
              className="pl-9"
            />
          </div>
          <button
            onClick={() => setExpandAll(!expandAll)}
            className="text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-600 font-medium transition-colors"
          >
            {expandAll ? "Recolher" : "Expandir"} tudo
          </button>
        </div>

        {/* Groups */}
        <div className="space-y-8">
          {filtered.map(group => {
            const c = colorMap[group.color] || colorMap.slate;
            return (
              <div key={group.group}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={cn("text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border", c.bg, c.text, c.border)}>
                    {group.group}
                  </span>
                  <span className="text-xs text-slate-400">{group.entities.length} entidade{group.entities.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {group.entities.map(entity => (
                    <EntityCard key={entity.name} entity={entity} color={group.color} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <Database className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhuma entidade encontrada para "{search}"</p>
          </div>
        )}

        <p className="text-center text-xs text-slate-300 mt-12">
          Prime Odontologia · Sistema de Gestão · {totalEntities} entidades documentadas
        </p>
      </div>
    </div>
  );
}
