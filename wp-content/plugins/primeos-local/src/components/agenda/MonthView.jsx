// @ts-nocheck
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, startOfWeek, endOfWeek } from "date-fns";
import { getServiceColor } from "./calendarColors";

export default function MonthView({ currentMonth, appointments, onDayClick, onReschedule }) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const today = new Date();

  const getDayApts = (day) =>
    appointments
      .filter(a => a.date === format(day, "yyyy-MM-dd") && a.status !== "cancelled")
      .sort((a, b) => (a.time || "").localeCompare(b.time || ""));

  const handleDrop = (e, day) => {
    e.preventDefault();
    const aptId = e.dataTransfer.getData("appointmentId");
    if (aptId) onReschedule?.(aptId, format(day, "yyyy-MM-dd"), null);
  };

  return (
    <div>
      {/* Week headers */}
      <div className="grid grid-cols-7 mb-1">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-slate-500 py-2 uppercase tracking-wide select-none">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
        {days.map((day) => {
          const dayApts = getDayApts(day);
          const isToday = isSameDay(day, today);
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <div
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, day)}
              className={cn(
                "min-h-[110px] p-1.5 cursor-pointer transition-all",
                isCurrentMonth ? "bg-white hover:bg-indigo-50/40" : "bg-slate-50",
                isToday && "bg-indigo-50"
              )}
            >
              {/* Day number */}
              <div className="flex items-center justify-between mb-1">
                <span className={cn(
                  "text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full select-none",
                  isToday ? "bg-indigo-600 text-white" : isCurrentMonth ? "text-slate-700" : "text-slate-300"
                )}>
                  {format(day, "d")}
                </span>
                {dayApts.length > 0 && (
                  <span className="text-xs text-slate-400 select-none">{dayApts.length}</span>
                )}
              </div>

              {/* Appointment chips */}
              <div className="space-y-0.5">
                {dayApts.slice(0, 3).map((apt) => {
                  const color = getServiceColor(apt.service_type);
                  return (
                    <div
                      key={apt.id}
                      draggable
                      onDragStart={(e) => {
                        e.stopPropagation();
                        e.dataTransfer.setData("appointmentId", apt.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded truncate cursor-grab active:cursor-grabbing select-none border-l-2",
                        color.light, color.text, color.border
                      )}
                      title={`${apt.time} — ${apt.patient_name}`}
                    >
                      {apt.time} {apt.patient_name}
                    </div>
                  );
                })}
                {dayApts.length > 3 && (
                  <div className="text-xs text-slate-400 pl-1 select-none">
                    +{dayApts.length - 3} mais
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 px-1">
        {[
          { type: "consultation", label: "Consulta" }, { type: "follow_up", label: "Retorno" },
          { type: "procedure", label: "Procedimento" }, { type: "checkup", label: "Check-up" },
          { type: "emergency", label: "Emergência" }, { type: "therapy", label: "Terapia" },
          { type: "diagnostic", label: "Diagnóstico" }
        ].map(({ type, label }) => {
          const c = getServiceColor(type);
          return (
            <div key={type} className="flex items-center gap-1">
              <div className={cn("w-2.5 h-2.5 rounded-sm", c.bg)} />
              <span className="text-xs text-slate-500 select-none">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
