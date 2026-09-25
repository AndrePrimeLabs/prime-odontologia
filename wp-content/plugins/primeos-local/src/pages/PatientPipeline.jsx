// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, Users, FileText, Calendar, Stethoscope, 
  Heart, RefreshCcw, ArrowRight, Plus, Send, Copy,
  ChevronRight, Sparkles, Loader2, CheckCircle,
  User, Activity, ClipboardList, UserPlus, ExternalLink
} from "lucide-react";
import PatientOnboardingWizard from "../components/onboarding/PatientOnboardingWizard";
import PatientTimeline from "../components/pipeline/PatientTimeline";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format, addDays } from "date-fns";

const pipelineStages = [
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "bg-green-500" },
  { id: "crm", label: "CRM", icon: Users, color: "bg-indigo-500" },
  { id: "script", label: "Sales Script", icon: FileText, color: "bg-purple-500" },
  { id: "appointment", label: "Appointment", icon: Calendar, color: "bg-blue-500" },
  { id: "clinical", label: "Clinical Care", icon: Stethoscope, color: "bg-rose-500" },
  { id: "followup", label: "Follow-up", icon: Heart, color: "bg-amber-500" },
  { id: "retention", label: "Retention", icon: RefreshCcw, color: "bg-emerald-500" }
];

export default function PatientPipeline() {
  const [activeStage, setActiveStage] = useState("whatsapp");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [generatingScript, setGeneratingScript] = useState(false);
  const [salesScript, setSalesScript] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  const queryClient = useQueryClient();

  const { data: patients = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => primeos.entities.Customer.list("-created_date")
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => primeos.entities.Product.filter({ status: "active" })
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments", selectedPatient?.id],
    queryFn: () => selectedPatient ? primeos.entities.Appointment.filter({ patient_id: selectedPatient.id }) : [],
    enabled: !!selectedPatient
  });

  const { data: clinicalNotes = [] } = useQuery({
    queryKey: ["clinicalNotes", selectedPatient?.id],
    queryFn: () => selectedPatient ? primeos.entities.ClinicalNote.filter({ patient_id: selectedPatient.id }) : [],
    enabled: !!selectedPatient
  });

  const { data: followUps = [] } = useQuery({
    queryKey: ["followUps", selectedPatient?.id],
    queryFn: () => selectedPatient ? primeos.entities.FollowUp.filter({ patient_id: selectedPatient.id }) : [],
    enabled: !!selectedPatient
  });

  // Mutations
  const createPatientMutation = useMutation({
    mutationFn: (data) => primeos.entities.Customer.create({ ...data, source: "whatsapp" }),
    onSuccess: (newPatient) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setSelectedPatient(newPatient);
      setShowNewPatient(false);
      setActiveStage("crm");
      toast.success("Patient added!");
    }
  });

  const updatePatientMutation = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.Customer.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] })
  });

  const createAppointmentMutation = useMutation({
    mutationFn: (data) => primeos.entities.Appointment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment scheduled!");
    }
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.Appointment.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] })
  });

  const createClinicalNoteMutation = useMutation({
    mutationFn: (data) => primeos.entities.ClinicalNote.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinicalNotes"] });
      toast.success("Clinical note saved!");
    }
  });

  const createFollowUpMutation = useMutation({
    mutationFn: (data) => primeos.entities.FollowUp.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followUps"] });
      toast.success("Follow-up scheduled!");
    }
  });

  const updateFollowUpMutation = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.FollowUp.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["followUps"] })
  });

  const generateSalesScript = async () => {
    if (!selectedPatient) return;
    setGeneratingScript(true);
    
    try {
      const serviceList = products.slice(0, 4).map(p => `- ${p.name}: $${p.price}`).join("\n");
      
      const response = await primeos.integrations.Core.InvokeLLM({
        prompt: `Generate a friendly WhatsApp healthcare appointment script for a patient:
          
Patient: ${selectedPatient.name}
Segment: ${selectedPatient.segment || "individual"}
Status: ${selectedPatient.status}
Notes: ${selectedPatient.notes || "New patient"}

Services available:
${serviceList}

Create a warm, professional WhatsApp message that:
1. Greets the patient warmly
2. Explains your healthcare services briefly
3. Invites them to schedule an appointment
4. Includes a clear call-to-action
5. Is HIPAA-conscious (no medical details)

Keep it friendly, professional, and concise for WhatsApp.`,
        response_json_schema: {
          type: "object",
          properties: {
            full_script: { type: "string" }
          }
        }
      });
      
      setSalesScript(response.full_script);
    } catch (error) {
      setSalesScript(`Hi ${selectedPatient.name}! 👋\n\nThank you for reaching out to us. We'd love to help you with your healthcare needs.\n\nWould you like to schedule an appointment? We have flexible times available this week.\n\nJust reply with your preferred date and time, and we'll get you scheduled right away! 🗓️`);
    }
    
    setGeneratingScript(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  const openWhatsApp = (phone, message) => {
    const cleanPhone = phone?.replace(/\D/g, "") || "";
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const [newPatientForm, setNewPatientForm] = useState({
    name: "", phone: "", email: "", segment: "individual", status: "lead", notes: ""
  });

  const [appointmentForm, setAppointmentForm] = useState({
    service_type: "consultation", date: "", time: "", duration_minutes: 30, provider: "", notes: ""
  });

  const [clinicalForm, setClinicalForm] = useState({
    chief_complaint: "", diagnosis: "", treatment_plan: "", follow_up_required: false, follow_up_date: "", provider: ""
  });

  const [followUpForm, setFollowUpForm] = useState({
    type: "post_appointment", due_date: "", priority: "medium", notes: ""
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Stethoscope className="w-8 h-8 text-rose-600" />
            Patient Care Pipeline
          </h1>
          <p className="text-slate-500 mt-1">WhatsApp → CRM → Script → Appointment → Clinical → Follow-up → Retention</p>
        </motion.div>

        {/* Pipeline Progress */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6 overflow-x-auto">
          <div className="flex items-center min-w-max">
            {pipelineStages.map((stage, idx) => (
              <div key={stage.id} className="flex items-center">
                <button
                  onClick={() => setActiveStage(stage.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 transition-all",
                    activeStage === stage.id ? "scale-105" : "opacity-50 hover:opacity-80"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    activeStage === stage.id ? stage.color + " text-white shadow-lg" : "bg-slate-100 text-slate-500"
                  )}>
                    <stage.icon className="w-5 h-5" />
                  </div>
                  <span className={cn("text-xs font-medium", activeStage === stage.id ? "text-slate-900" : "text-slate-500")}>
                    {stage.label}
                  </span>
                </button>
                {idx < pipelineStages.length - 1 && <ArrowRight className="w-4 h-4 text-slate-300 mx-1" />}
              </div>
            ))}
          </div>
        </div>

        {/* Selected Patient Context Bar */}
        {selectedPatient && (
          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 mb-5 flex items-center gap-4 shadow-sm flex-wrap">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
              {selectedPatient.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 truncate">{selectedPatient.name}</p>
              <p className="text-xs text-slate-500">{selectedPatient.phone || selectedPatient.email || "Sem contato"}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-indigo-100 text-indigo-700 border-0">{selectedPatient.segment || "individual"}</Badge>
              <Badge className="bg-emerald-100 text-emerald-700 border-0">{selectedPatient.status}</Badge>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={() => setActiveStage("crm")}>
                <Users className="w-3 h-3" />CRM
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={() => setActiveStage("script")}>
                <FileText className="w-3 h-3" />Script
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={() => setActiveStage("appointment")}>
                <Calendar className="w-3 h-3" />Agenda
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={() => setActiveStage("clinical")}>
                <Stethoscope className="w-3 h-3" />Clínico
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={() => setActiveStage("followup")}>
                <Heart className="w-3 h-3" />Follow-up
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={() => setActiveStage("retention")}>
                <RefreshCcw className="w-3 h-3" />Retenção
              </Button>
              <Button size="sm" variant="ghost" className="h-8 text-xs text-slate-400 hover:text-rose-500" onClick={() => { setSelectedPatient(null); setActiveStage("whatsapp"); }}>
                <ChevronRight className="w-3 h-3 rotate-180" />Trocar
              </Button>
            </div>
          </div>
        )}

        {/* Main layout: timeline sidebar + stage content */}
        <div className={cn("flex gap-6", selectedPatient ? "lg:flex-row flex-col" : "")}>

        {/* Timeline Sidebar — only when patient selected */}
        {selectedPatient && (
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sticky top-4 max-h-[85vh] overflow-y-auto">
              <PatientTimeline
                patient={selectedPatient}
                appointments={appointments}
                clinicalNotes={clinicalNotes}
                followUps={followUps}
                onGoToStage={setActiveStage}
              />
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">

        {/* Stage Content */}
        <AnimatePresence mode="wait">
          {/* Stage 1: WhatsApp */}
          {activeStage === "whatsapp" && (
            <motion.div key="whatsapp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                    Select or Add Patient
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={() => setShowOnboarding(true)} className="bg-indigo-600 hover:bg-indigo-700">
                      <UserPlus className="w-4 h-4 mr-2" />Novo Paciente (Onboarding)
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewPatient(true)}>
                      <Plus className="w-4 h-4 mr-2" />Cadastro Rápido
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {patients.map((patient) => (
                      <motion.div
                        key={patient.id}
                        whileHover={{ y: -2 }}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all",
                          selectedPatient?.id === patient.id ? "border-green-500 bg-green-50" : "border-slate-100 hover:border-green-200"
                        )}
                      >
                        {/* Clickable top area selects patient */}
                        <div className="flex items-center gap-3 mb-3 cursor-pointer" onClick={() => { setSelectedPatient(patient); setActiveStage("crm"); }}>
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {patient.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold truncate">{patient.name}</h3>
                            <p className="text-xs text-slate-500">{patient.phone || patient.segment || "Paciente"}</p>
                          </div>
                        </div>

                        {/* Quick-action buttons */}
                        <div className="flex gap-1.5">
                          {patient.phone && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 h-8 text-xs text-green-700 border-green-200 hover:bg-green-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                const cleanPhone = patient.phone.replace(/\D/g, "");
                                window.open(`https://wa.me/55${cleanPhone}`, "_blank");
                              }}
                            >
                              <MessageCircle className="w-3 h-3 mr-1" /> WhatsApp
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-8 text-xs text-blue-700 border-blue-200 hover:bg-blue-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPatient(patient);
                              setActiveStage("appointment");
                            }}
                          >
                            <Calendar className="w-3 h-3 mr-1" /> Agenda
                          </Button>
                          <Link
                            to={createPageUrl("EHR")}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1"
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full h-8 text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                            >
                              <ClipboardList className="w-3 h-3 mr-1" /> Prontuário
                            </Button>
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* No patient selected fallback for stages 2-7 */}
          {activeStage !== "whatsapp" && !selectedPatient && (
            <motion.div key="no-patient" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card className="border-0 shadow-sm">
                <CardContent className="py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="font-semibold text-slate-700 mb-1">Nenhum paciente selecionado</p>
                  <p className="text-sm text-slate-400 mb-5">Selecione um paciente na etapa WhatsApp para continuar</p>
                  <Button onClick={() => setActiveStage("whatsapp")} className="bg-indigo-600 hover:bg-indigo-700">
                    <ArrowRight className="w-4 h-4 mr-2 rotate-180" />Voltar para WhatsApp
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Stage 2: CRM */}
          {activeStage === "crm" && selectedPatient && (
            <motion.div key="crm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-indigo-600" />Patient Profile</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                        {selectedPatient.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{selectedPatient.name}</h2>
                        <p className="text-slate-500">{selectedPatient.phone}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500">Segment</p>
                        <Badge className="bg-indigo-100 text-indigo-700 mt-1">{selectedPatient.segment || "individual"}</Badge>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500">Status</p>
                        <Badge className="bg-emerald-100 text-emerald-700 mt-1">{selectedPatient.status}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => setActiveStage("script")} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                        Script IA <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <Button onClick={() => setActiveStage("appointment")} variant="outline" className="flex-1">
                        <Calendar className="w-4 h-4 mr-2" /> Agendar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardHeader><CardTitle>Quick Stats</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-xl text-center">
                        <Calendar className="w-6 h-6 mx-auto text-blue-600 mb-2" />
                        <p className="text-2xl font-bold text-blue-700">{appointments.length}</p>
                        <p className="text-xs text-blue-600">Appointments</p>
                      </div>
                      <div className="p-4 bg-rose-50 rounded-xl text-center">
                        <ClipboardList className="w-6 h-6 mx-auto text-rose-600 mb-2" />
                        <p className="text-2xl font-bold text-rose-700">{clinicalNotes.length}</p>
                        <p className="text-xs text-rose-600">Clinical Notes</p>
                      </div>
                      <div className="p-4 bg-amber-50 rounded-xl text-center">
                        <Heart className="w-6 h-6 mx-auto text-amber-600 mb-2" />
                        <p className="text-2xl font-bold text-amber-700">{followUps.filter(f => f.status === "pending").length}</p>
                        <p className="text-xs text-amber-600">Pending Follow-ups</p>
                      </div>
                      <div className="p-4 bg-emerald-50 rounded-xl text-center">
                        <Activity className="w-6 h-6 mx-auto text-emerald-600 mb-2" />
                        <p className="text-2xl font-bold text-emerald-700">${selectedPatient.lifetime_value || 0}</p>
                        <p className="text-xs text-emerald-600">Lifetime Value</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Stage 3: Sales Script */}
          {activeStage === "script" && selectedPatient && (
            <motion.div key="script" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-600" />AI Sales Script</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <p className="text-sm text-purple-700 mb-2">Generate a personalized appointment script for <strong>{selectedPatient.name}</strong></p>
                    <Button onClick={generateSalesScript} disabled={generatingScript} className="bg-purple-600 hover:bg-purple-700">
                      {generatingScript ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Sparkles className="w-4 h-4 mr-2" />Generate Script</>}
                    </Button>
                  </div>
                  {salesScript && (
                    <div className="space-y-3">
                      <Textarea value={salesScript} onChange={(e) => setSalesScript(e.target.value)} rows={8} className="font-mono text-sm" />
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => copyToClipboard(salesScript)} className="flex-1"><Copy className="w-4 h-4 mr-2" />Copy</Button>
                        {selectedPatient.phone && (
                          <Button onClick={() => openWhatsApp(selectedPatient.phone, salesScript)} className="flex-1 bg-green-600 hover:bg-green-700">
                            <Send className="w-4 h-4 mr-2" />Send via WhatsApp
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={() => setActiveStage("appointment")} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                      Agendar <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    {selectedPatient?.phone && (
                      <Button variant="outline" className="flex-1 text-green-700 border-green-200 hover:bg-green-50"
                        onClick={() => window.open(`https://wa.me/55${selectedPatient.phone.replace(/\D/g,"")}`, "_blank")}>
                        <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Stage 4: Appointment */}
          {activeStage === "appointment" && selectedPatient && (
            <motion.div key="appointment" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-600" />Schedule Appointment</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Service Type</Label>
                        <Select value={appointmentForm.service_type} onValueChange={(v) => setAppointmentForm({...appointmentForm, service_type: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="consultation">Consultation</SelectItem>
                            <SelectItem value="follow_up">Follow-up</SelectItem>
                            <SelectItem value="procedure">Procedure</SelectItem>
                            <SelectItem value="checkup">Checkup</SelectItem>
                            <SelectItem value="therapy">Therapy</SelectItem>
                            <SelectItem value="diagnostic">Diagnostic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Duration (min)</Label>
                        <Select value={String(appointmentForm.duration_minutes)} onValueChange={(v) => setAppointmentForm({...appointmentForm, duration_minutes: parseInt(v)})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 min</SelectItem>
                            <SelectItem value="30">30 min</SelectItem>
                            <SelectItem value="45">45 min</SelectItem>
                            <SelectItem value="60">60 min</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label>Date</Label><Input type="date" value={appointmentForm.date} onChange={(e) => setAppointmentForm({...appointmentForm, date: e.target.value})} /></div>
                      <div><Label>Time</Label><Input type="time" value={appointmentForm.time} onChange={(e) => setAppointmentForm({...appointmentForm, time: e.target.value})} /></div>
                      <div className="col-span-2"><Label>Provider</Label><Input value={appointmentForm.provider} onChange={(e) => setAppointmentForm({...appointmentForm, provider: e.target.value})} placeholder="Doctor/Provider name" /></div>
                      <div className="col-span-2"><Label>Notes</Label><Textarea value={appointmentForm.notes} onChange={(e) => setAppointmentForm({...appointmentForm, notes: e.target.value})} rows={2} /></div>
                    </div>
                    <Button
                      onClick={() => {
                        createAppointmentMutation.mutate({
                          ...appointmentForm,
                          patient_id: selectedPatient.id,
                          patient_name: selectedPatient.name,
                          patient_phone: selectedPatient.phone,
                          status: "scheduled"
                        });
                        if (selectedPatient.phone) {
                          const msg = `Hi ${selectedPatient.name}! 📅\n\nYour appointment is confirmed:\n📋 ${appointmentForm.service_type}\n🗓️ ${appointmentForm.date} at ${appointmentForm.time}\n👨‍⚕️ ${appointmentForm.provider || "Our team"}\n\nReply YES to confirm or let us know if you need to reschedule.`;
                          openWhatsApp(selectedPatient.phone, msg);
                        }
                      }}
                      disabled={!appointmentForm.date || createAppointmentMutation.isPending}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {createAppointmentMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                      Schedule & Notify via WhatsApp
                    </Button>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardHeader><CardTitle>Upcoming Appointments</CardTitle></CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      {appointments.length > 0 ? (
                        <div className="space-y-3">
                          {appointments.map((apt) => (
                            <div key={apt.id} className="p-3 bg-slate-50 rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <Badge className="bg-blue-100 text-blue-700 text-xs">{apt.service_type}</Badge>
                                  <p className="font-medium mt-1">{apt.date} at {apt.time}</p>
                                  <p className="text-xs text-slate-500">{apt.provider}</p>
                                </div>
                                <Badge variant="outline">{apt.status}</Badge>
                              </div>
                              {apt.status === "scheduled" && (
                                <Button size="sm" variant="outline" className="mt-2 w-full" onClick={() => { setSelectedAppointment(apt); setActiveStage("clinical"); }}>
                                  Start Visit
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-slate-400">
                          <Calendar className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm">No appointments yet</p>
                        </div>
                      )}
                    </ScrollArea>
                    <div className="flex gap-2 mt-4">
                      <Button onClick={() => setActiveStage("clinical")} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                        Atendimento Clínico <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <Link to={createPageUrl("Agenda")} className="flex-1">
                        <Button variant="outline" className="w-full text-blue-700 border-blue-200 hover:bg-blue-50">
                          <ExternalLink className="w-4 h-4 mr-2" /> Ver Agenda
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Stage 5: Clinical Care */}
          {activeStage === "clinical" && selectedPatient && (
            <motion.div key="clinical" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader><CardTitle className="flex items-center gap-2"><Stethoscope className="w-5 h-5 text-rose-600" />Clinical Note</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div><Label>Chief Complaint</Label><Textarea value={clinicalForm.chief_complaint} onChange={(e) => setClinicalForm({...clinicalForm, chief_complaint: e.target.value})} rows={2} placeholder="Patient's main concern..." /></div>
                    <div><Label>Diagnosis</Label><Textarea value={clinicalForm.diagnosis} onChange={(e) => setClinicalForm({...clinicalForm, diagnosis: e.target.value})} rows={2} placeholder="Clinical diagnosis..." /></div>
                    <div><Label>Treatment Plan</Label><Textarea value={clinicalForm.treatment_plan} onChange={(e) => setClinicalForm({...clinicalForm, treatment_plan: e.target.value})} rows={3} placeholder="Recommended treatment..." /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>Provider</Label><Input value={clinicalForm.provider} onChange={(e) => setClinicalForm({...clinicalForm, provider: e.target.value})} placeholder="Provider name" /></div>
                      <div className="flex items-center gap-2 pt-6">
                        <input type="checkbox" checked={clinicalForm.follow_up_required} onChange={(e) => setClinicalForm({...clinicalForm, follow_up_required: e.target.checked})} className="w-4 h-4" />
                        <Label className="mb-0">Follow-up Required</Label>
                      </div>
                    </div>
                    {clinicalForm.follow_up_required && (
                      <div><Label>Follow-up Date</Label><Input type="date" value={clinicalForm.follow_up_date} onChange={(e) => setClinicalForm({...clinicalForm, follow_up_date: e.target.value})} /></div>
                    )}
                    <Button
                      onClick={() => {
                        createClinicalNoteMutation.mutate({
                          ...clinicalForm,
                          patient_id: selectedPatient.id,
                          patient_name: selectedPatient.name,
                          appointment_id: selectedAppointment?.id
                        });
                        if (selectedAppointment) {
                          updateAppointmentMutation.mutate({ id: selectedAppointment.id, data: { ...selectedAppointment, status: "completed" } });
                        }
                        updatePatientMutation.mutate({ id: selectedPatient.id, data: { ...selectedPatient, status: "active" } });
                      }}
                      disabled={createClinicalNoteMutation.isPending}
                      className="w-full bg-rose-600 hover:bg-rose-700"
                    >
                      {createClinicalNoteMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                      Save Clinical Note
                    </Button>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardHeader><CardTitle>Clinical History</CardTitle></CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      {clinicalNotes.length > 0 ? (
                        <div className="space-y-3">
                          {clinicalNotes.map((note) => (
                            <div key={note.id} className="p-3 bg-slate-50 rounded-lg">
                              <p className="text-xs text-slate-500">{new Date(note.created_date).toLocaleDateString()}</p>
                              <p className="font-medium mt-1">{note.chief_complaint}</p>
                              {note.diagnosis && <p className="text-sm text-slate-600 mt-1"><strong>Dx:</strong> {note.diagnosis}</p>}
                              {note.treatment_plan && <p className="text-sm text-slate-600"><strong>Tx:</strong> {note.treatment_plan}</p>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-slate-400">
                          <ClipboardList className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm">No clinical notes yet</p>
                        </div>
                      )}
                    </ScrollArea>
                    <div className="flex gap-2 mt-4">
                      <Button onClick={() => setActiveStage("followup")} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                        Follow-up <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <Link to={createPageUrl("EHR")} className="flex-1">
                        <Button variant="outline" className="w-full text-indigo-700 border-indigo-200 hover:bg-indigo-50">
                          <ClipboardList className="w-4 h-4 mr-2" /> Prontuário
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Stage 6: Follow-up */}
          {activeStage === "followup" && selectedPatient && (
            <motion.div key="followup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader><CardTitle className="flex items-center gap-2"><Heart className="w-5 h-5 text-amber-600" />Schedule Follow-up</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Type</Label>
                        <Select value={followUpForm.type} onValueChange={(v) => setFollowUpForm({...followUpForm, type: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="post_appointment">Post Appointment</SelectItem>
                            <SelectItem value="medication_check">Medication Check</SelectItem>
                            <SelectItem value="test_results">Test Results</SelectItem>
                            <SelectItem value="wellness_check">Wellness Check</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Priority</Label>
                        <Select value={followUpForm.priority} onValueChange={(v) => setFollowUpForm({...followUpForm, priority: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2"><Label>Due Date</Label><Input type="date" value={followUpForm.due_date} onChange={(e) => setFollowUpForm({...followUpForm, due_date: e.target.value})} /></div>
                      <div className="col-span-2"><Label>Notes</Label><Textarea value={followUpForm.notes} onChange={(e) => setFollowUpForm({...followUpForm, notes: e.target.value})} rows={2} /></div>
                    </div>
                    <Button
                      onClick={() => {
                        createFollowUpMutation.mutate({
                          ...followUpForm,
                          patient_id: selectedPatient.id,
                          patient_name: selectedPatient.name,
                          patient_phone: selectedPatient.phone,
                          status: "pending",
                          contact_method: "whatsapp"
                        });
                      }}
                      disabled={createFollowUpMutation.isPending}
                      className="w-full bg-amber-600 hover:bg-amber-700"
                    >
                      {createFollowUpMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                      Create Follow-up
                    </Button>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardHeader><CardTitle>Pending Follow-ups</CardTitle></CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      {followUps.filter(f => f.status === "pending").length > 0 ? (
                        <div className="space-y-3">
                          {followUps.filter(f => f.status === "pending").map((fu) => (
                            <div key={fu.id} className="p-3 bg-slate-50 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <Badge className={cn("text-xs", fu.priority === "high" ? "bg-rose-100 text-rose-700" : fu.priority === "medium" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700")}>{fu.priority}</Badge>
                                <span className="text-xs text-slate-500">{fu.due_date}</span>
                              </div>
                              <p className="font-medium capitalize">{fu.type.replace(/_/g, " ")}</p>
                              {fu.notes && <p className="text-xs text-slate-500 mt-1">{fu.notes}</p>}
                              <div className="flex gap-2 mt-2">
                                <Button size="sm" variant="outline" onClick={() => {
                                  const msg = `Hi ${selectedPatient.name}! 👋\n\nJust checking in on your progress. How are you feeling?\n\nPlease let us know if you have any questions or concerns.`;
                                  openWhatsApp(selectedPatient.phone, msg);
                                  updateFollowUpMutation.mutate({ id: fu.id, data: { ...fu, status: "contacted" } });
                                }} className="flex-1">
                                  <MessageCircle className="w-3 h-3 mr-1" />WhatsApp
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => updateFollowUpMutation.mutate({ id: fu.id, data: { ...fu, status: "completed" } })} className="flex-1">
                                  <CheckCircle className="w-3 h-3 mr-1" />Done
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-slate-400">
                          <Heart className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm">No pending follow-ups</p>
                        </div>
                      )}
                    </ScrollArea>
                    <div className="flex gap-2 mt-4">
                      <Button onClick={() => setActiveStage("retention")} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                        Retenção <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      {selectedPatient?.phone && (
                        <Button variant="outline" className="flex-1 text-green-700 border-green-200 hover:bg-green-50"
                          onClick={() => {
                            const msg = `Olá ${selectedPatient.name}! 😊\n\nSeguindo seu atendimento, como está se sentindo?\n\nEstamos à disposição para qualquer dúvida!`;
                            window.open(`https://wa.me/55${selectedPatient.phone.replace(/\D/g,"")}?text=${encodeURIComponent(msg)}`, "_blank");
                          }}>
                          <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Stage 7: Retention / Upsell */}
          {activeStage === "retention" && selectedPatient && (
            <motion.div key="retention" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="border-0 shadow-sm lg:col-span-2">
                  <CardHeader><CardTitle className="flex items-center gap-2"><RefreshCcw className="w-5 h-5 text-emerald-600" />Retention & Upsell</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                      {products.map((product) => (
                        <div key={product.id} className="p-4 bg-slate-50 rounded-xl">
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-slate-500 mb-2">{product.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-emerald-600">${product.price}</span>
                            <Button size="sm" variant="outline" onClick={() => {
                              const msg = `Hi ${selectedPatient.name}! 🌟\n\nBased on your recent visit, we think you might benefit from our ${product.name}.\n\n${product.description}\n\nSpecial offer: $${product.price}\n\nWould you like to learn more?`;
                              openWhatsApp(selectedPatient.phone, msg);
                            }}>
                              <Send className="w-3 h-3 mr-1" />Offer
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                      <h3 className="font-semibold text-emerald-800 mb-2">Reactivation Campaign</h3>
                      <p className="text-sm text-emerald-700 mb-3">Send a wellness check message to bring back inactive patients</p>
                      <Button onClick={() => {
                        const msg = `Hi ${selectedPatient.name}! 👋\n\nIt's been a while since your last visit. We wanted to check in and see how you're doing!\n\nWe have some exciting new services that might interest you. Would you like to schedule a wellness checkup?\n\nReply to book your appointment. 📅`;
                        openWhatsApp(selectedPatient.phone, msg);
                        createFollowUpMutation.mutate({
                          patient_id: selectedPatient.id,
                          patient_name: selectedPatient.name,
                          patient_phone: selectedPatient.phone,
                          type: "reactivation",
                          status: "contacted",
                          due_date: format(addDays(new Date(), 7), "yyyy-MM-dd"),
                          priority: "medium",
                          contact_method: "whatsapp"
                        });
                      }} className="bg-emerald-600 hover:bg-emerald-700">
                        <MessageCircle className="w-4 h-4 mr-2" />Send Reactivation Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardHeader><CardTitle>Patient Summary</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                        {selectedPatient.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <h2 className="font-bold text-lg">{selectedPatient.name}</h2>
                      <Badge className="bg-emerald-100 text-emerald-700 mt-2">{selectedPatient.status}</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-slate-500">Appointments</span><span className="font-medium">{appointments.length}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Clinical Notes</span><span className="font-medium">{clinicalNotes.length}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Follow-ups</span><span className="font-medium">{followUps.length}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Lifetime Value</span><span className="font-medium text-emerald-600">${selectedPatient.lifetime_value || 0}</span></div>
                    </div>
                    <Button onClick={() => { setSelectedPatient(null); setActiveStage("whatsapp"); }} variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />New Patient Journey
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
        </div>

        {/* Onboarding Wizard */}
        {showOnboarding && (
          <PatientOnboardingWizard
            onClose={() => setShowOnboarding(false)}
            onComplete={(patient) => {
              if (patient) {
                setSelectedPatient(patient);
                setActiveStage("crm");
                queryClient.invalidateQueries({ queryKey: ["customers"] });
              }
              setShowOnboarding(false);
            }}
          />
        )}

        {/* New Patient Dialog */}
        <Dialog open={showNewPatient} onOpenChange={setShowNewPatient}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><MessageCircle className="w-5 h-5 text-green-600" />New Patient</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name *</Label><Input value={newPatientForm.name} onChange={(e) => setNewPatientForm({...newPatientForm, name: e.target.value})} placeholder="Patient name" /></div>
              <div><Label>WhatsApp *</Label><Input value={newPatientForm.phone} onChange={(e) => setNewPatientForm({...newPatientForm, phone: e.target.value})} placeholder="+1 234 567 8900" /></div>
              <div><Label>Email</Label><Input type="email" value={newPatientForm.email} onChange={(e) => setNewPatientForm({...newPatientForm, email: e.target.value})} /></div>
              <div><Label>Segment</Label>
                <Select value={newPatientForm.segment} onValueChange={(v) => setNewPatientForm({...newPatientForm, segment: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="small_business">Family</SelectItem>
                    <SelectItem value="enterprise">Corporate</SelectItem>
                    <SelectItem value="partner">Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => createPatientMutation.mutate(newPatientForm)} disabled={!newPatientForm.name || !newPatientForm.phone || createPatientMutation.isPending} className="w-full bg-green-600 hover:bg-green-700">
                {createPatientMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}Add Patient
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
