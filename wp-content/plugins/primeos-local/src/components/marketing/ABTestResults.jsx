// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function ABTestResults({ test, onAnalyze }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const analyzeResults = async () => {
    setAnalyzing(true);
    try {
      const response = await primeos.functions.invoke('analyzeABTestResults', {
        testId: test.id
      });

      if (response.data.success) {
        setAnalysis(response.data.results);
        toast.success("Análise concluída!");
      }
    } catch (error) {
      toast.error("Erro na análise: " + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  if (!analysis) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{test.test_name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Teste A/B em status: <Badge>{test.status}</Badge>
          </p>
          <Button
            onClick={analyzeResults}
            disabled={analyzing || test.status !== "running"}
            className="w-full gap-2"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4" />
                Analisar Resultados
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const metricsA = analysis.variant_a;
  const metricsB = analysis.variant_b;
  const winner = analysis.winner;

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="text-center text-xl">🏆 {winner}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 text-center">Variante com melhor performance</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Variant A */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Variante A</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-slate-600">Taxa de Abertura</p>
              <div className="flex items-end gap-2 mt-1">
                <p className="text-xl font-bold">{metricsA.openRate.toFixed(2)}%</p>
                <Progress value={metricsA.openRate} className="flex-1" />
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-600">Taxa de Clique</p>
              <div className="flex items-end gap-2 mt-1">
                <p className="text-xl font-bold">{metricsA.clickRate.toFixed(2)}%</p>
                <Progress value={metricsA.clickRate} className="flex-1" />
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-600">Taxa de Conversão</p>
              <div className="flex items-end gap-2 mt-1">
                <p className="text-xl font-bold">{metricsA.conversion.toFixed(2)}%</p>
                <Progress value={metricsA.conversion} className="flex-1" />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded">
              <p className="text-xs text-slate-600">Score Geral</p>
              <p className="text-2xl font-bold mt-1">{metricsA.score.toFixed(1)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Variant B */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Variante B</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-slate-600">Taxa de Abertura</p>
              <div className="flex items-end gap-2 mt-1">
                <p className="text-xl font-bold">{metricsB.openRate.toFixed(2)}%</p>
                <Progress value={metricsB.openRate} className="flex-1" />
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-600">Taxa de Clique</p>
              <div className="flex items-end gap-2 mt-1">
                <p className="text-xl font-bold">{metricsB.clickRate.toFixed(2)}%</p>
                <Progress value={metricsB.clickRate} className="flex-1" />
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-600">Taxa de Conversão</p>
              <div className="flex items-end gap-2 mt-1">
                <p className="text-xl font-bold">{metricsB.conversion.toFixed(2)}%</p>
                <Progress value={metricsB.conversion} className="flex-1" />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded">
              <p className="text-xs text-slate-600">Score Geral</p>
              <p className="text-2xl font-bold mt-1">{metricsB.score.toFixed(1)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Análise de IA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Principais Insights</h4>
            <ul className="space-y-1">
              {analysis.insights?.map((insight, idx) => (
                <li key={idx} className="text-sm text-slate-700 flex gap-2">
                  <span className="text-amber-600">✓</span> {insight}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Recomendações</h4>
            <ul className="space-y-1">
              {analysis.recommendations?.map((rec, idx) => (
                <li key={idx} className="text-sm text-slate-700 flex gap-2">
                  <span className="text-blue-600">→</span> {rec}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 bg-blue-50 rounded">
            <p className="text-xs text-slate-600 mb-1">Nível de Confiança</p>
            <div className="flex items-center gap-2">
              <Progress value={analysis.confidence * 100} className="flex-1" />
              <p className="font-semibold text-sm">{(analysis.confidence * 100).toFixed(0)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
