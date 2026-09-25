// @ts-nocheck
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { primeos } from "@/api/primeosClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  User, Heart, Calendar, FileText, CheckCircle,
  ArrowRight, ArrowLeft, Sparkles, Loader2, ExternalLink,
  Shield, AlertCircle, Clock, Stethoscope
} from "lucide-react";
import { toast } from "sonner";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "welcome",   label: "Boas-vindas",    icon: Heart,       color: "text-rose-500" },
  { id: "contact",   label: "Dados Pessoais", icon: User,        color: "text-blue-500" },
  { id: "health",    label: "Saúde",          icon: Stethoscope, color: "text-indigo-500" },
  { id: "schedule",  label: "Agendamento",    icon: Calendar,    color: "text-emerald-500" },
  { id: "documents", label: "Documentos",     icon: FileText,    color: "text-amber-500" },
  { id: "done",      label: "Concluído",      icon: CheckCircle, color: "text-green-500" },
];

const DOCS = [
  { name: "Política de Privacidade", desc: "Como tratamos seus dados pessoais e de saúde.", url: "#privacy", icon: Shield },
  { name: "Termo de Consentimento", desc: "Autorização para procedimentos odontológicos.", url: "#consent", icon: FileText },
  { name: "Regulamento Interno", desc: "Normas e funcionamento da clínica.", url: "#rules", icon: AlertCircle },
];

const AVAILABLE_TIMES = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];
const SERVICES = [
  { value: "consultation", label: "Consulta Avaliação" },
  { value: "checkup", label: "Check-up Preventivo" },
  { value: "procedure", label: "Procedimento" },
];

const emptyContact = { patient_name: "", patient_phone: "", patient_email: "", date_of_birth: "" };
const emptyHealth = { blood_type: "Não informado", medical_conditions: [], allergies_text: "", current_medications_text: "", notes: "" };
const emptySchedule = { date: "", time: "", service_type: "consultation", provider: "" };

export default function PatientOnboardingWizard({ onComplete, onClose }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [contact, setContact] = useState(emptyContact);
  const [health, setHealth] = useState(emptyHealth);
  const [schedule, setSchedule] = useState(emptySchedule);
  const [acceptedDocs, setAcceptedDocs] = useState([]);
  const [createdPatient, setCreatedPatient] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  const createPatientMutation = useMutation({
    mutationFn: async (data) => {
      const patient = await primeos.entities.PatientRecord.create(data);
      return patient;
    },
    onSuccess: (patient) => {
      setCreatedPatient(patient);
      queryClient.invalidateQueries({ queryKey: ["patientRecords"] });
    },
    onError: () => toast.error("Erro ao salvar paciente.")
  });

  const createAppointmentMutation = useMutation({
    mutationFn: (data) => primeos.entities.Appointment.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });

  const getAISuggestion = async () => {
    setLoadingAI(true);
    const result = await primeos.integrations.Core.InvokeLLM({
      prompt: `Você é um assistente de triagem odontológica da Prime Odontologia.
Com base nas informações abaixo, sugira o serviço mais adequado para a primeira consulta e um horário conveniente.

Nome: ${contact.patient_name}
Condições médicas: ${health.medical_conditions.join(", ") || "Nenhuma informada"}
Alergias: ${health.allergies_text || "Nenhuma"}
Medicamentos: ${health.current_medications_text || "Nenhum"}
Observações: ${health.notes || ""}

Responda de forma amigável, em 2-3 frases curtas, sugerindo o tipo de consulta e qualquer precaução importante.`,
      response_json_schema: {
        type: "object",
        properties: { suggestion: { type: "string" } }
      }
    });
    setAiSuggestion(result.suggestion || "");
    setLoadingAI(false);
  };

  const handleSaveAndSchedule = async () => {
    // 1. Create patient record
    const allergiesArr = health.allergies_text
      ? health.allergies_text.split(",").map(a => ({ allergen: a.trim(), severity: "leve", reaction: "" }))
      : [];
    const medsArr = health.current_medications_text
      ? health.current_medications_text.split(",").map(m => ({ name: m.trim(), dosage: "", frequency: "" }))
      : [];

    const patientData = {
      patient_name: contact.patient_name,
      patient_phone: contact.patient_phone,
      patient_email: contact.patient_email,
      date_of_birth: contact.date_of_birth,
      blood_type: health.blood_type,
      medical_conditions: health.medical_conditions,
      allergies: allergiesArr,
      current_medications: medsArr,
      notes: health.notes,
      status: "ativo",
      consents: acceptedDocs.map(d => ({ type: d, date_signed: format(new Date(), "yyyy-MM-dd"), document_url: "#" })),
    };

    const patient = await createPatientMutation.mutateAsync(patientData);

    // 2. Create appointment if scheduled
    if (schedule.date && schedule.time) {
      await createAppointmentMutation.mutateAsync({
        patient_id: patient.id,
        patient_name: contact.patient_name,
        patient_phone: contact.patient_phone,
        service_type: schedule.service_type,
        date: schedule.date,
        time: schedule.time,
        provider: schedule.provider || "A definir",
        status: "scheduled",
        notes: aiSuggestion ? `Triagem IA: ${aiSuggestion}` : "",
      });
    }

    setStep(5);
  };

  const progress = (step / (STEPS.length - 1)) * 100;
  const currentStep = STEPS[step];

  const canProceedContact = contact.patient_name.trim() && contact.patient_phone.trim();
  const canProceedSchedule = schedule.date && schedule.time;
  const canProceedDocs = acceptedDocs.length === DOCS.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6" />
              <h2 className="text-xl font-bold">Cadastro de Novo Paciente</h2>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white text-xl leading-none">×</button>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-1 mb-3">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  i < step ? "bg-white text-indigo-600" :
                  i === step ? "bg-white/30 border-2 border-white text-white" :
                  "bg-white/10 text-white/40"
                )}>
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn("h-0.5 w-6 mx-0.5", i < step ? "bg-white" : "bg-white/20")} />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-1.5 bg-white/20 [&>div]:bg-white" />
          <p className="text-white/80 text-sm mt-2">{currentStep.label}</p>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <AnimatePresence mode="wait">

            {/* STEP 0: Welcome */}
            {step === 0 && (
              <motion.div key="welcome" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="text-center py-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Heart className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Bem-vindo à Prime Odontologia!</h3>
                  <p className="text-slate-500 max-w-md mx-auto">
                    Vamos guiá-lo em algumas etapas simples para completar seu cadastro e agendar sua primeira consulta.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { icon: User, label: "Dados Pessoais", color: "bg-blue-50 text-blue-600" },
                    { icon: Stethoscope, label: "Histórico de Saúde", color: "bg-indigo-50 text-indigo-600" },
                    { icon: Calendar, label: "1ª Consulta", color: "bg-emerald-50 text-emerald-600" },
                  ].map((item, i) => (
                    <div key={i} className="text-center p-4 bg-slate-50 rounded-xl">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2", item.color)}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-medium text-slate-700">{item.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400 text-center">⏱ Leva apenas 3-5 minutos. Suas informações são protegidas e criptografadas.</p>
              </motion.div>
            )}

            {/* STEP 1: Contact */}
            {step === 1 && (
              <motion.div key="contact" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-slate-900">Dados Pessoais e Contato</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label>Nome Completo *</Label>
                    <Input value={contact.patient_name} onChange={e => setContact(c => ({ ...c, patient_name: e.target.value }))} placeholder="Seu nome completo" />
                  </div>
                  <div>
                    <Label>Telefone / WhatsApp *</Label>
                    <Input value={contact.patient_phone} onChange={e => setContact(c => ({ ...c, patient_phone: e.target.value }))} placeholder="(11) 99999-9999" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={contact.patient_email} onChange={e => setContact(c => ({ ...c, patient_email: e.target.value }))} placeholder="email@exemplo.com" />
                  </div>
                  <div>
                    <Label>Data de Nascimento</Label>
                    <Input type="date" value={contact.date_of_birth} onChange={e => setContact(c => ({ ...c, date_of_birth: e.target.value }))} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Health */}
            {step === 2 && (
              <motion.div key="health" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Stethoscope className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-semibold text-slate-900">Histórico de Saúde Básico</h3>
                </div>
                <div>
                  <Label>Tipo Sanguíneo</Label>
                  <Select value={health.blood_type} onValueChange={v => setHealth(h => ({ ...h, blood_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["A+","A-","B+","B-","AB+","AB-","O+","O-","Não informado"].map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Condições Médicas</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {["Diabetes","Hipertensão","Cardiopatia","Gravidez","Coagulopatia","Asma","Nenhuma"].map(cond => (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => setHealth(h => ({
                          ...h,
                          medical_conditions: h.medical_conditions.includes(cond)
                            ? h.medical_conditions.filter(c => c !== cond)
                            : [...h.medical_conditions, cond]
                        }))}
                        className={cn(
                          "px-3 py-1 rounded-full text-sm border transition-all",
                          health.medical_conditions.includes(cond)
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-slate-600 border-slate-300 hover:border-indigo-400"
                        )}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Alergias (separe por vírgula)</Label>
                  <Input value={health.allergies_text} onChange={e => setHealth(h => ({ ...h, allergies_text: e.target.value }))} placeholder="Ex: Penicilina, látex, dipirona" />
                </div>
                <div>
                  <Label>Medicamentos em uso (separe por vírgula)</Label>
                  <Input value={health.current_medications_text} onChange={e => setHealth(h => ({ ...h, current_medications_text: e.target.value }))} placeholder="Ex: Losartana, metformina" />
                </div>
                <div>
                  <Label>Observações adicionais</Label>
                  <Textarea value={health.notes} onChange={e => setHealth(h => ({ ...h, notes: e.target.value }))} rows={2} placeholder="Alguma informação relevante para a equipe..." />
                </div>
              </motion.div>
            )}

            {/* STEP 3: Schedule */}
            {step === 3 && (
              <motion.div key="schedule" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-semibold text-slate-900">Agende sua 1ª Consulta</h3>
                </div>

                {/* AI suggestion */}
                {!aiSuggestion && !loadingAI && (
                  <button
                    onClick={getAISuggestion}
                    className="w-full p-3 rounded-xl border-2 border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50 transition-all flex items-center gap-2 text-sm font-medium"
                  >
                    <Sparkles className="w-4 h-4" />
                    Obter sugestão de triagem com IA
                  </button>
                )}
                {loadingAI && (
                  <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-xl text-indigo-700 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analisando seu perfil...
                  </div>
                )}
                {aiSuggestion && (
                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-indigo-700 mb-1">Sugestão da IA</p>
                        <p className="text-sm text-slate-700">{aiSuggestion}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <Label>Tipo de Consulta</Label>
                  <Select value={schedule.service_type} onValueChange={v => setSchedule(s => ({ ...s, service_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SERVICES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Data *</Label>
                    <Input
                      type="date"
                      value={schedule.date}
                      min={format(addDays(new Date(), 1), "yyyy-MM-dd")}
                      onChange={e => setSchedule(s => ({ ...s, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Horário *</Label>
                    <Select value={schedule.time} onValueChange={v => setSchedule(s => ({ ...s, time: v }))}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_TIMES.map(t => (
                          <SelectItem key={t} value={t}>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              {t}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {schedule.date && schedule.time && (
                  <div className="p-3 bg-emerald-50 rounded-xl flex items-center gap-3 border border-emerald-100">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <p className="text-sm text-emerald-800">
                      Consulta agendada para <strong>{schedule.date}</strong> às <strong>{schedule.time}</strong>. Confirmaremos via WhatsApp!
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 4: Documents */}
            {step === 4 && (
              <motion.div key="documents" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-slate-900">Documentos e Consentimentos</h3>
                </div>
                <p className="text-sm text-slate-500">Por favor, leia e aceite os documentos abaixo para prosseguir.</p>
                <div className="space-y-3">
                  {DOCS.map((doc) => {
                    const accepted = acceptedDocs.includes(doc.name);
                    return (
                      <div key={doc.name} className={cn(
                        "p-4 rounded-xl border-2 transition-all",
                        accepted ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-white"
                      )}>
                        <div className="flex items-start gap-3">
                          <doc.icon className={cn("w-5 h-5 mt-0.5 flex-shrink-0", accepted ? "text-emerald-600" : "text-slate-400")} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-slate-900 text-sm">{doc.name}</h4>
                              <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 flex items-center gap-1 hover:underline">
                                Ler <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{doc.desc}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setAcceptedDocs(prev =>
                            prev.includes(doc.name) ? prev.filter(d => d !== doc.name) : [...prev, doc.name]
                          )}
                          className={cn(
                            "mt-3 w-full py-2 rounded-lg text-sm font-medium transition-all border",
                            accepted
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-white text-slate-700 border-slate-300 hover:border-emerald-400"
                          )}
                        >
                          {accepted ? "✓ Aceito" : "Li e aceito"}
                        </button>
                      </div>
                    );
                  })}
                </div>
                {canProceedDocs && (
                  <div className="p-3 bg-emerald-50 rounded-xl flex items-center gap-2 text-emerald-700 text-sm border border-emerald-100">
                    <CheckCircle className="w-4 h-4" />
                    Todos os documentos foram aceitos. Pode finalizar!
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 5: Done */}
            {step === 5 && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-5">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mx-auto shadow-lg"
                >
                  <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Cadastro Concluído! 🎉</h3>
                  <p className="text-slate-500">
                    Olá, <strong>{contact.patient_name}</strong>! Seu cadastro foi realizado com sucesso na Prime Odontologia.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-left">
                  {createdPatient && (
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <p className="text-xs text-blue-500 mb-1">Prontuário</p>
                      <p className="text-sm font-semibold text-blue-900">Criado com sucesso</p>
                    </div>
                  )}
                  {schedule.date && (
                    <div className="p-3 bg-emerald-50 rounded-xl">
                      <p className="text-xs text-emerald-500 mb-1">1ª Consulta</p>
                      <p className="text-sm font-semibold text-emerald-900">{schedule.date} às {schedule.time}</p>
                    </div>
                  )}
                  <div className="p-3 bg-amber-50 rounded-xl">
                    <p className="text-xs text-amber-500 mb-1">Documentos</p>
                    <p className="text-sm font-semibold text-amber-900">{acceptedDocs.length} aceitos</p>
                  </div>
                  {contact.patient_phone && (
                    <div className="p-3 bg-purple-50 rounded-xl">
                      <p className="text-xs text-purple-500 mb-1">Confirmação</p>
                      <p className="text-sm font-semibold text-purple-900">Enviada via WhatsApp</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer navigation */}
        <div className="px-6 py-4 border-t bg-slate-50 flex items-center justify-between gap-3">
          {step > 0 && step < 5 ? (
            <Button variant="outline" onClick={() => setStep(s => s - 1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />Voltar
            </Button>
          ) : <div />}

          {step < 4 && (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={
                (step === 1 && !canProceedContact) ||
                (step === 3 && !canProceedSchedule)
              }
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {step === 0 ? "Começar" : "Próximo"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {step === 4 && (
            <Button
              onClick={handleSaveAndSchedule}
              disabled={!canProceedDocs || createPatientMutation.isPending || createAppointmentMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {(createPatientMutation.isPending || createAppointmentMutation.isPending)
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</>
                : <><CheckCircle className="w-4 h-4 mr-2" />Finalizar Cadastro</>
              }
            </Button>
          )}

          {step === 5 && (
            <Button onClick={() => { onComplete?.(createdPatient); onClose(); }} className="bg-indigo-600 hover:bg-indigo-700">
              Ir para o Prontuário
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
