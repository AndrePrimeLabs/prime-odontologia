import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const supabase = createClientFromRequest(req);
    const { data: { user } } = await supabase.auth.getUser();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Find all pending follow-ups due today
    const { data: followUps } = await supabase.from('follow_ups').select('*')
      .eq('due_date', today)
      .eq('status', 'pending');

    const results = {
      sent: [],
      failed: [],
      skipped: []
    };

    for (const followUp of followUps) {
      if (!followUp.patient_phone) {
        results.skipped.push({
          followUp_id: followUp.id,
          patient_name: followUp.patient_name,
          reason: 'No phone number'
        });
        continue;
      }

      try {
        // Send WhatsApp reminder
        // In production, integrate with WhatsApp API
        const message = `Olá ${followUp.patient_name}! 👋

Passando para lembrar do seu retorno na Prime Odontologia. 🦷

Como você está se sentindo após o procedimento? 

Para agendar seu retorno, clique aqui ou responda esta mensagem. 📅✨`;

        // Update follow-up status
        await primeos.asServiceRole.entities.FollowUp.update(followUp.id, {
          status: 'contacted',
          message_sent: message
        });

        results.sent.push({
          followUp_id: followUp.id,
          patient_name: followUp.patient_name,
          phone: followUp.patient_phone
        });

      } catch (error) {
        results.failed.push({
          followUp_id: followUp.id,
          patient_name: followUp.patient_name,
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      date: today,
      summary: {
        sent: results.sent.length,
        failed: results.failed.length,
        skipped: results.skipped.length
      },
      details: results
    });

  } catch (error) {
    console.error('Send follow-up reminders error:', error);
    return Response.json({ 
      error: error.message || 'Erro ao enviar lembretes de follow-up'
    }, { status: 500 });
  }
});
