// @ts-nocheck
import { useState, useMemo } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign, TrendingUp, TrendingDown, Plus, Upload,
  Search, PieChart, BarChart3, Wallet,
  Target, Building2, FileSpreadsheet, ArrowDownCircle, ArrowUpCircle, Scale, Tag, CalendarRange, Zap, Clock, Receipt
} from "lucide-react";
import { toast } from "sonner";
import { subDays, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { loadCategories } from "../components/financeiro/CategoryManager";
import TransactionForm from "../components/financeiro/TransactionForm";
import TransactionList from "../components/financeiro/TransactionList";
import CashFlowChart from "../components/financeiro/CashFlowChart";
import ImportStatement from "../components/financeiro/ImportStatement";
import ReportBuilder from "../components/financeiro/ReportBuilder.jsx";
import BudgetPlanner from "../components/financeiro/BudgetPlanner";
import BankConnect from "../components/financeiro/BankConnect";
import ContasAPagar from "../components/financeiro/ContasAPagar";
import ContasAReceber from "../components/financeiro/ContasAReceber";
import ContasAVencer from "../components/financeiro/ContasAVencer";
import DigitalInvoiceModal from "@/components/financeiro/DigitalInvoiceModal";
import ConciliacaoBancaria from "../components/financeiro/ConciliacaoBancaria";
import PaymentLink from "../components/financeiro/PaymentLink";
import ProjectedCashFlow from "../components/financeiro/ProjectedCashFlow";
import CategoryManager from "../components/financeiro/CategoryManager";
import FinancialAutomationsPanel from "../components/financeiro/FinancialAutomationsPanel";

const COLORS = ["#10b981", "#6366f1", "#f59e0b", "#f43f5e", "#3b82f6", "#8b5cf6", "#ec4899"];

const PERIOD_OPTIONS = [
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "month", label: "Este mês" },
  { value: "all", label: "Todos" },
];

export default function Financeiro() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showPaymentLink, setShowPaymentLink] = useState(false);
  const [showDigitalInvoice, setShowDigitalInvoice] = useState(false);
  const [editing, setEditing] = useState(null);
  const [defaultFormType, setDefaultFormType] = useState(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("month");
  const [filterCategory, setFilterCategory] = useState("all");

  const { data: transactions = [] } = useQuery({
    queryKey: ["financialTransactions"],
    queryFn: () => primeos.entities.FinancialTransaction.list("-date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => primeos.entities.FinancialTransaction.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["financialTransactions"] }); setShowForm(false); setEditing(null); toast.success("Transação salva!"); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.FinancialTransaction.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["financialTransactions"] }); setShowForm(false); setEditing(null); toast.success("Transação atualizada!"); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => primeos.entities.FinancialTransaction.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["financialTransactions"] }); toast.success("Removida!"); },
  });

  const handleSave = (data) => {
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  const openNewForm = (type) => {
    setEditing(null);
    setDefaultFormType(type);
    setShowForm(true);
  };

  // Period filter
  const periodFiltered = useMemo(() => {
    const now = new Date();
    return transactions.filter(t => {
      if (!t.date) return true;
      const d = parseISO(t.date);
      if (filterPeriod === "7d") return d >= subDays(now, 7);
      if (filterPeriod === "30d") return d >= subDays(now, 30);
      if (filterPeriod === "month") return d >= startOfMonth(now) && d <= endOfMonth(now);
      return true;
    });
  }, [transactions, filterPeriod]);

  const filtered = useMemo(() => periodFiltered.filter(t => {
    const matchSearch = !search || t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.supplier?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || t.type === filterType;
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    const matchCat = filterCategory === "all" || t.category === filterCategory;
    return matchSearch && matchType && matchStatus && matchCat;
  }), [periodFiltered, search, filterType, filterStatus, filterCategory]);

  // KPIs
  const active = transactions.filter(t => t.status !== "cancelado");
  const totalReceitas = active.filter(t => t.type === "receita").reduce((s, t) => s + (t.amount || 0), 0);
  const totalDespesas = active.filter(t => t.type === "despesa").reduce((s, t) => s + (t.amount || 0), 0);
  const lucro = totalReceitas - totalDespesas;
  const pendentes = transactions.filter(t => t.status === "pendente").reduce((s, t) => s + (t.amount || 0), 0);
  const vencidos = transactions.filter(t => t.status === "vencido").reduce((s, t) => s + (t.amount || 0), 0);

  // Category breakdown (expenses) - using custom categories
  const customCategories = useMemo(() => loadCategories(), []);
  const catBreakdown = useMemo(() => {
    const map = {};
    periodFiltered.filter(t => t.type === "despesa" && t.status !== "cancelado").forEach(t => {
      map[t.category] = (map[t.category] || 0) + (t.amount || 0);
    });
    return Object.entries(map).map(([key, value]) => {
      const found = customCategories.despesa.find(c => c.value === key);
      return { name: found?.label || key.replace(/_/g, " "), value, color: found?.color || "#64748b" };
    });
  }, [periodFiltered, customCategories]);

  const kpis = [
    { label: "Receita Total", value: totalReceitas, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Despesa Total", value: totalDespesas, icon: TrendingDown, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Lucro Líquido", value: lucro, icon: DollarSign, color: lucro >= 0 ? "text-indigo-600" : "text-red-600", bg: "bg-indigo-50" },
    { label: "A Receber/Pagar", value: pendentes, icon: Wallet, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-emerald-600" />
              Financeiro
            </h1>
            <p className="text-slate-500 mt-1">Fluxo de caixa, receitas, despesas e relatórios</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowDigitalInvoice(true)}>
              <Receipt className="w-4 h-4 mr-2" />
              Nota Digital
            </Button>
            <Button variant="outline" onClick={() => setShowImport(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => { setEditing(null); setShowForm(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Transação
            </Button>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className={`w-10 h-10 rounded-xl ${k.bg} flex items-center justify-center mb-3`}>
                    <k.icon className={`w-5 h-5 ${k.color}`} />
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{k.label}</p>
                  <p className={`text-2xl font-bold ${k.color}`}>
                    R$ {k.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {vencidos > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <TrendingDown className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-800 font-medium">
              Atenção: R$ {vencidos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} em transações vencidas!
            </span>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1 p-1 w-full max-w-4xl">
            <TabsTrigger value="dashboard" className="flex items-center gap-1.5 text-xs">
              <BarChart3 className="w-3.5 h-3.5" />Dashboard
            </TabsTrigger>
            <TabsTrigger value="fluxo" className="flex items-center gap-1.5 text-xs">
              <CalendarRange className="w-3.5 h-3.5" />Fluxo Projetado
            </TabsTrigger>
            <TabsTrigger value="transacoes" className="flex items-center gap-1.5 text-xs">
              <DollarSign className="w-3.5 h-3.5" />Transações
            </TabsTrigger>
            <TabsTrigger value="a-receber" className="flex items-center gap-1.5 text-xs">
              <ArrowDownCircle className="w-3.5 h-3.5" />A Receber
            </TabsTrigger>
            <TabsTrigger value="a-pagar" className="flex items-center gap-1.5 text-xs">
              <ArrowUpCircle className="w-3.5 h-3.5" />A Pagar
            </TabsTrigger>
            <TabsTrigger value="a-vencer" className="flex items-center gap-1.5 text-xs">
              <Clock className="w-3.5 h-3.5" />A Vencer
            </TabsTrigger>
            <TabsTrigger value="conciliacao" className="flex items-center gap-1.5 text-xs">
              <Scale className="w-3.5 h-3.5" />Conciliação
            </TabsTrigger>
            <TabsTrigger value="categorias" className="flex items-center gap-1.5 text-xs">
              <PieChart className="w-3.5 h-3.5" />Categorias
            </TabsTrigger>
            <TabsTrigger value="config-categorias" className="flex items-center gap-1.5 text-xs">
              <Tag className="w-3.5 h-3.5" />Config. Categorias
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="flex items-center gap-1.5 text-xs">
              <FileSpreadsheet className="w-3.5 h-3.5" />Relatórios
            </TabsTrigger>
            <TabsTrigger value="orcamento" className="flex items-center gap-1.5 text-xs">
              <Target className="w-3.5 h-3.5" />Orçamento
            </TabsTrigger>
            <TabsTrigger value="automacoes" className="flex items-center gap-1.5 text-xs">
              <Zap className="w-3.5 h-3.5" />Automações
            </TabsTrigger>
            <TabsTrigger value="banco" className="flex items-center gap-1.5 text-xs">
              <Building2 className="w-3.5 h-3.5" />Banco
            </TabsTrigger>
          </TabsList>

          {/* FLUXO PROJETADO */}
          <TabsContent value="fluxo">
            <ProjectedCashFlow transactions={transactions} />
          </TabsContent>

          {/* DASHBOARD */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="flex items-center gap-3">
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PERIOD_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <CashFlowChart transactions={transactions} />
          </TabsContent>

          {/* TRANSAÇÕES */}
          <TabsContent value="transacoes" className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input className="pl-9" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PERIOD_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="receita">Receitas</SelectItem>
                  <SelectItem value="despesa">Despesas</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="vencido">Vencido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{filtered.length} transações</p>
              <div className="flex gap-2">
                <Badge className="bg-emerald-100 text-emerald-700">
                  + R$ {filtered.filter(t => t.type === "receita").reduce((s, t) => s + (t.amount || 0), 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </Badge>
                <Badge className="bg-rose-100 text-rose-700">
                  - R$ {filtered.filter(t => t.type === "despesa").reduce((s, t) => s + (t.amount || 0), 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </Badge>
              </div>
            </div>
            <TransactionList
              transactions={filtered}
              onEdit={tx => { setEditing(tx); setShowForm(true); }}
              onDelete={id => deleteMutation.mutate(id)}
            />
          </TabsContent>

          {/* A RECEBER */}
          <TabsContent value="a-receber">
            <ContasAReceber
              onAddNew={() => openNewForm("receita")}
              onGeneratePaymentLink={() => setShowPaymentLink(true)}
            />
          </TabsContent>

          {/* A PAGAR */}
          <TabsContent value="a-pagar">
            <ContasAPagar onAddNew={() => openNewForm("despesa")} />
          </TabsContent>

          {/* A VENCER */}
          <TabsContent value="a-vencer">
            <ContasAVencer />
          </TabsContent>

          {/* CONCILIAÇÃO */}
          <TabsContent value="conciliacao">
            <ConciliacaoBancaria />
          </TabsContent>

          {/* CONFIG CATEGORIAS */}
          <TabsContent value="config-categorias">
            <CategoryManager />
          </TabsContent>

          {/* RELATÓRIOS */}
          <TabsContent value="relatorios">
            <ReportBuilder transactions={transactions} />
          </TabsContent>

          {/* ORÇAMENTO */}
          <TabsContent value="orcamento">
            <BudgetPlanner transactions={transactions} />
          </TabsContent>

          {/* AUTOMAÇÕES */}
          <TabsContent value="automacoes">
            <FinancialAutomationsPanel transactions={transactions} />
          </TabsContent>

          {/* BANCO */}
          <TabsContent value="banco">
            <BankConnect onImported={() => queryClient.invalidateQueries({ queryKey: ["financialTransactions"] })} />
          </TabsContent>

          {/* CATEGORIAS */}
          <TabsContent value="categorias" className="space-y-6">
            <div className="flex items-center gap-3">
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PERIOD_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Distribuição de Despesas</CardTitle>
                </CardHeader>
                <CardContent>
                  {catBreakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <RechartsPie>
                        <Pie data={catBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {catBreakdown.map((entry, i) => <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={v => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
                      </RechartsPie>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-60 flex items-center justify-center text-slate-400 text-sm">Sem despesas no período</div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Detalhamento por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {catBreakdown.sort((a, b) => b.value - a.value).map((cat, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color || COLORS[i % COLORS.length] }} />
                        <span className="flex-1 text-sm text-slate-700 capitalize">{cat.name.replace("_", " ")}</span>
                        <span className="font-semibold text-slate-900 text-sm">
                          R$ {cat.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs text-slate-400">
                          {totalDespesas > 0 ? `${((cat.value / totalDespesas) * 100).toFixed(0)}%` : "0%"}
                        </span>
                      </div>
                    ))}
                    {catBreakdown.length === 0 && <p className="text-sm text-slate-400 text-center py-8">Sem dados no período</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <TransactionForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null); setDefaultFormType(null); }}
        onSave={handleSave}
        transaction={editing}
        defaultType={defaultFormType}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <PaymentLink
        open={showPaymentLink}
        onClose={() => setShowPaymentLink(false)}
        onCreated={() => queryClient.invalidateQueries({ queryKey: ["financialTransactions"] })}
      />

      <ImportStatement
        open={showImport}
        onClose={() => setShowImport(false)}
        onImported={() => queryClient.invalidateQueries({ queryKey: ["financialTransactions"] })}
      />

      <DigitalInvoiceModal
        open={showDigitalInvoice}
        onClose={() => setShowDigitalInvoice(false)}
      />
    </div>
  );
}
