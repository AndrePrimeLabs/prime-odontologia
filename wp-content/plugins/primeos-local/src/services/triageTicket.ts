import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const supabase = createClientFromRequest(req);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ticketData } = await req.json();

    if (!ticketData.subject || !ticketData.description) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // AI Triage Analysis
    const triagePrompt = `Você é um especialista em triagem de tickets de suporte.
Analise o seguinte ticket e forneça análise de prioridade, categoria e sentimento.

ASSUNTO: ${ticketData.subject}
DESCRIÇÃO: ${ticketData.description}
NOME DO CLIENTE: ${ticketData.customer_name}

Análise necessária:
1. Prioridade (baixa, media, alta, critica)
2. Categoria (faturamento, agendamento, procedimentos, pagamento, cancelamento, geral)
3. Sentimento do cliente (positivo, neutro, negativo, frustrado)
4. Score de urgência (0-10)
5. Se precisa de escalação imediata`;

    const triageResult = await primeos.integrations.Core.InvokeLLM({
      prompt: triagePrompt,
      response_json_schema: {
        type: "object",
        properties: {
          priority: { 
            type: "string",
            enum: ["baixa", "media", "alta", "critica"]
          },
          category: { type: "string" },
          sentiment: { type: "string" },
          urgency_score: { type: "number" },
          needs_escalation: { type: "boolean" },
          reasoning: { type: "string" }
        }
      }
    });

    // Create ticket with triaged info
    const ticket = await primeos.entities.SupportTicket.create({
      ticket_id: `TKT-${Date.now()}`,
      customer_name: ticketData.customer_name,
      customer_email: ticketData.customer_email,
      subject: ticketData.subject,
      description: ticketData.description,
      category: triageResult.category,
      priority: triageResult.priority,
      status: 'em_triagem',
      ai_analysis: {
        sentiment: triageResult.sentiment,
        urgency_score: triageResult.urgency_score,
        suggested_category: triageResult.category
      }
    });

    // Award points for handling support
    await primeos.functions.invoke('awardPoints', {
      action: 'support_ticket_handled',
      metadata: { bonus_multiplier: 1.25 }
    });

    return Response.json({ 
      success: true, 
      data: ticket,
      analysis: triageResult,
      message: `Ticket ${ticket.ticket_id} criado e triado! +16 pontos`
    });

  } catch (error) {
    console.error('Triage Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
