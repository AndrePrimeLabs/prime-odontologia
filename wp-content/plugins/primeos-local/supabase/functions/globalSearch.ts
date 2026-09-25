import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const primeos = createClientFromRequest(req);
    const user = await primeos.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query } = await req.json();

    if (!query || query.length < 2) {
      return Response.json({ results: [] });
    }

    const searchTerm = query.toLowerCase();
    const results = [];

    // Search Leads
    try {
      const leads = await primeos.entities.Lead.list();
      const matchedLeads = leads.filter(l => 
        l.name?.toLowerCase().includes(searchTerm) ||
        l.email?.toLowerCase().includes(searchTerm) ||
        l.phone?.includes(searchTerm) ||
        l.notas?.toLowerCase().includes(searchTerm) ||
        l.id?.includes(searchTerm)
      ).slice(0, 5);

      matchedLeads.forEach(lead => {
        results.push({
          id: lead.id,
          type: 'Lead',
          title: lead.name,
          subtitle: lead.email || lead.phone,
          status: lead.status,
          page: 'LeadsPipeline',
          icon: 'user'
        });
      });
    } catch (e) {
      console.error('Error searching leads:', e);
    }

    // Search Customers
    try {
      const customers = await primeos.entities.Customer.list();
      const matchedCustomers = customers.filter(c => 
        c.name?.toLowerCase().includes(searchTerm) ||
        c.email?.toLowerCase().includes(searchTerm) ||
        c.phone?.includes(searchTerm) ||
        c.notes?.toLowerCase().includes(searchTerm) ||
        c.id?.includes(searchTerm)
      ).slice(0, 5);

      matchedCustomers.forEach(customer => {
        results.push({
          id: customer.id,
          type: 'Customer',
          title: customer.name,
          subtitle: customer.email || customer.company,
          status: customer.status,
          page: 'CRM',
          icon: 'user'
        });
      });
    } catch (e) {
      console.error('Error searching customers:', e);
    }

    // Search Appointments
    try {
      const appointments = await primeos.entities.Appointment.list();
      const matchedAppointments = appointments.filter(a => 
        a.patient_name?.toLowerCase().includes(searchTerm) ||
        a.patient_phone?.includes(searchTerm) ||
        a.notes?.toLowerCase().includes(searchTerm) ||
        a.id?.includes(searchTerm)
      ).slice(0, 5);

      matchedAppointments.forEach(apt => {
        results.push({
          id: apt.id,
          type: 'Appointment',
          title: apt.patient_name,
          subtitle: `${apt.service_type} - ${apt.date}`,
          status: apt.status,
          page: 'Agenda',
          icon: 'calendar'
        });
      });
    } catch (e) {
      console.error('Error searching appointments:', e);
    }

    // Search Tasks
    try {
      const tasks = await primeos.entities.Task.list();
      const matchedTasks = tasks.filter(t => 
        t.titulo?.toLowerCase().includes(searchTerm) ||
        t.descricao?.toLowerCase().includes(searchTerm) ||
        t.observacoes?.toLowerCase().includes(searchTerm) ||
        t.id?.includes(searchTerm)
      ).slice(0, 5);

      matchedTasks.forEach(task => {
        results.push({
          id: task.id,
          type: 'Task',
          title: task.titulo,
          subtitle: task.descricao?.substring(0, 60),
          status: task.status,
          page: 'Tasks',
          icon: 'check'
        });
      });
    } catch (e) {
      console.error('Error searching tasks:', e);
    }

    // Search POPs
    try {
      const pops = await primeos.entities.POP.list();
      const matchedPops = pops.filter(p => 
        p.nome?.toLowerCase().includes(searchTerm) ||
        p.codigo?.toLowerCase().includes(searchTerm) ||
        p.descricao?.toLowerCase().includes(searchTerm) ||
        p.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      ).slice(0, 5);

      matchedPops.forEach(pop => {
        results.push({
          id: pop.id,
          type: 'POP',
          title: `${pop.codigo} - ${pop.nome}`,
          subtitle: pop.categoria,
          status: pop.status,
          page: 'POPs',
          icon: 'file'
        });
      });
    } catch (e) {
      console.error('Error searching POPs:', e);
    }

    return Response.json({ results: results.slice(0, 20) });

  } catch (error) {
    console.error('Error in global search:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});
