// @ts-nocheck
import { cn } from "@/lib/utils";
import { format, addDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getServiceColor, statusColors } from "./calendarColors";

const timeSlots = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "13:00", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00"
];

function WeekAppointmentChip({ apt, onClick, onDragStart }) {
  const color = getServiceColor(apt.service_type);
  const sc = statusColors[apt.status] || statusColors.scheduled;
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("appointmentId", apt.id);
        onDragStart?.();
      }}
      onClick={() => onClick(apt)}
      className={cn(
        "cursor-grab active:cursor-grabbing text-xs px-1.5 py-1 rounded border-l-2 truncate leading-tight select-none",
        color.light, color.text, color.border
      )}
      title={`${apt.patient_name} — ${apt.time} — ${color.label}`}
    >
      <span className="font-semibold">{apt.time}</span> {apt.patient_name}
    </div>
  );
}

export default function WeekView({
  weekStart,
  appointments,
  onSlotClick,
  onEditAppointment,
  onStatusChange,
  onCancel,
  onReschedule
}) {
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();

  const getApts = (date, time) =>
    appointments.filter(a => a.date === format(date, "yyyy-MM-dd") && a.time === time);

  const handleDrop = (e, date, time) => {
    e.preventDefault();
    const aptId = e.dataTransfer.getData("appointmentId");
    if (aptId) onReschedule?.(aptId, format(date, "yyyy-MM-dd"), time);
  };

  return (
    <div className="overflow-auto rounded-lg border bg-white shadow-sm">
      <div className="flex" style={{ minWidth: "700px" }}>
        {/* Time gutter */}
        <div className="w-16 flex-shrink-0 border-r bg-slate-50">
          <div className="h-14 border-b" />
          {timeSlots.map(t => (
            <div key={t} className="h-16 border-b flex items-center justify-center text-xs text-slate-400 font-medium select-none">
              {t}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {weekDays.map((day) => {
          const isToday = isSameDay(day, today);
          return (
            <div key={day.toISOString()} className="flex-1 border-r last:border-r-0 min-w-0">
              {/* Header */}
              <div className={cn("h-14 border-b flex flex-col items-center justify-center", isToday && "bg-indigo-50")}>
                <span className="text-xs text-slate-400 uppercase select-none">
                  {format(day, "EEE", { locale: ptBR })}
                </span>
                <span className={cn(
                  "text-sm font-bold select-none",
                  isToday && "bg-indigo-600 text-white w-7 h-7 rounded-full flex items-center justify-center"
                )}>
                  {format(day, "d")}
                </span>
              </div>

              {/* Slots */}
              <div className="overflow-y-auto max-h-[560px]">
                {timeSlots.map((time) => {
                  const slotApts = getApts(day, time);
                  return (
                    <div
                      key={time}
                      className="h-16 border-b px-1 py-0.5 space-y-0.5 hover:bg-slate-50/70 transition-colors"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, day, time)}
                    >
                      {slotApts.length > 0 ? (
                        slotApts.map(apt => (
                          <WeekAppointmentChip
                            key={apt.id}
                            apt={apt}
                            onClick={onEditAppointment}
                            onDragStart={() => {}}
                          />
                        ))
                      ) : (
                        <button
                          onClick={() => onSlotClick(format(day, "yyyy-MM-dd"), time)}
                          className="w-full h-full rounded hover:bg-blue-50 transition-colors"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
