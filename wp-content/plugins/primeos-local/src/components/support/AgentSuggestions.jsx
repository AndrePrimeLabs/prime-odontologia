// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Copy, Lightbulb } from "lucide-react";
import { toast } from "sonner";

export default function AgentSuggestions({ ticket }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const response = await primeos.functions.invoke('generateSupportSuggestions', {
        ticketId: ticket.id
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

  const copySuggestion = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="w-5 h-5 text-amber-600" />
          Sugestões de Resposta
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
                Gerando...
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4" />
                Gerar Sugestões de Resposta
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion, idx) => (
              <div key={idx} className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start justify-between mb-2">
                  <Badge className="bg-amber-600 capitalize">{suggestion.type}</Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copySuggestion(suggestion.content)}
                    className="h-7 w-7 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{suggestion.content}</p>
              </div>
            ))}

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
