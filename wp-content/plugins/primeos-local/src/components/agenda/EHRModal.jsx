// @ts-nocheck
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { primeos } from "@/api/primeosClient";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText, ClipboardList, Calendar, DollarSign, Plus, Save, Loader2,
  AlertCircle, Pill, Activity, Clock,
  User, Phone, Mail, Stethoscope, History
} from "lucide-react";
import { toast } from "sonner";

const serviceLabels = {
  consultation: "Consulta", follow_up: "Retorno", procedure: "Procedimento",
  checkup: "Check-up", emergency: "Emergência", therapy: "Terapia", diagnostic: "Diagnóstico"
};

const paymentStatusLabels = { paid: "Pago", pending: "Pendente", waived: "Isento", partial: "Parcial" };
const paymentStatusColors = {
  paid: "bg-green-100 text-green-700", pending: "bg-amber-100 text-amber-700",
  waived: "bg-slate-100 text-slate-600", partial: "bg-blue-100 text-blue-700"
};
const aptStatusColors = {
  scheduled: "bg-blue-100 text-blue-700", confirmed: "bg-emerald-100 text-emerald-700",
  completed: "bg-slate-100 text-slate-600", cancelled: "bg-red-100 text-red-600",
  no_show: "bg-rose-100 text-rose-600", in_progress: "bg-amber-100 text-amber-700"
};
const aptStatusLabels = {
  scheduled: "Agendado", confirmed: "Confirmado", completed: "Concluído",
  cancelled: "Cancelado", no_show: "Não compareceu", in_progress: "Em andamento"
};

const fmtBRL = (v) => `R$ ${Number(v || 0).toFixed(2).replace(".", ",")}`;

// ─── Clinical Note Form ───────────────────────────────────────────
function ClinicalNoteForm({ appointment, patientId, onSaved }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    chief_complaint: "",
    diagnosis: "",
    treatment_plan: "",
    follow_up_required: false,
    follow_up_date: "",
    follow_up_notes: "",
    provider: appointment?.provider || ""
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await primeos.entities.ClinicalNote.create({
        ...form,
        patient_id: patientId,
        patient_name: appointment?.patient_name || "",
        appointment_id: appointment?.id || ""
      });
      toast.success("Nota clínica salva com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["clinicalNotes", patientId] });
      onSaved?.();
      setForm({ chief_complaint: "", diagnosis: "", treatment_plan: "", follow_up_required: false, follow_up_date: "", follow_up_notes: "", provider: appointment?.provider || "" });
    } catch (e) {
      toast.error("Erro ao salvar nota clínica");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-4 border border-indigo-100 rounded-xl p-4 bg-indigo-50/30">
      <p className="text-sm font-semibold text-indigo-800 flex items-center gap-1.5">
        <Stethoscope className="w-4 h-4" />
        {appointment ? `Nova nota — Consulta de ${appointment.date}` : "Nova nota clínica"}
      </p>
      <div className="grid grid-cols-1 gap-3">
        <div>
          <Label className="text-xs">Queixa Principal</Label>
          <Textarea placeholder="Descreva a queixa principal do paciente..." rows={2} value={form.chief_complaint}
            onChange={e => setForm(f => ({ ...f, chief_complaint: e.target.value }))} />
        </div>
        <div>
          <Label className="text-xs">Diagnóstico</Label>
          <Textarea placeholder="CID, diagnóstico clínico..." rows={2} value={form.diagnosis}
            onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))} />
        </div>
        <div>
          <Label className="text-xs">Plano de Tratamento</Label>
          <Textarea placeholder="Procedimentos, prescrições, orientações..." rows={3} value={form.treatment_plan}
            onChange={e => setForm(f => ({ ...f, treatment_plan: e.target.value }))} />
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.follow_up_required}
              onChange={e => setForm(f => ({ ...f, follow_up_required: e.target.checked }))} />
            Retorno necessário
          </label>
          {form.follow_up_required && (
            <Input type="date" className="w-40 h-8 text-xs" value={form.follow_up_date}
              onChange={e => setForm(f => ({ ...f, follow_up_date: e.target.value }))} />
          )}
        </div>
        {form.follow_up_required && (
          <div>
            <Label className="text-xs">Observações do Retorno</Label>
            <Input placeholder="Instruções para o retorno..." value={form.follow_up_notes}
              onChange={e => setForm(f => ({ ...f, follow_up_notes: e.target.value }))} />
          </div>
        )}
      </div>
      <Button size="sm" onClick={handleSave} disabled={saving || (!form.chief_complaint && !form.diagnosis)}
        className="bg-indigo-600 hover:bg-indigo-700">
        {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />}
        Salvar Nota
      </Button>
    </div>
  );
}

// ─── Main EHR Modal ───────────────────────────────────────────────
export default function EHRModal({ open, onClose, appointment, patientId, patientName }) {
  const queryClient = useQueryClient();
  const [showNoteForm, setShowNoteForm] = useState(false);
  const pid = patientId || appointment?.patient_id;
  const pname = patientName || appointment?.patient_name;

  // Fetch all patient data in parallel
  const { data: medicalRecord } = useQuery({
    queryKey: ["medicalRecord", pid],
    queryFn: async () => {
      const records = await primeos.entities.MedicalRecord.filter({ patient_id: pid });
      return records[0] || null;
    },
    enabled: !!pid && open
  });

  const { data: allAppointments = [] } = useQuery({
    queryKey: ["patientAppointments", pid],
    queryFn: () => primeos.entities.Appointment.filter({ patient_id: pid }, "-date"),
    enabled: !!pid && open
  });

  const { data: clinicalNotes = [] } = useQuery({
    queryKey: ["clinicalNotes", pid],
    queryFn: () => primeos.entities.ClinicalNote.filter({ patient_id: pid }, "-created_date"),
    enabled: !!pid && open
  });

  const { data: patient } = useQuery({
    queryKey: ["patient", pid],
    queryFn: async () => {
      const records = await primeos.entities.Customer.filter({ id: pid });
      return records[0] || null;
    },
    enabled: !!pid && open
  });

  const today = new Date().toISOString().split("T")[0];
  const pastApts = allAppointments.filter(a => a.date < today || a.status === "completed");
  const upcomingApts = allAppointments.filter(a => a.date >= today && a.status !== "cancelled" && a.status !== "completed");
  const paidApts = allAppointments.filter(a => a.price > 0 && a.payment_status === "paid");
  const pendingApts = allAppointments.filter(a => a.price > 0 && a.payment_status !== "paid" && a.payment_status !== "waived");
  const totalPaid = paidApts.reduce((s, a) => s + (a.price || 0), 0);
  const totalPending = pendingApts.reduce((s, a) => s + (a.price || 0), 0);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b bg-gradient-to-r from-indigo-50 to-white flex-shrink-0">
          <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Prontuário Eletrônico
          </DialogTitle>
          <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
            <span className="flex items-center gap-1.5 font-semibold text-slate-800">
              <User className="w-4 h-4 text-indigo-400" />{pname}
            </span>
            {patient?.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" />{patient.phone}</span>}
            {patient?.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" />{patient.email}</span>}
          </div>
          {/* Quick stats */}
          <div className="flex gap-4 mt-3">
            <div className="bg-white rounded-lg px-3 py-1.5 border border-slate-100 shadow-sm text-center">
              <p className="text-xs text-slate-400">Consultas</p>
              <p className="text-lg font-bold text-slate-800">{allAppointments.length}</p>
            </div>
            <div className="bg-white rounded-lg px-3 py-1.5 border border-slate-100 shadow-sm text-center">
              <p className="text-xs text-slate-400">Recebido</p>
              <p className="text-lg font-bold text-green-600">{fmtBRL(totalPaid)}</p>
            </div>
            <div className="bg-white rounded-lg px-3 py-1.5 border border-slate-100 shadow-sm text-center">
              <p className="text-xs text-slate-400">Pendente</p>
              <p className="text-lg font-bold text-amber-600">{fmtBRL(totalPending)}</p>
            </div>
            <div className="bg-white rounded-lg px-3 py-1.5 border border-slate-100 shadow-sm text-center">
              <p className="text-xs text-slate-400">Próximos</p>
              <p className="text-lg font-bold text-indigo-600">{upcomingApts.length}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue={appointment ? "notes" : "history"} className="flex flex-col h-full">
            <TabsList className="mx-6 mt-3 w-auto flex-shrink-0 justify-start h-auto gap-1 bg-slate-100 p-1">
              <TabsTrigger value="history" className="text-xs flex items-center gap-1">
                <History className="w-3.5 h-3.5" />Histórico
              </TabsTrigger>
              <TabsTrigger value="notes" className="text-xs flex items-center gap-1">
                <Stethoscope className="w-3.5 h-3.5" />Notas Clínicas
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="text-xs flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />Agendamentos
              </TabsTrigger>
              <TabsTrigger value="financial" className="text-xs flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />Financeiro
              </TabsTrigger>
              <TabsTrigger value="anamnese" className="text-xs flex items-center gap-1">
                <ClipboardList className="w-3.5 h-3.5" />Anamnese
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto px-6 py-4">

              {/* ── HISTÓRICO ── */}
              <TabsContent value="history" className="mt-0 space-y-3">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                  {pastApts.length} consulta(s) no histórico
                </p>
                {pastApts.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <Clock className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p>Nenhuma consulta anterior</p>
                  </div>
                ) : pastApts.map(apt => {
                  const note = clinicalNotes.find(n => n.appointment_id === apt.id);
                  return (
                    <div key={apt.id} className={`border rounded-xl p-4 bg-white shadow-sm ${apt.id === appointment?.id ? "border-indigo-300 ring-2 ring-indigo-100" : "border-slate-100"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-slate-800 text-sm">{apt.date}</span>
                            <Badge variant="outline" className="text-xs">{serviceLabels[apt.service_type]}</Badge>
                            <Badge className={`text-xs ${aptStatusColors[apt.status]}`}>{aptStatusLabels[apt.status]}</Badge>
                            {apt.id === appointment?.id && <Badge className="text-xs bg-indigo-100 text-indigo-700">Consulta Atual</Badge>}
                          </div>
                          {apt.time && <p className="text-xs text-slate-400 mt-0.5">⏰ {apt.time} · {apt.duration_minutes}min · Dr(a). {apt.provider || "—"}</p>}
                          {apt.notes && <p className="text-xs text-slate-600 mt-2 italic bg-slate-50 rounded px-2 py-1">{apt.notes}</p>}
                          {note && (
                            <div className="mt-2 bg-indigo-50 rounded-lg px-3 py-2 space-y-1">
                              {note.chief_complaint && <p className="text-xs"><span className="font-semibold text-indigo-700">Queixa:</span> {note.chief_complaint}</p>}
                              {note.diagnosis && <p className="text-xs"><span className="font-semibold text-indigo-700">Diagnóstico:</span> {note.diagnosis}</p>}
                              {note.treatment_plan && <p className="text-xs"><span className="font-semibold text-indigo-700">Tratamento:</span> {note.treatment_plan}</p>}
                            </div>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          {apt.price > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-slate-700">{fmtBRL(apt.price)}</p>
                              <Badge className={`text-xs ${paymentStatusColors[apt.payment_status || "pending"]}`}>
                                {paymentStatusLabels[apt.payment_status || "pending"]}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </TabsContent>

              {/* ── NOTAS CLÍNICAS ── */}
              <TabsContent value="notes" className="mt-0 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{clinicalNotes.length} nota(s) clínica(s)</p>
                  <Button size="sm" variant="outline" onClick={() => setShowNoteForm(v => !v)} className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                    <Plus className="w-3.5 h-3.5 mr-1" />Nova Nota
                  </Button>
                </div>

                {showNoteForm && (
                  <ClinicalNoteForm appointment={appointment} patientId={pid} onSaved={() => setShowNoteForm(false)} />
                )}

                {clinicalNotes.length === 0 && !showNoteForm ? (
                  <div className="text-center py-10 text-slate-400">
                    <Stethoscope className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p>Nenhuma nota clínica registrada</p>
                    <Button size="sm" variant="outline" className="mt-3" onClick={() => setShowNoteForm(true)}>
                      <Plus className="w-3.5 h-3.5 mr-1" />Adicionar primeira nota
                    </Button>
                  </div>
                ) : clinicalNotes.map(note => (
                  <div key={note.id} className="border border-slate-100 rounded-xl p-4 bg-white shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">{new Date(note.created_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      {note.provider && <span className="text-xs text-slate-500">Dr(a). {note.provider}</span>}
                    </div>
                    {note.chief_complaint && (
                      <div><p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Queixa Principal</p><p className="text-sm text-slate-800">{note.chief_complaint}</p></div>
                    )}
                    {note.diagnosis && (
                      <div className="bg-amber-50 rounded-lg px-3 py-2">
                        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Diagnóstico</p>
                        <p className="text-sm text-slate-800">{note.diagnosis}</p>
                      </div>
                    )}
                    {note.treatment_plan && (
                      <div className="bg-green-50 rounded-lg px-3 py-2">
                        <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Plano de Tratamento</p>
                        <p className="text-sm text-slate-800">{note.treatment_plan}</p>
                      </div>
                    )}
                    {note.follow_up_required && note.follow_up_date && (
                      <div className="flex items-center gap-2 text-xs text-indigo-700 bg-indigo-50 rounded-lg px-3 py-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Retorno agendado para: <strong>{note.follow_up_date}</strong></span>
                        {note.follow_up_notes && <span>— {note.follow_up_notes}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </TabsContent>

              {/* ── AGENDAMENTOS ── */}
              <TabsContent value="upcoming" className="mt-0 space-y-4">
                {upcomingApts.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-2">Próximos Agendamentos</p>
                    <div className="space-y-2">
                      {upcomingApts.map(apt => (
                        <div key={apt.id} className="border border-blue-100 rounded-xl p-3 bg-blue-50/50 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-slate-800">{apt.date}</span>
                              <Badge className={`text-xs ${aptStatusColors[apt.status]}`}>{aptStatusLabels[apt.status]}</Badge>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">⏰ {apt.time} · {serviceLabels[apt.service_type]} · {apt.duration_minutes}min</p>
                            {apt.provider && <p className="text-xs text-slate-400">Dr(a). {apt.provider}</p>}
                          </div>
                          {apt.price > 0 && (
                            <div className="text-right">
                              <p className="text-sm font-semibold">{fmtBRL(apt.price)}</p>
                              <Badge className={`text-xs ${paymentStatusColors[apt.payment_status || "pending"]}`}>
                                {paymentStatusLabels[apt.payment_status || "pending"]}
                              </Badge>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {upcomingApts.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p>Nenhum agendamento futuro</p>
                  </div>
                )}

                {pastApts.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-2">Histórico de Agendamentos</p>
                    <div className="space-y-1.5">
                      {pastApts.slice(0, 10).map(apt => (
                        <div key={apt.id} className="flex items-center justify-between py-2 border-b border-slate-100 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-600">{apt.date}</span>
                            <span className="text-xs text-slate-400">{serviceLabels[apt.service_type]}</span>
                          </div>
                          <Badge className={`text-xs ${aptStatusColors[apt.status]}`}>{aptStatusLabels[apt.status]}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* ── FINANCEIRO ── */}
              <TabsContent value="financial" className="mt-0 space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                    <p className="text-xs text-green-600 font-medium">Total Pago</p>
                    <p className="text-xl font-bold text-green-700">{fmtBRL(totalPaid)}</p>
                    <p className="text-xs text-green-500">{paidApts.length} consultas</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
                    <p className="text-xs text-amber-600 font-medium">Pendente</p>
                    <p className="text-xl font-bold text-amber-700">{fmtBRL(totalPending)}</p>
                    <p className="text-xs text-amber-500">{pendingApts.length} consultas</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                    <p className="text-xs text-slate-600 font-medium">Total Geral</p>
                    <p className="text-xl font-bold text-slate-700">{fmtBRL(totalPaid + totalPending)}</p>
                    <p className="text-xs text-slate-500">{allAppointments.filter(a => a.price > 0).length} cobradas</p>
                  </div>
                </div>

                {/* Payment history per appointment */}
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-2">Status por Consulta</p>
                  <div className="space-y-2">
                    {allAppointments.filter(a => a.price > 0).map(apt => (
                      <div key={apt.id} className="flex items-center justify-between bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
                        <div>
                          <p className="text-sm font-medium text-slate-800">{apt.date} — {serviceLabels[apt.service_type]}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {apt.payment_method && <span className="text-xs text-slate-400">💳 {apt.payment_method.replace(/_/g, " ")}</span>}
                            {apt.payment_date && <span className="text-xs text-slate-400">📅 Pago em {apt.payment_date}</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-700">{fmtBRL(apt.price)}</p>
                          <Badge className={`text-xs ${paymentStatusColors[apt.payment_status || "pending"]}`}>
                            {paymentStatusLabels[apt.payment_status || "pending"]}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {allAppointments.filter(a => a.price > 0).length === 0 && (
                      <div className="text-center py-8 text-slate-400">
                        <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-40" />
                        <p>Nenhuma consulta com valor registrado</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* ── ANAMNESE / PRONTUÁRIO BASE ── */}
              <TabsContent value="anamnese" className="mt-0 space-y-4">
                {medicalRecord ? (
                  <div className="space-y-4">
                    {medicalRecord.allergies?.length > 0 && (
                      <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                        <p className="text-sm font-semibold text-red-700 flex items-center gap-1.5 mb-2">
                          <AlertCircle className="w-4 h-4" />Alergias
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {medicalRecord.allergies.map((a, i) => <Badge key={i} variant="destructive">{a}</Badge>)}
                        </div>
                      </div>
                    )}
                    {medicalRecord.chronic_conditions?.length > 0 && (
                      <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                        <p className="text-sm font-semibold text-orange-700 flex items-center gap-1.5 mb-2">
                          <Activity className="w-4 h-4" />Condições Crônicas
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {medicalRecord.chronic_conditions.map((c, i) => <Badge key={i} className="bg-orange-100 text-orange-700">{c}</Badge>)}
                        </div>
                      </div>
                    )}
                    {medicalRecord.medications?.length > 0 && (
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                        <p className="text-sm font-semibold text-blue-700 flex items-center gap-1.5 mb-2">
                          <Pill className="w-4 h-4" />Medicações em Uso
                        </p>
                        <div className="space-y-2">
                          {medicalRecord.medications.map((m, i) => (
                            <div key={i} className="bg-white rounded-lg p-2.5 text-sm">
                              <p className="font-medium text-blue-900">{m.name}</p>
                              <p className="text-xs text-blue-600">{m.dosage} — {m.frequency}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {medicalRecord.past_procedures?.length > 0 && (
                      <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                        <p className="text-sm font-semibold text-green-700 flex items-center gap-1.5 mb-2">
                          <FileText className="w-4 h-4" />Procedimentos Anteriores
                        </p>
                        <div className="space-y-2">
                          {medicalRecord.past_procedures.map((p, i) => (
                            <div key={i} className="bg-white rounded-lg p-2.5">
                              <div className="flex justify-between">
                                <p className="text-sm font-medium text-green-900">{p.procedure}</p>
                                <span className="text-xs text-slate-400">{p.date}</span>
                              </div>
                              {p.tooth && <p className="text-xs text-green-600">Dente: {p.tooth}</p>}
                              {p.notes && <p className="text-xs text-slate-500 mt-1">{p.notes}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {medicalRecord.content && (
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                        <p className="text-sm font-semibold text-slate-700 mb-2">Anotações do Prontuário</p>
                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{medicalRecord.content}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p>Anamnese não preenchida ainda</p>
                    <p className="text-xs mt-1">Acesse o módulo Prontuários para criar a anamnese completa</p>
                  </div>
                )}
              </TabsContent>

            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
