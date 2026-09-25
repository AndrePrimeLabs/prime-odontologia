import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const primeos = createClientFromRequest(req);
    const user = await primeos.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reportName, reportType, frequency, time, filters, recipients, format } = await req.json();

    if (!reportName || !reportType || !frequency) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create report schedule
    const schedule = await primeos.entities.ReportSchedule.create({
      user_email: user.email,
      report_name: reportName,
      report_type: reportType,
      frequency,
      time: time || '09:00',
      filters: filters || {},
      recipients: recipients || [user.email],
      format: format || 'pdf',
      is_active: true
    });

    // Award points for scheduling a report
    await primeos.functions.invoke('awardPoints', {
      action: 'report_generated',
      metadata: { bonus_multiplier: 1.5 }
    });

    return Response.json({ 
      success: true, 
      data: schedule,
      message: 'Relatório agendado com sucesso! +37 pontos'
    });

  } catch (error) {
    console.error('Schedule Report Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
