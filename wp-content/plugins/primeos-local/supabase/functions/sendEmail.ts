import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization') ?? '' },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const { to, subject, body, html } = await req.json();
    const resendKey = Deno.env.get('RESEND_API_KEY');
    const from = Deno.env.get('EMAIL_FROM') ?? 'Prime Odontologia <noreply@primeodontologia.com.br>';

    if (!resendKey) {
      return Response.json(
        { error: 'RESEND_API_KEY is not configured' },
        { status: 500, headers: corsHeaders }
      );
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html: html ?? body,
        text: html ? undefined : body,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return Response.json(
        { error: `Email send failed: ${errText}` },
        { status: 502, headers: corsHeaders }
      );
    }

    const result = await response.json();
    return Response.json({ success: true, ...result }, { headers: corsHeaders });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'sendEmail failed' },
      { status: 500, headers: corsHeaders }
    );
  }
});
