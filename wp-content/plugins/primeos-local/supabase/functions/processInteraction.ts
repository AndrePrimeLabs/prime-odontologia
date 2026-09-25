import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const primeos = createClientFromRequest(req);
    const { event, data } = await req.json();

    if (!data?.customer_id) {
      return Response.json({ error: 'Customer ID required' }, { status: 400 });
    }

    // Update customer last contact date
    await primeos.asServiceRole.entities.Customer.update(data.customer_id, {
      last_contact_date: new Date().toISOString()
    });

    // If interaction has next action, create a task
    if (data.next_action && data.next_action_date) {
      const existingTasks = await primeos.asServiceRole.entities.Task.filter({
        titulo: data.next_action
      });

      if (existingTasks.length === 0) {
        await primeos.asServiceRole.entities.Task.create({
          titulo: data.next_action,
          descricao: `Ação de follow-up para ${data.customer_id}`,
          categoria: 'administrativo',
          prioridade: data.outcome === 'negative' ? 'alta' : 'media',
          status: 'pendente',
          data_vencimento: data.next_action_date
        });
      }
    }

    // Update lead if interaction is with a lead
    const leads = await primeos.asServiceRole.entities.Lead.filter({
      email: data.customer_id
    });

    if (leads.length > 0) {
      const lead = leads[0];
      // Trigger lead scoring update
      await primeos.asServiceRole.functions.invoke('calculateLeadScore', {
        event: { type: 'update' },
        data: lead
      });
    }

    console.log(`Interaction processed for customer ${data.customer_id}`);

    return Response.json({ 
      success: true,
      message: 'Interaction processed successfully'
    });

  } catch (error) {
    console.error('Error processing interaction:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});
