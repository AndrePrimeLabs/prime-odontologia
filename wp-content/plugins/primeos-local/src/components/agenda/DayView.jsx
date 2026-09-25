// @ts-nocheck
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import AppointmentCard from "./AppointmentCard";
import { Plus } from "lucide-react";
import { getServiceColor } from "./calendarColors";
import { cn } from "@/lib/utils";

const timeSlots = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00"
];

function DraggableAppointment({ apt, onEdit, onStatusChange, onCancel, onDragStart }) {
  const color = getServiceColor(apt.service_type);
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("appointmentId", apt.id);
        onDragStart?.(apt.id);
      }}
      className="cursor-grab active:cursor-grabbing"
    >
      <AppointmentCard
        appointment={apt}
        onEdit={onEdit}
        onStatusChange={onStatusChange}
        onCancel={onCancel}
      />
    </div>
  );
}

export default function DayView({
  selectedDate,
  appointments,
  onSlotClick,
  onEditAppointment,
  onStatusChange,
  onCancel,
  onAddPatient,
  onReschedule
}) {
  const dateStr = format(selectedDate, "yyyy-MM-dd");

  const getAppointmentsForTime = (time) =>
    appointments.filter(apt => apt.date === dateStr && apt.time === time);

  const handleDrop = (e, time) => {
    e.preventDefault();
    const aptId = e.dataTransfer.getData("appointmentId");
    if (aptId) onReschedule?.(aptId, dateStr, time);
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900 capitalize">
          {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
        </h3>
        <button
          onClick={() => onAddPatient?.(dateStr)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar Paciente
        </button>
      </div>

      <ScrollArea className="h-[560px] pr-4">
        <div className="space-y-1">
          {timeSlots.map((time) => {
            const slotApts = getAppointmentsForTime(time);
            return (
              <div
                key={time}
                className="flex items-start gap-3"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, time)}
              >
                <div className="w-14 pt-2 text-xs font-medium text-slate-400 flex-shrink-0 text-right select-none">
                  {time}
                </div>
                <div className={cn(
                  "flex-1 min-h-[52px] border-l-2 pl-3 pb-1 transition-colors",
                  slotApts.length > 0 ? "border-indigo-200" : "border-slate-100"
                )}>
                  {slotApts.length > 0 ? (
                    <div className="space-y-2">
                      {slotApts.map((apt) => (
                        <DraggableAppointment
                          key={apt.id}
                          apt={apt}
                          onEdit={onEditAppointment}
                          onStatusChange={onStatusChange}
                          onCancel={onCancel}
                          onDragStart={() => {}}
                        />
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={() => onSlotClick(dateStr, time)}
                      className="w-full min-h-[44px] border border-dashed border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all flex items-center justify-center text-slate-300 hover:text-blue-400 group"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1 group-hover:scale-110 transition-transform" />
                      <span className="text-xs">Agendar</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
