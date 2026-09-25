import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const primeos = createClientFromRequest(req);
    const user = await primeos.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leadId } = await req.json();

    if (!leadId) {
      return Response.json({ error: 'Lead ID required' }, { status: 400 });
    }

    const lead = await primeos.asServiceRole.entities.Lead.get(leadId);
    
    if (!lead) {
      return Response.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Fetch all users (potential agents)
    const users = await primeos.asServiceRole.entities.User.list();
    
    // Fetch all leads to analyze agent performance
    const allLeads = await primeos.asServiceRole.entities.Lead.list();
    const allInteractions = await primeos.asServiceRole.entities.LeadInteraction.list();

    // Calculate agent performance
    const agentPerformance = users.map(agent => {
      const agentLeads = allLeads.filter(l => l.assigned_to === agent.email);
      const convertedLeads = agentLeads.filter(l => l.status === 'fechado');
      const totalValue = convertedLeads.reduce((sum, l) => sum + (l.valor_estimado || 0), 0);
      const avgResponseTime = agentLeads.reduce((sum, l) => sum + (l.tempo_medio_resposta || 0), 0) / (agentLeads.length || 1);
      const conversionRate = agentLeads.length > 0 ? (convertedLeads.length / agentLeads.length) * 100 : 0;
      
      // Get leads by interest for specialization
      const interestBreakdown = {};
      agentLeads.forEach(l => {
        interestBreakdown[l.interesse] = (interestBreakdown[l.interesse] || 0) + 1;
      });
      
      return {
        email: agent.email,
        name: agent.full_name,
        role: agent.role,
        total_leads: agentLeads.length,
        converted_leads: convertedLeads.length,
        conversion_rate: conversionRate,
        total_value: totalValue,
        avg_response_time: avgResponseTime,
        specializations: interestBreakdown
      };
    });

    // AI Lead Routing
    const routingPrompt = `Você é um especialista em otimização de vendas e distribuição de leads.
Analise este lead e recomende o melhor agente de vendas para maximizar a chance de conversão.

LEAD:
Nome: ${lead.name}
Score: ${lead.lead_score || 0}
Score IA: ${lead.ai_score || 'N/A'}
Segmento: ${lead.segmento}
Interesse: ${lead.interesse}
Canal: ${lead.canal_conversao}
Valor Estimado: R$ ${lead.valor_estimado || 0}
Status: ${lead.status}

AGENTES DISPONÍVEIS:
${agentPerformance.map(agent => `
Agente: ${agent.name} (${agent.email})
- Total de Leads: ${agent.total_leads}
- Taxa de Conversão: ${agent.conversion_rate.toFixed(1)}%
- Leads Convertidos: ${agent.converted_leads}
- Valor Total Gerado: R$ ${agent.total_value.toLocaleString()}
- Tempo Médio de Resposta: ${agent.avg_response_time.toFixed(0)} min
- Especializações: ${Object.entries(agent.specializations).map(([k, v]) => `${k} (${v})`).join(', ') || 'Nenhuma'}
`).join('\n---\n')}

CRITÉRIOS DE ANÁLISE:
1. Especialização do agente no interesse do lead
2. Taxa de conversão histórica
3. Disponibilidade (carga de trabalho atual)
4. Tempo de resposta médio
5. Experiência com valor similar
6. Performance com segmento similar

Forneça:
- Top 3 agentes recomendados com score de compatibilidade (0-100)
- Razões específicas para cada recomendação
- Ação imediata sugerida para o agente
- Estimativa de probabilidade de conversão com cada agente`;

    const routing = await primeos.integrations.Core.InvokeLLM({
      prompt: routingPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                agent_email: { type: "string" },
                agent_name: { type: "string" },
                compatibility_score: { type: "number" },
                reasons: { type: "array", items: { type: "string" } },
                immediate_action: { type: "string" },
                estimated_conversion_rate: { type: "number" }
              }
            }
          },
          overall_recommendation: { type: "string" }
        }
      }
    });

    return Response.json({ 
      success: true, 
      routing,
      agent_performance: agentPerformance
    });

  } catch (error) {
    console.error('Lead Routing Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
