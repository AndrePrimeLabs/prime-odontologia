// @ts-nocheck
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, CheckCircle, X, Edit, Clock, User, Phone, Database, DollarSign } from "lucide-react";
import SmartReminderButton from "./SmartReminderButton";
import AIReschedulePanel from "./AIReschedulePanel";
import { cn } from "@/lib/utils";
import AppointmentPaymentPanel from "./AppointmentPaymentPanel";
import EHRModal from "./EHRModal";

const serviceTypes = {
  consultation: { label: "Consulta", color: "bg-blue-500" },
  follow_up: { label: "Retorno", color: "bg-green-500" },
  procedure: { label: "Procedimento", color: "bg-purple-500" },
  checkup: { label: "Check-up", color: "bg-teal-500" },
  emergency: { label: "Emergência", color: "bg-red-500" },
  therapy: { label: "Terapia", color: "bg-amber-500" },
  diagnostic: { label: "Diagnóstico", color: "bg-indigo-500" }
};

const statusColors = {
  scheduled: "bg-blue-100 text-blue-700",
  confirmed: "bg-green-100 text-green-700",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-slate-100 text-slate-700",
  cancelled: "bg-red-100 text-red-700",
  no_show: "bg-rose-100 text-rose-700"
};

const statusLabels = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  in_progress: "Em Andamento",
  completed: "Concluído",
  cancelled: "Cancelado",
  no_show: "Não Compareceu"
};

export default function AppointmentCard({ 
  appointment, 
  onEdit, 
  onStatusChange, 
  onWhatsApp,
  onCancel,
  compact = false 
}) {
  const [showEHR, setShowEHR] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const fmtBRL = (v) => `R$ ${Number(v || 0).toFixed(2).replace(".", ",")}`;
  const paymentColors = { paid: "bg-green-100 text-green-700", pending: "bg-amber-100 text-amber-700", waived: "bg-slate-100 text-slate-600", partial: "bg-blue-100 text-blue-700" };
  const openWhatsApp = () => {
    const cleanPhone = appointment.patient_phone?.replace(/\D/g, "") || "";
    const msg = `Olá ${appointment.patient_name}! 👋\n\nLembrando da sua consulta:\n📅 ${appointment.date}\n⏰ ${appointment.time}\n📋 ${serviceTypes[appointment.service_type]?.label}\n\nConfirma presença? ✅`;
    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (compact) {
    return (
      <div
        className={cn(
          "p-2 rounded-lg border-l-4 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer",
          serviceTypes[appointment.service_type]?.color.replace("bg-", "border-")
        )}
        onClick={() => onEdit(appointment)}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{appointment.patient_name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-500">{appointment.time}</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">{appointment.duration_minutes}min</span>
            </div>
          </div>
          <Badge className={cn("text-xs", statusColors[appointment.status])}>
            {statusLabels[appointment.status]}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-4 rounded-lg border-l-4 bg-white shadow-sm",
        serviceTypes[appointment.service_type]?.color.replace("bg-", "border-")
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-slate-400" />
            <p className="font-semibold text-slate-900">{appointment.patient_name}</p>
          </div>
          
          <div className="space-y-1.5 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{appointment.time} - {appointment.duration_minutes} minutos</span>
            </div>
            
            {appointment.patient_phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{appointment.patient_phone}</span>
              </div>
            )}
            
            {appointment.provider && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <span>Dr(a). {appointment.provider}</span>
              </div>
            )}
          </div>
        </div>

        <Badge className={cn("text-xs", statusColors[appointment.status])}>
          {statusLabels[appointment.status]}
        </Badge>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Badge variant="outline" className="text-xs">
          {serviceTypes[appointment.service_type]?.label}
        </Badge>
      </div>

      {appointment.notes && (
        <p className="text-sm text-slate-600 mb-3 italic">{appointment.notes}</p>
      )}

      {/* Payment badge */}
      {appointment.price > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <Badge className={`text-xs ${paymentColors[appointment.payment_status || "pending"]}`}>
            {appointment.payment_status === "paid" ? "✓ Pago" : appointment.payment_status === "waived" ? "Isento" : appointment.payment_status === "partial" ? "Parcial" : "Pendente"}
          </Badge>
          <span className="text-xs text-slate-500">{fmtBRL(appointment.price)}</span>
        </div>
      )}

      {showPayment && (
        <div className="mb-3">
          <AppointmentPaymentPanel appointment={appointment} onUpdated={() => setShowPayment(false)} />
        </div>
      )}

      <AIReschedulePanel appointment={appointment} onSelectSlot={(date, time) => onEdit({ ...appointment, date, time })} />

      <div className="flex items-center gap-2 pt-3 border-t flex-wrap">
        {appointment.patient_id && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setShowEHR(true)}
            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
          >
            <Database className="w-4 h-4 mr-1" />
            Prontuário
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowPayment(p => !p)}
          className="text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          <DollarSign className="w-4 h-4 mr-1" />
          Pagto
        </Button>
        
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => onEdit(appointment)}
          className="flex-1"
        >
          <Edit className="w-4 h-4 mr-1" />
          Editar
        </Button>
        
        {appointment.patient_phone && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={openWhatsApp}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            WhatsApp
          </Button>
        )}

        <SmartReminderButton appointment={appointment} />
        
        {appointment.status === "scheduled" && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onStatusChange(appointment.id, "confirmed")}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Confirmar
          </Button>
        )}
        
        {appointment.status !== "cancelled" && appointment.status !== "completed" && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onCancel(appointment)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <EHRModal
        open={showEHR}
        onClose={() => setShowEHR(false)}
        appointment={appointment}
        patientId={appointment.patient_id}
        patientName={appointment.patient_name}
      />
    </div>
  );
}
