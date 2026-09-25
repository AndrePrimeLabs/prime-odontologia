// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function SalesForecast() {
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState(30);
  const [forecast, setForecast] = useState(null);

  const generateForecast = async () => {
    setLoading(true);
    try {
      const response = await primeos.functions.invoke('forecastDeals', { period });

      if (response.data.success) {
        setForecast(response.data);
        toast.success("Previsão gerada!");
      }
    } catch (error) {
      toast.error("Erro ao gerar previsão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Previsão de Vendas com IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-3">
          <Select value={period.toString()} onValueChange={(v) => setPeriod(parseInt(v))}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 dias</SelectItem>
              <SelectItem value="15">15 dias</SelectItem>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="60">60 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={generateForecast}
            disabled={loading}
            className="flex-1 gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gerando...
              </>
            ) : (
              "Gerar Previsão"
            )}
          </Button>
        </div>

        {forecast && (
          <div className="space-y-6">
            {/* Main Forecast */}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <p className="text-sm text-slate-600 mb-2">Receita Prevista ({period} dias)</p>
              <p className="text-4xl font-bold text-blue-900">
                R$ {forecast.forecast.revenue_forecast.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="outline">
                  R$ {forecast.forecast.revenue_range_min.toLocaleString('pt-BR')} - 
                  R$ {forecast.forecast.revenue_range_max.toLocaleString('pt-BR')}
                </Badge>
                <Badge className="bg-green-600">
                  {forecast.forecast.confidence_level}% confiança
                </Badge>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600">Conversões Estimadas</p>
                <p className="text-2xl font-bold mt-1">{forecast.forecast.conversions_forecast}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600">Tendência</p>
                <p className="text-lg font-semibold mt-1 capitalize">{forecast.forecast.trend}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600">Leads Ativos</p>
                <p className="text-2xl font-bold mt-1">{forecast.current_metrics.active_leads}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600">Taxa de Conversão</p>
                <p className="text-2xl font-bold mt-1">{forecast.current_metrics.conversion_rate.toFixed(1)}%</p>
              </div>
            </div>

            {/* Analysis */}
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold mb-2">Resumo</p>
                <p className="text-sm text-slate-700">{forecast.forecast.summary}</p>
              </div>

              {forecast.forecast.opportunities?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-green-700">🎯 Oportunidades</h4>
                  <ul className="space-y-1">
                    {forecast.forecast.opportunities.map((opp, idx) => (
                      <li key={idx} className="text-sm text-slate-700">• {opp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {forecast.forecast.risk_factors?.length > 0 && (
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="text-sm font-semibold mb-2 text-orange-900 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Fatores de Risco
                  </h4>
                  <ul className="space-y-1">
                    {forecast.forecast.risk_factors.map((risk, idx) => (
                      <li key={idx} className="text-sm text-orange-800">• {risk}</li>
                    ))}
                  </ul>
                </div>
              )}

              {forecast.forecast.recommendations?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">💡 Recomendações</h4>
                  <ul className="space-y-1">
                    {forecast.forecast.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-slate-700">• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
