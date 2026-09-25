import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const primeos = createClientFromRequest(req);

    // Allow both authenticated calls and scheduled automation calls
    let isScheduled = false;
    try {
      const user = await primeos.auth.me();
      if (user?.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch (_e) {
      // Called from automation (no user token) - proceed as service role
      isScheduled = true;
    }

    const client = isScheduled ? primeos.asServiceRole : primeos;

    // Get all completed appointments with pending payment
    const allAppointments = await client.entities.Appointment.list();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const results = { sent: [], skipped: [], errors: [] };

    for (const apt of allAppointments) {
      if (apt.status !== 'completed') continue;
      if (!apt.price || apt.price <= 0) continue;
      if (apt.payment_status === 'paid' || apt.payment_status === 'waived') continue;

      const aptDate = new Date(apt.date);
      aptDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today - aptDate) / (1000 * 60 * 60 * 24));

      // Send reminders at: 3 days, 7 days, 14 days after consultation
      const reminderDays = [3, 7, 14];
      if (!reminderDays.includes(daysDiff)) {
        results.skipped.push({ id: apt.id, reason: `daysDiff=${daysDiff} not in trigger days` });
        continue;
      }

      const phone = apt.patient_phone?.replace(/\D/g, '');
      const hasPhone = phone && phone.length >= 10;
      const hasEmail = apt.patient_email;

      if (!hasPhone && !hasEmail) {
        results.skipped.push({ id: apt.id, reason: 'no contact info' });
        continue;
      }

      const fmtBRL = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`;
      const msgLabel = daysDiff === 3 ? 'lembrete' : daysDiff === 7 ? '2º lembrete' : 'último aviso';

      const whatsappMsg = `Olá ${apt.patient_name}! 👋\n\nPassamos para enviar um ${msgLabel} sobre o pagamento da sua consulta realizada em ${apt.date}.\n\n💰 Valor: ${fmtBRL(apt.price)}\n📋 Serviço: ${apt.service_type}\n\nPor favor, entre em contato para regularizar. Obrigado! 🦷`;

      const whatsappLink = hasPhone ? `https://wa.me/55${phone}?text=${encodeURIComponent(whatsappMsg)}` : null;

      // Send email if available
      if (hasEmail) {
        try {
          await client.integrations.Core.SendEmail({
            to: apt.patient_email,
            subject: `Lembrete de pagamento - Consulta ${apt.date}`,
            body: `<p>Olá ${apt.patient_name},</p>
<p>Este é um ${msgLabel} referente ao pagamento da sua consulta realizada em <strong>${apt.date}</strong>.</p>
<p><strong>Valor em aberto: ${fmtBRL(apt.price)}</strong></p>
<p>Por favor, entre em contato conosco para regularizar o pagamento.</p>
<p>Atenciosamente,<br/>Prime Odontologia</p>`
          });
        } catch (emailErr) {
          console.error('Email send error:', emailErr.message);
        }
      }

      // Log the follow-up
      await client.entities.FollowUpLog.create({
        rule_name: `Cobrança automática (${msgLabel})`,
        patient_name: apt.patient_name,
        patient_email: apt.patient_email || '',
        patient_phone: apt.patient_phone || '',
        trigger: `payment_pending_${daysDiff}d`,
        channel: hasPhone ? 'whatsapp_link' : 'email',
        message_sent: whatsappMsg,
        status: 'sent',
        reference_id: apt.id
      });

      results.sent.push({
        id: apt.id,
        patient: apt.patient_name,
        daysDiff,
        amount: apt.price,
        whatsappLink,
        emailSent: !!hasEmail
      });
    }

    console.log(`Payment follow-up done: ${results.sent.length} sent, ${results.skipped.length} skipped`);

    return Response.json({
      success: true,
      summary: { sent: results.sent.length, skipped: results.skipped.length },
      results
    });

  } catch (error) {
    console.error('paymentFollowUp error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
