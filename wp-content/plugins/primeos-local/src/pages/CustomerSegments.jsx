// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Target, Plus, Users, Brain, Search, CheckCircle, Bot } from "lucide-react";
import { toast } from "sonner";
import PatientSegmentCard from "@/components/segments/PatientSegmentCard";
import SegmentBuilderForm from "@/components/segments/SegmentBuilderForm";
import AISegmentSuggestions from "@/components/segments/AISegmentSuggestions";

export default function CustomerSegments() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("segments");
  const queryClient = useQueryClient();

  const { data: segments = [] } = useQuery({
    queryKey: ["segments"],
    queryFn: () => primeos.entities.CustomerSegment.list("-created_date"),
  });
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => primeos.entities.Customer.list(),
  });
  const { data: appointments = [] } = useQuery({
    queryKey: ["allAppointments"],
    queryFn: () => primeos.entities.Appointment.list("-date"),
  });
  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => primeos.entities.FinancialTransaction.list("-date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => primeos.entities.CustomerSegment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["segments"] });
      setShowForm(false);
      setEditing(null);
      toast.success("Segmento criado!");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.CustomerSegment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["segments"] });
      setShowForm(false);
      setEditing(null);
      toast.success("Segmento atualizado!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => primeos.entities.CustomerSegment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["segments"] });
      toast.success("Segmento excluído.");
    },
  });

  const handleSubmit = (data) => {
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  const handleEdit = (seg) => { setEditing(seg); setShowForm(true); };
  const handleDelete = (id) => { if (confirm("Excluir este segmento?")) deleteMutation.mutate(id); };
  const handleNew = () => { setEditing(null); setShowForm(true); };
  const handleImportFromAI = (segData) => createMutation.mutateAsync(segData);

  const filtered = segments.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()));
  const activeCount = segments.filter(s => s.ativo).length;
  const aiCount = segments.filter(s => s.ai_generated).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Target className="w-8 h-8 text-indigo-600" />
              Segmentação de Pacientes
            </h1>
            <p className="text-slate-500 mt-1">Defina segmentos por critérios clínicos e financeiros, e associe ações automáticas</p>
          </div>
          <Button onClick={handleNew} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
            <Plus className="w-4 h-4" />Novo Segmento
          </Button>
        </div>

        {/* KPI bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Segmentos Ativos", value: activeCount, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Total de Segmentos", value: segments.length, icon: Target, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Base de Pacientes", value: customers.length, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Gerados pela IA", value: aiCount, icon: Bot, color: "text-violet-600", bg: "bg-violet-50" },
          ].map(kpi => (
            <Card key={kpi.label} className="border-0 shadow-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 mb-1">{kpi.label}</p>
                  <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="h-auto gap-1">
            <TabsTrigger value="segments" className="gap-2">
              <Target className="w-4 h-4" />Meus Segmentos
              {segments.length > 0 && <Badge className="bg-indigo-100 text-indigo-700 border-0 text-xs ml-1">{segments.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Brain className="w-4 h-4" />Sugestões da IA
            </TabsTrigger>
          </TabsList>

          {/* My Segments */}
          <TabsContent value="segments" className="mt-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Buscar segmento..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl">
                <Target className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="font-semibold text-slate-600">Nenhum segmento ainda</p>
                <p className="text-sm text-slate-400 mb-5">Crie segmentos manualmente ou use a IA para sugestões automáticas</p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={handleNew} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                    <Plus className="w-4 h-4" />Criar Manualmente
                  </Button>
                  <Button variant="outline" onClick={() => setTab("ai")} className="gap-2">
                    <Brain className="w-4 h-4" />Usar IA
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(seg => (
                  <PatientSegmentCard
                    key={seg.id}
                    segment={seg}
                    customers={customers}
                    appointments={appointments}
                    transactions={transactions}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* AI Suggestions */}
          <TabsContent value="ai" className="mt-4">
            <AISegmentSuggestions
              customers={customers}
              appointments={appointments}
              transactions={transactions}
              onImport={handleImportFromAI}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Form modal */}
      <SegmentBuilderForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        segment={editing}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
