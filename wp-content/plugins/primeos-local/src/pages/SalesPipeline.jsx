// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Users, Target } from "lucide-react";
import { toast } from "sonner";

const stages = [
  { id: "new", name: "Novos Leads", color: "bg-slate-100" },
  { id: "contacted", name: "Contatados", color: "bg-blue-100" },
  { id: "qualified", name: "Qualificados", color: "bg-purple-100" },
  { id: "proposal", name: "Proposta", color: "bg-indigo-100" },
  { id: "negotiation", name: "Negociação", color: "bg-orange-100" },
  { id: "closed_won", name: "Ganho", color: "bg-green-100" },
  { id: "closed_lost", name: "Perdido", color: "bg-red-100" },
];

export default function SalesPipeline() {
  const queryClient = useQueryClient();
  const [selectedStage, setSelectedStage] = useState(null);

  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: () => primeos.entities.Lead.list(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.Lead.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead atualizado!");
    },
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const leadId = result.draggableId;
    const newStage = result.destination.droppableId;
    const lead = leads.find((l) => l.id === leadId);

    if (lead && lead.stage !== newStage) {
      updateMutation.mutate({
        id: leadId,
        data: { ...lead, stage: newStage },
      });
    }
  };

  const getLeadsByStage = (stageId) => {
    return leads.filter((lead) => lead.stage === stageId);
  };

  const getStageValue = (stageId) => {
    return getLeadsByStage(stageId).reduce(
      (sum, lead) => sum + (lead.estimated_value || 0),
      0
    );
  };

  const totalValue = leads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0);
  const qualifiedLeads = leads.filter((l) => 
    ["qualified", "proposal", "negotiation"].includes(l.stage)
  ).length;
  const conversionRate = leads.length > 0 
    ? ((leads.filter(l => l.stage === "closed_won").length / leads.length) * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6">
      <div className="max-w-[1800px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Pipeline de Vendas</h1>
              <p className="text-slate-500 mt-1">
                Arraste os leads entre as etapas do funil
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total no Pipeline</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    R$ {totalValue.toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total de Leads</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{leads.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Leads Qualificados</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{qualifiedLeads}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Taxa de Conversão</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{conversionRate}%</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kanban Board */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stages.map((stage) => {
              const stageLeads = getLeadsByStage(stage.id);
              const stageValue = getStageValue(stage.id);

              return (
                <div key={stage.id} className="flex-shrink-0 w-80">
                  <Card className="border-0 shadow-sm h-full">
                    <CardHeader className={`${stage.color} border-b`}>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold">
                          {stage.name}
                        </CardTitle>
                        <Badge variant="outline" className="bg-white">
                          {stageLeads.length}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        R$ {stageValue.toLocaleString("pt-BR")}
                      </p>
                    </CardHeader>
                    <Droppable droppableId={stage.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`p-3 min-h-[500px] space-y-3 ${
                            snapshot.isDraggingOver ? "bg-blue-50" : ""
                          }`}
                        >
                          {stageLeads.map((lead, index) => (
                            <Draggable
                              key={lead.id}
                              draggableId={lead.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`p-4 cursor-move hover:shadow-md transition-shadow ${
                                    snapshot.isDragging ? "shadow-lg" : ""
                                  }`}
                                >
                                  <h4 className="font-semibold text-slate-900 mb-2">
                                    {lead.name}
                                  </h4>
                                  <div className="space-y-1 text-sm text-slate-600">
                                    {lead.email && (
                                      <p className="truncate">{lead.email}</p>
                                    )}
                                    {lead.phone && <p>{lead.phone}</p>}
                                    {lead.estimated_value > 0 && (
                                      <p className="font-semibold text-green-600">
                                        R$ {lead.estimated_value.toLocaleString("pt-BR")}
                                      </p>
                                    )}
                                    {lead.score > 0 && (
                                      <Badge className="bg-blue-100 text-blue-700">
                                        Score: {lead.score}
                                      </Badge>
                                    )}
                                  </div>
                                </Card>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </Card>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
