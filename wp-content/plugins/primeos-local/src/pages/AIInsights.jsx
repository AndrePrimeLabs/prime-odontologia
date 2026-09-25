// @ts-nocheck
import React, { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, TrendingUp, AlertCircle, Target, Lightbulb, BarChart3, DollarSign, Users, Zap } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function AIInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: () => primeos.entities.Lead.list(),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => primeos.entities.Customer.list(),
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: () => primeos.entities.Sale.list(),
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ['marketingMetrics'],
    queryFn: () => primeos.entities.MarketingMetric.list(),
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => primeos.entities.Expense.list(),
  });

  const { data: interactions = [] } = useQuery({
    queryKey: ['leadInteractions'],
    queryFn: () => primeos.entities.LeadInteraction.list(),
  });

  // Calculate KPIs
  const totalRevenue = sales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const totalInvestment = metrics.reduce((sum, m) => sum + (m.investimento || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalLeads = leads.length;
  const hotLeads = leads.filter(l => l.temperatura === 'quente').length;
  const conversionRate = totalLeads > 0 ? ((sales.length / totalLeads) * 100).toFixed(1) : 0;
  const roi = totalInvestment > 0 ? (((totalRevenue - totalInvestment) / totalInvestment) * 100).toFixed(1) : 0;
  const avgTicket = sales.length > 0 ? totalRevenue / sales.length : 0;
  const cac = totalLeads > 0 ? totalInvestment / totalLeads : 0;

  // Lead status distribution
  const leadsByStatus = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {});

  const leadStatusData = Object.entries(leadsByStatus).map(([status, count]) => ({
    name: status.replace(/_/g, ' '),
    value: count
  }));

  // Revenue trend (last 30 days)
  const revenueTrend = sales.slice(-30).reduce((acc, sale, idx) => {
    const date = new Date(sale.created_date);
    const dateStr = date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
    acc.push({
      date: dateStr,
      receita: sale.total_amount || 0
    });
    return acc;
  }, []);

  // Channel performance
  const channelPerformance = metrics.reduce((acc, metric) => {
    const channel = metric.canal_id || 'Não especificado';
    if (!acc[channel]) {
      acc[channel] = { leads: 0, conversoes: 0, investimento: 0, receita: 0 };
    }
    acc[channel].leads += metric.leads_gerados || 0;
    acc[channel].conversoes += metric.conversoes || 0;
    acc[channel].investimento += metric.investimento || 0;
    acc[channel].receita += metric.receita_gerada || 0;
    return acc;
  }, {});

  const channelData = Object.entries(channelPerformance).map(([channel, data]) => ({
    channel,
    ...data,
    roi: data.investimento > 0 ? ((data.receita - data.investimento) / data.investimento * 100).toFixed(1) : 0
  }));

  const generateAIInsights = async () => {
    setLoading(true);
    try {
      const analysisData = {
        kpis: {
          total_leads: totalLeads,
          hot_leads: hotLeads,
          conversion_rate: conversionRate,
          total_revenue: totalRevenue,
          total_investment: totalInvestment,
          total_expenses: totalExpenses,
          roi: roi,
          avg_ticket: avgTicket,
          cac: cac
        },
        lead_distribution: leadsByStatus,
        channel_performance: channelPerformance,
        sales_count: sales.length,
        active_customers: customers.filter(c => c.status === 'active').length,
        total_interactions: interactions.length
      };

      const response = await primeos.integrations.Core.InvokeLLM({
        prompt: `Você é o Government AI da Prime Odontologia, responsável pela governança estratégica.

Analise os seguintes dados de negócio e forneça insights estratégicos profundos:

DADOS ATUAIS:
${JSON.stringify(analysisData, null, 2)}

Com base nos 9 blocos do Business Model Canvas da Prime Odontologia, forneça:

1. ANÁLISE GERAL DO NEGÓCIO (saúde atual em score 0-100)
2. PONTOS FORTES (3-5 principais)
3. PONTOS DE ATENÇÃO (3-5 críticos)
4. OPORTUNIDADES DE CRESCIMENTO (3-5 específicas)
5. RECOMENDAÇÕES ESTRATÉGICAS (5-7 ações prioritárias)
6. PREVISÕES E TENDÊNCIAS (próximos 30-90 dias)

Seja específico, use dados concretos e forneça recomendações acionáveis alinhadas com o posicionamento premium da Prime Odontologia (Invisalign, estética natural, tecnologia, discrição).`,
        response_json_schema: {
          type: "object",
          properties: {
            health_score: { type: "number" },
            summary: { type: "string" },
            strengths: {
              type: "array",
              items: { type: "string" }
            },
            concerns: {
              type: "array",
              items: { type: "string" }
            },
            opportunities: {
              type: "array",
              items: { type: "string" }
            },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string" },
                  impact: { type: "string" }
                }
              }
            },
            predictions: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setInsights(response);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">AI Analytics & Insights</h1>
            <p className="text-slate-600">Inteligência estratégica com Government AI</p>
          </div>
          <Button 
            onClick={generateAIInsights} 
            disabled={loading}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <Brain className="w-4 h-4 mr-2" />
            {loading ? "Analisando..." : "Gerar Insights com IA"}
          </Button>
        </div>

        {/* KPI Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-indigo-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{totalLeads}</div>
              <p className="text-xs text-green-600 mt-1">{hotLeads} quentes</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Receita Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {totalRevenue.toLocaleString('pt-BR')}
              </div>
              <p className="text-xs text-slate-600 mt-1">Ticket: R$ {avgTicket.toFixed(0)}</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Conversão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{conversionRate}%</div>
              <p className="text-xs text-slate-600 mt-1">{sales.length} vendas</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                ROI Marketing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {roi}%
              </div>
              <p className="text-xs text-slate-600 mt-1">CAC: R$ {cac.toFixed(0)}</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Section */}
        {insights && (
          <Card className="mb-8 border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <Brain className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-indigo-900">Análise Estratégica com IA</CardTitle>
                    <CardDescription>Insights gerados pelo Government AI</CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-indigo-600">{insights.health_score}/100</div>
                  <p className="text-xs text-slate-600">Saúde do Negócio</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-white rounded-lg border">
                <p className="text-slate-700 leading-relaxed">{insights.summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div>
                  <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Pontos Fortes
                  </h3>
                  <div className="space-y-2">
                    {insights.strengths?.map((strength, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="w-2 h-2 rounded-full bg-green-600 mt-1.5 flex-shrink-0" />
                        <p className="text-sm text-slate-700">{strength}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Concerns */}
                <div>
                  <h3 className="text-lg font-bold text-orange-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Pontos de Atenção
                  </h3>
                  <div className="space-y-2">
                    {insights.concerns?.map((concern, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="w-2 h-2 rounded-full bg-orange-600 mt-1.5 flex-shrink-0" />
                        <p className="text-sm text-slate-700">{concern}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Opportunities */}
              <div>
                <h3 className="text-lg font-bold text-indigo-900 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Oportunidades de Crescimento
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {insights.opportunities?.map((opp, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-lg border border-indigo-200">
                      <p className="text-sm text-slate-700">{opp}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="text-lg font-bold text-purple-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Recomendações Estratégicas
                </h3>
                <div className="space-y-3">
                  {insights.recommendations?.map((rec, idx) => (
                    <Card key={idx} className="border-l-4 border-l-purple-600">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{rec.title}</CardTitle>
                          <div className="flex gap-2">
                            <Badge className={
                              rec.priority === 'alta' ? 'bg-red-600' :
                              rec.priority === 'media' ? 'bg-yellow-600' : 'bg-blue-600'
                            }>
                              {rec.priority}
                            </Badge>
                            <Badge variant="outline">{rec.impact}</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-700">{rec.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Predictions */}
              <div>
                <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Previsões e Tendências
                </h3>
                <div className="space-y-2">
                  {insights.predictions?.map((pred, idx) => (
                    <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-slate-700">{pred}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="sales">Vendas</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
            <TabsTrigger value="costs">Custos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lead Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Leads por Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={leadStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {leadStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Revenue Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Tendência de Receita</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="receita" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sales">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance de Vendas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                      <p className="text-sm text-slate-600 mb-1">Total de Vendas</p>
                      <p className="text-2xl font-bold text-green-700">{sales.length}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
                      <p className="text-sm text-slate-600 mb-1">Ticket Médio</p>
                      <p className="text-2xl font-bold text-indigo-700">R$ {avgTicket.toFixed(0)}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Taxa de Conversão</p>
                    <p className="text-3xl font-bold text-blue-700">{conversionRate}%</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vendas por Canal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(sales.reduce((acc, sale) => {
                      const channel = sale.channel || 'direct';
                      acc[channel] = (acc[channel] || 0) + 1;
                      return acc;
                    }, {})).map(([channel, count]) => (
                      <div key={channel} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="font-medium text-slate-900">{channel}</span>
                        <Badge variant="outline">{count} vendas</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="marketing">
            <Card>
              <CardHeader>
                <CardTitle>Performance por Canal de Marketing</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={channelData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="channel" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="leads" fill="#6366f1" name="Leads" />
                    <Bar dataKey="conversoes" fill="#10b981" name="Conversões" />
                    <Bar dataKey="roi" fill="#f59e0b" name="ROI %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Investimento Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-indigo-600">
                    R$ {totalInvestment.toLocaleString('pt-BR')}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">CAC Médio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    R$ {cac.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">ROI Geral</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {roi}%
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="costs">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estrutura de Custos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(expenses.reduce((acc, exp) => {
                      const cat = exp.category || 'other';
                      if (!acc[cat]) acc[cat] = 0;
                      acc[cat] += exp.amount || 0;
                      return acc;
                    }, {})).map(([category, amount]) => (
                      <div key={category} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-900">{category.replace(/_/g, ' ')}</span>
                        <span className="text-sm font-bold text-red-600">R$ {amount.toLocaleString('pt-BR')}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Saúde Financeira</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Receita Total</p>
                    <p className="text-2xl font-bold text-green-700">R$ {totalRevenue.toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Despesas Totais</p>
                    <p className="text-2xl font-bold text-red-700">R$ {totalExpenses.toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Lucro Bruto</p>
                    <p className={`text-2xl font-bold ${totalRevenue - totalExpenses >= 0 ? 'text-indigo-700' : 'text-red-700'}`}>
                      R$ {(totalRevenue - totalExpenses).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Margem</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Customer Behavior Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Comportamento do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 bg-indigo-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Tempo Médio de Conversão</span>
                  <Badge>Em desenvolvimento</Badge>
                </div>
                <p className="text-xs text-slate-600">Baseado em interações do lead até venda</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Canais Mais Efetivos</span>
                  <span className="text-lg font-bold text-purple-600">WhatsApp</span>
                </div>
                <p className="text-xs text-slate-600">Maior taxa de conversão</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Interesse Principal</span>
                  <span className="text-lg font-bold text-green-600">
                    {Object.entries(leads.reduce((acc, l) => {
                      acc[l.interesse] = (acc[l.interesse] || 0) + 1;
                      return acc;
                    }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                  </span>
                </div>
                <p className="text-xs text-slate-600">Procedimento mais procurado</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Insights Rápidos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Taxa de Leads Quentes</p>
                  <p className="text-sm text-slate-700">
                    {totalLeads > 0 ? ((hotLeads / totalLeads) * 100).toFixed(1) : 0}% dos leads estão quentes
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <BarChart3 className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Eficiência de Marketing</p>
                  <p className="text-sm text-slate-700">
                    ROI de {roi}% indica {roi >= 100 ? 'excelente' : roi >= 50 ? 'boa' : 'necessita otimização'} performance
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <DollarSign className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Saúde Financeira</p>
                  <p className="text-sm text-slate-700">
                    Margem de {totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
