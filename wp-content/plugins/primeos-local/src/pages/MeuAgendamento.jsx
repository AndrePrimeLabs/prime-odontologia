// @ts-nocheck
import { useState, useEffect } from "react";
import { primeos } from "@/api/primeosClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarIcon, Clock, User, Stethoscope, CheckCircle2,
  XCircle, RefreshCw, Loader2, AlertCircle, ChevronLeft,
  MapPin, Phone
} from "lucide-react";
import AvailabilityCalendar from "@/components/booking/AvailabilityCalendar";
import TimeSlotPicker from "@/components/booking/TimeSlotPicker";
import { useQuery } from "@tanstack/react-query";

const CANCEL_MIN_HOURS = 24;
const RESCHEDULE_MIN_HOURS = 4;

function hoursUntil(date, time) {
  const dt = new Date(`${date}T${time}:00`);
  return (dt - new Date()) / (1000 * 60 * 60);
}

function formatDate(dateStr) {
  return new Date(dateStr + "T12:00").toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });
}

export default function MeuAgendamento() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  const [view, setView] = useState("loading"); // loading | detail | reschedule_date | reschedule_time | done_cancel | done_reschedule | error | no_token
  const [appointment, setAppointment] = useState(null);
  const [policy, setPolicy] = useState({ cancel_min_hours: 24, reschedule_min_hours: 4 });
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmAction, setConfirmAction] = useState(null); // 'cancel' | null
  const [processing, setProcessing] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const { data: appointments = [] } = useQuery({
    queryKey: ["appts_reschedule", newDate],
    queryFn: () => newDate ? primeos.entities.Appointment.filter({ date: newDate }) : [],
    enabled: !!newDate,
  });

  useEffect(() => {
    if (!token) { setView("no_token"); return; }
    loadAppointment();
  }, [token]);

  const loadAppointment = async () => {
    setView("loading");
    const res = await primeos.functions.invoke("manageAppointment", { action: "get", token });
    if (res.data?.success) {
      setAppointment(res.data.appointment);
      setPolicy(res.data.policy);
      setView("detail");
    } else {
      setErrorMsg(res.data?.error || "Agendamento não encontrado.");
      setView("error");
    }
  };

  const handleCancel = async () => {
    setProcessing(true);
    const res = await primeos.functions.invoke("manageAppointment", { action: "cancel", token });
    setProcessing(false);
    if (res.data?.success) {
      setView("done_cancel");
    } else {
      setErrorMsg(res.data?.error || "Erro ao cancelar.");
      setConfirmAction(null);
    }
  };

  const handleReschedule = async () => {
    setProcessing(true);
    const res = await primeos.functions.invoke("manageAppointment", {
      action: "reschedule", token, new_date: newDate, new_time: newTime
    });
    setProcessing(false);
    if (res.data?.success) {
      setAppointment(a => ({ ...a, date: newDate, time: newTime }));
      setView("done_reschedule");
    } else {
      setErrorMsg(res.data?.error || "Erro ao reagendar.");
    }
  };

  const hrs = appointment ? hoursUntil(appointment.date, appointment.time) : 999;
  const canCancel = hrs >= CANCEL_MIN_HOURS;
  const canReschedule = hrs >= RESCHEDULE_MIN_HOURS;

  const statusColor = {
    scheduled: "bg-blue-100 text-blue-700",
    confirmed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
    completed: "bg-slate-100 text-slate-700",
    in_progress: "bg-amber-100 text-amber-700",
  };
  const statusLabel = {
    scheduled: "Agendado",
    confirmed: "Confirmado",
    cancelled: "Cancelado",
    completed: "Concluído",
    in_progress: "Em atendimento",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <div className="max-w-lg mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white border border-indigo-100 rounded-full px-4 py-1.5 mb-4 shadow-sm">
            <Stethoscope className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700">Prime Odontologia</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Meu Agendamento</h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie sua consulta de forma rápida</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={view} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.22 }}>

            {/* Loading */}
            {view === "loading" && (
              <Card className="shadow-xl border-0">
                <CardContent className="p-10 flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                  <p className="text-slate-500">Carregando seu agendamento...</p>
                </CardContent>
              </Card>
            )}

            {/* No token */}
            {view === "no_token" && (
              <Card className="shadow-xl border-0">
                <CardContent className="p-8 text-center space-y-4">
                  <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
                  <h2 className="text-lg font-bold text-slate-800">Link inválido</h2>
                  <p className="text-slate-500 text-sm">Use o link enviado no seu email de confirmação para acessar esta página.</p>
                  <a href="/online-booking" className="inline-block">
                    <Button className="bg-indigo-600 hover:bg-indigo-700">Novo Agendamento</Button>
                  </a>
                </CardContent>
              </Card>
            )}

            {/* Error */}
            {view === "error" && (
              <Card className="shadow-xl border-0">
                <CardContent className="p-8 text-center space-y-4">
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
                  <h2 className="text-lg font-bold text-slate-800">Ops!</h2>
                  <p className="text-slate-500 text-sm">{errorMsg}</p>
                  <Button variant="outline" onClick={loadAppointment}>Tentar novamente</Button>
                </CardContent>
              </Card>
            )}

            {/* Appointment Detail */}
            {view === "detail" && appointment && (
              <Card className="shadow-xl border-0">
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">{appointment.patient_name}</h2>
                      <p className="text-slate-400 text-xs mt-0.5">ID: {appointment.id.slice(0, 8)}...</p>
                    </div>
                    <Badge className={statusColor[appointment.status] || "bg-slate-100 text-slate-700"}>
                      {statusLabel[appointment.status] || appointment.status}
                    </Badge>
                  </div>

                  {/* Details */}
                  <div className="bg-slate-50 rounded-xl p-4 space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400">Data</p>
                        <p className="font-semibold text-slate-800">{formatDate(appointment.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400">Horário</p>
                        <p className="font-semibold text-slate-800">{appointment.time} · {appointment.duration_minutes} min</p>
                      </div>
                    </div>
                    {appointment.provider && (
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-slate-400">Profissional</p>
                          <p className="font-semibold text-slate-800">{appointment.provider}</p>
                        </div>
                      </div>
                    )}
                    {appointment.resource_name && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-slate-400">Local</p>
                          <p className="font-semibold text-slate-800">{appointment.resource_name}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Policy info */}
                  {appointment.status === "scheduled" || appointment.status === "confirmed" ? (
                    <>
                      {(!canCancel || !canReschedule) && (
                        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>
                            {!canReschedule ? `Reagendamentos devem ser feitos com pelo menos ${policy.reschedule_min_hours}h de antecedência.` : ''}
                            {!canReschedule && !canCancel ? ' ' : ''}
                            {!canCancel ? `Cancelamentos com pelo menos ${policy.cancel_min_hours}h. Ligue para a clínica.` : ''}
                          </span>
                        </div>
                      )}

                      {errorMsg && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          {errorMsg}
                        </div>
                      )}

                      {/* Confirm cancel modal */}
                      {confirmAction === "cancel" ? (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                          <p className="text-sm font-semibold text-red-800">Confirmar cancelamento?</p>
                          <p className="text-xs text-red-600">Esta ação não pode ser desfeita. O horário será liberado automaticamente.</p>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setConfirmAction(null)} className="flex-1">Não, voltar</Button>
                            <Button size="sm" onClick={handleCancel} disabled={processing} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                              {processing ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                              Sim, cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button
                            variant="outline"
                            onClick={() => { setErrorMsg(""); setConfirmAction("cancel"); }}
                            disabled={!canCancel}
                            className="flex-1 border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancelar consulta
                          </Button>
                          <Button
                            onClick={() => { setErrorMsg(""); setView("reschedule_date"); }}
                            disabled={!canReschedule}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reagendar
                          </Button>
                        </div>
                      )}

                      <div className="text-center">
                        <a href="tel:+55" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600">
                          <Phone className="w-3 h-3" />
                          Precisa de ajuda? Ligue para a clínica
                        </a>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <p className="text-slate-400 text-sm">Este agendamento não pode ser alterado.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Reschedule - Pick date */}
            {view === "reschedule_date" && (
              <Card className="shadow-xl border-0">
                <CardContent className="p-6 sm:p-8 space-y-4">
                  <Button variant="ghost" size="sm" onClick={() => setView("detail")} className="text-slate-500 -ml-2">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
                  </Button>
                  <h2 className="text-lg font-bold text-slate-900">Escolha a nova data</h2>
                  <AvailabilityCalendar
                    onDateSelect={(d) => { setNewDate(d); setView("reschedule_time"); }}
                    onBack={() => setView("detail")}
                  />
                </CardContent>
              </Card>
            )}

            {/* Reschedule - Pick time */}
            {view === "reschedule_time" && appointment && (
              <Card className="shadow-xl border-0">
                <CardContent className="p-6 sm:p-8">
                  <Button variant="ghost" size="sm" onClick={() => setView("reschedule_date")} className="text-slate-500 -ml-2 mb-2">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
                  </Button>
                  <TimeSlotPicker
                    date={newDate}
                    duration={appointment.duration_minutes}
                    existingAppointments={appointments.filter(a => a.id !== appointment.id && a.status !== "cancelled")}
                    dentist={null}
                    blockouts={[]}
                    onTimeSelect={(t) => { setNewTime(t); }}
                    onBack={() => setView("reschedule_date")}
                  />
                  {newTime && (
                    <div className="mt-4 space-y-3">
                      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-sm flex items-center gap-3">
                        <Clock className="w-4 h-4 text-indigo-500" />
                        <span>Novo horário: <strong>{new Date(newDate + "T12:00").toLocaleDateString("pt-BR")} às {newTime}</strong></span>
                      </div>
                      {errorMsg && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          {errorMsg}
                        </div>
                      )}
                      <Button onClick={handleReschedule} disabled={processing} className="w-full bg-indigo-600 hover:bg-indigo-700">
                        {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                        Confirmar Reagendamento
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Done Cancel */}
            {view === "done_cancel" && (
              <Card className="shadow-xl border-0">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Consulta Cancelada</h2>
                  <p className="text-slate-500 text-sm">Seu agendamento foi cancelado e o horário foi liberado automaticamente. A clínica foi notificada.</p>
                  <Button variant="outline" onClick={() => window.location.href = "/OnlineBooking"} className="w-full">
                    Fazer novo agendamento
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Done Reschedule */}
            {view === "done_reschedule" && appointment && (
              <Card className="shadow-xl border-0">
                <CardContent className="p-8 text-center space-y-5">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Reagendado com Sucesso!</h2>
                  <div className="bg-slate-50 rounded-xl p-4 text-sm text-left space-y-2">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-indigo-500" />
                      <span className="font-semibold">{formatDate(appointment.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-500" />
                      <span className="font-semibold">{appointment.time} · {appointment.duration_minutes} min</span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-xs">A clínica foi notificada sobre o reagendamento.</p>
                </CardContent>
              </Card>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
