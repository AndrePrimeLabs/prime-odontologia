// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Brain, Plus, Target, Users, Loader2, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

const ofertas = {
  invisalign: "Invisalign",
  ortodontia: "Ortodontia",
  limpeza: "Limpeza",
  clareamento: "Clareamento",
  implante: "Implante",
  protese: "Prótese",
  estetica: "Estética",
  outro: "Outro"
};

const statusColors = {
  planejamento: "bg-amber-100 text-amber-700",
  ativo: "bg-emerald-100 text-emerald-700",
  pausado: "bg-slate-100 text-slate-700"
};

export default function Estrategias() {
  const [showForm, setShowForm] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState(null);
  const queryClient = useQueryClient();

  const { data: strategies = [] } = useQuery({
    queryKey: ["marketingStrategies"],
    queryFn: () => primeos.entities.MarketingStrategy.list("-created_date")
  });

  const createMutation = useMutation({
    mutationFn: (data) => primeos.entities.MarketingStrategy.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketingStrategies"] });
      setShowForm(false);
      toast.success("Estratégia criada!");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.MarketingStrategy.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketingStrategies"] });
      setShowForm(false);
      setEditingStrategy(null);
      toast.success("Estratégia atualizada!");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => primeos.entities.MarketingStrategy.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketingStrategies"] });
      toast.success("Estratégia excluída!");
    }
  });

  const [form, setForm] = useState({
    name: "", objetivo: "", oferta_principal: "invisalign",
    publico_alvo: "", dor_principal: "", promessa: "",
    kpi_principal: "", status: "planejamento"
  });

  const openEdit = (strategy) => {
    setEditingStrategy(strategy);
    setForm(strategy);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (editingStrategy) {
      updateMutation.mutate({ id: editingStrategy.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-600" />
              Estratégias de Marketing
            </h1>
            <p className="text-slate-500 mt-1">Cérebro do Marketing OS</p>
          </div>
          <Button onClick={() => { setEditingStrategy(null); setForm({ name: "", objetivo: "", oferta_principal: "invisalign", publico_alvo: "", dor_principal: "", promessa: "", kpi_principal: "", status: "planejamento" }); setShowForm(true); }} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />Nova Estratégia
          </Button>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {strategies.map((strategy) => (
            <motion.div key={strategy.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className={statusColors[strategy.status]}>{strategy.status}</Badge>
                      <CardTitle className="mt-2 text-lg">{strategy.name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(strategy)}><Edit className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(strategy.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-500" />
                      <span className="text-slate-600">{ofertas[strategy.oferta_principal]}</span>
                    </div>
                    {strategy.objetivo && (
                      <p className="text-slate-500">{strategy.objetivo}</p>
                    )}
                    {strategy.publico_alvo && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="text-slate-600">{strategy.publico_alvo}</span>
                      </div>
                    )}
                    {strategy.promessa && (
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <p className="text-xs text-purple-600 font-medium">Promessa:</p>
                        <p className="text-sm text-purple-900">{strategy.promessa}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {strategies.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <Brain className="w-16 h-16 mx-auto mb-4" />
            <p>Nenhuma estratégia criada</p>
          </div>
        )}

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingStrategy ? "Editar" : "Nova"} Estratégia</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div><Label>Nome da Estratégia</Label><Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Ex: Campanha Invisalign Q1" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Oferta Principal</Label>
                  <Select value={form.oferta_principal} onValueChange={(v) => setForm({...form, oferta_principal: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(ofertas).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({...form, status: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planejamento">Planejamento</SelectItem>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="pausado">Pausado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Objetivo</Label><Input value={form.objetivo} onChange={(e) => setForm({...form, objetivo: e.target.value})} placeholder="Ex: Gerar 50 leads qualificados" /></div>
              <div><Label>Público-Alvo</Label><Input value={form.publico_alvo} onChange={(e) => setForm({...form, publico_alvo: e.target.value})} placeholder="Ex: Mulheres 25-45 anos, classe A/B" /></div>
              <div><Label>Dor Principal</Label><Textarea value={form.dor_principal} onChange={(e) => setForm({...form, dor_principal: e.target.value})} placeholder="Qual problema o público quer resolver?" /></div>
              <div><Label>Promessa</Label><Textarea value={form.promessa} onChange={(e) => setForm({...form, promessa: e.target.value})} placeholder="O que você promete entregar?" /></div>
              <div><Label>KPI Principal</Label><Input value={form.kpi_principal} onChange={(e) => setForm({...form, kpi_principal: e.target.value})} placeholder="Ex: CPL < R$50" /></div>
              <Button onClick={handleSubmit} disabled={!form.name || createMutation.isPending || updateMutation.isPending} className="w-full bg-purple-600 hover:bg-purple-700">
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingStrategy ? "Atualizar" : "Criar"} Estratégia
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
