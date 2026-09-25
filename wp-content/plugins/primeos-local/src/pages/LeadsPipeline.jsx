// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Users, Plus, Loader2, MessageCircle, ArrowRight, Flame, Pencil, Save, X, TrendingUp, FileText, Zap, Sparkles, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import LeadScoreCard from "@/components/leads/LeadScoreCard";

const statusStages = [
  { id: "novo", label: "Novo", color: "bg-blue-500" },
  { id: "em_conversa", label: "Em Conversa", color: "bg-amber-500" },
  { id: "avaliacao", label: "Avaliação", color: "bg-purple-500" },
  { id: "orcamento", label: "Orçamento", color: "bg-indigo-500" },
  { id: "fechado", label: "Fechado", color: "bg-emerald-500" },
  { id: "perdido", label: "Perdido", color: "bg-red-500" }
];

const tempColors = { frio: "text-blue-500", morno: "text-amber-500", quente: "text-red-500" };
const interesseColors = { invisalign: "bg-purple-100 text-purple-700", ortodontia: "bg-blue-100 text-blue-700", limpeza: "bg-green-100 text-green-700", clareamento: "bg-amber-100 text-amber-700", implante: "bg-rose-100 text-rose-700" };

export default function LeadsPipeline() {
  const [showForm, setShowForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [scoringAll, setScoringAll] = useState(false);
  const queryClient = useQueryClient();

  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: () => primeos.entities.Lead.list("-created_date")
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => primeos.entities.Campaign.list()
  });

  const { data: channels = [] } = useQuery({
    queryKey: ["marketingChannels"],
    queryFn: () => primeos.entities.MarketingChannel.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => primeos.entities.Lead.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setShowForm(false);
      toast.success("Lead criado!");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.Lead.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      if (selectedLead?.id === updated.id) setSelectedLead(updated);
    }
  });

  const openLeadDetail = (lead) => {
    setSelectedLead(lead);
    setEditForm({ ...lead });
  };

  const saveEdit = () => {
    updateMutation.mutate({ id: editForm.id, data: editForm }, {
      onSuccess: () => toast.success("Lead atualizado!")
    });
  };

  const [form, setForm] = useState({
    name: "", phone: "", email: "", origem_canal_id: "",
    campanha_id: "", interesse: "invisalign", status: "novo",
    data_entrada: format(new Date(), "yyyy-MM-dd"),
    canal_conversao: "whatsapp", valor_estimado: 0,
    temperatura: "morno", notas: ""
  });

  const leadsByStatus = statusStages.reduce((acc, stage) => {
    acc[stage.id] = leads.filter(l => l.status === stage.id);
    return acc;
  }, {});

  const totalValor = leads.filter(l => l.status === "fechado").reduce((s, l) => s + (l.valor_estimado || 0), 0);

  const openWhatsApp = (phone, name) => {
    const cleanPhone = phone?.replace(/\D/g, "") || "";
    const msg = `Olá ${name}! 👋 Vi seu interesse pela Prime Odontologia. Como posso ajudar?`;
    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
      <div className="max-w-[1400px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              Pipeline de Leads
            </h1>
            <p className="text-slate-500 mt-1">Origem → Conversão</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-slate-500">Valor Fechado</p>
              <p className="text-xl font-bold text-emerald-600">R$ {totalValor.toLocaleString()}</p>
            </div>
            <Button
              variant="outline"
              onClick={async () => {
                setScoringAll(true);
                try {
                  await primeos.functions.invoke("scoreLeadAI", { score_all: true });
                  queryClient.invalidateQueries({ queryKey: ["leads"] });
                  toast.success("Todos os leads pontuados com IA!");
                } catch (e) {
                  toast.error("Erro ao pontuar leads");
                } finally {
                  setScoringAll(false);
                }
              }}
              disabled={scoringAll}
              className="gap-2"
            >
              {scoringAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart2 className="w-4 h-4" />}
              Score Todos
            </Button>
            <Button onClick={() => { setForm({ name: "", phone: "", email: "", origem_canal_id: "", campanha_id: "", interesse: "invisalign", status: "novo", data_entrada: format(new Date(), "yyyy-MM-dd"), canal_conversao: "whatsapp", valor_estimado: 0, temperatura: "morno", notas: "" }); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />Novo Lead
            </Button>
          </div>
        </motion.div>

        {/* Kanban */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {statusStages.map((stage, idx) => (
            <div key={stage.id} className="flex-shrink-0 w-[280px]">
              <div className={cn("p-3 rounded-t-xl text-white text-center", stage.color)}>
                <p className="font-medium">{stage.label}</p>
                <p className="text-sm opacity-80">{leadsByStatus[stage.id]?.length || 0} leads</p>
              </div>
              <ScrollArea className="h-[550px] bg-slate-50 rounded-b-xl p-2">
                <div className="space-y-2">
                  {leadsByStatus[stage.id]?.map((lead) => {
                    const campaign = campaigns.find(c => c.id === lead.campanha_id);
                    const channel = channels.find(c => c.id === lead.origem_canal_id);
                    return (
                      <motion.div key={lead.id} whileHover={{ scale: 1.02 }} className="bg-white p-3 rounded-lg shadow-sm cursor-pointer" onClick={() => openLeadDetail(lead)}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-sm">{lead.name}</p>
                          <Flame className={cn("w-4 h-4", tempColors[lead.temperatura])} />
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          <Badge className={cn("text-xs", interesseColors[lead.interesse] || "bg-slate-100")}>{lead.interesse}</Badge>
                          {channel && <Badge variant="outline" className="text-xs">{channel.plataforma}</Badge>}
                        </div>
                        {lead.valor_estimado > 0 && (
                          <p className="text-xs text-emerald-600 font-medium mb-2">R$ {lead.valor_estimado.toLocaleString()}</p>
                        )}
                        {lead.ai_score != null && (
                          <div className="flex items-center gap-1 mb-1">
                            <Sparkles className="w-3 h-3 text-indigo-500" />
                            <span className={cn("text-xs font-bold",
                              lead.ai_score >= 75 ? "text-red-600" :
                              lead.ai_score >= 55 ? "text-orange-500" :
                              lead.ai_score >= 35 ? "text-amber-500" : "text-blue-400"
                            )}>{lead.ai_score}</span>
                            <span className="text-xs text-slate-400">/ 100</span>
                            {lead.ai_conversion_probability != null && (
                              <span className="text-xs text-slate-400 ml-1">• {lead.ai_conversion_probability}% conv.</span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {lead.phone && (
                            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openWhatsApp(lead.phone, lead.name)}>
                              <MessageCircle className="w-3 h-3 text-green-600" />
                            </Button>
                          )}
                          {idx < statusStages.length - 2 && (
                            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => {
                              const nextStatus = statusStages[idx + 1].id;
                              updateMutation.mutate({ id: lead.id, data: { ...lead, status: nextStatus } });
                            }}>
                              <ArrowRight className="w-3 h-3" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="h-7 px-2 ml-auto" onClick={() => openLeadDetail(lead)}>
                            <Pencil className="w-3 h-3 text-slate-400" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          ))}
        </div>

        {/* Lead Detail Sheet */}
        <Sheet open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            {selectedLead && editForm && (
              <>
                <SheetHeader className="mb-4">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {selectedLead.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-base font-bold leading-tight">{selectedLead.name}</p>
                      <Badge className={cn("text-xs mt-0.5", statusStages.find(s => s.id === selectedLead.status)?.color?.replace("bg-", "bg-") + " text-white")}>
                        {statusStages.find(s => s.id === selectedLead.status)?.label}
                      </Badge>
                    </div>
                  </SheetTitle>
                </SheetHeader>

                <Tabs defaultValue="info" className="w-full">
                  <TabsList className="w-full grid grid-cols-5 mb-4">
                    <TabsTrigger value="info" className="text-xs"><Users className="w-3 h-3 mr-1" />Info</TabsTrigger>
                    <TabsTrigger value="comercial" className="text-xs"><TrendingUp className="w-3 h-3 mr-1" />Comercial</TabsTrigger>
                    <TabsTrigger value="status" className="text-xs"><Zap className="w-3 h-3 mr-1" />Status</TabsTrigger>
                    <TabsTrigger value="notas" className="text-xs"><FileText className="w-3 h-3 mr-1" />Notas</TabsTrigger>
                    <TabsTrigger value="score" className="text-xs"><Sparkles className="w-3 h-3 mr-1" />Score</TabsTrigger>
                  </TabsList>

                  {/* Tab: Info */}
                  <TabsContent value="info" className="space-y-4">
                    <div><Label>Nome</Label><Input value={editForm.name || ""} onChange={(e) => setEditForm({...editForm, name: e.target.value})} /></div>
                    <div><Label>Telefone / WhatsApp</Label><Input value={editForm.phone || ""} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} /></div>
                    <div><Label>Email</Label><Input type="email" value={editForm.email || ""} onChange={(e) => setEditForm({...editForm, email: e.target.value})} /></div>
                    <div><Label>Data de Entrada</Label><Input type="date" value={editForm.data_entrada || ""} onChange={(e) => setEditForm({...editForm, data_entrada: e.target.value})} /></div>
                    {editForm.phone && (
                      <Button variant="outline" className="w-full text-green-700 border-green-200 hover:bg-green-50"
                        onClick={() => openWhatsApp(editForm.phone, editForm.name)}>
                        <MessageCircle className="w-4 h-4 mr-2" />Abrir WhatsApp
                      </Button>
                    )}
                  </TabsContent>

                  {/* Tab: Comercial */}
                  <TabsContent value="comercial" className="space-y-4">
                    <div>
                      <Label>Interesse</Label>
                      <Select value={editForm.interesse || ""} onValueChange={(v) => setEditForm({...editForm, interesse: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["invisalign","ortodontia","limpeza","clareamento","implante","protese","estetica","checkup","outro"].map(i => (
                            <SelectItem key={i} value={i}>{i.charAt(0).toUpperCase() + i.slice(1)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Temperatura</Label>
                      <Select value={editForm.temperatura || "morno"} onValueChange={(v) => setEditForm({...editForm, temperatura: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="frio">❄️ Frio</SelectItem>
                          <SelectItem value="morno">🌤️ Morno</SelectItem>
                          <SelectItem value="quente">🔥 Quente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>Valor Estimado (R$)</Label><Input type="number" value={editForm.valor_estimado || 0} onChange={(e) => setEditForm({...editForm, valor_estimado: parseFloat(e.target.value) || 0})} /></div>
                    <div>
                      <Label>Canal de Conversão</Label>
                      <Select value={editForm.canal_conversao || "whatsapp"} onValueChange={(v) => setEditForm({...editForm, canal_conversao: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["whatsapp","instagram","facebook","google","indicacao","telefone","site","outro"].map(c => (
                            <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  {/* Tab: Status */}
                  <TabsContent value="status" className="space-y-4">
                    <div>
                      <Label>Etapa do Pipeline</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {statusStages.map((stage) => (
                          <button
                            key={stage.id}
                            onClick={() => setEditForm({...editForm, status: stage.id})}
                            className={cn(
                              "p-3 rounded-xl border-2 text-sm font-medium transition-all",
                              editForm.status === stage.id
                                ? stage.color + " text-white border-transparent shadow"
                                : "border-slate-200 text-slate-600 hover:border-slate-300"
                            )}
                          >
                            {stage.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Campanha</Label>
                      <Select value={editForm.campanha_id || ""} onValueChange={(v) => setEditForm({...editForm, campanha_id: v})}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {campaigns.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Canal de Origem</Label>
                      <Select value={editForm.origem_canal_id || ""} onValueChange={(v) => setEditForm({...editForm, origem_canal_id: v})}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {channels.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  {/* Tab: Notas */}
                  <TabsContent value="notas" className="space-y-4">
                    <div>
                      <Label>Notas & Observações</Label>
                      <Textarea value={editForm.notas || ""} onChange={(e) => setEditForm({...editForm, notas: e.target.value})} rows={8} placeholder="Adicione notas sobre este lead..." />
                    </div>
                  </TabsContent>

                  {/* Tab: Score IA */}
                  <TabsContent value="score">
                    <LeadScoreCard
                      lead={selectedLead}
                      onScored={() => queryClient.invalidateQueries({ queryKey: ["leads"] })}
                    />
                  </TabsContent>
                </Tabs>

                <div className="flex gap-3 mt-6">
                  <Button onClick={saveEdit} disabled={updateMutation.isPending} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Salvar
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedLead(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Novo Lead</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div><Label>Nome</Label><Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Nome completo" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Telefone</Label><Input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} placeholder="(11) 99999-9999" /></div>
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Interesse</Label>
                  <Select value={form.interesse} onValueChange={(v) => setForm({...form, interesse: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["invisalign", "ortodontia", "limpeza", "clareamento", "implante", "protese", "estetica", "checkup", "outro"].map(i => <SelectItem key={i} value={i}>{i.charAt(0).toUpperCase() + i.slice(1)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Temperatura</Label>
                  <Select value={form.temperatura} onValueChange={(v) => setForm({...form, temperatura: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="frio">❄️ Frio</SelectItem>
                      <SelectItem value="morno">🌤️ Morno</SelectItem>
                      <SelectItem value="quente">🔥 Quente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Origem (Canal)</Label>
                  <Select value={form.origem_canal_id} onValueChange={(v) => setForm({...form, origem_canal_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {channels.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Campanha</Label>
                  <Select value={form.campanha_id} onValueChange={(v) => setForm({...form, campanha_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {campaigns.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Valor Estimado (R$)</Label><Input type="number" value={form.valor_estimado} onChange={(e) => setForm({...form, valor_estimado: parseFloat(e.target.value) || 0})} /></div>
              <div><Label>Notas</Label><Textarea value={form.notas} onChange={(e) => setForm({...form, notas: e.target.value})} rows={2} /></div>
              <Button onClick={() => createMutation.mutate(form)} disabled={!form.name || createMutation.isPending} className="w-full bg-blue-600 hover:bg-blue-700">
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Criar Lead
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
