// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, MessageCircle, CheckCircle, Clock, RefreshCw, 
  XCircle, Loader2, AlertTriangle, Phone, Mail, Zap
} from "lucide-react";
import { toast } from "sonner";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  pending:              { label: "Aguardando",   color: "bg-amber-100 text-amber-700", icon: Clock },
  confirmed:            { label: "Confirmado",   color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  reschedule_requested: { label: "Reagendamento",color: "bg-blue-100 text-blue-700",   icon: RefreshCw },
  cancelled:            { label: "Cancelado",    color: "bg-red-100 text-red-700",     icon: XCircle },
};

const buildReminderMsg = (apt, type = "default") => {
  const msgs = {
    default: `Olá ${apt.patient_name}! 🦷\n\nLembrete da Prime Odontologia:\n📅 Data: ${apt.date}\n⏰ Horário: ${apt.time}\n🩺 Serviço: ${apt.service_type}\n\nPor favor, confirme sua presença:\n✅ Responda *SIM* para confirmar\n🔄 Responda *REAGENDAR* para reagendar\n❌ Responda *CANCELAR* para cancelar`,
    confirm: `Olá ${apt.patient_name}! Confirmação recebida. ✅ Te aguardamos na Prime Odontologia em ${apt.date} às ${apt.time}. Até lá! 🦷`,
    reminder24h: `Olá ${apt.patient_name}! 🦷 Lembrete: sua consulta é AMANHÃ (${apt.date}) às ${apt.time} na Prime Odontologia. Até lá!`,
  };
  return msgs[type] || msgs.default;
};

export default function ReminderPanel() {
  const queryClient = useQueryClient();
  const [sending, setSending] = useState({});

  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: upcomingApts = [] } = useQuery({
    queryKey: ["upcomingApts"],
    queryFn: async () => {
      const apts = await primeos.entities.Appointment.list("-date");
      return apts.filter(a => (a.date === today || a.date === tomorrow) && a.status !== "cancelled" && a.status !== "completed");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.Appointment.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["upcomingApts"] }),
  });

  const sendWhatsApp = (apt, type = "default") => {
    const msg = buildReminderMsg(apt, type);
    const phone = apt.patient_phone?.replace(/\D/g, "");
    if (!phone) { toast.error("Paciente sem telefone cadastrado."); return; }
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`, "_blank");
    updateMutation.mutate({ id: apt.id, data: { ...apt, reminder_sent: true } });
    toast.success("Abrindo WhatsApp para envio do lembrete!");
  };

  const [sendingBulk, setSendingBulk] = useState(false);

  const sendBulkEmailReminders = async (day = 'tomorrow') => {
    setSendingBulk(true);
    try {
      const res = await primeos.functions.invoke('sendAppointmentReminder', { day });
      const d = res.data;
      if (d.success) {
        toast.success(`✅ Lembretes enviados: ${d.summary.sent} e-mails, ${d.summary.skipped} ignorados`);
        queryClient.invalidateQueries({ queryKey: ["upcomingApts"] });
      } else {
        toast.error("Erro ao enviar lembretes");
      }
    } catch {
      toast.error("Erro ao enviar lembretes");
    }
    setSendingBulk(false);
  };

  const sendBulkReminders = async () => {
    const toRemind = upcomingApts.filter(a => !a.reminder_sent && a.patient_phone);
    if (toRemind.length === 0) { toast.info("Nenhum lembrete pendente."); return; }
    for (const apt of toRemind) {
      sendWhatsApp(apt, apt.date === tomorrow ? "reminder24h" : "default");
      await new Promise(r => setTimeout(r, 500));
    }
  };

  const markConfirmed = (apt) => {
    updateMutation.mutate({ id: apt.id, data: { ...apt, reminder_confirmed: "confirmed", status: "confirmed" } });
    toast.success(`${apt.patient_name} confirmado!`);
  };

  const markReschedule = (apt) => {
    updateMutation.mutate({ id: apt.id, data: { ...apt, reminder_confirmed: "reschedule_requested" } });
    toast.info(`${apt.patient_name} solicitou reagendamento.`);
  };

  const todayApts = upcomingApts.filter(a => a.date === today);
  const tomorrowApts = upcomingApts.filter(a => a.date === tomorrow);

  const Section = ({ title, apts, accent }) => (
    <div>
      <div className={cn("flex items-center gap-2 mb-3 px-1 py-1.5 rounded-lg", accent)}>
        <Bell className="w-4 h-4" />
        <h4 className="font-semibold text-sm">{title}</h4>
        <Badge className="ml-auto bg-white/60 text-slate-700">{apts.length}</Badge>
      </div>
      <div className="space-y-3">
        {apts.map(apt => {
          const statusConf = STATUS_CONFIG[apt.reminder_confirmed || "pending"];
          const StatusIcon = statusConf.icon;
          return (
            <Card key={apt.id} className="border border-slate-100 shadow-none">
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{apt.patient_name}</p>
                    <p className="text-xs text-slate-500">{apt.time} · {apt.service_type} {apt.provider ? `· ${apt.provider}` : ""}</p>
                    {apt.patient_phone && (
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />{apt.patient_phone}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={cn("text-xs flex items-center gap-1", statusConf.color)}>
                      <StatusIcon className="w-3 h-3" />{statusConf.label}
                    </Badge>
                    {apt.reminder_sent && <Badge className="bg-slate-100 text-slate-500 text-xs">Lembrete enviado</Badge>}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => sendWhatsApp(apt)} className="text-xs h-7 text-green-600 border-green-200 hover:bg-green-50">
                    <MessageCircle className="w-3 h-3 mr-1" />WhatsApp
                  </Button>
                  {apt.reminder_confirmed !== "confirmed" && (
                    <Button size="sm" variant="outline" onClick={() => markConfirmed(apt)} className="text-xs h-7 text-emerald-600 border-emerald-200">
                      <CheckCircle className="w-3 h-3 mr-1" />Confirmar
                    </Button>
                  )}
                  {apt.reminder_confirmed !== "reschedule_requested" && (
                    <Button size="sm" variant="outline" onClick={() => markReschedule(apt)} className="text-xs h-7 text-blue-600 border-blue-200">
                      <RefreshCw className="w-3 h-3 mr-1" />Reagendar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {apts.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Nenhuma consulta</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-800">Lembretes de Consulta</h3>
          <p className="text-xs text-slate-500 mt-0.5">Gerencie confirmações e envie lembretes por e-mail ou WhatsApp</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => sendBulkEmailReminders('tomorrow')} disabled={sendingBulk} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
            {sendingBulk ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            E-mail: Amanhã
          </Button>
          <Button onClick={sendBulkReminders} variant="outline" className="border-green-300 text-green-700 hover:bg-green-50 gap-2">
            <MessageCircle className="w-4 h-4" />WhatsApp
          </Button>
          <div className="flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg px-2.5 py-1.5">
            <Zap className="w-3.5 h-3.5" />
            Auto: 18h diariamente
          </div>
        </div>
      </div>

      {upcomingApts.filter(a => !a.reminder_sent).length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2 text-amber-800 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {upcomingApts.filter(a => !a.reminder_sent).length} consulta(s) sem lembrete enviado
        </div>
      )}

      <Section title="Consultas de Hoje" apts={todayApts} accent="bg-rose-50 text-rose-700" />
      <Section title="Consultas de Amanhã" apts={tomorrowApts} accent="bg-blue-50 text-blue-700" />
    </div>
  );
}
