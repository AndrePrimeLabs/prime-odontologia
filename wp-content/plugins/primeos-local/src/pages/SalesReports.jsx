// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts";
import { TrendingUp, DollarSign, Target, Award, TrendingDown, AlertCircle } from "lucide-react";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];

export default function SalesReports() {
  const [funnelView, setFunnelView] = useState("default");
  const [forecastPeriod, setForecastPeriod] = useState("3");

  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: () => primeos.entities.Lead.list(),
  });

  const { data: sales = [] } = useQuery({
    queryKey: ["sales"],
    queryFn: () => primeos.entities.Sale.list(),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => primeos.entities.Customer.list(),
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => primeos.entities.Campaign.list(),
  });

  // Conversion Rate by Stage
  const stageData = [
    { stage: "Novos", count: leads.filter((l) => l.stage === "new").length },
    { stage: "Contatados", count: leads.filter((l) => l.stage === "contacted").length },
    { stage: "Qualificados", count: leads.filter((l) => l.stage === "qualified").length },
    { stage: "Proposta", count: leads.filter((l) => l.stage === "proposal").length },
    { stage: "Negociação", count: leads.filter((l) => l.stage === "negotiation").length },
    { stage: "Ganho", count: leads.filter((l) => l.stage === "closed_won").length },
  ];

  // Team Performance
  const teamPerformance = leads.reduce((acc, lead) => {
    if (lead.assigned_to) {
      if (!acc[lead.assigned_to]) {
        acc[lead.assigned_to] = {
          name: lead.assigned_to,
          total: 0,
          won: 0,
          value: 0,
        };
      }
      acc[lead.assigned_to].total++;
      if (lead.stage === "closed_won") {
        acc[lead.assigned_to].won++;
        acc[lead.assigned_to].value += lead.estimated_value || 0;
      }
    }
    return acc;
  }, {});

  const teamData = Object.values(teamPerformance).map((member) => ({
    ...member,
    conversionRate: member.total > 0 ? ((member.won / member.total) * 100).toFixed(1) : 0,
  }));

  // Lead Source Distribution
  const sourceData = leads.reduce((acc, lead) => {
    const source = lead.source || "Desconhecido";
    if (!acc[source]) {
      acc[source] = { name: source, value: 0 };
    }
    acc[source].value++;
    return acc;
  }, {});

  const sourceChartData = Object.values(sourceData);

  // Revenue Over Time
  const revenueByMonth = sales.reduce((acc, sale) => {
    if (sale.created_date) {
      const month = new Date(sale.created_date).toLocaleDateString("pt-BR", {
        month: "short",
        year: "numeric",
      });
      if (!acc[month]) {
        acc[month] = { month, revenue: 0, count: 0 };
      }
      acc[month].revenue += sale.total_amount || 0;
      acc[month].count++;
    }
    return acc;
  }, {});

  const revenueData = Object.values(revenueByMonth).slice(-6);

  // Sales Forecast using simple linear regression
  const calculateForecast = (months) => {
    if (revenueData.length < 2) return [];
    
    const historicalData = [...revenueData];
    const n = historicalData.length;
    
    // Calculate trend
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    historicalData.forEach((data, i) => {
      sumX += i;
      sumY += data.revenue;
      sumXY += i * data.revenue;
      sumX2 += i * i;
    });
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Generate forecast
    const forecast = [];
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    
    for (let i = 0; i < parseInt(months); i++) {
      const index = n + i;
      const predictedRevenue = Math.max(0, slope * index + intercept);
      const currentMonth = new Date();
      currentMonth.setMonth(currentMonth.getMonth() + i + 1);
      
      forecast.push({
        month: monthNames[currentMonth.getMonth()] + " " + currentMonth.getFullYear(),
        revenue: Math.round(predictedRevenue),
        isForecast: true
      });
    }
    
    return [...historicalData.map(d => ({ ...d, isForecast: false })), ...forecast];
  };

  const forecastData = calculateForecast(forecastPeriod);
  const avgGrowthRate = revenueData.length > 1 
    ? (((revenueData[revenueData.length - 1].revenue / revenueData[0].revenue) - 1) * 100).toFixed(1)
    : 0;

  // Custom Funnel Views
  const funnelViews = {
    default: [
      { stage: "Novos", count: leads.filter((l) => l.stage === "new").length, fill: "#94a3b8" },
      { stage: "Contatados", count: leads.filter((l) => l.stage === "contacted").length, fill: "#3b82f6" },
      { stage: "Qualificados", count: leads.filter((l) => l.stage === "qualified").length, fill: "#8b5cf6" },
      { stage: "Proposta", count: leads.filter((l) => l.stage === "proposal").length, fill: "#6366f1" },
      { stage: "Negociação", count: leads.filter((l) => l.stage === "negotiation").length, fill: "#f59e0b" },
      { stage: "Ganho", count: leads.filter((l) => l.stage === "closed_won").length, fill: "#10b981" },
    ],
    simplified: [
      { stage: "Topo do Funil", count: leads.filter((l) => ["new", "contacted"].includes(l.stage)).length, fill: "#3b82f6" },
      { stage: "Meio do Funil", count: leads.filter((l) => ["qualified", "proposal"].includes(l.stage)).length, fill: "#8b5cf6" },
      { stage: "Fundo do Funil", count: leads.filter((l) => l.stage === "negotiation").length, fill: "#f59e0b" },
      { stage: "Convertidos", count: leads.filter((l) => l.stage === "closed_won").length, fill: "#10b981" },
    ],
    value: [
      { stage: "Novos", value: leads.filter((l) => l.stage === "new").reduce((s, l) => s + (l.estimated_value || 0), 0), fill: "#94a3b8" },
      { stage: "Qualificados", value: leads.filter((l) => l.stage === "qualified").reduce((s, l) => s + (l.estimated_value || 0), 0), fill: "#8b5cf6" },
      { stage: "Proposta", value: leads.filter((l) => l.stage === "proposal").reduce((s, l) => s + (l.estimated_value || 0), 0), fill: "#6366f1" },
      { stage: "Negociação", value: leads.filter((l) => l.stage === "negotiation").reduce((s, l) => s + (l.estimated_value || 0), 0), fill: "#f59e0b" },
      { stage: "Ganho", value: leads.filter((l) => l.stage === "closed_won").reduce((s, l) => s + (l.estimated_value || 0), 0), fill: "#10b981" },
    ].filter(item => item.value > 0)
  };

  const currentFunnelData = funnelViews[funnelView];

  // Campaign ROI Analysis
  const campaignROI = campaigns.map(campaign => {
    const campaignLeads = leads.filter(lead => 
      lead.source === campaign.name || lead.tags?.includes(campaign.name)
    );
    const wonLeads = campaignLeads.filter(l => l.stage === "closed_won");
    const revenue = wonLeads.reduce((sum, l) => sum + (l.estimated_value || 0), 0);
    const cost = campaign.budget || 0;
    const roi = cost > 0 ? ((revenue - cost) / cost * 100) : 0;
    
    return {
      name: campaign.name,
      leads: campaignLeads.length,
      conversions: wonLeads.length,
      revenue,
      cost,
      roi: roi.toFixed(1),
      conversionRate: campaignLeads.length > 0 ? ((wonLeads.length / campaignLeads.length) * 100).toFixed(1) : 0
    };
  }).filter(c => c.leads > 0);

  // Stats
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
  const avgDealSize =
    leads.filter((l) => l.stage === "closed_won").length > 0
      ? totalRevenue / leads.filter((l) => l.stage === "closed_won").length
      : 0;
  const overallConversion =
    leads.length > 0
      ? ((leads.filter((l) => l.stage === "closed_won").length / leads.length) * 100).toFixed(1)
      : 0;
  const avgLeadScore =
    leads.length > 0
      ? (leads.reduce((sum, l) => sum + (l.score || 0), 0) / leads.length).toFixed(0)
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900">Relatórios de Vendas</h1>
          <p className="text-slate-500 mt-1">
            Performance detalhada e análise do funil de vendas
          </p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Receita Total</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    R$ {totalRevenue.toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Ticket Médio</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    R$ {avgDealSize.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Taxa de Conversão</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">
                    {overallConversion}%
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Score Médio</p>
                  <p className="text-2xl font-bold text-indigo-600 mt-1">{avgLeadScore}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Award className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="funnel" className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="funnel">Funil</TabsTrigger>
            <TabsTrigger value="forecast">Previsão</TabsTrigger>
            <TabsTrigger value="team">Equipe</TabsTrigger>
            <TabsTrigger value="roi">ROI</TabsTrigger>
            <TabsTrigger value="sources">Fontes</TabsTrigger>
            <TabsTrigger value="revenue">Receita</TabsTrigger>
          </TabsList>

          <TabsContent value="funnel">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Funil de Vendas Interativo</CardTitle>
                  <Select value={funnelView} onValueChange={setFunnelView}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Detalhado</SelectItem>
                      <SelectItem value="simplified">Simplificado</SelectItem>
                      <SelectItem value="value">Por Valor (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={400}>
                    <FunnelChart>
                      <Tooltip />
                      <Funnel
                        dataKey={funnelView === "value" ? "value" : "count"}
                        data={currentFunnelData}
                        isAnimationActive
                      >
                        <LabelList position="right" fill="#000" stroke="none" dataKey="stage" />
                        {currentFunnelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Funnel>
                    </FunnelChart>
                  </ResponsiveContainer>
                  
                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-900 mb-4">Análise de Conversão</h3>
                    {currentFunnelData.map((item, index) => {
                      const nextItem = currentFunnelData[index + 1];
                      const dropRate = nextItem 
                        ? (((item[funnelView === "value" ? "value" : "count"] - nextItem[funnelView === "value" ? "value" : "count"]) / item[funnelView === "value" ? "value" : "count"]) * 100).toFixed(1)
                        : 0;
                      
                      return (
                        <div key={index} className="p-4 bg-slate-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold" style={{ color: item.fill }}>
                              {item.stage}
                            </span>
                            <span className="text-lg font-bold">
                              {funnelView === "value" 
                                ? `R$ ${(item.value || 0).toLocaleString("pt-BR")}`
                                : item.count
                              }
                            </span>
                          </div>
                          {nextItem && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <TrendingDown className="w-4 h-4 text-red-500" />
                              <span>{dropRate}% perdidos para próxima etapa</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forecast">
            <div className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Previsão de Vendas</CardTitle>
                      <p className="text-sm text-slate-500 mt-1">
                        Baseado em {revenueData.length} meses de histórico
                      </p>
                    </div>
                    <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Próximo 1 mês</SelectItem>
                        <SelectItem value="3">Próximos 3 meses</SelectItem>
                        <SelectItem value="6">Próximos 6 meses</SelectItem>
                        <SelectItem value="12">Próximos 12 meses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={forecastData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#6366f1"
                        fill="#6366f1"
                        fillOpacity={0.6}
                        name="Receita"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-slate-600">Taxa de Crescimento</p>
                      <p className="text-2xl font-bold text-blue-600">{avgGrowthRate}%</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-slate-600">Previsão Próximo Mês</p>
                      <p className="text-2xl font-bold text-green-600">
                        R$ {forecastData[revenueData.length]?.revenue?.toLocaleString("pt-BR") || 0}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-slate-600">Confiança</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-purple-600">
                          {revenueData.length > 3 ? "Alta" : "Média"}
                        </p>
                        <AlertCircle className="w-4 h-4 text-purple-600" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">Insights da Previsão</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Tendência Positiva</p>
                        <p className="text-xs text-slate-600">
                          Crescimento médio de {avgGrowthRate}% nos últimos meses
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Target className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Próxima Meta</p>
                        <p className="text-xs text-slate-600">
                          R$ {(forecastData[revenueData.length]?.revenue * 1.2)?.toLocaleString("pt-BR")} para crescimento 20%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">Metodologia</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-slate-600">
                    <p>• Regressão linear simples baseada em dados históricos</p>
                    <p>• Tendência calculada usando últimos {revenueData.length} meses</p>
                    <p>• Precisão aumenta com mais dados históricos</p>
                    <p>• Não considera sazonalidade ou eventos externos</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="roi">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>ROI de Campanhas de Marketing</CardTitle>
              </CardHeader>
              <CardContent>
                {campaignROI.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>Nenhuma campanha com dados suficientes para análise</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {campaignROI.map((campaign, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-slate-900">{campaign.name}</h4>
                            <p className="text-sm text-slate-500">
                              {campaign.leads} leads • {campaign.conversions} conversões
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-2xl font-bold ${
                              campaign.roi > 0 ? "text-green-600" : "text-red-600"
                            }`}>
                              {campaign.roi}%
                            </p>
                            <p className="text-xs text-slate-500">ROI</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 pt-3 border-t border-slate-200">
                          <div>
                            <p className="text-xs text-slate-500">Investimento</p>
                            <p className="font-semibold text-slate-900">
                              R$ {campaign.cost.toLocaleString("pt-BR")}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Receita</p>
                            <p className="font-semibold text-green-600">
                              R$ {campaign.revenue.toLocaleString("pt-BR")}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Lucro</p>
                            <p className={`font-semibold ${
                              campaign.revenue - campaign.cost > 0 ? "text-green-600" : "text-red-600"
                            }`}>
                              R$ {(campaign.revenue - campaign.cost).toLocaleString("pt-BR")}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Taxa Conversão</p>
                            <p className="font-semibold text-blue-600">{campaign.conversionRate}%</p>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                campaign.roi > 100 ? "bg-green-500" :
                                campaign.roi > 0 ? "bg-blue-500" : "bg-red-500"
                              }`}
                              style={{ width: `${Math.min(Math.max(campaign.roi, 0), 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Performance da Equipe</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamData.map((member, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900">{member.name}</h4>
                            <p className="text-sm text-slate-500">
                              {member.won} / {member.total} leads convertidos
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-indigo-600">
                            {member.conversionRate}%
                          </p>
                          <p className="text-sm text-slate-500">
                            R$ {member.value.toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${member.conversionRate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Distribuição por Fonte</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={sourceChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sourceChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Receita ao Longo do Tempo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Receita"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
