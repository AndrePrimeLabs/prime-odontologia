// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Sparkles, Loader2, Smile, Meh, Frown, TrendingUp, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function AIInteractionSummary({ contact, contactType }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  const generateSummary = async () => {
    setLoading(true);
    try {
      const response = await primeos.functions.invoke('generateAIInsights', {
        contactId: contact.id,
        contactType,
        action: 'interaction_summary'
      });

      if (response.data.success) {
        setSummary(response.data.data);
      }
    } catch (error) {
      toast.error("Erro ao gerar resumo: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const sentimentConfig = {
    positive: { icon: Smile, color: "text-green-600", bg: "bg-green-50" },
    neutral: { icon: Meh, color: "text-amber-600", bg: "bg-amber-50" },
    negative: { icon: Frown, color: "text-red-600", bg: "bg-red-50" }
  };

  const engagementConfig = {
    high: { label: "Alto", color: "text-green-600" },
    medium: { label: "Médio", color: "text-amber-600" },
    low: { label: "Baixo", color: "text-red-600" }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Resumo Executivo IA
          </CardTitle>
          <Button
            size="sm"
            onClick={generateSummary}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Resumo
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!summary && !loading && (
          <div className="text-center py-8 text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Gere um resumo automático de todas as interações</p>
          </div>
        )}

        {summary && (
          <div className="space-y-4">
            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-lg ${sentimentConfig[summary.sentiment]?.bg}`}>
                <div className="flex items-center gap-2 mb-1">
                  {(() => {
                    const Icon = sentimentConfig[summary.sentiment]?.icon;
                    return <Icon className={`w-4 h-4 ${sentimentConfig[summary.sentiment]?.color}`} />;
                  })()}
                  <span className="text-xs text-slate-600">Sentimento</span>
                </div>
                <p className={`font-bold capitalize ${sentimentConfig[summary.sentiment]?.color}`}>
                  {summary.sentiment}
                </p>
              </div>

              <div className="p-3 bg-indigo-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs text-slate-600">Engajamento</span>
                </div>
                <p className={`font-bold ${engagementConfig[summary.engagement_level]?.color}`}>
                  {engagementConfig[summary.engagement_level]?.label}
                </p>
              </div>
            </div>

            {/* Summary Text */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-700 leading-relaxed">{summary.summary}</p>
            </div>

            {/* Key Points */}
            {summary.key_points?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Pontos-Chave
                </h4>
                <ul className="space-y-2">
                  {summary.key_points.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2 flex-shrink-0" />
                      <span className="text-slate-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Concerns */}
            {summary.concerns?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Preocupações
                </h4>
                <div className="space-y-2">
                  {summary.concerns.map((concern, idx) => (
                    <div key={idx} className="p-2 bg-red-50 rounded text-sm text-red-700">
                      {concern}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Opportunities */}
            {summary.opportunities?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  Oportunidades
                </h4>
                <div className="space-y-2">
                  {summary.opportunities.map((opp, idx) => (
                    <div key={idx} className="p-2 bg-green-50 rounded text-sm text-green-700">
                      {opp}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
