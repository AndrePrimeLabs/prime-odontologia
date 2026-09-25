import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const primeos = createClientFromRequest(req);
    const user = await primeos.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { period = 30 } = await req.json();

    // Fetch historical data
    const leads = await primeos.asServiceRole.entities.Lead.list();
    const sales = await primeos.asServiceRole.entities.Sale.list();
    const interactions = await primeos.asServiceRole.entities.LeadInteraction.list();

    // Calculate historical metrics
    const activeLeads = leads.filter(l => ['novo', 'contatado', 'qualificado', 'negociacao'].includes(l.status));
    const wonLeads = leads.filter(l => l.status === 'convertido');
    const totalRevenue = sales.reduce((sum, s) => sum + (s.amount || 0), 0);
    const avgDealSize = sales.length > 0 ? totalRevenue / sales.length : 0;
    const conversionRate = leads.length > 0 ? (wonLeads.length / leads.length) * 100 : 0;

    // AI Forecasting
    const forecastPrompt = `Você é um especialista em previsão de vendas usando análise preditiva.
Analise os dados históricos e forneça uma previsão para os próximos ${period} dias.

DADOS HISTÓRICOS:
Total de Leads: ${leads.length}
Leads Ativos: ${activeLeads.length}
Leads Convertidos: ${wonLeads.length}
Taxa de Conversão: ${conversionRate.toFixed(2)}%
Receita Total: R$ ${totalRevenue.toLocaleString('pt-BR')}
Ticket Médio: R$ ${avgDealSize.toLocaleString('pt-BR')}
Total de Interações: ${interactions.length}

ANÁLISE DE TENDÊNCIAS:
Leads por Status:
${leads.reduce((acc, l) => {
  acc[l.status] = (acc[l.status] || 0) + 1;
  return acc;
}, {})}

Pipeline Atual:
- ${activeLeads.filter(l => l.ai_score >= 80).length} leads quentes (score >= 80)
- ${activeLeads.filter(l => l.ai_score >= 60 && l.ai_score < 80).length} leads mornos (score 60-79)
- ${activeLeads.filter(l => l.ai_score < 60).length} leads frios (score < 60)

Baseado nestes dados, forneça:
1. Previsão de receita para ${period} dias
2. Número estimado de conversões
3. Nível de confiança da previsão (0-100)
4. Fatores de risco
5. Oportunidades identificadas
6. Recomendações estratégicas`;

    const forecast = await primeos.integrations.Core.InvokeLLM({
      prompt: forecastPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          revenue_forecast: { type: "number" },
          revenue_range_min: { type: "number" },
          revenue_range_max: { type: "number" },
          conversions_forecast: { type: "number" },
          confidence_level: { type: "number" },
          risk_factors: { type: "array", items: { type: "string" } },
          opportunities: { type: "array", items: { type: "string" } },
          recommendations: { type: "array", items: { type: "string" } },
          trend: { type: "string" },
          summary: { type: "string" }
        }
      }
    });

    return Response.json({ 
      success: true, 
      forecast,
      current_metrics: {
        active_leads: activeLeads.length,
        conversion_rate: conversionRate,
        avg_deal_size: avgDealSize,
        total_revenue: totalRevenue
      }
    });

  } catch (error) {
    console.error('Forecast Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
