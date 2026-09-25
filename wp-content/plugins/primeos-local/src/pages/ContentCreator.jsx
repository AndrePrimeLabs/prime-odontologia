// @ts-nocheck
import { primeos } from "@/api/primeosClient";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  TrendingUp, 
  Target,
  Lightbulb,
  BarChart3
} from "lucide-react";
import AIContentGenerator from "@/components/marketing/AIContentGenerator";

export default function ContentCreator() {
  const { data: marketingMetrics = [] } = useQuery({
    queryKey: ["marketingMetrics"],
    queryFn: () => primeos.entities.MarketingMetric.list("-date")
  });

  // Get top performing campaigns
  const topPerformingCampaigns = marketingMetrics
    .sort((a, b) => {
      const roiA = a.revenue && a.investment ? ((a.revenue - a.investment) / a.investment) * 100 : 0;
      const roiB = b.revenue && b.investment ? ((b.revenue - b.investment) / b.investment) * 100 : 0;
      return roiB - roiA;
    })
    .slice(0, 5);

  const performanceInsights = {
    topCampaigns: topPerformingCampaigns.map(c => ({
      campaign: c.campaign_name || 'Sem nome',
      platform: c.platform,
      roi: c.revenue && c.investment ? ((c.revenue - c.investment) / c.investment) * 100 : 0,
      ctr: c.clicks && c.impressions ? (c.clicks / c.impressions) * 100 : 0
    })),
    totalInvestment: marketingMetrics.reduce((sum, m) => sum + (m.investment || 0), 0),
    totalRevenue: marketingMetrics.reduce((sum, m) => sum + (m.revenue || 0), 0),
    totalLeads: marketingMetrics.reduce((sum, m) => sum + (m.leads || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-600" />
            AI Content Creator
          </h1>
          <p className="text-slate-500 mt-1">
            Gere conteúdo de marketing otimizado com inteligência artificial
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">ROI Médio</p>
                  <p className="text-xl font-bold text-slate-900">
                    {performanceInsights.totalInvestment > 0 
                      ? (((performanceInsights.totalRevenue - performanceInsights.totalInvestment) / performanceInsights.totalInvestment) * 100).toFixed(1)
                      : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total de Leads</p>
                  <p className="text-xl font-bold text-slate-900">{performanceInsights.totalLeads}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Campanhas Ativas</p>
                  <p className="text-xl font-bold text-slate-900">{marketingMetrics.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {performanceInsights.topCampaigns.length > 0 && (
          <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="w-5 h-5 text-indigo-600" />
                Insights de Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-slate-700 mb-3">
                  Suas campanhas com melhor performance:
                </p>
                {performanceInsights.topCampaigns.map((campaign, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{idx + 1}</Badge>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{campaign.campaign}</p>
                        <p className="text-xs text-slate-500">{campaign.platform}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">ROI: {campaign.roi.toFixed(1)}%</p>
                      <p className="text-xs text-slate-500">CTR: {campaign.ctr.toFixed(2)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <AIContentGenerator performanceData={performanceInsights} />
      </div>
    </div>
  );
}
