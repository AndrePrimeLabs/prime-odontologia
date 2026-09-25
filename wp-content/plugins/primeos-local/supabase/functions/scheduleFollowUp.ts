import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const primeos = createClientFromRequest(req);
    const { event, data } = await req.json();

    // Only process completed appointments
    if (event.type !== 'update' || data.status !== 'completed') {
      return Response.json({ 
        success: true, 
        message: 'Not a completed appointment, skipping' 
      });
    }

    // Check if follow-up is needed
    if (!data.follow_up_days || data.follow_up_days === 0) {
      return Response.json({ 
        success: true, 
        message: 'No follow-up required' 
      });
    }

    // Calculate follow-up date
    const appointmentDate = new Date(data.date);
    const followUpDate = new Date(appointmentDate);
    followUpDate.setDate(followUpDate.getDate() + data.follow_up_days);
    const followUpDateStr = followUpDate.toISOString().split('T')[0];

    // Create follow-up record
    const followUp = await primeos.asServiceRole.entities.FollowUp.create({
      patient_id: data.patient_id,
      patient_name: data.patient_name,
      patient_phone: data.patient_phone,
      type: 'post_appointment',
      status: 'pending',
      due_date: followUpDateStr,
      priority: 'medium',
      contact_method: 'whatsapp',
      notes: `Follow-up após ${data.service_type} - ${data.notes || ''}`,
      original_appointment_id: data.id
    });

    return Response.json({
      success: true,
      message: 'Follow-up agendado com sucesso',
      followUp,
      dueDate: followUpDateStr
    });

  } catch (error) {
    console.error('Schedule follow-up error:', error);
    return Response.json({ 
      error: error.message || 'Erro ao agendar follow-up'
    }, { status: 500 });
  }
});
