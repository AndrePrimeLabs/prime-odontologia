// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings, Zap, Bell, Brain, RefreshCw, CheckCircle, Calendar, MessageCircle } from "lucide-react";
import { toast } from "sonner";

const modules = [
  { id: "ai_insights", label: "AI Insights de Pacientes", desc: "Análise de churn, LTV e próximas visitas por IA", icon: Brain, status: "active" },
  { id: "smart_reminders", label: "Lembretes Inteligentes", desc: "Geração automática de mensagens WhatsApp via IA", icon: MessageCircle, status: "active" },
  { id: "return_suggestions", label: "Sugestões de Retorno", desc: "IA identifica pacientes que precisam de retorno preventivo", icon: Calendar, status: "active" },
  { id: "crm_automation", label: "Automação CRM", desc: "Workflows automáticos de lead nurturing", icon: Zap, status: "active" },
  { id: "appointment_reminders", label: "Lembretes de Consulta", desc: "Envio automático de lembretes agendados", icon: Bell, status: "active" },
];

export default function AdminSystemTab() {
  const [moduleStates, setModuleStates] = useState(() =>
    Object.fromEntries(modules.map(m => [m.id, m.status === "active"]))
  );
  const [testingReminder, setTestingReminder] = useState(false);

  const testReminders = async () => {
    setTestingReminder(true);
    const res = await primeos.functions.invoke('sendAppointmentReminder', {});
    toast.success(`Teste concluído: ${res.data?.summary?.sent || 0} lembretes enviados`);
    setTestingReminder(false);
  };

  const toggle = (id) => {
    setModuleStates(prev => ({ ...prev, [id]: !prev[id] }));
    toast.success(`Módulo ${moduleStates[id] ? "desativado" : "ativado"}`);
  };

  return (
    <div className="space-y-6">
      {/* System Status */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader><CardTitle className="text-white text-sm flex items-center gap-2"><Settings className="w-4 h-4" /> Status do Sistema</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "API PrimeOS", status: "online", color: "bg-emerald-500" },
              { label: "Google Calendar", status: "conectado", color: "bg-emerald-500" },
              { label: "IA (InvokeLLM)", status: "online", color: "bg-emerald-500" },
              { label: "WhatsApp", status: "via link", color: "bg-amber-500" },
            ].map(s => (
              <div key={s.label} className="p-3 bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${s.color} animate-pulse`} />
                  <span className="text-white text-xs font-medium">{s.label}</span>
                </div>
                <p className="text-slate-400 text-xs capitalize">{s.status}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modules */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader><CardTitle className="text-white text-sm flex items-center gap-2"><Zap className="w-4 h-4" /> Módulos do Sistema</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {modules.map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${moduleStates[m.id] ? 'bg-indigo-600/20' : 'bg-slate-600/20'} flex items-center justify-center`}>
                    <m.icon className={`w-4 h-4 ${moduleStates[m.id] ? 'text-indigo-400' : 'text-slate-500'}`} />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{m.label}</p>
                    <p className="text-slate-500 text-xs">{m.desc}</p>
                  </div>
                </div>
                <Switch checked={moduleStates[m.id]} onCheckedChange={() => toggle(m.id)} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader><CardTitle className="text-white text-sm">Ações Rápidas</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Button onClick={testReminders} disabled={testingReminder} variant="outline"
              className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700 gap-2 h-auto py-3 flex-col">
              {testingReminder ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Bell className="w-5 h-5" />}
              <span className="text-xs">Testar Lembretes</span>
            </Button>
            <Button variant="outline" onClick={() => toast.info("Acesse: Dashboard → Code → Functions")}
              className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700 gap-2 h-auto py-3 flex-col">
              <Zap className="w-5 h-5" />
              <span className="text-xs">Ver Functions</span>
            </Button>
            <Button variant="outline" onClick={() => toast.info("Use o painel PrimeOS para gerenciar automações")}
              className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700 gap-2 h-auto py-3 flex-col">
              <CheckCircle className="w-5 h-5" />
              <span className="text-xs">Automações</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
