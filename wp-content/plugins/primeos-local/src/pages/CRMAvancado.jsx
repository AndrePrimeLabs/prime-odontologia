// @ts-nocheck
import { useState, useMemo } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Users, Target, Zap, MessageCircle, Instagram, Facebook,
  Phone, Mail, Star, Calendar, DollarSign, Filter, Plus, BarChart3, Flame, Sparkles,
  CheckCircle, RefreshCcw, Eye, Send, Loader2, Brain
} from "lucide-react";
import AILeadScoring from "@/components/crm/AILeadScoring";
import SalesForecast from "@/components/crm/SalesForecast";
import FollowUpSuggestions from "@/components/crm/FollowUpSuggestions";
import NextActionSuggestions from "@/components/crm/NextActionSuggestions";
import LeadRoutingRecommendations from "@/components/crm/LeadRoutingRecommendations";
import ConversionPrediction from "@/components/crm/ConversionPrediction";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";

// Lead Scoring Configuration
const SCORE_RULES = {
  mensagem_recebida: 5,
  mensagem_enviada: 2,
  ligacao: 10,
  agendamento: 20,
  compareceu: 30,
  nao_compareceu: -15,
  orcamento_enviado: 15,
  orcamento_aceito: 50,
  pagamento: 100,
  indicacao: 40,
  sem_resposta_24h: -5,
  sem_resposta_48h: -10,
  instagram_engagement: 8,
  facebook_engagement: 8
};

const SEGMENT_COLORS = {
  vip: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300" },
  premium: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" },
  standard: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-300" },
  cold: { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-300" },
  reativacao: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-300" }
};

const CHANNEL_ICONS = {
  whatsapp: MessageCircle,
  instagram: Instagram,
  facebook: Facebook,
  telefone: Phone,
  email: Mail
};

export default function CRMAvancado() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedLead, setSelectedLead] = useState(null);
  const [showWorkflowForm, setShowWorkflowForm] = useState(false);
  const [showSegmentForm, setShowSegmentForm] = useState(false);
  const [filters, setFilters] = useState({ segmento: "all", canal: "all", score: "all" });
  
  const queryClient = useQueryClient();

  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: () => primeos.entities.Lead.list("-lead_score")
  });

  const { data: interactions = [] } = useQuery({
    queryKey: ["leadInteractions"],
    queryFn: () => primeos.entities.LeadInteraction.list("-created_date")
  });

  const { data: workflows = [] } = useQuery({
    queryKey: ["crmWorkflows"],
    queryFn: () => primeos.entities.CRMWorkflow.list()
  });

  const { data: segments = [] } = useQuery({
    queryKey: ["customerSegments"],
    queryFn: () => primeos.entities.CustomerSegment.list()
  });

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.Lead.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads"] })
  });

  const createInteractionMutation = useMutation({
    mutationFn: (data) => primeos.entities.LeadInteraction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leadInteractions"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    }
  });

  const createWorkflowMutation = useMutation({
    mutationFn: (data) => primeos.entities.CRMWorkflow.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crmWorkflows"] });
      setShowWorkflowForm(false);
      toast.success("Workflow criado!");
    }
  });

  const createSegmentMutation = useMutation({
    mutationFn: (data) => primeos.entities.CustomerSegment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customerSegments"] });
      setShowSegmentForm(false);
      toast.success("Segmento criado!");
    }
  });

  // Calculate lead score
  const calculateScore = (lead, leadInteractions) => {
    let score = 0;
    leadInteractions.forEach(i => {
      score += SCORE_RULES[i.tipo] || 0;
    });
    
    // Time decay
    if (lead.ultima_interacao) {
      const daysSince = differenceInDays(new Date(), new Date(lead.ultima_interacao));
      if (daysSince > 30) score -= 20;
      else if (daysSince > 14) score -= 10;
      else if (daysSince > 7) score -= 5;
    }
    
    // Bonus for high value
    if (lead.valor_estimado > 5000) score += 15;
    if (lead.valor_estimado > 10000) score += 25;
    
    return Math.max(0, Math.min(100, score));
  };

  // Auto-segment leads
  const getSegment = (score, lead) => {
    if (score >= 80 || lead.lifetime_value > 10000) return "vip";
    if (score >= 60 || lead.valor_estimado > 5000) return "premium";
    if (score >= 30) return "standard";
    if (lead.ultima_interacao) {
      const days = differenceInDays(new Date(), new Date(lead.ultima_interacao));
      if (days > 30) return "reativacao";
    }
    return "cold";
  };

  // Recalculate all scores
  const recalculateScores = async () => {
    for (const lead of leads) {
      const leadInts = interactions.filter(i => i.lead_id === lead.id);
      const newScore = calculateScore(lead, leadInts);
      const newSegment = getSegment(newScore, lead);
      
      if (lead.lead_score !== newScore || lead.segmento !== newSegment) {
        await updateLeadMutation.mutateAsync({
          id: lead.id,
          data: { ...lead, lead_score: newScore, segmento: newSegment }
        });
      }
    }
    toast.success("Scores recalculados!");
  };

  // Stats
  const stats = useMemo(() => {
    const vips = leads.filter(l => l.segmento === "vip").length;
    const premium = leads.filter(l => l.segmento === "premium").length;
    const avgScore = leads.length > 0 ? (leads.reduce((s, l) => s + (l.lead_score || 0), 0) / leads.length).toFixed(0) : 0;
    const hotLeads = leads.filter(l => l.lead_score >= 70).length;
    const totalValue = leads.reduce((s, l) => s + (l.valor_estimado || 0), 0);
    const activeWorkflows = workflows.filter(w => w.ativo).length;
    
    return { vips, premium, avgScore, hotLeads, totalValue, activeWorkflows };
  }, [leads, workflows]);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      if (filters.segmento !== "all" && lead.segmento !== filters.segmento) return false;
      if (filters.canal !== "all" && lead.canal_conversao !== filters.canal) return false;
      if (filters.score === "hot" && lead.lead_score < 70) return false;
      if (filters.score === "warm" && (lead.lead_score < 40 || lead.lead_score >= 70)) return false;
      if (filters.score === "cold" && lead.lead_score >= 40) return false;
      return true;
    });
  }, [leads, filters]);

  const [workflowForm, setWorkflowForm] = useState({
    name: "", descricao: "", gatilho: "lead_novo", canal: "whatsapp",
    segmento_alvo: "todos", ativo: true, etapas: []
  });

  const [segmentForm, setSegmentForm] = useState({
    name: "", descricao: "", cor: "#6366f1",
    criterios: { score_min: 0, score_max: 100, interacoes_min: 0, valor_min: 0 }
  });

  const openWhatsApp = (phone, message) => {
    const clean = phone?.replace(/\D/g, "") || "";
    window.open(`https://wa.me/55${clean}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const logInteraction = async (leadId, tipo, canal, conteudo) => {
    await createInteractionMutation.mutateAsync({
      lead_id: leadId, tipo, canal, conteudo,
      pontos: SCORE_RULES[tipo] || 0
    });
    toast.success("Interação registrada!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6">
      <div className="max-w-[1600px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Target className="w-8 h-8 text-indigo-600" />
                CRM Avançado
              </h1>
              <p className="text-slate-500 mt-1">Lead Scoring • Workflows • Segmentação Omnichannel</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={recalculateScores}>
                <RefreshCcw className="w-4 h-4 mr-2" />Recalcular Scores
              </Button>
              <Button onClick={() => setShowWorkflowForm(true)} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />Novo Workflow
              </Button>
            </div>
          </div>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {[
            { label: "Total Leads", value: leads.length, icon: Users, color: "text-slate-600" },
            { label: "VIPs", value: stats.vips, icon: Star, color: "text-purple-600" },
            { label: "Score Médio", value: stats.avgScore, icon: Target, color: "text-indigo-600" },
            { label: "Leads Quentes", value: stats.hotLeads, icon: Flame, color: "text-orange-600" },
            { label: "Valor Pipeline", value: `R$${(stats.totalValue/1000).toFixed(0)}k`, icon: DollarSign, color: "text-emerald-600" },
            { label: "Workflows Ativos", value: stats.activeWorkflows, icon: Zap, color: "text-blue-600" }
          ].map((kpi, idx) => (
            <Card key={idx} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <kpi.icon className={cn("w-4 h-4", kpi.color)} />
                  <span className="text-xs text-slate-500">{kpi.label}</span>
                </div>
                <p className={cn("text-2xl font-bold", kpi.color)}>{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview"><BarChart3 className="w-4 h-4 mr-2" />Overview</TabsTrigger>
            <TabsTrigger value="leads"><Users className="w-4 h-4 mr-2" />Leads</TabsTrigger>
            <TabsTrigger value="ai"><Brain className="w-4 h-4 mr-2" />IA Insights</TabsTrigger>
            <TabsTrigger value="workflows"><Zap className="w-4 h-4 mr-2" />Workflows</TabsTrigger>
            <TabsTrigger value="segments"><Filter className="w-4 h-4 mr-2" />Segmentos</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Score Distribution */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-600" />
                    Distribuição de Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { range: "80-100", label: "Quentes 🔥", color: "bg-orange-500", count: leads.filter(l => l.lead_score >= 80).length },
                      { range: "60-79", label: "Engajados", color: "bg-amber-500", count: leads.filter(l => l.lead_score >= 60 && l.lead_score < 80).length },
                      { range: "40-59", label: "Mornos", color: "bg-blue-500", count: leads.filter(l => l.lead_score >= 40 && l.lead_score < 60).length },
                      { range: "20-39", label: "Frios", color: "bg-cyan-500", count: leads.filter(l => l.lead_score >= 20 && l.lead_score < 40).length },
                      { range: "0-19", label: "Inativos", color: "bg-slate-400", count: leads.filter(l => l.lead_score < 20).length }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-20 text-xs text-slate-500">{item.range}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">{item.label}</span>
                            <span className="text-sm font-medium">{item.count}</span>
                          </div>
                          <Progress value={leads.length > 0 ? (item.count / leads.length) * 100 : 0} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Segment Breakdown */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Segmentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(SEGMENT_COLORS).map(([key, colors]) => {
                      const count = leads.filter(l => l.segmento === key).length;
                      const value = leads.filter(l => l.segmento === key).reduce((s, l) => s + (l.valor_estimado || 0), 0);
                      return (
                        <div key={key} className={cn("p-3 rounded-lg border", colors.bg, colors.border)}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={cn("font-semibold capitalize", colors.text)}>{key}</p>
                              <p className="text-xs text-slate-500">{count} leads</p>
                            </div>
                            <p className={cn("font-bold", colors.text)}>R$ {(value/1000).toFixed(0)}k</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Channel Performance */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                    Performance por Canal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {["whatsapp", "instagram", "facebook", "telefone", "email"].map((canal) => {
                      const Icon = CHANNEL_ICONS[canal] || MessageCircle;
                      const canalLeads = leads.filter(l => l.canal_conversao === canal);
                      const avgScore = canalLeads.length > 0 ? (canalLeads.reduce((s, l) => s + (l.lead_score || 0), 0) / canalLeads.length).toFixed(0) : 0;
                      return (
                        <div key={canal} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                          <Icon className="w-5 h-5 text-slate-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium capitalize">{canal}</p>
                            <p className="text-xs text-slate-500">{canalLeads.length} leads</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-indigo-600">{avgScore}</p>
                            <p className="text-xs text-slate-400">score médio</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Leads */}
            <Card className="border-0 shadow-sm mt-6">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-600" />
                  Top 10 Leads Quentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-3">
                  {leads.slice(0, 10).map((lead) => (
                    <div key={lead.id} className="p-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm truncate">{lead.name}</p>
                        <Badge className="bg-orange-100 text-orange-700">{lead.lead_score || 0}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Badge variant="outline" className={cn("text-xs", SEGMENT_COLORS[lead.segmento]?.text)}>{lead.segmento}</Badge>
                        <span>R$ {(lead.valor_estimado || 0).toLocaleString()}</span>
                      </div>
                      <Button size="sm" variant="ghost" className="w-full mt-2 h-7" onClick={() => setSelectedLead(lead)}>
                        <Eye className="w-3 h-3 mr-1" />Ver
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Tab */}
          <TabsContent value="ai">
            <div className="space-y-6">
              <SalesForecast />
              {selectedLead && (
                <>
                  <div className="grid lg:grid-cols-2 gap-6">
                    <AILeadScoring lead={selectedLead} onScored={() => queryClient.invalidateQueries({ queryKey: ["leads"] })} />
                    <ConversionPrediction lead={selectedLead} />
                  </div>
                  <div className="grid lg:grid-cols-2 gap-6">
                    <NextActionSuggestions lead={selectedLead} />
                    <LeadRoutingRecommendations lead={selectedLead} onAssign={() => queryClient.invalidateQueries({ queryKey: ["leads"] })} />
                  </div>
                  <FollowUpSuggestions lead={selectedLead} />
                </>
              )}
              {!selectedLead && (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-8 text-center">
                    <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">Selecione um lead na aba "Leads" para ver análises de IA completas</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className="text-base">Todos os Leads ({filteredLeads.length})</CardTitle>
                  <div className="flex gap-2 flex-wrap">
                    <Select value={filters.segmento} onValueChange={(v) => setFilters({...filters, segmento: v})}>
                      <SelectTrigger className="w-32"><SelectValue placeholder="Segmento" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {Object.keys(SEGMENT_COLORS).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={filters.canal} onValueChange={(v) => setFilters({...filters, canal: v})}>
                      <SelectTrigger className="w-32"><SelectValue placeholder="Canal" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {Object.keys(CHANNEL_ICONS).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={filters.score} onValueChange={(v) => setFilters({...filters, score: v})}>
                      <SelectTrigger className="w-32"><SelectValue placeholder="Score" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="hot">Quentes (70+)</SelectItem>
                        <SelectItem value="warm">Mornos (40-69)</SelectItem>
                        <SelectItem value="cold">Frios (&lt;40)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {filteredLeads.map((lead) => {
                      const Icon = CHANNEL_ICONS[lead.canal_conversao] || MessageCircle;
                      const leadInts = interactions.filter(i => i.lead_id === lead.id);
                      return (
                        <div key={lead.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                            {lead.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{lead.name}</p>
                              <Badge className={cn("text-xs", SEGMENT_COLORS[lead.segmento]?.bg, SEGMENT_COLORS[lead.segmento]?.text)}>{lead.segmento}</Badge>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-500">
                              <span className="flex items-center gap-1"><Icon className="w-3 h-3" />{lead.canal_conversao}</span>
                              <span>{lead.interesse}</span>
                              <span>{leadInts.length} interações</span>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className={cn("text-2xl font-bold", lead.lead_score >= 70 ? "text-orange-600" : lead.lead_score >= 40 ? "text-blue-600" : "text-slate-400")}>
                              {lead.lead_score || 0}
                            </div>
                            <p className="text-xs text-slate-400">score</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-emerald-600">R$ {(lead.valor_estimado || 0).toLocaleString()}</p>
                            <p className="text-xs text-slate-400">{lead.status}</p>
                          </div>
                          <div className="flex gap-1">
                            {lead.phone && (
                              <Button size="sm" variant="ghost" onClick={() => openWhatsApp(lead.phone, `Olá ${lead.name}!`)}>
                                <MessageCircle className="w-4 h-4 text-green-600" />
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => setSelectedLead(lead)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workflows Tab */}
          <TabsContent value="workflows">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workflows.map((workflow) => (
                <Card key={workflow.id} className={cn("border-0 shadow-sm", !workflow.ativo && "opacity-60")}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="outline" className="mb-2">{workflow.gatilho}</Badge>
                        <CardTitle className="text-base">{workflow.name}</CardTitle>
                      </div>
                      <Switch checked={workflow.ativo} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-500 mb-3">{workflow.descricao}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        {(() => { const Icon = CHANNEL_ICONS[workflow.canal] || MessageCircle; return <Icon className="w-4 h-4" />; })()}
                        {workflow.canal}
                      </span>
                      <span>Alvo: {workflow.segmento_alvo}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t flex items-center justify-between">
                      <span className="text-xs text-slate-400">{workflow.etapas?.length || 0} etapas</span>
                      <Badge className={workflow.ativo ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"}>
                        {workflow.ativo ? "Ativo" : "Pausado"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Card className="border-2 border-dashed border-slate-200 hover:border-indigo-300 transition-all cursor-pointer" onClick={() => setShowWorkflowForm(true)}>
                <CardContent className="p-6 flex flex-col items-center justify-center h-full text-slate-400 hover:text-indigo-600">
                  <Plus className="w-12 h-12 mb-2" />
                  <p className="font-medium">Criar Workflow</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Segments Tab */}
          <TabsContent value="segments">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Default segments */}
              {Object.entries(SEGMENT_COLORS).map(([key, colors]) => {
                const segmentLeads = leads.filter(l => l.segmento === key);
                const totalValue = segmentLeads.reduce((s, l) => s + (l.valor_estimado || 0), 0);
                return (
                  <Card key={key} className={cn("border-0 shadow-sm border-l-4", colors.border)}>
                    <CardHeader className="pb-2">
                      <CardTitle className={cn("text-base capitalize", colors.text)}>{key}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-3xl font-bold">{segmentLeads.length}</p>
                          <p className="text-xs text-slate-500">leads</p>
                        </div>
                        <div>
                          <p className="text-xl font-bold text-emerald-600">R$ {(totalValue/1000).toFixed(0)}k</p>
                          <p className="text-xs text-slate-500">valor total</p>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full mt-4" size="sm" onClick={() => setFilters({...filters, segmento: key})}>
                        Ver Leads
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
              
              <Card className="border-2 border-dashed border-slate-200 hover:border-purple-300 transition-all cursor-pointer" onClick={() => setShowSegmentForm(true)}>
                <CardContent className="p-6 flex flex-col items-center justify-center h-full text-slate-400 hover:text-purple-600">
                  <Plus className="w-12 h-12 mb-2" />
                  <p className="font-medium">Criar Segmento</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Lead Detail Modal */}
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedLead && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                      {selectedLead.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <DialogTitle className="text-xl">{selectedLead.name}</DialogTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={cn(SEGMENT_COLORS[selectedLead.segmento]?.bg, SEGMENT_COLORS[selectedLead.segmento]?.text)}>{selectedLead.segmento}</Badge>
                        <Badge variant="outline">{selectedLead.status}</Badge>
                      </div>
                    </div>
                    <div className="ml-auto text-center">
                      <p className="text-4xl font-bold text-indigo-600">{selectedLead.lead_score || 0}</p>
                      <p className="text-xs text-slate-500">Lead Score</p>
                    </div>
                  </div>
                </DialogHeader>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Telefone</p>
                    <p className="font-medium">{selectedLead.phone || "-"}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="font-medium">{selectedLead.email || "-"}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Canal</p>
                    <p className="font-medium capitalize">{selectedLead.canal_conversao}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Interesse</p>
                    <p className="font-medium capitalize">{selectedLead.interesse}</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <p className="text-xs text-emerald-600">Valor Estimado</p>
                    <p className="font-bold text-emerald-700">R$ {(selectedLead.valor_estimado || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs text-purple-600">Lifetime Value</p>
                    <p className="font-bold text-purple-700">R$ {(selectedLead.lifetime_value || 0).toLocaleString()}</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Registrar Interação</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { tipo: "mensagem_enviada", label: "Mensagem Enviada", icon: Send },
                      { tipo: "mensagem_recebida", label: "Mensagem Recebida", icon: MessageCircle },
                      { tipo: "ligacao", label: "Ligação", icon: Phone },
                      { tipo: "agendamento", label: "Agendamento", icon: Calendar },
                      { tipo: "compareceu", label: "Compareceu", icon: CheckCircle },
                      { tipo: "orcamento_enviado", label: "Orçamento Enviado", icon: DollarSign }
                    ].map((action) => (
                      <Button
                        key={action.tipo}
                        size="sm"
                        variant="outline"
                        onClick={() => logInteraction(selectedLead.id, action.tipo, selectedLead.canal_conversao, "")}
                      >
                        <action.icon className="w-3 h-3 mr-1" />{action.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Interaction History */}
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Histórico de Interações</p>
                  <ScrollArea className="h-48 border rounded-lg p-2">
                    {interactions.filter(i => i.lead_id === selectedLead.id).slice(0, 20).map((int, idx) => (
                      <div key={idx} className="flex items-center gap-3 py-2 border-b last:border-0">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-xs", int.pontos > 0 ? "bg-green-500" : int.pontos < 0 ? "bg-red-500" : "bg-slate-400")}>
                          {int.pontos > 0 ? `+${int.pontos}` : int.pontos}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{int.tipo.replace(/_/g, " ")}</p>
                          <p className="text-xs text-slate-400">{int.canal} • {int.created_date ? format(new Date(int.created_date), "dd/MM HH:mm") : ""}</p>
                        </div>
                      </div>
                    ))}
                    {interactions.filter(i => i.lead_id === selectedLead.id).length === 0 && (
                      <p className="text-center text-slate-400 py-8">Nenhuma interação registrada</p>
                    )}
                  </ScrollArea>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Workflow Form Modal */}
        <Dialog open={showWorkflowForm} onOpenChange={setShowWorkflowForm}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Novo Workflow</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div><Label>Nome</Label><Input value={workflowForm.name} onChange={(e) => setWorkflowForm({...workflowForm, name: e.target.value})} placeholder="Ex: Follow-up Lead Novo" /></div>
              <div><Label>Descrição</Label><Textarea value={workflowForm.descricao} onChange={(e) => setWorkflowForm({...workflowForm, descricao: e.target.value})} rows={2} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Gatilho</Label>
                  <Select value={workflowForm.gatilho} onValueChange={(v) => setWorkflowForm({...workflowForm, gatilho: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead_novo">Lead Novo</SelectItem>
                      <SelectItem value="sem_resposta_24h">Sem Resposta 24h</SelectItem>
                      <SelectItem value="sem_resposta_48h">Sem Resposta 48h</SelectItem>
                      <SelectItem value="agendamento_confirmado">Agendamento Confirmado</SelectItem>
                      <SelectItem value="nao_compareceu">Não Compareceu</SelectItem>
                      <SelectItem value="orcamento_enviado">Orçamento Enviado</SelectItem>
                      <SelectItem value="lead_frio">Lead Frio</SelectItem>
                      <SelectItem value="lead_quente">Lead Quente</SelectItem>
                      <SelectItem value="reativacao">Reativação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Canal</Label>
                  <Select value={workflowForm.canal} onValueChange={(v) => setWorkflowForm({...workflowForm, canal: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="todos">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Segmento Alvo</Label>
                <Select value={workflowForm.segmento_alvo} onValueChange={(v) => setWorkflowForm({...workflowForm, segmento_alvo: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="cold">Cold</SelectItem>
                    <SelectItem value="reativacao">Reativação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => createWorkflowMutation.mutate(workflowForm)} disabled={!workflowForm.name || createWorkflowMutation.isPending} className="w-full bg-indigo-600 hover:bg-indigo-700">
                {createWorkflowMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Criar Workflow
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Segment Form Modal */}
        <Dialog open={showSegmentForm} onOpenChange={setShowSegmentForm}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Segmento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div><Label>Nome</Label><Input value={segmentForm.name} onChange={(e) => setSegmentForm({...segmentForm, name: e.target.value})} /></div>
              <div><Label>Descrição</Label><Textarea value={segmentForm.descricao} onChange={(e) => setSegmentForm({...segmentForm, descricao: e.target.value})} rows={2} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Score Mínimo</Label><Input type="number" value={segmentForm.criterios.score_min} onChange={(e) => setSegmentForm({...segmentForm, criterios: {...segmentForm.criterios, score_min: parseInt(e.target.value) || 0}})} /></div>
                <div><Label>Score Máximo</Label><Input type="number" value={segmentForm.criterios.score_max} onChange={(e) => setSegmentForm({...segmentForm, criterios: {...segmentForm.criterios, score_max: parseInt(e.target.value) || 100}})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Interações Mín</Label><Input type="number" value={segmentForm.criterios.interacoes_min} onChange={(e) => setSegmentForm({...segmentForm, criterios: {...segmentForm.criterios, interacoes_min: parseInt(e.target.value) || 0}})} /></div>
                <div><Label>Valor Mín (R$)</Label><Input type="number" value={segmentForm.criterios.valor_min} onChange={(e) => setSegmentForm({...segmentForm, criterios: {...segmentForm.criterios, valor_min: parseInt(e.target.value) || 0}})} /></div>
              </div>
              <Button onClick={() => createSegmentMutation.mutate(segmentForm)} disabled={!segmentForm.name || createSegmentMutation.isPending} className="w-full bg-purple-600 hover:bg-purple-700">
                {createSegmentMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Criar Segmento
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
