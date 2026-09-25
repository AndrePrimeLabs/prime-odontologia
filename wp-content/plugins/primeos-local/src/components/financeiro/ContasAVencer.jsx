// @ts-nocheck
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Calendar, TrendingDown, TrendingUp, Bell } from "lucide-react";
import { format, differenceInDays, parseISO, isToday, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const DAYS_BUCKETS = [
  { label: "Vencidas", days: null, color: "text-red-700", bg: "bg-red-50 border-red-200", icon: AlertTriangle },
  { label: "Hoje", days: 0, color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: Bell },
  { label: "1 a 7 dias", days: 7, color: "text-orange-700", bg: "bg-orange-50 border-orange-200", icon: Clock },
  { label: "8 a 30 dias", days: 30, color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: Calendar },
];

function BucketSection({ label, items, color, bg, icon: Icon }) {
  if (!items.length) return null;
  const total = items.reduce((s, t) => s + ((t.amount || 0) - (t.amount_paid || 0)), 0);
  return (
    <div>
      <div className={cn("flex items-center justify-between px-3 py-2 rounded-lg border mb-2", bg)}>
        <div className="flex items-center gap-2">
          <Icon className={cn("w-4 h-4", color)} />
          <span className={cn("font-semibold text-sm", color)}>{label}</span>
          <Badge className="bg-white/60 text-slate-700 border-0 text-xs">{items.length}</Badge>
        </div>
        <span className={cn("font-bold text-sm", color)}>
          R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </span>
      </div>
      <div className="space-y-1.5 pl-1">
        {items.map(t => {
          const daysLeft = t.due_date ? differenceInDays(parseISO(t.due_date), new Date()) : null;
          const isExpense = t.type === "despesa";
          return (
            <div key={t.id} className="flex items-center justify-between px-3 py-2.5 bg-white border border-slate-100 rounded-lg hover:border-slate-200 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {isExpense
                    ? <TrendingDown className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    : <TrendingUp className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                  <p className="text-sm font-medium text-slate-800 truncate">{t.description}</p>
                  {t.is_recurring && <Badge variant="outline" className="text-xs text-indigo-600">Recorrente</Badge>}
                </div>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  {(t.patient_name || t.supplier) && (
                    <span className="text-xs text-slate-400">{t.patient_name || t.supplier}</span>
                  )}
                  {t.due_date && (
                    <span className="text-xs text-slate-400">
                      Venc: {format(parseISO(t.due_date), "dd/MM/yyyy", { locale: ptBR })}
                      {daysLeft !== null && daysLeft > 0 && ` (${daysLeft}d)`}
                    </span>
                  )}
                </div>
              </div>
              <p className={cn("font-bold text-sm flex-shrink-0", isExpense ? "text-rose-600" : "text-emerald-600")}>
                R$ {((t.amount || 0) - (t.amount_paid || 0)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ContasAVencer() {
  const { data: transactions = [] } = useQuery({
    queryKey: ["financialTransactions"],
    queryFn: () => primeos.entities.FinancialTransaction.list("-due_date"),
  });

  const pending = useMemo(() =>
    transactions.filter(t =>
      t.due_date &&
      !["pago", "cancelado"].includes(t.status) &&
      differenceInDays(parseISO(t.due_date), new Date()) <= 30
    ),
    [transactions]
  );

  const overdue = useMemo(() =>
    pending.filter(t => isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date))),
    [pending]
  );
  const dueToday = useMemo(() =>
    pending.filter(t => isToday(parseISO(t.due_date))),
    [pending]
  );
  const due7 = useMemo(() =>
    pending.filter(t => { const d = differenceInDays(parseISO(t.due_date), new Date()); return d > 0 && d <= 7; }),
    [pending]
  );
  const due30 = useMemo(() =>
    pending.filter(t => { const d = differenceInDays(parseISO(t.due_date), new Date()); return d > 7 && d <= 30; }),
    [pending]
  );

  const totalOverdue = overdue.reduce((s, t) => s + ((t.amount || 0) - (t.amount_paid || 0)), 0);
  const totalPending = [...dueToday, ...due7, ...due30].reduce((s, t) => s + ((t.amount || 0) - (t.amount_paid || 0)), 0);

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-red-100 bg-red-50 shadow-none">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Em Atraso</p>
            <p className="text-lg font-bold text-red-700 mt-1">R$ {totalOverdue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-slate-400">{overdue.length} item(s)</p>
          </CardContent>
        </Card>
        <Card className="border-amber-100 bg-amber-50 shadow-none">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Vencem Hoje</p>
            <p className="text-lg font-bold text-amber-700 mt-1">R$ {dueToday.reduce((s, t) => s + (t.amount || 0), 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-slate-400">{dueToday.length} item(s)</p>
          </CardContent>
        </Card>
        <Card className="border-orange-100 bg-orange-50 shadow-none">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Próximos 7 dias</p>
            <p className="text-lg font-bold text-orange-700 mt-1">R$ {due7.reduce((s, t) => s + (t.amount || 0), 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-slate-400">{due7.length} item(s)</p>
          </CardContent>
        </Card>
        <Card className="border-blue-100 bg-blue-50 shadow-none">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Próximos 30 dias</p>
            <p className="text-lg font-bold text-blue-700 mt-1">R$ {totalPending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-slate-400">{[...dueToday, ...due7, ...due30].length} item(s)</p>
          </CardContent>
        </Card>
      </div>

      {/* Buckets */}
      <div className="space-y-5">
        <BucketSection label="Vencidas" items={overdue} color="text-red-700" bg="bg-red-50 border-red-200" icon={AlertTriangle} />
        <BucketSection label="Vencem Hoje" items={dueToday} color="text-amber-700" bg="bg-amber-50 border-amber-200" icon={Bell} />
        <BucketSection label="1 a 7 dias" items={due7} color="text-orange-700" bg="bg-orange-50 border-orange-200" icon={Clock} />
        <BucketSection label="8 a 30 dias" items={due30} color="text-blue-700" bg="bg-blue-50 border-blue-200" icon={Calendar} />

        {pending.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
            <Calendar className="w-8 h-8 text-green-400" />
            <p className="font-medium text-green-600">Nenhuma conta a vencer nos próximos 30 dias!</p>
          </div>
        )}
      </div>
    </div>
  );
}
