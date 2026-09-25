// @ts-nocheck
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, DollarSign, Clock, CheckCircle } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SERVICE_LABELS } from "./ServicePriceConfig";

const fmtBRL = (v) => `R$ ${Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

const COLORS = ["#6366f1","#22c55e","#f59e0b","#ef4444","#8b5cf6","#14b8a6","#f97316"];

export default function RevenuePanel() {
  const [period, setPeriod] = useState("this_month");

  const { data: appointments = [] } = useQuery({
    queryKey: ["allAppointments"],
    queryFn: () => primeos.entities.Appointment.list("-date")
  });

  const { start, end, label } = useMemo(() => {
    const now = new Date();
    if (period === "this_month") return { start: startOfMonth(now), end: endOfMonth(now), label: format(now, "MMMM yyyy", { locale: ptBR }) };
    if (period === "last_month") { const lm = subMonths(now, 1); return { start: startOfMonth(lm), end: endOfMonth(lm), label: format(lm, "MMMM yyyy", { locale: ptBR }) }; }
    if (period === "last_3") return { start: startOfMonth(subMonths(now, 2)), end: endOfMonth(now), label: "Últimos 3 meses" };
    return { start: startOfMonth(subMonths(now, 11)), end: endOfMonth(now), label: "Últimos 12 meses" };
  }, [period]);

  const filtered = useMemo(() =>
    appointments.filter(a => {
      if (!a.date || a.status === "cancelled") return false;
      const d = parseISO(a.date);
      return d >= start && d <= end && a.price > 0;
    }), [appointments, start, end]);

  const totalRevenue = filtered.filter(a => a.payment_status === "paid").reduce((s, a) => s + (a.price || 0), 0);
  const totalPending = filtered.filter(a => a.payment_status === "pending" || !a.payment_status).reduce((s, a) => s + (a.price || 0), 0);
  const totalAppointments = filtered.length;
  const paidCount = filtered.filter(a => a.payment_status === "paid").length;

  // Revenue by service
  const byService = useMemo(() => {
    const map = {};
    filtered.filter(a => a.payment_status === "paid").forEach(a => {
      const k = a.service_type || "other";
      map[k] = (map[k] || 0) + (a.price || 0);
    });
    return Object.entries(map).map(([k, v]) => ({ name: SERVICE_LABELS[k] || k, value: v })).sort((a, b) => b.value - a.value);
  }, [filtered]);

  // Revenue by day/month for chart
  const byPeriodChart = useMemo(() => {
    const map = {};
    filtered.filter(a => a.payment_status === "paid").forEach(a => {
      const key = period === "last_3" || period === "last_12"
        ? format(parseISO(a.date), "MMM/yy", { locale: ptBR })
        : format(parseISO(a.date), "dd/MM");
      map[key] = (map[key] || 0) + (a.price || 0);
    });
    return Object.entries(map).map(([k, v]) => ({ label: k, value: v }));
  }, [filtered, period]);

  // Unpaid list
  const unpaid = filtered.filter(a => a.payment_status === "pending" || !a.payment_status).slice(0, 8);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" /> Receita por Período
        </h3>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="this_month">Este mês</SelectItem>
            <SelectItem value="last_month">Mês anterior</SelectItem>
            <SelectItem value="last_3">Últimos 3 meses</SelectItem>
            <SelectItem value="last_12">Últimos 12 meses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: DollarSign, label: "Receita Recebida", value: fmtBRL(totalRevenue), color: "text-green-600 bg-green-50" },
          { icon: Clock, label: "A Receber", value: fmtBRL(totalPending), color: "text-amber-600 bg-amber-50" },
          { icon: CheckCircle, label: "Consultas Pagas", value: `${paidCount}/${totalAppointments}`, color: "text-blue-600 bg-blue-50" },
          { icon: TrendingUp, label: "Ticket Médio", value: paidCount ? fmtBRL(totalRevenue / paidCount) : "—", color: "text-indigo-600 bg-indigo-50" },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Revenue chart */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-slate-700 mb-3">Receita Recebida — {label}</p>
            {byPeriodChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={byPeriodChart}>
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${v}`} />
                  <Tooltip formatter={v => fmtBRL(v)} />
                  <Bar dataKey="value" radius={[4,4,0,0]}>
                    {byPeriodChart.map((_, i) => <Cell key={i} fill="#6366f1" />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-40 flex items-center justify-center text-slate-400 text-sm">Nenhum dado no período</div>
            )}
          </CardContent>
        </Card>

        {/* By service */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-slate-700 mb-3">Por Tipo de Serviço</p>
            {byService.length > 0 ? (
              <div className="space-y-2.5">
                {byService.map(({ name, value }, i) => {
                  const pct = totalRevenue > 0 ? Math.round((value / totalRevenue) * 100) : 0;
                  return (
                    <div key={name}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-700">{name}</span>
                        <span className="font-medium text-slate-900">{fmtBRL(value)} <span className="text-slate-400">({pct}%)</span></span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-slate-400 text-sm">Nenhum dado no período</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending payments */}
      {unpaid.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" /> Pagamentos Pendentes ({unpaid.length})
            </p>
            <div className="space-y-2">
              {unpaid.map(a => (
                <div key={a.id} className="flex items-center justify-between text-sm border-b border-slate-50 pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-slate-900">{a.patient_name}</p>
                    <p className="text-xs text-slate-500">{SERVICE_LABELS[a.service_type]} · {a.date} às {a.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-amber-700">{fmtBRL(a.price)}</p>
                    <Badge className="text-xs bg-amber-100 text-amber-700">Pendente</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
