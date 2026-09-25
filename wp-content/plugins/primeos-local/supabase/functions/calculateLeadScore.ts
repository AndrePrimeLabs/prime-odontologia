import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const primeos = createClientFromRequest(req);
    const user = await primeos.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leadId } = await req.json();

    if (!leadId) {
      return Response.json({ error: 'Lead ID required' }, { status: 400 });
    }

    const lead = await primeos.asServiceRole.entities.Lead.get(leadId);
    
    if (!lead) {
      return Response.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Fetch lead interactions
    const interactions = await primeos.asServiceRole.entities.LeadInteraction.filter({
      lead_id: leadId
    });

    // AI Lead Scoring
    const scoringPrompt = `Você é um especialista em scoring de leads para CRM.
Analise este lead e forneça um score de 0-100 baseado em múltiplos fatores.

DADOS DO LEAD:
Nome: ${lead.name}
Email: ${lead.email}
Telefone: ${lead.phone}
Empresa: ${lead.company || 'N/A'}
Origem: ${lead.source}
Status Atual: ${lead.status}
Interesse: ${lead.interest || 'N/A'}
Orçamento: ${lead.budget || 'N/A'}
Data de Criação: ${lead.created_date}

HISTÓRICO DE INTERAÇÕES (${interactions.length} total):
${interactions.slice(0, 5).map(i => `- ${i.type}: ${i.notes} (${i.created_date})`).join('\n')}

FATORES PARA CONSIDERAR:
1. Qualidade dos dados de contato (completude)
2. Nível de engajamento (interações)
3. Origem do lead (qualidade da fonte)
4. Orçamento disponível
5. Tempo desde o primeiro contato
6. Padrão de interações (consistência)

Forneça:
- Score de 0-100
- Classificação (frio/morno/quente/muito quente)
- Principais razões do score
- Probabilidade de conversão (%)
- Pontos fortes e fracos do lead`;

    const scoreResult = await primeos.integrations.Core.InvokeLLM({
      prompt: scoringPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          score: { type: "number" },
          classification: { type: "string" },
          reasons: { type: "array", items: { type: "string" } },
          conversion_probability: { type: "number" },
          strengths: { type: "array", items: { type: "string" } },
          weaknesses: { type: "array", items: { type: "string" } },
          next_best_action: { type: "string" }
        }
      }
    });

    // Update lead with AI score
    await primeos.asServiceRole.entities.Lead.update(leadId, {
      ai_score: scoreResult.score,
      ai_classification: scoreResult.classification,
      ai_conversion_probability: scoreResult.conversion_probability,
      ai_analysis: {
        reasons: scoreResult.reasons,
        strengths: scoreResult.strengths,
        weaknesses: scoreResult.weaknesses,
        next_best_action: scoreResult.next_best_action,
        last_scored: new Date().toISOString()
      }
    });

    // Award points
    await primeos.functions.invoke('awardPoints', {
      action: 'lead_scored',
      metadata: { bonus_multiplier: 1.5 }
    });

    return Response.json({ 
      success: true, 
      score: scoreResult,
      message: 'Lead scored! +37 pontos'
    });

  } catch (error) {
    console.error('Lead Scoring Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
