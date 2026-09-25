import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const supabase = createClientFromRequest(req);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { customerId } = await req.json();

    if (!customerId) {
      return Response.json({ error: 'Customer ID required' }, { status: 400 });
    }

    // Fetch customer data
    const { data: customer } = await supabase.from('customers').select('*').eq('id', customerId).single();
    const { data: interactions } = await supabase.from('interactions').select('*').eq('customer_id', customerId);
    const { data: sales } = await supabase.from('sales').select('*').eq('customer_id', customerId);
    const { data: products } = await supabase.from('products').select('*');
    const { data: appointments } = await supabase.from('appointments').select('*').eq('customer_id', customerId);

    // Build customer profile
    const customerProfile = {
      name: customer.name,
      segment: customer.segment,
      value_tier: customer.value_tier,
      lifetime_value: customer.lifetime_value || 0,
      status: customer.status,
      interactions_count: interactions.length,
      last_interaction: interactions[0]?.created_date,
      purchases: sales.map(s => ({
        products: s.products,
        total: s.total_amount,
        date: s.created_date
      })),
      appointments_count: appointments.length,
      last_appointment: appointments[0]?.created_date
    };

    const prompt = `Você é um especialista em vendas consultivas e estratégias de upsell/cross-sell para a Prime Odontologia.

PERFIL DO CLIENTE:
${JSON.stringify(customerProfile, null, 2)}

SERVIÇOS DISPONÍVEIS:
${JSON.stringify(products, null, 2)}

Com base no histórico e perfil do cliente, identifique:
1. Oportunidades de UPSELL (melhorar serviço atual ou adicionar complementos)
2. Oportunidades de CROSS-SELL (novos serviços relacionados)
3. Timing ideal para cada abordagem
4. Script sugerido para cada oportunidade
5. Valor estimado de cada oportunidade
6. Priorização das oportunidades (alta/média/baixa)

CONTEXTO PRIME ODONTOLOGIA:
- Invisalign (tratamento ortodôntico invisível)
- Clareamento dental
- Harmonização facial
- Lentes de contato dental
- Design de sorriso
- Serviços premium com foco em estética e discrição

Forneça sugestões personalizadas e acionáveis.`;

    const response = await primeos.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          upsell_opportunities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                service: { type: "string" },
                reason: { type: "string" },
                timing: { type: "string" },
                estimated_value: { type: "number" },
                priority: { type: "string", enum: ["high", "medium", "low"] },
                approach_script: { type: "string" },
                success_probability: { type: "number" }
              }
            }
          },
          cross_sell_opportunities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                service: { type: "string" },
                reason: { type: "string" },
                timing: { type: "string" },
                estimated_value: { type: "number" },
                priority: { type: "string", enum: ["high", "medium", "low"] },
                approach_script: { type: "string" },
                success_probability: { type: "number" }
              }
            }
          },
          best_next_action: { type: "string" },
          total_potential_value: { type: "number" }
        }
      }
    });

    return Response.json({ success: true, data: response, customer: customerProfile });

  } catch (error) {
    console.error('Opportunity Suggestions Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
