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

    const { prompt, response_json_schema } = await req.json();
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return Response.json(
        { error: 'OPENAI_API_KEY is not configured' },
        { status: 500, headers: corsHeaders }
      );
    }

    const body: Record<string, unknown> = {
      model: Deno.env.get('OPENAI_MODEL') ?? 'gpt-4o-mini',
      messages: [{ role: 'user', content: String(prompt ?? '') }],
    };

    if (response_json_schema) {
      body.response_format = {
        type: 'json_schema',
        json_schema: {
          name: 'response',
          schema: response_json_schema,
          strict: false,
        },
      };
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text();
      return Response.json(
        { error: `OpenAI request failed: ${errText}` },
        { status: 502, headers: corsHeaders }
      );
    }

    const completion = await openaiResponse.json();
    const content = completion?.choices?.[0]?.message?.content;

    if (response_json_schema) {
      return Response.json(JSON.parse(content), { headers: corsHeaders });
    }

    return Response.json({ result: content }, { headers: corsHeaders });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'invokeLLM failed' },
      { status: 500, headers: corsHeaders }
    );
  }
});
