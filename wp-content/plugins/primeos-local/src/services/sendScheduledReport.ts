import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const supabase = createClientFromRequest(req);

    // Fetch all active schedules
    const { data: schedules } = await supabase.from('report_schedules').select('*');
    const activeSchedules = (schedules || []).filter(s => s.is_active);

    const now = new Date();
    const dayOfWeek = now.getDay();
    const dayOfMonth = now.getDate();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                       now.getMinutes().toString().padStart(2, '0');

    let sentCount = 0;

    for (const schedule of activeSchedules) {
      let shouldSend = false;

      if (schedule.frequency === 'daily') {
        shouldSend = currentTime === schedule.time;
      } else if (schedule.frequency === 'weekly' && schedule.day_of_week === dayOfWeek) {
        shouldSend = currentTime === schedule.time;
      } else if (schedule.frequency === 'monthly' && schedule.day_of_month === dayOfMonth) {
        shouldSend = currentTime === schedule.time;
      }

      if (shouldSend) {
        // Fetch data for report
        const sales = await primeos.asServiceRole.entities.Sale.list();
        const leads = await primeos.asServiceRole.entities.Lead.list();
        const interactions = await primeos.asServiceRole.entities.Interaction.list();

        // Filter data
        const reportData = sales.map(s => ({
          date: new Date(s.created_date).toLocaleDateString('pt-BR'),
          customer: s.customer_name,
          value: s.total_amount,
          channel: s.channel,
          status: s.status
        }));

        // Send email to recipients
        const emailContent = `
Relatório: ${schedule.report_name}
Tipo: ${schedule.report_type}
Data: ${new Date().toLocaleDateString('pt-BR')}

Total de registros: ${reportData.length}

Este relatório foi gerado automaticamente.
        `;

        for (const recipient of schedule.recipients) {
          await primeos.integrations.Core.SendEmail({
            to: recipient,
            subject: `${schedule.report_name} - ${new Date().toLocaleDateString('pt-BR')}`,
            body: emailContent
          });
        }

        // Update schedule
        await primeos.asServiceRole.entities.ReportSchedule.update(schedule.id, {
          last_sent: new Date().toISOString(),
          send_count: (schedule.send_count || 0) + 1
        });

        sentCount++;
      }
    }

    return Response.json({ 
      success: true, 
      message: `${sentCount} relatórios enviados`
    });

  } catch (error) {
    console.error('Send Scheduled Report Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
