// @ts-nocheck
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, Stethoscope, HeartPulse, ShieldCheck, Zap, Brain, Activity, Sparkles, Smile, ScanLine, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

// Motivos organizados por categoria com duração específica
const SERVICE_CATEGORIES = [
  {
    label: "Avaliação",
    services: [
      { type: "consultation", reason: "Avaliação Geral", description: "Primeira consulta, diagnóstico e plano de tratamento", duration: 30, icon: Stethoscope, color: "indigo" },
      { type: "diagnostic", reason: "Avaliação Ortodôntica", description: "Análise para aparelho ou alinhadores", duration: 45, icon: ScanLine, color: "violet" },
    ]
  },
  {
    label: "Prevenção",
    services: [
      { type: "checkup", reason: "Limpeza (Profilaxia)", description: "Remoção de tártaro e polimento dental", duration: 45, icon: ShieldCheck, color: "emerald" },
      { type: "checkup", reason: "Check-up de Rotina", description: "Revisão periódica e radiografias", duration: 30, icon: Smile, color: "green" },
    ]
  },
  {
    label: "Tratamento",
    services: [
      { type: "procedure", reason: "Restauração (Cárie)", description: "Obturação ou restauração dentária", duration: 60, icon: Activity, color: "blue" },
      { type: "procedure", reason: "Clareamento Dental", description: "Clareamento a laser ou moldeiras", duration: 90, icon: Sparkles, color: "yellow" },
      { type: "procedure", reason: "Extração Dentária", description: "Extração simples ou cirúrgica", duration: 60, icon: Scissors, color: "orange" },
      { type: "procedure", reason: "Tratamento de Canal", description: "Endodontia (uma ou mais sessões)", duration: 90, icon: Brain, color: "purple" },
    ]
  },
  {
    label: "Urgência",
    services: [
      { type: "emergency", reason: "Emergência / Dor Aguda", description: "Atendimento imediato para dor ou trauma", duration: 30, icon: Zap, color: "red" },
    ]
  },
  {
    label: "Retorno",
    services: [
      { type: "follow_up", reason: "Retorno / Acompanhamento", description: "Consulta de retorno agendada pelo dentista", duration: 20, icon: HeartPulse, color: "pink" },
    ]
  },
];

const COLOR_MAP = {
  indigo:  { bg: "bg-indigo-100",  icon: "text-indigo-600",  border: "border-indigo-400",  tag: "bg-indigo-50 text-indigo-700" },
  violet:  { bg: "bg-violet-100",  icon: "text-violet-600",  border: "border-violet-400",  tag: "bg-violet-50 text-violet-700" },
  emerald: { bg: "bg-emerald-100", icon: "text-emerald-600", border: "border-emerald-400", tag: "bg-emerald-50 text-emerald-700" },
  green:   { bg: "bg-green-100",   icon: "text-green-600",   border: "border-green-400",   tag: "bg-green-50 text-green-700" },
  blue:    { bg: "bg-blue-100",    icon: "text-blue-600",    border: "border-blue-400",    tag: "bg-blue-50 text-blue-700" },
  yellow:  { bg: "bg-yellow-100",  icon: "text-yellow-600",  border: "border-yellow-400",  tag: "bg-yellow-50 text-yellow-700" },
  orange:  { bg: "bg-orange-100",  icon: "text-orange-600",  border: "border-orange-400",  tag: "bg-orange-50 text-orange-700" },
  purple:  { bg: "bg-purple-100",  icon: "text-purple-600",  border: "border-purple-400",  tag: "bg-purple-50 text-purple-700" },
  red:     { bg: "bg-red-100",     icon: "text-red-600",     border: "border-red-400",     tag: "bg-red-50 text-red-700" },
  pink:    { bg: "bg-pink-100",    icon: "text-pink-600",    border: "border-pink-400",    tag: "bg-pink-50 text-pink-700" },
};

export default function ServiceSelection({ onSelect }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-slate-900">Qual o motivo da sua consulta?</h2>
        <p className="text-slate-500 text-sm mt-1">Escolha o motivo para otimizarmos o tempo e a agenda</p>
      </div>

      <div className="space-y-5">
        {SERVICE_CATEGORIES.map(cat => (
          <div key={cat.label}>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{cat.label}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {cat.services.map(svc => {
                const Icon = svc.icon;
                const c = COLOR_MAP[svc.color];
                const key = svc.reason;
                return (
                  <button
                    key={key}
                    onClick={() => onSelect(svc)}
                    onMouseEnter={() => setHovered(key)}
                    onMouseLeave={() => setHovered(null)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all w-full",
                      hovered === key ? `${c.border} bg-white shadow-md` : "border-slate-200 bg-white hover:shadow-sm"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", c.bg)}>
                      <Icon className={cn("w-5 h-5", c.icon)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{svc.reason}</p>
                      <p className="text-xs text-slate-400 truncate">{svc.description}</p>
                    </div>
                    <Badge className={cn("text-[10px] border-0 flex-shrink-0", c.tag)}>
                      <Clock className="w-3 h-3 mr-1" />{svc.duration}min
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
