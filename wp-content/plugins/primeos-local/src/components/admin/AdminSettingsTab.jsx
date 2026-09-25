// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2, Clock, Save,
  Stethoscope, Plus, RefreshCw, Bell
} from "lucide-react";
import { toast } from "sonner";

const SPECIALTIES = [
  { value: "clinico_geral", label: "Clínico Geral" },
  { value: "ortodontia", label: "Ortodontia" },
  { value: "implantodontia", label: "Implantodontia" },
  { value: "endodontia", label: "Endodontia" },
  { value: "periodontia", label: "Periodontia" },
  { value: "pediatria", label: "Pediatria" },
  { value: "cirurgia", label: "Cirurgia" },
  { value: "protese", label: "Prótese" },
  { value: "estetica", label: "Estética" },
];

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function ClinicSettings() {
  const [clinic, setClinic] = useState({
    name: "Prime Odontologia",
    phone: "",
    email: "",
    website: "",
    cnpj: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    opening_time: "08:00",
    closing_time: "18:00",
    slot_duration: "30",
    whatsapp: "",
    instagram: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    // Persist in localStorage as app config
    localStorage.setItem("clinic_settings", JSON.stringify(clinic));
    setTimeout(() => {
      setSaving(false);
      toast.success("Configurações da clínica salvas!");
    }, 600);
  };

  // Load from localStorage on mount
  useState(() => {
    const stored = localStorage.getItem("clinic_settings");
    if (stored) setClinic(JSON.parse(stored));
  });

  const Field = ({ label, children }) => (
    <div className="space-y-1.5">
      <Label className="text-slate-300 text-xs">{label}</Label>
      {children}
    </div>
  );

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader><CardTitle className="text-white text-sm flex items-center gap-2"><Building2 className="w-4 h-4" /> Dados da Clínica</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <Field label="Nome da Clínica">
            <Input value={clinic.name} onChange={e => setClinic({ ...clinic, name: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white" />
          </Field>
          <Field label="CNPJ">
            <Input value={clinic.cnpj} onChange={e => setClinic({ ...clinic, cnpj: e.target.value })}
              placeholder="00.000.000/0000-00" className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500" />
          </Field>
          <Field label="Telefone">
            <Input value={clinic.phone} onChange={e => setClinic({ ...clinic, phone: e.target.value })}
              placeholder="(11) 3333-4444" className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500" />
          </Field>
          <Field label="WhatsApp">
            <Input value={clinic.whatsapp} onChange={e => setClinic({ ...clinic, whatsapp: e.target.value })}
              placeholder="(11) 99999-8888" className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500" />
          </Field>
          <Field label="Email">
            <Input value={clinic.email} onChange={e => setClinic({ ...clinic, email: e.target.value })}
              placeholder="contato@clinica.com.br" className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500" />
          </Field>
          <Field label="Website">
            <Input value={clinic.website} onChange={e => setClinic({ ...clinic, website: e.target.value })}
              placeholder="www.clinica.com.br" className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500" />
          </Field>
          <Field label="Instagram">
            <Input value={clinic.instagram} onChange={e => setClinic({ ...clinic, instagram: e.target.value })}
              placeholder="@clinica" className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Endereço">
              <Input value={clinic.address} onChange={e => setClinic({ ...clinic, address: e.target.value })}
                placeholder="Rua, número, complemento" className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500" />
            </Field>
          </div>
          <Field label="Cidade">
            <Input value={clinic.city} onChange={e => setClinic({ ...clinic, city: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Estado">
              <Input value={clinic.state} onChange={e => setClinic({ ...clinic, state: e.target.value })}
                placeholder="SP" className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500" />
            </Field>
            <Field label="CEP">
              <Input value={clinic.zip} onChange={e => setClinic({ ...clinic, zip: e.target.value })}
                placeholder="00000-000" className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500" />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Descrição / Sobre a Clínica">
              <Textarea value={clinic.description} onChange={e => setClinic({ ...clinic, description: e.target.value })}
                rows={3} className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 resize-none"
                placeholder="Descreva sua clínica..." />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader><CardTitle className="text-white text-sm flex items-center gap-2"><Clock className="w-4 h-4" /> Horários de Funcionamento</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-4">
          <Field label="Abertura">
            <Input type="time" value={clinic.opening_time} onChange={e => setClinic({ ...clinic, opening_time: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white" />
          </Field>
          <Field label="Fechamento">
            <Input type="time" value={clinic.closing_time} onChange={e => setClinic({ ...clinic, closing_time: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white" />
          </Field>
          <Field label="Duração do Slot (min)">
            <Select value={clinic.slot_duration} onValueChange={v => setClinic({ ...clinic, slot_duration: v })}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["15", "20", "30", "45", "60"].map(v => (
                  <SelectItem key={v} value={v}>{v} minutos</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </CardContent>
      </Card>

      <Button onClick={save} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Salvar Configurações
      </Button>
    </div>
  );
}

function DentistsSettings() {
  const queryClient = useQueryClient();

  const { data: dentists = [], isLoading } = useQuery({
    queryKey: ["dentists-settings"],
    queryFn: () => primeos.entities.Dentist.list()
  });

  const [form, setForm] = useState({ name: "", specialty: "clinico_geral", email: "", phone: "", cro: "", color: "#6366f1", slot_duration_minutes: 30 });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const saveMutation = useMutation({
    mutationFn: async (data) => editId
      ? primeos.entities.Dentist.update(editId, data)
      : primeos.entities.Dentist.create({ ...data, is_active: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dentists-settings"] });
      setForm({ name: "", specialty: "clinico_geral", email: "", phone: "", cro: "", color: "#6366f1", slot_duration_minutes: 30 });
      setShowForm(false);
      setEditId(null);
      toast.success(editId ? "Profissional atualizado!" : "Profissional adicionado!");
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }) => primeos.entities.Dentist.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dentists-settings"] })
  });

  const edit = (d) => {
    setForm({ name: d.name, specialty: d.specialty, email: d.email || "", phone: d.phone || "", cro: d.cro || "", color: d.color || "#6366f1", slot_duration_minutes: d.slot_duration_minutes || 30 });
    setEditId(d.id);
    setShowForm(true);
  };

  const specialtyLabels = Object.fromEntries(SPECIALTIES.map(s => [s.value, s.label]));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-slate-400 text-sm">{dentists.length} profissional(is) cadastrado(s)</p>
        <Button onClick={() => { setEditId(null); setForm({ name: "", specialty: "clinico_geral", email: "", phone: "", cro: "", color: "#6366f1", slot_duration_minutes: 30 }); setShowForm(!showForm); }}
          className="bg-indigo-600 hover:bg-indigo-700 gap-2 h-8 text-sm">
          <Plus className="w-4 h-4" /> Novo Profissional
        </Button>
      </div>

      {showForm && (
        <Card className="bg-slate-700/50 border-slate-600">
          <CardHeader><CardTitle className="text-white text-sm">{editId ? "Editar Profissional" : "Novo Profissional"}</CardTitle></CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Nome Completo *</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="bg-slate-800 border-slate-600 text-white" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Especialidade</Label>
              <Select value={form.specialty} onValueChange={v => setForm({ ...form, specialty: v })}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>{SPECIALTIES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Email</Label>
              <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="bg-slate-800 border-slate-600 text-white" placeholder="email@clinica.com" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Telefone</Label>
              <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="bg-slate-800 border-slate-600 text-white" placeholder="(11) 99999-8888" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">CRO</Label>
              <Input value={form.cro} onChange={e => setForm({ ...form, cro: e.target.value })}
                className="bg-slate-800 border-slate-600 text-white" placeholder="CRO-SP 12345" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs">Cor no Calendário</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}
                    className="w-10 h-9 rounded border border-slate-600 bg-transparent cursor-pointer" />
                  <span className="text-slate-400 text-xs font-mono">{form.color}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs">Slot (min)</Label>
                <Select value={String(form.slot_duration_minutes)} onValueChange={v => setForm({ ...form, slot_duration_minutes: Number(v) })}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["15","20","30","45","60"].map(v => <SelectItem key={v} value={v}>{v} min</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="sm:col-span-2 flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="border-slate-600 text-slate-400 hover:text-white">Cancelar</Button>
              <Button onClick={() => saveMutation.mutate(form)} disabled={!form.name || saveMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                {saveMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8"><RefreshCw className="w-6 h-6 animate-spin text-indigo-400" /></div>
      ) : (
        <div className="space-y-2">
          {dentists.map(d => (
            <div key={d.id} className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: d.color || "#6366f1" }}>
                  {d.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{d.name}</p>
                  <p className="text-slate-400 text-xs">{specialtyLabels[d.specialty] || d.specialty} {d.cro ? `· ${d.cro}` : ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={d.is_active ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-slate-600/20 text-slate-500 border-slate-600/30"}>
                  {d.is_active ? "Ativo" : "Inativo"}
                </Badge>
                <Switch checked={!!d.is_active} onCheckedChange={v => toggleActiveMutation.mutate({ id: d.id, is_active: v })} />
                <Button size="sm" variant="outline" onClick={() => edit(d)}
                  className="h-7 text-xs border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700">
                  Editar
                </Button>
              </div>
            </div>
          ))}
          {dentists.length === 0 && <p className="text-center text-slate-500 py-6">Nenhum profissional cadastrado.</p>}
        </div>
      )}
    </div>
  );
}

function ResourcesSettings() {
  const queryClient = useQueryClient();

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["resources-settings"],
    queryFn: () => primeos.entities.Resource.list()
  });

  const [form, setForm] = useState({ name: "", type: "cadeira", location: "", description: "", requires_sterilization_minutes: 15 });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const saveMutation = useMutation({
    mutationFn: async (data) => editId
      ? primeos.entities.Resource.update(editId, data)
      : primeos.entities.Resource.create({ ...data, is_active: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources-settings"] });
      setForm({ name: "", type: "cadeira", location: "", description: "", requires_sterilization_minutes: 15 });
      setShowForm(false);
      setEditId(null);
      toast.success("Recurso salvo!");
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }) => primeos.entities.Resource.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resources-settings"] })
  });

  const edit = (r) => {
    setForm({ name: r.name, type: r.type, location: r.location || "", description: r.description || "", requires_sterilization_minutes: r.requires_sterilization_minutes || 15 });
    setEditId(r.id);
    setShowForm(true);
  };

  const typeLabels = { cadeira: "Cadeira", sala: "Sala", equipamento: "Equipamento", instrumento: "Instrumento" };
  const typeColors = { cadeira: "text-blue-400", sala: "text-teal-400", equipamento: "text-amber-400", instrumento: "text-purple-400" };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-slate-400 text-sm">{resources.length} recurso(s) cadastrado(s)</p>
        <Button onClick={() => { setEditId(null); setForm({ name: "", type: "cadeira", location: "", description: "", requires_sterilization_minutes: 15 }); setShowForm(!showForm); }}
          className="bg-indigo-600 hover:bg-indigo-700 gap-2 h-8 text-sm">
          <Plus className="w-4 h-4" /> Novo Recurso
        </Button>
      </div>

      {showForm && (
        <Card className="bg-slate-700/50 border-slate-600">
          <CardHeader><CardTitle className="text-white text-sm">{editId ? "Editar Recurso" : "Novo Recurso"}</CardTitle></CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Nome *</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Cadeira 1, Sala de Raio-X..." className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Tipo</Label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(typeLabels).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Localização / Sala</Label>
              <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                placeholder="Sala 1, 2º andar..." className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Tempo de Esterilização (min)</Label>
              <Input type="number" value={form.requires_sterilization_minutes} onChange={e => setForm({ ...form, requires_sterilization_minutes: Number(e.target.value) })}
                className="bg-slate-800 border-slate-600 text-white" />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-slate-300 text-xs">Descrição</Label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                rows={2} className="bg-slate-800 border-slate-600 text-white resize-none placeholder:text-slate-500" />
            </div>
            <div className="sm:col-span-2 flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="border-slate-600 text-slate-400 hover:text-white">Cancelar</Button>
              <Button onClick={() => saveMutation.mutate(form)} disabled={!form.name || saveMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                {saveMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8"><RefreshCw className="w-6 h-6 animate-spin text-indigo-400" /></div>
      ) : (
        <div className="space-y-2">
          {resources.map(r => (
            <div key={r.id} className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center">
                  <Building2 className={`w-4 h-4 ${typeColors[r.type] || "text-slate-400"}`} />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{r.name}</p>
                  <p className="text-slate-400 text-xs">{typeLabels[r.type]} {r.location ? `· ${r.location}` : ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={r.is_active ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-slate-600/20 text-slate-500 border-slate-600/30"}>
                  {r.is_active ? "Ativo" : "Inativo"}
                </Badge>
                <Switch checked={!!r.is_active} onCheckedChange={v => toggleActiveMutation.mutate({ id: r.id, is_active: v })} />
                <Button size="sm" variant="outline" onClick={() => edit(r)}
                  className="h-7 text-xs border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700">
                  Editar
                </Button>
              </div>
            </div>
          ))}
          {resources.length === 0 && <p className="text-center text-slate-500 py-6">Nenhum recurso cadastrado.</p>}
        </div>
      )}
    </div>
  );
}

function NotificationSettings() {
  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem("notification_settings");
    return stored ? JSON.parse(stored) : {
      reminder_24h: true,
      reminder_2h: true,
      reminder_whatsapp: true,
      reminder_message: "Olá {nome}! Lembramos sua consulta amanhã às {hora}. Confirme respondendo SIM.",
      follow_up_days: 3,
      follow_up_message: "Olá {nome}! Como foi seu tratamento? Estamos à disposição.",
      birthday_message: true,
      birthday_text: "Olá {nome}! Feliz Aniversário! 🎉 Um presente especial espera por você na nossa clínica.",
    };
  });

  const save = () => {
    localStorage.setItem("notification_settings", JSON.stringify(settings));
    toast.success("Configurações de notificação salvas!");
  };

  const ToggleRow = ({ label, desc, field }) => (
    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
      <div>
        <p className="text-white text-sm font-medium">{label}</p>
        <p className="text-slate-500 text-xs">{desc}</p>
      </div>
      <Switch checked={settings[field]} onCheckedChange={v => setSettings({ ...settings, [field]: v })} />
    </div>
  );

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader><CardTitle className="text-white text-sm flex items-center gap-2"><Bell className="w-4 h-4" /> Lembretes Automáticos</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <ToggleRow label="Lembrete 24h antes" desc="Enviar lembrete um dia antes da consulta" field="reminder_24h" />
          <ToggleRow label="Lembrete 2h antes" desc="Enviar lembrete 2 horas antes da consulta" field="reminder_2h" />
          <ToggleRow label="Via WhatsApp" desc="Abrir WhatsApp para envio de lembretes" field="reminder_whatsapp" />
          <ToggleRow label="Mensagem de Aniversário" desc="Parabenizar pacientes no aniversário" field="birthday_message" />
          <div className="space-y-1.5 pt-1">
            <Label className="text-slate-300 text-xs">Mensagem de Lembrete (use {"{nome}"} e {"{hora}"})</Label>
            <Textarea value={settings.reminder_message} onChange={e => setSettings({ ...settings, reminder_message: e.target.value })}
              rows={3} className="bg-slate-700 border-slate-600 text-white text-sm resize-none" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs">Mensagem de Follow-up pós consulta</Label>
            <Textarea value={settings.follow_up_message} onChange={e => setSettings({ ...settings, follow_up_message: e.target.value })}
              rows={3} className="bg-slate-700 border-slate-600 text-white text-sm resize-none" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs">Dias para Follow-up após consulta</Label>
            <Input type="number" value={settings.follow_up_days} onChange={e => setSettings({ ...settings, follow_up_days: Number(e.target.value) })}
              className="bg-slate-700 border-slate-600 text-white w-24" />
          </div>
        </CardContent>
      </Card>
      <Button onClick={save} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
        <Save className="w-4 h-4" /> Salvar Notificações
      </Button>
    </div>
  );
}

export default function AdminSettingsTab() {
  return (
    <Tabs defaultValue="clinic">
      <TabsList className="bg-slate-800/50 border border-slate-700 mb-6 flex-wrap h-auto gap-1 p-1">
        <TabsTrigger value="clinic" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 gap-2">
          <Building2 className="w-4 h-4" /> Clínica
        </TabsTrigger>
        <TabsTrigger value="dentists" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 gap-2">
          <Stethoscope className="w-4 h-4" /> Profissionais
        </TabsTrigger>
        <TabsTrigger value="resources" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 gap-2">
          <Building2 className="w-4 h-4" /> Recursos
        </TabsTrigger>
        <TabsTrigger value="notifications" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 gap-2">
          <Bell className="w-4 h-4" /> Notificações
        </TabsTrigger>
      </TabsList>
      <TabsContent value="clinic"><ClinicSettings /></TabsContent>
      <TabsContent value="dentists"><DentistsSettings /></TabsContent>
      <TabsContent value="resources"><ResourcesSettings /></TabsContent>
      <TabsContent value="notifications"><NotificationSettings /></TabsContent>
    </Tabs>
  );
}
