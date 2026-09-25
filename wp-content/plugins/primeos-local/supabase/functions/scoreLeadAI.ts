import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const primeos = createClientFromRequest(req);
    const user = await primeos.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { lead_id, score_all } = await req.json();

    // High-value interests get higher base scores
    const interestWeight = {
      invisalign: 30, implante: 28, protese: 25, estetica: 22,
      ortodontia: 20, clareamento: 18, limpeza: 12, checkup: 10, outro: 8
    };

    const temperatureBonus = { quente: 25, morno: 12, frio: 0 };
    const stageBonus = { novo: 0, em_conversa: 10, avaliacao: 20, orcamento: 30, fechado: 50, perdido: -10 };
    const sourceBonus = { indicacao: 20, pago: 10, organico: 5, reativacao: 15 };
    const canalBonus = { whatsapp: 8, instagram: 6, facebook: 5, google: 7, indicacao: 10, telefone: 9, site: 6, outro: 3 };

    const scoreLead = async (lead) => {
      // Fetch interactions for this lead
      const interactions = await primeos.entities.LeadInteraction.filter({ lead_id: lead.id });

      // Interaction scoring
      const interactionPoints = {
        mensagem_recebida: 5, mensagem_enviada: 2, ligacao: 10,
        agendamento: 25, compareceu: 30, nao_compareceu: -10,
        orcamento_enviado: 15, orcamento_aceito: 35, pagamento: 50,
        indicacao: 20, email: 3
      };

      let interactionScore = 0;
      const recentCutoff = new Date();
      recentCutoff.setDate(recentCutoff.getDate() - 30);

      for (const i of interactions) {
        const pts = interactionPoints[i.tipo] || 0;
        const isRecent = new Date(i.created_date) > recentCutoff;
        interactionScore += isRecent ? pts * 1.5 : pts;
      }

      // Cap interaction score
      interactionScore = Math.min(interactionScore, 40);

      // Base score from profile
      const baseScore =
        (interestWeight[lead.interesse] || 8) +
        (temperatureBonus[lead.temperatura] || 0) +
        (stageBonus[lead.status] || 0) +
        (sourceBonus[lead.fonte_original] || 5) +
        (canalBonus[lead.canal_conversao] || 5);

      // Demographic bonuses
      let demographicBonus = 0;
      if (lead.email) demographicBonus += 5;
      if (lead.phone) demographicBonus += 5;
      if (lead.valor_estimado > 5000) demographicBonus += 10;
      else if (lead.valor_estimado > 2000) demographicBonus += 6;
      else if (lead.valor_estimado > 500) demographicBonus += 3;

      // Recency penalty: no interaction in 60+ days
      let recencyPenalty = 0;
      if (lead.ultima_interacao) {
        const daysSince = Math.floor((Date.now() - new Date(lead.ultima_interacao)) / 86400000);
        if (daysSince > 60) recencyPenalty = 20;
        else if (daysSince > 30) recencyPenalty = 10;
      }

      const rawScore = baseScore + interactionScore + demographicBonus - recencyPenalty;
      const finalScore = Math.max(0, Math.min(100, Math.round(rawScore)));

      // Classification
      let classification;
      let conversionProbability;
      if (finalScore >= 75) { classification = "muito quente"; conversionProbability = 80; }
      else if (finalScore >= 55) { classification = "quente"; conversionProbability = 55; }
      else if (finalScore >= 35) { classification = "morno"; conversionProbability = 30; }
      else { classification = "frio"; conversionProbability = 10; }

      // Build reasons
      const reasons = [];
      const strengths = [];
      const weaknesses = [];

      if (interestWeight[lead.interesse] >= 25) strengths.push(`Interesse em ${lead.interesse} — alto valor`);
      if (lead.temperatura === "quente") strengths.push("Temperatura quente indica urgência");
      if (interactions.length >= 5) strengths.push(`${interactions.length} interações registradas`);
      if (lead.valor_estimado > 3000) strengths.push(`Valor estimado alto: R$ ${lead.valor_estimado.toLocaleString()}`);
      if (lead.fonte_original === "indicacao") strengths.push("Veio por indicação — alta confiança");
      if (lead.email && lead.phone) strengths.push("Dados de contato completos");

      if (lead.temperatura === "frio") weaknesses.push("Temperatura fria — baixo engajamento");
      if (interactions.length === 0) weaknesses.push("Nenhuma interação registrada");
      if (!lead.email) weaknesses.push("Email não informado");
      if (recencyPenalty > 0) weaknesses.push("Sem interação nos últimos 30+ dias");
      if (lead.status === "perdido") weaknesses.push("Lead marcado como perdido");

      // Next best action
      let next_best_action = "Enviar mensagem de apresentação pelo WhatsApp";
      if (lead.status === "em_conversa" && finalScore >= 55) next_best_action = "Convidar para avaliação presencial urgente";
      else if (lead.status === "avaliacao") next_best_action = "Enviar orçamento personalizado com urgência leve";
      else if (lead.status === "orcamento") next_best_action = "Follow-up para fechar — usar script de objeções";
      else if (lead.temperatura === "frio" && interactions.length === 0) next_best_action = "Usar script de reativação com oferta de avaliação gratuita";
      else if (lead.interesse === "invisalign" || lead.interesse === "implante") next_best_action = "Enviar caso de sucesso + vídeo explicativo do tratamento";

      reasons.push(...strengths.slice(0, 2));

      const updateData = {
        ai_score: finalScore,
        ai_classification: classification,
        ai_conversion_probability: conversionProbability,
        ai_analysis: {
          reasons,
          strengths,
          weaknesses,
          next_best_action,
          last_scored: new Date().toISOString()
        }
      };

      await primeos.entities.Lead.update(lead.id, updateData);
      return { id: lead.id, name: lead.name, ...updateData };
    };

    if (score_all) {
      const leads = await primeos.entities.Lead.list();
      const results = await Promise.all(leads.map(scoreLead));
      return Response.json({ success: true, scored: results.length, results });
    }

    if (!lead_id) return Response.json({ error: 'lead_id required' }, { status: 400 });
    const lead = await primeos.entities.Lead.get(lead_id);
    const result = await scoreLead(lead);
    return Response.json({ success: true, result });

  } catch (error) {
    console.error('scoreLeadAI error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
