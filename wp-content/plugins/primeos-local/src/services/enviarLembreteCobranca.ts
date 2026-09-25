import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const supabase = createClientFromRequest(req);

    // Pode ser chamado manualmente (com auth) ou via automação (sem body)
    let isManual = false;
    let manualTransactionId = null;

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await req.json().catch(() => ({}));
      if (body.transaction_id) {
        isManual = true;
        manualTransactionId = body.transaction_id;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 });
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const in7days = new Date(today);
    in7days.setDate(in7days.getDate() + 7);

    // Busca todas as receitas pendentes
    let toRemind = [];

    if (isManual && manualTransactionId) {
      const { data: txs } = await supabase.from('financial_transactions').select('*').eq('id', manualTransactionId);
      toRemind = txs || [];
    } else {
      // Modo automático: busca pendentes/vencidas com email
      const { data: all } = await supabase.from('financial_transactions').select('*').order('due_date', { ascending: true }).limit(500);
      toRemind = all.filter(t => {
        if (t.type !== 'receita') return false;
        if (t.status === 'pago' || t.status === 'cancelado') return false;
        if (!t.patient_email) return false;
        if (!t.due_date) return false;

        const due = new Date(t.due_date + 'T12:00:00');
        const isOverdue = due < today;
        const isDueSoon = due >= today && due <= in7days;

        if (!isOverdue && !isDueSoon) return false;

        // Limitar a 1 lembrete por dia por transação
        if (t.reminder_sent_at) {
          const lastSent = new Date(t.reminder_sent_at);
          const diffHours = (Date.now() - lastSent.getTime()) / (1000 * 60 * 60);
          if (diffHours < 22) return false;
        }

        return true;
      });
    }

    let sent = 0;
    let errors = 0;

    for (const t of toRemind) {
      if (!t.patient_email) continue;
      try {
        const due = t.due_date ? new Date(t.due_date + 'T12:00:00') : null;
        const isOverdue = due && due < today;
        const daysOverdue = due ? Math.floor((today - due) / (1000 * 60 * 60 * 24)) : 0;
        const daysUntilDue = due ? Math.floor((due - today) / (1000 * 60 * 60 * 24)) : 0;

        let subject, urgencyText, urgencyColor;

        if (isOverdue) {
          subject = `⚠️ Cobrança VENCIDA há ${daysOverdue} dia(s): ${t.description}`;
          urgencyText = `Sua cobrança está <strong style="color:#dc2626">vencida há ${daysOverdue} dia(s)</strong>. Por favor, regularize o quanto antes.`;
          urgencyColor = '#dc2626';
        } else if (daysUntilDue === 0) {
          subject = `🔔 Cobrança vence HOJE: ${t.description}`;
          urgencyText = `Sua cobrança vence <strong style="color:#d97706">hoje</strong>. Não perca o prazo!`;
          urgencyColor = '#d97706';
        } else {
          subject = `📅 Lembrete: Cobrança vence em ${daysUntilDue} dia(s)`;
          urgencyText = `Sua cobrança vence em <strong style="color:#0284c7">${daysUntilDue} dia(s)</strong>.`;
          urgencyColor = '#0284c7';
        }

        const payLink = t.boleto_url || '';

        await primeos.asServiceRole.integrations.Core.SendEmail({
          to: t.patient_email,
          subject,
          body: `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
  <div style="background:${urgencyColor};color:white;padding:12px 20px;border-radius:8px 8px 0 0">
    <strong>${isOverdue ? '⚠️ Cobrança Vencida' : '🔔 Lembrete de Pagamento'}</strong>
  </div>
  <div style="border:1px solid #e2e8f0;border-top:none;padding:20px;border-radius:0 0 8px 8px">
    <p>Olá, <strong>${t.patient_name || 'cliente'}</strong>!</p>
    <p>${urgencyText}</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;background:#f8fafc;border-radius:8px;overflow:hidden">
      <tr><td style="padding:10px 16px;color:#64748b;font-size:14px">Descrição</td>
          <td style="padding:10px 16px;font-weight:bold;font-size:14px">${t.description}</td></tr>
      <tr style="background:#f1f5f9">
          <td style="padding:10px 16px;color:#64748b;font-size:14px">Valor</td>
          <td style="padding:10px 16px;font-weight:bold;font-size:18px;color:#059669">R$ ${(t.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
      <tr><td style="padding:10px 16px;color:#64748b;font-size:14px">Vencimento</td>
          <td style="padding:10px 16px;font-size:14px">${due ? due.toLocaleDateString('pt-BR') : '-'}</td></tr>
    </table>
    ${payLink ? `
    <div style="text-align:center;margin:20px 0">
      <a href="${payLink}" style="background:#059669;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block">
        Pagar Agora
      </a>
    </div>
    <p style="font-size:12px;color:#94a3b8;text-align:center">Ou acesse: <a href="${payLink}">${payLink}</a></p>
    ` : '<p style="color:#64748b;font-size:14px">Entre em contato para regularizar seu pagamento.</p>'}
  </div>
</div>
          `
        });

        // Atualiza contadores na transação
        await primeos.asServiceRole.entities.FinancialTransaction.update(t.id, {
          reminder_sent_at: new Date().toISOString(),
          reminder_count: (t.reminder_count || 0) + 1
        });

        sent++;
        console.log(`Lembrete enviado para ${t.patient_email} — transação ${t.id}`);
      } catch (e) {
        errors++;
        console.error(`Erro ao enviar para ${t.patient_email}:`, e.message);
      }
    }

    return Response.json({ success: true, sent, errors, total: toRemind.length });
  } catch (error) {
    console.error('Erro geral:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
