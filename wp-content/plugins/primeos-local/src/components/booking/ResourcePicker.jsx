// @ts-nocheck
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, Armchair, Building2, Wrench } from "lucide-react";

const TYPE_ICONS = { cadeira: Armchair, sala: Building2, equipamento: Wrench, instrumento: Wrench };
const TYPE_LABELS = { cadeira: "Cadeira", sala: "Sala", equipamento: "Equipamento", instrumento: "Instrumento" };

function toMin(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export default function ResourcePicker({ resources, selectedId, date, appointments, slotTime, duration, onChange }) {
  // Check if resource is occupied at the chosen slot (or date in general if no slot yet)
  const isOccupied = (resource) => {
    if (!date || !appointments?.length) return false;
    return appointments.some(a => {
      if (a.resource_id !== resource.id || a.status === "cancelled") return false;
      if (!slotTime || !a.time) return true; // no slot yet – show as potentially busy
      const rStart = toMin(a.time);
      const rEnd = rStart + (a.duration_minutes || 30);
      const sStart = toMin(slotTime);
      const sEnd = sStart + (duration || 30);
      return sStart < rEnd && sEnd > rStart;
    });
  };

  const eligible = resources.filter(r => r.type === "cadeira" || r.type === "sala");
  if (eligible.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-slate-800 text-sm">Cadeira / Sala</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Any option */}
        <button
          onClick={() => onChange(null, null)}
          className={cn(
            "relative p-3 rounded-xl border-2 text-sm transition-all",
            !selectedId ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-indigo-300 bg-white"
          )}
        >
          {!selectedId && <CheckCircle2 className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-indigo-600" />}
          <p className="font-semibold text-slate-700 text-xs">Qualquer</p>
        </button>

        {eligible.map(r => {
          const occupied = isOccupied(r);
          const isSelected = selectedId === r.id;
          const Icon = TYPE_ICONS[r.type] || Building2;
          return (
            <button
              key={r.id}
              disabled={occupied}
              onClick={() => onChange(r.id, r.name)}
              className={cn(
                "relative p-3 rounded-xl border-2 text-sm transition-all",
                occupied && "opacity-40 cursor-not-allowed bg-slate-50 border-slate-100",
                !occupied && isSelected && "border-indigo-500 bg-indigo-50",
                !occupied && !isSelected && "border-slate-200 hover:border-indigo-300 bg-white"
              )}
            >
              {isSelected && <CheckCircle2 className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-indigo-600" />}
              <Icon className="w-5 h-5 mx-auto mb-1 text-slate-500" />
              <p className="font-semibold text-slate-800 text-xs truncate">{r.name}</p>
              <p className="text-[10px] text-slate-400">{TYPE_LABELS[r.type]}</p>
              {occupied && <Badge className="mt-1 text-[9px] bg-rose-100 text-rose-600 border-0 block text-center">Ocupado</Badge>}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-slate-400">Opcional – deixe em "Qualquer" para atribuição automática</p>
    </div>
  );
}
