import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const supabase = createClientFromRequest(req);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leadId } = await req.json();

    if (!leadId) {
      return Response.json({ error: 'Lead ID required' }, { status: 400 });
    }

    const { data: lead } = await supabase.from('leads').select('*').eq('id', leadId).single();
    
    if (!lead) {
      return Response.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Fetch interactions and context
    const { data: interactions } = await supabase.from('lead_interactions').select('*').eq('lead_id', leadId);

    const { data: allLeads } = await supabase.from('leads').select('*');
    const similarLeads = (allLeads || []).filter(l => 
      l.id !== leadId && 
      l.interesse === lead.interesse && 
      l.status === 'fechado'
    );

    // AI Next Best Action
    const actionPrompt = `Você é um especialista em automação de vendas e workflows de CRM.
Analise este lead e sugira as 3 melhores próximas ações baseadas em dados e padrões de sucesso.

LEAD ATUAL:
Nome: ${lead.name}
Status: ${lead.status}
Score: ${lead.lead_score || 0}
Score de IA: ${lead.ai_score || 'N/A'}
Classificação: ${lead.ai_classification || 'N/A'}
Probabilidade de Conversão: ${lead.ai_conversion_probability || 0}%
Segmento: ${lead.segmento}
Canal: ${lead.canal_conversao}
Interesse: ${lead.interesse}
Valor Estimado: R$ ${lead.valor_estimado || 0}
Última Interação: ${lead.ultima_interacao || 'Nunca'}
Total de Interações: ${lead.total_interacoes || 0}

HISTÓRICO DE INTERAÇÕES (${interactions.length} total):
${interactions.slice(0, 5).map(i => `- ${i.tipo}: ${i.conteudo || i.notes || ''} (${i.created_date})`).join('\n')}

PADRÕES DE SUCESSO (Leads similares que converteram: ${similarLeads.length}):
${similarLeads.slice(0, 3).map(l => `- Converteu com ${l.total_interacoes || 0} interações via ${l.canal_conversao}`).join('\n')}

ANÁLISE PRÉVIA DE IA:
${lead.ai_analysis ? `
Pontos Fortes: ${lead.ai_analysis.strengths?.join(', ')}
Pontos Fracos: ${lead.ai_analysis.weaknesses?.join(', ')}
Ação Recomendada: ${lead.ai_analysis.next_best_action}
` : 'Não disponível'}

Baseado em:
1. Comportamento do lead (engajamento, resposta, interações)
2. Padrões de leads similares que converteram
3. Score e classificação atual
4. Tempo desde última interação
5. Stage do funil de vendas

Forneça 3 ações prioritárias com:
- Título da ação
- Descrição detalhada
- Prioridade (alta/média/baixa)
- Urgência (quando fazer: imediato/hoje/esta semana/próxima semana)
- Canal recomendado
- Objetivo esperado
- Scripts/templates de mensagem
- Probabilidade de sucesso (%)`;

    const suggestions = await primeos.integrations.Core.InvokeLLM({
      prompt: actionPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          actions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                priority: { type: "string" },
                urgency: { type: "string" },
                channel: { type: "string" },
                objective: { type: "string" },
                message_template: { type: "string" },
                success_probability: { type: "number" }
              }
            }
          },
          reasoning: { type: "string" },
          estimated_conversion_boost: { type: "number" }
        }
      }
    });

    return Response.json({ 
      success: true, 
      suggestions
    });

  } catch (error) {
    console.error('Next Action Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
