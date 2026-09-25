// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Sparkles, TrendingUp, AlertCircle, CheckCircle2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const classificationConfig = {
  "muito quente": { color: "bg-red-500", text: "text-red-600", badge: "bg-red-100 text-red-700", label: "🔥 Muito Quente" },
  "quente":       { color: "bg-orange-500", text: "text-orange-600", badge: "bg-orange-100 text-orange-700", label: "🔥 Quente" },
  "morno":        { color: "bg-amber-500", text: "text-amber-600", badge: "bg-amber-100 text-amber-700", label: "🌤️ Morno" },
  "frio":         { color: "bg-blue-400", text: "text-blue-600", badge: "bg-blue-100 text-blue-700", label: "❄️ Frio" },
};

export default function LeadScoreCard({ lead, onScored }) {
  const [loading, setLoading] = useState(false);

  const handleScore = async () => {
    setLoading(true);
    try {
      await primeos.functions.invoke("scoreLeadAI", { lead_id: lead.id });
      toast.success("Score atualizado com IA!");
      onScored?.();
    } catch (e) {
      toast.error("Erro ao calcular score");
    } finally {
      setLoading(false);
    }
  };

  const score = lead.ai_score;
  const analysis = lead.ai_analysis;
  const config = classificationConfig[lead.ai_classification] || classificationConfig["frio"];

  const scoreColor = score >= 75 ? "bg-red-500" : score >= 55 ? "bg-orange-500" : score >= 35 ? "bg-amber-500" : "bg-blue-400";

  return (
    <div className="space-y-4">
      {/* Score Display */}
      <div className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-xl p-4 border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-sm text-slate-700">Score de IA</span>
          </div>
          <Button size="sm" variant="outline" onClick={handleScore} disabled={loading} className="h-7 text-xs">
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
            {loading ? "Analisando..." : "Recalcular"}
          </Button>
        </div>

        {score != null ? (
          <>
            <div className="flex items-end gap-3 mb-2">
              <span className={cn("text-4xl font-black", config.text)}>{score}</span>
              <span className="text-slate-400 text-sm mb-1">/100</span>
              <Badge className={cn("ml-auto text-xs", config.badge)}>{config.label}</Badge>
            </div>
            <Progress value={score} className="h-2 mb-3" indicatorClassName={scoreColor} />

            {lead.ai_conversion_probability != null && (
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                <span className="text-slate-600">Probabilidade de conversão:</span>
                <span className="font-bold text-indigo-600">{lead.ai_conversion_probability}%</span>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-slate-400 text-sm mb-3">Score ainda não calculado</p>
            <Button size="sm" onClick={handleScore} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
              {loading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
              Calcular Score com IA
            </Button>
          </div>
        )}
      </div>

      {/* Analysis Details */}
      {analysis && (
        <>
          {/* Next Best Action */}
          {analysis.next_best_action && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-indigo-700 mb-1 flex items-center gap-1">
                <Zap className="w-3 h-3" /> PRÓXIMA AÇÃO RECOMENDADA
              </p>
              <p className="text-sm text-indigo-800">{analysis.next_best_action}</p>
            </div>
          )}

          {/* Strengths */}
          {analysis.strengths?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Pontos Fortes</p>
              <div className="space-y-1">
                {analysis.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weaknesses */}
          {analysis.weaknesses?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Pontos de Atenção</p>
              <div className="space-y-1">
                {analysis.weaknesses.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                    {w}
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.last_scored && (
            <p className="text-xs text-slate-400 text-right">
              Última análise: {new Date(analysis.last_scored).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </>
      )}
    </div>
  );
}
