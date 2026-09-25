// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AILeadScoring({ contact, contactType, onScoreUpdate }) {
  const [loading, setLoading] = useState(false);
  const [scoring, setScoring] = useState(null);

  const calculateScore = async () => {
    setLoading(true);
    try {
      const response = await primeos.functions.invoke('generateAIInsights', {
        contactId: contact.id,
        contactType,
        action: 'lead_score'
      });

      if (response.data.success) {
        setScoring(response.data.data);
        
        // Update contact score
        if (onScoreUpdate) {
          onScoreUpdate(response.data.data.score);
        }
      }
    } catch (error) {
      toast.error("Erro ao calcular score: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const impactIcons = {
    positive: TrendingUp,
    negative: TrendingDown,
    neutral: Minus
  };

  const impactColors = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-slate-600"
  };

  const priorityConfig = {
    hot: { color: "bg-red-500", label: "🔥 Quente" },
    warm: { color: "bg-amber-500", label: "🌡️ Morno" },
    cold: { color: "bg-blue-500", label: "❄️ Frio" }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            Score de Lead IA
          </CardTitle>
          <Button
            size="sm"
            onClick={calculateScore}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Calculando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Calcular Score
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!scoring && !loading && (
          <div className="text-center py-8 text-slate-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Calcule o score IA para obter análise detalhada</p>
          </div>
        )}

        {scoring && (
          <div className="space-y-4">
            {/* Score Display */}
            <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
              <div className="text-center mb-4">
                <div className="text-5xl font-bold text-indigo-600 mb-2">
                  {scoring.score}
                </div>
                <Progress value={scoring.score} className="h-3 mb-2" />
                <Badge
                  className={`${priorityConfig[scoring.priority_level]?.color} text-white`}
                >
                  {priorityConfig[scoring.priority_level]?.label}
                </Badge>
              </div>
              <p className="text-sm text-slate-700 text-center">
                {scoring.recommendation}
              </p>
            </div>

            {/* Factors Breakdown */}
            <div>
              <h4 className="font-semibold mb-3 text-slate-900">
                Fatores de Pontuação
              </h4>
              <div className="space-y-2">
                {scoring.factors?.map((factor, idx) => {
                  const Icon = impactIcons[factor.impact];
                  const colorClass = impactColors[factor.impact];
                  
                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                    >
                      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${colorClass}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{factor.factor}</span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${colorClass}`}
                          >
                            {factor.points > 0 ? '+' : ''}{factor.points}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600">{factor.explanation}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
