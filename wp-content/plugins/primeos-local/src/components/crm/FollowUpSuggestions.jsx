// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, Copy } from "lucide-react";
import { toast } from "sonner";

export default function FollowUpSuggestions({ lead }) {
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState(null);

  const generateStrategy = async () => {
    setLoading(true);
    try {
      const response = await primeos.functions.invoke('generateFollowUpReminders', {
        leadId: lead.id
      });

      if (response.data.success) {
        setStrategy(response.data.strategy);
        toast.success("Estratégia gerada!");
      }
    } catch (error) {
      toast.error("Erro ao gerar estratégia");
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Mensagem copiada!");
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-600" />
          Estratégia de Follow-up
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!strategy ? (
          <Button
            onClick={generateStrategy}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gerando...
              </>
            ) : (
              "Gerar Sugestões de Follow-up"
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            {/* Timing */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs text-purple-900 font-semibold mb-2">Melhor Momento</p>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="font-medium">Dia:</span> {strategy.optimal_time.day_of_week}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Horário:</span> {strategy.optimal_time.time_range}
                </p>
                <p className="text-xs text-purple-700 mt-2">{strategy.optimal_time.reasoning}</p>
              </div>
            </div>

            {/* Channel & Urgency */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-1">Canal Recomendado</p>
                <Badge className="capitalize">{strategy.recommended_channel}</Badge>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-1">Urgência</p>
                <Badge className="capitalize" variant="outline">{strategy.urgency}</Badge>
              </div>
            </div>

            {/* Approach */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Abordagem Sugerida</h4>
              <p className="text-sm text-slate-700 p-3 bg-slate-50 rounded-lg">{strategy.approach}</p>
            </div>

            {/* Tactics */}
            {strategy.tactics?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Táticas Específicas</h4>
                <ul className="space-y-1">
                  {strategy.tactics.map((tactic, idx) => (
                    <li key={idx} className="text-sm text-slate-700 flex gap-2">
                      <span className="text-purple-600">→</span> {tactic}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Messages */}
            {strategy.message_options?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Mensagens Personalizadas</h4>
                <div className="space-y-3">
                  {strategy.message_options.map((msg, idx) => (
                    <div key={idx} className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline">{msg.title}</Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyMessage(msg.message)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={() => setStrategy(null)}
              variant="outline"
              className="w-full"
            >
              Gerar Nova Estratégia
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
