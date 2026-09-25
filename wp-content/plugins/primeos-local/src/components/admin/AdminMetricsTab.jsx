// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, FileText, ClipboardList, Heart, Brain } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

const MetricCard = ({ title, value, sub, icon: Icon, color }) => (
  <Card className="bg-slate-800/50 border-slate-700">
    <CardContent className="p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-slate-400 text-sm">{title}</p>
        <div className={`w-9 h-9 rounded-lg ${color} bg-opacity-20 flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </CardContent>
  </Card>
);

export default function AdminMetricsTab() {
  const { data: patients = [] } = useQuery({ queryKey: ["patients-admin"], queryFn: () => primeos.entities.PatientRecord.list() });
  const { data: appointments = [] } = useQuery({ queryKey: ["appts-admin"], queryFn: () => primeos.entities.Appointment.list() });
  const { data: leads = [] } = useQuery({ queryKey: ["leads-admin"], queryFn: () => primeos.entities.Lead.list() });
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks-admin"], queryFn: () => primeos.entities.Task.list() });
  const { data: records = [] } = useQuery({ queryKey: ["records-admin"], queryFn: () => primeos.entities.MedicalRecord.list() });
  const { data: pops = [] } = useQuery({ queryKey: ["pops-admin"], queryFn: () => primeos.entities.POP.list() });

  const apptByStatus = appointments.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});
  const apptStatusData = Object.entries(apptByStatus).map(([name, value]) => ({ name, value }));

  const leadsByStatus = leads.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1;
    return acc;
  }, {});
  const leadsData = Object.entries(leadsByStatus).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard title="Pacientes" value={patients.length} sub={`${patients.filter(p => p.status === 'ativo').length} ativos`} icon={Heart} color="bg-rose-500" />
        <MetricCard title="Consultas" value={appointments.length} sub={`${appointments.filter(a => a.status === 'scheduled').length} agendadas`} icon={Calendar} color="bg-blue-500" />
        <MetricCard title="Leads" value={leads.length} sub={`${leads.filter(l => l.status === 'novo').length} novos`} icon={Users} color="bg-indigo-500" />
        <MetricCard title="Tarefas" value={tasks.length} sub={`${tasks.filter(t => t.status === 'pending').length} pendentes`} icon={ClipboardList} color="bg-amber-500" />
        <MetricCard title="Prontuários" value={records.length} sub="registros médicos" icon={FileText} color="bg-teal-500" />
        <MetricCard title="POPs" value={pops.length} sub="procedimentos" icon={Brain} color="bg-purple-500" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader><CardTitle className="text-white text-sm">Consultas por Status</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={apptStatusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {apptStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader><CardTitle className="text-white text-sm">Leads por Status</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadsData}>
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }} />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
