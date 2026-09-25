// @ts-nocheck
import { useState, useMemo } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend, AreaChart, Area
} from "recharts";
import {
  DollarSign, TrendingUp, Target, Globe, Users, BarChart3, ArrowUp, ArrowDown, Minus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#f97316", "#ef4444"];

const funnelStageLabels = {
  lead: "Lead", contato: "Contato", avaliacao_marcada: "Avaliação",
  compareceu: "Compareceu", proposta_enviada: "Proposta",
  fechado: "Fechado", perdido: "Perdido"
};

const funnelStageColors = {
  lead: "#94a3b8", contato: "#3b82f6", avaliacao_marcada: "#eab308",
  compareceu: "#f97316", proposta_enviada: "#a855f7",
  fechado: "#22c55e", perdido: "#ef4444"
};

function KPICard({ label, value, sub, icon: Icon, color, trend }) {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", `bg-${color}-100`)}>
            <Icon className={cn("w-5 h-5", `text-${color}-600`)} />
          </div>
          {trend !== undefined && (
            <span className={cn("text-xs font-semibold flex items-center gap-0.5",
              trend > 0 ? "text-green-600" : trend < 0 ? "text-red-500" : "text-slate-400")}>
              {trend > 0 ? <ArrowUp className="w-3 h-3" /> : trend < 0 ? <ArrowDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        <p className="text-2xl font-bold text-slate-900 mt-3">{value}</p>
        <p className="text-sm text-slate-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

const fmt = (v) => `R$ ${Number(v || 0).toLocaleString("pt-BR")}`;
const fmtK = (v) => v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`;

export default function DashboardFinanceiro() {
  const [periodo, setPeriodo] = useState("6");

  const { data: projetos = [] } = useQuery({ queryKey: ["ProjetoSEO"], queryFn: () => primeos.entities.ProjetoSEO.list() });
  const { data: funnelLeads = [] } = useQuery({ queryKey: ["PrimeFunnelLead"], queryFn: () => primeos.entities.PrimeFunnelLead.list() });
  const { data: growthStages = [] } = useQuery({ queryKey: ["PrimeGrowthStage"], queryFn: () => primeos.entities.PrimeGrowthStage.list() });
  const { data: transactions = [] } = useQuery({ queryKey: ["FinancialTransaction"], queryFn: () => primeos.entities.FinancialTransaction.list() });

  const meses = Number(periodo);

  // ── Receita MRR dos projetos ativos
  const projetosAtivos = projetos.filter(p => p.status_operacional === "em_andamento");
  const mrrSEO = projetosAtivos.reduce((s, p) => s + (p.receita_mensal || 0), 0);
  const totalSEOAnual = mrrSEO * 12;

  // ── Receita do funil (leads fechados)
  const leadsFechados = funnelLeads.filter(l => l.status === "fechado");
  const receitaFunil = leadsFechados.reduce((s, l) => s + (l.ticket_estimado || 0), 0);
  const receitaPotencial = funnelLeads.filter(l => !["perdido", "fechado"].includes(l.status)).reduce((s, l) => s + (l.ticket_estimado || 0), 0);

  // ── Receita total consolidada
  const receitaTotal = mrrSEO + receitaFunil;

  // ── Receita por cliente (SEO)
  const receitaPorCliente = useMemo(() => {
    return projetosAtivos
      .map(p => ({ cliente: p.cliente || "Sem nome", receita: p.receita_mensal || 0, projeto: p.projeto }))
      .sort((a, b) => b.receita - a.receita)
      .slice(0, 10);
  }, [projetosAtivos]);

  // ── Receita por projeto SEO
  const receitaPorProjeto = useMemo(() => {
    return projetos
      .filter(p => p.receita_mensal > 0)
      .map(p => ({ name: p.projeto?.slice(0, 20), receita: p.receita_mensal || 0, cliente: p.cliente }))
      .sort((a, b) => b.receita - a.receita)
      .slice(0, 8);
  }, [projetos]);

  // ── Receita por estágio do funil
  const receitaPorEstagio = useMemo(() => {
    const stages = ["lead", "contato", "avaliacao_marcada", "compareceu", "proposta_enviada", "fechado"];
    return stages.map(s => ({
      name: funnelStageLabels[s],
      receita: funnelLeads.filter(l => l.status === s).reduce((acc, l) => acc + (l.ticket_estimado || 0), 0),
      count: funnelLeads.filter(l => l.status === s).length,
      fill: funnelStageColors[s],
    }));
  }, [funnelLeads]);

  // ── Tendência mensal (últimos N meses) — combinando transações financeiras + MRR SEO fixo
  const tendenciaMensal = useMemo(() => {
    const result = [];
    for (let i = meses - 1; i >= 0; i--) {
      const refDate = subMonths(new Date(), i);
      const label = format(refDate, "MMM/yy", { locale: ptBR });
      const start = startOfMonth(refDate);
      const end = endOfMonth(refDate);

      const recTransacoes = transactions
        .filter(t => t.type === "receita" && t.date && isWithinInterval(parseISO(t.date), { start, end }))
        .reduce((s, t) => s + (t.amount || 0), 0);

      // Para meses passados, simula MRR SEO dos projetos ativos como receita recorrente
      result.push({
        mes: label,
        receita_seo: mrrSEO,
        receita_clinica: recTransacoes,
        receita_funil: i === 0 ? receitaFunil : 0, // funil acumulado no mês atual
        total: mrrSEO + recTransacoes,
      });
    }
    return result;
  }, [meses, mrrSEO, receitaFunil, transactions]);

  // ── Growth Stages real vs. meta
  const growthData = useMemo(() => {
    return growthStages.map(g => ({
      name: g.stage_name?.replace("Stage", "Stg")?.slice(0, 20),
      real: g.receita_atual || 0,
      meta: g.receita_meta || 0,
      status: g.status,
    }));
  }, [growthStages]);

  // ── Distribuição da receita (pie)
  const pieData = [
    { name: "MRR SEO", value: mrrSEO },
    { name: "Funil Fechado", value: receitaFunil },
  ].filter(d => d.value > 0);

  // ── Taxa de conversão do funil
  const totalLeads = funnelLeads.length;
  const taxaConversao = totalLeads > 0 ? Math.round((leadsFechados.length / totalLeads) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/20 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard Financeiro</h1>
                <p className="text-slate-500 text-sm">Receita consolidada · SEO + Funil Prime + Clínica</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Período:</span>
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">Últimos 3 meses</SelectItem>
                  <SelectItem value="6">Últimos 6 meses</SelectItem>
                  <SelectItem value="12">Últimos 12 meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <KPICard label="MRR — Projetos SEO" value={fmt(mrrSEO)} sub={`${projetosAtivos.length} projetos ativos`} icon={Globe} color="indigo" />
          <KPICard label="Receita Funil Fechada" value={fmt(receitaFunil)} sub={`${leadsFechados.length} leads convertidos`} icon={TrendingUp} color="green" />
          <KPICard label="Potencial em Aberto" value={fmt(receitaPotencial)} sub={`${funnelLeads.filter(l => !["perdido","fechado"].includes(l.status)).length} leads ativos`} icon={Target} color="purple" />
          <KPICard label="Taxa de Conversão" value={`${taxaConversao}%`} sub={`${totalLeads} leads totais`} icon={Users} color="orange" />
        </div>

        <Tabs defaultValue="tendencia">
          <TabsList className="bg-white border rounded-xl p-1 shadow-sm mb-5 flex flex-wrap h-auto gap-1">
            {[
              { value: "tendencia", label: "Tendência Mensal", icon: BarChart3 },
              { value: "clientes", label: "Por Cliente", icon: Users },
              { value: "funil", label: "Por Estágio", icon: TrendingUp },
              { value: "growth", label: "Real vs. Meta", icon: Target },
            ].map(t => {
              const Icon = t.icon;
              return (
                <TabsTrigger key={t.value} value={t.value}
                  className="flex items-center gap-1.5 text-xs py-2 px-3 data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg">
                  <Icon className="w-3.5 h-3.5" />{t.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* ── TENDÊNCIA MENSAL ── */}
          <TabsContent value="tendencia" className="space-y-5">
            <div className="grid lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold text-slate-800">Receita Mensal Consolidada</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={tendenciaMensal}>
                          <defs>
                            <linearGradient id="colorSEO" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorClinica" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                          <YAxis tickFormatter={fmtK} tick={{ fontSize: 11 }} width={60} />
                          <Tooltip formatter={(v, name) => [fmt(v), name === "receita_seo" ? "MRR SEO" : name === "receita_clinica" ? "Clínica" : "Funil"]} />
                          <Legend formatter={v => v === "receita_seo" ? "MRR SEO" : v === "receita_clinica" ? "Clínica" : "Funil"} />
                          <Area type="monotone" dataKey="receita_seo" stroke="#6366f1" fill="url(#colorSEO)" strokeWidth={2} />
                          <Area type="monotone" dataKey="receita_clinica" stroke="#10b981" fill="url(#colorClinica)" strokeWidth={2} />
                          <Bar dataKey="receita_funil" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                {/* Distribuição */}
                <Card className="border-0 shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold text-slate-800">Distribuição de Receita</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {pieData.length > 0 ? (
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={4}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              labelLine={false}
                            >
                              {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                            </Pie>
                            <Tooltip formatter={v => fmt(v)} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-40 flex items-center justify-center text-slate-400 text-sm">Sem dados ainda</div>
                    )}
                  </CardContent>
                </Card>

                {/* Resumo */}
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4 space-y-3">
                    {[
                      { label: "MRR SEO", value: fmt(mrrSEO), color: "bg-indigo-500" },
                      { label: "Receita Funil", value: fmt(receitaFunil), color: "bg-green-500" },
                      { label: "Projeção Anual SEO", value: fmt(totalSEOAnual), color: "bg-purple-500" },
                    ].map((r, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2.5 h-2.5 rounded-full", r.color)} />
                          <span className="text-sm text-slate-600">{r.label}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">{r.value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ── POR CLIENTE ── */}
          <TabsContent value="clientes" className="space-y-5">
            <div className="grid lg:grid-cols-2 gap-5">
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold text-slate-800">Receita MRR por Cliente (SEO)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={receitaPorCliente} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                        <XAxis type="number" tickFormatter={fmtK} tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="cliente" width={100} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={v => fmt(v)} />
                        <Bar dataKey="receita" fill="#6366f1" radius={[0, 4, 4, 0]}>
                          {receitaPorCliente.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold text-slate-800">Receita por Projeto SEO</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={receitaPorProjeto}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={45} />
                        <YAxis tickFormatter={fmtK} tick={{ fontSize: 11 }} width={55} />
                        <Tooltip formatter={v => fmt(v)} labelFormatter={(l, p) => p?.[0]?.payload?.cliente || l} />
                        <Bar dataKey="receita" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                          {receitaPorProjeto.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabela de clientes */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-slate-800">Detalhamento por Cliente</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        {["Cliente", "Projeto", "Plano", "MRR", "Status"].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {projetos.filter(p => p.receita_mensal > 0).sort((a, b) => (b.receita_mensal || 0) - (a.receita_mensal || 0)).map(p => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-900">{p.cliente}</td>
                          <td className="px-4 py-3 text-slate-600">{p.projeto}</td>
                          <td className="px-4 py-3">
                            <Badge className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">{p.plano_contratado || "—"}</Badge>
                          </td>
                          <td className="px-4 py-3 font-bold text-green-600">{fmt(p.receita_mensal)}</td>
                          <td className="px-4 py-3">
                            <Badge className={cn("text-xs", p.status_operacional === "em_andamento" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600")}>
                              {p.status_operacional === "em_andamento" ? "Ativo" : p.status_operacional || "—"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                      {projetos.filter(p => p.receita_mensal > 0).length === 0 && (
                        <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">Nenhum projeto com receita cadastrada</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── POR ESTÁGIO DO FUNIL ── */}
          <TabsContent value="funil" className="space-y-5">
            <div className="grid lg:grid-cols-2 gap-5">
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold text-slate-800">Receita Potencial por Estágio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={receitaPorEstagio}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tickFormatter={fmtK} tick={{ fontSize: 11 }} width={55} />
                        <Tooltip formatter={(v, n) => [n === "receita" ? fmt(v) : v, n === "receita" ? "Receita" : "Leads"]} />
                        <Bar dataKey="receita" radius={[4, 4, 0, 0]}>
                          {receitaPorEstagio.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold text-slate-800">Volume de Leads por Estágio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={receitaPorEstagio} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                        <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="count" name="Leads" radius={[0, 4, 4, 0]}>
                          {receitaPorEstagio.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabela por estágio */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-slate-800">Detalhamento por Estágio</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      {["Estágio", "Leads", "Receita Estimada", "Ticket Médio"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {receitaPorEstagio.map(s => (
                      <tr key={s.name} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.fill }} />
                            <span className="font-medium text-slate-800">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{s.count}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{fmt(s.receita)}</td>
                        <td className="px-4 py-3 text-slate-600">{s.count > 0 ? fmt(Math.round(s.receita / s.count)) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── REAL VS. META (GROWTH STAGES) ── */}
          <TabsContent value="growth" className="space-y-5">
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-slate-800">Growth Stages — Receita Real vs. Meta</CardTitle>
              </CardHeader>
              <CardContent>
                {growthData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={growthData} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={fmtK} tick={{ fontSize: 11 }} width={65} />
                        <Tooltip formatter={v => fmt(v)} />
                        <Legend />
                        <Bar dataKey="real" name="Receita Real" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="meta" name="Meta" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center text-slate-400">
                    <div className="text-center">
                      <Target className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p>Inicialize os Growth Stages na aba PRIME OS para ver este gráfico</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cards de progresso por stage */}
            <div className="grid lg:grid-cols-2 gap-4">
              {growthStages.map((stage, i) => {
                const pct = stage.receita_meta > 0 ? Math.min(100, Math.round(((stage.receita_atual || 0) / stage.receita_meta) * 100)) : 0;
                const isActive = stage.status === "active";
                return (
                  <motion.div key={stage.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className={cn("border-0 shadow-md", isActive && "ring-2 ring-indigo-400")}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm">{stage.stage_name}</h3>
                            <p className="text-xs text-slate-500">{stage.revenue_range}</p>
                          </div>
                          <Badge className={cn("text-xs border", isActive ? "bg-green-100 text-green-700 border-green-300" : "bg-slate-100 text-slate-500 border-slate-200")}>
                            {isActive ? "Ativo" : stage.status === "completed" ? "Concluído" : "Não iniciado"}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>Progresso</span>
                          <span className="font-bold text-slate-700">{pct}%</span>
                        </div>
                        <div className="bg-slate-100 rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className={cn("h-full rounded-full", pct >= 100 ? "bg-green-500" : pct >= 60 ? "bg-indigo-500" : "bg-orange-400")}
                          />
                        </div>
                        <div className="flex justify-between text-xs mt-2">
                          <span className="text-indigo-600 font-semibold">{fmt(stage.receita_atual || 0)}</span>
                          <span className="text-slate-400">Meta: {fmt(stage.receita_meta || 0)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
              {growthStages.length === 0 && (
                <div className="col-span-2 text-center py-12 text-slate-400">
                  <Target className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>Nenhum Growth Stage configurado</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
