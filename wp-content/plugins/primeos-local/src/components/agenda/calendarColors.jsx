// @ts-nocheck
// Shared color config for service types and appointment statuses

export const serviceColors = {
  consultation: {
    bg: "bg-blue-500", light: "bg-blue-100", text: "text-blue-700",
    border: "border-blue-400", hex: "#3b82f6", label: "Consulta"
  },
  follow_up: {
    bg: "bg-emerald-500", light: "bg-emerald-100", text: "text-emerald-700",
    border: "border-emerald-400", hex: "#10b981", label: "Retorno"
  },
  procedure: {
    bg: "bg-purple-500", light: "bg-purple-100", text: "text-purple-700",
    border: "border-purple-400", hex: "#8b5cf6", label: "Procedimento"
  },
  checkup: {
    bg: "bg-teal-500", light: "bg-teal-100", text: "text-teal-700",
    border: "border-teal-400", hex: "#14b8a6", label: "Check-up"
  },
  emergency: {
    bg: "bg-red-500", light: "bg-red-100", text: "text-red-700",
    border: "border-red-400", hex: "#ef4444", label: "Emergência"
  },
  therapy: {
    bg: "bg-amber-500", light: "bg-amber-100", text: "text-amber-700",
    border: "border-amber-400", hex: "#f59e0b", label: "Terapia"
  },
  diagnostic: {
    bg: "bg-indigo-500", light: "bg-indigo-100", text: "text-indigo-700",
    border: "border-indigo-400", hex: "#6366f1", label: "Diagnóstico"
  }
};

export const getServiceColor = (serviceType) =>
  serviceColors[serviceType] || serviceColors.consultation;

export const statusColors = {
  scheduled: { bg: "bg-blue-100", text: "text-blue-700", label: "Agendado" },
  confirmed: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Confirmado" },
  in_progress: { bg: "bg-amber-100", text: "text-amber-700", label: "Em Andamento" },
  completed: { bg: "bg-slate-100", text: "text-slate-600", label: "Concluído" },
  cancelled: { bg: "bg-red-100", text: "text-red-600", label: "Cancelado" },
  no_show: { bg: "bg-rose-100", text: "text-rose-600", label: "Não Compareceu" }
};
