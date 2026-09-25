import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const primeos = createClientFromRequest(req);

    // Allow both scheduled (service role) and manual admin calls
    let isAdmin = false;
    try {
      const user = await primeos.auth.me();
      isAdmin = user?.role === 'admin';
    } catch (_) {
      isAdmin = true; // scheduled automation
    }

    if (!isAdmin) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = primeos.asServiceRole;

    const [rules, appointments, transactions, patients] = await Promise.all([
      db.entities.FollowUpRule.filter({ is_active: true }),
      db.entities.Appointment.list('-date', 500),
      db.entities.FinancialTransaction.filter({ type: 'receita' }, '-date', 500),
      db.entities.PatientRecord.list('-created_date', 1000),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const results = { sent: 0, skipped: 0, failed: 0, checkup_reminders: 0, staff_notified: 0, details: [] };

    const recentLogs = await db.entities.FollowUpLog.list('-created_date', 2000);
    const sentKeys = new Set(recentLogs.map(l => `${l.rule_id}:${l.reference_id}`));

    // ── Collect all upcoming checkups across all patients for staff digest ──
    const upcomingCheckups = [];

    for (const rule of rules) {
      const offset = rule.days_offset || 0;

      if (rule.trigger === 'appointment_reminder') {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + Math.abs(offset));
        const targetStr = targetDate.toISOString().split('T')[0];

        const targets = appointments.filter(a =>
          a.date === targetStr &&
          a.status !== 'cancelled' &&
          a.status !== 'completed' &&
          a.patient_email
        );

        for (const appt of targets) {
          const key = `${rule.id}:${appt.id}`;
          if (sentKeys.has(key)) { results.skipped++; continue; }

          const msg = buildMessage(rule.message_template, {
            nome: appt.patient_name,
            data: formatDate(appt.date),
            hora: appt.time || '',
            servico: appt.service_type?.replace(/_/g, ' ') || '',
          });

          const sent = await sendEmail(db, appt.patient_email, rule.subject || 'Lembrete de Consulta - Prime Odontologia', msg);
          await logSend(db, rule, appt.patient_name, appt.patient_email, appt.patient_phone, msg, sent ? 'sent' : 'failed', appt.id);
          sent ? results.sent++ : results.failed++;
          results.details.push({ patient: appt.patient_name, trigger: rule.trigger, status: sent ? 'sent' : 'failed' });
        }

      } else if (rule.trigger === 'post_consultation') {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() - Math.abs(offset));
        const targetStr = targetDate.toISOString().split('T')[0];

        const targets = appointments.filter(a =>
          a.date === targetStr &&
          a.status === 'completed' &&
          a.patient_email
        );

        for (const appt of targets) {
          const key = `${rule.id}:${appt.id}`;
          if (sentKeys.has(key)) { results.skipped++; continue; }

          const msg = buildMessage(rule.message_template, {
            nome: appt.patient_name,
            data: formatDate(appt.date),
            hora: appt.time || '',
            servico: appt.service_type?.replace(/_/g, ' ') || '',
          });

          const sent = await sendEmail(db, appt.patient_email, rule.subject || 'Como foi sua consulta? - Prime Odontologia', msg);
          await logSend(db, rule, appt.patient_name, appt.patient_email, appt.patient_phone, msg, sent ? 'sent' : 'failed', appt.id);
          sent ? results.sent++ : results.failed++;
          results.details.push({ patient: appt.patient_name, trigger: rule.trigger, status: sent ? 'sent' : 'failed' });
        }

      } else if (rule.trigger === 'overdue_payment') {
        const targets = transactions.filter(t => {
          if (!t.due_date || !t.patient_email) return false;
          if (t.status !== 'pendente' && t.status !== 'vencido') return false;
          const due = new Date(t.due_date);
          due.setHours(0, 0, 0, 0);
          const diffDays = Math.floor((today - due) / (1000 * 60 * 60 * 24));
          return diffDays === Math.abs(offset);
        });

        for (const tx of targets) {
          const key = `${rule.id}:${tx.id}`;
          if (sentKeys.has(key)) { results.skipped++; continue; }

          const msg = buildMessage(rule.message_template, {
            nome: tx.patient_name,
            valor: `R$ ${tx.amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            data: formatDate(tx.due_date),
            servico: tx.description || '',
          });

          const sent = await sendEmail(db, tx.patient_email, rule.subject || 'Pagamento Pendente - Prime Odontologia', msg);
          await logSend(db, rule, tx.patient_name, tx.patient_email, null, msg, sent ? 'sent' : 'failed', tx.id);
          sent ? results.sent++ : results.failed++;
          results.details.push({ patient: tx.patient_name, trigger: rule.trigger, status: sent ? 'sent' : 'failed' });
        }

      } else if (rule.trigger === 'inactive_patient') {
        const cutoff = new Date(today);
        cutoff.setDate(today.getDate() - Math.abs(offset));
        const cutoffStr = cutoff.toISOString().split('T')[0];

        const activePatientIds = new Set(
          appointments
            .filter(a => a.date >= cutoffStr)
            .map(a => a.patient_id || a.patient_name)
        );

        const inactivePatients = patients.filter(p =>
          p.patient_email &&
          !activePatientIds.has(p.id) &&
          !activePatientIds.has(p.patient_name)
        );

        for (const patient of inactivePatients.slice(0, 20)) {
          const key = `${rule.id}:${patient.id}`;
          if (sentKeys.has(key)) { results.skipped++; continue; }

          const msg = buildMessage(rule.message_template, {
            nome: patient.patient_name,
            data: formatDate(today.toISOString()),
          });

          const sent = await sendEmail(db, patient.patient_email, rule.subject || 'Sentimos sua falta! - Prime Odontologia', msg);
          await logSend(db, rule, patient.patient_name, patient.patient_email, patient.patient_phone, msg, sent ? 'sent' : 'failed', patient.id);
          sent ? results.sent++ : results.failed++;
          results.details.push({ patient: patient.patient_name, trigger: rule.trigger, status: sent ? 'sent' : 'failed' });
        }

      } else if (rule.trigger === 'checkup_reminder') {
        // ── CHECKUP SCHEDULE REMINDERS ──
        // Find patients with a checkup due within `offset` days
        const daysAhead = Math.abs(offset);
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + daysAhead);
        const targetStr = targetDate.toISOString().split('T')[0];

        for (const patient of patients) {
          if (!patient.checkup_schedule || !Array.isArray(patient.checkup_schedule)) continue;

          for (const checkup of patient.checkup_schedule) {
            if (!checkup.due_date || checkup.scheduled) continue; // skip already scheduled

            const dueDateStr = checkup.due_date.split('T')[0];
            if (dueDateStr !== targetStr) continue;

            const contactEmail = patient.patient_email;
            if (!contactEmail) continue;

            // Unique key: rule + patient + checkup due_date
            const key = `${rule.id}:${patient.id}_checkup_${dueDateStr}`;
            if (sentKeys.has(key)) { results.skipped++; continue; }

            const msg = buildMessage(rule.message_template, {
              nome: patient.patient_name,
              data: formatDate(checkup.due_date),
              hora: '',
              servico: checkup.service_type || 'Retorno preventivo',
              profissional: checkup.provider || '',
              intervalo: checkup.interval_months ? `${checkup.interval_months} meses` : '',
            });

            const sent = await sendEmail(
              db,
              contactEmail,
              rule.subject || 'Hora do seu retorno! - Prime Odontologia',
              msg
            );

            await logSend(db, rule, patient.patient_name, contactEmail, patient.patient_phone, msg, sent ? 'sent' : 'failed', `${patient.id}_checkup_${dueDateStr}`);
            sent ? results.sent++ : results.failed++;
            results.checkup_reminders++;

            // Collect for staff digest
            upcomingCheckups.push({
              patient_name: patient.patient_name,
              due_date: checkup.due_date,
              service_type: checkup.service_type || 'Retorno preventivo',
              provider: checkup.provider || 'N/A',
              notes: checkup.notes || '',
            });

            results.details.push({ patient: patient.patient_name, trigger: 'checkup_reminder', status: sent ? 'sent' : 'failed' });
          }
        }
      }

      // Update rule last_run
      await db.entities.FollowUpRule.update(rule.id, {
        last_run: new Date().toISOString(),
        total_sent: (rule.total_sent || 0) + results.sent,
      });
    }

    // ── STAFF NOTIFICATION: send a digest of all checkup reminders sent today ──
    if (upcomingCheckups.length > 0) {
      const staffNotified = await notifyStaff(db, upcomingCheckups, today);
      results.staff_notified = staffNotified;
    }

    console.log('Follow-up run complete:', results);
    return Response.json({ success: true, ...results });
  } catch (error) {
    console.error('processFollowUps error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function notifyStaff(db, checkups, today) {
  try {
    // Get admin users to notify
    const admins = await db.entities.User.filter({ role: 'admin' });
    if (!admins || admins.length === 0) return 0;

    const dateStr = today.toLocaleDateString('pt-BR');
    const rows = checkups.map(c =>
      `<tr style="border-bottom:1px solid #e2e8f0">
        <td style="padding:8px 12px;font-weight:600">${c.patient_name}</td>
        <td style="padding:8px 12px">${new Date(c.due_date).toLocaleDateString('pt-BR')}</td>
        <td style="padding:8px 12px">${c.service_type}</td>
        <td style="padding:8px 12px">${c.provider}</td>
        <td style="padding:8px 12px;color:#64748b;font-size:13px">${c.notes}</td>
      </tr>`
    ).join('');

    const body = `
      <div style="font-family:sans-serif;max-width:700px;margin:0 auto">
        <div style="background:#4f46e5;color:white;padding:20px 24px;border-radius:12px 12px 0 0">
          <h2 style="margin:0;font-size:20px">🔔 Relatório de Retornos Agendados</h2>
          <p style="margin:4px 0 0;opacity:.85">${dateStr} — ${checkups.length} paciente(s) notificado(s)</p>
        </div>
        <div style="background:#f8fafc;padding:20px 24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none">
          <p style="color:#475569">Os seguintes pacientes receberam lembretes de retorno preventivo hoje:</p>
          <table style="width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0">
            <thead>
              <tr style="background:#f1f5f9">
                <th style="padding:10px 12px;text-align:left;font-size:13px;color:#475569">Paciente</th>
                <th style="padding:10px 12px;text-align:left;font-size:13px;color:#475569">Data Retorno</th>
                <th style="padding:10px 12px;text-align:left;font-size:13px;color:#475569">Serviço</th>
                <th style="padding:10px 12px;text-align:left;font-size:13px;color:#475569">Profissional</th>
                <th style="padding:10px 12px;text-align:left;font-size:13px;color:#475569">Obs.</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <p style="color:#94a3b8;font-size:12px;margin-top:16px">
            ⚙️ Este email foi gerado automaticamente pelo sistema Prime Odontologia.
          </p>
        </div>
      </div>
    `;

    let notified = 0;
    for (const admin of admins) {
      if (!admin.email) continue;
      try {
        await db.integrations.Core.SendEmail({
          to: admin.email,
          subject: `[Prime Odontologia] ${checkups.length} retorno(s) programado(s) notificado(s) — ${dateStr}`,
          body,
          from_name: 'Prime Odontologia - Sistema',
        });
        notified++;
      } catch (err) {
        console.error('Staff notify failed:', admin.email, err.message);
      }
    }
    return notified;
  } catch (err) {
    console.error('notifyStaff error:', err.message);
    return 0;
  }
}

function buildMessage(template, vars) {
  let msg = template;
  for (const [key, val] of Object.entries(vars)) {
    msg = msg.replaceAll(`{${key}}`, val || '');
  }
  return msg;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR');
}

async function sendEmail(db, to, subject, body) {
  try {
    await db.integrations.Core.SendEmail({
      to,
      subject,
      body: body.replace(/\n/g, '<br>'),
      from_name: 'Prime Odontologia',
    });
    return true;
  } catch (err) {
    console.error('Email send failed:', to, err.message);
    return false;
  }
}

async function logSend(db, rule, patientName, patientEmail, patientPhone, msg, status, referenceId) {
  try {
    await db.entities.FollowUpLog.create({
      rule_id: rule.id,
      rule_name: rule.name,
      patient_name: patientName,
      patient_email: patientEmail || '',
      patient_phone: patientPhone || '',
      trigger: rule.trigger,
      channel: rule.channel || 'email',
      message_sent: msg.slice(0, 500),
      status,
      reference_id: String(referenceId),
    });
  } catch (err) {
    console.error('Log failed:', err.message);
  }
}
