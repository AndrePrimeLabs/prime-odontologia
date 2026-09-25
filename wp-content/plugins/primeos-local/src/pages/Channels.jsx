// @ts-nocheck
import React from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Instagram, Facebook, Search, Youtube, TrendingUp } from "lucide-react";

export default function Channels() {
  const { data: channels = [] } = useQuery({
    queryKey: ['marketingChannels'],
    queryFn: () => primeos.entities.MarketingChannel.list(),
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ['marketingMetrics'],
    queryFn: () => primeos.entities.MarketingMetric.list(),
  });

  const channelIcons = {
    instagram: Instagram,
    facebook: Facebook,
    google: Search,
    youtube: Youtube,
    whatsapp: MessageCircle,
    blog: TrendingUp
  };

  const funnelStages = [
    {
      name: "Aquisição",
      description: "Gerar awareness e atrair novos leads",
      channels: channels.filter(c => c.funcao_funil === "aquisicao"),
      color: "blue"
    },
    {
      name: "Conversão",
      description: "Transformar leads em pacientes agendados",
      channels: channels.filter(c => c.funcao_funil === "conversao"),
      color: "purple"
    },
    {
      name: "Retenção",
      description: "Fidelizar e gerar indicações",
      channels: channels.filter(c => c.funcao_funil === "retencao"),
      color: "green"
    }
  ];

  const channelDetails = [
    {
      platform: "WhatsApp",
      type: "Próprio",
      role: "Conversão + Relacionamento",
      kpi: "Taxa de conversão em agendamento",
      status: "ativo"
    },
    {
      platform: "Instagram",
      type: "Social",
      role: "Aquisição + Autoridade",
      kpi: "Engajamento + Leads gerados",
      status: "ativo"
    },
    {
      platform: "Facebook",
      type: "Pago",
      role: "Aquisição",
      kpi: "CPL (Custo por Lead)",
      status: "ativo"
    },
    {
      platform: "Google Ads",
      type: "Pago",
      role: "Aquisição + Conversão",
      kpi: "ROAS + Taxa de conversão",
      status: "ativo"
    },
    {
      platform: "YouTube",
      type: "Social",
      role: "Autoridade + Educação",
      kpi: "Visualizações + Tempo assistido",
      status: "ativo"
    },
    {
      platform: "Blog/SEO",
      type: "Próprio",
      role: "Aquisição Orgânica",
      kpi: "Tráfego orgânico + Conversão",
      status: "ativo"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Canais</h1>
          <p className="text-slate-600">Bloco 3 - Business Model Canvas</p>
        </div>

        {/* Channel Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Canais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{channels.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Canais Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {channels.filter(c => c.status === "ativo").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Leads Este Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">
                {metrics.reduce((sum, m) => sum + (m.leads_gerados || 0), 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Conversões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {metrics.reduce((sum, m) => sum + (m.conversoes || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Funnel Stages */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Canais por Função no Funil</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {funnelStages.map((stage, idx) => (
              <Card key={idx} className="border-2">
                <CardHeader className={`bg-${stage.color}-50`}>
                  <CardTitle className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-${stage.color}-600`} />
                    {stage.name}
                  </CardTitle>
                  <CardDescription>{stage.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    {stage.channels.map((channel) => {
                      const Icon = channelIcons[channel.plataforma] || MessageCircle;
                      return (
                        <div key={channel.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                          <Icon className="w-4 h-4 text-slate-600" />
                          <span className="text-sm font-medium">{channel.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Channel Details */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Detalhamento de Canais</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {channelDetails.map((channel, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{channel.platform}</CardTitle>
                    <Badge variant={channel.status === "ativo" ? "default" : "secondary"}>
                      {channel.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Função</p>
                    <p className="text-sm font-medium text-slate-900">{channel.role}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">KPI Principal</p>
                    <p className="text-sm text-slate-700">{channel.kpi}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
