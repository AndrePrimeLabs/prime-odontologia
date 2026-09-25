import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const primeos = createClientFromRequest(req);
    const user = await primeos.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { timeRange = 30 } = await req.json();

    // Fetch interactions and feedback
    const interactions = await primeos.entities.Interaction.list();
    const appointments = await primeos.entities.CRMAppointment.list();
    
    // Filter by date range
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeRange);
    
    const recentInteractions = interactions.filter(i => 
      new Date(i.created_date) >= cutoffDate
    );

    const feedbackData = recentInteractions
      .filter(i => i.description || i.outcome)
      .map(i => ({
        date: i.created_date,
        type: i.type,
        outcome: i.outcome,
        description: i.description,
        subject: i.subject
      }));

    const prompt = `Analise o feedback e interações dos últimos ${timeRange} dias da Prime Odontologia:

DADOS:
${JSON.stringify(feedbackData, null, 2)}

Forneça uma análise completa identificando:
1. Tendências gerais (positivas e negativas)
2. Principais reclamações ou problemas recorrentes
3. Aspectos mais elogiados
4. Pontos de melhoria prioritários
5. Recomendações específicas e acionáveis
6. Score geral de satisfação (0-100)
7. Categorização dos feedbacks por tema

Seja específico e baseie-se nos dados fornecidos.`;

    const response = await primeos.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          satisfaction_score: { type: "number" },
          summary: { type: "string" },
          trends: {
            type: "object",
            properties: {
              positive: { type: "array", items: { type: "string" } },
              negative: { type: "array", items: { type: "string" } }
            }
          },
          common_complaints: { type: "array", items: { type: "string" } },
          praised_aspects: { type: "array", items: { type: "string" } },
          improvement_areas: {
            type: "array",
            items: {
              type: "object",
              properties: {
                area: { type: "string" },
                priority: { type: "string", enum: ["high", "medium", "low"] },
                description: { type: "string" }
              }
            }
          },
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                recommendation: { type: "string" },
                impact: { type: "string" },
                effort: { type: "string", enum: ["low", "medium", "high"] }
              }
            }
          },
          feedback_categories: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string" },
                count: { type: "number" },
                sentiment: { type: "string" }
              }
            }
          }
        }
      }
    });

    return Response.json({ success: true, data: response, feedback_count: feedbackData.length });

  } catch (error) {
    console.error('Feedback Analysis Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
