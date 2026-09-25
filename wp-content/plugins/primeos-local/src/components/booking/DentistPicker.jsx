// @ts-nocheck
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

const SPECIALTY_LABELS = {
  clinico_geral: "Clínico Geral", ortodontia: "Ortodontia",
  implantodontia: "Implantodontia", endodontia: "Endodontia",
  periodontia: "Periodontia", pediatria: "Pediatria",
  cirurgia: "Cirurgia", protese: "Prótese", estetica: "Estética",
};

export default function DentistPicker({ dentists, selectedId, date, blockouts, onChange }) {
  const dayOfWeek = date ? new Date(date + "T12:00:00").getDay() : -1;

  const isDentistAvailable = (d) => {
    if (!date) return true;
    const wh = d.working_hours?.[dayOfWeek];
    if (wh && wh.active === false) return false;
    const hasFullDayBlock = blockouts?.some(b => b.dentist_id === d.id && b.is_full_day);
    return !hasFullDayBlock;
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-slate-800 text-center">Escolha o Dentista</h3>
      <p className="text-sm text-slate-500 text-center">Opcional – deixe em branco para qualquer profissional disponível</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
        {/* Any dentist option */}
        <button
          onClick={() => onChange(null, null)}
          className={cn(
            "relative p-3 rounded-xl border-2 text-sm transition-all text-left",
            !selectedId
              ? "border-indigo-500 bg-indigo-50"
              : "border-slate-200 hover:border-indigo-300 bg-white"
          )}
        >
          {!selectedId && <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-indigo-600" />}
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold mb-2 text-lg">?</div>
          <p className="font-semibold text-slate-700">Qualquer</p>
          <p className="text-xs text-slate-400 mt-0.5">1º disponível</p>
        </button>

        {dentists.map(d => {
          const available = isDentistAvailable(d);
          const isSelected = selectedId === d.id;
          return (
            <button
              key={d.id}
              disabled={!available}
              onClick={() => onChange(d.id, d.name)}
              className={cn(
                "relative p-3 rounded-xl border-2 text-sm transition-all text-left",
                !available && "opacity-40 cursor-not-allowed bg-slate-50 border-slate-100",
                available && isSelected && "border-indigo-500 bg-indigo-50",
                available && !isSelected && "border-slate-200 hover:border-indigo-300 bg-white"
              )}
            >
              {isSelected && <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-indigo-600" />}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mb-2 text-sm"
                style={{ backgroundColor: d.color || "#6366f1" }}
              >
                {d.name?.charAt(0)}
              </div>
              <p className="font-semibold text-slate-800 truncate">{d.name}</p>
              <p className="text-xs text-slate-500 mt-0.5 truncate">{SPECIALTY_LABELS[d.specialty] || d.specialty}</p>
              {!available && date && (
                <Badge className="mt-1 text-[10px] bg-slate-100 text-slate-500 border-0">Indisponível</Badge>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
