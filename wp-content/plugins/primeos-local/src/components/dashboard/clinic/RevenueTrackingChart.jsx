// @ts-nocheck
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell } from "recharts";
import { format, subMonths, eachMonthOfInterval, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DollarSign } from "lucide-react";

const fmtBRL = (v) => `R$ ${Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

const SERVICE_LABELS = {
  consultation: "Consulta", follow_up: "Retorno", procedure: "Procedimento",
  checkup: "Check-up", emergency: "Emergência", therapy: "Terapia", diagnostic: "Diagnóstico"
};
const COLORS = ["#6366f1","#10b981","#f59e0b","#ec4899","#ef4444","#14b8a6","#8b5cf6"];

export default function RevenueTrackingChart({ appointments }) {
  const today = new Date();

  const { monthlyData, paidTotal, pendingTotal, serviceData } = useMemo(() => {
    const aptWithPrice = appointments.filter(a => a.price > 0 && a.status !== "cancelled");
    const paidTotal = aptWithPrice.filter(a => a.payment_status === "paid").reduce((s, a) => s + a.price, 0);
    const pendingTotal = aptWithPrice.filter(a => a.payment_status !== "paid").reduce((s, a) => s + a.price, 0);

    const months = eachMonthOfInterval({ start: subMonths(today, 5), end: today });
    const monthlyData = months.map(m => {
      const ms = format(startOfMonth(m), "yyyy-MM-dd");
      const me = format(endOfMonth(m), "yyyy-MM-dd");
      const inMonth = aptWithPrice.filter(a => a.date >= ms && a.date <= me);
      return {
        label: format(m, "MMM/yy", { locale: ptBR }),
        pago: inMonth.filter(a => a.payment_status === "paid").reduce((s, a) => s + a.price, 0),
        pendente: inMonth.filter(a => a.payment_status !== "paid").reduce((s, a) => s + a.price, 0),
      };
    });

    const byService = aptWithPrice.reduce((acc, a) => {
      const key = a.service_type || "consultation";
      acc[key] = (acc[key] || 0) + a.price;
      return acc;
    }, {});
    const serviceData = Object.entries(byService).map(([key, value]) => ({
      name: SERVICE_LABELS[key] || key, value
    }));

    return { monthlyData, paidTotal, pendingTotal, serviceData };
  }, [appointments]);

  return (
    <div className="grid gap-4">
      {/* KPI row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total (com preço)", value: fmtBRL(paidTotal + pendingTotal), color: "text-slate-800" },
          { label: "Recebido", value: fmtBRL(paidTotal), color: "text-emerald-600" },
          { label: "Pendente", value: fmtBRL(pendingTotal), color: "text-amber-600" },
        ].map(k => (
          <Card key={k.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 mb-1">{k.label}</p>
              <p className={`text-lg font-bold ${k.color}`}>{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly stacked bar */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <CardTitle className="text-base">Receita Mensal — Pago vs. Pendente</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v, n) => [fmtBRL(v), n === "pago" ? "Pago" : "Pendente"]} />
                <Legend wrapperStyle={{ fontSize: 12 }} formatter={v => v === "pago" ? "Pago" : "Pendente"} />
                <Bar dataKey="pago" stackId="a" fill="#10b981" radius={[0,0,0,0]} />
                <Bar dataKey="pendente" stackId="a" fill="#fbbf24" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Revenue by service type */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Receita por Tipo de Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          {serviceData.length === 0 ? (
            <p className="text-center text-slate-400 py-8 text-sm">Nenhum dado disponível</p>
          ) : (
            <div className="flex items-center gap-4">
              <div className="h-44 w-44 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={serviceData} cx="50%" cy="50%" innerRadius={35} outerRadius={70} dataKey="value" paddingAngle={3}>
                      {serviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={v => fmtBRL(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1.5">
                {serviceData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-xs text-slate-600">{d.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-800">{fmtBRL(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
