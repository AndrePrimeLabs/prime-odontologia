import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const primeos = createClientFromRequest(req);
    const user = await primeos.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { testData } = await req.json();

    if (!testData.test_name || !testData.campaign_type || !testData.variant_a || !testData.variant_b) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create AB test
    const abTest = await primeos.entities.ABTest.create({
      test_name: testData.test_name,
      campaign_type: testData.campaign_type,
      variant_a: testData.variant_a,
      variant_b: testData.variant_b,
      test_duration_days: testData.test_duration_days || 7,
      audience_size: testData.audience_size || 100,
      status: 'draft',
      results: {
        variant_a_metrics: { sent: 0, opened: 0, clicked: 0, converted: 0 },
        variant_b_metrics: { sent: 0, opened: 0, clicked: 0, converted: 0 }
      }
    });

    // Award points
    await primeos.functions.invoke('awardPoints', {
      action: 'test_created',
      metadata: { bonus_multiplier: 1.5 }
    });

    return Response.json({ 
      success: true, 
      data: abTest,
      message: 'Teste A/B criado! +37 pontos'
    });

  } catch (error) {
    console.error('Create AB Test Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
