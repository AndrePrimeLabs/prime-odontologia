// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  User, MessageCircle, Calendar, Stethoscope, Heart, RefreshCcw,
  ArrowRight, TrendingUp, Star, Instagram, Facebook, Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const journeyStages = [
  { id: "lead", label: "Lead", icon: User, color: "bg-slate-400" },
  { id: "primeiro_contato", label: "1º Contato", icon: MessageCircle, color: "bg-green-500" },
  { id: "agendamento", label: "Agendamento", icon: Calendar, color: "bg-blue-500" },
  { id: "consulta", label: "Consulta", icon: Stethoscope, color: "bg-purple-500" },
  { id: "tratamento", label: "Tratamento", icon: Heart, color: "bg-rose-500" },
  { id: "pos_tratamento", label: "Pós-Trat.", icon: Star, color: "bg-amber-500" },
  { id: "retorno", label: "Retorno", icon: RefreshCcw, color: "bg-teal-500" },
  { id: "fidelizado", label: "Fidelizado", icon: TrendingUp, color: "bg-emerald-500" }
];

const entryChannels = {
  whatsapp: { label: "WhatsApp", icon: MessageCircle, color: "text-green-600" },
  instagram: { label: "Instagram", icon: Instagram, color: "text-pink-600" },
  facebook: { label: "Facebook", icon: Facebook, color: "text-blue-600" },
  indicacao: { label: "Indicação", icon: User, color: "text-purple-600" },
  google: { label: "Google", icon: Search, color: "text-orange-600" }
};

export default function JornadaCliente() {
  const [selectedStage, setSelectedStage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const queryClient = useQueryClient();

  const { data: journeys = [] } = useQuery({
    queryKey: ["clientJourneys"],
    queryFn: () => primeos.entities.ClientJourney.list("-created_date")
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => primeos.entities.Customer.list()
  });

  const updateJourneyMutation = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.ClientJourney.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientJourneys"] });
      toast.success("Jornada atualizada!");
    }
  });

  const createJourneyMutation = useMutation({
    mutationFn: (data) => primeos.entities.ClientJourney.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientJourneys"] });
      toast.success("Jornada iniciada!");
    }
  });

  // Group journeys by stage
  const journeysByStage = journeyStages.reduce((acc, stage) => {
    acc[stage.id] = journeys.filter(j => j.current_stage === stage.id);
    return acc;
  }, {});

  // Stats
  const totalValue = journeys.reduce((sum, j) => sum + (j.total_value || 0), 0);
  const avgSatisfaction = journeys.filter(j => j.satisfaction_score).reduce((sum, j, _, arr) => sum + j.satisfaction_score / arr.length, 0);

  const filteredPatients = patients.filter(p => 
    !journeys.find(j => j.patient_id === p.id) &&
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-emerald-600" />
            Jornada do Cliente
          </h1>
          <p className="text-slate-500 mt-1">Acompanhe cada paciente do primeiro contato à fidelização</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">Total Pacientes</p>
              <p className="text-2xl font-bold">{journeys.length}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">Valor Total</p>
              <p className="text-2xl font-bold text-emerald-600">R$ {totalValue.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">Satisfação Média</p>
              <p className="text-2xl font-bold text-amber-600">{avgSatisfaction.toFixed(1)} ⭐</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">Fidelizados</p>
              <p className="text-2xl font-bold text-purple-600">{journeysByStage.fidelizado?.length || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline View */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6 overflow-x-auto">
          <div className="flex gap-4 min-w-max">
            {journeyStages.map((stage, idx) => {
              const stageJourneys = journeysByStage[stage.id] || [];
              return (
                <div key={stage.id} className="flex-1 min-w-[200px]">
                  <div className={cn("p-3 rounded-t-xl text-white text-center", stage.color)}>
                    <stage.icon className="w-5 h-5 mx-auto mb-1" />
                    <p className="text-sm font-medium">{stage.label}</p>
                    <p className="text-xs opacity-80">{stageJourneys.length} pacientes</p>
                  </div>
                  <ScrollArea className="h-[400px] bg-slate-50 rounded-b-xl p-2">
                    <div className="space-y-2">
                      {stageJourneys.map((journey) => {
                        const ChannelIcon = entryChannels[journey.entry_channel]?.icon || MessageCircle;
                        return (
                          <motion.div
                            key={journey.id}
                            whileHover={{ scale: 1.02 }}
                            className="bg-white p-3 rounded-lg shadow-sm cursor-pointer"
                            onClick={() => setSelectedStage(journey)}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-sm truncate">{journey.patient_name}</p>
                              <ChannelIcon className={cn("w-4 h-4", entryChannels[journey.entry_channel]?.color)} />
                            </div>
                            {journey.total_value > 0 && (
                              <p className="text-xs text-emerald-600 font-medium">R$ {journey.total_value.toLocaleString()}</p>
                            )}
                            <div className="flex gap-1 mt-2">
                              {idx < journeyStages.length - 1 && (
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-6 text-xs px-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const nextStage = journeyStages[idx + 1].id;
                                    updateJourneyMutation.mutate({ id: journey.id, data: { ...journey, current_stage: nextStage } });
                                  }}
                                >
                                  <ArrowRight className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add New Patient to Journey */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Adicionar Paciente à Jornada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Input 
                  placeholder="Buscar paciente..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            {searchTerm && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                {filteredPatients.slice(0, 8).map((patient) => (
                  <Button
                    key={patient.id}
                    variant="outline"
                    className="justify-start"
                    onClick={() => {
                      createJourneyMutation.mutate({
                        patient_id: patient.id,
                        patient_name: patient.name,
                        current_stage: "lead",
                        entry_channel: patient.source || "whatsapp",
                        total_value: 0
                      });
                      setSearchTerm("");
                    }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    {patient.name}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
