// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Bell, Plus, Pencil, Trash2, Mail, MessageCircle,
  Clock, Zap, CheckCircle, Tag, Stethoscope, ChevronDown, ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const HOUR_PRESETS = [
  { label: "1 hora antes", value: 1 },
  { label: "2 horas antes", value: 2 },
  { label: "6 horas antes", value: 6 },
  { label: "12 horas antes", value: 12 },
  { label: "24 horas antes (1 dia)", value: 24 },
  { label: "48 horas antes (2 dias)", value: 48 },
  { label: "72 horas antes (3 dias)", value: 72 },
  { label: "168 horas antes (1 semana)", value: 168 },
];

const SERVICE_TYPES = [
  "consultation", "follow_up", "procedure", "checkup", "emergency", "therapy", "diagnostic"
];

const SERVICE_LABELS = {
  consultation: "Consulta", follow_up: "Retorno", procedure: "Procedimento",
  checkup: "Check-up", emergency: "Emergência", therapy: "Terapia", diagnostic: "Diagnóstico"
};

const EMPTY_FORM = {
  name: "",
  is_active: true,
  hours_before: 24,
  channels: ["email"],
  applies_to_segments: [],
  applies_to_services: [],
  email_subject: "",
  email_body: "",
  whatsapp_message: "",
};

function ScheduleCard({ schedule, onEdit, onDelete, onToggle }) {
  const [expanded, setExpanded] = useState(false);
  const hours = schedule.hours_before || 24;
  const timeLabel = hours >= 168 ? `${Math.round(hours / 168)}sem` : hours >= 24 ? `${Math.round(hours / 24)}d` : `${hours}h`;

  return (
    <Card className={cn("border transition-all", schedule.is_active ? "border-slate-200" : "border-slate-100 opacity-60")}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm",
            schedule.is_active ? "bg-indigo-600" : "bg-slate-300")}>
            {timeLabel}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-900">{schedule.name}</span>
              {schedule.is_active
                ? <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">Ativa</Badge>
                : <Badge className="bg-slate-100 text-slate-500 border-0 text-xs">Inativa</Badge>}
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />{hours}h antes
              </span>
              <div className="flex items-center gap-1">
                {schedule.channels?.includes("email") && <Mail className="w-3.5 h-3.5 text-indigo-500" />}
                {schedule.channels?.includes("whatsapp") && <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />}
              </div>
              {schedule.total_sent > 0 && (
                <span className="text-xs text-slate-400">{schedule.total_sent} enviados</span>
              )}
            </div>
            {schedule.applies_to_segments?.length > 0 && (
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {schedule.applies_to_segments.map(s => (
                  <span key={s} className="text-xs bg-purple-50 text-purple-600 rounded-full px-2 py-0.5 flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5" />{s}
                  </span>
                ))}
              </div>
            )}
            {schedule.applies_to_services?.length > 0 && (
              <div className="flex gap-1 mt-1 flex-wrap">
                {schedule.applies_to_services.map(s => (
                  <span key={s} className="text-xs bg-blue-50 text-blue-600 rounded-full px-2 py-0.5">
                    {SERVICE_LABELS[s] || s}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Switch checked={schedule.is_active} onCheckedChange={(v) => onToggle(schedule, v)} />
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(schedule)}>
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500 hover:text-rose-700" onClick={() => onDelete(schedule)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
            <button onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
            {schedule.email_subject && (
              <div><span className="font-medium text-slate-500">Assunto: </span>{schedule.email_subject}</div>
            )}
            {schedule.whatsapp_message && (
              <div><span className="font-medium text-slate-500">WhatsApp: </span>{schedule.whatsapp_message.slice(0, 120)}...</div>
            )}
            {schedule.last_run_at && (
              <div className="text-slate-400">
                Última execução: {formatDistanceToNow(new Date(schedule.last_run_at), { addSuffix: true, locale: ptBR })}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ScheduleForm({ open, onClose, schedule }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(schedule ? { ...schedule } : { ...EMPTY_FORM });
  const [newTag, setNewTag] = useState("");

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const toggleChannel = (ch) => {
    const channels = form.channels?.includes(ch)
      ? form.channels.filter(c => c !== ch)
      : [...(form.channels || []), ch];
    set("channels", channels);
  };

  const toggleService = (s) => {
    const list = form.applies_to_services?.includes(s)
      ? form.applies_to_services.filter(x => x !== s)
      : [...(form.applies_to_services || []), s];
    set("applies_to_services", list);
  };

  const addTag = () => {
    if (!newTag.trim()) return;
    set("applies_to_segments", [...(form.applies_to_segments || []), newTag.trim()]);
    setNewTag("");
  };

  const removeTag = (t) => set("applies_to_segments", form.applies_to_segments.filter(x => x !== t));

  const saveMutation = useMutation({
    mutationFn: (data) => schedule
      ? primeos.entities.ReminderSchedule.update(schedule.id, data)
      : primeos.entities.ReminderSchedule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminderSchedules"] });
      toast.success(schedule ? "Regra atualizada!" : "Regra criada!");
      onClose();
    }
  });

  const handleSave = () => {
    if (!form.name) { toast.error("Informe o nome da regra."); return; }
    if (!form.channels?.length) { toast.error("Selecione pelo menos um canal."); return; }
    saveMutation.mutate(form);
  };

  const hourPreset = HOUR_PRESETS.find(p => p.value === form.hours_before);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{schedule ? "Editar Regra de Lembrete" : "Nova Regra de Lembrete"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 pt-2">

          {/* Name */}
          <div className="space-y-1.5">
            <Label>Nome da Regra</Label>
            <Input placeholder="Ex: Lembrete 24h antes" value={form.name} onChange={e => set("name", e.target.value)} />
          </div>

          {/* Timing */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Quando enviar</Label>
            <Select value={String(form.hours_before)} onValueChange={v => set("hours_before", Number(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {HOUR_PRESETS.map(p => (
                  <SelectItem key={p.value} value={String(p.value)}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Channels */}
          <div className="space-y-2">
            <Label>Canais de Envio</Label>
            <div className="flex gap-3">
              <button type="button" onClick={() => toggleChannel("email")}
                className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all text-sm font-medium",
                  form.channels?.includes("email") ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500")}>
                <Mail className="w-4 h-4" />E-mail
                {form.channels?.includes("email") && <CheckCircle className="w-4 h-4 text-indigo-500" />}
              </button>
              <button type="button" onClick={() => toggleChannel("whatsapp")}
                className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all text-sm font-medium",
                  form.channels?.includes("whatsapp") ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500")}>
                <MessageCircle className="w-4 h-4" />WhatsApp
                {form.channels?.includes("whatsapp") && <CheckCircle className="w-4 h-4 text-emerald-500" />}
              </button>
            </div>
            {form.channels?.includes("whatsapp") && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" />
                WhatsApp: o sistema gera o link automaticamente. Requer que o paciente tenha telefone cadastrado.
              </p>
            )}
          </div>

          {/* Segments filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" />Aplicar apenas a tags/segmentos (opcional)</Label>
            <div className="flex gap-2">
              <Input placeholder="Tag do paciente..." value={newTag} onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addTag()} className="flex-1" />
              <Button type="button" variant="outline" onClick={addTag} size="sm">Adicionar</Button>
            </div>
            {form.applies_to_segments?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.applies_to_segments.map(t => (
                  <span key={t} className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 rounded-full px-2.5 py-0.5 text-xs">
                    #{t}
                    <button onClick={() => removeTag(t)} className="hover:text-red-600 ml-0.5">×</button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-slate-400">Deixe vazio para aplicar a todos os pacientes</p>
          </div>

          {/* Service filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Stethoscope className="w-3.5 h-3.5" />Tipos de serviço (opcional)</Label>
            <div className="flex flex-wrap gap-2">
              {SERVICE_TYPES.map(s => (
                <button key={s} type="button" onClick={() => toggleService(s)}
                  className={cn("text-xs px-3 py-1.5 rounded-full border transition-all",
                    form.applies_to_services?.includes(s)
                      ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                      : "border-slate-200 text-slate-500 hover:border-blue-300")}>
                  {SERVICE_LABELS[s]}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400">Deixe vazio para todos os serviços</p>
          </div>

          {/* Email customization */}
          {form.channels?.includes("email") && (
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Mail className="w-4 h-4 text-indigo-500" />Personalizar E-mail (opcional)</p>
              <div className="space-y-1.5">
                <Label className="text-xs">Assunto</Label>
                <Input placeholder="Ex: Sua consulta é amanhã — Prime Odontologia" value={form.email_subject} onChange={e => set("email_subject", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Corpo do e-mail (HTML ou texto)</Label>
                <Textarea rows={4} placeholder="Use {{nome}}, {{data}}, {{hora}}, {{servico}}, {{profissional}}" value={form.email_body} onChange={e => set("email_body", e.target.value)} className="font-mono text-xs" />
              </div>
              <p className="text-xs text-slate-400">Deixe em branco para usar o template padrão com design profissional</p>
            </div>
          )}

          {/* WhatsApp customization */}
          {form.channels?.includes("whatsapp") && (
            <div className="space-y-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <p className="text-sm font-semibold text-emerald-700 flex items-center gap-2"><MessageCircle className="w-4 h-4" />Personalizar WhatsApp (opcional)</p>
              <Textarea rows={4} placeholder="Olá {{nome}}! Sua consulta é {{data}} às {{hora}}. Use {{servico}} e {{profissional}} também." value={form.whatsapp_message} onChange={e => set("whatsapp_message", e.target.value)} className="text-xs" />
              <p className="text-xs text-emerald-600">Deixe em branco para usar mensagem padrão</p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Switch checked={form.is_active} onCheckedChange={v => set("is_active", v)} />
            <Label>Regra ativa</Label>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
              {saveMutation.isPending ? "Salvando..." : "Salvar Regra"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ReminderScheduleManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["reminderSchedules"],
    queryFn: () => primeos.entities.ReminderSchedule.list("-created_date"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => primeos.entities.ReminderSchedule.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reminderSchedules"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => primeos.entities.ReminderSchedule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminderSchedules"] });
      toast.success("Regra removida.");
    },
  });

  const handleEdit = (s) => { setEditing(s); setShowForm(true); };
  const handleNew = () => { setEditing(null); setShowForm(true); };

  const activeCount = schedules.filter(s => s.is_active).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600" />
            Configurar Lembretes Automáticos
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeCount} regra(s) ativa(s) · O sistema verifica a cada hora e envia automaticamente
          </p>
        </div>
        <Button onClick={handleNew} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Plus className="w-4 h-4" />Nova Regra
        </Button>
      </div>

      {/* Automation status badge */}
      <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-700">
        <Zap className="w-3.5 h-3.5" />
        <span>Automação ativa · Verifica e envia lembretes automaticamente a cada hora</span>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-slate-400 text-sm">Carregando...</div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-10">
          <Bell className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Nenhuma regra configurada</p>
          <p className="text-xs text-slate-400 mb-4">Crie regras para enviar lembretes automáticos aos pacientes</p>
          <Button onClick={handleNew} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
            <Plus className="w-4 h-4" />Criar Primeira Regra
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map(s => (
            <ScheduleCard
              key={s.id}
              schedule={s}
              onEdit={handleEdit}
              onDelete={(s) => deleteMutation.mutate(s.id)}
              onToggle={(s, v) => toggleMutation.mutate({ id: s.id, is_active: v })}
            />
          ))}
        </div>
      )}

      <ScheduleForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        schedule={editing}
      />
    </div>
  );
}
