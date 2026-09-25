// @ts-nocheck
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { CheckCircle2, XCircle, AlertCircle, PlayCircle, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  completed:   { label: "Concluído",      color: "#10b981", bg: "bg-emerald-100", text: "text-emerald-700", icon: CheckCircle2 },
  confirmed:   { label: "Confirmado",     color: "#6366f1", bg: "bg-indigo-100",  text: "text-indigo-700",  icon: CheckCircle2 },
  scheduled:   { label: "Agendado",       color: "#3b82f6", bg: "bg-blue-100",    text: "text-blue-700",    icon: Calendar },
  in_progress: { label: "Em Andamento",   color: "#f59e0b", bg: "bg-amber-100",   text: "text-amber-700",   icon: PlayCircle },
  cancelled:   { label: "Cancelado",      color: "#ef4444", bg: "bg-red-100",     text: "text-red-700",     icon: XCircle },
  no_show:     { label: "Não Compareceu", color: "#f43f5e", bg: "bg-rose-100",    text: "text-rose-700",    icon: AlertCircle },
};

export default function AppointmentStatusWidget({ appointments }) {
  const { pieData, counts, total } = useMemo(() => {
    const counts = {};
    appointments.forEach(a => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });
    const pieData = Object.entries(counts).map(([key, value]) => ({
      name: STATUS_CONFIG[key]?.label || key,
      value,
      color: STATUS_CONFIG[key]?.color || "#94a3b8",
      key,
    }));
    return { pieData, counts, total: appointments.length };
  }, [appointments]);

  const attendanceRate = total > 0
    ? (((counts.completed || 0) + (counts.confirmed || 0)) / total * 100).toFixed(1)
    : 0;

  const noShowRate = total > 0
    ? ((counts.no_show || 0) / total * 100).toFixed(1)
    : 0;

  const cancelRate = total > 0
    ? ((counts.cancelled || 0) / total * 100).toFixed(1)
    : 0;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Status das Consultas</CardTitle>
        <div className="flex gap-4 mt-1 flex-wrap">
          <span className="text-xs text-slate-500">Comparecimento: <strong className="text-emerald-600">{attendanceRate}%</strong></span>
          <span className="text-xs text-slate-500">Não compareceu: <strong className="text-rose-600">{noShowRate}%</strong></span>
          <span className="text-xs text-slate-500">Cancelamentos: <strong className="text-red-600">{cancelRate}%</strong></span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="h-44 w-44 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={70} dataKey="value" paddingAngle={2}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v, n) => [v, n]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
              const count = counts[key] || 0;
              if (count === 0) return null;
              const Icon = cfg.icon;
              return (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", cfg.bg, cfg.text)}>
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">{count}</span>
                    <span className="text-xs text-slate-400">{total > 0 ? ((count/total)*100).toFixed(0) : 0}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
