// @ts-nocheck
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MessageCircle, Users, FileText, Calendar, Stethoscope,
  Heart, RefreshCcw, CheckCircle, Clock, ArrowRight, AlertCircle, Zap
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const STAGES = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: MessageCircle,
    color: "bg-green-500",
    border: "border-green-400",
    light: "bg-green-50",
    text: "text-green-700",
    ring: "ring-green-200",
  },
  {
    id: "crm",
    label: "CRM",
    icon: Users,
    color: "bg-indigo-500",
    border: "border-indigo-400",
    light: "bg-indigo-50",
    text: "text-indigo-700",
    ring: "ring-indigo-200",
  },
  {
    id: "script",
    label: "Sales Script",
    icon: FileText,
    color: "bg-purple-500",
    border: "border-purple-400",
    light: "bg-purple-50",
    text: "text-purple-700",
    ring: "ring-purple-200",
  },
  {
    id: "appointment",
    label: "Appointment",
    icon: Calendar,
    color: "bg-blue-500",
    border: "border-blue-400",
    light: "bg-blue-50",
    text: "text-blue-700",
    ring: "ring-blue-200",
  },
  {
    id: "clinical",
    label: "Clinical Care",
    icon: Stethoscope,
    color: "bg-rose-500",
    border: "border-rose-400",
    light: "bg-rose-50",
    text: "text-rose-700",
    ring: "ring-rose-200",
  },
  {
    id: "followup",
    label: "Follow-up",
    icon: Heart,
    color: "bg-amber-500",
    border: "border-amber-400",
    light: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-200",
  },
  {
    id: "retention",
    label: "Retention",
    icon: RefreshCcw,
    color: "bg-emerald-500",
    border: "border-emerald-400",
    light: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-200",
  },
];

function deriveStageData(patient, appointments, clinicalNotes, followUps) {
  const createdAt = patient.created_date ? new Date(patient.created_date) : null;
  const lastContact = patient.last_contact_date ? new Date(patient.last_contact_date) : null;
  const latestApt = appointments.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  const completedApts = appointments.filter(a => a.status === "completed");
  const scheduledApts = appointments.filter(a => a.status === "scheduled");
  const pendingFollowups = followUps.filter(f => f.status === "pending");
  const completedFollowups = followUps.filter(f => f.status === "completed" || f.status === "contacted");

  return {
    whatsapp: {
      done: !!createdAt,
      date: createdAt,
      notes: `Paciente entrou via ${patient.source || "WhatsApp"}`,
      actions: patient.phone ? [{ label: "Abrir WhatsApp", icon: MessageCircle, color: "text-green-600" }] : [],
      meta: patient.phone || patient.email,
    },
    crm: {
      done: !!patient.segment || patient.status !== "lead",
      date: createdAt,
      notes: `Status: ${patient.status} · Segmento: ${patient.segment || "—"}`,
      actions: [],
      meta: patient.lifetime_value ? `Lifetime value: R$${patient.lifetime_value}` : null,
    },
    script: {
      done: patient.status !== "lead",
      date: lastContact,
      notes: patient.notes ? patient.notes.slice(0, 80) + (patient.notes.length > 80 ? "…" : "") : "Nenhuma nota",
      actions: [],
      meta: null,
    },
    appointment: {
      done: appointments.length > 0,
      date: latestApt ? new Date(latestApt.date) : null,
      notes: latestApt
        ? `${latestApt.service_type} · ${latestApt.status}${latestApt.provider ? ` · ${latestApt.provider}` : ""}`
        : "Nenhuma consulta",
      actions: scheduledApts.length > 0
        ? [{ label: `${scheduledApts.length} agendada(s)`, icon: Calendar, color: "text-blue-600" }]
        : [],
      meta: appointments.length > 0 ? `${completedApts.length} realizada(s) · ${scheduledApts.length} agendada(s)` : null,
    },
    clinical: {
      done: clinicalNotes.length > 0,
      date: clinicalNotes[0] ? new Date(clinicalNotes[0].created_date) : null,
      notes: clinicalNotes[0]?.chief_complaint
        ? `Queixa: ${clinicalNotes[0].chief_complaint.slice(0, 60)}…`
        : "Nenhum atendimento clínico",
      actions: [],
      meta: clinicalNotes.length > 0 ? `${clinicalNotes.length} nota(s) clínica(s)` : null,
    },
    followup: {
      done: completedFollowups.length > 0,
      date: completedFollowups[0] ? new Date(completedFollowups[0].created_date) : null,
      notes: pendingFollowups.length > 0
        ? `${pendingFollowups.length} follow-up(s) pendente(s)`
        : completedFollowups.length > 0
        ? `${completedFollowups.length} concluído(s)`
        : "Nenhum follow-up",
      actions: pendingFollowups.length > 0
        ? [{ label: `${pendingFollowups.length} pendente(s)`, icon: AlertCircle, color: "text-amber-600" }]
        : [],
      meta: pendingFollowups[0]?.due_date ? `Próximo: ${pendingFollowups[0].due_date}` : null,
    },
    retention: {
      done: patient.status === "active" && completedApts.length > 1,
      date: completedApts.length > 1 ? new Date(completedApts[0]?.created_date) : null,
      notes: patient.status === "active"
        ? "Paciente ativo e fidelizado"
        : patient.status === "inactive"
        ? "Paciente inativo — candidato a reativação"
        : "Retenção em progresso",
      actions: patient.status === "inactive"
        ? [{ label: "Reativar", icon: Zap, color: "text-emerald-600" }]
        : [],
      meta: null,
    },
  };
}

export default function PatientTimeline({ patient, appointments, clinicalNotes, followUps, onGoToStage }) {
  const stageData = deriveStageData(patient, appointments, clinicalNotes, followUps);

  // Find current active stage (first incomplete one)
  const currentStageIndex = STAGES.findIndex(s => !stageData[s.id].done);
  const effectiveCurrent = currentStageIndex === -1 ? STAGES.length - 1 : currentStageIndex;

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-100">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {patient.name?.charAt(0)?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900">{patient.name}</h3>
          <p className="text-xs text-slate-500">{patient.phone || patient.email || "Sem contato"}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge className="bg-indigo-100 text-indigo-700 border-0">{patient.segment || "individual"}</Badge>
          <Badge className={cn("border-0",
            patient.status === "active" ? "bg-emerald-100 text-emerald-700" :
            patient.status === "inactive" ? "bg-rose-100 text-rose-700" :
            "bg-slate-100 text-slate-600"
          )}>{patient.status}</Badge>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-xs text-slate-400">Progresso</p>
          <p className="font-bold text-indigo-600">
            {STAGES.filter(s => stageData[s.id].done).length}/{STAGES.length} etapas
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-700"
          style={{ width: `${(STAGES.filter(s => stageData[s.id].done).length / STAGES.length) * 100}%` }}
        />
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[22px] top-0 bottom-0 w-0.5 bg-slate-100" />

        <div className="space-y-1">
          {STAGES.map((stage, idx) => {
            const data = stageData[stage.id];
            const isCompleted = data.done;
            const isCurrent = idx === effectiveCurrent;
            const isFuture = !isCompleted && !isCurrent;
            const Icon = stage.icon;

            return (
              <div key={stage.id} className="relative flex gap-4 group">
                {/* Icon node */}
                <div className="flex-shrink-0 z-10">
                  <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center transition-all border-2",
                    isCompleted
                      ? `${stage.color} text-white border-transparent shadow-sm`
                      : isCurrent
                      ? `bg-white ${stage.border} text-slate-600 ring-4 ${stage.ring} shadow-md`
                      : "bg-slate-50 border-slate-200 text-slate-300"
                  )}>
                    {isCompleted
                      ? <CheckCircle className="w-5 h-5" />
                      : isCurrent
                      ? <Icon className="w-5 h-5" style={{ color: isCurrent ? undefined : undefined }} />
                      : <Icon className="w-5 h-5" />
                    }
                  </div>
                </div>

                {/* Content card */}
                <div className={cn(
                  "flex-1 mb-3 rounded-xl border transition-all",
                  isCompleted
                    ? `${stage.light} ${stage.border.replace("border-", "border-")} border`
                    : isCurrent
                    ? "bg-white border-2 " + stage.border + " shadow-sm"
                    : "bg-slate-50 border border-slate-100"
                )}>
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn(
                          "font-semibold text-sm",
                          isCompleted ? stage.text : isCurrent ? "text-slate-900" : "text-slate-400"
                        )}>
                          {stage.label}
                        </span>
                        {isCompleted && (
                          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", stage.light, stage.text)}>
                            Concluído
                          </span>
                        )}
                        {isCurrent && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700 flex items-center gap-1">
                            <Clock className="w-3 h-3" />Em andamento
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {data.date && (
                          <span className="text-xs text-slate-400 hidden sm:block">
                            {formatDistanceToNow(data.date, { addSuffix: true, locale: ptBR })}
                          </span>
                        )}
                        <Button
                          size="sm"
                          variant={isCurrent ? "default" : "ghost"}
                          className={cn(
                            "h-7 text-xs gap-1",
                            isCurrent ? `${stage.color} text-white hover:opacity-90 border-0` : "text-slate-400 hover:text-slate-700"
                          )}
                          onClick={() => onGoToStage(stage.id)}
                        >
                          {isCurrent ? "Abrir" : "Ver"}
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Notes */}
                    {(isCompleted || isCurrent) && data.notes && (
                      <p className={cn("text-xs mt-1.5", isCompleted ? "text-slate-500" : "text-slate-600")}>
                        {data.notes}
                      </p>
                    )}

                    {/* Meta badge */}
                    {(isCompleted || isCurrent) && data.meta && (
                      <div className="mt-2">
                        <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full", stage.light, stage.text)}>
                          {data.meta}
                        </span>
                      </div>
                    )}

                    {/* Action badges */}
                    {data.actions.length > 0 && (isCompleted || isCurrent) && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {data.actions.map((action, i) => {
                          const ActionIcon = action.icon;
                          return (
                            <span key={i} className={cn("inline-flex items-center gap-1 text-xs font-medium", action.color)}>
                              <ActionIcon className="w-3 h-3" />{action.label}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
