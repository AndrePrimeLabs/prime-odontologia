// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, TrendingDown, AlertCircle, Lightbulb, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function FeedbackAnalysis() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [timeRange, setTimeRange] = useState("30");

  const analyzeFeedback = async () => {
    setLoading(true);
    try {
      const response = await primeos.functions.invoke('analyzeFeedback', {
        timeRange: parseInt(timeRange)
      });

      if (response.data.success) {
        setAnalysis(response.data.data);
      }
    } catch (error) {
      toast.error("Erro ao analisar feedback: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Análise de Feedback IA
          </CardTitle>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Última semana</SelectItem>
                <SelectItem value="30">Último mês</SelectItem>
                <SelectItem value="90">Últimos 3 meses</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={analyzeFeedback}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analisar
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!analysis && !loading && (
          <div className="text-center py-8 text-slate-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Selecione o período e clique em "Analisar"</p>
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            {/* Score */}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
              <div className="text-center mb-4">
                <p className="text-sm text-slate-600 mb-2">Score de Satisfação</p>
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  {analysis.satisfaction_score}
                </div>
                <Progress value={analysis.satisfaction_score} className="h-3" />
              </div>
              <p className="text-sm text-slate-700 text-center">{analysis.summary}</p>
            </div>

            {/* Trends */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700">
                  <TrendingUp className="w-4 h-4" />
                  Tendências Positivas
                </h4>
                <div className="space-y-2">
                  {analysis.trends?.positive?.map((trend, idx) => (
                    <div key={idx} className="p-2 bg-green-50 rounded text-sm text-green-800">
                      {trend}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-700">
                  <TrendingDown className="w-4 h-4" />
                  Tendências Negativas
                </h4>
                <div className="space-y-2">
                  {analysis.trends?.negative?.map((trend, idx) => (
                    <div key={idx} className="p-2 bg-red-50 rounded text-sm text-red-800">
                      {trend}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Improvement Areas */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                Áreas de Melhoria
              </h4>
              <div className="space-y-2">
                {analysis.improvement_areas?.map((area, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{area.area}</span>
                      <Badge variant={area.priority === 'high' ? 'destructive' : 'outline'}>
                        {area.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600">{area.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                Recomendações
              </h4>
              <div className="space-y-2">
                {analysis.recommendations?.map((rec, idx) => (
                  <Card key={idx} className="border-l-4 border-l-amber-500">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-medium flex-1">{rec.recommendation}</p>
                        <Badge variant="outline" className="text-xs">
                          Esforço: {rec.effort}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600">{rec.impact}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
