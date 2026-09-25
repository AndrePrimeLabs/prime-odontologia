// @ts-nocheck
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertTriangle, CheckCircle, Clock, TrendingUp, Search,
  Bell, Plus, RefreshCw, CreditCard, FileText
} from "lucide-react";
import { format, isPast, isToday, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import CobrancaModal from "./CobrancaModal";

const statusConfig = {
  pago: { label: "Recebido", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  pendente: { label: "Pendente", color: "bg-amber-100 text-amber-700 border-amber-200" },
  vencido: { label: "Vencido", color: "bg-red-100 text-red-700 border-red-200" },
  cancelado: { label: "Cancelado", color: "bg-slate-100 text-slate-500 border-slate-200" },
};

function DueDateBadge({ dueDate }) {
  if (!dueDate) return null;
  const date = parseISO(dueDate);
  const days = differenceInDays(date, new Date());
  if (isPast(date) && !isToday(date)) {
    return <span className="text-xs text-red-600 font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Venceu {Math.abs(days)}d atrás</span>;
  }
  if (isToday(date)) {
    return <span className="text-xs text-amber-600 font-medium flex items-center gap-1"><Bell className="w-3 h-3" />Vence hoje</span>;
  }
  if (days <= 7) {
    return <span className="text-xs text-amber-500 font-medium flex items-center gap-1"><Clock className="w-3 h-3" />Vence em {days}d</span>;
  }
  return <span className="text-xs text-slate-400">{format(date, "dd/MM/yyyy", { locale: ptBR })}</span>;
}

export default function ContasAReceber({ onAddNew, onGeneratePaymentLink }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [cobrancaTx, setCobrancaTx] = useState(null);

  const { data: transactions = [] } = useQuery({
    queryKey: ["financialTransactions"],
    queryFn: () => primeos.entities.FinancialTransaction.list("-due_date"),
  });

  const markReceivedMutation = useMutation({
    mutationFn: (id) => primeos.entities.FinancialTransaction.update(id, { status: "pago" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financialTransactions"] });
      toast.success("Marcado como recebido!");
    }
  });

  const receitas = useMemo(() => transactions.filter(t => t.type === "receita"), [transactions]);

  const filtered = useMemo(() => receitas.filter(t => {
    const matchSearch = !search || t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.patient_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    return matchSearch && matchStatus;
  }), [receitas, search, filterStatus]);

  const totalPendente = receitas.filter(t => t.status === "pendente").reduce((s, t) => s + (t.amount || 0), 0);
  const totalVencido = receitas.filter(t => t.status === "vencido").reduce((s, t) => s + (t.amount || 0), 0);
  const totalRecebido = receitas.filter(t => t.status === "pago").reduce((s, t) => s + (t.amount || 0), 0);
  const vencendoHoje = receitas.filter(t => t.due_date && isToday(parseISO(t.due_date)) && t.status === "pendente");

  return (
    <div className="space-y-5">
      {/* Alerts */}
      {totalVencido > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-semibold text-sm">Valores em Atraso!</p>
            <p className="text-red-600 text-xs mt-0.5">
              R$ {totalVencido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} em {receitas.filter(t => t.status === "vencido").length} recebimento(s) em atraso.
            </p>
          </div>
        </div>
      )}
      {vencendoHoje.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <Bell className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-800 font-semibold text-sm">{vencendoHoje.length} cobrança(s) vencem hoje</p>
            <p className="text-amber-600 text-xs mt-0.5">
              Total: R$ {vencendoHoje.reduce((s, t) => s + (t.amount || 0), 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: "A Receber", value: totalPendente, color: "text-amber-700", bg: "bg-amber-50 border-amber-100" },
          { label: "Em Atraso", value: totalVencido, color: "text-red-700", bg: "bg-red-50 border-red-100" },
          { label: "Recebido", value: totalRecebido, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
        ].map((k, i) => (
          <Card key={i} className={`border ${k.bg} shadow-none`}>
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">{k.label}</p>
              <p className={`text-lg font-bold ${k.color} mt-1`}>R$ {k.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters + Add */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input className="pl-9" placeholder="Buscar por paciente..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="vencido">Vencido</SelectItem>
            <SelectItem value="pago">Recebido</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50" onClick={onGeneratePaymentLink}>
          <CreditCard className="w-4 h-4" /> Link de Pagamento
        </Button>
        <Button className="bg-emerald-600 hover:bg-emerald-700 gap-1.5" onClick={() => onAddNew("receita")}>
          <Plus className="w-4 h-4" /> Nova Receita
        </Button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>Nenhum recebimento encontrado.</p>
          </div>
        )}
        {filtered.map(t => (
          <Card key={t.id} className="border border-slate-100 shadow-none hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-slate-900 text-sm truncate">{t.description}</p>
                    <Badge className={`text-xs border ${statusConfig[t.status]?.color || statusConfig.pendente.color}`}>
                      {statusConfig[t.status]?.label || t.status}
                    </Badge>
                    {t.payment_method && (
                      <Badge variant="outline" className="text-xs capitalize">{t.payment_method.replace(/_/g, " ")}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {t.patient_name && <span className="text-xs text-slate-500">👤 {t.patient_name}</span>}
                    <span className="text-xs text-slate-400 capitalize">{t.category?.replace(/_/g, " ")}</span>
                    <DueDateBadge dueDate={t.due_date} />
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <p className="font-bold text-emerald-600 text-sm">
                    R$ {(t.amount || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <Button size="sm" variant="outline"
                    onClick={() => setCobrancaTx(t)}
                    className="h-7 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50 gap-1">
                    <FileText className="w-3 h-3" />
                    {t.boleto_status === "gerado" ? "Ver Boleto" : t.status === "pago" ? "Detalhes" : "Cobrar"}
                  </Button>
                  {t.status !== "pago" && t.status !== "cancelado" && (
                    <Button size="sm" variant="outline" onClick={() => markReceivedMutation.mutate(t.id)}
                      disabled={markReceivedMutation.isPending}
                      className="h-7 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50 gap-1">
                      {markReceivedMutation.isPending ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                      Pago
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CobrancaModal
        transaction={cobrancaTx}
        open={!!cobrancaTx}
        onClose={() => setCobrancaTx(null)}
        onUpdated={() => {
          queryClient.invalidateQueries({ queryKey: ["financialTransactions"] });
          setCobrancaTx(null);
        }}
      />
    </div>
  );
}
