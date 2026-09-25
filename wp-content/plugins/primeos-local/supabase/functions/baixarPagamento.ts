import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const primeos = createClientFromRequest(req);
    const user = await primeos.auth.me();
    if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 });

    const { transaction_id, payment_method, payment_date, notes } = await req.json();
    if (!transaction_id) return Response.json({ error: 'transaction_id é obrigatório' }, { status: 400 });

    const txs = await primeos.entities.FinancialTransaction.filter({ id: transaction_id });
    const tx = txs[0];
    if (!tx) return Response.json({ error: 'Transação não encontrada' }, { status: 404 });

    const paidAt = payment_date ? new Date(payment_date + 'T12:00:00').toISOString() : new Date().toISOString();

    await primeos.entities.FinancialTransaction.update(tx.id, {
      status: 'pago',
      boleto_status: tx.boleto_status === 'gerado' ? 'pago' : tx.boleto_status,
      boleto_paid_at: paidAt,
      payment_method: payment_method || tx.payment_method || 'outro',
      notes: notes ? (tx.notes ? tx.notes + '\n' + notes : notes) : tx.notes
    });

    console.log(`Baixa registrada: transação ${tx.id} marcada como paga por ${user.email}`);

    return Response.json({ success: true, transaction_id: tx.id, paid_at: paidAt });
  } catch (error) {
    console.error('Erro ao registrar baixa:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
