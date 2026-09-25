// @ts-nocheck
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, subDays, subWeeks, subMonths, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

const PERIOD_OPTIONS = [
  { key: "daily", label: "Diário (30d)" },
  { key: "weekly", label: "Semanal (12s)" },
  { key: "monthly", label: "Mensal (12m)" },
];

export default function AppointmentVolumeChart({ appointments }) {
  const [period, setPeriod] = useState("daily");
  const today = new Date();

  const chartData = useMemo(() => {
    if (period === "daily") {
      const days = eachDayOfInterval({ start: subDays(today, 29), end: today });
      return days.map(day => {
        const dateStr = format(day, "yyyy-MM-dd");
        const count = appointments.filter(a => a.date === dateStr).length;
        return { label: format(day, "dd/MM"), count };
      });
    }
    if (period === "weekly") {
      const weeks = eachWeekOfInterval({ start: subWeeks(today, 11), end: today }, { weekStartsOn: 1 });
      return weeks.map(ws => {
        const we = endOfWeek(ws, { weekStartsOn: 1 });
        const count = appointments.filter(a => a.date >= format(ws, "yyyy-MM-dd") && a.date <= format(we, "yyyy-MM-dd")).length;
        return { label: `Sem ${format(ws, "dd/MM")}`, count };
      });
    }
    // monthly
    const months = eachMonthOfInterval({ start: subMonths(today, 11), end: today });
    return months.map(m => {
      const ms = format(startOfMonth(m), "yyyy-MM-dd");
      const me = format(endOfMonth(m), "yyyy-MM-dd");
      const count = appointments.filter(a => a.date >= ms && a.date <= me).length;
      return { label: format(m, "MMM/yy", { locale: ptBR }), count };
    });
  }, [period, appointments]);

  const total = chartData.reduce((s, d) => s + d.count, 0);
  const avg = chartData.length ? (total / chartData.length).toFixed(1) : 0;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <CardTitle className="text-base">Volume de Consultas</CardTitle>
          </div>
          <div className="flex gap-1">
            {PERIOD_OPTIONS.map(o => (
              <button
                key={o.key}
                onClick={() => setPeriod(o.key)}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-md transition-colors",
                  period === o.key ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-4 mt-2">
          <span className="text-xs text-slate-500">Total: <strong className="text-slate-800">{total}</strong></span>
          <span className="text-xs text-slate-500">Média: <strong className="text-slate-800">{avg}/período</strong></span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                formatter={(v) => [v, "Consultas"]}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
