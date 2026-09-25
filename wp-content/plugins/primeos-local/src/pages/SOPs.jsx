// @ts-nocheck
import React, { useState } from "react";
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
import { 
  FileText, Plus, Search, Target, Users, Bot, TrendingUp, 
  Calendar, Edit, Trash2, Loader2, BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

const areaConfig = {
  Sales: { icon: Target, color: "bg-green-100 text-green-700", borderColor: "border-l-green-500" },
  CRM: { icon: Users, color: "bg-blue-100 text-blue-700", borderColor: "border-l-blue-500" },
  Trainer: { icon: BookOpen, color: "bg-purple-100 text-purple-700", borderColor: "border-l-purple-500" },
  Manager: { icon: TrendingUp, color: "bg-amber-100 text-amber-700", borderColor: "border-l-amber-500" },
  Marketing: { icon: Target, color: "bg-pink-100 text-pink-700", borderColor: "border-l-pink-500" },
  Operations: { icon: FileText, color: "bg-slate-100 text-slate-700", borderColor: "border-l-slate-500" }
};

const statusColors = {
  Active: "bg-emerald-100 text-emerald-700",
  Draft: "bg-amber-100 text-amber-700",
  Archived: "bg-slate-100 text-slate-700"
};

export default function SOPs() {
  const [showForm, setShowForm] = useState(false);
  const [editingSOP, setEditingSOP] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterArea, setFilterArea] = useState("all");
  
  const queryClient = useQueryClient();

  const { data: sops = [] } = useQuery({
    queryKey: ["sops"],
    queryFn: () => primeos.entities.SOP.list("-last_update")
  });

  const createMutation = useMutation({
    mutationFn: (data) => primeos.entities.SOP.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sops"] });
      setShowForm(false);
      toast.success("SOP criado!");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.SOP.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sops"] });
      setShowForm(false);
      setEditingSOP(null);
      toast.success("SOP atualizado!");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => primeos.entities.SOP.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sops"] });
      toast.success("SOP excluído!");
    }
  });

  const [form, setForm] = useState({
    name: "", area: "Sales", owner: "", goal: "",
    primary_offer: "", status: "Active", last_update: format(new Date(), "yyyy-MM-dd"),
    kpi_principal: "", content: ""
  });

  const openEdit = (sop) => {
    setEditingSOP(sop);
    setForm(sop);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (editingSOP) {
      updateMutation.mutate({ id: editingSOP.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const filteredSOPs = sops.filter(sop => {
    const matchesSearch = sop.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sop.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = filterArea === "all" || sop.area === filterArea;
    return matchesSearch && matchesArea;
  });

  const sopsByArea = Object.keys(areaConfig).reduce((acc, area) => {
    acc[area] = sops.filter(s => s.area === area);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <FileText className="w-8 h-8 text-indigo-600" />
                SOPs - Procedimentos Operacionais
              </h1>
              <p className="text-slate-500 mt-1">Prime Odontologia - Padrões e Processos</p>
            </div>
            <Button onClick={() => { setEditingSOP(null); setForm({ name: "", area: "Sales", owner: "", goal: "", primary_offer: "", status: "Active", last_update: format(new Date(), "yyyy-MM-dd"), kpi_principal: "", content: "" }); setShowForm(true); }} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />Novo SOP
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          {Object.entries(areaConfig).map(([area, config]) => {
            const Icon = config.icon;
            const count = sopsByArea[area]?.length || 0;
            return (
              <Card key={area} className={cn("border-0 shadow-sm cursor-pointer hover:shadow-md transition-all", filterArea === area && "ring-2 ring-indigo-500")} onClick={() => setFilterArea(filterArea === area ? "all" : area)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", config.color)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-lg font-bold">{count}</p>
                      <p className="text-xs text-slate-500">{area}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Search */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Buscar SOPs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
          </div>
          <Select value={filterArea} onValueChange={setFilterArea}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Área" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Áreas</SelectItem>
              {Object.keys(areaConfig).map(area => <SelectItem key={area} value={area}>{area}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* SOPs Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {filteredSOPs.map((sop) => {
            const config = areaConfig[sop.area] || areaConfig.Operations;
            const Icon = config.icon;
            return (
              <motion.div key={sop.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className={cn("border-0 shadow-sm border-l-4 hover:shadow-md transition-all", config.borderColor)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", config.color)}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{sop.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={statusColors[sop.status]}>{sop.status}</Badge>
                            <Badge variant="outline">{sop.area}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(sop)}><Edit className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(sop.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 mb-3">{sop.goal}</p>
                    
                    <div className="p-3 bg-slate-50 rounded-lg mb-3">
                      <p className="text-xs text-slate-500 mb-1">Conteúdo do SOP:</p>
                      <p className="text-sm text-slate-700">{sop.content}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-400">Owner</p>
                        <p className="font-medium flex items-center gap-1"><Bot className="w-3 h-3" />{sop.owner}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Oferta Principal</p>
                        <p className="font-medium">{sop.primary_offer}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">KPI Principal</p>
                        <p className="font-medium text-indigo-600">{sop.kpi_principal}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Atualização</p>
                        <p className="font-medium flex items-center gap-1"><Calendar className="w-3 h-3" />{sop.last_update}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredSOPs.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <FileText className="w-16 h-16 mx-auto mb-4" />
            <p>Nenhum SOP encontrado</p>
          </div>
        )}

        {/* Form Modal */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSOP ? "Editar" : "Novo"} SOP</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div><Label>Nome do SOP</Label><Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Ex: Atendimento Comercial WhatsApp" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Área</Label>
                  <Select value={form.area} onValueChange={(v) => setForm({...form, area: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(areaConfig).map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({...form, status: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Owner</Label><Input value={form.owner} onChange={(e) => setForm({...form, owner: e.target.value})} placeholder="Ex: Sales Agent" /></div>
                <div><Label>Oferta Principal</Label><Input value={form.primary_offer} onChange={(e) => setForm({...form, primary_offer: e.target.value})} placeholder="Ex: Invisalign" /></div>
              </div>
              <div><Label>Objetivo</Label><Textarea value={form.goal} onChange={(e) => setForm({...form, goal: e.target.value})} rows={2} placeholder="Objetivo do SOP..." /></div>
              <div><Label>KPI Principal</Label><Input value={form.kpi_principal} onChange={(e) => setForm({...form, kpi_principal: e.target.value})} placeholder="Ex: Taxa de agendamento" /></div>
              <div><Label>Conteúdo do SOP</Label><Textarea value={form.content} onChange={(e) => setForm({...form, content: e.target.value})} rows={4} placeholder="Descreva o procedimento passo a passo..." /></div>
              <div><Label>Data Atualização</Label><Input type="date" value={form.last_update} onChange={(e) => setForm({...form, last_update: e.target.value})} /></div>
              <Button onClick={handleSubmit} disabled={!form.name || createMutation.isPending || updateMutation.isPending} className="w-full bg-indigo-600 hover:bg-indigo-700">
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingSOP ? "Atualizar" : "Criar"} SOP
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
