// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Zap, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function AILeadScoring({ lead, onScored }) {
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(lead.ai_score ? {
    score: lead.ai_score,
    classification: lead.ai_classification,
    conversion_probability: lead.ai_conversion_probability,
    reasons: lead.ai_analysis?.reasons || [],
    strengths: lead.ai_analysis?.strengths || [],
    weaknesses: lead.ai_analysis?.weaknesses || [],
    next_best_action: lead.ai_analysis?.next_best_action
  } : null);

  const calculateScore = async () => {
    setLoading(true);
    try {
      const response = await primeos.functions.invoke('calculateLeadScore', {
        leadId: lead.id
      });

      if (response.data.success) {
        setScore(response.data.score);
        toast.success(response.data.message);
        onScored?.();
      }
    } catch (error) {
      toast.error("Erro ao calcular score");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-orange-600 bg-orange-50";
    return "text-blue-600 bg-blue-50";
  };

  const getClassificationBadge = (classification) => {
    const colors = {
      "muito quente": "bg-red-600",
      "quente": "bg-orange-600",
      "morno": "bg-yellow-600",
      "frio": "bg-blue-600"
    };
    return colors[classification?.toLowerCase()] || "bg-gray-600";
  };

  if (!score) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-600" />
            AI Lead Scoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={calculateScore}
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Calculando...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Calcular Score de IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Score de IA
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={calculateScore}
            disabled={loading}
          >
            Recalcular
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Score */}
        <div className={`p-6 rounded-xl ${getScoreColor(score.score)}`}>
          <div className="text-center">
            <p className="text-5xl font-bold">{score.score}</p>
            <p className="text-sm mt-1">Score do Lead</p>
            <Progress value={score.score} className="mt-3" />
          </div>
          <div className="flex justify-center gap-2 mt-4">
            <Badge className={getClassificationBadge(score.classification)}>
              {score.classification}
            </Badge>
            <Badge variant="outline">
              {score.conversion_probability}% conversão
            </Badge>
          </div>
        </div>

        {/* Analysis */}
        <div className="space-y-4">
          {score.reasons?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Razões do Score</h4>
              <ul className="space-y-1">
                {score.reasons.map((reason, idx) => (
                  <li key={idx} className="text-sm text-slate-700 flex gap-2">
                    <span>•</span> {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {score.strengths?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 text-green-700">✓ Pontos Fortes</h4>
              <ul className="space-y-1">
                {score.strengths.map((strength, idx) => (
                  <li key={idx} className="text-sm text-slate-700">• {strength}</li>
                ))}
              </ul>
            </div>
          )}

          {score.weaknesses?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 text-orange-700">⚠ Pontos Fracos</h4>
              <ul className="space-y-1">
                {score.weaknesses.map((weakness, idx) => (
                  <li key={idx} className="text-sm text-slate-700">• {weakness}</li>
                ))}
              </ul>
            </div>
          )}

          {score.next_best_action && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-semibold mb-1 text-blue-900">Próxima Melhor Ação</h4>
              <p className="text-sm text-blue-800">{score.next_best_action}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
