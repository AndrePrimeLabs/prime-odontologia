import { useState, useMemo } from "react";
import { primeos } from "@/api/primeosClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle, CheckCircle2, FileText, UserCheck, Plus, Bell,
  Flame, X, ChevronRight, BarChart3, Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const DPS_HIGH = 14;
const DPS_MED = 8;

function dpsColor(score) {
  if (score >= DPS_HIGH) return { bg: "bg-red-500", text: "text-red-600", light: "bg-red-50 border-red-200" };
  if (score >= DPS_MED)  return { bg: "bg-orange-500", text: "text-orange-600", light: "bg-orange-50 border-orange-200" };
  return { bg: "bg-slate-400", text: "text-slate-500", light: "bg-slate-50 border-slate-200" };
}

const sistemaLabels = {
  marketing: "Marketing", comercial: "Comercial", clinica: "Clínica",
  experiencia_paciente: "Exp. Paciente", financeiro: "Financeiro", gestao: "Gestão"
};

function DPSBadge({ score }) {
  const c = dpsColor(score || 0);
  return (
    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0", c.bg)}>
      {score || "—"}
    </div>
  );
}

function TaskCard({ task, onMarkDocumented, onMarkDelegated, onNotifyOwner }) {
  const dps = task.dps_score || 0;
  const c = dpsColor(dps);
  const isHighDPS = dps >= DPS_HIGH;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={cn("border shadow-sm transition-all", isHighDPS && !task.delegado ? "border-red-200" : "border-slate-100")}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3 flex-wrap">
            <DPSBadge score={dps} />

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <p className="font-semibold text-slate-900">{task.tarefa}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {sistemaLabels[task.sistema] || task.sistema} · {task.frequencia}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {isHighDPS && !task.delegado && !task.documentado && (
                    <Badge className="bg-red-100 text-red-700 border-red-200 border text-xs flex items-center gap-1">
                      <Flame className="w-3 h-3" /> Urgente
                    </Badge>
                  )}
                  {isHighDPS && !task.delegado && task.documentado && (
                    <Badge className="bg-orange-100 text-orange-700 border-orange-200 border text-xs">
                      Pronto p/ Delegar
                    </Badge>
                  )}
                  <Badge className={cn("border text-xs", task.documentado ? "bg-green-100 text-green-700 border-green-200" : "bg-slate-100 text-slate-500 border-slate-200")}>
                    <FileText className="w-3 h-3 mr-1" />
                    {task.documentado ? "Documentado" : "Não doc."}
                  </Badge>
                  <Badge className={cn("border text-xs", task.delegado ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-slate-100 text-slate-500 border-slate-200")}>
                    <UserCheck className="w-3 h-3 mr-1" />
                    {task.delegado ? "Delegado" : "Não del."}
                  </Badge>
                </div>
              </div>

              {/* Score breakdown */}
              <div className="flex gap-3 mt-2 flex-wrap">
                {[
                  { label: "Frequência", val: task.frequency_score },
                  { label: "Chateação", val: task.annoyance_level },
                  { label: "Impacto", val: task.impact_on_business },
                  { label: "Simplicidade", val: task.simplicity_to_delegate },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <div className="text-xs font-bold text-slate-700">{s.val || "—"}</div>
                    <div className="text-xs text-slate-400">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                <div className="text-xs text-slate-500">
                  {task.atual_responsavel && <span>Atual: <strong>{task.atual_responsavel}</strong></span>}
                  {task.responsavel_ideal && (
                    <span className="ml-2 text-indigo-600">
                      <ChevronRight className="w-3 h-3 inline" /> Ideal: <strong>{task.responsavel_ideal}</strong>
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5">
                  {!task.documentado && (
                    <Button size="sm" variant="outline" className="h-7 text-xs"
                      onClick={() => onMarkDocumented(task.id)}>
                      <FileText className="w-3 h-3 mr-1" /> Documentar
                    </Button>
                  )}
                  {task.documentado && !task.delegado && (
                    <Button size="sm" variant="outline" className="h-7 text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
                      onClick={() => onMarkDelegated(task.id)}>
                      <UserCheck className="w-3 h-3 mr-1" /> Delegar
                    </Button>
                  )}
                  {task.responsavel_ideal && !task.delegado && (
                    <Button size="sm" variant="outline" className="h-7 text-xs border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                      onClick={() => onNotifyOwner(task)}>
                      <Mail className="w-3 h-3 mr-1" /> Notificar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AlertBanner({ tasks }) {
  const [dismissed, setDismissed] = useState(false);
  const urgent = tasks.filter(t => (t.dps_score || 0) >= DPS_HIGH && !t.documentado && !t.delegado);
  if (dismissed || urgent.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-semibold text-red-700 text-sm">
          {urgent.length} tarefa{urgent.length > 1 ? "s" : ""} crítica{urgent.length > 1 ? "s" : ""} com DPS alto — não documentada{urgent.length > 1 ? "s" : ""} nem delegada{urgent.length > 1 ? "s" : ""}
        </p>
        <div className="mt-1 space-y-0.5">
          {urgent.slice(0, 3).map(t => (
            <p key={t.id} className="text-xs text-red-600">
              • <strong>{t.tarefa}</strong> (DPS {t.dps_score}) — {sistemaLabels[t.sistema] || t.sistema}
            </p>
          ))}
          {urgent.length > 3 && <p className="text-xs text-red-500">…e mais {urgent.length - 3} tarefa(s)</p>}
        </div>
      </div>
      <button onClick={() => setDismissed(true)} className="text-red-400 hover:text-red-600">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export default function DelegationOS({ tasks, onAddTask }) {
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState("todos");

  const updateTask = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.PrimeDelegationTask.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["PrimeDelegationTask"] }),
  });

  const handleMarkDocumented = (id) => {
    updateTask.mutate({ id, data: { documentado: true, status: "documented" } });
    toast.success("Tarefa marcada como documentada!");
  };

  const handleMarkDelegated = (id) => {
    updateTask.mutate({ id, data: { delegado: true, status: "delegated" } });
    toast.success("Tarefa marcada como delegada!");
  };

  const handleNotifyOwner = (task) => {
    // In-app notification toast simulating email to responsible
    toast.success(`Notificação enviada para ${task.responsavel_ideal}`, {
      description: `Tarefa "${task.tarefa}" (DPS ${task.dps_score}) foi atribuída a você.`,
      duration: 5000,
    });
  };

  const sorted = useMemo(() => [...tasks].sort((a, b) => (b.dps_score || 0) - (a.dps_score || 0)), [tasks]);

  const views = {
    todos: sorted,
    criticos: sorted.filter(t => (t.dps_score || 0) >= DPS_HIGH),
    nao_documentados: sorted.filter(t => !t.documentado),
    delegados: sorted.filter(t => t.delegado),
    prontos: sorted.filter(t => t.documentado && !t.delegado),
  };

  // KPIs
  const total = tasks.length;
  const criticos = tasks.filter(t => (t.dps_score || 0) >= DPS_HIGH).length;
  const semDoc = tasks.filter(t => !t.documentado).length;
  const delegados = tasks.filter(t => t.delegado).length;
  const pctDelegados = total > 0 ? Math.round((delegados / total) * 100) : 0;

  // DPS por sistema
  const porSistema = useMemo(() => {
    const map = {};
    tasks.forEach(t => {
      const s = t.sistema || "gestao";
      if (!map[s]) map[s] = { sistema: s, total: 0, dps_sum: 0, criticos: 0 };
      map[s].total++;
      map[s].dps_sum += t.dps_score || 0;
      if ((t.dps_score || 0) >= DPS_HIGH) map[s].criticos++;
    });
    return Object.values(map).sort((a, b) => b.dps_sum - a.dps_sum);
  }, [tasks]);

  const currentList = views[activeView] || sorted;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-bold text-slate-900 text-lg">🧠 Prime Delegation OS — DPS Score</h2>
        <Button size="sm" onClick={onAddTask} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-1" />Nova Tarefa
        </Button>
      </div>

      {/* Alert banner */}
      <AlertBanner tasks={tasks} />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total de Tarefas", value: total, icon: BarChart3, color: "indigo", sub: `${pctDelegados}% delegadas` },
          { label: "DPS Crítico (≥14)", value: criticos, icon: Flame, color: "red", sub: "Prioridade máxima" },
          { label: "Sem Documentação", value: semDoc, icon: FileText, color: "orange", sub: "Precisam de SOP" },
          { label: "Delegadas", value: delegados, icon: UserCheck, color: "green", sub: "Concluídas com sucesso" },
        ].map((k, i) => {
          const Icon = k.icon;
          return (
            <Card key={i} className="border-0 shadow-md">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", `bg-${k.color}-100`)}>
                  <Icon className={cn("w-4 h-4", `text-${k.color}-600`)} />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">{k.value}</p>
                  <p className="text-xs text-slate-500">{k.label}</p>
                  <p className="text-xs text-slate-400">{k.sub}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Main list */}
        <div className="lg:col-span-2 space-y-3">
          {/* View tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {[
              { key: "todos", label: `Todos (${sorted.length})` },
              { key: "criticos", label: `🔴 Críticos (${views.criticos.length})` },
              { key: "nao_documentados", label: `📄 Sem Doc. (${views.nao_documentados.length})` },
              { key: "prontos", label: `✅ Prontos p/ Delegar (${views.prontos.length})` },
              { key: "delegados", label: `👤 Delegados (${views.delegados.length})` },
            ].map(v => (
              <button key={v.key} onClick={() => setActiveView(v.key)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-lg font-medium border transition-all",
                  activeView === v.key
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                )}>
                {v.label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {currentList.map(t => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onMarkDocumented={handleMarkDocumented}
                  onMarkDelegated={handleMarkDelegated}
                  onNotifyOwner={handleNotifyOwner}
                />
              ))}
            </AnimatePresence>
            {currentList.length === 0 && (
              <div className="text-center py-14 text-slate-400">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhuma tarefa nesta categoria</p>
              </div>
            )}
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {/* DPS por sistema */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-800">DPS por Sistema</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              {porSistema.length === 0 && <p className="text-xs text-slate-400">Sem dados</p>}
              {porSistema.map(s => {
                const avg = s.total > 0 ? Math.round(s.dps_sum / s.total) : 0;
                const c = dpsColor(avg);
                return (
                  <div key={s.sistema}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-700">{sistemaLabels[s.sistema] || s.sistema}</span>
                      <div className="flex items-center gap-1.5">
                        {s.criticos > 0 && (
                          <span className="text-xs text-red-500 font-bold">{s.criticos} crítico{s.criticos > 1 ? "s" : ""}</span>
                        )}
                        <span className={cn("text-xs font-bold", c.text)}>DPS {avg}</span>
                      </div>
                    </div>
                    <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className={cn("h-full rounded-full", c.bg)} style={{ width: `${Math.min(100, (avg / 20) * 100)}%` }} />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{s.total} tarefa{s.total > 1 ? "s" : ""}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Progresso de delegação */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-800">Progresso Geral</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              {[
                { label: "Documentadas", count: tasks.filter(t => t.documentado).length, total, color: "bg-green-500" },
                { label: "Delegadas", count: delegados, total, color: "bg-blue-500" },
                { label: "DPS Crítico resolvido", count: tasks.filter(t => (t.dps_score || 0) >= DPS_HIGH && t.delegado).length, total: criticos || 1, color: "bg-indigo-500" },
              ].map(p => {
                const pct = total > 0 ? Math.round((p.count / p.total) * 100) : 0;
                return (
                  <div key={p.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600">{p.label}</span>
                      <span className="font-bold text-slate-700">{p.count}/{p.total} ({pct}%)</span>
                    </div>
                    <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6 }}
                        className={cn("h-full rounded-full", p.color)}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Notificações pendentes */}
          {(() => {
            const pendentes = tasks.filter(t => t.responsavel_ideal && !t.delegado && (t.dps_score || 0) >= DPS_MED);
            if (pendentes.length === 0) return null;
            return (
              <Card className="border border-indigo-200 bg-indigo-50 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-indigo-800 flex items-center gap-1.5">
                    <Bell className="w-4 h-4" /> Notificações Pendentes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  {pendentes.slice(0, 5).map(t => (
                    <div key={t.id} className="flex items-start justify-between gap-2 bg-white rounded-lg p-2 border border-indigo-100">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{t.tarefa}</p>
                        <p className="text-xs text-indigo-600">→ {t.responsavel_ideal}</p>
                      </div>
                      <Button size="sm" variant="ghost" className="h-6 text-xs px-2 text-indigo-700 hover:bg-indigo-100"
                        onClick={() => handleNotifyOwner(t)}>
                        <Mail className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  {pendentes.length > 5 && (
                    <p className="text-xs text-indigo-500 text-center">+{pendentes.length - 5} mais</p>
                  )}
                </CardContent>
              </Card>
            );
          })()}
        </div>
      </div>
    </div>
  );
}