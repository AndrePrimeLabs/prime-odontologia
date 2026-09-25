// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Target, AlertTriangle, DollarSign, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function DealForecasting() {
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState(null);
  const [timeframe, setTimeframe] = useState("30");

  const runForecast = async () => {
    setLoading(true);
    try {
      const response = await primeos.functions.invoke('forecastDeals', {
        timeframe: parseInt(timeframe)
      });

      if (response.data.success) {
        setForecast(response.data.data);
        toast.success("Previsão gerada!");
      }
    } catch (error) {
      toast.error("Erro ao gerar previsão: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Previsão de Vendas IA
          </CardTitle>
          <div className="flex gap-2">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 dias</SelectItem>
                <SelectItem value="60">60 dias</SelectItem>
                <SelectItem value="90">90 dias</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={runForecast}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Previsão
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!forecast && !loading && (
          <div className="text-center py-12 text-slate-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Selecione o período e clique em "Gerar Previsão"</p>
          </div>
        )}

        {forecast && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
              <p className="text-sm text-slate-600 mb-4">{forecast.forecast_summary}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Deals Previstos</p>
                  <p className="text-3xl font-bold text-emerald-600">{forecast.predicted_deals}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Receita Prevista</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {formatCurrency(forecast.predicted_revenue)}
                  </p>
                </div>
              </div>
            </div>

            {/* Revenue Projection */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                Projeção de Receita
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Melhor Cenário</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(forecast.revenue_projection?.best_case || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Cenário Base</span>
                  <span className="font-bold text-blue-600">
                    {formatCurrency(forecast.revenue_projection?.base_case || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium">Pior Cenário</span>
                  <span className="font-bold text-slate-600">
                    {formatCurrency(forecast.revenue_projection?.worst_case || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Hot Deals */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-orange-600" />
                Deals Quentes ({forecast.hot_deals?.length || 0})
              </h4>
              <div className="space-y-2">
                {forecast.hot_deals?.slice(0, 5).map((deal, idx) => (
                  <Card key={idx} className="border-l-4 border-l-orange-500">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">Lead #{deal.lead_id.slice(0, 8)}</span>
                        <Badge className="bg-orange-100 text-orange-700">
                          {deal.probability}% probabilidade
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600">{deal.reason}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* At Risk Deals */}
            {forecast.at_risk_deals?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Deals em Risco ({forecast.at_risk_deals.length})
                </h4>
                <div className="space-y-2">
                  {forecast.at_risk_deals.slice(0, 5).map((deal, idx) => (
                    <Card key={idx} className="border-l-4 border-l-red-500">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">Lead #{deal.lead_id.slice(0, 8)}</span>
                          <Badge variant="destructive">{deal.risk_level}</Badge>
                        </div>
                        <p className="text-xs text-slate-600 mb-2">{deal.reason}</p>
                        <p className="text-xs font-medium text-blue-600">→ {deal.action}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Key Insights */}
            <div>
              <h4 className="font-semibold mb-3">Insights Principais</h4>
              <ul className="space-y-2">
                {forecast.key_insights?.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-emerald-600 mt-1">✓</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="p-4 bg-blue-50 rounded-xl">
              <h4 className="font-semibold mb-2 text-blue-900">Recomendações</h4>
              <ul className="space-y-1">
                {forecast.recommendations?.map((rec, idx) => (
                  <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                    <span>•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
