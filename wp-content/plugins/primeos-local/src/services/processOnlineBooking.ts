import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const primeos = createClientFromRequest(req);
    const data = await req.json();

    if (!data.patient_name || !data.patient_phone || !data.date || !data.time) {
      return Response.json({ success: false, error: 'Dados incompletos' }, { status: 400 });
    }

    const db = primeos.asServiceRole;

    // Check for conflicts – if dentist_id provided, check only that dentist's slots; else check all
    const filter = { date: data.date };
    const existing = await db.entities.Appointment.filter(filter);

    const slotStart = timeToMin(data.time);
    const slotEnd = slotStart + (data.duration_minutes || 30);

    const conflicting = existing.filter(a => {
      if (a.status === 'cancelled') return false;
      if (data.dentist_id && a.dentist_id && a.dentist_id !== data.dentist_id) return false;
      if (!a.time) return false;
      const aStart = timeToMin(a.time);
      const aEnd = aStart + (a.duration_minutes || 30);
      return slotStart < aEnd && slotEnd > aStart;
    });

    if (conflicting.length > 0) {
      return Response.json({
        success: false,
        error: 'Este horário não está mais disponível. Por favor, escolha outro.'
      });
    }

    // Auto-assign dentist if not specified
    let assignedDentist = data.dentist_id || null;
    let assignedProvider = data.provider || null;

    if (!assignedDentist) {
      const activeDentists = await db.entities.Dentist.filter({ is_active: true });
      const busyDentistIds = new Set(
        existing.filter(a => a.status !== 'cancelled' && a.dentist_id && isOverlapping(a, slotStart, slotEnd))
              .map(a => a.dentist_id)
      );
      const available = activeDentists.find(d => !busyDentistIds.has(d.id));
      if (available) {
        assignedDentist = available.id;
        assignedProvider = available.name;
      }
    }

    // Verify resource availability if requested
    if (data.resource_id) {
      const resourceConflict = existing.filter(a => {
        if (a.resource_id !== data.resource_id || a.status === 'cancelled' || !a.time) return false;
        const rStart = timeToMin(a.time);
        const rEnd = rStart + (a.duration_minutes || 30);
        return slotStart < rEnd && slotEnd > rStart;
      });
      if (resourceConflict.length > 0) {
        return Response.json({
          success: false,
          error: 'O recurso selecionado já está ocupado neste horário. Por favor, escolha outro local.'
        });
      }
    }

    // Auto-assign resource if not specified
    let assignedResource = data.resource_id || null;
    let assignedResourceName = data.resource_name || null;
    if (!assignedResource) {
      const allResources = await db.entities.Resource.filter({ is_active: true });
      const chairs = allResources.filter(r => r.type === 'cadeira' || r.type === 'sala');
      const busyResourceIds = new Set(
        existing.filter(a => a.status !== 'cancelled' && a.resource_id && isOverlapping(a, slotStart, slotEnd))
              .map(a => a.resource_id)
      );
      const freeChair = chairs.find(c => !busyResourceIds.has(c.id));
      if (freeChair) {
        assignedResource = freeChair.id;
        assignedResourceName = freeChair.name;
      }
    }

    // Create appointment
    const noteWithReason = [data.reason ? `Motivo: ${data.reason}` : '', data.notes || ''].filter(Boolean).join('\n');
    const appointment = await db.entities.Appointment.create({
      patient_name: data.patient_name,
      patient_phone: data.patient_phone,
      service_type: data.service_type || 'consultation',
      date: data.date,
      time: data.time,
      duration_minutes: data.duration_minutes || 30,
      dentist_id: assignedDentist,
      provider: assignedProvider,
      resource_id: assignedResource,
      resource_name: assignedResourceName,
      status: 'scheduled',
      notes: noteWithReason,
      reminder_sent: false,
      reminder_confirmed: 'pending',
    });

    console.log(`Appointment created: ${appointment.id} | ${data.patient_name} | ${data.date} ${data.time} | dentist: ${assignedProvider}`);

    // Notify admin by email
    try {
      const adminUsers = await db.entities.User.filter({ role: 'admin' });
      for (const admin of adminUsers) {
        if (admin.email) {
          await db.integrations.Core.SendEmail({
            to: admin.email,
            from_name: 'Prime Odontologia - Sistema',
            subject: `📅 Novo Agendamento: ${data.patient_name} - ${formatDate(data.date)} às ${data.time}`,
            body: `
              <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px">
                <h2 style="color:#4f46e5;margin-top:0">Novo Agendamento Recebido 📅</h2>
                <table style="width:100%;border-collapse:collapse;margin:16px 0">
                  <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px">Paciente</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600">${data.patient_name}</td></tr>
                  <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px">Telefone</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600">${data.patient_phone}</td></tr>
                  ${data.patient_email ? `<tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px">Email</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600">${data.patient_email}</td></tr>` : ''}
                  <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px">Data</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600">${formatDate(data.date)}</td></tr>
                  <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px">Horário</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600">${data.time} (${data.duration_minutes || 30} min)</td></tr>
                  ${data.reason ? `<tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px">Motivo</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600">${data.reason}</td></tr>` : ''}
                  ${assignedProvider ? `<tr><td style="padding:8px 0;color:#64748b;font-size:13px">Profissional</td><td style="padding:8px 0;font-weight:600">${assignedProvider}</td></tr>` : ''}
                </table>
              </div>
            `
          });
        }
      }
      console.log(`Admin notifications sent to ${adminUsers.length} admin(s)`);
    } catch (adminEmailErr) {
      console.error('Admin notification error:', adminEmailErr.message);
    }

    // Build patient self-service token
    const phone = (data.patient_phone || '').replace(/\D/g, '');
    const last4 = phone.slice(-4) || '0000';
    const selfServiceToken = `${appointment.id}_${last4}`;
    const appBaseUrl = `https://${Deno.env.get('PRIMEOS_APP_ID')}.primeos.app`;
    const manageLink = `${appBaseUrl}/MeuAgendamento?token=${selfServiceToken}`;

    // Send confirmation email
    if (data.patient_email) {
      try {
        await db.integrations.Core.SendEmail({
          to: data.patient_email,
          from_name: 'Prime Odontologia',
          subject: '✅ Consulta Agendada - Prime Odontologia',
          body: `
          <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px">
          <h2 style="color:#4f46e5;margin-top:0">Agendamento Confirmado! 🦷</h2>
          <p>Olá <strong>${data.patient_name}</strong>, sua consulta foi agendada com sucesso.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            ${data.reason ? `<tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px">Motivo</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600">${data.reason}</td></tr>` : ''}
            <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px">Data</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600">${formatDate(data.date)}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px">Horário</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600">${data.time}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px">Duração</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600">${data.duration_minutes} minutos</td></tr>
            ${assignedProvider ? `<tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px">Profissional</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600">${assignedProvider}</td></tr>` : ''}
            ${assignedResourceName ? `<tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px">Local</td><td style="padding:8px 0;font-weight:600">${assignedResourceName}</td></tr>` : ''}
          </table>
              <div style="background:#f8fafc;border-radius:8px;padding:12px;font-size:13px;color:#475569">
                <p style="margin:0 0 4px"><strong>Observações:</strong></p>
                <ul style="margin:0;padding-left:16px">
                  <li>Chegue 10 minutos antes</li>
                  <li>Traga documento com foto</li>
                  <li>Cancelamentos com pelo menos 24h de antecedência</li>
                </ul>
              </div>
              <div style="margin-top:16px;text-align:center">
                <a href="${manageLink}" style="display:inline-block;background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
                  📅 Cancelar ou Reagendar
                </a>
                <p style="margin-top:8px;font-size:11px;color:#94a3b8">Este link é pessoal. Não compartilhe com terceiros.</p>
              </div>
              <p style="margin-top:16px;color:#94a3b8;font-size:12px">Prime Odontologia · Responda este email para dúvidas</p>
            </div>
          `
        });
        console.log(`Confirmation email sent to ${data.patient_email}`);
      } catch (emailErr) {
        console.error('Email error:', emailErr.message);
      }
    }

    return Response.json({
      success: true,
      appointment_id: appointment.id,
      dentist: assignedProvider,
      message: 'Agendamento realizado com sucesso!'
    });

  } catch (error) {
    console.error('Booking error:', error.message);
    return Response.json({ success: false, error: 'Erro ao processar agendamento.' }, { status: 500 });
  }
});

function timeToMin(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function isOverlapping(a, slotStart, slotEnd) {
  const aStart = timeToMin(a.time);
  const aEnd = aStart + (a.duration_minutes || 30);
  return slotStart < aEnd && slotEnd > aStart;
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
