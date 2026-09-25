import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  const primeos = createClientFromRequest(req);
  const user = await primeos.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { patientId } = await req.json();
  if (!patientId) return Response.json({ error: 'patientId required' }, { status: 400 });

  const [patient, appointments, medicalRecords, clinicalNotes] = await Promise.all([
    primeos.entities.PatientRecord.filter({ id: patientId }).then(r => r[0]),
    primeos.entities.Appointment.filter({ patient_id: patientId }),
    primeos.entities.MedicalRecord.filter({ patient_id: patientId }),
    primeos.entities.ClinicalNote.filter({ patient_id: patientId })
  ]);

  if (!patient) return Response.json({ error: 'Patient not found' }, { status: 404 });

  const today = new Date();
  const completedAppointments = appointments.filter(a => a.status === 'completed');
  const cancelledCount = appointments.filter(a => a.status === 'cancelled' || a.status === 'no_show').length;
  const totalRevenue = (patient.past_treatments || []).reduce((s, t) => s + (t.cost || 0), 0);
  const lastAppointment = completedAppointments.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  const daysSinceLastVisit = lastAppointment
    ? Math.round((today - new Date(lastAppointment.date)) / (1000 * 60 * 60 * 24))
    : null;
  const age = patient.date_of_birth
    ? Math.floor((today - new Date(patient.date_of_birth)) / (1000 * 60 * 60 * 24 * 365))
    : null;

  const medicalSummary = medicalRecords.map(r =>
    `[${r.record_type}] ${r.title || ''}: ${(r.content || '').slice(0, 300)}`
  ).join('\n') || 'Nenhum prontuário registrado';

  const notesSummary = clinicalNotes.map(n =>
    `Queixa: ${n.chief_complaint || 'N/A'} | Diagnóstico: ${n.diagnosis || 'N/A'} | Plano: ${n.treatment_plan || 'N/A'}`
  ).join('\n') || 'Nenhuma nota clínica';

  const prompt = `Você é um assistente clínico especializado em odontologia. Analise os dados deste paciente e retorne insights clínicos e de CRM em formato JSON.

DADOS DO PACIENTE:
- Nome: ${patient.patient_name}
- Idade: ${age !== null ? age + ' anos' : 'desconhecida'}
- Sexo: ${patient.gender || 'não informado'}
- Status: ${patient.status || 'ativo'}
- Condições médicas crônicas: ${(patient.medical_conditions || []).join(', ') || 'nenhuma'}
- Alergias conhecidas: ${(patient.allergies || []).map(a => typeof a === 'string' ? a : (a.allergen + (a.severity ? ' [' + a.severity + ']' : ''))).join(', ') || 'nenhuma'}
- Medicamentos em uso: ${(patient.current_medications || []).map(m => m.name + (m.dosage ? ' ' + m.dosage : '')).join(', ') || 'nenhum'}
- Fumante: ${patient.smoker ? 'sim' : 'não informado'}
- Pressão arterial: ${patient.blood_pressure || 'não informada'}
- Tipo sanguíneo: ${patient.blood_type || 'não informado'}

HISTÓRICO DE CONSULTAS:
- Total: ${appointments.length} | Concluídas: ${completedAppointments.length} | Cancelamentos/faltas: ${cancelledCount}
- Última visita: ${lastAppointment ? lastAppointment.date + ' (' + daysSinceLastVisit + ' dias atrás)' : 'nunca visitou'}
- Serviços realizados: ${completedAppointments.map(a => a.service_type).join(', ') || 'nenhum'}

TRATAMENTOS ANTERIORES:
${(patient.past_treatments || []).map(t => `- ${t.procedure || t.treatment} (dente ${t.tooth_number || 'N/A'}) em ${t.date || 'data desconhecida'}`).join('\n') || '- Nenhum tratamento registrado'}

PRONTUÁRIOS CLÍNICOS:
${medicalSummary}

NOTAS CLÍNICAS:
${notesSummary}

RECEITA TOTAL GERADA: R$ ${totalRevenue.toFixed(2)}

Retorne APENAS este JSON (sem markdown, sem blocos de código):
{
  "clinical_insights": {
    "overall_health_score": number (0-100, saúde bucal geral estimada),
    "health_score_label": "Crítico|Atenção|Regular|Bom|Excelente",
    "risk_factors": [
      {
        "factor": "string (nome do fator de risco)",
        "severity": "high|medium|low",
        "description": "string (explicação clínica detalhada)",
        "action": "string (ação recomendada ao profissional)"
      }
    ],
    "preventive_measures": [
      {
        "measure": "string (nome da medida preventiva)",
        "rationale": "string (por que é importante para este paciente)",
        "frequency": "string (ex: a cada 6 meses, anualmente)",
        "priority": "high|medium|low"
      }
    ],
    "drug_interactions": [
      {
        "interaction": "string (medicamentos/substâncias envolvidos)",
        "risk": "string (risco clínico)",
        "recommendation": "string (conduta recomendada)"
      }
    ],
    "clinical_alerts": [
      {
        "alert": "string (alerta para o profissional)",
        "reason": "string (justificativa clínica)",
        "severity": "high|medium|low"
      }
    ],
    "provider_notes": "string (resumo clínico conciso para o profissional de saúde, máximo 3 linhas)"
  },
  "next_visit": {
    "predicted_date": "string (ex: 'em 30 dias' ou 'overdue - 45 dias sem visita')",
    "best_contact_time": "string (ex: 'terça ou quinta, entre 10h-12h')",
    "contact_reason": "string (motivo para o contato proativo)",
    "urgency": "low|medium|high",
    "message_suggestion": "string (mensagem sugerida para WhatsApp)"
  },
  "churn_risk": {
    "score": number (0-100),
    "level": "low|medium|high|critical",
    "risk_factors": ["array de fatores de risco de abandono"],
    "reengagement_campaign": {
      "title": "string",
      "approach": "string",
      "offer_suggestion": "string",
      "message_template": "string"
    }
  },
  "lifetime_value": {
    "current_ltv": number,
    "projected_ltv_12m": number,
    "segment": "bronze|silver|gold|platinum",
    "avg_ticket": number,
    "visit_frequency": "string",
    "personalization_tips": ["string"]
  },
  "treatment_suggestions": [
    {
      "treatment": "string",
      "reason": "string",
      "priority": "preventive|recommended|urgent",
      "estimated_value": number,
      "time_frame": "string"
    }
  ],
  "summary": "string (resumo geral em 2-3 linhas para o atendente)"
}`;

  const result = await primeos.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        clinical_insights: { type: "object" },
        next_visit: { type: "object" },
        churn_risk: { type: "object" },
        lifetime_value: { type: "object" },
        treatment_suggestions: { type: "array", items: { type: "object" } },
        summary: { type: "string" }
      }
    }
  });

  return Response.json({ analysis: result, patient_name: patient.patient_name });
});
