// @ts-nocheck
import React from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Users, Zap, CheckCircle, TrendingUp } from "lucide-react";

export default function CustomerRelationships() {
  const { data: workflows = [] } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => primeos.entities.CRMWorkflow.list(),
  });

  const { data: segments = [] } = useQuery({
    queryKey: ['segments'],
    queryFn: () => primeos.entities.CustomerSegment.list(),
  });

  const relationshipStrategies = [
    {
      title: "Atendimento Personalizado",
      description: "Acolhimento humanizado com foco em empatia e escuta ativa",
      icon: Heart,
      color: "text-pink-600",
      bg: "bg-pink-50",
      tactics: [
        "WhatsApp como canal principal",
        "Tom de voz acolhedor e elegante",
        "Silvia AI Agent para atendimento padrão",
        "Perguntas abertas e validação de sentimentos"
      ]
    },
    {
      title: "Automação Inteligente",
      description: "Workflows automatizados para diferentes gatilhos e segmentos",
      icon: Zap,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      tactics: [
        "Follow-up automático 24h/48h",
        "Confirmação de agendamentos",
        "Reativação de leads frios",
        "Check-in pós-atendimento"
      ]
    },
    {
      title: "Segmentação Ativa",
      description: "Comunicação direcionada por perfil e comportamento",
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
      tactics: [
        "Mensagens por persona",
        "Ofertas personalizadas",
        "Conteúdo educativo segmentado",
        "Lead scoring automático"
      ]
    },
    {
      title: "Jornada do Cliente",
      description: "Acompanhamento em todas as etapas do relacionamento",
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
      tactics: [
        "Pré-início: Segurança + encantamento",
        "Adaptação: Engajamento + suporte",
        "Consolidação: Fidelização + advocacy",
        "Pós-tratamento: Upsell + indicações"
      ]
    }
  ];

  const touchpoints = [
    { name: "Primeiro Contato", channel: "WhatsApp", strategy: "Acolhimento + Escuta Ativa" },
    { name: "Qualificação", channel: "WhatsApp/CRM", strategy: "Perguntas estratégicas" },
    { name: "Agendamento", channel: "Sistema", strategy: "Confirmação + Lembretes" },
    { name: "Avaliação", channel: "Presencial", strategy: "Experiência Premium" },
    { name: "Follow-up", channel: "WhatsApp", strategy: "Check-in 7/15/30 dias" },
    { name: "Tratamento", channel: "Multi-canal", strategy: "Suporte contínuo" },
    { name: "Pós-venda", channel: "WhatsApp/Email", strategy: "Fidelização + Reviews" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Relacionamento com Clientes</h1>
          <p className="text-slate-600">Bloco 4 - Business Model Canvas</p>
        </div>

        <Tabs defaultValue="strategies" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="strategies">Estratégias</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="touchpoints">Pontos de Contato</TabsTrigger>
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
          </TabsList>

          <TabsContent value="strategies" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relationshipStrategies.map((strategy, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-3 rounded-xl ${strategy.bg}`}>
                        <strategy.icon className={`w-6 h-6 ${strategy.color}`} />
                      </div>
                      <div>
                        <CardTitle>{strategy.title}</CardTitle>
                        <CardDescription>{strategy.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {strategy.tactics.map((tactic, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                          {tactic}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="workflows" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workflows.map((workflow) => (
                <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                      <Badge variant={workflow.ativo ? "default" : "secondary"}>
                        {workflow.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <CardDescription>{workflow.descricao}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="font-medium">Gatilho:</span>
                      <span className="text-slate-600">{workflow.gatilho?.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">Canal:</span>
                      <span className="text-slate-600">{workflow.canal}</span>
                    </div>
                    <div className="pt-2 border-t flex items-center justify-between">
                      <span className="text-sm text-slate-600">{workflow.leads_impactados || 0} leads</span>
                      <span className="text-sm font-medium text-green-600">
                        {workflow.taxa_conversao || 0}% conversão
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="touchpoints">
            <Card>
              <CardHeader>
                <CardTitle>Pontos de Contato na Jornada</CardTitle>
                <CardDescription>Mapeamento completo da experiência do cliente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {touchpoints.map((point, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-white rounded-lg border hover:border-indigo-300 transition-colors">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{point.name}</h4>
                        <p className="text-sm text-slate-600">{point.strategy}</p>
                      </div>
                      <Badge variant="outline">{point.channel}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance por Segmento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {segments.map((segment) => (
                      <div key={segment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: segment.cor }} />
                          <span className="font-medium text-slate-900">{segment.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-slate-900">{segment.total_leads || 0}</div>
                          <div className="text-xs text-slate-500">leads</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Workflows Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {workflows.filter(w => w.ativo).slice(0, 5).map((workflow) => (
                      <div key={workflow.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-900">{workflow.name}</span>
                          <Badge className="bg-green-600">{workflow.canal}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">{workflow.leads_impactados || 0} impactados</span>
                          <span className="font-medium text-green-700">{workflow.taxa_conversao || 0}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
