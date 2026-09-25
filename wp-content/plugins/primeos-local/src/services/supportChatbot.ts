import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const supabase = createClientFromRequest(req);
    const { userMessage } = await req.json();

    if (!userMessage) {
      return Response.json({ error: 'Message required' }, { status: 400 });
    }

    // Fetch knowledge base
    const { data: kbArticles } = await supabase.from('knowledge_base').select('*');
    
    // Prepare KB context
    const kbContext = (kbArticles || [])
      .filter(kb => kb.is_active)
      .map(kb => `
        Título: ${kb.title}
        Categoria: ${kb.category}
        Conteúdo: ${kb.content}
        FAQs: ${kb.faq?.map(f => `P: ${f.question} R: ${f.answer}`).join('\n') || 'N/A'}
      `).join('\n---\n');

    const prompt = `Você é um assistente de suporte ao cliente da Prime Odontologia.
Você deve responder as perguntas dos clientes de forma amigável, profissional e útil.

BASE DE CONHECIMENTO DISPONÍVEL:
${kbContext}

PERGUNTA DO CLIENTE:
"${userMessage}"

Forneça uma resposta completa e útil baseada na base de conhecimento.
Se não encontrar informações, sugira que o cliente fale com um agente.`;

    const response = await primeos.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          answer: { type: "string" },
          category: { type: "string" },
          confidence: { type: "number" },
          needs_agent: { type: "boolean" }
        }
      }
    });

    return Response.json({ 
      success: true, 
      data: response
    });

  } catch (error) {
    console.error('Chatbot Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
