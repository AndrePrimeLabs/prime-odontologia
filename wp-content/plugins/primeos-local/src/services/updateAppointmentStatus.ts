import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const supabase = createClientFromRequest(req);
    const { event, data, old_data } = await req.json();

    if (!data?.id) {
      return Response.json({ error: 'Appointment ID required' }, { status: 400 });
    }

    const now = new Date();
    const appointmentDate = new Date(data.date);
    const hoursDiff = (now - appointmentDate) / (1000 * 60 * 60);

    // Auto-update status based on timing
    let newStatus = data.status;
    let shouldUpdate = false;

    // If appointment is in the past and still scheduled, mark as no_show
    if (hoursDiff > 2 && data.status === 'scheduled') {
      newStatus = 'no_show';
      shouldUpdate = true;
    }

    // If appointment is confirmed and past, mark as completed
    if (hoursDiff > 0.5 && data.status === 'confirmed') {
      newStatus = 'completed';
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      await primeos.asServiceRole.entities.Appointment.update(data.id, {
        status: newStatus
      });

      console.log(`Appointment ${data.id} status updated to ${newStatus}`);
    }

    // Create follow-up task if appointment completed
    if (newStatus === 'completed' && data.patient_id) {
      const followUpDate = new Date(appointmentDate);
      followUpDate.setDate(followUpDate.getDate() + 7); // 7 days after

      await primeos.asServiceRole.entities.Task.create({
        titulo: `Follow-up: ${data.patient_name}`,
        descricao: `Acompanhamento pós-consulta de ${data.service_type}`,
        categoria: 'clinico',
        prioridade: 'media',
        status: 'pendente',
        data_vencimento: followUpDate.toISOString(),
        checklist: [
          { item: 'Verificar satisfação', concluido: false },
          { item: 'Avaliar necessidade de retorno', concluido: false }
        ]
      });
    }

    // Update customer interaction log
    if (data.patient_id && event.type === 'update') {
      await primeos.asServiceRole.entities.Interaction.create({
        customer_id: data.patient_id,
        type: 'meeting',
        subject: `Consulta: ${data.service_type}`,
        description: `Status: ${newStatus}`,
        outcome: newStatus === 'completed' ? 'positive' : newStatus === 'no_show' ? 'negative' : 'neutral'
      });
    }

    return Response.json({ 
      success: true,
      statusUpdated: shouldUpdate,
      newStatus
    });

  } catch (error) {
    console.error('Error updating appointment status:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});
