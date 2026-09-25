import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const primeos = createClientFromRequest(req);
    const user = await primeos.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contentType, segmentId, topic, tone = "professional", platform = "email" } = await req.json();

    let segment = null;
    let segmentContext = '';

    // Get segment details if provided
    if (segmentId) {
      segment = await primeos.entities.CustomerSegment.get(segmentId);
      segmentContext = `
SEGMENTO ALVO: ${segment.name}
Descrição: ${segment.descricao || 'N/A'}
Perfil: ${JSON.stringify(segment.customer_profile || {})}
Critérios: ${JSON.stringify(segment.criterios || {})}
`;
    }

    const platformGuidelines = {
      email: "Email marketing - máximo 500 palavras, com assunto cativante e CTA claro",
      social_media: "Post para redes sociais - máximo 150 palavras, engajador e com hashtags",
      blog: "Artigo de blog - 800-1200 palavras, educativo e otimizado para SEO",
      whatsapp: "Mensagem WhatsApp - concisa, máximo 100 palavras, natural e amigável"
    };

    const toneGuidelines = {
      professional: "Tom profissional e confiável",
      friendly: "Tom amigável e conversacional",
      educational: "Tom educativo e informativo",
      promotional: "Tom promocional e persuasivo",
      empathetic: "Tom empático e acolhedor"
    };

    const prompt = `Você é um especialista em marketing de conteúdo para a Prime Odontologia, clínica premium de estética dental.

${segmentContext}

TAREFA: Crie conteúdo de ${contentType} sobre "${topic}"

PLATAFORMA: ${platform} - ${platformGuidelines[platform]}
TOM: ${tone} - ${toneGuidelines[tone]}

DIRETRIZES DA MARCA PRIME ODONTOLOGIA:
- Posicionamento premium e sofisticado
- Foco em Invisalign, estética natural e discrição
- Tecnologia de ponta e resultados comprovados
- Atendimento humanizado e personalizado
- Diferenciais: invisibilidade, conforto, precisão

ESTRUTURA NECESSÁRIA:
${platform === 'email' ? '- Assunto do email\n- Pré-header\n- Corpo principal\n- CTA forte' : ''}
${platform === 'social_media' ? '- Hook inicial\n- Conteúdo principal\n- Hashtags relevantes\n- CTA' : ''}
${platform === 'blog' ? '- Título SEO\n- Introdução\n- Desenvolvimento (com subtítulos)\n- Conclusão\n- Meta descrição' : ''}
${platform === 'whatsapp' ? '- Mensagem direta e objetiva\n- Tom conversacional\n- Call to action' : ''}

Crie conteúdo envolvente, alinhado ao segmento e que gere conversão.`;

    const response = await primeos.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          subject: { type: "string" },
          preheader: { type: "string" },
          content: { type: "string" },
          cta: { type: "string" },
          hashtags: { type: "array", items: { type: "string" } },
          meta_description: { type: "string" },
          seo_keywords: { type: "array", items: { type: "string" } },
          performance_tips: { type: "array", items: { type: "string" } }
        }
      }
    });

    return Response.json({ success: true, data: response });

  } catch (error) {
    console.error('Content Generation Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
