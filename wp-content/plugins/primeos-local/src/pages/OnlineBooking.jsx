// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { primeos } from "@/api/primeosClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon, Clock, User, CheckCircle2,
  Loader2, AlertCircle, ChevronRight, Stethoscope
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AvailabilityCalendar from "@/components/booking/AvailabilityCalendar";
import ServiceSelection from "@/components/booking/ServiceSelection";
import TimeSlotPicker from "@/components/booking/TimeSlotPicker";
import DentistPicker from "@/components/booking/DentistPicker";
import ResourcePicker from "@/components/booking/ResourcePicker";
import { cn } from "@/lib/utils";

const STEPS = ["service", "dentist", "date", "time", "resource", "info", "confirm"];
const STEP_LABELS = {
  service: "Motivo", dentist: "Profissional", date: "Data",
  time: "Horário", resource: "Local", info: "Dados", confirm: "Confirmado"
};

export default function OnlineBooking() {
  const [step, setStep] = useState("service");
  const [booking, setBooking] = useState({
    service_type: "", reason: "", date: "", time: "", duration_minutes: 30,
    dentist_id: "", provider: "", resource_id: "", resource_name: "",
    patient_name: "", patient_phone: "", patient_email: "", notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [confirmedId, setConfirmedId] = useState(null);
  const [error, setError] = useState("");

  const { data: dentists = [] } = useQuery({
    queryKey: ["dentists_active"],
    queryFn: () => primeos.entities.Dentist.filter({ is_active: true }),
  });

  const { data: resources = [] } = useQuery({
    queryKey: ["resources_active"],
    queryFn: () => primeos.entities.Resource.filter({ is_active: true }),
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments_date", booking.date],
    queryFn: () => booking.date
      ? primeos.entities.Appointment.filter({ date: booking.date })
      : [],
    enabled: !!booking.date,
  });

  const { data: blockouts = [] } = useQuery({
    queryKey: ["blockouts_date", booking.date],
    queryFn: () => booking.date
      ? primeos.entities.DentistBlockout.filter({ date: booking.date })
      : [],
    enabled: !!booking.date,
  });

  const selectedDentist = dentists.find(d => d.id === booking.dentist_id) || null;

  // Filter appointments for selected dentist (or all if none selected)
  const relevantAppointments = appointments.filter(a => {
    if (a.status === "cancelled") return false;
    if (!booking.dentist_id) return true;
    return !a.dentist_id || a.dentist_id === booking.dentist_id;
  });

  const back = () => {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  };

  const handleServiceSelect = (svc) => {
    setBooking(b => ({ ...b, service_type: svc.type, reason: svc.reason, duration_minutes: svc.duration }));
    setStep("dentist");
  };

  const handleDentistSelect = (dentistId, providerName) => {
    setBooking(b => ({ ...b, dentist_id: dentistId || "", provider: providerName || "" }));
  };

  const handleResourceSelect = (resourceId, resourceName) => {
    setBooking(b => ({ ...b, resource_id: resourceId || "", resource_name: resourceName || "" }));
  };

  const handleSubmit = async () => {
    setError("");
    if (!booking.patient_name || !booking.patient_phone) {
      setError("Por favor, preencha nome e telefone.");
      return;
    }
    setSubmitting(true);
    const res = await primeos.functions.invoke("processOnlineBooking", booking);
    if (res.data?.success) {
      setConfirmedId(res.data.appointment_id);
      setSuccess(true);
      setStep("confirm");
    } else {
      setError(res.data?.error || "Erro ao processar agendamento.");
    }
    setSubmitting(false);
  };

  const reset = () => {
    setBooking({ service_type:"",reason:"",date:"",time:"",duration_minutes:30,dentist_id:"",provider:"",resource_id:"",resource_name:"",patient_name:"",patient_phone:"",patient_email:"",notes:"" });
    setStep("service"); setSuccess(false); setError("");
  };

  const stepsForProgress = STEPS.slice(0, -1); // exclude confirm
  const stepIdx = STEPS.indexOf(step);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-white border border-indigo-100 rounded-full px-4 py-1.5 mb-4 shadow-sm">
            <Stethoscope className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700">Prime Odontologia</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Agendamento Online</h1>
          <p className="text-slate-500 mt-1">Agende sua consulta de forma rápida e fácil</p>
        </div>

        {/* Progress */}
        {step !== "confirm" && (
          <div className="flex items-center justify-center gap-1 mb-6 flex-wrap">
            {stepsForProgress.map((s, i) => {
              const idx = STEPS.indexOf(s);
              const done = stepIdx > idx;
              const active = step === s;
              return (
                <div key={s} className="flex items-center gap-1">
                  <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all",
                    active && "bg-indigo-600 text-white",
                    done && "bg-indigo-100 text-indigo-700",
                    !active && !done && "bg-slate-100 text-slate-400"
                  )}>
                    {done ? <CheckCircle2 className="w-3 h-3" /> : <span>{i + 1}</span>}
                    {STEP_LABELS[s]}
                  </div>
                  {i < stepsForProgress.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-slate-300" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="shadow-xl border-0">
              <CardContent className="p-6 sm:p-8">

                {step === "service" && (
                  <ServiceSelection onSelect={handleServiceSelect} />
                )}

                {step === "dentist" && (
                  <div className="space-y-6">
                    <DentistPicker
                      dentists={dentists}
                      selectedId={booking.dentist_id}
                      date={booking.date}
                      blockouts={blockouts}
                      onChange={handleDentistSelect}
                    />
                    {resources.filter(r => r.type === "cadeira" || r.type === "sala").length > 0 && (
                      <ResourcePicker
                        resources={resources}
                        selectedId={booking.resource_id}
                        date={booking.date}
                        appointments={appointments}
                        onChange={handleResourceSelect}
                      />
                    )}
                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" onClick={back} className="flex-1">← Voltar</Button>
                      <Button onClick={() => setStep("date")} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                        Escolher Data →
                      </Button>
                    </div>
                  </div>
                )}

                {step === "date" && (
                  <AvailabilityCalendar
                    onDateSelect={(date) => { setBooking(b => ({ ...b, date })); setStep("time"); }}
                    onBack={back}
                  />
                )}

                {step === "time" && (
                  <TimeSlotPicker
                    date={booking.date}
                    duration={booking.duration_minutes}
                    existingAppointments={relevantAppointments}
                    dentist={selectedDentist}
                    blockouts={blockouts}
                    onTimeSelect={(time) => { setBooking(b => ({ ...b, time })); setStep("resource"); }}
                    onBack={back}
                  />
                )}

                {step === "resource" && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-xl font-bold text-slate-900">Cadeira / Sala</h2>
                      <p className="text-slate-500 text-sm mt-1">Deseja reservar um local específico?</p>
                    </div>

                    {/* Booking summary so far */}
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-indigo-500" />
                        <div>
                          <p className="text-xs text-indigo-400">Data</p>
                          <p className="font-semibold text-indigo-800">{new Date(booking.date + "T12:00").toLocaleDateString("pt-BR")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-indigo-500" />
                        <div>
                          <p className="text-xs text-indigo-400">Horário</p>
                          <p className="font-semibold text-indigo-800">{booking.time} · {booking.duration_minutes}min</p>
                        </div>
                      </div>
                      {booking.provider && (
                        <div className="flex items-center gap-2 col-span-2">
                          <User className="w-4 h-4 text-indigo-500" />
                          <div>
                            <p className="text-xs text-indigo-400">Profissional</p>
                            <p className="font-semibold text-indigo-800">{booking.provider}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <ResourcePicker
                      resources={resources}
                      selectedId={booking.resource_id}
                      date={booking.date}
                      appointments={appointments}
                      slotTime={booking.time}
                      duration={booking.duration_minutes}
                      onChange={handleResourceSelect}
                    />

                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" onClick={back} className="flex-1">← Voltar</Button>
                      <Button onClick={() => setStep("info")} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                        Continuar →
                      </Button>
                    </div>
                  </div>
                )}

                {step === "info" && (
                  <div className="space-y-5">
                    <h2 className="text-xl font-bold text-slate-900 text-center">Seus Dados</h2>

                    {/* Summary */}
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
                      {booking.reason && (
                        <div className="flex items-center gap-2 col-span-2">
                          <Stethoscope className="w-4 h-4 text-indigo-500" />
                          <div>
                            <p className="text-xs text-indigo-400">Motivo</p>
                            <p className="font-semibold text-indigo-800">{booking.reason}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-indigo-500" />
                        <div>
                          <p className="text-xs text-indigo-400">Data</p>
                          <p className="font-semibold text-indigo-800">
                            {booking.date ? new Date(booking.date + "T12:00").toLocaleDateString("pt-BR") : "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-indigo-500" />
                        <div>
                          <p className="text-xs text-indigo-400">Horário</p>
                          <p className="font-semibold text-indigo-800">{booking.time || "—"} · {booking.duration_minutes}min</p>
                        </div>
                      </div>
                      {booking.provider && (
                        <div className="flex items-center gap-2 col-span-2">
                          <User className="w-4 h-4 text-indigo-500" />
                          <div>
                            <p className="text-xs text-indigo-400">Profissional</p>
                            <p className="font-semibold text-indigo-800">{booking.provider}</p>
                          </div>
                        </div>
                      )}
                      {booking.resource_name && (
                        <div className="flex items-center gap-2 col-span-2">
                          <Badge className="bg-indigo-100 text-indigo-700 border-0 text-xs">{booking.resource_name}</Badge>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Nome Completo *</Label>
                        <Input value={booking.patient_name} onChange={e => setBooking(b => ({ ...b, patient_name: e.target.value }))} placeholder="Seu nome completo" className="mt-1" />
                      </div>
                      <div>
                        <Label>WhatsApp *</Label>
                        <Input type="tel" value={booking.patient_phone} onChange={e => setBooking(b => ({ ...b, patient_phone: e.target.value }))} placeholder="(00) 00000-0000" className="mt-1" />
                      </div>
                      <div>
                        <Label>Email <span className="text-slate-400 text-xs">(para confirmação)</span></Label>
                        <Input type="email" value={booking.patient_email} onChange={e => setBooking(b => ({ ...b, patient_email: e.target.value }))} placeholder="seu@email.com" className="mt-1" />
                      </div>
                      <div>
                        <Label>Observações</Label>
                        <Textarea value={booking.notes} onChange={e => setBooking(b => ({ ...b, notes: e.target.value }))} placeholder="Alguma informação relevante..." rows={3} className="mt-1" />
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        {error}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={back} disabled={submitting} className="flex-1">← Voltar</Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={submitting || !booking.patient_name || !booking.patient_phone}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                      >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                        Confirmar
                      </Button>
                    </div>
                  </div>
                )}

                {step === "confirm" && success && (
                  <div className="text-center py-6">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                      <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Agendamento Confirmado!</h2>
                    <p className="text-slate-500 mb-6 max-w-sm mx-auto text-sm">
                      Você receberá uma confirmação por email em breve. Enviaremos um lembrete 1 dia antes.
                    </p>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left space-y-3 mb-6 text-sm max-w-sm mx-auto">
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                        <div><p className="text-xs text-slate-400">Data</p><p className="font-semibold">{new Date(booking.date + "T12:00").toLocaleDateString("pt-BR", { weekday:"long",day:"numeric",month:"long" })}</p></div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                        <div><p className="text-xs text-slate-400">Horário</p><p className="font-semibold">{booking.time} · {booking.duration_minutes} min</p></div>
                      </div>
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                        <div><p className="text-xs text-slate-400">Paciente</p><p className="font-semibold">{booking.patient_name}</p></div>
                      </div>
                      {booking.provider && (
                        <div className="flex items-center gap-3">
                          <Stethoscope className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                          <div><p className="text-xs text-slate-400">Profissional</p><p className="font-semibold">{booking.provider}</p></div>
                        </div>
                      )}
                      {booking.resource_name && (
                        <div className="flex items-center gap-3">
                          <Badge className="bg-indigo-100 text-indigo-700 border-0 text-xs">{booking.resource_name}</Badge>
                        </div>
                      )}
                    </div>
                    <Button onClick={reset} className="bg-indigo-600 hover:bg-indigo-700">
                      Novo Agendamento
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
