// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Brain, Globe, Users, FileText, Link, TrendingUp,
  Plus, Search, Zap, CheckCircle, DollarSign, Layers
} from "lucide-react";
import PrimeFunnel from "@/components/primeos/PrimeFunnel";
import DelegationOS from "@/components/primeos/DelegationOS";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const stageColors = {
  not_started: "bg-slate-100 text-slate-600 border-slate-200",
  active:      "bg-green-100 text-green-700 border-green-300",
  completed:   "bg-indigo-100 text-indigo-700 border-indigo-300",
};

const faseColors = {
  analise:       "bg-blue-100 text-blue-700",
  planejamento:  "bg-yellow-100 text-yellow-700",
  execucao:      "bg-orange-100 text-orange-700",
  monitoramento: "bg-purple-100 text-purple-700",
  relatorio:     "bg-green-100 text-green-700",
};

const statusColors = {
  a_fazer:     "bg-slate-100 text-slate-600",
  em_execucao: "bg-blue-100 text-blue-700",
  revisao:     "bg-yellow-100 text-yellow-700",
  concluido:   "bg-green-100 text-green-700",
};

const funnelStatusColors = {
  lead:              "bg-slate-100 text-slate-600",
  contato:           "bg-blue-100 text-blue-700",
  avaliacao_marcada: "bg-yellow-100 text-yellow-700",
  compareceu:        "bg-orange-100 text-orange-700",
  proposta_enviada:  "bg-purple-100 text-purple-700",
  fechado:           "bg-green-100 text-green-700",
  perdido:           "bg-red-100 text-red-700",
};

export default function PrimeOS() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("hq");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(null); // "projeto" | "tarefa" | "keyword" | "conteudo" | "backlink" | "lead" | "delegation"
  const [formData, setFormData] = useState({});

  const { data: projetos = [] } = useQuery({ queryKey: ["ProjetoSEO"], queryFn: () => primeos.entities.ProjetoSEO.list() });
  const { data: tarefas = [] } = useQuery({ queryKey: ["TarefaSEO"], queryFn: () => primeos.entities.TarefaSEO.list() });
  const { data: keywords = [] } = useQuery({ queryKey: ["PalavraChave"], queryFn: () => primeos.entities.PalavraChave.list() });
  const { data: conteudos = [] } = useQuery({ queryKey: ["ConteudoSEO"], queryFn: () => primeos.entities.ConteudoSEO.list() });
  const { data: backlinks = [] } = useQuery({ queryKey: ["Backlink"], queryFn: () => primeos.entities.Backlink.list() });
  const { data: relatorios = [] } = useQuery({ queryKey: ["RelatorioSEO"], queryFn: () => primeos.entities.RelatorioSEO.list() });
  const { data: growthStages = [] } = useQuery({ queryKey: ["PrimeGrowthStage"], queryFn: () => primeos.entities.PrimeGrowthStage.list() });
  const { data: funnelLeads = [] } = useQuery({ queryKey: ["PrimeFunnelLead"], queryFn: () => primeos.entities.PrimeFunnelLead.list() });
  const { data: delegationTasks = [] } = useQuery({ queryKey: ["PrimeDelegationTask"], queryFn: () => primeos.entities.PrimeDelegationTask.list() });

  const useCreateMutation = (entityName) => useMutation({
    mutationFn: (data) => primeos.entities[entityName].create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [entityName] }); setShowForm(null); setFormData({}); toast.success("Criado com sucesso!"); },
  });

  const createProjeto = useCreateMutation("ProjetoSEO");
  const createTarefa = useCreateMutation("TarefaSEO");
  const createKeyword = useCreateMutation("PalavraChave");
  const createConteudo = useCreateMutation("ConteudoSEO");
  const createBacklink = useCreateMutation("Backlink");
  const createLead = useCreateMutation("PrimeFunnelLead");
  const createDelegation = useCreateMutation("PrimeDelegationTask");

  // Seed growth stages on first load
  const seedStages = useMutation({
    mutationFn: async () => {
      const stages = [
        { stage_name: "Stage 1 — Tração Inicial", revenue_range: "Até R$5K/mês", primary_focus: "Validar oferta e gerar fluxo inicial de pacientes", core_objective: "Comprovar demanda real", status: "active", receita_meta: 5000 },
        { stage_name: "Stage 2 — Consolidação", revenue_range: "R$5K → R$20K/mês", primary_focus: "Tornar oferta irresistível + gerar tráfego consistente", core_objective: "Previsibilidade básica", status: "not_started", receita_meta: 20000 },
        { stage_name: "Stage 3 — Estruturação", revenue_range: "R$20K → R$50K/mês", primary_focus: "Funil previsível + lista de pacientes", core_objective: "Sistema comercial estável", status: "not_started", receita_meta: 50000 },
        { stage_name: "Stage 4 — Escala Estruturada", revenue_range: "R$50K → R$100K+/mês", primary_focus: "Trabalhar ON the clinic", core_objective: "Clínica estruturada como empresa", status: "not_started", receita_meta: 100000 },
      ];
      for (const s of stages) { await primeos.entities.PrimeGrowthStage.create(s); }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["PrimeGrowthStage"] }); toast.success("Growth Stages criados!"); },
  });

  const handleSave = (type, mutation) => {
    const dps = (Number(formData.frequency_score || 0) + Number(formData.annoyance_level || 0) + Number(formData.impact_on_business || 0) + Number(formData.simplicity_to_delegate || 0));
    mutation.mutate({ ...formData, ...(type === "delegation" ? { dps_score: dps } : {}) });
  };

  // Stats
  const projetosAtivos = projetos.filter(p => p.status_operacional === "em_andamento").length;
  const tarefasPendentes = tarefas.filter(t => t.status !== "concluido").length;
  const leadsAbertos = funnelLeads.filter(l => !["fechado", "perdido"].includes(l.status)).length;
  const receita = funnelLeads.filter(l => l.status === "fechado").reduce((s, l) => s + (l.ticket_estimado || 0), 0);

  const kanbanFases = ["analise", "planejamento", "execucao", "monitoramento", "relatorio"];
  const kanbanStatus = ["a_fazer", "em_execucao", "revisao", "concluido"];
  const funnelStages = ["lead", "contato", "avaliacao_marcada", "compareceu", "proposta_enviada", "fechado", "perdido"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/20 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-lg text-2xl">🦷</div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">PRIME OS HQ</h1>
                <p className="text-slate-500 text-sm">Sistema Operacional · Growth & SEO · Delegation</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {growthStages.length === 0 && (
                <Button onClick={() => seedStages.mutate()} className="bg-indigo-600 hover:bg-indigo-700 text-sm">
                  <Zap className="w-4 h-4 mr-1" /> Inicializar Growth Stages
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Projetos Ativos", value: projetosAtivos, icon: Globe, color: "blue" },
            { label: "Tarefas Pendentes", value: tarefasPendentes, icon: CheckCircle, color: "orange" },
            { label: "Leads no Funil", value: leadsAbertos, icon: Users, color: "purple" },
            { label: "Receita Fechada", value: `R$ ${receita.toLocaleString("pt-BR")}`, icon: DollarSign, color: "green" },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <Card key={i} className="border-0 shadow-md">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-${s.color}-100 flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 text-${s.color}-600`} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{s.label}</p>
                    <p className="text-xl font-bold text-slate-900">{s.value}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 h-auto gap-1 mb-6 bg-white border rounded-xl p-1 shadow-sm">
            {[
              { value: "hq", label: "HQ", icon: Brain },
              { value: "projetos", label: "Projetos", icon: Globe },
              { value: "tarefas", label: "Tarefas", icon: CheckCircle },
              { value: "keywords", label: "Keywords", icon: Search },
              { value: "conteudo", label: "Conteúdo", icon: FileText },
              { value: "backlinks", label: "Backlinks", icon: Link },
              { value: "funil", label: "Funil", icon: TrendingUp },
              { value: "delegation", label: "Delegação", icon: Layers },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-1 text-xs py-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg">
                  <Icon className="w-3.5 h-3.5" /><span className="hidden lg:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* HQ — Growth Stages */}
          <TabsContent value="hq">
            <div className="grid lg:grid-cols-2 gap-4">
              {growthStages.map((stage, i) => {
                const pct = stage.receita_meta > 0 ? Math.min(100, Math.round(((stage.receita_atual || 0) / stage.receita_meta) * 100)) : 0;
                return (
                  <motion.div key={stage.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className={cn("border-0 shadow-md", stage.status === "active" && "ring-2 ring-indigo-400")}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-slate-900">{stage.stage_name}</h3>
                            <p className="text-xs text-slate-500">{stage.revenue_range}</p>
                          </div>
                          <Badge className={cn(stageColors[stage.status], "border text-xs")}>
                            {stage.status === "active" ? "Ativo" : stage.status === "completed" ? "Concluído" : "Não iniciado"}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-1"><span className="font-semibold">Foco:</span> {stage.primary_focus}</p>
                        <p className="text-sm text-slate-600 mb-3"><span className="font-semibold">Objetivo:</span> {stage.core_objective}</p>
                        {stage.receita_meta > 0 && (
                          <div>
                            <div className="flex justify-between text-xs text-slate-500 mb-1">
                              <span>Progresso receita</span><span>{pct}%</span>
                            </div>
                            <div className="bg-slate-100 rounded-full h-2">
                              <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <div className="flex justify-between text-xs mt-1">
                              <span className="text-slate-400">R$ {(stage.receita_atual || 0).toLocaleString("pt-BR")}</span>
                              <span className="text-slate-500">Meta: R$ {stage.receita_meta.toLocaleString("pt-BR")}</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
              {growthStages.length === 0 && (
                <div className="col-span-2 text-center py-16 text-slate-400">
                  <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Clique em "Inicializar Growth Stages" para começar</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* PROJETOS SEO — Kanban por fase */}
          <TabsContent value="projetos">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-slate-900">Projetos SEO — Board por Fase</h2>
              <Button size="sm" onClick={() => { setShowForm("projeto"); setFormData({}); }} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-1" />Novo Projeto
              </Button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {kanbanFases.map(fase => {
                const items = projetos.filter(p => p.fase_atual === fase);
                const labels = { analise: "Análise", planejamento: "Planejamento", execucao: "Execução", monitoramento: "Monitoramento", relatorio: "Relatório" };
                return (
                  <div key={fase} className="bg-white rounded-xl border p-3 shadow-sm min-h-[200px]">
                    <div className="flex items-center justify-between mb-3">
                      <span className={cn("text-xs font-bold px-2 py-1 rounded-full", faseColors[fase])}>{labels[fase]}</span>
                      <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">{items.length}</span>
                    </div>
                    <div className="space-y-2">
                      {items.map(p => (
                        <div key={p.id} className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                          <p className="text-xs font-semibold text-slate-800 truncate">{p.projeto}</p>
                          <p className="text-xs text-slate-500 truncate">{p.cliente}</p>
                          {p.receita_mensal && <p className="text-xs text-green-600 font-bold">R$ {p.receita_mensal.toLocaleString("pt-BR")}/mês</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* TAREFAS SEO — Kanban */}
          <TabsContent value="tarefas">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-slate-900">Tarefas SEO — Kanban Operacional</h2>
              <Button size="sm" onClick={() => { setShowForm("tarefa"); setFormData({}); }} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-1" />Nova Tarefa
              </Button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {kanbanStatus.map(status => {
                const items = tarefas.filter(t => t.status === status);
                const labels = { a_fazer: "A Fazer", em_execucao: "Em Execução", revisao: "Revisão", concluido: "Concluído" };
                return (
                  <div key={status} className="bg-white rounded-xl border p-3 shadow-sm min-h-[200px]">
                    <div className="flex items-center justify-between mb-3">
                      <span className={cn("text-xs font-bold px-2 py-1 rounded-full", statusColors[status])}>{labels[status]}</span>
                      <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">{items.length}</span>
                    </div>
                    <div className="space-y-2">
                      {items.map(t => (
                        <div key={t.id} className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                          <p className="text-xs font-semibold text-slate-800 truncate">{t.tarefa}</p>
                          <p className="text-xs text-slate-500 truncate">{t.projeto_nome}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {t.prioridade === "alta" && <span className="text-xs text-red-500 font-bold">Alta</span>}
                            {t.prazo && <span className="text-xs text-slate-400">{t.prazo}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* KEYWORDS */}
          <TabsContent value="keywords">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-slate-900">Palavras-Chave</h2>
              <Button size="sm" onClick={() => { setShowForm("keyword"); setFormData({}); }} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-1" />Nova Keyword
              </Button>
            </div>
            <Card className="border-0 shadow-md">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        {["Keyword", "Projeto", "Volume", "Dificuldade", "Intenção", "Posição Atual", "Meta"].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {keywords.map(k => (
                        <tr key={k.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-900">{k.keyword}</td>
                          <td className="px-4 py-3 text-slate-600">{k.projeto_nome}</td>
                          <td className="px-4 py-3 text-slate-600">{k.volume_busca?.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-slate-100 rounded-full h-1.5">
                                <div className="h-1.5 rounded-full bg-orange-400" style={{ width: `${k.dificuldade || 0}%` }} />
                              </div>
                              <span className="text-xs text-slate-500">{k.dificuldade}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3"><Badge className="text-xs bg-blue-50 text-blue-700 border-blue-200">{k.intencao}</Badge></td>
                          <td className="px-4 py-3 text-slate-600">{k.posicao_atual ? `#${k.posicao_atual}` : "-"}</td>
                          <td className="px-4 py-3 text-green-600 font-medium">{k.meta_posicao ? `#${k.meta_posicao}` : "-"}</td>
                        </tr>
                      ))}
                      {keywords.length === 0 && (
                        <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">Nenhuma keyword cadastrada</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CONTEÚDO */}
          <TabsContent value="conteudo">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-slate-900">Produção de Conteúdo — Calendário Editorial</h2>
              <Button size="sm" onClick={() => { setShowForm("conteudo"); setFormData({}); }} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-1" />Novo Conteúdo
              </Button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {["briefing", "redacao", "revisao", "publicado"].map(status => {
                const items = conteudos.filter(c => c.status_editorial === status);
                const labels = { briefing: "Briefing", redacao: "Redação", revisao: "Revisão", publicado: "Publicado" };
                const colors = { briefing: "bg-slate-100 text-slate-600", redacao: "bg-blue-100 text-blue-700", revisao: "bg-yellow-100 text-yellow-700", publicado: "bg-green-100 text-green-700" };
                return (
                  <div key={status} className="bg-white rounded-xl border p-3 shadow-sm min-h-[200px]">
                    <div className="flex items-center justify-between mb-3">
                      <span className={cn("text-xs font-bold px-2 py-1 rounded-full", colors[status])}>{labels[status]}</span>
                      <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">{items.length}</span>
                    </div>
                    <div className="space-y-2">
                      {items.map(c => (
                        <div key={c.id} className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                          <p className="text-xs font-semibold text-slate-800 truncate">{c.titulo}</p>
                          <p className="text-xs text-slate-500">{c.tipo_conteudo}</p>
                          {c.data_publicacao && <p className="text-xs text-slate-400">{c.data_publicacao}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* BACKLINKS */}
          <TabsContent value="backlinks">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-slate-900">Backlinks</h2>
              <Button size="sm" onClick={() => { setShowForm("backlink"); setFormData({}); }} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-1" />Novo Backlink
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-3 mb-4">
              {[{ label: "Total Backlinks", value: backlinks.length }, { label: "Dofollow", value: backlinks.filter(b => b.tipo_link === "dofollow").length }, { label: "DA Médio", value: backlinks.length ? Math.round(backlinks.reduce((s, b) => s + (b.autoridade_dominio || 0), 0) / backlinks.length) : 0 }].map((s, i) => (
                <Card key={i} className="border-0 shadow-sm"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-indigo-600">{s.value}</p><p className="text-xs text-slate-500">{s.label}</p></CardContent></Card>
              ))}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {backlinks.map(b => (
                <Card key={b.id} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <p className="font-semibold text-slate-900 text-sm truncate flex-1">{b.dominio_origem}</p>
                      <Badge className={cn("text-xs ml-2 flex-shrink-0", b.tipo_link === "dofollow" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600")}>{b.tipo_link}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">DA: {b.autoridade_dominio || "-"}</p>
                    {b.data_publicacao && <p className="text-xs text-slate-400">{b.data_publicacao}</p>}
                  </CardContent>
                </Card>
              ))}
              {backlinks.length === 0 && <div className="col-span-3 text-center py-12 text-slate-400"><Link className="w-8 h-8 mx-auto mb-2 opacity-30" /><p>Nenhum backlink cadastrado</p></div>}
            </div>
          </TabsContent>

          {/* FUNIL */}
          <TabsContent value="funil">
            <PrimeFunnel
              leads={funnelLeads}
              onAddLead={() => { setShowForm("lead"); setFormData({}); }}
            />
          </TabsContent>

          {/* DELEGATION */}
          <TabsContent value="delegation">
            <DelegationOS
              tasks={delegationTasks}
              onAddTask={() => { setShowForm("delegation"); setFormData({}); }}
            />
          </TabsContent>
        </Tabs>

        {/* FORMS */}
        <Dialog open={!!showForm} onOpenChange={() => { setShowForm(null); setFormData({}); }}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {{ projeto: "Novo Projeto SEO", tarefa: "Nova Tarefa SEO", keyword: "Nova Palavra-Chave", conteudo: "Novo Conteúdo", backlink: "Novo Backlink", lead: "Novo Lead no Funil", delegation: "Nova Tarefa de Delegação" }[showForm]}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              {showForm === "projeto" && (
                <>
                  <div><Label>Projeto *</Label><Input value={formData.projeto || ""} onChange={e => setFormData({...formData, projeto: e.target.value})} placeholder="Nome do projeto" /></div>
                  <div><Label>Cliente *</Label><Input value={formData.cliente || ""} onChange={e => setFormData({...formData, cliente: e.target.value})} placeholder="Nome do cliente" /></div>
                  <div><Label>Website</Label><Input value={formData.website || ""} onChange={e => setFormData({...formData, website: e.target.value})} placeholder="https://..." /></div>
                  <div><Label>Email</Label><Input value={formData.email_cliente || ""} onChange={e => setFormData({...formData, email_cliente: e.target.value})} /></div>
                  <div><Label>Telefone</Label><Input value={formData.telefone || ""} onChange={e => setFormData({...formData, telefone: e.target.value})} /></div>
                  <div><Label>Responsável</Label><Input value={formData.responsavel || ""} onChange={e => setFormData({...formData, responsavel: e.target.value})} /></div>
                  <div><Label>Plano</Label><Select onValueChange={v => setFormData({...formData, plano_contratado: v})}><SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger><SelectContent><SelectItem value="basico">Básico</SelectItem><SelectItem value="intermediario">Intermediário</SelectItem><SelectItem value="avancado">Avançado</SelectItem></SelectContent></Select></div>
                  <div><Label>Receita Mensal (R$)</Label><Input type="number" value={formData.receita_mensal || ""} onChange={e => setFormData({...formData, receita_mensal: Number(e.target.value)})} /></div>
                  <div><Label>Data Início</Label><Input type="date" value={formData.data_inicio || ""} onChange={e => setFormData({...formData, data_inicio: e.target.value})} /></div>
                  <div><Label>Previsão Entrega</Label><Input type="date" value={formData.previsao_entrega || ""} onChange={e => setFormData({...formData, previsao_entrega: e.target.value})} /></div>
                  <div><Label>KPIs Meta</Label><Textarea value={formData.kpis_meta || ""} onChange={e => setFormData({...formData, kpis_meta: e.target.value})} rows={2} /></div>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => handleSave("projeto", createProjeto)} disabled={!formData.projeto || !formData.cliente}>Criar Projeto</Button>
                </>
              )}
              {showForm === "tarefa" && (
                <>
                  <div><Label>Tarefa *</Label><Input value={formData.tarefa || ""} onChange={e => setFormData({...formData, tarefa: e.target.value})} /></div>
                  <div><Label>Projeto</Label><Select onValueChange={v => { const p = projetos.find(x => x.id === v); setFormData({...formData, projeto_id: v, projeto_nome: p?.projeto}); }}><SelectTrigger><SelectValue placeholder="Selecionar projeto" /></SelectTrigger><SelectContent>{projetos.map(p => <SelectItem key={p.id} value={p.id}>{p.projeto}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label>Tipo</Label><Select onValueChange={v => setFormData({...formData, tipo_atividade: v})}><SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger><SelectContent><SelectItem value="auditoria_tecnica">Auditoria Técnica</SelectItem><SelectItem value="pesquisa_palavrachave">Pesquisa de Palavra-chave</SelectItem><SelectItem value="producao_conteudo">Produção de Conteúdo</SelectItem><SelectItem value="link_building">Link Building</SelectItem><SelectItem value="otimizacao_onpage">Otimização On-page</SelectItem><SelectItem value="relatorio">Relatório</SelectItem></SelectContent></Select></div>
                  <div><Label>Prioridade</Label><Select onValueChange={v => setFormData({...formData, prioridade: v})}><SelectTrigger><SelectValue placeholder="Prioridade" /></SelectTrigger><SelectContent><SelectItem value="alta">Alta</SelectItem><SelectItem value="media">Média</SelectItem><SelectItem value="baixa">Baixa</SelectItem></SelectContent></Select></div>
                  <div><Label>Responsável</Label><Input value={formData.responsavel || ""} onChange={e => setFormData({...formData, responsavel: e.target.value})} /></div>
                  <div><Label>Prazo</Label><Input type="date" value={formData.prazo || ""} onChange={e => setFormData({...formData, prazo: e.target.value})} /></div>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => handleSave("tarefa", createTarefa)} disabled={!formData.tarefa}>Criar Tarefa</Button>
                </>
              )}
              {showForm === "keyword" && (
                <>
                  <div><Label>Keyword *</Label><Input value={formData.keyword || ""} onChange={e => setFormData({...formData, keyword: e.target.value})} /></div>
                  <div><Label>Projeto</Label><Select onValueChange={v => { const p = projetos.find(x => x.id === v); setFormData({...formData, projeto_id: v, projeto_nome: p?.projeto}); }}><SelectTrigger><SelectValue placeholder="Selecionar projeto" /></SelectTrigger><SelectContent>{projetos.map(p => <SelectItem key={p.id} value={p.id}>{p.projeto}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label>Volume de Busca</Label><Input type="number" value={formData.volume_busca || ""} onChange={e => setFormData({...formData, volume_busca: Number(e.target.value)})} /></div>
                  <div><Label>Dificuldade (0-100%)</Label><Input type="number" value={formData.dificuldade || ""} onChange={e => setFormData({...formData, dificuldade: Number(e.target.value)})} /></div>
                  <div><Label>Intenção</Label><Select onValueChange={v => setFormData({...formData, intencao: v})}><SelectTrigger><SelectValue placeholder="Intenção" /></SelectTrigger><SelectContent><SelectItem value="informacional">Informacional</SelectItem><SelectItem value="comercial">Comercial</SelectItem><SelectItem value="transacional">Transacional</SelectItem></SelectContent></Select></div>
                  <div><Label>Posição Atual</Label><Input type="number" value={formData.posicao_atual || ""} onChange={e => setFormData({...formData, posicao_atual: Number(e.target.value)})} /></div>
                  <div><Label>Meta de Posição</Label><Input type="number" value={formData.meta_posicao || ""} onChange={e => setFormData({...formData, meta_posicao: Number(e.target.value)})} /></div>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => handleSave("keyword", createKeyword)} disabled={!formData.keyword}>Adicionar Keyword</Button>
                </>
              )}
              {showForm === "conteudo" && (
                <>
                  <div><Label>Título *</Label><Input value={formData.titulo || ""} onChange={e => setFormData({...formData, titulo: e.target.value})} /></div>
                  <div><Label>Projeto</Label><Select onValueChange={v => setFormData({...formData, projeto_id: v})}><SelectTrigger><SelectValue placeholder="Selecionar projeto" /></SelectTrigger><SelectContent>{projetos.map(p => <SelectItem key={p.id} value={p.id}>{p.projeto}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label>Keyword Principal</Label><Input value={formData.keyword_principal || ""} onChange={e => setFormData({...formData, keyword_principal: e.target.value})} /></div>
                  <div><Label>Tipo</Label><Select onValueChange={v => setFormData({...formData, tipo_conteudo: v})}><SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger><SelectContent><SelectItem value="blog_post">Blog Post</SelectItem><SelectItem value="pagina_pilar">Página Pilar</SelectItem><SelectItem value="landing_page">Landing Page</SelectItem></SelectContent></Select></div>
                  <div><Label>Data de Publicação</Label><Input type="date" value={formData.data_publicacao || ""} onChange={e => setFormData({...formData, data_publicacao: e.target.value})} /></div>
                  <div><Label>Meta Descrição</Label><Textarea value={formData.meta_descricao || ""} onChange={e => setFormData({...formData, meta_descricao: e.target.value})} rows={2} /></div>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => handleSave("conteudo", createConteudo)} disabled={!formData.titulo}>Criar Conteúdo</Button>
                </>
              )}
              {showForm === "backlink" && (
                <>
                  <div><Label>Domínio de Origem *</Label><Input value={formData.dominio_origem || ""} onChange={e => setFormData({...formData, dominio_origem: e.target.value})} placeholder="exemplo.com.br" /></div>
                  <div><Label>Projeto</Label><Select onValueChange={v => { const p = projetos.find(x => x.id === v); setFormData({...formData, projeto_id: v, projeto_nome: p?.projeto}); }}><SelectTrigger><SelectValue placeholder="Selecionar projeto" /></SelectTrigger><SelectContent>{projetos.map(p => <SelectItem key={p.id} value={p.id}>{p.projeto}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label>Autoridade do Domínio (0-100)</Label><Input type="number" value={formData.autoridade_dominio || ""} onChange={e => setFormData({...formData, autoridade_dominio: Number(e.target.value)})} /></div>
                  <div><Label>Tipo de Link</Label><Select onValueChange={v => setFormData({...formData, tipo_link: v})}><SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger><SelectContent><SelectItem value="dofollow">Dofollow</SelectItem><SelectItem value="nofollow">Nofollow</SelectItem></SelectContent></Select></div>
                  <div><Label>URL Destino</Label><Input value={formData.url_destino || ""} onChange={e => setFormData({...formData, url_destino: e.target.value})} placeholder="https://..." /></div>
                  <div><Label>Data de Publicação</Label><Input type="date" value={formData.data_publicacao || ""} onChange={e => setFormData({...formData, data_publicacao: e.target.value})} /></div>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => handleSave("backlink", createBacklink)} disabled={!formData.dominio_origem}>Adicionar Backlink</Button>
                </>
              )}
              {showForm === "lead" && (
                <>
                  <div><Label>Nome *</Label><Input value={formData.nome || ""} onChange={e => setFormData({...formData, nome: e.target.value})} /></div>
                  <div><Label>Lead Source</Label><Select onValueChange={v => setFormData({...formData, lead_source: v})}><SelectTrigger><SelectValue placeholder="Origem" /></SelectTrigger><SelectContent><SelectItem value="instagram">Instagram</SelectItem><SelectItem value="whatsapp">WhatsApp</SelectItem><SelectItem value="google">Google</SelectItem><SelectItem value="indicacao">Indicação</SelectItem><SelectItem value="trafego_pago">Tráfego Pago</SelectItem><SelectItem value="outro">Outro</SelectItem></SelectContent></Select></div>
                  <div><Label>Procedimento de Interesse</Label><Input value={formData.procedimento || ""} onChange={e => setFormData({...formData, procedimento: e.target.value})} placeholder="Ex: Invisalign" /></div>
                  <div><Label>Ticket Estimado (R$)</Label><Input type="number" value={formData.ticket_estimado || ""} onChange={e => setFormData({...formData, ticket_estimado: Number(e.target.value)})} /></div>
                  <div><Label>Telefone</Label><Input value={formData.telefone || ""} onChange={e => setFormData({...formData, telefone: e.target.value})} /></div>
                  <div><Label>Data de Entrada</Label><Input type="date" value={formData.data_entrada || ""} onChange={e => setFormData({...formData, data_entrada: e.target.value})} /></div>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => handleSave("lead", createLead)} disabled={!formData.nome}>Adicionar Lead</Button>
                </>
              )}
              {showForm === "delegation" && (
                <>
                  <div><Label>Tarefa *</Label><Input value={formData.tarefa || ""} onChange={e => setFormData({...formData, tarefa: e.target.value})} /></div>
                  <div><Label>Sistema</Label><Select onValueChange={v => setFormData({...formData, sistema: v})}><SelectTrigger><SelectValue placeholder="Sistema" /></SelectTrigger><SelectContent><SelectItem value="marketing">Marketing</SelectItem><SelectItem value="comercial">Comercial</SelectItem><SelectItem value="clinica">Clínica</SelectItem><SelectItem value="experiencia_paciente">Experiência do Paciente</SelectItem><SelectItem value="financeiro">Financeiro</SelectItem><SelectItem value="gestao">Gestão</SelectItem></SelectContent></Select></div>
                  <div><Label>Atual Responsável</Label><Input value={formData.atual_responsavel || ""} onChange={e => setFormData({...formData, atual_responsavel: e.target.value})} /></div>
                  <div><Label>Responsável Ideal</Label><Input value={formData.responsavel_ideal || ""} onChange={e => setFormData({...formData, responsavel_ideal: e.target.value})} /></div>
                  <div><Label>Frequência</Label><Select onValueChange={v => setFormData({...formData, frequencia: v})}><SelectTrigger><SelectValue placeholder="Frequência" /></SelectTrigger><SelectContent><SelectItem value="diaria">Diária</SelectItem><SelectItem value="semanal">Semanal</SelectItem><SelectItem value="mensal">Mensal</SelectItem><SelectItem value="trimestral">Trimestral</SelectItem><SelectItem value="ad_hoc">Ad hoc</SelectItem></SelectContent></Select></div>
                  <div className="grid grid-cols-2 gap-3">
                    {[["frequency_score", "Frequência (1-5)"], ["annoyance_level", "Chateação (1-5)"], ["impact_on_business", "Impacto (1-5)"], ["simplicity_to_delegate", "Simplicidade (1-5)"]].map(([field, label]) => (
                      <div key={field}><Label className="text-xs">{label}</Label><Input type="number" min={1} max={5} value={formData[field] || ""} onChange={e => setFormData({...formData, [field]: Number(e.target.value)})} /></div>
                    ))}
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-500">DPS Score calculado</p>
                    <p className="text-2xl font-bold text-indigo-600">{(Number(formData.frequency_score || 0) + Number(formData.annoyance_level || 0) + Number(formData.impact_on_business || 0) + Number(formData.simplicity_to_delegate || 0))}</p>
                  </div>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => handleSave("delegation", createDelegation)} disabled={!formData.tarefa}>Adicionar Tarefa</Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
