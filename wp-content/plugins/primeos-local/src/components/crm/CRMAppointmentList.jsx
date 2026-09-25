// @ts-nocheck
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, User, MapPin, Pencil, Trash2 } from "lucide-react";

export default function CRMAppointmentList({
  appointments,
  onEdit,
  onDelete,
  onStatusChange,
}) {
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
        return "bg-red-50 border-l-4 border-l-red-500";
      case "high":
        return "bg-orange-50 border-l-4 border-l-orange-500";
      case "medium":
        return "bg-blue-50 border-l-4 border-l-blue-500";
      case "low":
        return "bg-slate-50 border-l-4 border-l-slate-500";
      default:
        return "bg-slate-50 border-l-4 border-l-slate-500";
    }
  };

  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateCompare = new Date(b.date) - new Date(a.date);
    if (dateCompare !== 0) return -dateCompare;
    return b.time.localeCompare(a.time);
  });

  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
      {sortedAppointments.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <p className="text-slate-500">Nenhum agendamento encontrado</p>
        </Card>
      ) : (
        sortedAppointments.map((appointment) => (
          <Card
            key={appointment.id}
            className={`p-4 hover:shadow-md transition-shadow ${getPriorityColor(
              appointment.priority
            )}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status}
                  </Badge>
                  {appointment.priority === "urgent" && (
                    <Badge className="bg-red-100 text-red-700">Urgente</Badge>
                  )}
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">
                  {appointment.title}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>
                      {format(new Date(appointment.date), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{appointment.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{appointment.customer_name}</span>
                  </div>
                  {appointment.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{appointment.location}</span>
                    </div>
                  )}
                </div>
                {appointment.description && (
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                    {appointment.description}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Select
                  value={appointment.status}
                  onValueChange={(value) => onStatusChange(appointment.id, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Agendado</SelectItem>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                    <SelectItem value="no_show">Não Compareceu</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
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
                </div>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
