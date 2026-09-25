import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const primeos = createClientFromRequest(req);
    const user = await primeos.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ticketId } = await req.json();

    if (!ticketId) {
      return Response.json({ error: 'Ticket ID required' }, { status: 400 });
    }

    // Fetch ticket and KB
    const ticket = await primeos.asServiceRole.entities.SupportTicket.get(ticketId);
    const kbArticles = await primeos.asServiceRole.entities.KnowledgeBase.filter({
      category: ticket.category
    });

    if (!ticket) {
      return Response.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Generate response suggestions
    const suggestionPrompt = `Você é um especialista em suporte ao cliente da Prime Odontologia.
Gere 3 sugestões de resposta profissionais e empáticas para este ticket de suporte.

TICKET:
Assunto: ${ticket.subject}
Descrição: ${ticket.description}
Sentimento do Cliente: ${ticket.ai_analysis?.sentiment || 'neutral'}
Prioridade: ${ticket.priority}

CONHECIMENTO RELEVANTE:
${kbArticles.map(kb => `- ${kb.title}: ${kb.content.substring(0, 200)}`).join('\n')}

Gere 3 respostas diferentes:
1. Uma resposta simpática e reconhecedora
2. Uma resposta técnica e detalhada
3. Uma resposta rápida com solução imediata

Cada resposta deve ser:
- Profissional
- Empática
- Pronta para enviar ao cliente
- Baseada na base de conhecimento quando aplicável`;

    const suggestions = await primeos.integrations.Core.InvokeLLM({
      prompt: suggestionPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          response_1: {
            type: "object",
            properties: {
              type: { type: "string" },
              content: { type: "string" }
            }
          },
          response_2: {
            type: "object",
            properties: {
              type: { type: "string" },
              content: { type: "string" }
            }
          },
          response_3: {
            type: "object",
            properties": {
              type: { type: "string" },
              content: { type: "string" }
            }
          },
          summary: { type: "string" }
        }
      }
    });

    return Response.json({ 
      success: true, 
      suggestions: [
        suggestions.response_1,
        suggestions.response_2,
        suggestions.response_3
      ],
      summary: suggestions.summary
    });

  } catch (error) {
    console.error('Generate Suggestions Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
