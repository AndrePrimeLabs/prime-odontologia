import { createPrimeosClientFromRequest } from './primeosClient.ts';

// Cancel/reschedule policy: minimum hours before appointment
const CANCEL_MIN_HOURS = 24;
const RESCHEDULE_MIN_HOURS = 4;

Deno.serve(async (req) => {
  try {
    const db = createClientFromRequest(req).asServiceRole;
    const data = await req.json();
    const { action, token, new_date, new_time } = data;

    if (!token) {
      return Response.json({ success: false, error: 'Token inválido.' }, { status: 400 });
    }

    // Find appointment by token stored in notes or by id
    const [appointmentId] = token.split('_');
    let appointment;
    try {
      const all = await db.entities.Appointment.filter({ id: appointmentId });
      appointment = all[0];
    } catch {
      appointment = null;
    }

    if (!appointment) {
      return Response.json({ success: false, error: 'Agendamento não encontrado.' }, { status: 404 });
    }

    // Validate token matches (token = id + _ + hash of patient_phone last 4)
    const expectedToken = buildToken(appointment);
    if (token !== expectedToken) {
      return Response.json({ success: false, error: 'Link inválido ou expirado.' }, { status: 403 });
    }

    if (['cancelled', 'completed', 'no_show'].includes(appointment.status)) {
      return Response.json({ success: false, error: 'Este agendamento já foi ' + (appointment.status === 'cancelled' ? 'cancelado' : 'finalizado') + '.' });
    }

    // Check policy time window
    const apptDateTime = new Date(`${appointment.date}T${appointment.time}:00`);
    const now = new Date();
    const hoursUntil = (apptDateTime - now) / (1000 * 60 * 60);

    if (action === 'cancel') {
      if (hoursUntil < CANCEL_MIN_HOURS) {
        return Response.json({
          success: false,
          error: `Cancelamentos devem ser feitos com pelo menos ${CANCEL_MIN_HOURS}h de antecedência. Por favor, ligue para a clínica.`,
          policy_blocked: true
        });
      }

      await db.entities.Appointment.update(appointment.id, { status: 'cancelled' });
      console.log(`Appointment ${appointment.id} cancelled by patient via link`);

      // Notify clinic via email (no patient email needed here)
      try {
        await db.integrations.Core.SendEmail({
          to: 'contato@primeodontologia.com.br',
          from_name: 'Prime Odontologia - Sistema',
          subject: '❌ Cancelamento pelo Paciente',
          body: `
            <div style="font-family:sans-serif;padding:20px">
              <h3>Cancelamento realizado pelo paciente</h3>
              <p><strong>Paciente:</strong> ${appointment.patient_name}</p>
              <p><strong>Data/Hora:</strong> ${formatDate(appointment.date)} às ${appointment.time}</p>
              <p><strong>Profissional:</strong> ${appointment.provider || 'Não definido'}</p>
              <p style="color:#64748b;font-size:13px">O horário foi liberado automaticamente na agenda.</p>
            </div>
          `
        });
      } catch (e) { console.error('Clinic notify error:', e.message); }

      return Response.json({ success: true, action: 'cancelled', message: 'Consulta cancelada com sucesso. O horário foi liberado.' });
    }

    if (action === 'reschedule') {
      if (hoursUntil < RESCHEDULE_MIN_HOURS) {
        return Response.json({
          success: false,
          error: `Reagendamentos devem ser feitos com pelo menos ${RESCHEDULE_MIN_HOURS}h de antecedência. Por favor, ligue para a clínica.`,
          policy_blocked: true
        });
      }

      if (!new_date || !new_time) {
        return Response.json({ success: false, error: 'Nova data e horário são obrigatórios.' }, { status: 400 });
      }

      // Check new slot availability
      const sameDay = await db.entities.Appointment.filter({ date: new_date });
      const slotStart = timeToMin(new_time);
      const slotEnd = slotStart + (appointment.duration_minutes || 30);

      const conflict = sameDay.filter(a => {
        if (a.id === appointment.id || a.status === 'cancelled' || !a.time) return false;
        if (appointment.dentist_id && a.dentist_id && a.dentist_id !== appointment.dentist_id) return false;
        const aStart = timeToMin(a.time);
        const aEnd = aStart + (a.duration_minutes || 30);
        return slotStart < aEnd && slotEnd > aStart;
      });

      if (conflict.length > 0) {
        return Response.json({ success: false, error: 'Este horário não está disponível. Por favor, escolha outro.' });
      }

      await db.entities.Appointment.update(appointment.id, {
        date: new_date,
        time: new_time,
        status: 'scheduled',
        reminder_sent: false,
        reminder_confirmed: 'pending',
      });

      console.log(`Appointment ${appointment.id} rescheduled to ${new_date} ${new_time} by patient`);

      // Notify clinic
      try {
        await db.integrations.Core.SendEmail({
          to: 'contato@primeodontologia.com.br',
          from_name: 'Prime Odontologia - Sistema',
          subject: '🔄 Reagendamento pelo Paciente',
          body: `
            <div style="font-family:sans-serif;padding:20px">
              <h3>Reagendamento pelo paciente</h3>
              <p><strong>Paciente:</strong> ${appointment.patient_name}</p>
              <p><strong>Data/Hora anterior:</strong> ${formatDate(appointment.date)} às ${appointment.time}</p>
              <p><strong>Nova Data/Hora:</strong> ${formatDate(new_date)} às ${new_time}</p>
              <p><strong>Profissional:</strong> ${appointment.provider || 'Não definido'}</p>
            </div>
          `
        });
      } catch (e) { console.error('Clinic notify error:', e.message); }

      return Response.json({
        success: true,
        action: 'rescheduled',
        new_date,
        new_time,
        message: 'Consulta reagendada com sucesso!'
      });
    }

    // GET appointment info by token
    if (action === 'get') {
      return Response.json({
        success: true,
        appointment: {
          id: appointment.id,
          patient_name: appointment.patient_name,
          date: appointment.date,
          time: appointment.time,
          duration_minutes: appointment.duration_minutes,
          provider: appointment.provider,
          resource_name: appointment.resource_name,
          status: appointment.status,
          service_type: appointment.service_type,
          notes: appointment.notes,
        },
        policy: { cancel_min_hours: CANCEL_MIN_HOURS, reschedule_min_hours: RESCHEDULE_MIN_HOURS }
      });
    }

    return Response.json({ success: false, error: 'Ação inválida.' }, { status: 400 });

  } catch (error) {
    console.error('manageAppointment error:', error.message);
    return Response.json({ success: false, error: 'Erro interno.' }, { status: 500 });
  }
});

function buildToken(appointment) {
  // token = appointmentId_last4ofPhone (simple but effective for patient-facing links)
  const phone = (appointment.patient_phone || '').replace(/\D/g, '');
  const last4 = phone.slice(-4) || '0000';
  return `${appointment.id}_${last4}`;
}

function timeToMin(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
