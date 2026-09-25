import { createPrimeosClientFromRequest } from './primeosClient.ts';

Deno.serve(async (req) => {
  try {
    const supabase = createClientFromRequest(req);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get secrets
    const developerToken = Deno.env.get("GOOGLE_ADS_DEVELOPER_TOKEN");
    const clientId = Deno.env.get("GOOGLE_ADS_CLIENT_ID");
    const clientSecret = Deno.env.get("GOOGLE_ADS_CLIENT_SECRET");
    const refreshToken = Deno.env.get("GOOGLE_ADS_REFRESH_TOKEN");
    const customerId = Deno.env.get("GOOGLE_ADS_CUSTOMER_ID");

    if (!developerToken || !clientId || !clientSecret || !refreshToken || !customerId) {
      return Response.json({ 
        error: 'Missing credentials',
        message: 'Configure os secrets do Google Ads no Dashboard → Settings → Secrets',
        required: ['GOOGLE_ADS_DEVELOPER_TOKEN', 'GOOGLE_ADS_CLIENT_ID', 'GOOGLE_ADS_CLIENT_SECRET', 'GOOGLE_ADS_REFRESH_TOKEN', 'GOOGLE_ADS_CUSTOMER_ID']
      }, { status: 400 });
    }

    // Get access token using refresh token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });

    if (!tokenResponse.ok) {
      return Response.json({ 
        error: 'Failed to get access token',
        details: await tokenResponse.text()
      }, { status: 500 });
    }

    const { access_token } = await tokenResponse.json();

    // Get campaign metrics for last 30 days
    const query = `
      SELECT
        campaign.id,
        campaign.name,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        segments.date
      FROM campaign
      WHERE segments.date DURING LAST_30_DAYS
      ORDER BY segments.date DESC
    `;

    const adsResponse = await fetch(
      `https://googleads.googleapis.com/v15/customers/${customerId.replace(/-/g, '')}/googleAds:searchStream`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'developer-token': developerToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      }
    );

    if (!adsResponse.ok) {
      return Response.json({ 
        error: 'Failed to fetch Google Ads data',
        details: await adsResponse.text()
      }, { status: 500 });
    }

    const adsData = await adsResponse.json();
    
    // Process and aggregate metrics by date
    const metricsByDate = {};
    
    if (adsData.results) {
      for (const result of adsData.results) {
        const date = result.segments.date;
        const impressions = parseInt(result.metrics.impressions || 0);
        const clicks = parseInt(result.metrics.clicks || 0);
        const cost = parseInt(result.metrics.costMicros || 0) / 1000000;
        const conversions = parseInt(result.metrics.conversions || 0);

        if (!metricsByDate[date]) {
          metricsByDate[date] = {
            impressions: 0,
            clicks: 0,
            investment: 0,
            conversions: 0
          };
        }

        metricsByDate[date].impressions += impressions;
        metricsByDate[date].clicks += clicks;
        metricsByDate[date].investment += cost;
        metricsByDate[date].conversions += conversions;
      }
    }

    // Save to MarketingMetric entity
    const metrics = [];
    for (const [date, data] of Object.entries(metricsByDate)) {
      const metric = await primeos.asServiceRole.entities.MarketingMetric.create({
        data: date,
        canal: 'Google Ads',
        impressoes: data.impressions,
        cliques: data.clicks,
        investimento: data.investment,
        leads: data.conversions,
        origem: 'auto_sync'
      });
      metrics.push(metric);
    }

    return Response.json({ 
      success: true,
      message: `Sincronizados ${metrics.length} dias de métricas do Google Ads`,
      metrics: metrics.length
    });

  } catch (error) {
    console.error('Error syncing Google Ads:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});
