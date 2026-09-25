// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, UserCheck, TrendingUp, Award } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function LeadRoutingRecommendations({ lead, onAssign }) {
  const [loading, setLoading] = useState(false);
  const [routing, setRouting] = useState(null);

  const generateRouting = async () => {
    setLoading(true);
    try {
      const response = await primeos.functions.invoke('routeLead', {
        leadId: lead.id
      });

      if (response.data.success) {
        setRouting(response.data.routing);
        toast.success("Recomendações geradas!");
      }
    } catch (error) {
      toast.error("Erro ao gerar recomendações");
    } finally {
      setLoading(false);
    }
  };

  const assignToAgent = async (agentEmail) => {
    try {
      await primeos.entities.Lead.update(lead.id, {
        ...lead,
        assigned_to: agentEmail
      });
      toast.success("Lead atribuído!");
      onAssign?.();
    } catch (error) {
      toast.error("Erro ao atribuir lead");
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    return "text-slate-600";
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-indigo-600" />
          Roteamento Inteligente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!routing ? (
          <Button
            onClick={generateRouting}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analisando agentes...
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                Encontrar Melhor Agente
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            {/* Overall Recommendation */}
            {routing.overall_recommendation && (
              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <p className="text-sm font-semibold text-indigo-900 mb-1">Recomendação Geral:</p>
                <p className="text-sm text-indigo-800">{routing.overall_recommendation}</p>
              </div>
            )}

            {/* Top Recommendations */}
            <div className="space-y-3">
              {routing.recommendations?.map((rec, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all",
                    idx === 0 ? "border-green-300 bg-gradient-to-br from-green-50 to-emerald-50" : "border-slate-200 bg-slate-50"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {idx === 0 && <Award className="w-5 h-5 text-green-600" />}
                      <div>
                        <h4 className="font-semibold">{rec.agent_name}</h4>
                        <p className="text-xs text-slate-500">{rec.agent_email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn("text-3xl font-bold", getScoreColor(rec.compatibility_score))}>
                        {rec.compatibility_score}
                      </p>
                      <p className="text-xs text-slate-500">compatibilidade</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">
                        {rec.estimated_conversion_rate}% chance de conversão
                      </span>
                    </div>
                  </div>

                  {rec.reasons?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-slate-700 mb-1">Por que este agente?</p>
                      <ul className="space-y-1">
                        {rec.reasons.map((reason, i) => (
                          <li key={i} className="text-xs text-slate-600 flex gap-2">
                            <span className="text-green-600">✓</span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {rec.immediate_action && (
                    <div className="p-2 bg-white rounded-lg mb-3">
                      <p className="text-xs text-slate-500 mb-1">Ação Imediata Sugerida:</p>
                      <p className="text-sm font-medium">{rec.immediate_action}</p>
                    </div>
                  )}

                  <Button
                    size="sm"
                    className={cn(
                      "w-full",
                      idx === 0 ? "bg-green-600 hover:bg-green-700" : ""
                    )}
                    onClick={() => assignToAgent(rec.agent_email)}
                  >
                    Atribuir a {rec.agent_name.split(' ')[0]}
                  </Button>
                </div>
              ))}
            </div>

            <Button
              onClick={() => setRouting(null)}
              variant="outline"
              className="w-full"
            >
              Gerar Novas Recomendações
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
