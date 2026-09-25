// @ts-nocheck
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, MapPin, User, Pencil, Trash2, ExternalLink } from "lucide-react";

export default function CRMAppointmentCalendar({
  appointments,
  selectedDate,
  onDateSelect,
  onEdit,
  onDelete,
}) {
  const [googleEvents, setGoogleEvents] = useState([]);
  const getAppointmentsForDate = (date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return appointments.filter((apt) => apt.date === dateStr);
  };

  const selectedDateAppointments = getAppointmentsForDate(selectedDate);

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "confirmed":
        return "bg-green-100 text-green-700 border-green-200";
      case "completed":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      case "no_show":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "text-red-600";
      case "high":
        return "text-orange-600";
      case "medium":
        return "text-blue-600";
      case "low":
        return "text-slate-600";
      default:
        return "text-slate-600";
    }
  };

  const modifiers = {
    hasAppointments: (date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      return appointments.some((apt) => apt.date === dateStr);
    },
  };

  const modifiersStyles = {
    hasAppointments: {
      fontWeight: "bold",
      textDecoration: "underline",
      textDecorationColor: "#8b5cf6",
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onDateSelect(date)}
          locale={ptBR}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          className="rounded-lg border shadow-sm"
        />
      </div>

      <div>
        <h3 className="font-semibold text-slate-900 mb-4">
          Agendamentos para {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
        </h3>

        {selectedDateAppointments.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <p className="text-slate-500">Nenhum agendamento nesta data</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {selectedDateAppointments
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((appointment) => (
                <Card key={appointment.id} className={`p-4 hover:shadow-md transition-shadow ${appointment.isGoogleEvent ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className={`w-4 h-4 ${appointment.isGoogleEvent ? 'text-blue-600' : getPriorityColor(appointment.priority)}`} />
                        <span className="font-semibold text-slate-900">
                          {appointment.time}
                        </span>
                        {appointment.isGoogleEvent ? (
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                            Google Calendar
                          </Badge>
                        ) : (
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-semibold text-slate-900 mb-1">
                        {appointment.title}
                      </h4>
                      <div className="space-y-1 text-sm text-slate-600">
                        {!appointment.isGoogleEvent && (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span>{appointment.customer_name}</span>
                          </div>
                        )}
                        {appointment.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>{appointment.location}</span>
                          </div>
                        )}
                        {!appointment.isGoogleEvent && (
                          <p className="text-slate-500">
                            Duração: {appointment.duration_minutes} minutos
                          </p>
                        )}
                        {appointment.description && (
                          <p className="text-slate-500 text-xs mt-1">{appointment.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {appointment.isGoogleEvent ? (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => window.open(appointment.htmlLink, '_blank')}
                          title="Abrir no Google Calendar"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onEdit(appointment)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onDelete(appointment.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
