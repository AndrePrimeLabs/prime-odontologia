import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const primeos = createClientFromRequest(req);
    const user = await primeos.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { customerId } = await req.json();

    if (!customerId) {
      return Response.json({ error: 'Customer ID required' }, { status: 400 });
    }

    // Fetch customer and their interactions
    const customer = await primeos.asServiceRole.entities.Customer.get(customerId);
    const interactions = await primeos.entities.Interaction.filter({ customer_id: customerId });
    const appointments = await primeos.entities.CRMAppointment.filter({ customer_id: customerId });
    const sales = await primeos.entities.Sale.filter({ customer_id: customerId });

    // Build journey data
    const journeyData = {
      customer: customer.name,
      status: customer.status,
      segment: customer.segment,
      lifetime_value: customer.lifetime_value || 0,
      interactions: interactions.map(i => ({
        type: i.type,
        date: i.created_date,
        outcome: i.outcome,
        subject: i.subject,
        description: i.description
      })),
      appointments: appointments.map(a => ({
        type: a.type,
        date: a.date,
        status: a.status,
        title: a.title
      })),
      purchases: sales.length,
      totalRevenue: sales.reduce((sum, s) => sum + (s.total_amount || 0), 0)
    };

    // Analyze with AI
    const prompt = `Você é um especialista em customer experience e jornada do cliente para Prime Odontologia.

DADOS DO CLIENTE:
Nome: ${journeyData.customer}
Status: ${journeyData.status}
Segmento: ${journeyData.segment}
Valor de Vida: R$ ${journeyData.lifetime_value}
Total de Interações: ${journeyData.interactions.length}
Agendamentos: ${journeyData.appointments.length}
Compras: ${journeyData.purchases}
Receita: R$ ${journeyData.totalRevenue}

HISTÓRICO DE INTERAÇÕES:
${JSON.stringify(journeyData.interactions.slice(-20), null, 2)}

HISTÓRICO DE AGENDAMENTOS:
${JSON.stringify(journeyData.appointments.slice(-10), null, 2)}

Analise a jornada completa do cliente e forneça:

1. ESTÁGIOS IDENTIFICADOS na jornada (Awareness, Consideration, Decision, Retention, Advocacy)
2. POSIÇÃO ATUAL do cliente na jornada
3. PADRÕES DE COMPORTAMENTO observados
4. TOUCHPOINTS ÓTIMOS sugeridos para cada estágio
5. ESTRATÉGIAS DE COMUNICAÇÃO personalizadas por estágio
6. PRÓXIMAS AÇÕES recomendadas para engajamento
7. RISCOS IDENTIFICADOS (churn, desengajamento)
8. OPORTUNIDADES DE UPSELL/CROSS-SELL

Seja específico e baseie as recomendações nos dados reais da interação.`;

    const response = await primeos.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          stages_identified: {
            type: "array",
            items: {
              type: "object",
              properties: {
                stage: { type: "string" },
                description: { type: "string" },
                characteristics: { type: "array", items: { type: "string" } }
              }
            }
          },
          current_stage: { type: "string" },
          stage_progress: { type: "number" },
          behavior_patterns: { type: "array", items: { type: "string" } },
          optimal_touchpoints: {
            type: "array",
            items: {
              type: "object",
              properties: {
                stage: { type: "string" },
                touchpoints: { type: "array", items: { type: "string" } },
                channels: { type: "array", items: { type: "string" } },
                timing: { type: "string" }
              }
            }
          },
          communication_strategies: {
            type: "array",
            items: {
              type: "object",
              properties: {
                stage: { type: "string" },
                message: { type: "string" },
                tone: { type: "string" },
                frequency: { type: "string" }
              }
            }
          },
          next_actions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                timeline: { type: "string" },
                expected_outcome: { type: "string" }
              }
            }
          },
          risks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                risk: { type: "string" },
                probability: { type: "string" },
                mitigation: { type: "string" }
              }
            }
          },
          opportunities: { type: "array", items: { type: "string" } }
        }
      }
    });

    return Response.json({ success: true, data: response, journeyData });

  } catch (error) {
    console.error('Journey Analysis Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
