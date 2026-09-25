// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, User, CheckCircle } from "lucide-react";

export default function UpcomingAppointments({ appointments, onEdit, onStatusChange }) {
  const upcomingAppointments = appointments
    .filter(
      (apt) =>
        (apt.status === "scheduled" || apt.status === "confirmed") &&
        new Date(apt.date) >= new Date().setHours(0, 0, 0, 0)
    )
    .sort((a, b) => {
      const dateCompare = new Date(a.date) - new Date(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    })
    .slice(0, 5);

  const getDateLabel = (dateStr) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Hoje";
    if (isTomorrow(date)) return "Amanhã";
    return format(date, "dd/MM", { locale: ptBR });
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          Próximos Agendamentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingAppointments.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p>Nenhum agendamento próximo</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                        {getDateLabel(appointment.date)}
                      </Badge>
                      <span className="text-sm font-semibold text-slate-900">
                        {appointment.time}
                      </span>
                    </div>
                    <h4 className="font-medium text-slate-900 mb-1 truncate">
                      {appointment.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <User className="w-3 h-3" />
                      <span className="truncate">{appointment.customer_name}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onStatusChange(appointment.id, "completed")}
                    className="flex-shrink-0 hover:bg-green-100 hover:text-green-600"
                    title="Marcar como concluído"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
