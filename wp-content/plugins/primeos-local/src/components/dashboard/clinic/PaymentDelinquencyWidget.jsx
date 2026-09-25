// @ts-nocheck
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, DollarSign, Users, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const fmtBRL = (v) => `R$ ${Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

function DelinquencyBadge({ days }) {
  if (days > 60) return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">&gt;60d</span>;
  if (days > 30) return <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">&gt;30d</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">&lt;30d</span>;
}

export default function PaymentDelinquencyWidget({ appointments }) {
  const today = format(new Date(), "yyyy-MM-dd");

  const { overdue, totalOverdueAmount, byPatient, overdueCount } = useMemo(() => {
    const overdue = appointments.filter(a =>
      a.price > 0 &&
      a.status === "completed" &&
      (!a.payment_status || a.payment_status === "pending" || a.payment_status === "partial") &&
      a.date < today
    ).map(a => ({
      ...a,
      daysOverdue: Math.floor((new Date(today) - new Date(a.date)) / 86400000),
      outstanding: a.price - (a.amount_paid || 0),
    })).sort((a, b) => b.daysOverdue - a.daysOverdue);

    const totalOverdueAmount = overdue.reduce((s, a) => s + a.outstanding, 0);

    const byPatient = Object.values(
      overdue.reduce((acc, a) => {
        const key = a.patient_name;
        if (!acc[key]) acc[key] = { name: key, amount: 0, appointments: 0, maxDays: 0 };
        acc[key].amount += a.outstanding;
        acc[key].appointments += 1;
        acc[key].maxDays = Math.max(acc[key].maxDays, a.daysOverdue);
        return acc;
      }, {})
    ).sort((a, b) => b.amount - a.amount).slice(0, 5);

    return { overdue, totalOverdueAmount, byPatient, overdueCount: overdue.length };
  }, [appointments, today]);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <CardTitle className="text-base">Inadimplência</CardTitle>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-3">
          {[
            { label: "Consultas em aberto", value: overdueCount, icon: TrendingDown, color: "text-rose-600" },
            { label: "Valor em aberto", value: fmtBRL(totalOverdueAmount), icon: DollarSign, color: "text-amber-600" },
            { label: "Pacientes devedores", value: byPatient.length, icon: Users, color: "text-orange-600" },
          ].map(k => (
            <div key={k.label} className="bg-slate-50 rounded-lg p-3 text-center">
              <p className={cn("text-lg font-bold", k.color)}>{k.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{k.label}</p>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {byPatient.length === 0 ? (
          <div className="flex flex-col items-center py-6 text-slate-400">
            <DollarSign className="w-8 h-8 mb-2 text-emerald-300" />
            <p className="text-sm font-medium text-emerald-600">Sem inadimplência! 🎉</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Top devedores</p>
            {byPatient.map(p => (
              <div key={p.name} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-xs flex-shrink-0">
                    {p.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.appointments} consulta{p.appointments > 1 ? "s" : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <DelinquencyBadge days={p.maxDays} />
                  <span className="text-sm font-bold text-rose-600">{fmtBRL(p.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
