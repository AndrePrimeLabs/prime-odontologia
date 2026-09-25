import { createPrimeosClientFromRequest } from './primeosClient.ts';

/**
 * Automação financeira unificada:
 * - Lembretes de contas a pagar (email ao responsável do sistema)
 * - Lembretes de contas a receber (email ao paciente/cliente)
 * - Alerta de baixo saldo por projeção de fluxo de caixa
 * - Geração de próximas parcelas de transações recorrentes
 *
 * Chamada via automação agendada (sem body) ou manualmente com body { mode: "preview" }
 */
Deno.serve(async (req) => {
  try {
    const primeos = createClientFromRequest(req);

    const body = await req.json().catch(() => ({}));
    const previewMode = body?.mode === "preview";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const in3 = new Date(today); in3.setDate(in3.getDate() + 3);
    const in7 = new Date(today); in7.setDate(in7.getDate() + 7);

    const all = await primeos.asServiceRole.entities.FinancialTransaction.list('-due_date', 1000);
    const adminUsers = await primeos.asServiceRole.entities.User.filter({ role: 'admin' });
    const adminEmail = adminUsers?.[0]?.email;

    const results = { reminders_pagar: 0, reminders_receber: 0, recorrentes_criadas: 0, baixo_saldo_alerta: false, errors: [] };

    // ─── 1. LEMBRETES DE CONTAS A PAGAR ───────────────────────────────────────
    const contasPagar = all.filter(t => {
      if (t.type !== 'despesa') return false;
      if (t.status === 'pago' || t.status === 'cancelado') return false;
      if (!t.due_date) return false;
      const due = new Date(t.due_date + 'T12:00:00');
      const isOverdue = due < today;
      const isDueSoon = due >= today && due <= in7;
      if (!isOverdue && !isDueSoon) return false;
      // Anti-spam: máximo 1 lembrete por dia
      if (t.reminder_sent_at) {
        const hours = (Date.now() - new Date(t.reminder_sent_at).getTime()) / 3600000;
        if (hours < 22) return false;
      }
      return true;
    });

    if (adminEmail && contasPagar.length > 0 && !previewMode) {
      const overdue = contasPagar.filter(t => new Date(t.due_date + 'T12:00:00') < today);
      const dueSoon = contasPagar.filter(t => {
        const d = new Date(t.due_date + 'T12:00:00');
        return d >= today && d <= in7;
      });

      const rows = contasPagar.map(t => {
        const due = new Date(t.due_date + 'T12:00:00');
        const isOver = due < today;
        const days = Math.abs(Math.floor((due - today) / 86400000));
        const label = isOver ? `Venceu há ${days}d` : days === 0 ? 'Vence hoje' : `Vence em ${days}d`;
        const color = isOver ? '#dc2626' : days <= 3 ? '#d97706' : '#0284c7';
        return `<tr style="border-bottom:1px solid #f1f5f9">
          <td style="padding:8px 12px;font-size:13px">${t.description}</td>
          <td style="padding:8px 12px;font-size:13px;color:#64748b">${t.supplier || '-'}</td>
          <td style="padding:8px 12px;font-size:13px;font-weight:bold;color:#dc2626">R$ ${(t.amount||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</td>
          <td style="padding:8px 12px;font-size:13px;color:${color};font-weight:600">${label}</td>
        </tr>`;
      }).join('');

      try {
        await primeos.asServiceRole.integrations.Core.SendEmail({
          to: adminEmail,
          subject: `💸 ${overdue.length} vencida(s) + ${dueSoon.length} a vencer — Contas a Pagar`,
          body: `<div style="font-family:sans-serif;max-width:640px;margin:0 auto;padding:24px">
            <h2 style="color:#0f172a;margin-bottom:4px">Resumo: Contas a Pagar</h2>
            <p style="color:#64748b;font-size:14px;margin-bottom:20px">Gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
            ${overdue.length > 0 ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px 16px;margin-bottom:16px">
              <strong style="color:#dc2626">⚠️ ${overdue.length} conta(s) VENCIDA(S)</strong> — Total: R$ ${overdue.reduce((s,t)=>s+(t.amount||0),0).toLocaleString('pt-BR',{minimumFractionDigits:2})}
            </div>` : ''}
            <table style="width:100%;border-collapse:collapse">
              <thead><tr style="background:#f8fafc">
                <th style="text-align:left;padding:8px 12px;font-size:12px;color:#64748b">Descrição</th>
                <th style="text-align:left;padding:8px 12px;font-size:12px;color:#64748b">Fornecedor</th>
                <th style="text-align:left;padding:8px 12px;font-size:12px;color:#64748b">Valor</th>
                <th style="text-align:left;padding:8px 12px;font-size:12px;color:#64748b">Status</th>
              </tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>`
        });
        results.reminders_pagar = contasPagar.length;
        // Atualiza reminder_sent_at
        for (const t of contasPagar) {
          await primeos.asServiceRole.entities.FinancialTransaction.update(t.id, {
            reminder_sent_at: new Date().toISOString(),
            reminder_count: (t.reminder_count || 0) + 1
          });
        }
      } catch (e) {
        results.errors.push(`pagar_email: ${e.message}`);
        console.error('Erro lembrete pagar:', e.message);
      }
    }

    // ─── 2. LEMBRETES DE CONTAS A RECEBER (para clientes/pacientes) ────────────
    const contasReceber = all.filter(t => {
      if (t.type !== 'receita') return false;
      if (t.status === 'pago' || t.status === 'cancelado') return false;
      if (!t.patient_email || !t.due_date) return false;
      const due = new Date(t.due_date + 'T12:00:00');
      const isOverdue = due < today;
      const isDueSoon = due >= today && due <= in7;
      if (!isOverdue && !isDueSoon) return false;
      if (t.reminder_sent_at) {
        const hours = (Date.now() - new Date(t.reminder_sent_at).getTime()) / 3600000;
        if (hours < 22) return false;
      }
      return true;
    });

    if (!previewMode) {
      for (const t of contasReceber) {
        try {
          const due = new Date(t.due_date + 'T12:00:00');
          const isOver = due < today;
          const days = Math.abs(Math.floor((due - today) / 86400000));
          const subject = isOver
            ? `⚠️ Cobrança vencida há ${days} dia(s): ${t.description}`
            : days === 0 ? `🔔 Sua cobrança vence hoje: ${t.description}`
            : `📅 Lembrete: Cobrança vence em ${days} dia(s)`;
          const urgencyColor = isOver ? '#dc2626' : days <= 3 ? '#d97706' : '#0284c7';
          const urgencyText = isOver
            ? `Sua fatura está <strong style="color:#dc2626">vencida há ${days} dia(s)</strong>.`
            : days === 0 ? `Sua fatura vence <strong>hoje</strong>.`
            : `Sua fatura vence em <strong>${days} dia(s)</strong>.`;

          await primeos.asServiceRole.integrations.Core.SendEmail({
            to: t.patient_email,
            subject,
            body: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
              <div style="background:${urgencyColor};color:white;padding:12px 20px;border-radius:8px 8px 0 0">
                <strong>${isOver ? '⚠️ Cobrança Vencida' : '🔔 Lembrete de Pagamento'}</strong>
              </div>
              <div style="border:1px solid #e2e8f0;border-top:none;padding:20px;border-radius:0 0 8px 8px">
                <p>Olá, <strong>${t.patient_name || 'cliente'}</strong>!</p>
                <p>${urgencyText}</p>
                <table style="width:100%;background:#f8fafc;border-radius:8px;overflow:hidden;margin:16px 0">
                  <tr><td style="padding:10px 16px;color:#64748b;font-size:14px">Descrição</td>
                      <td style="padding:10px 16px;font-weight:bold">${t.description}</td></tr>
                  <tr style="background:#f1f5f9">
                      <td style="padding:10px 16px;color:#64748b;font-size:14px">Valor</td>
                      <td style="padding:10px 16px;font-weight:bold;font-size:18px;color:#059669">R$ ${(t.amount||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</td></tr>
                  <tr><td style="padding:10px 16px;color:#64748b;font-size:14px">Vencimento</td>
                      <td style="padding:10px 16px">${due.toLocaleDateString('pt-BR')}</td></tr>
                </table>
                ${t.boleto_url ? `<div style="text-align:center;margin:20px 0"><a href="${t.boleto_url}" style="background:#059669;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold">Pagar Agora</a></div>` : ''}
              </div>
            </div>`
          });
          await primeos.asServiceRole.entities.FinancialTransaction.update(t.id, {
            reminder_sent_at: new Date().toISOString(),
            reminder_count: (t.reminder_count || 0) + 1
          });
          results.reminders_receber++;
        } catch (e) {
          results.errors.push(`receber_${t.id}: ${e.message}`);
          console.error('Erro lembrete receber:', e.message);
        }
      }
    }

    // ─── 3. GERAÇÃO DE TRANSAÇÕES RECORRENTES ─────────────────────────────────
    const recorrentes = all.filter(t => t.is_recurring && t.recurrence_period && t.status === 'pago');
    for (const t of recorrentes) {
      const dueDate = t.due_date ? new Date(t.due_date + 'T12:00:00') : null;
      if (!dueDate) continue;
      let nextDue = new Date(dueDate);
      if (t.recurrence_period === 'mensal') nextDue.setMonth(nextDue.getMonth() + 1);
      else if (t.recurrence_period === 'trimestral') nextDue.setMonth(nextDue.getMonth() + 3);
      else if (t.recurrence_period === 'anual') nextDue.setFullYear(nextDue.getFullYear() + 1);
      const nextDueStr = nextDue.toISOString().split('T')[0];
      const daysUntil = Math.floor((nextDue - today) / 86400000);
      if (daysUntil > 5) continue;
      const exists = all.some(x => x.description === t.description && x.supplier === t.supplier && x.due_date === nextDueStr && x.id !== t.id);
      if (exists) continue;
      if (!previewMode) {
        try {
          await primeos.asServiceRole.entities.FinancialTransaction.create({
            type: t.type, category: t.category, description: t.description,
            amount: t.amount, date: nextDueStr, due_date: nextDueStr,
            status: 'pendente', payment_method: t.payment_method,
            supplier: t.supplier, patient_name: t.patient_name,
            patient_email: t.patient_email, is_recurring: true,
            recurrence_period: t.recurrence_period, recurrence_day: t.recurrence_day,
            notes: `Gerado automaticamente — recorrência de: ${t.description}`,
            boleto_status: 'nao_gerado', amount_paid: 0, reminder_count: 0
          });
          results.recorrentes_criadas++;
          console.log(`Recorrente criada: ${t.description} → ${nextDueStr}`);
        } catch (e) {
          results.errors.push(`recorrente_${t.id}: ${e.message}`);
        }
      } else {
        results.recorrentes_criadas++;
      }
    }

    // ─── 4. ALERTA DE BAIXO SALDO (baseado em projeção 30 dias) ───────────────
    const in30 = new Date(today); in30.setDate(in30.getDate() + 30);
    const receitasPendentes30 = all
      .filter(t => t.type === 'receita' && t.status !== 'cancelado' && t.status !== 'pago' && t.due_date)
      .filter(t => { const d = new Date(t.due_date + 'T12:00:00'); return d >= today && d <= in30; })
      .reduce((s, t) => s + (t.amount || 0), 0);
    const despesasPendentes30 = all
      .filter(t => t.type === 'despesa' && t.status !== 'cancelado' && t.status !== 'pago' && t.due_date)
      .filter(t => { const d = new Date(t.due_date + 'T12:00:00'); return d >= today && d <= in30; })
      .reduce((s, t) => s + (t.amount || 0), 0);
    const saldoProjetado30 = receitasPendentes30 - despesasPendentes30;

    if (saldoProjetado30 < 0) {
      results.baixo_saldo_alerta = true;
      if (adminEmail && !previewMode) {
        try {
          await primeos.asServiceRole.integrations.Core.SendEmail({
            to: adminEmail,
            subject: `🚨 Alerta: Projeção de saldo NEGATIVO nos próximos 30 dias`,
            body: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
              <div style="background:#dc2626;color:white;padding:16px 20px;border-radius:8px 8px 0 0">
                <h2 style="margin:0">🚨 Alerta de Baixo Saldo</h2>
              </div>
              <div style="border:1px solid #fecaca;border-top:none;padding:20px;border-radius:0 0 8px 8px;background:#fff">
                <p style="color:#64748b">Projeção para os próximos <strong>30 dias</strong>:</p>
                <table style="width:100%;border-collapse:collapse;margin:12px 0">
                  <tr style="background:#f0fdf4"><td style="padding:10px 16px;font-size:14px">Receitas previstas</td>
                    <td style="padding:10px 16px;font-weight:bold;color:#16a34a">+ R$ ${receitasPendentes30.toLocaleString('pt-BR',{minimumFractionDigits:2})}</td></tr>
                  <tr style="background:#fff1f2"><td style="padding:10px 16px;font-size:14px">Despesas previstas</td>
                    <td style="padding:10px 16px;font-weight:bold;color:#dc2626">- R$ ${despesasPendentes30.toLocaleString('pt-BR',{minimumFractionDigits:2})}</td></tr>
                  <tr style="background:#fef2f2;border-top:2px solid #fecaca"><td style="padding:12px 16px;font-size:15px;font-weight:bold">Saldo Projetado</td>
                    <td style="padding:12px 16px;font-weight:bold;font-size:18px;color:#dc2626">R$ ${saldoProjetado30.toLocaleString('pt-BR',{minimumFractionDigits:2})}</td></tr>
                </table>
                <p style="color:#64748b;font-size:13px">Acesse o módulo Financeiro → Fluxo Projetado para mais detalhes.</p>
              </div>
            </div>`
          });
          console.log('Alerta de baixo saldo enviado');
        } catch (e) {
          results.errors.push(`baixo_saldo_email: ${e.message}`);
        }
      }
    }

    results.saldo_projetado_30d = saldoProjetado30;
    results.contas_pagar_pendentes = contasPagar.length;
    results.contas_receber_pendentes = contasReceber.length;

    console.log('Resultado automação financeira:', JSON.stringify(results));
    return Response.json({ success: true, ...results });
  } catch (error) {
    console.error('Erro geral:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
