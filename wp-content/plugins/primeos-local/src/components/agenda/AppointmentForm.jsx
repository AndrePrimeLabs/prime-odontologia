// @ts-nocheck
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Loader2, Search, UserPlus, X, Tag } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { primeos } from "@/api/primeosClient";
import { getServicePrices } from "./ServicePriceConfig";
import PatientQuickCreate from "./PatientQuickCreate";
import PatientHistoryPanel from "./PatientHistoryPanel";

const timeSlots = [
  "07:00","07:30","08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30",
  "17:00","17:30","18:00","18:30","19:00","19:30","20:00","20:30","21:00"
];

const serviceTypes = {
  consultation: { label: "Consulta", duration: 30 },
  follow_up: { label: "Retorno", duration: 20 },
  procedure: { label: "Procedimento", duration: 60 },
  checkup: { label: "Check-up", duration: 45 },
  emergency: { label: "Emergência", duration: 30 },
  therapy: { label: "Terapia", duration: 60 },
  diagnostic: { label: "Diagnóstico", duration: 30 }
};

export default function AppointmentForm({ 
  appointment = null, 
  patients = [], 
  onSubmit, 
  onCancel,
  isLoading = false,
  initialDate = "",
  initialTime = ""
}) {
  const queryClient = useQueryClient();
  const prices = getServicePrices();
  const [form, setForm] = useState({
    patient_id: "", patient_name: "", patient_phone: "",
    service_type: "consultation", date: initialDate, time: initialTime,
    duration_minutes: 30, provider: "", notes: "", status: "scheduled",
    follow_up_required: false, follow_up_days: 7, follow_up_notes: "",
    price: prices["consultation"] ?? "", payment_status: "pending", payment_method: ""
  });
  const [patientSearch, setPatientSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  // Tags state for patient notes/tags
  const [newTag, setNewTag] = useState("");
  const [patientTags, setPatientTags] = useState([]);
  const [patientNotes, setPatientNotes] = useState("");
  const [savingPatientInfo, setSavingPatientInfo] = useState(false);

  useEffect(() => {
    if (appointment) {
      setForm(appointment);
      // Find linked patient
      if (appointment.patient_id) {
        const p = patients.find(p => p.id === appointment.patient_id);
        if (p) {
          setSelectedPatient(p);
          setPatientTags(p.tags || []);
          setPatientNotes(p.notes || "");
        }
      }
    }
  }, [appointment, patients]);

  const filteredPatients = useMemo(() => {
    if (!patientSearch) return patients.slice(0, 8);
    return patients.filter(p =>
      p.name?.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.phone?.includes(patientSearch)
    ).slice(0, 8);
  }, [patients, patientSearch]);

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setPatientTags(patient.tags || []);
    setPatientNotes(patient.notes || "");
    setForm(prev => ({
      ...prev,
      patient_id: patient.id,
      patient_name: patient.name,
      patient_phone: patient.phone || ""
    }));
    setPatientSearch(patient.name);
    setShowDropdown(false);
  };

  const handlePatientCreated = (patient) => {
    queryClient.invalidateQueries({ queryKey: ["customers"] });
    setShowQuickCreate(false);
    handlePatientSelect(patient);
  };

  const handleClearPatient = () => {
    setSelectedPatient(null);
    setPatientTags([]);
    setPatientNotes("");
    setPatientSearch("");
    setForm(prev => ({ ...prev, patient_id: "", patient_name: "", patient_phone: "" }));
  };

  const handleServiceTypeChange = (serviceType) => {
    const prices = getServicePrices();
    setForm(prev => ({ 
      ...prev, 
      service_type: serviceType, 
      duration_minutes: serviceTypes[serviceType]?.duration || 30,
      price: prev.price ?? prices[serviceType] ?? ""
    }));
  };

  const handleAddTag = (e) => {
    if ((e.key === "Enter" || e.key === ",") && newTag.trim()) {
      e.preventDefault();
      const tag = newTag.trim().replace(",", "");
      if (!patientTags.includes(tag)) setPatientTags(prev => [...prev, tag]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag) => setPatientTags(prev => prev.filter(t => t !== tag));

  const handleSavePatientInfo = async () => {
    if (!selectedPatient) return;
    setSavingPatientInfo(true);
    await primeos.entities.Customer.update(selectedPatient.id, { tags: patientTags, notes: patientNotes });
    setSavingPatientInfo(false);
    queryClient.invalidateQueries({ queryKey: ["customers"] });
  };

  const handleSubmit = () => {
    if (!form.patient_name || !form.date || !form.time) return;
    onSubmit(form);
  };

  return (
    <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
      {/* Patient search */}
      <div>
        <Label>Paciente *</Label>
        {selectedPatient ? (
          <div className="flex items-center gap-2 p-2.5 border rounded-lg bg-blue-50 border-blue-200">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 text-sm">{selectedPatient.name}</p>
              {selectedPatient.phone && <p className="text-xs text-slate-500">{selectedPatient.phone}</p>}
            </div>
            <button onClick={handleClearPatient} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Buscar por nome ou telefone..."
                value={patientSearch}
                onChange={e => { setPatientSearch(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
              />
            </div>
            {showDropdown && (
              <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-white border border-slate-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                {filteredPatients.map(p => (
                  <button
                    key={p.id}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                    onClick={() => handlePatientSelect(p)}
                  >
                    <p className="font-medium text-sm text-slate-900">{p.name}</p>
                    {p.phone && <p className="text-xs text-slate-500">{p.phone}</p>}
                  </button>
                ))}
                <button
                  className="w-full text-left px-3 py-2 text-blue-600 hover:bg-blue-50 flex items-center gap-2 text-sm font-medium border-t border-slate-100"
                  onClick={() => { setShowDropdown(false); setShowQuickCreate(true); }}
                >
                  <UserPlus className="w-4 h-4" /> Cadastrar novo paciente
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick create panel */}
      {showQuickCreate && (
        <PatientQuickCreate onCreated={handlePatientCreated} onCancel={() => setShowQuickCreate(false)} />
      )}

      {/* Patient history */}
      {selectedPatient && <PatientHistoryPanel patient={selectedPatient} />}

      {/* Patient notes & tags (only if patient selected) */}
      {selectedPatient && (
        <div className="border border-slate-200 rounded-xl p-3 space-y-2 bg-slate-50">
          <p className="text-xs font-semibold text-slate-600">Notas e Tags do Paciente</p>
          <div>
            <Label className="text-xs">Tags</Label>
            <div className="flex flex-wrap gap-1 mb-1">
              {patientTags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs gap-1 px-1.5">
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="text-slate-400 hover:text-red-500">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
            <Input
              className="h-7 text-xs"
              placeholder="Digite uma tag e pressione Enter..."
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              onKeyDown={handleAddTag}
            />
          </div>
          <div>
            <Label className="text-xs">Notas do Paciente</Label>
            <Textarea
              className="text-xs resize-none"
              rows={2}
              placeholder="Observações sobre o paciente (alergias, preferências, etc.)"
              value={patientNotes}
              onChange={e => setPatientNotes(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="h-7 text-xs w-full" onClick={handleSavePatientInfo} disabled={savingPatientInfo}>
            {savingPatientInfo ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Tag className="w-3 h-3 mr-1" />}
            Salvar notas/tags do paciente
          </Button>
        </div>
      )}

      {/* Service & duration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tipo de Serviço *</Label>
          <Select value={form.service_type} onValueChange={handleServiceTypeChange}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(serviceTypes).map(([key, val]) => (
                <SelectItem key={key} value={key}>{val.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Duração (min)</Label>
          <Select value={String(form.duration_minutes)} onValueChange={(v) => setForm({ ...form, duration_minutes: parseInt(v) })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {[15,20,30,45,60,90,120].map(d => (
                <SelectItem key={d} value={String(d)}>{d} min</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Data *</Label>
          <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <div>
          <Label>Horário *</Label>
          <Select value={form.time} onValueChange={(v) => setForm({ ...form, time: v })}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Provider */}
      <div>
        <Label>Dentista</Label>
        <Input value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} placeholder="Nome do profissional" />
      </div>

      {/* Status (edit only) */}
      {appointment && (
        <div>
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Agendado</SelectItem>
              <SelectItem value="confirmed">Confirmado</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
              <SelectItem value="no_show">Não Compareceu</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Appointment notes */}
      <div>
        <Label>Observações da Consulta</Label>
        <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Informações sobre esta consulta" rows={2} />
      </div>

      {/* Payment */}
      <div className="border border-green-100 bg-green-50/50 rounded-xl p-3 space-y-3">
        <p className="text-xs font-semibold text-green-700">Pagamento</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Valor (R$)</Label>
            <Input type="number" className="h-8 text-sm" placeholder="0,00" value={form.price ?? ""} onChange={e => setForm({ ...form, price: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Status</Label>
            <Select value={form.payment_status || "pending"} onValueChange={v => setForm({ ...form, payment_status: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="partial">Parcial</SelectItem>
                <SelectItem value="waived">Isento</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label className="text-xs">Forma de Pagamento</Label>
            <Select value={form.payment_method || ""} onValueChange={v => setForm({ ...form, payment_method: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                <SelectItem value="convenio">Convênio</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Follow-up */}
      <div className="border-t pt-4 space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox id="follow_up" checked={form.follow_up_required} onCheckedChange={(checked) => setForm({ ...form, follow_up_required: checked })} />
          <Label htmlFor="follow_up" className="font-medium cursor-pointer text-sm">Agendar follow-up automático</Label>
        </div>
        {form.follow_up_required && (
          <div className="pl-6 space-y-3 bg-blue-50 p-3 rounded-lg">
            <div>
              <Label className="text-xs">Retorno em quantos dias?</Label>
              <Select value={String(form.follow_up_days)} onValueChange={(v) => setForm({ ...form, follow_up_days: parseInt(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[3,7,15,30,45,60,90].map(d => <SelectItem key={d} value={String(d)}>{d} dias</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Observações do follow-up</Label>
              <Textarea value={form.follow_up_notes} onChange={(e) => setForm({ ...form, follow_up_notes: e.target.value })} rows={2} />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={handleSubmit} disabled={!form.patient_name || !form.date || !form.time || isLoading} className="flex-1 bg-blue-600 hover:bg-blue-700">
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
          {appointment ? "Atualizar" : "Agendar"}
        </Button>
        <Button onClick={onCancel} disabled={isLoading} variant="outline" className="flex-1">Cancelar</Button>
      </div>
    </div>
  );
}
