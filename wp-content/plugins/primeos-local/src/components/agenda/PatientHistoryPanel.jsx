// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { primeos } from "@/api/primeosClient";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Phone, Mail, MapPin, Tag } from "lucide-react";

const serviceLabels = {
  consultation: "Consulta", follow_up: "Retorno", procedure: "Procedimento",
  checkup: "Check-up", emergency: "Emergência", therapy: "Terapia", diagnostic: "Diagnóstico"
};

const statusColors = {
  scheduled: "bg-blue-100 text-blue-700", confirmed: "bg-green-100 text-green-700",
  completed: "bg-slate-100 text-slate-600", cancelled: "bg-red-100 text-red-600",
  no_show: "bg-rose-100 text-rose-600"
};

export default function PatientHistoryPanel({ patient }) {
  const { data: appointments = [] } = useQuery({
    queryKey: ["patientAppointments", patient?.id],
    queryFn: () => primeos.entities.Appointment.filter({ patient_id: patient.id }, "-date"),
    enabled: !!patient?.id
  });

  if (!patient) return null;

  const today = new Date().toISOString().split("T")[0];
  const past = appointments.filter(a => a.date < today && a.status !== "cancelled");
  const upcoming = appointments.filter(a => a.date >= today && a.status !== "cancelled");

  return (
    <div className="border border-slate-200 rounded-xl bg-white p-4 space-y-3 text-sm">
      {/* Patient Info */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-slate-900">{patient.name}</p>
          <div className="flex flex-wrap gap-2 mt-1 text-xs text-slate-500">
            {patient.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{patient.phone}</span>}
            {patient.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{patient.email}</span>}
            {patient.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{patient.city}</span>}
          </div>
        </div>
        {patient.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {patient.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs h-5 px-1.5">
                <Tag className="w-2.5 h-2.5 mr-1" />{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      {patient.notes && (
        <p className="text-xs text-slate-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 italic">
          📝 {patient.notes}
        </p>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-blue-500" /> Próximas consultas
          </p>
          <div className="space-y-1.5">
            {upcoming.slice(0, 2).map(apt => (
              <div key={apt.id} className="flex items-center justify-between bg-blue-50 rounded-lg px-2.5 py-1.5 text-xs">
                <span className="text-slate-700">{serviceLabels[apt.service_type]} — {apt.date} às {apt.time}</span>
                <Badge className={`text-xs h-4 ${statusColors[apt.status]}`}>{apt.status === "confirmed" ? "Confirmado" : "Agendado"}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" /> Histórico ({past.length} consultas)
          </p>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {past.slice(0, 5).map(apt => (
              <div key={apt.id} className="flex items-center justify-between text-xs text-slate-600 border-b border-slate-100 pb-1">
                <span>{serviceLabels[apt.service_type]} — {apt.date}</span>
                <Badge className={`text-xs h-4 ${statusColors[apt.status]}`}>{apt.status === "completed" ? "Concluído" : apt.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {appointments.length === 0 && (
        <p className="text-xs text-slate-400 italic text-center py-1">Nenhuma consulta anterior</p>
      )}
    </div>
  );
}
