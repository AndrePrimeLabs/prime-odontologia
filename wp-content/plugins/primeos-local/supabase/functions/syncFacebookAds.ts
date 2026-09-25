import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const supabase = createClientFromRequest(req);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get secrets
    const accessToken = Deno.env.get("FACEBOOK_ACCESS_TOKEN");
    const adAccountId = Deno.env.get("FACEBOOK_AD_ACCOUNT_ID");

    if (!accessToken || !adAccountId) {
      return Response.json({ 
        error: 'Missing credentials',
        message: 'Configure os secrets do Facebook Ads no Dashboard → Settings → Secrets',
        required: ['FACEBOOK_ACCESS_TOKEN', 'FACEBOOK_AD_ACCOUNT_ID']
      }, { status: 400 });
    }

    // Calculate date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const dateStart = thirtyDaysAgo.toISOString().split('T')[0];
    const dateEnd = today.toISOString().split('T')[0];

    // Fetch insights from Facebook Marketing API
    const fields = [
      'impressions',
      'clicks',
      'spend',
      'actions'
    ].join(',');

    const url = `https://graph.facebook.com/v18.0/${adAccountId}/insights?fields=${fields}&level=account&time_range={"since":"${dateStart}","until":"${dateEnd}"}&time_increment=1&access_token=${accessToken}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json({ 
        error: 'Failed to fetch Facebook Ads data',
        details: errorText
      }, { status: 500 });
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      return Response.json({ 
        success: true,
        message: 'Nenhum dado encontrado no período',
        metrics: 0
      });
    }

    // Save to MarketingMetric entity
    const metrics = [];
    
    for (const insight of data.data) {
      const impressions = parseInt(insight.impressions || 0);
      const clicks = parseInt(insight.clicks || 0);
      const spend = parseFloat(insight.spend || 0);
      
      // Extract conversions from actions array
      let conversions = 0;
      if (insight.actions) {
        const conversionAction = insight.actions.find(
          action => action.action_type === 'offsite_conversion.fb_pixel_lead' || 
                    action.action_type === 'lead'
        );
        conversions = conversionAction ? parseInt(conversionAction.value) : 0;
      }

      const metric = await primeos.asServiceRole.entities.MarketingMetric.create({
        data: insight.date_start,
        canal: 'Facebook Ads',
        impressoes: impressions,
        cliques: clicks,
        investimento: spend,
        leads: conversions,
        origem: 'auto_sync'
      });
      
      metrics.push(metric);
    }

    return Response.json({ 
      success: true,
      message: `Sincronizados ${metrics.length} dias de métricas do Facebook Ads`,
      metrics: metrics.length
    });

  } catch (error) {
    console.error('Error syncing Facebook Ads:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});
