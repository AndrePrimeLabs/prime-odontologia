import { createPrimeosClientFromRequest } from './primeosClient.ts';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), { apiVersion: "2024-06-20" });

Deno.serve(async (req) => {
  try {
    const primeos = createClientFromRequest(req);
    const user = await primeos.auth.me();
    if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 });

    const { transaction_id } = await req.json();
    if (!transaction_id) return Response.json({ error: 'transaction_id é obrigatório' }, { status: 400 });

    const transactions = await primeos.entities.FinancialTransaction.filter({ id: transaction_id });
    const tx = transactions[0];
    if (!tx) return Response.json({ error: 'Transação não encontrada' }, { status: 404 });
    if (tx.type !== 'receita') return Response.json({ error: 'Apenas receitas podem gerar cobrança' }, { status: 400 });

    // Gera um Payment Link via Stripe (funciona como boleto/cobrança digital)
    const amountCents = Math.round((tx.amount || 0) * 100);
    if (amountCents < 50) return Response.json({ error: 'Valor mínimo é R$ 0,50' }, { status: 400 });

    const price = await stripe.prices.create({
      currency: 'brl',
      unit_amount: amountCents,
      product_data: {
        name: tx.description || 'Cobrança',
        metadata: { transaction_id: tx.id }
      }
    });

    const paymentLink = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
      after_completion: { type: 'redirect', redirect: { url: 'https://app.primeos.com' } },
      metadata: {
        transaction_id: tx.id,
        primeos_app_id: Deno.env.get("PRIMEOS_APP_ID"),
        patient_name: tx.patient_name || ''
      },
      payment_method_types: ['card', 'boleto'],
      payment_intent_data: {
        metadata: {
          transaction_id: tx.id,
          primeos_app_id: Deno.env.get("PRIMEOS_APP_ID")
        }
      }
    });

    // Gera linha digitável fictícia para exibição (boleto simulado)
    const barcode = `23793.38128 60007.827136 91000.063305 8 ${Math.floor(Date.now() / 1000)}`;

    // Atualiza a transação com os dados do boleto
    await primeos.entities.FinancialTransaction.update(tx.id, {
      boleto_id: paymentLink.id,
      boleto_url: paymentLink.url,
      boleto_barcode: barcode,
      boleto_status: 'gerado',
      boleto_generated_at: new Date().toISOString(),
      payment_method: 'boleto'
    });

    // Envia email de cobrança se tiver email do paciente
    if (tx.patient_email) {
      const dueFormatted = tx.due_date
        ? new Date(tx.due_date + 'T12:00:00').toLocaleDateString('pt-BR')
        : 'a combinar';

      await primeos.asServiceRole.integrations.Core.SendEmail({
        to: tx.patient_email,
        subject: `Cobrança: ${tx.description} — R$ ${(tx.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        body: `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
  <h2 style="color:#059669">Olá, ${tx.patient_name || 'cliente'}!</h2>
  <p>Segue sua cobrança referente a <strong>${tx.description}</strong>.</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b">Valor</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-weight:bold">R$ ${(tx.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
    <tr><td style="padding:8px;color:#64748b">Vencimento</td>
        <td style="padding:8px;font-weight:bold">${dueFormatted}</td></tr>
  </table>
  <div style="text-align:center;margin:24px 0">
    <a href="${paymentLink.url}" style="background:#059669;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">
      Pagar Agora
    </a>
  </div>
  <p style="font-size:12px;color:#94a3b8">Você também pode copiar o link: ${paymentLink.url}</p>
</div>
        `
      });
    }

    console.log(`Cobrança gerada: ${paymentLink.id} para transação ${tx.id}`);

    return Response.json({
      success: true,
      boleto_url: paymentLink.url,
      boleto_barcode: barcode,
      boleto_id: paymentLink.id
    });
  } catch (error) {
    console.error('Erro ao gerar cobrança:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
