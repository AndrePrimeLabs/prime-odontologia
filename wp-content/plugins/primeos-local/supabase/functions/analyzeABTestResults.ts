import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const primeos = createClientFromRequest(req);
    const user = await primeos.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { testId } = await req.json();

    if (!testId) {
      return Response.json({ error: 'Test ID required' }, { status: 400 });
    }

    const abTest = await primeos.asServiceRole.entities.ABTest.get(testId);

    if (!abTest) {
      return Response.json({ error: 'Test not found' }, { status: 404 });
    }

    const metricsA = abTest.results.variant_a_metrics;
    const metricsB = abTest.results.variant_b_metrics;

    // Calculate rates
    const openRateA = metricsA.sent > 0 ? (metricsA.opened / metricsA.sent) * 100 : 0;
    const openRateB = metricsB.sent > 0 ? (metricsB.opened / metricsB.sent) * 100 : 0;
    const clickRateA = metricsA.opened > 0 ? (metricsA.clicked / metricsA.opened) * 100 : 0;
    const clickRateB = metricsB.opened > 0 ? (metricsB.clicked / metricsB.opened) * 100 : 0;
    const conversionA = metricsA.clicked > 0 ? (metricsA.converted / metricsA.clicked) * 100 : 0;
    const conversionB = metricsB.clicked > 0 ? (metricsB.converted / metricsB.clicked) * 100 : 0;

    // Determine winner
    const scoreA = (openRateA * 0.3) + (clickRateA * 0.4) + (conversionA * 0.3);
    const scoreB = (openRateB * 0.3) + (clickRateB * 0.4) + (conversionB * 0.3);
    const winner = scoreA > scoreB ? 'A' : 'B';

    // AI Analysis
    const prompt = `Analise os resultados do teste A/B de marketing:

VARIANTE A:
- Taxa de Abertura: ${openRateA.toFixed(2)}%
- Taxa de Clique: ${clickRateA.toFixed(2)}%
- Taxa de Conversão: ${conversionA.toFixed(2)}%
- Score: ${scoreA.toFixed(2)}

VARIANTE B:
- Taxa de Abertura: ${openRateB.toFixed(2)}%
- Taxa de Clique: ${clickRateB.toFixed(2)}%
- Taxa de Conversão: ${conversionB.toFixed(2)}%
- Score: ${scoreB.toFixed(2)}

Variante Vencedora: ${winner}
Tipo de Campanha: ${abTest.campaign_type}

Fornecça:
1. Análise detalhada dos resultados
2. Razões pela qual uma variante venceu
3. Recomendações de otimização
4. Próximos passos para melhorar ainda mais`;

    const analysis = await primeos.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          analysis: { type: "string" },
          key_insights: { type: "array", items: { type: "string" } },
          recommendations: { type: "array", items: { type: "string" } },
          confidence_level: { type: "number" }
        }
      }
    });

    return Response.json({ 
      success: true, 
      results: {
        variant_a: { openRate: openRateA, clickRate: clickRateA, conversion: conversionA, score: scoreA },
        variant_b: { openRate: openRateB, clickRate: clickRateB, conversion: conversionB, score: scoreB },
        winner: `Variante ${winner}`,
        analysis: analysis.analysis,
        insights: analysis.key_insights,
        recommendations: analysis.recommendations,
        confidence: analysis.confidence_level
      }
    });

  } catch (error) {
    console.error('Analyze AB Test Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
