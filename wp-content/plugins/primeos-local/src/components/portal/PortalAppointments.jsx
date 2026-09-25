// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

const statusConfig = {
  scheduled: { label: "Agendado", color: "bg-blue-100 text-blue-700" },
  confirmed: { label: "Confirmado", color: "bg-green-100 text-green-700" },
  completed: { label: "Concluído", color: "bg-purple-100 text-purple-700" },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-700" },
  no_show: { label: "Não compareceu", color: "bg-orange-100 text-orange-700" }
};

export default function PortalAppointments({ appointments }) {
  const upcomingAppointments = appointments
    .filter(apt => new Date(apt.date) >= new Date() && apt.status !== 'cancelled')
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const pastAppointments = appointments
    .filter(apt => new Date(apt.date) < new Date() || apt.status === 'cancelled')
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-6">
      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-3">
              {upcomingAppointments.map(apt => (
                <div key={apt.id} className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">
                        {apt.service_type}
                      </h3>
                      <Badge className={statusConfig[apt.status]?.color}>
                        {statusConfig[apt.status]?.label}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(apt.date), "dd/MM/yyyy")}
                      </div>
                      {apt.time && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                          <Clock className="w-4 h-4" />
                          {apt.time}
                        </div>
                      )}
                    </div>
                  </div>
                  {apt.notes && (
                    <p className="text-sm text-slate-600 mt-2">{apt.notes}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-400 py-8">
              Nenhum agendamento próximo
            </p>
          )}
        </CardContent>
      </Card>

      {/* Past Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {pastAppointments.length > 0 ? (
            <div className="space-y-3">
              {pastAppointments.slice(0, 5).map(apt => (
                <div key={apt.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">
                        {apt.service_type}
                      </h3>
                      <Badge className={statusConfig[apt.status]?.color}>
                        {statusConfig[apt.status]?.label}
                      </Badge>
                    </div>
                    <div className="text-right text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(apt.date), "dd/MM/yyyy")}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-400 py-8">
              Nenhum histórico de agendamento
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
