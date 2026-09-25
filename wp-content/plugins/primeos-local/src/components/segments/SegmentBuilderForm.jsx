// @ts-nocheck
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Mail, MessageCircle, Phone, Star,
  Calendar, DollarSign, Tag, Clock, Activity, CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const ACTION_TYPES = [
  { value: "reactivation", label: "Reativação", color: "bg-rose-100 text-rose-700" },
  { value: "loyalty", label: "Fidelização", color: "bg-amber-100 text-amber-700" },
  { value: "upsell", label: "Upsell", color: "bg-emerald-100 text-emerald-700" },
  { value: "referral", label: "Indicação", color: "bg-purple-100 text-purple-700" },
  { value: "reminder", label: "Lembrete", color: "bg-blue-100 text-blue-700" },
  { value: "offer", label: "Oferta", color: "bg-orange-100 text-orange-700" },
  { value: "followup", label: "Follow-up", color: "bg-indigo-100 text-indigo-700" },
  { value: "educational", label: "Educacional", color: "bg-teal-100 text-teal-700" },
];

const CHANNEL_OPTIONS = [
  { value: "email", label: "E-mail", icon: Mail },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "sms", label: "SMS", icon: Star },
  { value: "call", label: "Ligação", icon: Phone },
];

const STATUS_OPTIONS = ["lead", "prospect", "active", "inactive", "churned"];
const SERVICE_OPTIONS = ["consultation", "follow_up", "procedure", "checkup", "therapy", "diagnostic"];

const EMPTY_ACTION = { label: "", description: "", type: "reactivation", channels: ["whatsapp"], priority: "medium", message_template: "" };
const EMPTY_CRITERIA = {
  min_appointments: "", max_appointments: "",
  min_total_spent: "", max_total_spent: "",
  min_days_since_last_visit: "", max_days_since_last_visit: "",
  tags: [], status: [], service_types: [],
  min_lifetime_value: "", city: "", has_phone: false, has_email: false
};

export default function SegmentBuilderForm({ open, onClose, segment, onSubmit, isSubmitting }) {
  const [form, setForm] = useState(segment ? {
    ...segment,
    criterios: { ...EMPTY_CRITERIA, ...(segment.criterios || {}) },
    actions: segment.actions || []
  } : {
    name: "", descricao: "", icon: "🎯", cor: "#6366f1", ativo: true,
    criterios: { ...EMPTY_CRITERIA },
    actions: []
  });
  const [tagInput, setTagInput] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setCrit = (k, v) => setForm(f => ({ ...f, criterios: { ...f.criterios, [k]: v } }));

  const toggleStatus = (s) => {
    const arr = form.criterios.status || [];
    setCrit("status", arr.includes(s) ? arr.filter(x => x !== s) : [...arr, s]);
  };
  const toggleService = (s) => {
    const arr = form.criterios.service_types || [];
    setCrit("service_types", arr.includes(s) ? arr.filter(x => x !== s) : [...arr, s]);
  };
  const addTag = () => {
    if (!tagInput.trim()) return;
    setCrit("tags", [...(form.criterios.tags || []), tagInput.trim()]);
    setTagInput("");
  };
  const removeTag = (t) => setCrit("tags", form.criterios.tags.filter(x => x !== t));

  const addAction = () => set("actions", [...(form.actions || []), { ...EMPTY_ACTION }]);
  const updateAction = (i, k, v) => {
    const updated = [...(form.actions || [])];
    updated[i] = { ...updated[i], [k]: v };
    set("actions", updated);
  };
  const toggleActionChannel = (i, ch) => {
    const arr = form.actions[i].channels || [];
    updateAction(i, "channels", arr.includes(ch) ? arr.filter(x => x !== ch) : [...arr, ch]);
  };
  const removeAction = (i) => set("actions", form.actions.filter((_, idx) => idx !== i));

  const handleSubmit = () => {
    // Clean up empty numeric fields
    const cleanCrit = { ...form.criterios };
    Object.keys(cleanCrit).forEach(k => {
      if (cleanCrit[k] === "" || cleanCrit[k] === null) delete cleanCrit[k];
    });
    onSubmit({ ...form, criterios: cleanCrit });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{segment ? "Editar Segmento" : "Novo Segmento de Pacientes"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Basics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <Label>Ícone</Label>
              <Input value={form.icon} onChange={e => set("icon", e.target.value)} className="text-xl text-center" maxLength={4} />
            </div>
            <div className="col-span-2">
              <Label>Nome do Segmento *</Label>
              <Input placeholder="Ex: Pacientes Inativos" value={form.name} onChange={e => set("name", e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea placeholder="Descreva quem faz parte deste segmento e o objetivo..." rows={2} value={form.descricao} onChange={e => set("descricao", e.target.value)} />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label>Cor</Label>
              <input type="color" value={form.cor} onChange={e => set("cor", e.target.value)} className="w-9 h-9 rounded-lg cursor-pointer border border-slate-200" />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Switch checked={form.ativo} onCheckedChange={v => set("ativo", v)} />
              <Label>Ativo</Label>
            </div>
          </div>

          {/* Criteria */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Activity className="w-4 h-4 text-indigo-500" />Critérios de Segmentação</h3>
            <p className="text-xs text-slate-400">Deixe em branco os critérios que não deseja usar. Todos os critérios preenchidos devem ser satisfeitos.</p>

            {/* Appointments */}
            <div>
              <Label className="flex items-center gap-1.5 mb-2"><Calendar className="w-3.5 h-3.5 text-slate-500" />Número de Consultas</Label>
              <div className="grid grid-cols-2 gap-3">
                <div><Input type="number" placeholder="Mín." value={form.criterios.min_appointments} onChange={e => setCrit("min_appointments", e.target.value)} /></div>
                <div><Input type="number" placeholder="Máx." value={form.criterios.max_appointments} onChange={e => setCrit("max_appointments", e.target.value)} /></div>
              </div>
            </div>

            {/* Spending */}
            <div>
              <Label className="flex items-center gap-1.5 mb-2"><DollarSign className="w-3.5 h-3.5 text-slate-500" />Total Gasto (R$)</Label>
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" placeholder="Mín. R$" value={form.criterios.min_total_spent} onChange={e => setCrit("min_total_spent", e.target.value)} />
                <Input type="number" placeholder="Máx. R$" value={form.criterios.max_total_spent} onChange={e => setCrit("max_total_spent", e.target.value)} />
              </div>
            </div>

            {/* Last visit */}
            <div>
              <Label className="flex items-center gap-1.5 mb-2"><Clock className="w-3.5 h-3.5 text-slate-500" />Dias desde última visita</Label>
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" placeholder="Mín. dias" value={form.criterios.min_days_since_last_visit} onChange={e => setCrit("min_days_since_last_visit", e.target.value)} />
                <Input type="number" placeholder="Máx. dias" value={form.criterios.max_days_since_last_visit} onChange={e => setCrit("max_days_since_last_visit", e.target.value)} />
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label className="flex items-center gap-1.5 mb-2"><Tag className="w-3.5 h-3.5 text-slate-500" />Tags do Paciente</Label>
              <div className="flex gap-2 mb-2">
                <Input placeholder="Ex: vip, ortodontia..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addTag()} className="flex-1" />
                <Button type="button" variant="outline" onClick={addTag} size="sm">Adicionar</Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {form.criterios.tags?.map(t => (
                  <span key={t} className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 rounded-full px-2.5 py-0.5 text-xs">
                    #{t}<button onClick={() => removeTag(t)} className="hover:text-red-600 ml-0.5">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <Label className="mb-2 block">Status do Paciente</Label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map(s => (
                  <button key={s} type="button" onClick={() => toggleStatus(s)}
                    className={cn("text-xs px-3 py-1.5 rounded-full border transition-all capitalize",
                      form.criterios.status?.includes(s) ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-medium" : "border-slate-200 text-slate-500 hover:border-indigo-300")}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Service types */}
            <div>
              <Label className="mb-2 block">Tipos de Consulta Realizados</Label>
              <div className="flex flex-wrap gap-2">
                {SERVICE_OPTIONS.map(s => {
                  const labels = { consultation: "Consulta", follow_up: "Retorno", procedure: "Procedimento", checkup: "Check-up", therapy: "Terapia", diagnostic: "Diagnóstico" };
                  return (
                    <button key={s} type="button" onClick={() => toggleService(s)}
                      className={cn("text-xs px-3 py-1.5 rounded-full border transition-all",
                        form.criterios.service_types?.includes(s) ? "border-blue-500 bg-blue-50 text-blue-700 font-medium" : "border-slate-200 text-slate-500 hover:border-blue-300")}>
                      {labels[s]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Star className="w-4 h-4 text-amber-500" />Ações Sugeridas</h3>
              <Button type="button" variant="outline" size="sm" onClick={addAction} className="gap-1.5">
                <Plus className="w-3.5 h-3.5" />Adicionar Ação
              </Button>
            </div>

            {form.actions?.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-3">Nenhuma ação configurada. Adicione ações para guiar a equipe.</p>
            )}

            {form.actions?.map((action, i) => (
              <div key={i} className="border border-slate-100 rounded-xl p-3 space-y-3 bg-slate-50">
                <div className="flex items-center gap-2">
                  <Select value={action.type} onValueChange={v => updateAction(i, "type", v)}>
                    <SelectTrigger className="w-36 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTION_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={action.priority} onValueChange={v => updateAction(i, "priority", v)}>
                    <SelectTrigger className="w-28 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Alta prioridade</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                  <button type="button" onClick={() => removeAction(i)} className="ml-auto text-slate-400 hover:text-rose-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <Input placeholder="Nome da ação (ex: Enviar oferta de retorno)" value={action.label} onChange={e => updateAction(i, "label", e.target.value)} className="h-8 text-sm" />
                <Input placeholder="Descrição breve" value={action.description} onChange={e => updateAction(i, "description", e.target.value)} className="h-8 text-xs" />
                <div>
                  <Label className="text-xs mb-1.5 block">Canais de comunicação</Label>
                  <div className="flex gap-2 flex-wrap">
                    {CHANNEL_OPTIONS.map(ch => {
                      const Icon = ch.icon;
                      const active = action.channels?.includes(ch.value);
                      return (
                        <button key={ch.value} type="button" onClick={() => toggleActionChannel(i, ch.value)}
                          className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all",
                            active ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500 hover:border-indigo-200")}>
                          <Icon className="w-3 h-3" />{ch.label}
                          {active && <CheckCircle className="w-3 h-3" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <Textarea placeholder="Template de mensagem opcional (use {{nome}}, {{data}}, {{valor}})" rows={2} value={action.message_template} onChange={e => updateAction(i, "message_template", e.target.value)} className="text-xs" />
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
              {isSubmitting ? "Salvando..." : segment ? "Atualizar Segmento" : "Criar Segmento"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
