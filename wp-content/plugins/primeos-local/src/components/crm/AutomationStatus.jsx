// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  TrendingUp, 
  Calendar,
  MessageSquare,
  CheckCircle2,
  Activity
} from "lucide-react";

export default function AutomationStatus() {
  const automations = [
    {
      name: 'Lead Scoring',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Score automático baseado em engajamento',
      triggers: ['Criação de lead', 'Atualização de lead'],
      actions: ['Calcula score', 'Cria tarefas para scores altos (70+)']
    },
    {
      name: 'Appointment Updates',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Atualiza status e cria follow-ups',
      triggers: ['Agendamento criado', 'Status alterado'],
      actions: ['Marca no-show automaticamente', 'Cria tarefas de follow-up']
    },
    {
      name: 'Interaction Processing',
      icon: MessageSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Processa interações e atualiza CRM',
      triggers: ['Nova interação registrada'],
      actions: ['Atualiza último contato', 'Cria tarefas de próxima ação']
    }
  ];

  return (
    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-600" />
          Automações CRM Ativas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {automations.map((auto, idx) => (
          <div key={idx} className="bg-white rounded-lg p-4 border border-slate-200">
            <div className="flex items-start gap-3 mb-3">
              <div className={`p-2 rounded-lg ${auto.bgColor}`}>
                <auto.icon className={`w-4 h-4 ${auto.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-slate-900">{auto.name}</h3>
                  <Badge className="bg-green-100 text-green-700 text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Ativa
                  </Badge>
                </div>
                <p className="text-xs text-slate-600">{auto.description}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div>
                <p className="text-xs font-medium text-slate-700 mb-1">Gatilhos:</p>
                <div className="flex flex-wrap gap-1">
                  {auto.triggers.map((trigger, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {trigger}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-xs font-medium text-slate-700 mb-1">Ações:</p>
                <ul className="space-y-1">
                  {auto.actions.map((action, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-center gap-1">
                      <Activity className="w-3 h-3 text-slate-400" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
