// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Clock, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AIActionSuggestions({ contact, contactType }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const response = await primeos.functions.invoke('generateAIInsights', {
        contactId: contact.id,
        contactType,
        action: 'next_actions'
      });

      if (response.data.success) {
        setSuggestions(response.data.data.suggestions);
      }
    } catch (error) {
      toast.error("Erro ao gerar sugestões: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const priorityConfig = {
    high: { color: "bg-red-100 text-red-700 border-red-300", icon: AlertCircle },
    medium: { color: "bg-amber-100 text-amber-700 border-amber-300", icon: Clock },
    low: { color: "bg-blue-100 text-blue-700 border-blue-300", icon: CheckCircle2 }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Ações Sugeridas por IA
          </CardTitle>
          <Button
            size="sm"
            onClick={generateSuggestions}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Sugestões
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!suggestions && !loading && (
          <div className="text-center py-8 text-slate-500">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Clique em "Gerar Sugestões" para obter recomendações personalizadas</p>
          </div>
        )}

        {suggestions && (
          <div className="space-y-3">
            {suggestions.map((suggestion, idx) => {
              const config = priorityConfig[suggestion.priority] || priorityConfig.medium;
              const Icon = config.icon;
              
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-2 ${config.color}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold">{suggestion.action}</h4>
                        <Badge variant="outline" className="text-xs">
                          {suggestion.priority}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{suggestion.reason}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <Clock className="w-3 h-3" />
                        <span>{suggestion.timing}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
