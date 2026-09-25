import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { primeos } from "@/api/primeosClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, Users, TrendingUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STAGES = [
  { key: "lead",              label: "Lead",           emoji: "🎯", color: "slate",  hex: "#64748b" },
  { key: "contato",           label: "Contato",        emoji: "📞", color: "blue",   hex: "#3b82f6" },
  { key: "avaliacao_marcada", label: "Avaliação",      emoji: "📅", color: "yellow", hex: "#eab308" },
  { key: "compareceu",        label: "Compareceu",     emoji: "✅", color: "orange", hex: "#f97316" },
  { key: "proposta_enviada",  label: "Proposta",       emoji: "📋", color: "purple", hex: "#a855f7" },
  { key: "fechado",           label: "Fechado",        emoji: "🏆", color: "green",  hex: "#22c55e" },
  { key: "perdido",           label: "Perdido",        emoji: "❌", color: "red",    hex: "#ef4444" },
];

const stageBg = {
  slate:  "bg-slate-50 border-slate-200",
  blue:   "bg-blue-50 border-blue-200",
  yellow: "bg-yellow-50 border-yellow-200",
  orange: "bg-orange-50 border-orange-200",
  purple: "bg-purple-50 border-purple-200",
  green:  "bg-green-50 border-green-200",
  red:    "bg-red-50 border-red-200",
};

const stageHeader = {
  slate:  "bg-slate-500",
  blue:   "bg-blue-500",
  yellow: "bg-yellow-500",
  orange: "bg-orange-500",
  purple: "bg-purple-500",
  green:  "bg-green-500",
  red:    "bg-red-500",
};

const cardBorder = {
  slate:  "border-l-slate-400",
  blue:   "border-l-blue-400",
  yellow: "border-l-yellow-400",
  orange: "border-l-orange-400",
  purple: "border-l-purple-400",
  green:  "border-l-green-400",
  red:    "border-l-red-400",
};

const sourceColors = {
  instagram:    "bg-pink-100 text-pink-700",
  whatsapp:     "bg-green-100 text-green-700",
  google:       "bg-blue-100 text-blue-700",
  indicacao:    "bg-yellow-100 text-yellow-700",
  trafego_pago: "bg-purple-100 text-purple-700",
  outro:        "bg-slate-100 text-slate-600",
};

export default function PrimeFunnel({ leads, onAddLead }) {
  const queryClient = useQueryClient();
  const [draggingId, setDraggingId] = useState(null);

  const updateLead = useMutation({
    mutationFn: ({ id, status }) => primeos.entities.PrimeFunnelLead.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["PrimeFunnelLead"] }),
    onError: () => toast.error("Erro ao mover lead"),
  });

  const handleDragEnd = (result) => {
    setDraggingId(null);
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;
    const lead = leads.find(l => l.id === draggableId);
    if (!lead || lead.status === newStatus) return;
    updateLead.mutate({ id: draggableId, status: newStatus });
    toast.success(`Lead movido para ${STAGES.find(s => s.key === newStatus)?.label}`);
  };

  // Stats
  const totalLeads = leads.filter(l => !["fechado", "perdido"].includes(l.status)).length;
  const receitaFechada = leads.filter(l => l.status === "fechado").reduce((s, l) => s + (l.ticket_estimado || 0), 0);
  const receitaPotencial = leads.filter(l => !["perdido"].includes(l.status)).reduce((s, l) => s + (l.ticket_estimado || 0), 0);
  const taxaConversao = leads.length > 0 ? Math.round((leads.filter(l => l.status === "fechado").length / leads.length) * 100) : 0;

  const maxCount = Math.max(...STAGES.slice(0, -1).map(s => leads.filter(l => l.status === s.key).length), 1);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-bold text-slate-900 text-lg">🎯 Prime Funnel — Pipeline de Pacientes</h2>
        <Button size="sm" onClick={onAddLead} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-1" />Novo Lead
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Leads Ativos", value: totalLeads, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Receita Fechada", value: `R$ ${receitaFechada.toLocaleString("pt-BR")}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
          { label: "Receita Potencial", value: `R$ ${receitaPotencial.toLocaleString("pt-BR")}`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Taxa de Conversão", value: `${taxaConversao}%`, icon: ChevronDown, color: "text-orange-600", bg: "bg-orange-50" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-3 flex items-center gap-3">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", s.bg)}>
                  <Icon className={cn("w-4 h-4", s.color)} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className="text-base font-bold text-slate-900">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Funnel Visual + Kanban */}
      <DragDropContext onDragEnd={handleDragEnd} onDragStart={r => setDraggingId(r.draggableId)}>
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-[900px]">
            {STAGES.map((stage, idx) => {
              const items = leads.filter(l => l.status === stage.key);
              const count = items.length;
              const receita = items.reduce((s, l) => s + (l.ticket_estimado || 0), 0);
              // funnel width: wider at top, narrower toward bottom (excluding "perdido")
              const isLast = stage.key === "perdido";
              const funnelPct = isLast ? 100 : Math.max(40, Math.round((count / maxCount) * 100));

              return (
                <div key={stage.key} className="flex-1 min-w-[110px] flex flex-col">
                  {/* Funnel bar visual */}
                  {!isLast && (
                    <div className="flex flex-col items-center mb-2">
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${funnelPct}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.05 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: stage.hex }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Stage header */}
                  <div className={cn("rounded-t-xl px-3 py-2.5 text-white text-center", stageHeader[stage.color])}>
                    <div className="text-base">{stage.emoji}</div>
                    <div className="text-xs font-bold leading-tight">{stage.label}</div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <span className="text-xs bg-white/20 rounded-full px-1.5 py-0.5 font-bold">{count}</span>
                    </div>
                    {receita > 0 && (
                      <div className="text-xs mt-0.5 opacity-90 font-medium">
                        R$ {receita >= 1000 ? `${(receita / 1000).toFixed(0)}k` : receita.toLocaleString("pt-BR")}
                      </div>
                    )}
                  </div>

                  {/* Droppable cards area */}
                  <Droppable droppableId={stage.key}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "flex-1 rounded-b-xl border-2 border-t-0 p-2 space-y-1.5 min-h-[180px] transition-colors",
                          stageBg[stage.color],
                          snapshot.isDraggingOver && "ring-2 ring-offset-1",
                        )}
                        style={snapshot.isDraggingOver ? { ringColor: stage.hex } : {}}
                      >
                        {items.map((lead, i) => (
                          <Draggable key={lead.id} draggableId={lead.id} index={i}>
                            {(prov, snap) => (
                              <div
                                ref={prov.innerRef}
                                {...prov.draggableProps}
                                {...prov.dragHandleProps}
                                className={cn(
                                  "bg-white rounded-lg border-l-4 p-2 shadow-sm cursor-grab active:cursor-grabbing transition-shadow text-left",
                                  cardBorder[stage.color],
                                  snap.isDragging && "shadow-lg rotate-1 scale-105"
                                )}
                              >
                                <p className="text-xs font-semibold text-slate-900 truncate leading-tight">{lead.nome}</p>
                                {lead.procedimento && (
                                  <p className="text-xs text-slate-500 truncate mt-0.5">{lead.procedimento}</p>
                                )}
                                <div className="flex items-center justify-between mt-1 gap-1 flex-wrap">
                                  {lead.ticket_estimado > 0 && (
                                    <span className="text-xs font-bold text-green-600">
                                      R$ {lead.ticket_estimado >= 1000 ? `${(lead.ticket_estimado / 1000).toFixed(0)}k` : lead.ticket_estimado}
                                    </span>
                                  )}
                                  {lead.lead_source && (
                                    <span className={cn("text-xs px-1 py-0.5 rounded-full leading-tight", sourceColors[lead.lead_source] || "bg-slate-100 text-slate-500")}>
                                      {lead.lead_source}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {items.length === 0 && !snapshot.isDraggingOver && (
                          <div className="flex items-center justify-center h-16 text-slate-300 text-xs">
                            Solte aqui
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </div>
      </DragDropContext>

      {/* Conversion flow */}
      <div className="bg-white rounded-xl border p-4 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Fluxo de Conversão</p>
        <div className="flex items-center gap-1 flex-wrap">
          {STAGES.filter(s => s.key !== "perdido").map((stage, i) => {
            const count = leads.filter(l => l.status === stage.key).length;
            return (
              <div key={stage.key} className="flex items-center gap-1">
                <div className="flex flex-col items-center">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold", stageHeader[stage.color])}>
                    {count}
                  </div>
                  <span className="text-xs text-slate-500 mt-0.5 text-center leading-tight w-14">{stage.label}</span>
                </div>
                {i < STAGES.length - 2 && <ChevronDown className="w-3 h-3 text-slate-300 rotate-[-90deg] mx-0.5 flex-shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}