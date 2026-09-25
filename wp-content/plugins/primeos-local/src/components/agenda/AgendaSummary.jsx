// @ts-nocheck
import { useMemo } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getServiceColor, statusColors } from "./calendarColors";
import { Badge } from "@/components/ui/badge";
import { Clock, User, DollarSign, CheckCircle2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const fmtBRL = (v) => `R$ ${Number(v || 0).toFixed(2).replace(".", ",")}`;

function AppointmentPill({ apt, onEdit }) {
  const color = getServiceColor(apt.service_type);
  const sc = statusColors[apt.status] || statusColors.scheduled;
  return (
    <button
      onClick={() => onEdit(apt)}
      className={cn(
        "w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg border-l-4 bg-white shadow-sm hover:shadow-md transition-all",
        color.border
      )}
    >
      <div className={cn("w-2 h-2 rounded-full flex-shrink-0", color.bg)} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-slate-900 truncate">{apt.patient_name}</p>
        <p className="text-xs text-slate-400">{color.label}{apt.provider ? ` · Dr(a). ${apt.provider}` : ""}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs text-slate-500">{apt.time}</span>
        <Badge className={cn("text-xs px-1.5", sc.bg, sc.text)}>{sc.label}</Badge>
        {apt.price > 0 && (
          <span className={cn("text-xs font-medium", apt.payment_status === "paid" ? "text-green-600" : "text-amber-600")}>
            {fmtBRL(apt.price)}
          </span>
        )}
      </div>
    </button>
  );
}

export default function AgendaSummary({ mode = "day", selectedDate, weekStart, appointments, onEdit }) {
  const days = useMemo(() => {
    if (mode === "day") return [selectedDate];
    const ws = weekStart || startOfWeek(selectedDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(ws, i));
  }, [mode, selectedDate, weekStart]);

  const grouped = useMemo(() => {
    return days.map(day => {
      const dateStr = format(day, "yyyy-MM-dd");
      const dayApts = appointments
        .filter(a => a.date === dateStr && a.status !== "cancelled")
        .sort((a, b) => (a.time || "").localeCompare(b.time || ""));
      const totalRevenue = dayApts.reduce((s, a) => s + (a.price || 0), 0);
      const paidRevenue = dayApts.filter(a => a.payment_status === "paid").reduce((s, a) => s + (a.price || 0), 0);
      return { day, dateStr, apts: dayApts, totalRevenue, paidRevenue };
    });
  }, [days, appointments]);

  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="space-y-6">
      {grouped.map(({ day, dateStr, apts, totalRevenue, paidRevenue }) => {
        const isToday = dateStr === today;
        return (
          <div key={dateStr}>
            {/* Day header */}
            <div className={cn(
              "flex items-center justify-between px-3 py-2 rounded-lg mb-2",
              isToday ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
            )}>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="font-semibold text-sm capitalize">
                  {format(day, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </span>
                {isToday && <Badge className="bg-white text-indigo-600 text-xs">Hoje</Badge>}
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />{apts.length} paciente{apts.length !== 1 ? "s" : ""}
                </span>
                {totalRevenue > 0 && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />{fmtBRL(totalRevenue)}
                  </span>
                )}
              </div>
            </div>

            {/* Appointments */}
            {apts.length === 0 ? (
              <div className="text-center py-4 text-slate-400 text-sm border border-dashed border-slate-200 rounded-lg">
                Nenhuma consulta agendada
              </div>
            ) : (
              <div className="space-y-1.5">
                {apts.map(apt => (
                  <AppointmentPill key={apt.id} apt={apt} onEdit={onEdit} />
                ))}
              </div>
            )}

            {/* Day totals */}
            {apts.length > 0 && (
              <div className="flex items-center gap-4 mt-2 px-3 py-1.5 bg-slate-50 rounded-lg text-xs text-slate-500">
                <span><CheckCircle2 className="w-3.5 h-3.5 inline mr-1 text-green-500" />Recebido: <strong className="text-green-600">{fmtBRL(paidRevenue)}</strong></span>
                <span><Clock className="w-3.5 h-3.5 inline mr-1 text-amber-500" />Pendente: <strong className="text-amber-600">{fmtBRL(totalRevenue - paidRevenue)}</strong></span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
