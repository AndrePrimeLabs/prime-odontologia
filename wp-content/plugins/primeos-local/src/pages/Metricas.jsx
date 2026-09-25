// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Plus, Loader2, TrendingUp, DollarSign, Users, Target, MousePointer, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format, subDays } from "date-fns";
import EngagementMetrics from "../components/metrics/EngagementMetrics";
import { usePageTracking } from "../components/metrics/EngagementTracker";
import MarketingSyncCard from "../components/metrics/MarketingSyncCard";
import InteractiveTour from "../components/onboarding/InteractiveTour";
import { metricsTour } from "../components/onboarding/tours";

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#6366f1'];

export default function Metricas() {
  usePageTracking("Metricas");
  
  const [showForm, setShowForm] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const queryClient = useQueryClient();

  useState(() => {
    const timer = setTimeout(() => setShowTour(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const { data: metrics = [] } = useQuery({
    queryKey: ["metrics"],
    queryFn: () => primeos.entities.MarketingMetric.list("-data")
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => primeos.entities.Campaign.list()
  });

  const { data: channels = [] } = useQuery({
    queryKey: ["marketingChannels"],
    queryFn: () => primeos.entities.MarketingChannel.list()
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: () => primeos.entities.Lead.list()
  });

  const { data: engagementData = [] } = useQuery({
    queryKey: ["engagement"],
    queryFn: () => primeos.entities.UserEngagement.list("-created_date")
  });

  const createMutation = useMutation({
    mutationFn: (data) => primeos.entities.MarketingMetric.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      setShowForm(false);
      toast.success("Métrica registrada!");
    }
  });

  const [form, setForm] = useState({
    data: format(new Date(), "yyyy-MM-dd"), canal_id: "", campanha_id: "",
    periodo: "semanal", leads_gerados: 0, agendamentos: 0, conversoes: 0,
    receita_gerada: 0, investimento: 0, impressoes: 0, cliques: 0, engajamento: 0
  });

  // Calculate totals
  const totals = metrics.reduce((acc, m) => ({
    leads: acc.leads + (m.leads_gerados || 0),
    agendamentos: acc.agendamentos + (m.agendamentos || 0),
    conversoes: acc.conversoes + (m.conversoes || 0),
    receita: acc.receita + (m.receita_gerada || 0),
    investimento: acc.investimento + (m.investimento || 0),
    impressoes: acc.impressoes + (m.impressoes || 0),
    cliques: acc.cliques + (m.cliques || 0)
  }), { leads: 0, agendamentos: 0, conversoes: 0, receita: 0, investimento: 0, impressoes: 0, cliques: 0 });

  const cac = totals.conversoes > 0 ? (totals.investimento / totals.conversoes).toFixed(2) : 0;
  const roi = totals.investimento > 0 ? (((totals.receita - totals.investimento) / totals.investimento) * 100).toFixed(1) : 0;
  const ctr = totals.impressoes > 0 ? ((totals.cliques / totals.impressoes) * 100).toFixed(2) : 0;

  // Chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
    const dayMetrics = metrics.filter(m => m.data === date);
    return {
      date: format(subDays(new Date(), 6 - i), "dd/MM"),
      leads: dayMetrics.reduce((s, m) => s + (m.leads_gerados || 0), 0),
      receita: dayMetrics.reduce((s, m) => s + (m.receita_gerada || 0), 0) / 1000
    };
  });

  // Leads by channel
  const leadsByChannel = channels.map(ch => ({
    name: ch.plataforma,
    value: leads.filter(l => l.origem_canal_id === ch.id).length
  })).filter(c => c.value > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-teal-600" />
              Métricas & Analytics
            </h1>
            <p className="text-slate-500 mt-1">Marketing, receita e engajamento de usuários</p>
          </div>
          <Button onClick={() => { setForm({ data: format(new Date(), "yyyy-MM-dd"), canal_id: "", campanha_id: "", periodo: "semanal", leads_gerados: 0, agendamentos: 0, conversoes: 0, receita_gerada: 0, investimento: 0, impressoes: 0, cliques: 0, engajamento: 0 }); setShowForm(true); }} className="bg-teal-600 hover:bg-teal-700">
            <Plus className="w-4 h-4 mr-2" />Registrar Métricas
          </Button>
        </motion.div>

        <Tabs defaultValue="marketing" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="marketing" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Marketing & Receita
            </TabsTrigger>
            <TabsTrigger value="engagement" className="flex items-center gap-2" data-tour="engagement-tab">
              <Activity className="w-4 h-4" />
              Engajamento de Usuários
            </TabsTrigger>
          </TabsList>

          <TabsContent value="marketing" className="space-y-6">
            <div data-tour="sync-card">
              <MarketingSyncCard />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6" data-tour="kpi-cards">
              {[
                { label: "Receita Total", value: `R$ ${(totals.receita / 1000).toFixed(0)}k`, icon: DollarSign, color: "text-emerald-600" },
                { label: "Investimento", value: `R$ ${(totals.investimento / 1000).toFixed(0)}k`, icon: Target, color: "text-blue-600" },
                { label: "ROI", value: `${roi}%`, icon: TrendingUp, color: roi > 0 ? "text-emerald-600" : "text-red-600" },
                { label: "CAC", value: `R$ ${cac}`, icon: Users, color: "text-purple-600" },
                { label: "Leads", value: totals.leads, icon: Users, color: "text-indigo-600" },
                { label: "CTR", value: `${ctr}%`, icon: MousePointer, color: "text-amber-600" }
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

            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Leads & Receita (7 dias)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={last7Days}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line yAxisId="left" type="monotone" dataKey="leads" stroke="#8b5cf6" strokeWidth={2} name="Leads" />
                      <Line yAxisId="right" type="monotone" dataKey="receita" stroke="#10b981" strokeWidth={2} name="Receita (k)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Leads por Canal</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={leadsByChannel} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {leadsByChannel.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-sm" data-tour="funnel">
              <CardHeader>
                <CardTitle className="text-base">Funil de Conversão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  {[
                    { label: "Impressões", value: totals.impressoes, color: "bg-slate-500" },
                    { label: "Cliques", value: totals.cliques, color: "bg-blue-500" },
                    { label: "Leads", value: totals.leads, color: "bg-purple-500" },
                    { label: "Agendamentos", value: totals.agendamentos, color: "bg-amber-500" },
                    { label: "Conversões", value: totals.conversoes, color: "bg-emerald-500" }
                  ].map((step, idx, arr) => (
                    <div key={idx} className="flex-1 text-center">
                      <div className={cn("mx-auto w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold mb-2", step.color)}>
                        {step.value > 1000 ? `${(step.value / 1000).toFixed(0)}k` : step.value}
                      </div>
                      <p className="text-sm text-slate-600">{step.label}</p>
                      {idx < arr.length - 1 && arr[idx + 1].value > 0 && step.value > 0 && (
                        <p className="text-xs text-slate-400 mt-1">
                          {((arr[idx + 1].value / step.value) * 100).toFixed(1)}%
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            <EngagementMetrics engagementData={engagementData} />
          </TabsContent>
        </Tabs>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Registrar Métricas</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Data</Label><Input type="date" value={form.data} onChange={(e) => setForm({...form, data: e.target.value})} /></div>
                <div>
                  <Label>Período</Label>
                  <Select value={form.periodo} onValueChange={(v) => setForm({...form, periodo: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diario">Diário</SelectItem>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="mensal">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Canal</Label>
                  <Select value={form.canal_id} onValueChange={(v) => setForm({...form, canal_id: v})}>
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
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Impressões</Label><Input type="number" value={form.impressoes} onChange={(e) => setForm({...form, impressoes: parseInt(e.target.value) || 0})} /></div>
                <div><Label>Cliques</Label><Input type="number" value={form.cliques} onChange={(e) => setForm({...form, cliques: parseInt(e.target.value) || 0})} /></div>
                <div><Label>Engajamento</Label><Input type="number" value={form.engajamento} onChange={(e) => setForm({...form, engajamento: parseInt(e.target.value) || 0})} /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Leads</Label><Input type="number" value={form.leads_gerados} onChange={(e) => setForm({...form, leads_gerados: parseInt(e.target.value) || 0})} /></div>
                <div><Label>Agendamentos</Label><Input type="number" value={form.agendamentos} onChange={(e) => setForm({...form, agendamentos: parseInt(e.target.value) || 0})} /></div>
                <div><Label>Conversões</Label><Input type="number" value={form.conversoes} onChange={(e) => setForm({...form, conversoes: parseInt(e.target.value) || 0})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Investimento (R$)</Label><Input type="number" value={form.investimento} onChange={(e) => setForm({...form, investimento: parseFloat(e.target.value) || 0})} /></div>
                <div><Label>Receita (R$)</Label><Input type="number" value={form.receita_gerada} onChange={(e) => setForm({...form, receita_gerada: parseFloat(e.target.value) || 0})} /></div>
              </div>
              <Button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending} className="w-full bg-teal-600 hover:bg-teal-700">
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Registrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {showTour && (
          <InteractiveTour
            tourId={metricsTour.id}
            steps={metricsTour.steps}
            onComplete={() => setShowTour(false)}
            autoStart={true}
          />
        )}
      </div>
    </div>
  );
}
