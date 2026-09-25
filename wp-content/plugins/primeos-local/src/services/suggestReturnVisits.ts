import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  const supabase = createClientFromRequest(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const [{ data: patients }, { data: appointments }] = await Promise.all([
    supabase.from('patients').select('*').order('updated_at', { ascending: false }).limit(100),
    supabase.from('appointments').select('*').order('date', { ascending: false }).limit(300)
  ]);

  const today = new Date();

  // Build last visit map per patient
  const lastVisitMap = {};
  appointments
    .filter(a => a.status === 'completed')
    .forEach(a => {
      const key = a.patient_id || a.patient_name;
      if (!lastVisitMap[key] || new Date(a.date) > new Date(lastVisitMap[key].date)) {
        lastVisitMap[key] = a;
      }
    });

  // Score patients needing return visits
  const candidates = patients
    .filter(p => p.status === 'ativo')
    .map(p => {
      const lastVisit = lastVisitMap[p.id] || lastVisitMap[p.patient_name];
      const daysSince = lastVisit
        ? Math.round((today - new Date(lastVisit.date)) / (1000 * 60 * 60 * 24))
        : 999;
      const totalVisits = appointments.filter(a =>
        a.patient_id === p.id || a.patient_name === p.patient_name
      ).length;

      return { patient: p, lastVisit, daysSince, totalVisits };
    })
    .filter(c => c.daysSince >= 90) // At least 3 months without visit
    .sort((a, b) => b.daysSince - a.daysSince)
    .slice(0, 15);

  if (candidates.length === 0) {
    return Response.json({ suggestions: [], message: 'Todos os pacientes estão com visitas em dia.' });
  }

  const prompt = `Você é um assistente de CRM odontológico. Analise estes pacientes que não visitam a clínica há algum tempo e sugira os mais prioritários para agendamento de retorno preventivo.

PACIENTES SEM VISITA RECENTE:
${candidates.map(c => `
- ${c.patient.patient_name} | ${c.daysSince} dias sem visita | ${c.totalVisits} visitas totais | Condições: ${(c.patient.medical_conditions || []).join(', ') || 'nenhuma'} | Ortodontia: ${c.patient.dental_records?.orthodontics?.has_braces ? 'SIM' : 'não'}
`).join('')}

DATA ATUAL: ${today.toISOString().split('T')[0]}

Para os 6 pacientes mais prioritários, sugira o melhor slot de retorno e uma mensagem personalizada de WhatsApp.

Retorne APENAS este JSON:
{
  "suggestions": [
    {
      "patient_name": "string",
      "patient_id": "string",
      "days_since_visit": number,
      "priority": "urgent|high|medium",
      "suggested_date": "YYYY-MM-DD",
      "suggested_time": "HH:MM",
      "visit_reason": "string (motivo clínico do retorno)",
      "whatsapp_message": "string (mensagem personalizada pronta para enviar)",
      "ltv_potential": "string (potencial de receita desta visita)"
    }
  ],
  "summary": "string (resumo das ações recomendadas)"
}`;

  const result = await primeos.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        suggestions: { type: "array", items: { type: "object" } },
        summary: { type: "string" }
      }
    }
  });

  // Attach patient phone to each suggestion
  const enriched = (result.suggestions || []).map(s => {
    const p = patients.find(pt => pt.patient_name === s.patient_name || pt.id === s.patient_id);
    return { ...s, patient_phone: p?.patient_phone || '', patient_id: p?.id || s.patient_id };
  });

  return Response.json({ suggestions: enriched, summary: result.summary });
});
