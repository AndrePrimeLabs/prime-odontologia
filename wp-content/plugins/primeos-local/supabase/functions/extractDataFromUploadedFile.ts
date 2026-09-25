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

    const { file_url, json_schema } = await req.json();
    const functionsUrl = Deno.env.get('SUPABASE_URL')?.replace(/\/$/, '') + '/functions/v1/invokeLLM';

    const llmResponse = await fetch(functionsUrl, {
      method: 'POST',
      headers: {
        Authorization: req.headers.get('Authorization') ?? '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Extract structured data from the file at ${file_url}. Return only valid JSON matching the schema.`,
        response_json_schema: json_schema,
      }),
    });

    if (!llmResponse.ok) {
      const errText = await llmResponse.text();
      return Response.json(
        { status: 'error', error: errText },
        { status: 502, headers: corsHeaders }
      );
    }

    const output = await llmResponse.json();
    return Response.json({ status: 'success', output }, { headers: corsHeaders });
  } catch (error) {
    return Response.json(
      { status: 'error', error: error instanceof Error ? error.message : 'extract failed' },
      { status: 500, headers: corsHeaders }
    );
  }
});
