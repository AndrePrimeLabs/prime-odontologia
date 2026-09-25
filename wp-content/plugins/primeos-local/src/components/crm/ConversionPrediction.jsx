// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Target, TrendingUp, AlertTriangle, Calendar, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ConversionPrediction({ lead }) {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const generatePrediction = async () => {
    setLoading(true);
    try {
      const response = await primeos.functions.invoke('predictConversion', {
        leadId: lead.id
      });

      if (response.data.success) {
        setPrediction(response.data);
        toast.success("Predição gerada!");
      }
    } catch (error) {
      toast.error("Erro ao gerar predição");
    } finally {
      setLoading(false);
    }
  };

  const getProbabilityColor = (prob) => {
    if (prob >= 70) return "text-green-600 bg-green-50";
    if (prob >= 40) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          Predição de Conversão Avançada
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!prediction ? (
          <Button
            onClick={generatePrediction}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Target className="w-4 h-4" />
                Gerar Predição Avançada
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            {/* Main Prediction */}
            <div className={cn("p-6 rounded-xl", getProbabilityColor(prediction.prediction.conversion_probability))}>
              <div className="text-center">
                <p className="text-5xl font-bold">{prediction.prediction.conversion_probability}%</p>
                <p className="text-sm mt-1">Probabilidade de Conversão</p>
                <Progress value={prediction.prediction.conversion_probability} className="mt-3" />
                <Badge className="mt-3" variant="outline">
                  {prediction.prediction.confidence_level}% confiança
                </Badge>
              </div>
            </div>

            {/* Summary */}
            {prediction.prediction.summary && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-700">{prediction.prediction.summary}</p>
              </div>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <p className="text-xs text-blue-600">Prazo Estimado</p>
                </div>
                <p className="text-xl font-bold text-blue-900">
                  {prediction.prediction.estimated_days_to_convert} dias
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <p className="text-xs text-emerald-600">Valor Esperado</p>
                </div>
                <p className="text-lg font-bold text-emerald-900">
                  R$ {prediction.prediction.expected_value.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Engagement Metrics */}
            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <p className="text-xs font-semibold text-indigo-900 mb-2">Métricas de Engajamento</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-indigo-900">{prediction.engagement_metrics.total_interactions}</p>
                  <p className="text-xs text-indigo-700">interações</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-indigo-900">{prediction.engagement_metrics.days_since_first_contact}</p>
                  <p className="text-xs text-indigo-700">dias contato</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-indigo-900">{prediction.engagement_metrics.days_since_last_interaction}</p>
                  <p className="text-xs text-indigo-700">dias última</p>
                </div>
              </div>
            </div>

            {/* Factors */}
            <div className="space-y-3">
              {prediction.prediction.positive_factors?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <h4 className="text-sm font-semibold text-green-700">Fatores Positivos</h4>
                  </div>
                  <ul className="space-y-1">
                    {prediction.prediction.positive_factors.map((factor, idx) => (
                      <li key={idx} className="text-sm text-slate-700 flex gap-2">
                        <span className="text-green-600">✓</span> {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {prediction.prediction.negative_factors?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <h4 className="text-sm font-semibold text-orange-700">Fatores Negativos</h4>
                  </div>
                  <ul className="space-y-1">
                    {prediction.prediction.negative_factors.map((factor, idx) => (
                      <li key={idx} className="text-sm text-slate-700 flex gap-2">
                        <span className="text-orange-600">⚠</span> {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {prediction.prediction.loss_risks?.length > 0 && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="text-sm font-semibold text-red-900 mb-2">⚠️ Riscos de Perda</h4>
                  <ul className="space-y-1">
                    {prediction.prediction.loss_risks.map((risk, idx) => (
                      <li key={idx} className="text-sm text-red-800">• {risk}</li>
                    ))}
                  </ul>
                </div>
              )}

              {prediction.prediction.actions_to_increase?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">💡 Ações para Aumentar Conversão</h4>
                  <ul className="space-y-1">
                    {prediction.prediction.actions_to_increase.map((action, idx) => (
                      <li key={idx} className="text-sm text-slate-700 flex gap-2">
                        <span className="text-blue-600">→</span> {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Button
              onClick={() => setPrediction(null)}
              variant="outline"
              className="w-full"
            >
              Gerar Nova Predição
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
