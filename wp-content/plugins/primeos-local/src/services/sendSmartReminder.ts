import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  const supabase = createClientFromRequest(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { appointmentId } = await req.json();
  if (!appointmentId) return Response.json({ error: 'appointmentId required' }, { status: 400 });

  const [{ data: appointmentData }, { data: allAppointments }] = await Promise.all([
    supabase.from('appointments').select('*').eq('id', appointmentId),
    supabase.from('appointments').select('*').order('date', { ascending: false }).limit(50)
  ]);
  const appointment = appointmentData?.[0];

  if (!appointment) return Response.json({ error: 'Appointment not found' }, { status: 404 });

  // Get patient history for context
  const patientHistory = allAppointments.filter(a =>
    (a.patient_id && a.patient_id === appointment.patient_id) ||
    a.patient_name === appointment.patient_name
  );
  const completedCount = patientHistory.filter(a => a.status === 'completed').length;
  const noShowCount = patientHistory.filter(a => a.status === 'no_show').length;
  const isNewPatient = completedCount === 0;
  const isHighRisk = noShowCount >= 2;

  const serviceLabels = {
    consultation: 'consulta', follow_up: 'retorno', procedure: 'procedimento',
    checkup: 'check-up', emergency: 'emergência', therapy: 'terapia', diagnostic: 'diagnóstico'
  };

  const prompt = `Crie uma mensagem de lembrete de consulta para WhatsApp. A mensagem deve ser personalizada, natural, calorosa e em português brasileiro.

DADOS DA CONSULTA:
- Paciente: ${appointment.patient_name}
- Data: ${appointment.date}
- Horário: ${appointment.time}
- Tipo: ${serviceLabels[appointment.service_type] || appointment.service_type}
- Dentista: ${appointment.provider ? 'Dr(a). ' + appointment.provider : 'Nossa equipe'}
- Observações: ${appointment.notes || 'nenhuma'}

PERFIL DO PACIENTE:
- ${isNewPatient ? 'Paciente NOVO - primeira consulta' : `Paciente recorrente (${completedCount} consultas realizadas)`}
- Risco de no-show: ${isHighRisk ? 'ALTO (faltou ' + noShowCount + ' vezes)' : 'normal'}

INSTRUÇÕES:
- ${isNewPatient ? 'Tom acolhedor para primeiro acesso, explique que pode tirar dúvidas' : 'Tom familiar como se conhecesse o paciente'}
- ${isHighRisk ? 'Enfatize gentilmente a importância de confirmar ou reagendar com antecedência' : 'Peça confirmação simples'}
- Use emojis com moderação (2-3 no máximo)
- Máximo 5 linhas
- Inclua pedido de confirmação (responder SIM ou CONFIRMAR)
- Assine como "Prime Odontologia"

Retorne APENAS este JSON:
{
  "message": "string (a mensagem completa)",
  "tone": "string (tom usado: acolhedor/familiar/urgente)",
  "tip": "string (dica sobre o envio)"
}`;

  const result = await primeos.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        message: { type: "string" },
        tone: { type: "string" },
        tip: { type: "string" }
      }
    }
  });

  // Mark reminder as sent
  await primeos.entities.Appointment.update(appointmentId, { reminder_sent: true });

  return Response.json({
    message: result.message,
    tone: result.tone,
    tip: result.tip,
    phone: appointment.patient_phone,
    patient_name: appointment.patient_name
  });
});
