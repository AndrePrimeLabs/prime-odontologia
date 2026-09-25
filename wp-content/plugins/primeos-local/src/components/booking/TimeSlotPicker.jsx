// @ts-nocheck
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Clock, Sun, Sunset } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const DEFAULT_SLOTS = [
  "07:00","07:30","08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30",
  "17:00","17:30","18:00","18:30","19:00"
];

function generateSlots(start, end, slotDuration) {
  if (!start || !end) return DEFAULT_SLOTS;
  const slots = [];
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let cur = sh * 60 + sm;
  const endMin = eh * 60 + em;
  while (cur + slotDuration <= endMin) {
    const h = String(Math.floor(cur / 60)).padStart(2, "0");
    const m = String(cur % 60).padStart(2, "0");
    slots.push(`${h}:${m}`);
    cur += slotDuration;
  }
  return slots;
}

function toMin(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export default function TimeSlotPicker({
  date, duration, existingAppointments, dentist,
  blockouts = [], onTimeSelect, onBack,
}) {
  const slots = useMemo(() => {
    const dayOfWeek = date ? new Date(date + "T12:00:00").getDay() : 1;
    if (dentist) {
      const wh = dentist.working_hours?.[dayOfWeek];
      if (wh?.active && wh.start && wh.end) {
        return generateSlots(wh.start, wh.end, dentist.slot_duration_minutes || 30);
      }
    }
    return DEFAULT_SLOTS;
  }, [date, dentist]);

  const dentistBlockoutTimes = useMemo(() => {
    if (!dentist) return [];
    return blockouts
      .filter(b => b.dentist_id === dentist.id && !b.is_full_day && b.start_time && b.end_time)
      .map(b => ({ start: toMin(b.start_time), end: toMin(b.end_time) }));
  }, [blockouts, dentist]);

  const isAvailable = (time) => {
    const slotStart = toMin(time);
    const slotEnd = slotStart + duration;

    // Check appointment conflicts
    const conflictsAppt = existingAppointments.some(a => {
      if (!a.time || a.status === "cancelled") return false;
      const aStart = toMin(a.time);
      const aEnd = aStart + (a.duration_minutes || 30);
      return slotStart < aEnd && slotEnd > aStart;
    });
    if (conflictsAppt) return false;

    // Check dentist blockouts
    const conflictsBlock = dentistBlockoutTimes.some(b => slotStart < b.end && slotEnd > b.start);
    if (conflictsBlock) return false;

    return true;
  };

  const morning = slots.filter(t => toMin(t) < 12 * 60);
  const afternoon = slots.filter(t => toMin(t) >= 12 * 60);

  const availableCount = slots.filter(isAvailable).length;

  const SlotGroup = ({ label, Icon, times }) => (
    times.length > 0 && (
      <div className="mb-5">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5" /> {label}
        </h3>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {times.map(time => {
            const avail = isAvailable(time);
            return (
              <Button
                key={time}
                onClick={() => onTimeSelect(time)}
                disabled={!avail}
                variant="outline"
                className={cn(
                  "h-11 font-medium text-sm transition-all",
                  avail
                    ? "hover:bg-indigo-600 hover:text-white hover:border-indigo-600 border-slate-200"
                    : "opacity-30 cursor-not-allowed bg-slate-50"
                )}
              >
                {time}
              </Button>
            );
          })}
        </div>
      </div>
    )
  );

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-slate-900">Escolha o Horário</h2>
        {date && (
          <p className="text-slate-500 mt-1 text-sm capitalize">
            {new Date(date + "T12:00:00").toLocaleDateString("pt-BR", {
              weekday: "long", day: "numeric", month: "long", year: "numeric"
            })}
          </p>
        )}
        {dentist && (
          <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-indigo-50 rounded-full">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: dentist.color || "#6366f1" }} />
            <span className="text-xs font-medium text-indigo-700">{dentist.name}</span>
          </div>
        )}
      </div>

      {availableCount === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="font-medium">Sem horários disponíveis</p>
          <p className="text-sm mt-1">Tente outra data ou profissional</p>
          <Button variant="outline" onClick={onBack} className="mt-4">← Voltar</Button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-xl text-sm">
            <Badge className="bg-indigo-100 text-indigo-700 border-0">{availableCount} horários disponíveis</Badge>
            <span className="text-slate-500">· Duração: {duration} min</span>
            <span className="text-slate-400 text-xs ml-auto">cinza = ocupado</span>
          </div>

          <SlotGroup label="Manhã" Icon={Sun} times={morning} />
          <SlotGroup label="Tarde / Noite" Icon={Sunset} times={afternoon} />

          <Button variant="outline" onClick={onBack} className="w-full mt-2">← Voltar</Button>
        </>
      )}
    </div>
  );
}
