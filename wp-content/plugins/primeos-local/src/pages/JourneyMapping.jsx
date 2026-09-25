// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { primeos } from "@/api/primeosClient";
import PageHeader from "@/components/shared/PageHeader";
import JourneyVisualization from "@/components/journey/JourneyVisualization";
import JourneyStageCard from "@/components/journey/JourneyStageCard";
import TouchpointRecommendations from "@/components/journey/TouchpointRecommendations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, Map } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_STAGES = [
  { stage: "awareness", description: "Cliente toma conhecimento da marca", characteristics: ["Problema identificado", "Busca soluções", "Conheça a Prime"] },
  { stage: "consideration", description: "Cliente pesquisa e compara opções", characteristics: ["Comparação", "Avaliação", "Interesse ativo"] },
  { stage: "decision", description: "Cliente decide comprar", characteristics: ["Proposta", "Negogiação", "Fechamento"] },
  { stage: "retention", description: "Engajamento pós-venda", characteristics: ["Satisfação", "Relacionamento", "Lealdade"] },
  { stage: "advocacy", description: "Cliente recomenda a marca", characteristics: ["Referência", "Feedback positivo", "Defensor da marca"] }
];

export default function JourneyMapping() {
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [journeyAnalysis, setJourneyAnalysis] = useState(null);
  const [stages, setStages] = useState(DEFAULT_STAGES);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => primeos.entities.Customer.list(),
  });

  const analyzeJourney = async () => {
    if (!selectedCustomer) {
      toast.error("Selecione um cliente");
      return;
    }

    setLoading(true);
    try {
      const response = await primeos.functions.invoke('analyzeCustomerJourney', {
        customerId: selectedCustomer
      });

      if (response.data.success) {
        setJourneyAnalysis(response.data.data);
        toast.success("Jornada analisada!");
      }
    } catch (error) {
      toast.error("Erro ao analisar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStage = (index, updatedStage) => {
    const newStages = [...stages];
    newStages[index] = updatedStage;
    setStages(newStages);
    toast.success("Estágio atualizado");
  };

  const handleRemoveStage = (index) => {
    const newStages = stages.filter((_, i) => i !== index);
    setStages(newStages);
    toast.success("Estágio removido");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Mapeamento de Jornada do Cliente"
          subtitle="Visualize os estágios, interações e otimize touchpoints com IA"
          icon={Map}
        />

        {/* Customer Selection */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Selecione um cliente</label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um cliente para analisar" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={analyzeJourney}
                disabled={loading || !selectedCustomer}
                className="bg-blue-600 hover:bg-blue-700 gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analisar com IA
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {journeyAnalysis && (
          <>
            {/* Journey Visualization */}
            <JourneyVisualization
              stages={stages}
              currentStage={journeyAnalysis.current_stage}
              progress={journeyAnalysis.stage_progress}
            />

            {/* Touchpoint Recommendations */}
            <TouchpointRecommendations
              touchpoints={journeyAnalysis.optimal_touchpoints}
              strategies={journeyAnalysis.communication_strategies}
            />

            {/* Journey Stages - Editable */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Estágios da Jornada</CardTitle>
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? "Pronto" : "Editar"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {stages.map((stage, idx) => (
                    <JourneyStageCard
                      key={idx}
                      stage={stage}
                      stageIndex={idx}
                      onUpdate={handleUpdateStage}
                      onRemove={handleRemoveStage}
                      isEditing={isEditing}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Risks and Opportunities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm border-l-4 border-l-red-500">
                <CardHeader>
                  <CardTitle className="text-base">Riscos Identificados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {journeyAnalysis.risks?.map((risk, idx) => (
                    <div key={idx} className="p-3 bg-red-50 rounded-lg">
                      <p className="font-medium text-sm text-red-900">{risk.risk}</p>
                      <p className="text-xs text-red-700 mt-1">
                        <strong>Probabilidade:</strong> {risk.probability}
                      </p>
                      <p className="text-xs text-red-700">
                        <strong>Mitigação:</strong> {risk.mitigation}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="text-base">Oportunidades</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {journeyAnalysis.opportunities?.map((opp, idx) => (
                      <li key={idx} className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-900">✓ {opp}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Next Actions */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Próximas Ações Recomendadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {journeyAnalysis.next_actions?.map((action, idx) => (
                    <div key={idx} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">→</span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">{action.action}</h4>
                          <p className="text-xs text-slate-600 mt-1">
                            <strong>Timeline:</strong> {action.timeline}
                          </p>
                          <p className="text-xs text-slate-600">
                            <strong>Resultado esperado:</strong> {action.expected_outcome}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
