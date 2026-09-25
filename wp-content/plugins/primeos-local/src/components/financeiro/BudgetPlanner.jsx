// @ts-nocheck
import { useState, useMemo } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Target, TrendingUp, TrendingDown, Pencil, Trash2,
  AlertTriangle, CheckCircle2, Trophy, Flame, PiggyBank,
  CreditCard, BarChart3, Calendar
} from "lucide-react";
import { toast } from "sonner";
import { parseISO, getYear, getMonth, format, differenceInDays } from "date-fns";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

const fmtBRL = (v) => `R$ ${(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

const CATEGORIES_RECEITA = [
  { value: "consulta", label: "Consulta" },
  { value: "procedimento", label: "Procedimento" },
  { value: "outros_receita", label: "Outros" },
];
const CATEGORIES_DESPESA = [
  { value: "material", label: "Material" },
  { value: "equipamento", label: "Equipamento" },
  { value: "aluguel", label: "Aluguel" },
  { value: "salario", label: "Salários" },
  { value: "marketing", label: "Marketing" },
  { value: "impostos", label: "Impostos" },
  { value: "outros_despesa", label: "Outros" },
];

const GOAL_TYPES = [
  { value: "economia", label: "Economia", icon: PiggyBank, color: "#10b981" },
  { value: "investimento", label: "Investimento", icon: TrendingUp, color: "#6366f1" },
  { value: "receita_minima", label: "Receita Mínima", icon: BarChart3, color: "#3b82f6" },
  { value: "reducao_despesa", label: "Redução de Despesa", icon: TrendingDown, color: "#f59e0b" },
  { value: "reserva_emergencia", label: "Reserva de Emergência", icon: Flame, color: "#ef4444" },
  { value: "pagamento_divida", label: "Pagamento de Dívida", icon: CreditCard, color: "#8b5cf6" },
  { value: "outro", label: "Outro", icon: Target, color: "#64748b" },
];

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth() + 1;
const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

const emptyBudget = {
  name: "", period: "mensal", year: CURRENT_YEAR, month: CURRENT_MONTH,
  category: "material", type: "despesa", budgeted_amount: "", alert_threshold: 80, notes: ""
};

const emptyGoal = {
  name: "", type: "economia", target_amount: "", current_amount: 0,
  deadline: "", start_date: new Date().toISOString().split("T")[0],
  monthly_contribution: "", description: "", color: "#6366f1",
  auto_track_category: "", auto_track_type: ""
};

function DeviationBadge({ pct, type }) {
  if (type === "receita") {
    if (pct >= 100) return <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" />Meta atingida</span>;
    if (pct >= 80) return <span className="text-xs font-semibold text-amber-600">Quase lá</span>;
    return <span className="text-xs text-slate-400">{pct.toFixed(0)}% da meta</span>;
  }
  if (pct > 100) return <span className="text-xs font-semibold text-red-600 flex items-center gap-0.5"><AlertTriangle className="w-3 h-3" />Excedido {(pct-100).toFixed(0)}%</span>;
  if (pct >= 80) return <span className="text-xs font-semibold text-amber-600 flex items-center gap-0.5"><AlertTriangle className="w-3 h-3" />{pct.toFixed(0)}% utilizado</span>;
  return <span className="text-xs text-slate-400">{pct.toFixed(0)}% utilizado</span>;
}

export default function BudgetPlanner({ transactions }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("orcamentos");
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [budgetForm, setBudgetForm] = useState(emptyBudget);
  const [goalForm, setGoalForm] = useState(emptyGoal);
  const [viewYear, setViewYear] = useState(CURRENT_YEAR);
  const [viewMonth, setViewMonth] = useState(CURRENT_MONTH);

  const { data: budgets = [] } = useQuery({
    queryKey: ["budgets"],
    queryFn: () => primeos.entities.Budget.list("-created_date"),
  });

  const { data: goals = [] } = useQuery({
    queryKey: ["financialGoals"],
    queryFn: () => primeos.entities.FinancialGoal.list("-created_date"),
  });

  // --- Budget mutations ---
  const createBudget = useMutation({
    mutationFn: (d) => primeos.entities.Budget.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["budgets"] }); setShowBudgetForm(false); toast.success("Orçamento criado!"); }
  });
  const updateBudget = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.Budget.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["budgets"] }); setShowBudgetForm(false); toast.success("Orçamento atualizado!"); }
  });
  const deleteBudget = useMutation({
    mutationFn: (id) => primeos.entities.Budget.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["budgets"] }); toast.success("Removido!"); }
  });

  // --- Goal mutations ---
  const createGoal = useMutation({
    mutationFn: (d) => primeos.entities.FinancialGoal.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["financialGoals"] }); setShowGoalForm(false); toast.success("Meta criada!"); }
  });
  const updateGoal = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.FinancialGoal.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["financialGoals"] }); setShowGoalForm(false); toast.success("Meta atualizada!"); }
  });
  const deleteGoal = useMutation({
    mutationFn: (id) => primeos.entities.FinancialGoal.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["financialGoals"] }); toast.success("Removida!"); }
  });

  // --- Computed ---
  const periodTransactions = useMemo(() =>
    transactions.filter(t => {
      if (!t.date || t.status === "cancelado") return false;
      const d = parseISO(t.date);
      return getYear(d) === viewYear && getMonth(d) + 1 === viewMonth;
    }), [transactions, viewYear, viewMonth]);

  const actuals = useMemo(() => {
    const map = {};
    periodTransactions.forEach(t => {
      const key = `${t.type}__${t.category}`;
      map[key] = (map[key] || 0) + (t.amount || 0);
    });
    return map;
  }, [periodTransactions]);

  const monthBudgets = useMemo(() =>
    budgets.filter(b => b.period === "mensal" && b.year === viewYear && b.month === viewMonth),
    [budgets, viewYear, viewMonth]);

  // Auto-update goal current_amount from transactions
  const enrichedGoals = useMemo(() => goals.map(g => {
    if (!g.auto_track_category || !g.auto_track_type) return g;
    const total = transactions
      .filter(t => t.type === g.auto_track_type && t.category === g.auto_track_category && t.status === "pago")
      .reduce((s, t) => s + (t.amount || 0), 0);
    return { ...g, current_amount: total };
  }), [goals, transactions]);

  const totalBudgetedRec = monthBudgets.filter(b => b.type === "receita").reduce((s, b) => s + (b.budgeted_amount || 0), 0);
  const totalBudgetedDesp = monthBudgets.filter(b => b.type === "despesa").reduce((s, b) => s + (b.budgeted_amount || 0), 0);
  const totalActualRec = periodTransactions.filter(t => t.type === "receita").reduce((s, t) => s + (t.amount || 0), 0);
  const totalActualDesp = periodTransactions.filter(t => t.type === "despesa").reduce((s, t) => s + (t.amount || 0), 0);

  const overBudgetAlerts = monthBudgets.filter(b => {
    const actual = actuals[`${b.type}__${b.category}`] || 0;
    const pct = b.budgeted_amount > 0 ? (actual / b.budgeted_amount) * 100 : 0;
    return pct >= (b.alert_threshold || 80);
  });

  // --- Handlers ---
  const openNewBudget = () => { setBudgetForm(emptyBudget); setEditingBudget(null); setShowBudgetForm(true); };
  const openEditBudget = (b) => { setBudgetForm({ ...b, budgeted_amount: String(b.budgeted_amount) }); setEditingBudget(b); setShowBudgetForm(true); };
  const handleSaveBudget = () => {
    const data = { ...budgetForm, budgeted_amount: parseFloat(budgetForm.budgeted_amount) || 0, alert_threshold: parseFloat(budgetForm.alert_threshold) || 80 };
    if (editingBudget) updateBudget.mutate({ id: editingBudget.id, data });
    else createBudget.mutate(data);
  };

  const openNewGoal = () => { setGoalForm(emptyGoal); setEditingGoal(null); setShowGoalForm(true); };
  const openEditGoal = (g) => { setGoalForm({ ...g, target_amount: String(g.target_amount), current_amount: String(g.current_amount || 0), monthly_contribution: String(g.monthly_contribution || "") }); setEditingGoal(g); setShowGoalForm(true); };
  const handleSaveGoal = () => {
    const data = {
      ...goalForm,
      target_amount: parseFloat(goalForm.target_amount) || 0,
      current_amount: parseFloat(goalForm.current_amount) || 0,
      monthly_contribution: parseFloat(goalForm.monthly_contribution) || 0,
    };
    if (editingGoal) updateGoal.mutate({ id: editingGoal.id, data });
    else createGoal.mutate(data);
  };

  const updateGoalProgress = async (goal, newAmount) => {
    const isPaidOff = newAmount >= goal.target_amount;
    await primeos.entities.FinancialGoal.update(goal.id, {
      current_amount: newAmount,
      status: isPaidOff ? "concluida" : "em_andamento"
    });
    queryClient.invalidateQueries({ queryKey: ["financialGoals"] });
    toast.success("Progresso atualizado!");
  };

  return (
    <div className="space-y-5">
      {/* Alerts */}
      {overBudgetAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <p className="text-amber-800 font-semibold text-sm">{overBudgetAlerts.length} orçamento(s) próximos ou acima do limite</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {overBudgetAlerts.map(b => {
              const actual = actuals[`${b.type}__${b.category}`] || 0;
              const pct = ((actual / b.budgeted_amount) * 100).toFixed(0);
              return (
                <Badge key={b.id} className="bg-amber-100 text-amber-800 border-amber-300">
                  {b.name}: {pct}%
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Receita Orçada", value: totalBudgetedRec, actual: totalActualRec, color: "text-emerald-600", bg: "bg-emerald-50", icon: TrendingUp },
          { label: "Despesa Orçada", value: totalBudgetedDesp, actual: totalActualDesp, color: "text-rose-600", bg: "bg-rose-50", icon: TrendingDown },
          { label: "Metas Ativas", value: enrichedGoals.filter(g => g.status === "em_andamento").length, isCount: true, color: "text-indigo-600", bg: "bg-indigo-50", icon: Target },
          { label: "Metas Concluídas", value: enrichedGoals.filter(g => g.status === "concluida").length, isCount: true, color: "text-emerald-600", bg: "bg-emerald-100", icon: Trophy },
        ].map((k, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className={`w-9 h-9 rounded-xl ${k.bg} flex items-center justify-center mb-2`}>
                <k.icon className={`w-4 h-4 ${k.color}`} />
              </div>
              <p className="text-xs text-slate-500">{k.label}</p>
              {k.isCount ? (
                <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
              ) : (
                <>
                  <p className={`text-lg font-bold ${k.color}`}>{fmtBRL(k.value)}</p>
                  {k.actual !== undefined && (
                    <p className="text-xs text-slate-400 mt-0.5">Realizado: {fmtBRL(k.actual)}</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full max-w-sm">
          <TabsTrigger value="orcamentos" className="flex-1 gap-1.5 text-xs">
            <BarChart3 className="w-3.5 h-3.5" />Orçamentos
          </TabsTrigger>
          <TabsTrigger value="metas" className="flex-1 gap-1.5 text-xs">
            <Target className="w-3.5 h-3.5" />Metas
          </TabsTrigger>
        </TabsList>

        {/* === ORÇAMENTOS === */}
        <TabsContent value="orcamentos" className="space-y-5 mt-4">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div className="flex items-center gap-2">
              <Select value={String(viewMonth)} onValueChange={v => setViewMonth(parseInt(v))}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => <SelectItem key={i+1} value={String(i+1)}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={String(viewYear)} onValueChange={v => setViewYear(parseInt(v))}>
                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[2024,2025,2026,2027].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={openNewBudget} className="bg-indigo-600 hover:bg-indigo-700 gap-1.5">
              <Plus className="w-4 h-4" />Novo Orçamento
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            {["receita", "despesa"].map(tipo => {
              const budgetsOfType = monthBudgets.filter(b => b.type === tipo);
              const Icon = tipo === "receita" ? TrendingUp : TrendingDown;
              return (
                <Card key={tipo} className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className={`text-sm flex items-center gap-2 ${tipo === "receita" ? "text-emerald-700" : "text-rose-700"}`}>
                      <Icon className="w-4 h-4" />
                      {tipo === "receita" ? "Receitas" : "Despesas"} — Orçado vs. Realizado
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {budgetsOfType.length === 0 && (
                      <div className="text-center py-6 text-slate-400 text-sm">
                        Nenhum orçamento definido.{" "}
                        <button onClick={openNewBudget} className="text-indigo-600 underline">Adicionar</button>
                      </div>
                    )}
                    {budgetsOfType.map(b => {
                      const actual = actuals[`${b.type}__${b.category}`] || 0;
                      const pct = b.budgeted_amount > 0 ? (actual / b.budgeted_amount) * 100 : 0;
                      const threshold = b.alert_threshold || 80;
                      const isOver = actual > b.budgeted_amount && b.budgeted_amount > 0;
                      const isWarning = pct >= threshold && !isOver;
                      const barColor = isOver
                        ? "[&>div]:bg-red-500"
                        : isWarning
                          ? "[&>div]:bg-amber-500"
                          : tipo === "receita" ? "[&>div]:bg-emerald-500" : "[&>div]:bg-indigo-500";

                      return (
                        <div key={b.id} className={cn("p-3 rounded-lg border", isOver ? "bg-red-50 border-red-200" : isWarning ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-100")}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {(isOver || isWarning) && <AlertTriangle className={`w-3.5 h-3.5 ${isOver ? "text-red-500" : "text-amber-500"}`} />}
                              <span className="font-medium text-slate-800 text-sm">{b.name}</span>
                              <span className="text-xs text-slate-400 capitalize">({b.category.replace(/_/g, " ")})</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => openEditBudget(b)} className="text-slate-400 hover:text-slate-600 p-1">
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button onClick={() => deleteBudget.mutate(b.id)} className="text-slate-400 hover:text-red-500 p-1">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <Progress value={Math.min(pct, 100)} className={cn("h-2.5 mb-1.5", barColor)} />
                          <div className="flex justify-between items-center">
                            <DeviationBadge pct={pct} type={tipo} />
                            <span className="text-xs text-slate-500 font-medium">
                              {fmtBRL(actual)} <span className="text-slate-400">/ {fmtBRL(b.budgeted_amount)}</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* === METAS === */}
        <TabsContent value="metas" className="space-y-5 mt-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-500">{enrichedGoals.length} meta(s) cadastrada(s)</p>
            <Button onClick={openNewGoal} className="bg-indigo-600 hover:bg-indigo-700 gap-1.5">
              <Plus className="w-4 h-4" />Nova Meta
            </Button>
          </div>

          {enrichedGoals.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-base font-medium">Nenhuma meta ainda</p>
              <p className="text-sm mt-1">Crie metas de economia, investimento ou redução de despesas</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {enrichedGoals.map(g => {
              const goalType = GOAL_TYPES.find(t => t.value === g.type);
              const GIcon = goalType?.icon || Target;
              const color = goalType?.color || "#6366f1";
              const pct = g.target_amount > 0 ? Math.min((g.current_amount / g.target_amount) * 100, 100) : 0;
              const daysLeft = g.deadline ? differenceInDays(parseISO(g.deadline), new Date()) : null;
              const isExpired = daysLeft !== null && daysLeft < 0 && g.status !== "concluida";
              const monthsLeft = daysLeft !== null ? Math.ceil(daysLeft / 30) : null;
              const remaining = (g.target_amount || 0) - (g.current_amount || 0);
              const suggestedMonthly = monthsLeft > 0 ? remaining / monthsLeft : null;

              return (
                <Card key={g.id} className={cn("border shadow-sm", g.status === "concluida" ? "border-emerald-200 bg-emerald-50/30" : isExpired ? "border-red-200 bg-red-50/20" : "border-slate-100")}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + "20" }}>
                          <GIcon className="w-5 h-5" style={{ color }} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{g.name}</p>
                          <p className="text-xs text-slate-400">{goalType?.label}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {g.status === "concluida" && <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">✓ Concluída</Badge>}
                        {isExpired && <Badge className="bg-red-100 text-red-700 border-0 text-xs">Expirada</Badge>}
                        <button onClick={() => openEditGoal(g)} className="text-slate-400 hover:text-slate-600 p-1"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteGoal.mutate(g.id)} className="text-slate-400 hover:text-red-500 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>

                    {/* Radial progress */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" startAngle={90} endAngle={-270} data={[{ value: pct }]}>
                            <RadialBar dataKey="value" fill={color} background={{ fill: "#f1f5f9" }} cornerRadius={10} />
                          </RadialBarChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-bold" style={{ color }}>{pct.toFixed(0)}%</span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Acumulado</span>
                          <span className="font-semibold text-slate-700">{fmtBRL(g.current_amount)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Meta</span>
                          <span className="font-semibold text-slate-700">{fmtBRL(g.target_amount)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Faltam</span>
                          <span className="font-semibold" style={{ color }}>{fmtBRL(Math.max(0, remaining))}</span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    {g.deadline && (
                      <div className={cn("flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg mb-3",
                        isExpired ? "bg-red-100 text-red-700" : daysLeft <= 30 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500")}>
                        <Calendar className="w-3.5 h-3.5" />
                        {isExpired
                          ? `Prazo expirado há ${Math.abs(daysLeft)} dias`
                          : `${daysLeft} dias restantes (${format(parseISO(g.deadline), "dd/MM/yyyy")})`}
                      </div>
                    )}

                    {/* Sugestão de aporte mensal */}
                    {suggestedMonthly > 0 && g.status !== "concluida" && (
                      <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2 text-xs text-indigo-700 mb-3">
                        💡 Aporte mensal sugerido: <strong>{fmtBRL(suggestedMonthly)}</strong>
                      </div>
                    )}

                    {/* Update progress */}
                    {g.status !== "concluida" && !g.auto_track_category && (
                      <GoalProgressInput goal={g} onSave={updateGoalProgress} />
                    )}
                    {g.auto_track_category && (
                      <p className="text-xs text-slate-400 text-center">Rastreado automaticamente por transações</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Budget Form Dialog */}
      <Dialog open={showBudgetForm} onOpenChange={setShowBudgetForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              {editingBudget ? "Editar Orçamento" : "Novo Orçamento"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input value={budgetForm.name} onChange={e => setBudgetForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Salários Janeiro 2025" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo</Label>
                <Select value={budgetForm.type} onValueChange={v => setBudgetForm(f => ({ ...f, type: v, category: v === "receita" ? "consulta" : "material" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Categoria</Label>
                <Select value={budgetForm.category} onValueChange={v => setBudgetForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(budgetForm.type === "receita" ? CATEGORIES_RECEITA : CATEGORIES_DESPESA).map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Mês</Label>
                <Select value={String(budgetForm.month)} onValueChange={v => setBudgetForm(f => ({ ...f, month: parseInt(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, i) => <SelectItem key={i+1} value={String(i+1)}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ano</Label>
                <Select value={String(budgetForm.year)} onValueChange={v => setBudgetForm(f => ({ ...f, year: parseInt(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[2024,2025,2026,2027].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Valor Orçado (R$)</Label>
                <Input type="number" value={budgetForm.budgeted_amount} onChange={e => setBudgetForm(f => ({ ...f, budgeted_amount: e.target.value }))} placeholder="0,00" />
              </div>
              <div>
                <Label>Alerta em (%)</Label>
                <Input type="number" value={budgetForm.alert_threshold} onChange={e => setBudgetForm(f => ({ ...f, alert_threshold: e.target.value }))} placeholder="80" />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" onClick={() => setShowBudgetForm(false)} className="flex-1">Cancelar</Button>
              <Button onClick={handleSaveBudget} className="flex-1 bg-indigo-600 hover:bg-indigo-700" disabled={!budgetForm.name || !budgetForm.budgeted_amount}>
                {editingBudget ? "Salvar" : "Criar Orçamento"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Goal Form Dialog */}
      <Dialog open={showGoalForm} onOpenChange={setShowGoalForm}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              {editingGoal ? "Editar Meta" : "Nova Meta Financeira"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome da Meta</Label>
              <Input value={goalForm.name} onChange={e => setGoalForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Fundo de emergência 6 meses" />
            </div>
            <div>
              <Label>Tipo de Meta</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {GOAL_TYPES.map(t => (
                  <button key={t.value} onClick={() => setGoalForm(f => ({ ...f, type: t.value, color: t.color }))}
                    className={cn("flex items-center gap-2 p-2.5 rounded-lg border text-left text-xs font-medium transition-all",
                      goalForm.type === t.value ? "border-indigo-400 bg-indigo-50 text-indigo-700" : "border-slate-200 hover:border-slate-300 text-slate-600")}>
                    <t.icon className="w-4 h-4" style={{ color: t.color }} />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Valor Alvo (R$)</Label>
                <Input type="number" value={goalForm.target_amount} onChange={e => setGoalForm(f => ({ ...f, target_amount: e.target.value }))} placeholder="0,00" />
              </div>
              <div>
                <Label>Valor Atual (R$)</Label>
                <Input type="number" value={goalForm.current_amount} onChange={e => setGoalForm(f => ({ ...f, current_amount: e.target.value }))} placeholder="0,00" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Data de Início</Label>
                <Input type="date" value={goalForm.start_date} onChange={e => setGoalForm(f => ({ ...f, start_date: e.target.value }))} />
              </div>
              <div>
                <Label>Prazo</Label>
                <Input type="date" value={goalForm.deadline} onChange={e => setGoalForm(f => ({ ...f, deadline: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Aporte Mensal Planejado (R$)</Label>
              <Input type="number" value={goalForm.monthly_contribution} onChange={e => setGoalForm(f => ({ ...f, monthly_contribution: e.target.value }))} placeholder="Opcional" />
            </div>
            <div>
              <Label className="text-xs">Rastrear automaticamente por categoria (opcional)</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Select value={goalForm.auto_track_type || ""} onValueChange={v => setGoalForm(f => ({ ...f, auto_track_type: v }))}>
                  <SelectTrigger className="text-xs"><SelectValue placeholder="Tipo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Nenhum</SelectItem>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={goalForm.auto_track_category || ""} onValueChange={v => setGoalForm(f => ({ ...f, auto_track_category: v }))}>
                  <SelectTrigger className="text-xs"><SelectValue placeholder="Categoria" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Nenhuma</SelectItem>
                    {[...CATEGORIES_RECEITA, ...CATEGORIES_DESPESA].map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Descrição</Label>
              <Input value={goalForm.description} onChange={e => setGoalForm(f => ({ ...f, description: e.target.value }))} placeholder="Detalhes da meta..." />
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" onClick={() => setShowGoalForm(false)} className="flex-1">Cancelar</Button>
              <Button onClick={handleSaveGoal} className="flex-1 bg-indigo-600 hover:bg-indigo-700" disabled={!goalForm.name || !goalForm.target_amount}>
                {editingGoal ? "Salvar" : "Criar Meta"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GoalProgressInput({ goal, onSave }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(goal.current_amount || 0));

  if (!editing) {
    return (
      <button onClick={() => setEditing(true)}
        className="w-full text-xs text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 py-1.5 border border-dashed border-indigo-200 rounded-lg hover:bg-indigo-50 transition-all">
        <Plus className="w-3.5 h-3.5" />Atualizar progresso
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      <Input type="number" value={value} onChange={e => setValue(e.target.value)} className="h-8 text-xs" placeholder="Valor acumulado" />
      <Button size="sm" className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-xs" onClick={() => { onSave(goal, parseFloat(value) || 0); setEditing(false); }}>
        <CheckCircle2 className="w-3.5 h-3.5" />
      </Button>
      <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => setEditing(false)}>✕</Button>
    </div>
  );
}
