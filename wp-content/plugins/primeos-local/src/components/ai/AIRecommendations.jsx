// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Star, DollarSign, Lightbulb } from "lucide-react";
import { toast } from "sonner";

export default function AIRecommendations({ contact, contactType }) {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      const response = await primeos.functions.invoke('generateAIInsights', {
        contactId: contact.id,
        contactType,
        action: 'recommendations'
      });

      if (response.data.success) {
        setRecommendations(response.data.data.recommendations);
      }
    } catch (error) {
      toast.error("Erro ao gerar recomendações: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            Recomendações Personalizadas
          </CardTitle>
          <Button
            size="sm"
            onClick={generateRecommendations}
            disabled={loading}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Recomendações
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!recommendations && !loading && (
          <div className="text-center py-8 text-slate-500">
            <Lightbulb className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Receba sugestões personalizadas de produtos/serviços</p>
          </div>
        )}

        {recommendations && (
          <div className="space-y-4">
            {recommendations.map((rec, idx) => (
              <Card key={idx} className="border-2 border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 mb-1">
                        {rec.product_service}
                      </h4>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs bg-white">
                          <Star className="w-3 h-3 mr-1 text-amber-500" />
                          Fit: {rec.fit_score}/10
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-white">
                          <DollarSign className="w-3 h-3 mr-1 text-green-500" />
                          {rec.expected_value}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-700 mb-3">{rec.reasoning}</p>

                  {rec.pitch_points?.length > 0 && (
                    <div className="bg-white/60 p-3 rounded-lg">
                      <p className="text-xs font-semibold text-slate-700 mb-2">
                        Pontos de Venda:
                      </p>
                      <ul className="space-y-1">
                        {rec.pitch_points.map((point, pointIdx) => (
                          <li
                            key={pointIdx}
                            className="flex items-start gap-2 text-xs text-slate-600"
                          >
                            <div className="w-1 h-1 rounded-full bg-amber-600 mt-1.5 flex-shrink-0" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
