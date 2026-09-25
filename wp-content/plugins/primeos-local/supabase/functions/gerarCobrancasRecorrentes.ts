import { createPrimeosClientFromRequest } from './primeosClient.ts';

// Cria próxima parcela de despesas recorrentes que venceram
Deno.serve(async (req) => {
  try {
    const primeos = createClientFromRequest(req);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const all = await primeos.asServiceRole.entities.FinancialTransaction.list('-date', 1000);

    const recurrentes = all.filter(t => t.is_recurring && t.recurrence_period && t.status === 'pago');

    let created = 0;

    for (const t of recurrentes) {
      const dueDate = t.due_date ? new Date(t.due_date + 'T12:00:00') : null;
      if (!dueDate) continue;

      // Calcula próximo vencimento
      let nextDue = new Date(dueDate);
      if (t.recurrence_period === 'mensal') nextDue.setMonth(nextDue.getMonth() + 1);
      else if (t.recurrence_period === 'trimestral') nextDue.setMonth(nextDue.getMonth() + 3);
      else if (t.recurrence_period === 'anual') nextDue.setFullYear(nextDue.getFullYear() + 1);

      // Verifica se já existe uma transação pendente para esse período
      const nextDueStr = nextDue.toISOString().split('T')[0];
      const alreadyExists = all.some(x =>
        x.is_recurring &&
        x.description === t.description &&
        x.supplier === t.supplier &&
        x.due_date === nextDueStr &&
        x.id !== t.id
      );

      if (alreadyExists) continue;

      // Só cria se o próximo vencimento já chegou ou está a 3 dias
      const daysUntilNext = Math.floor((nextDue - today) / (1000 * 60 * 60 * 24));
      if (daysUntilNext > 3) continue;

      // Cria a próxima parcela
      await primeos.asServiceRole.entities.FinancialTransaction.create({
        type: t.type,
        category: t.category,
        description: t.description,
        amount: t.amount,
        date: nextDueStr,
        due_date: nextDueStr,
        status: 'pendente',
        payment_method: t.payment_method,
        supplier: t.supplier,
        patient_name: t.patient_name,
        patient_email: t.patient_email,
        is_recurring: true,
        recurrence_period: t.recurrence_period,
        recurrence_day: t.recurrence_day,
        notes: `Gerado automaticamente de: ${t.description}`,
        boleto_status: 'nao_gerado',
        amount_paid: 0,
        reminder_count: 0
      });

      created++;
      console.log(`Parcela recorrente criada: ${t.description} → vencimento ${nextDueStr}`);
    }

    return Response.json({ success: true, created });
  } catch (error) {
    console.error('Erro:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
