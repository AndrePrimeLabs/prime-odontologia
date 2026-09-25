// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Zap, Copy, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function NextActionSuggestions({ lead }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const response = await primeos.functions.invoke('suggestNextAction', {
        leadId: lead.id
      });

      if (response.data.success) {
        setSuggestions(response.data.suggestions);
        toast.success("Sugestões geradas!");
      }
    } catch (error) {
      toast.error("Erro ao gerar sugestões");
    } finally {
      setLoading(false);
    }
  };

  const copyTemplate = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Template copiado!");
  };

  const getPriorityColor = (priority) => {
    const colors = {
      alta: "bg-red-100 text-red-700 border-red-200",
      media: "bg-yellow-100 text-yellow-700 border-yellow-200",
      baixa: "bg-blue-100 text-blue-700 border-blue-200"
    };
    return colors[priority?.toLowerCase()] || colors.media;
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-600" />
          Próximas Ações Sugeridas (IA)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!suggestions ? (
          <Button
            onClick={generateSuggestions}
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Gerar Sugestões de Ação
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            {/* Boost Indicator */}
            {suggestions.estimated_conversion_boost > 0 && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-semibold text-green-900">
                  ⚡ Aumento estimado na conversão: +{suggestions.estimated_conversion_boost}%
                </p>
              </div>
            )}

            {/* Reasoning */}
            {suggestions.reasoning && (
              <p className="text-sm text-slate-600 italic">{suggestions.reasoning}</p>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {suggestions.actions?.map((action, idx) => (
                <div key={idx} className={cn("p-4 rounded-xl border-2", getPriorityColor(action.priority))}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">#{idx + 1}</span>
                      <h4 className="font-semibold">{action.title}</h4>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="capitalize">{action.priority}</Badge>
                      <Badge variant="outline">{action.success_probability}% sucesso</Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm mb-3">{action.description}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <span className="text-slate-500">Urgência:</span>
                      <span className="font-medium ml-1 capitalize">{action.urgency}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Canal:</span>
                      <span className="font-medium ml-1 capitalize">{action.channel}</span>
                    </div>
                  </div>

                  <div className="p-2 bg-white rounded-lg mb-2">
                    <p className="text-xs text-slate-500 mb-1">Objetivo:</p>
                    <p className="text-sm font-medium">{action.objective}</p>
                  </div>

                  {action.message_template && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-slate-700">Template de Mensagem:</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyTemplate(action.message_template)}
                          className="h-6 px-2"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{action.message_template}</p>
                    </div>
                  )}

                  <Button
                    size="sm"
                    className="w-full mt-3"
                    variant="outline"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Executar Ação
                  </Button>
                </div>
              ))}
            </div>

            <Button
              onClick={() => setSuggestions(null)}
              variant="outline"
              className="w-full"
            >
              Gerar Novas Sugestões
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
