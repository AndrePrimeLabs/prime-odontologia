// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { TrendingUp, Mail, BarChart3, Calendar, Zap } from "lucide-react";

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Pipeline de Vendas",
      description: "Visualize e gerencie leads no funil",
      icon: TrendingUp,
      color: "bg-purple-100 text-purple-600",
      page: "SalesPipeline"
    },
    {
      title: "Automação de Email",
      description: "Configure sequências automáticas",
      icon: Mail,
      color: "bg-blue-100 text-blue-600",
      page: "EmailAutomation"
    },
    {
      title: "Relatórios de Vendas",
      description: "Análise detalhada e previsões",
      icon: BarChart3,
      color: "bg-green-100 text-green-600",
      page: "SalesReports"
    },
    {
      title: "Agenda CRM",
      description: "Agendamentos e follow-ups",
      icon: Calendar,
      color: "bg-indigo-100 text-indigo-600",
      page: "CRMAgenda"
    }
  ];

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-600" />
          <CardTitle>Ações Rápidas CRM</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 justify-start hover:shadow-md transition-all"
              onClick={() => navigate(createPageUrl(action.page))}
            >
              <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mr-3 flex-shrink-0`}>
                <action.icon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-900">{action.title}</p>
                <p className="text-xs text-slate-500">{action.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
