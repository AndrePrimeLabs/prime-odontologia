import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const supabase = createClientFromRequest(req);
    
    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);

    // Get all scheduled/confirmed appointments for today
    const { data: appointments } = await supabase.from('appointments').select('*')
      .eq('date', currentDate)
      .in('status', ['scheduled', 'confirmed'])
      .eq('reminder_sent', false);

    const remindersToSend = [];
    
    for (const apt of appointments) {
      if (!apt.time || !apt.reminder_time_minutes) continue;

      // Calculate reminder time
      const [aptHour, aptMin] = apt.time.split(':').map(Number);
      const appointmentMinutes = aptHour * 60 + aptMin;
      const currentMinutes = parseInt(currentTime.split(':')[0]) * 60 + parseInt(currentTime.split(':')[1]);
      const minutesUntilAppointment = appointmentMinutes - currentMinutes;

      // Check if it's time to send reminder
      if (minutesUntilAppointment <= apt.reminder_time_minutes && minutesUntilAppointment > 0) {
        remindersToSend.push(apt);
      }
    }

    const results = {
      sent: [],
      failed: [],
      total: remindersToSend.length
    };

    for (const apt of remindersToSend) {
      try {
        // Send email reminder
        if (apt.customer_email) {
          await primeos.asServiceRole.integrations.Core.SendEmail({
            to: apt.customer_email,
            subject: `Lembrete: ${apt.title}`,
            body: `
              <h2>Lembrete de Agendamento</h2>
              <p>Olá ${apt.customer_name},</p>
              <p>Este é um lembrete do seu agendamento:</p>
              <ul>
                <li><strong>Título:</strong> ${apt.title}</li>
                <li><strong>Data:</strong> ${new Date(apt.date).toLocaleDateString('pt-BR')}</li>
                <li><strong>Horário:</strong> ${apt.time}</li>
                <li><strong>Duração:</strong> ${apt.duration_minutes} minutos</li>
                ${apt.location ? `<li><strong>Local:</strong> ${apt.location}</li>` : ''}
                ${apt.description ? `<li><strong>Descrição:</strong> ${apt.description}</li>` : ''}
              </ul>
              <p>Nos vemos em breve!</p>
            `
          });
        }

        // Mark reminder as sent
        await primeos.asServiceRole.entities.CRMAppointment.update(apt.id, {
          ...apt,
          reminder_sent: true
        });

        results.sent.push({
          id: apt.id,
          customer: apt.customer_name,
          title: apt.title,
          time: apt.time
        });
      } catch (error) {
        results.failed.push({
          id: apt.id,
          customer: apt.customer_name,
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      message: `Processed ${results.total} reminders`,
      results
    });

  } catch (error) {
    console.error('Error sending CRM reminders:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});
