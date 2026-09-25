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

    // Fetch lead interactions
    const interactions = await primeos.asServiceRole.entities.LeadInteraction.filter({
      lead_id: leadId
    });

    const lastInteraction = interactions.sort((a, b) => 
      new Date(b.created_date) - new Date(a.created_date)
    )[0];

    // AI Follow-up Strategy
    const followUpPrompt = `Você é um especialista em estratégias de follow-up de vendas.
Analise este lead e forneça recomendações personalizadas de follow-up.

LEAD:
Nome: ${lead.name}
Status: ${lead.status}
Score de IA: ${lead.ai_score || 'Não calculado'}
Classificação: ${lead.ai_classification || 'N/A'}
Probabilidade de Conversão: ${lead.ai_conversion_probability || 0}%
Origem: ${lead.source}
Interesse: ${lead.interest || 'N/A'}

ÚLTIMA INTERAÇÃO:
${lastInteraction ? `
Tipo: ${lastInteraction.type}
Data: ${lastInteraction.created_date}
Notas: ${lastInteraction.notes}
Próxima Ação: ${lastInteraction.next_action || 'N/A'}
` : 'Nenhuma interação registrada'}

HISTÓRICO (${interactions.length} interações):
${interactions.slice(0, 3).map(i => `- ${i.type} em ${i.created_date}: ${i.notes.substring(0, 50)}...`).join('\n')}

ANÁLISE DE IA PRÉVIA:
${lead.ai_analysis ? `
Pontos Fortes: ${lead.ai_analysis.strengths?.join(', ')}
Pontos Fracos: ${lead.ai_analysis.weaknesses?.join(', ')}
Melhor Próxima Ação: ${lead.ai_analysis.next_best_action}
` : 'Não disponível'}

Forneça:
1. Melhor horário para follow-up (dia da semana e hora)
2. Canal recomendado (email, telefone, WhatsApp)
3. Abordagem sugerida (script/mensagem)
4. Momento ideal (quando fazer o contato)
5. Táticas específicas para este lead
6. Mensagens personalizadas (3 opções)`;

    const followUpStrategy = await primeos.integrations.Core.InvokeLLM({
      prompt: followUpPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          optimal_time: {
            type: "object",
            properties: {
              day_of_week: { type: "string" },
              time_range: { type: "string" },
              reasoning: { type: "string" }
            }
          },
          recommended_channel: { type: "string" },
          approach: { type: "string" },
          timing: { type: "string" },
          tactics: { type: "array", items: { type: "string" } },
          message_options: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                message: { type: "string" }
              }
            }
          },
          urgency: { type: "string" }
        }
      }
    });

    return Response.json({ 
      success: true, 
      strategy: followUpStrategy
    });

  } catch (error) {
    console.error('Follow-up Strategy Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
