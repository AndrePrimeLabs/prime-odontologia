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

    // Fetch comprehensive data
    const { data: interactions } = await supabase.from('lead_interactions').select('*').eq('lead_id', leadId);

    const { data: allLeads } = await supabase.from('leads').select('*');
    const historicalData = (allLeads || []).filter(l => l.status === 'fechado' || l.status === 'perdido');

    // Calculate engagement metrics
    const daysSinceFirstContact = lead.data_entrada ? 
      Math.floor((new Date() - new Date(lead.data_entrada)) / (1000 * 60 * 60 * 24)) : 0;
    
    const daysSinceLastInteraction = lead.ultima_interacao ?
      Math.floor((new Date() - new Date(lead.ultima_interacao)) / (1000 * 60 * 60 * 24)) : 999;

    const interactionTypes = {};
    interactions.forEach(i => {
      interactionTypes[i.tipo] = (interactionTypes[i.tipo] || 0) + 1;
    });

    // Calculate conversion patterns
    const conversionPatterns = {
      by_interest: {},
      by_channel: {},
      by_segment: {},
      by_score_range: {}
    };

    historicalData.forEach(l => {
      if (l.status === 'fechado') {
        conversionPatterns.by_interest[l.interesse] = (conversionPatterns.by_interest[l.interesse] || 0) + 1;
        conversionPatterns.by_channel[l.canal_conversao] = (conversionPatterns.by_channel[l.canal_conversao] || 0) + 1;
        conversionPatterns.by_segment[l.segmento] = (conversionPatterns.by_segment[l.segmento] || 0) + 1;
        
        const scoreRange = l.lead_score >= 80 ? '80+' : l.lead_score >= 60 ? '60-79' : l.lead_score >= 40 ? '40-59' : '0-39';
        conversionPatterns.by_score_range[scoreRange] = (conversionPatterns.by_score_range[scoreRange] || 0) + 1;
      }
    });

    // AI Advanced Prediction
    const predictionPrompt = `Você é um especialista em machine learning aplicado a vendas.
Analise todos os dados deste lead e forneça uma predição precisa de conversão.

LEAD COMPLETO:
Nome: ${lead.name}
Score Manual: ${lead.lead_score || 0}
Score IA: ${lead.ai_score || 'N/A'}
Classificação IA: ${lead.ai_classification || 'N/A'}
Segmento: ${lead.segmento}
Status: ${lead.status}
Interesse: ${lead.interesse}
Canal: ${lead.canal_conversao}
Fonte: ${lead.fonte_original}
Valor Estimado: R$ ${lead.valor_estimado || 0}

MÉTRICAS DE ENGAJAMENTO:
- Total de Interações: ${lead.total_interacoes || 0}
- Taxa de Resposta: ${lead.taxa_resposta || 0}%
- Tempo Médio de Resposta: ${lead.tempo_medio_resposta || 0} min
- Dias desde Primeiro Contato: ${daysSinceFirstContact}
- Dias desde Última Interação: ${daysSinceLastInteraction}

DISTRIBUIÇÃO DE INTERAÇÕES:
${Object.entries(interactionTypes).map(([tipo, count]) => `- ${tipo}: ${count}`).join('\n') || 'Nenhuma'}

HISTÓRICO DETALHADO (últimas 10):
${interactions.slice(0, 10).map(i => `${i.tipo} via ${i.canal} - ${i.conteudo || ''} (${i.created_date})`).join('\n')}

PADRÕES HISTÓRICOS DE CONVERSÃO:
Por Interesse: ${JSON.stringify(conversionPatterns.by_interest)}
Por Canal: ${JSON.stringify(conversionPatterns.by_channel)}
Por Segmento: ${JSON.stringify(conversionPatterns.by_segment)}
Por Score: ${JSON.stringify(conversionPatterns.by_score_range)}

Total de Leads Históricos: ${historicalData.length}
Taxa de Conversão Geral: ${historicalData.length > 0 ? ((historicalData.filter(l => l.status === 'fechado').length / historicalData.length) * 100).toFixed(1) : 0}%

ANÁLISE MULTIFATORIAL:
Considere:
1. Dados demográficos e firmográficos
2. Padrões de comportamento (frequência, consistência)
3. Qualidade das interações (tipos, canais)
4. Velocidade de resposta (engajamento)
5. Valor estimado vs. conversões históricas similares
6. Tempo no funil vs. padrões de conversão
7. Score atual vs. threshold de conversão
8. Similaridade com leads convertidos

Forneça:
- Probabilidade de conversão precisa (0-100%)
- Nível de confiança da predição (0-100%)
- Fatores positivos (o que aumenta a chance)
- Fatores negativos (o que diminui a chance)
- Riscos de perda do lead
- Ações para aumentar probabilidade
- Prazo estimado para conversão (dias)
- Valor esperado de conversão (R$)`;

    const prediction = await primeos.integrations.Core.InvokeLLM({
      prompt: predictionPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          conversion_probability: { type: "number" },
          confidence_level: { type: "number" },
          positive_factors: { type: "array", items: { type: "string" } },
          negative_factors: { type: "array", items: { type: "string" } },
          loss_risks: { type: "array", items: { type: "string" } },
          actions_to_increase: { type: "array", items: { type: "string" } },
          estimated_days_to_convert: { type: "number" },
          expected_value: { type: "number" },
          summary: { type: "string" }
        }
      }
    });

    return Response.json({ 
      success: true, 
      prediction,
      engagement_metrics: {
        total_interactions: lead.total_interacoes || 0,
        days_since_first_contact: daysSinceFirstContact,
        days_since_last_interaction: daysSinceLastInteraction,
        interaction_breakdown: interactionTypes
      }
    });

  } catch (error) {
    console.error('Conversion Prediction Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
