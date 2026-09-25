// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell, Plus, Play, Trash2, CheckCircle2, XCircle,
  Mail, MessageCircle, Clock, Calendar, DollarSign,
  UserX, RefreshCw, Edit2, Zap, Info, Heart
} from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const TRIGGER_CONFIG = {
  checkup_reminder: {
    label: "Retorno Preventivo (Checkup)",
    icon: Heart,
    color: "bg-teal-50 text-teal-700 border-teal-200",
    iconColor: "text-teal-600",
    defaultOffset: 30,
    offsetLabel: "dias ANTES do retorno programado",
    defaultSubject: "Hora do seu retorno preventivo!",
    defaultMessage: "Olá {nome}! 🦷\n\nSua revisão preventiva está próxima — prevista para {data}.\n\nServiço: {servico}\nProfissional: {profissional}\n\nEntrar em contato para agendar é simples e rápido. Não deixe para depois!\n\nAté breve!\nPrime Odontologia",
  },
  appointment_reminder: {
    label: "Lembrete de Consulta",
    icon: Calendar,
    color: "bg-blue-50 text-blue-700 border-blue-200",
    iconColor: "text-blue-600",
    defaultOffset: -1,
    offsetLabel: "dias ANTES da consulta",
    defaultSubject: "Lembrete: sua consulta é amanhã!",
    defaultMessage: "Olá {nome}! 👋\n\nSua consulta está agendada para {data} às {hora}.\n\nServiço: {servico}\n\nCaso precise remarcar, entre em contato conosco.\n\nAté logo!\nPrime Odontologia",
  },
  post_consultation: {
    label: "Pós-Consulta",
    icon: CheckCircle2,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconColor: "text-emerald-600",
    defaultOffset: 3,
    offsetLabel: "dias APÓS a consulta",
    defaultSubject: "Como foi sua consulta?",
    defaultMessage: "Olá {nome}! 😊\n\nEsperamos que sua consulta no dia {data} tenha sido ótima!\n\nSua saúde bucal é nossa prioridade. Tem alguma dúvida ou desconforto? Estamos à disposição.\n\nAté a próxima!\nPrime Odontologia",
  },
  overdue_payment: {
    label: "Pagamento em Atraso",
    icon: DollarSign,
    color: "bg-amber-50 text-amber-700 border-amber-200",
    iconColor: "text-amber-600",
    defaultOffset: 3,
    offsetLabel: "dias APÓS o vencimento",
    defaultSubject: "Lembrete de pagamento pendente",
    defaultMessage: "Olá {nome},\n\nIdentificamos que o pagamento de {valor} referente a {servico} está pendente desde {data}.\n\nPor favor, entre em contato para regularizar ou solicite um novo link de pagamento.\n\nAtenciosamente,\nPrime Odontologia",
  },
  inactive_patient: {
    label: "Paciente Inativo",
    icon: UserX,
    color: "bg-purple-50 text-purple-700 border-purple-200",
    iconColor: "text-purple-600",
    defaultOffset: 180,
    offsetLabel: "dias sem consulta",
    defaultSubject: "Sentimos sua falta!",
    defaultMessage: "Olá {nome}! 💙\n\nFaz algum tempo que não nos visitou. Sua saúde bucal é importante!\n\nAgende sua consulta de revisão — prevenção é sempre o melhor caminho.\n\nEstamos esperando por você!\nPrime Odontologia",
  },
};

const STATUS_CONFIG = {
  sent: { label: "Enviado", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  failed: { label: "Falhou", color: "bg-rose-50 text-rose-700 border-rose-200", icon: XCircle },
  skipped: { label: "Ignorado", color: "bg-slate-50 text-slate-500 border-slate-200", icon: Clock },
};

function RuleForm({ rule, onClose, onSave }) {
  const trigger = rule?.trigger || "appointment_reminder";
  const cfg = TRIGGER_CONFIG[trigger];
  const [form, setForm] = useState({
    name: rule?.name || cfg.label,
    trigger: trigger,
    is_active: rule?.is_active ?? true,
    channel: rule?.channel || "email",
    days_offset: rule?.days_offset ?? cfg.defaultOffset,
    subject: rule?.subject || cfg.defaultSubject,
    message_template: rule?.message_template || cfg.defaultMessage,
  });

  const activeCfg = TRIGGER_CONFIG[form.trigger];

  const handleTriggerChange = (t) => {
    const c = TRIGGER_CONFIG[t];
    setForm(f => ({
      ...f,
      trigger: t,
      name: f.name === activeCfg.label ? c.label : f.name,
      days_offset: c.defaultOffset,
      subject: f.subject === activeCfg.defaultSubject ? c.defaultSubject : f.subject,
      message_template: f.message_template === activeCfg.defaultMessage ? c.defaultMessage : f.message_template,
    }));
  };

  const vars = form.trigger === "overdue_payment"
    ? ["{nome}", "{valor}", "{data}", "{servico}"]
    : form.trigger === "checkup_reminder"
    ? ["{nome}", "{data}", "{servico}", "{profissional}", "{intervalo}"]
    : ["{nome}", "{data}", "{hora}", "{servico}"];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label>Nome da Regra</Label>
          <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Gatilho</Label>
          <Select value={form.trigger} onValueChange={handleTriggerChange}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(TRIGGER_CONFIG).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Canal</Label>
          <Select value={form.channel} onValueChange={v => setForm({ ...form, channel: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="whatsapp_link">Link WhatsApp</SelectItem>
              <SelectItem value="both">Email + WhatsApp</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Quantidade de dias</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={Math.abs(form.days_offset)}
              onChange={e => {
                const raw = parseInt(e.target.value) || 0;
                const sign = form.trigger === "appointment_reminder" ? -1 : 1;
                setForm({ ...form, days_offset: raw * sign });
              }}
              className="w-24"
            />
            <span className="text-sm text-slate-500">{activeCfg.offsetLabel}</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Assunto do Email</Label>
          <Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Mensagem</Label>
          <div className="flex flex-wrap gap-1 mb-1">
            {vars.map(v => (
              <Badge key={v} variant="outline" className="text-xs cursor-pointer hover:bg-slate-100"
                onClick={() => setForm({ ...form, message_template: form.message_template + v })}>
                {v}
              </Badge>
            ))}
          </div>
          <Textarea
            value={form.message_template}
            onChange={e => setForm({ ...form, message_template: e.target.value })}
            rows={6}
            className="font-mono text-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />
          <Label>Regra ativa</Label>
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={() => onSave(form)} className="bg-indigo-600 hover:bg-indigo-700">
          Salvar Regra
        </Button>
      </div>
    </div>
  );
}

export default function FollowUpAutomation() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [running, setRunning] = useState(false);

  const { data: rules = [], isLoading: loadingRules } = useQuery({
    queryKey: ["followUpRules"],
    queryFn: () => primeos.entities.FollowUpRule.list("-created_date"),
  });

  const { data: logs = [], isLoading: loadingLogs } = useQuery({
    queryKey: ["followUpLogs"],
    queryFn: () => primeos.entities.FollowUpLog.list("-created_date", 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => primeos.entities.FollowUpRule.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["followUpRules"] }); setShowForm(false); setEditing(null); toast.success("Regra criada!"); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.FollowUpRule.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["followUpRules"] }); setShowForm(false); setEditing(null); toast.success("Regra atualizada!"); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => primeos.entities.FollowUpRule.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["followUpRules"] }); toast.success("Regra removida."); },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => primeos.entities.FollowUpRule.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["followUpRules"] }),
  });

  const handleSave = (data) => {
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  const runNow = async () => {
    setRunning(true);
    try {
      const res = await primeos.functions.invoke("processFollowUps", {});
      const d = res.data;
      toast.success(`Concluído: ${d.sent} enviados, ${d.skipped} ignorados, ${d.failed} falhas.`);
      queryClient.invalidateQueries({ queryKey: ["followUpLogs"] });
      queryClient.invalidateQueries({ queryKey: ["followUpRules"] });
    } catch (err) {
      toast.error("Erro ao executar: " + err.message);
    }
    setRunning(false);
  };

  const sentToday = logs.filter(l => {
    const d = new Date(l.created_date);
    const now = new Date();
    return d.toDateString() === now.toDateString() && l.status === "sent";
  }).length;

  const activeRules = rules.filter(r => r.is_active).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-6 h-6 text-indigo-600" />
              Follow-up Automático
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">Regras de comunicação automática com pacientes</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={runNow} disabled={running} className="gap-2">
              {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Executar Agora
            </Button>
            <Button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
              <Plus className="w-4 h-4" /> Nova Regra
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: "Regras Ativas", value: activeRules, icon: Zap, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Total de Regras", value: rules.length, icon: Bell, color: "text-slate-600", bg: "bg-slate-50" },
            { label: "Enviados Hoje", value: sentToday, icon: Mail, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Retornos Notificados", value: logs.filter(l => l.trigger === "checkup_reminder" && l.status === "sent").length, icon: Heart, color: "text-teal-600", bg: "bg-teal-50" },
            { label: "Total no Histórico", value: logs.filter(l => l.status === "sent").length, icon: CheckCircle2, color: "text-purple-600", bg: "bg-purple-50" },
          ].map((s) => (
            <Card key={s.label} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", s.bg)}>
                  <s.icon className={cn("w-5 h-5", s.color)} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className="text-xl font-bold text-slate-900">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info banner */}
        <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-xl flex gap-2 text-sm text-blue-700">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>O sistema executa automaticamente <strong>todos os dias às 8h</strong>. Retornos preventivos baseados em <code className="bg-blue-100 px-1 rounded text-xs">checkup_schedule</code> do paciente são enviados por email e uma notificação interna é enviada para administradores. WhatsApp gera link manual.</span>
        </div>

        <Tabs defaultValue="rules">
          <TabsList className="mb-6">
            <TabsTrigger value="rules" className="gap-2">
              <Bell className="w-4 h-4" /> Regras ({rules.length})
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2">
              <Clock className="w-4 h-4" /> Histórico ({logs.length})
            </TabsTrigger>
          </TabsList>

          {/* RULES */}
          <TabsContent value="rules">
            {loadingRules ? (
              <div className="flex justify-center py-12"><RefreshCw className="w-6 h-6 animate-spin text-indigo-400" /></div>
            ) : rules.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Nenhuma regra criada</p>
                <p className="text-sm mt-1">Crie sua primeira regra de follow-up automático</p>
                <Button onClick={() => setShowForm(true)} className="mt-4 bg-indigo-600 hover:bg-indigo-700 gap-2">
                  <Plus className="w-4 h-4" /> Criar Regra
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {rules.map(rule => {
                  const cfg = TRIGGER_CONFIG[rule.trigger] || TRIGGER_CONFIG.appointment_reminder;
                  const Icon = cfg.icon;
                  return (
                    <Card key={rule.id} className={cn("border shadow-sm transition-opacity", !rule.is_active && "opacity-60")}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", cfg.color)}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-slate-900">{rule.name}</h3>
                                <Badge variant="outline" className={cn("text-xs", cfg.color)}>{cfg.label}</Badge>
                                {rule.channel === "email" && <Badge variant="outline" className="text-xs gap-1"><Mail className="w-3 h-3" />Email</Badge>}
                                {rule.channel === "whatsapp_link" && <Badge variant="outline" className="text-xs gap-1 text-emerald-700 border-emerald-200"><MessageCircle className="w-3 h-3" />WhatsApp</Badge>}
                                {rule.channel === "both" && <Badge variant="outline" className="text-xs">Email + WhatsApp</Badge>}
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {Math.abs(rule.days_offset || 0)} {cfg.offsetLabel}
                                {rule.last_run && ` · Último envio: ${format(parseISO(rule.last_run), "dd/MM HH:mm", { locale: ptBR })}`}
                                {rule.total_sent > 0 && ` · ${rule.total_sent} enviados no total`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={!!rule.is_active}
                              onCheckedChange={v => toggleMutation.mutate({ id: rule.id, is_active: v })}
                            />
                            <Button size="sm" variant="outline" className="h-8 gap-1"
                              onClick={() => { setEditing(rule); setShowForm(true); }}>
                              <Edit2 className="w-3.5 h-3.5" /> Editar
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 text-rose-600 border-rose-200 hover:bg-rose-50"
                              onClick={() => deleteMutation.mutate(rule.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* LOGS */}
          <TabsContent value="logs">
            {loadingLogs ? (
              <div className="flex justify-center py-12"><RefreshCw className="w-6 h-6 animate-spin text-indigo-400" /></div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>Nenhum envio registrado ainda</p>
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map(log => {
                  const s = STATUS_CONFIG[log.status] || STATUS_CONFIG.sent;
                  const SIcon = s.icon;
                  const cfg = TRIGGER_CONFIG[log.trigger];
                  return (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <SIcon className={cn("w-4 h-4 flex-shrink-0", log.status === "sent" ? "text-emerald-500" : log.status === "failed" ? "text-rose-500" : "text-slate-400")} />
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{log.patient_name}</p>
                          <p className="text-xs text-slate-400">
                            {log.rule_name} · {cfg?.label || log.trigger}
                            {log.patient_email ? ` · ${log.patient_email}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={cn("text-xs", s.color)}>{s.label}</Badge>
                        {log.created_date && (
                          <span className="text-xs text-slate-400">
                            {format(parseISO(log.created_date), "dd/MM HH:mm", { locale: ptBR })}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Rule Form Dialog */}
      <Dialog open={showForm} onOpenChange={() => { setShowForm(false); setEditing(null); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Regra" : "Nova Regra de Follow-up"}</DialogTitle>
          </DialogHeader>
          <RuleForm
            rule={editing}
            onClose={() => { setShowForm(false); setEditing(null); }}
            onSave={handleSave}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
