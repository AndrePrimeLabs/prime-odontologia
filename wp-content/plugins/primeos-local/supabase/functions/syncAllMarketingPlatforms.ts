import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const supabase = createClientFromRequest(req);

    const results = {
      googleAds: { success: false, message: '', metrics: 0 },
      facebookAds: { success: false, message: '', metrics: 0 }
    };

    // Sync Google Ads
    try {
      const googleResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/syncGoogleAds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      const googleData = await googleResponse.json();
      results.googleAds = {
        success: googleData?.success || false,
        message: googleData?.message || googleData?.error || 'Unknown error',
        metrics: googleData?.metrics || 0
      };
    } catch (error) {
      results.googleAds.message = error.message;
    }

    // Sync Facebook Ads
    try {
      const facebookResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/syncFacebookAds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      const facebookData = await facebookResponse.json();
      results.facebookAds = {
        success: facebookData?.success || false,
        message: facebookData?.message || facebookData?.error || 'Unknown error',
        metrics: facebookData?.metrics || 0
      };
    } catch (error) {
      results.facebookAds.message = error.message;
    }

    const totalMetrics = results.googleAds.metrics + results.facebookAds.metrics;
    const allSuccess = results.googleAds.success && results.facebookAds.success;

    return Response.json({
      success: allSuccess,
      message: `Sincronização completa: ${totalMetrics} métricas importadas`,
      results,
      totalMetrics
    });

  } catch (error) {
    console.error('Error in syncAllMarketingPlatforms:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});
