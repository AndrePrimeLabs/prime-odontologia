// @ts-nocheck
import React from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, Megaphone, Users, Settings, TrendingUp } from "lucide-react";

export default function KeyActivities() {
  const { data: activities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: () => primeos.entities.Activity.list(),
  });

  const { data: sops = [] } = useQuery({
    queryKey: ['sops'],
    queryFn: () => primeos.entities.SOP.list(),
  });

  const activityBlocks = [
    {
      title: "Atendimento e Conversão",
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      activities: [
        "Primeiro contato via WhatsApp (Silvia AI)",
        "Qualificação de leads",
        "Agendamento de avaliações",
        "Apresentação de planos de tratamento",
        "Fechamento e conversão"
      ]
    },
    {
      title: "Produção Clínica",
      icon: Stethoscope,
      color: "text-blue-600",
      bg: "bg-blue-50",
      activities: [
        "Escaneamento digital 3D",
        "Planejamento com Invisalign",
        "Instalação e acompanhamento ortodôntico",
        "Procedimentos estéticos (clareamento, lentes)",
        "Manutenção e check-ups"
      ]
    },
    {
      title: "Marketing e Aquisição",
      icon: Megaphone,
      color: "text-pink-600",
      bg: "bg-pink-50",
      activities: [
        "Gestão de canais digitais (Instagram, Facebook, Google)",
        "Criação de conteúdo educativo",
        "Campanhas de aquisição de leads",
        "Gestão de reputação online",
        "SEO e tráfego orgânico"
      ]
    },
    {
      title: "CRM e Relacionamento",
      icon: Heart,
      color: "text-red-600",
      bg: "bg-red-50",
      activities: [
        "Lead scoring e segmentação",
        "Workflows automatizados",
        "Follow-up estratégico",
        "Reativação de leads frios",
        "Pedido de reviews e indicações"
      ]
    },
    {
      title: "Gestão e Governança",
      icon: Settings,
      color: "text-slate-600",
      bg: "bg-slate-50",
      activities: [
        "Monitoramento de KPIs",
        "Gestão financeira e custos",
        "Otimização de processos (SOPs)",
        "Treinamento de equipe",
        "Government AI - alinhamento estratégico"
      ]
    },
    {
      title: "Desenvolvimento e Inovação",
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
      activities: [
        "Testes de novas tecnologias",
        "Melhoria contínua de protocolos",
        "Expansão de ofertas",
        "Parcerias estratégicas",
        "Análise de mercado"
      ]
    }
  ];

  const activityStats = {
    production: activities.filter(a => a.category === "production").length,
    marketing: activities.filter(a => a.category === "marketing").length,
    sales: activities.filter(a => a.category === "sales").length,
    operations: activities.filter(a => a.category === "operations").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Atividades-Chave</h1>
          <p className="text-slate-600">Bloco 7 - Business Model Canvas</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Produção</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{activityStats.production}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Marketing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-600">{activityStats.marketing}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activityStats.sales}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">SOPs Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">
                {sops.filter(s => s.status === "Active").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activityBlocks.map((block, idx) => (
            <Card key={idx} className="hover:shadow-xl transition-all duration-300">
              <CardHeader className={block.bg}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <block.icon className={`w-5 h-5 ${block.color}`} />
                  </div>
                  <CardTitle className="text-lg">{block.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2">
                  {block.activities.map((activity, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <div className={`w-1.5 h-1.5 rounded-full ${block.color.replace('text-', 'bg-')} mt-1.5 flex-shrink-0`} />
                      {activity}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
