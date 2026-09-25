// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Zap, DollarSign, MessageSquare, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function OpportunitySuggestions() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState("");

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => primeos.entities.Customer.list(),
  });

  const analyzCustomer = async () => {
    if (!selectedCustomer) {
      toast.error("Selecione um cliente");
      return;
    }

    setLoading(true);
    try {
      const response = await primeos.functions.invoke('suggestOpportunities', {
        customerId: selectedCustomer
      });

      if (response.data.success) {
        setSuggestions(response.data.data);
        toast.success("Oportunidades identificadas!");
      }
    } catch (error) {
      toast.error("Erro ao analisar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const priorityColors = {
    high: "bg-red-100 text-red-700 border-red-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    low: "bg-blue-100 text-blue-700 border-blue-200"
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-600" />
            Oportunidades Cross-sell / Upsell
          </CardTitle>
          <div className="flex gap-2">
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={analyzCustomer}
              disabled={loading || !selectedCustomer}
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
                  Analisar
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!suggestions && !loading && (
          <div className="text-center py-12 text-slate-500">
            <Zap className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Selecione um cliente para identificar oportunidades</p>
          </div>
        )}

        {suggestions && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
              <p className="text-sm text-slate-700 mb-4">{suggestions.summary}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Oportunidades</p>
                  <p className="text-3xl font-bold text-amber-600">
                    {(suggestions.upsell_opportunities?.length || 0) + 
                     (suggestions.cross_sell_opportunities?.length || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Valor Potencial</p>
                  <p className="text-3xl font-bold text-amber-600">
                    {formatCurrency(suggestions.total_potential_value || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Best Next Action */}
            <div className="p-4 bg-blue-50 rounded-xl border-l-4 border-blue-500">
              <h4 className="font-semibold mb-2 text-blue-900">Melhor Próxima Ação</h4>
              <p className="text-sm text-blue-800">{suggestions.best_next_action}</p>
            </div>

            {/* Upsell Opportunities */}
            {suggestions.upsell_opportunities?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  Oportunidades de Upsell ({suggestions.upsell_opportunities.length})
                </h4>
                <div className="space-y-3">
                  {suggestions.upsell_opportunities.map((opp, idx) => (
                    <Card key={idx} className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h5 className="font-semibold text-slate-900 mb-1">{opp.service}</h5>
                            <p className="text-sm text-slate-600">{opp.reason}</p>
                          </div>
                          <div className="flex flex-col gap-2 items-end">
                            <Badge className={priorityColors[opp.priority]}>
                              {opp.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {opp.success_probability}% chance
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-slate-500">Timing</p>
                            <p className="text-sm font-medium">{opp.timing}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Valor Estimado</p>
                            <p className="text-sm font-medium text-green-600">
                              {formatCurrency(opp.estimated_value)}
                            </p>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-start gap-2 mb-2">
                            <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5" />
                            <span className="text-xs font-medium text-slate-700">Script Sugerido:</span>
                          </div>
                          <p className="text-sm text-slate-600 pl-6">{opp.approach_script}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Cross-sell Opportunities */}
            {suggestions.cross_sell_opportunities?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-purple-600" />
                  Oportunidades de Cross-sell ({suggestions.cross_sell_opportunities.length})
                </h4>
                <div className="space-y-3">
                  {suggestions.cross_sell_opportunities.map((opp, idx) => (
                    <Card key={idx} className="border-l-4 border-l-purple-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h5 className="font-semibold text-slate-900 mb-1">{opp.service}</h5>
                            <p className="text-sm text-slate-600">{opp.reason}</p>
                          </div>
                          <div className="flex flex-col gap-2 items-end">
                            <Badge className={priorityColors[opp.priority]}>
                              {opp.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {opp.success_probability}% chance
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-slate-500">Timing</p>
                            <p className="text-sm font-medium">{opp.timing}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Valor Estimado</p>
                            <p className="text-sm font-medium text-purple-600">
                              {formatCurrency(opp.estimated_value)}
                            </p>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-start gap-2 mb-2">
                            <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5" />
                            <span className="text-xs font-medium text-slate-700">Script Sugerido:</span>
                          </div>
                          <p className="text-sm text-slate-600 pl-6">{opp.approach_script}</p>
                        </div>
                      </CardContent>
                    </Card>
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
