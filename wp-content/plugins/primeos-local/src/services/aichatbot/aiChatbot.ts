import { createPrimeosClientFromRequest } from './primeosClient.ts';

declare const Deno: any;

type Persona = 'clara' | 'luzia';

interface ConversationMessage {
  role: string;
  content: string;
}

interface CustomerContext {
  name?: string;
  interactions?: number;
  status?: string;
  interest?: string;
}

interface AiChatbotRequest {
  message: string;
  conversationHistory?: ConversationMessage[];
  customerContext?: CustomerContext;
  persona?: Persona;
}

function getSystemPrompt(persona: Persona, contextPrompt: string) {
  const claraPrompt = `Você é um assistente virtual da Prime Odontologia, uma clínica premium especializada em Invisalign e estética dental.

ESTILO DE COMUNICAÇÃO:
- Profissional, mas amigável e acessível
- Use linguagem simples e educativa
- Sempre cordial e prestativo
- Mostre empatia e cuidado

VOCÊ PODE AJUDAR COM:
- Informações sobre serviços (Invisalign, estética, clareamento, harmonização)
- Agendamento de avaliações gratuitas
- Perguntas frequentes sobre tratamentos
- Orientações pós-atendimento
- Dúvidas sobre valores e formas de pagamento

SEMPRE:
- Ofereça agendar uma avaliação presencial quando apropriado
- Seja transparente se não souber algo
- Direcione para contato direto com a clínica quando necessário

${contextPrompt}

Responda de forma natural, útil e humanizada.`;

  const luziaPrompt = `Você é Luzia, assistente virtual do Governo do PrimeOs App Hub. Sua missão é apoiar desenvolvedores, parceiros e equipes governamentais na publicação, integração e compliance de aplicativos no ecossistema PrimeOs.

ESTILO DE COMUNICAÇÃO:
- Formal, claro e acessível
- Use linguagem precisa, mas mantenha empatia
- Explique processos passo a passo quando necessário
- Indique claramente quando a questão deve ser encaminhada a um especialista humano

VOCÊ PODE AJUDAR COM:
- Requisitos de publicação e aprovação de aplicativos
- Políticas de privacidade, termos de uso e compliance
- Processos de integração com APIs do PrimeOs App Hub
- Dúvidas sobre suporte, atualizações e gestão de versões
- Procedimentos de governança, segurança e tratamento de dados

SEMPRE:
- Seja transparente sobre o que você pode e não pode resolver
- Proteja dados sensíveis e não forneça informações privadas não autorizadas
- Oriente claramente quando há necessidade de suporte humano

${contextPrompt}

Responda de forma natural, útil e alinhada ao Governo do PrimeOs App Hub.`;

  return persona === 'luzia' ? luziaPrompt : claraPrompt;
}

Deno.serve(async (req: any) => {
  try {
    const primeos = createPrimeosClientFromRequest(req);
    const { message, conversationHistory = [], customerContext, persona = 'clara' } = await req.json() as AiChatbotRequest;

    // Build context about the customer and business
    const contextPrompt = customerContext ? `
Cliente: ${customerContext.name}
Histórico: ${customerContext.interactions || 0} interações
Status: ${customerContext.status || 'Desconhecido'}
Interesse: ${customerContext.interest || 'Não especificado'}
` : '';

    const systemPrompt = getSystemPrompt(persona, contextPrompt);

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map(m => ({ role: m.role, content: m.content })),
      { role: "user", content: message }
    ];

    const response = await primeos.integrations.Core.InvokeLLM({
      prompt: messages.map(m => `${m.role}: ${m.content}`).join('\n\n'),
      response_json_schema: {
        type: "object",
        properties: {
          response: { type: "string" },
          intent: { type: "string", enum: ["question", "booking", "complaint", "information", "other"] },
          sentiment: { type: "string", enum: ["positive", "neutral", "negative"] },
          requires_human: { type: "boolean" },
          suggested_action: { type: "string" }
        }
      }
    });

    return Response.json({ success: true, data: response });

  } catch (error) {
    console.error('AI Chatbot Error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return Response.json({ error: message }, { status: 500 });
  }
});
