import { createPrimeosClientFromRequest } from './primeosClient.ts';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const supabase = createClientFromRequest(req);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { patient_name, amount, service, description, success_url, cancel_url } = await req.json();

    if (!amount || amount <= 0) {
      return Response.json({ error: 'Valor inválido' }, { status: 400 });
    }

    const amountCents = Math.round(parseFloat(amount) * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'brl',
          product_data: {
            name: service || 'Serviço Odontológico',
            description: description || `Cobrança para ${patient_name}`,
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: success_url || 'https://app.primeos.com/success',
      cancel_url: cancel_url || 'https://app.primeos.com/cancel',
      customer_email: user.email,
      metadata: {
        primeos_app_id: Deno.env.get("PRIMEOS_APP_ID"),
        patient_name: patient_name || '',
        service: service || '',
        created_by: user.email,
      },
    });

    console.info(`Stripe session created: ${session.id} for ${patient_name} - R$${amount}`);
    return Response.json({ session_id: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
