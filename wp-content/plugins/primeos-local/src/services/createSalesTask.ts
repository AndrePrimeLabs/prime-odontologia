import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const primeos = createClientFromRequest(req);
    const { leadId, leadName, leadEmail, leadPhone, score, priority } = await req.json();

    // Check if a task already exists for this lead
    const existingTasks = await primeos.asServiceRole.entities.Task.filter({
      titulo: `Follow-up: ${leadName}`
    });

    if (existingTasks.length > 0) {
      console.log(`Task already exists for lead ${leadName}`);
      return Response.json({ 
        success: true, 
        message: 'Task already exists',
        taskExists: true
      });
    }

    // Get all users to assign task to sales team
    const users = await primeos.asServiceRole.entities.User.list();
    const salesUsers = users.filter(u => u.email && !u.email.includes('admin'));
    
    const assignedTo = salesUsers.length > 0 ? [salesUsers[0].email] : [];

    // Create task
    const taskData = {
      titulo: `Follow-up: ${leadName}`,
      descricao: `Lead qualificado com score ${score}/100.\n\nContato: ${leadEmail || ''}\nTelefone: ${leadPhone || ''}\n\nAção: Entrar em contato para conversão`,
      categoria: 'marketing',
      prioridade: priority || 'alta',
      status: 'pendente',
      responsaveis: assignedTo,
      data_vencimento: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
      checklist: [
        { item: 'Entrar em contato via telefone', concluido: false },
        { item: 'Enviar proposta personalizada', concluido: false },
        { item: 'Agendar reunião', concluido: false },
        { item: 'Registrar feedback', concluido: false }
      ]
    };

    const task = await primeos.asServiceRole.entities.Task.create(taskData);

    console.log(`Task created for lead ${leadName}: ${task.id}`);

    return Response.json({ 
      success: true,
      taskId: task.id,
      message: `Task created for high-score lead`
    });

  } catch (error) {
    console.error('Error creating sales task:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});
