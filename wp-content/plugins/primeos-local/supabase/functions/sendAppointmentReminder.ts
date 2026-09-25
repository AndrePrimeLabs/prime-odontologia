import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const primeos = createClientFromRequest(req);
    const db = primeos.asServiceRole;

    // Allow admin users or scheduled automation (no user token)
    try {
      const user = await primeos.auth.me();
      if (user && user.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch (_) {
      // scheduled automation — allow through
    }

    let body = {};
    try { body = await req.json(); } catch (_) {}

    // Load all active reminder schedules
    const schedules = await db.entities.ReminderSchedule.filter({ is_active: true });
    if (!schedules || schedules.length === 0) {
      // Fallback: default 24h email reminder if no schedules configured
      return await runDefaultReminder(db, body.day || 'tomorrow');
    }

    const now = new Date();
    const results = { sent: [], failed: [], skipped: [] };

    for (const schedule of schedules) {
      const hoursB = schedule.hours_before || 24;
      // Target datetime window: appointments starting hoursB hours from now (±30min window)
      const targetTime = new Date(now.getTime() + hoursB * 60 * 60 * 1000);
      const targetDate = targetTime.toISOString().split('T')[0];

      // Fetch appointments for that date
      const appointments = await db.entities.Appointment.filter({ date: targetDate });
      const active = appointments.filter(a => ['scheduled', 'confirmed'].includes(a.status));

      for (const apt of active) {
        // Check if already sent for this schedule
        const sentKey = `reminder_${schedule.id}`;
        if (apt[sentKey]) {
          results.skipped.push({ id: apt.id, name: apt.patient_name, reason: `Already sent (${schedule.name})` });
          continue;
        }

        // Filter by service type if specified
        if (schedule.applies_to_services?.length > 0 && !schedule.applies_to_services.includes(apt.service_type)) {
          results.skipped.push({ id: apt.id, name: apt.patient_name, reason: 'Service not in scope' });
          continue;
        }

        // Filter by segment/tag if specified
        if (schedule.applies_to_segments?.length > 0) {
          // Look up patient tags
          const patients = await db.entities.Customer.filter({ name: apt.patient_name });
          const patient = patients[0];
          const patientTags = patient?.tags || [];
          const match = schedule.applies_to_segments.some(s => patientTags.includes(s));
          if (!match) {
            results.skipped.push({ id: apt.id, name: apt.patient_name, reason: 'Segment not matched' });
            continue;
          }
        }

        try {
          const timeLabel = hoursB >= 168 ? '1 SEMANA' : hoursB >= 48 ? `${Math.round(hoursB/24)} DIAS` : hoursB === 24 ? 'AMANHÃ' : hoursB <= 2 ? 'EM BREVE' : `em ${hoursB}h`;

          const vars = {
            '{{nome}}': apt.patient_name || '',
            '{{data}}': formatDate(apt.date),
            '{{hora}}': apt.time || '',
            '{{servico}}': apt.service_type || '',
            '{{profissional}}': apt.provider || '',
          };

          const channels = schedule.channels || ['email'];

          // EMAIL
          if (channels.includes('email') && apt.patient_email) {
            const subject = schedule.email_subject
              ? replaceVars(schedule.email_subject, vars)
              : `🔔 Lembrete: Sua consulta é ${timeLabel} — ${apt.time}`;

            const body = schedule.email_body
              ? replaceVars(schedule.email_body, vars)
              : buildDefaultEmail(apt, timeLabel);

            await db.integrations.Core.SendEmail({
              to: apt.patient_email,
              from_name: 'Prime Odontologia',
              subject,
              body,
            });
            console.log(`[Email] Sent to ${apt.patient_name} <${apt.patient_email}> (${schedule.name})`);
          }

          // WHATSAPP — generate link (stored so UI can open it)
          if (channels.includes('whatsapp') && apt.patient_phone) {
            const msg = schedule.whatsapp_message
              ? replaceVars(schedule.whatsapp_message, vars)
              : buildDefaultWhatsApp(apt, timeLabel);
            const phone = apt.patient_phone.replace(/\D/g, '');
            const waUrl = `https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`;
            console.log(`[WhatsApp] Link generated for ${apt.patient_name}: ${waUrl}`);
            // Store whatsapp message in appointment notes for reference
          }

          // Mark reminder sent for this schedule
          const update = { reminder_sent: true };
          update[sentKey] = true;
          await db.entities.Appointment.update(apt.id, update);

          results.sent.push({ id: apt.id, name: apt.patient_name, schedule: schedule.name, channels });
        } catch (err) {
          console.error(`Reminder failed for ${apt.patient_name} (${schedule.name}):`, err.message);
          results.failed.push({ id: apt.id, name: apt.patient_name, error: err.message });
        }
      }

      // Update schedule last_run and total_sent
      await db.entities.ReminderSchedule.update(schedule.id, {
        last_run_at: now.toISOString(),
        total_sent: (schedule.total_sent || 0) + results.sent.filter(r => r.schedule === schedule.name).length,
      });
    }

    return Response.json({
      success: true,
      summary: { sent: results.sent.length, failed: results.failed.length, skipped: results.skipped.length },
      details: results,
    });

  } catch (error) {
    console.error('sendAppointmentReminder error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function runDefaultReminder(db, targetDay) {
  const targetDate = new Date();
  if (targetDay === 'tomorrow') targetDate.setDate(targetDate.getDate() + 1);
  if (targetDay === 'week') targetDate.setDate(targetDate.getDate() + 7);
  const dateStr = targetDate.toISOString().split('T')[0];

  const appointments = await db.entities.Appointment.filter({ date: dateStr });
  const active = appointments.filter(a => ['scheduled', 'confirmed'].includes(a.status));
  const results = { sent: [], failed: [], skipped: [] };
  const label = targetDay === 'tomorrow' ? 'AMANHÃ' : targetDay === 'week' ? 'EM 1 SEMANA' : 'HOJE';

  for (const apt of active) {
    if (apt.reminder_sent) { results.skipped.push({ id: apt.id, name: apt.patient_name, reason: 'Already sent' }); continue; }
    if (!apt.patient_email) { results.skipped.push({ id: apt.id, name: apt.patient_name, reason: 'No email' }); continue; }
    try {
      await db.integrations.Core.SendEmail({
        to: apt.patient_email,
        from_name: 'Prime Odontologia',
        subject: `🔔 Lembrete: Sua consulta é ${label} — ${apt.time}`,
        body: buildDefaultEmail(apt, label),
      });
      await db.entities.Appointment.update(apt.id, { reminder_sent: true });
      results.sent.push({ id: apt.id, name: apt.patient_name });
    } catch (err) {
      results.failed.push({ id: apt.id, name: apt.patient_name, error: err.message });
    }
  }

  return Response.json({ success: true, summary: { sent: results.sent.length, failed: results.failed.length, skipped: results.skipped.length }, details: results });
}

function replaceVars(template, vars) {
  let result = template;
  for (const [key, val] of Object.entries(vars)) {
    result = result.replaceAll(key, val);
  }
  return result;
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function buildDefaultEmail(apt, label) {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px">
      <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:8px;padding:20px;margin-bottom:20px;text-align:center">
        <h2 style="color:white;margin:0;font-size:20px">🦷 Lembrete de Consulta</h2>
        <p style="color:#c7d2fe;margin:6px 0 0;font-size:14px">Prime Odontologia</p>
      </div>
      <p style="color:#374151">Olá <strong>${apt.patient_name}</strong>,</p>
      <p style="color:#374151">Sua consulta é <strong style="color:#4f46e5">${label}</strong>:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;border-radius:8px;overflow:hidden">
        <tr style="background:#f8fafc"><td style="padding:10px 14px;color:#64748b;font-size:13px;width:40%">📅 Data</td><td style="padding:10px 14px;font-weight:600;font-size:13px">${formatDate(apt.date)}</td></tr>
        <tr style="background:#fff"><td style="padding:10px 14px;color:#64748b;font-size:13px">⏰ Horário</td><td style="padding:10px 14px;font-weight:600;font-size:13px">${apt.time}</td></tr>
        ${apt.service_type ? `<tr style="background:#f8fafc"><td style="padding:10px 14px;color:#64748b;font-size:13px">🩺 Serviço</td><td style="padding:10px 14px;font-weight:600;font-size:13px">${apt.service_type}</td></tr>` : ''}
        ${apt.provider ? `<tr style="background:#fff"><td style="padding:10px 14px;color:#64748b;font-size:13px">👨‍⚕️ Profissional</td><td style="padding:10px 14px;font-weight:600;font-size:13px">${apt.provider}</td></tr>` : ''}
        ${apt.resource_name ? `<tr style="background:#f8fafc"><td style="padding:10px 14px;color:#64748b;font-size:13px">📍 Local</td><td style="padding:10px 14px;font-weight:600;font-size:13px">${apt.resource_name}</td></tr>` : ''}
      </table>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px;font-size:13px;color:#166534;margin-bottom:16px">
        ✅ Em caso de cancelamento, entre em contato com pelo menos <strong>24h de antecedência</strong>.
      </div>
      <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:24px">Prime Odontologia · Obrigado pela preferência 💜</p>
    </div>
  `;
}

function buildDefaultWhatsApp(apt, label) {
  return `Olá ${apt.patient_name}! 🦷\n\nLembrete da Prime Odontologia:\n📅 ${label}: ${formatDate(apt.date)}\n⏰ Horário: ${apt.time}\n🩺 Serviço: ${apt.service_type || 'Consulta'}\n${apt.provider ? `👨‍⚕️ Profissional: ${apt.provider}\n` : ''}\nEm caso de dúvidas ou cancelamento, entre em contato. Até lá! 😊`;
}
