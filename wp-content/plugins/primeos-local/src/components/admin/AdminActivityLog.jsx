// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Calendar, Users, Heart, RefreshCw, ClipboardList } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const iconMap = {
  Appointment: { icon: Calendar, color: "text-blue-400", bg: "bg-blue-500/10" },
  PatientRecord: { icon: Heart, color: "text-rose-400", bg: "bg-rose-500/10" },
  Lead: { icon: Users, color: "text-indigo-400", bg: "bg-indigo-500/10" },
  Task: { icon: ClipboardList, color: "text-amber-400", bg: "bg-amber-500/10" },
};

function ActivitySection({ title, items, entityKey, labelFn, subFn }) {
  const conf = iconMap[entityKey] || { icon: Activity, color: "text-slate-400", bg: "bg-slate-500/10" };
  const Icon = conf.icon;

  return (
    <div>
      <h3 className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-3">{title}</h3>
      <div className="space-y-2">
        {items.slice(0, 8).map(item => (
          <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-700/40 rounded-xl hover:bg-slate-700/60 transition-colors">
            <div className={`w-8 h-8 rounded-lg ${conf.bg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-4 h-4 ${conf.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{labelFn(item)}</p>
              <p className="text-slate-500 text-xs">{subFn(item)}</p>
            </div>
            <span className="text-slate-500 text-xs flex-shrink-0">
              {item.created_date ? format(new Date(item.created_date), "dd MMM HH:mm", { locale: ptBR }) : "—"}
            </span>
          </div>
        ))}
        {items.length === 0 && <p className="text-slate-600 text-sm text-center py-4">Nenhum registro recente</p>}
      </div>
    </div>
  );
}

export default function AdminActivityLog() {
  const { data: appointments = [], refetch: refetchA, isLoading: la } = useQuery({
    queryKey: ["activity-appts"], queryFn: () => primeos.entities.Appointment.list("-created_date", 8)
  });
  const { data: leads = [], refetch: refetchL, isLoading: ll } = useQuery({
    queryKey: ["activity-leads"], queryFn: () => primeos.entities.Lead.list("-created_date", 8)
  });
  const { data: patients = [], refetch: refetchP, isLoading: lp } = useQuery({
    queryKey: ["activity-patients"], queryFn: () => primeos.entities.PatientRecord.list("-created_date", 8)
  });
  const { data: tasks = [], refetch: refetchT, isLoading: lt } = useQuery({
    queryKey: ["activity-tasks"], queryFn: () => primeos.entities.Task.list("-created_date", 8)
  });

  const loading = la || ll || lp || lt;

  const refresh = () => { refetchA(); refetchL(); refetchP(); refetchT(); };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Activity className="w-4 h-4" /> Atividade Recente
          </CardTitle>
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading}
            className="border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700 gap-1.5">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-8">
          <ActivitySection title="Consultas Recentes" items={appointments} entityKey="Appointment"
            labelFn={a => a.patient_name} subFn={a => `${a.service_type} · ${a.date} ${a.time || ''} · ${a.status}`} />
          <ActivitySection title="Leads Recentes" items={leads} entityKey="Lead"
            labelFn={l => l.name} subFn={l => `${l.interesse || '—'} · ${l.status} · ${l.temperatura || ''}`} />
          <ActivitySection title="Pacientes Cadastrados" items={patients} entityKey="PatientRecord"
            labelFn={p => p.patient_name} subFn={p => `${p.status} · ${(p.medical_conditions || []).slice(0, 2).join(', ') || 'sem condições'}`} />
          <ActivitySection title="Tarefas Criadas" items={tasks} entityKey="Task"
            labelFn={t => t.title} subFn={t => `${t.category || '—'} · ${t.status} · ${t.priority || ''}`} />
        </div>
      </CardContent>
    </Card>
  );
}
