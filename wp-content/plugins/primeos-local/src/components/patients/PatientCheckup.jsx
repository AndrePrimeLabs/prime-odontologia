// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Clock, CalendarPlus, Trash2, RefreshCw, X, Plus, AlertCircle } from "lucide-react";
import { format, addMonths, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

const INTERVALS = [
  { label: "1 mês", months: 1 },
  { label: "3 meses", months: 3 },
  { label: "6 meses", months: 6 },
  { label: "1 ano", months: 12 },
  { label: "2 anos", months: 24 },
];

const SERVICE_TYPES = [
  { value: "checkup", label: "Check-up preventivo" },
  { value: "consultation", label: "Consulta de retorno" },
  { value: "follow_up", label: "Retorno pós-procedimento" },
  { value: "procedure", label: "Procedimento agendado" },
];

export default function PatientCheckup({ patient, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ interval_months: "6", service_type: "checkup", notes: "", provider: "" });
  const [scheduling, setScheduling] = useState(null);
  const queryClient = useQueryClient();

  const checkups = patient.checkup_schedule || [];

  const saveMutation = useMutation({
    mutationFn: async (newCheckup) => {
      const updated = [...checkups, newCheckup];
      return primeos.entities.PatientRecord.update(patient.id, { checkup_schedule: updated });
    },
    onSuccess: (data) => {
      onUpdate(data);
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (index) => {
      const updated = checkups.filter((_, i) => i !== index);
      return primeos.entities.PatientRecord.update(patient.id, { checkup_schedule: updated });
    },
    onSuccess: (data) => onUpdate(data),
  });

  const scheduleAppointmentMutation = useMutation({
    mutationFn: async ({ checkup, index }) => {
      const dueDate = checkup.due_date;
      const appt = await primeos.entities.Appointment.create({
        patient_name: patient.patient_name,
        patient_phone: patient.patient_phone || "",
        service_type: checkup.service_type || "checkup",
        date: dueDate,
        time: "09:00",
        duration_minutes: 30,
        status: "scheduled",
        provider: checkup.provider || "",
        notes: checkup.notes || "Retorno preventivo automático",
      });
      const updated = checkups.map((c, i) =>
        i === index ? { ...c, appointment_id: appt.id, scheduled: true } : c
      );
      return primeos.entities.PatientRecord.update(patient.id, { checkup_schedule: updated });
    },
    onSuccess: (data) => { onUpdate(data); setScheduling(null); queryClient.invalidateQueries({ queryKey: ["appointments"] }); },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const months = parseInt(form.interval_months);
    const dueDate = format(addMonths(new Date(), months), "yyyy-MM-dd");
    saveMutation.mutate({
      interval_months: months,
      service_type: form.service_type,
      notes: form.notes,
      provider: form.provider,
      due_date: dueDate,
      created_at: new Date().toISOString(),
      scheduled: false,
    });
  };

  const isOverdue = (due_date) => new Date(due_date) < new Date();
  const isDueSoon = (due_date) => {
    const due = new Date(due_date);
    const soon = addDays(new Date(), 30);
    return due <= soon && due >= new Date();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{checkups.length} retorno(s) preventivo(s) programado(s)</p>
        <Button size="sm" onClick={() => setShowForm(!showForm)} variant="outline" className="gap-1.5">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancelar" : "Programar Retorno"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Intervalo</Label>
              <Select value={form.interval_months} onValueChange={v => setForm(p => ({ ...p, interval_months: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{INTERVALS.map(i => <SelectItem key={i.months} value={String(i.months)}>{i.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo de Consulta</Label>
              <Select value={form.service_type} onValueChange={v => setForm(p => ({ ...p, service_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SERVICE_TYPES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Profissional (opcional)</Label>
              <Input value={form.provider} onChange={e => setForm(p => ({ ...p, provider: e.target.value }))} placeholder="Nome do dentista..." />
            </div>
            <div>
              <Label>Observações</Label>
              <Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Ex: Manutenção do aparelho" />
            </div>
          </div>
          {form.interval_months && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-700">
              <CalendarPlus className="w-4 h-4 inline mr-1.5" />
              Retorno previsto para: <strong>{format(addMonths(new Date(), parseInt(form.interval_months)), "dd/MM/yyyy", { locale: ptBR })}</strong>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" size="sm" disabled={saveMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
              {saveMutation.isPending ? "Salvando..." : "Programar"}
            </Button>
          </div>
        </form>
      )}

      {checkups.length === 0 && !showForm ? (
        <div className="text-center py-8 text-slate-500">
          <RefreshCw className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p>Nenhum retorno preventivo programado</p>
          <p className="text-xs mt-1">Programe check-ups automáticos para este paciente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {checkups.map((checkup, i) => {
            const overdue = isOverdue(checkup.due_date);
            const dueSoon = isDueSoon(checkup.due_date);
            const serviceLabel = SERVICE_TYPES.find(s => s.value === checkup.service_type)?.label || checkup.service_type;
            return (
              <div key={i} className={`p-4 rounded-xl border shadow-sm ${overdue ? "bg-red-50 border-red-200" : dueSoon ? "bg-amber-50 border-amber-200" : "bg-white border-slate-100"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-slate-800">{serviceLabel}</span>
                      {checkup.scheduled ? (
                        <Badge className="bg-green-100 text-green-700 gap-1"><CheckCircle className="w-3 h-3" />Agendado</Badge>
                      ) : overdue ? (
                        <Badge className="bg-red-100 text-red-700 gap-1"><AlertCircle className="w-3 h-3" />Atrasado</Badge>
                      ) : dueSoon ? (
                        <Badge className="bg-amber-100 text-amber-700 gap-1"><Clock className="w-3 h-3" />Vence em breve</Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-600 gap-1"><Clock className="w-3 h-3" />Pendente</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">
                      Previsto para: <strong>{checkup.due_date ? format(new Date(checkup.due_date), "dd/MM/yyyy", { locale: ptBR }) : "—"}</strong>
                      {checkup.provider && ` • ${checkup.provider}`}
                    </p>
                    {checkup.notes && <p className="text-xs text-slate-500 mt-1">{checkup.notes}</p>}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {!checkup.scheduled && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs gap-1"
                        disabled={scheduling === i || scheduleAppointmentMutation.isPending}
                        onClick={() => { setScheduling(i); scheduleAppointmentMutation.mutate({ checkup, index: i }); }}
                      >
                        <CalendarPlus className="w-3.5 h-3.5" />
                        {scheduling === i ? "Agendando..." : "Agendar"}
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteMutation.mutate(i)}>
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
