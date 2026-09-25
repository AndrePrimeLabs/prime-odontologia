// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { primeos } from "@/api/primeosClient";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig = {
  scheduled: { label: "Agendado", color: "bg-blue-100 text-blue-700" },
  confirmed: { label: "Confirmado", color: "bg-green-100 text-green-700" },
  in_progress: { label: "Em andamento", color: "bg-yellow-100 text-yellow-700" },
  completed: { label: "Concluído", color: "bg-slate-100 text-slate-700" },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-700" },
  no_show: { label: "Faltou", color: "bg-orange-100 text-orange-700" },
};

const serviceLabels = {
  consultation: "Consulta",
  follow_up: "Retorno",
  procedure: "Procedimento",
  checkup: "Check-up",
  emergency: "Emergência",
  therapy: "Terapia",
  diagnostic: "Diagnóstico",
};

export default function PatientAppointmentHistory({ patient }) {
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments-patient", patient.id, patient.patient_name],
    queryFn: () => primeos.entities.Appointment.filter({ patient_name: patient.patient_name }, "-date", 50),
  });

  if (isLoading) {
    return (
      <div className="text-center py-8 text-slate-500">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Carregando consultas...
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-2" />
        <p>Nenhuma consulta registrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">{appointments.length} consulta(s) encontrada(s)</p>
      {appointments.map((appt) => {
        const status = statusConfig[appt.status] || { label: appt.status, color: "bg-slate-100 text-slate-700" };
        return (
          <div key={appt.id} className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="font-semibold text-slate-900">
                    {serviceLabels[appt.service_type] || appt.service_type}
                  </span>
                  <Badge className={status.color}>{status.label}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {appt.date ? format(new Date(appt.date), "dd/MM/yyyy", { locale: ptBR }) : "—"}
                  </div>
                  {appt.time && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {appt.time} ({appt.duration_minutes || 30} min)
                    </div>
                  )}
                  {appt.provider && (
                    <div className="flex items-center gap-1.5 col-span-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {appt.provider}
                    </div>
                  )}
                </div>
                {appt.notes && (
                  <div className="mt-2 flex items-start gap-1.5 text-sm text-slate-500">
                    <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{appt.notes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
