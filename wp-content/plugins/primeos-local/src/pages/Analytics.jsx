// @ts-nocheck
import { useState, useMemo } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Target,
  Activity
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import { format, parseISO, isWithinInterval, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import ExportButton from "@/components/shared/ExportButton";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

export default function Analytics() {
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd")
  });
  const [selectedSources, setSelectedSources] = useState(["all"]);

  const { data: marketingMetrics = [] } = useQuery({
    queryKey: ["marketingMetrics"],
    queryFn: () => primeos.entities.MarketingMetric.list("-date")
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => primeos.entities.Appointment.list("-date")
  });

  const { data: engagement = [] } = useQuery({
    queryKey: ["engagement"],
    queryFn: () => primeos.entities.UserEngagement.list("-created_date")
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: () => primeos.entities.Lead.list("-created_date")
  });

  // Filter data by date range and source
  const filteredMetrics = useMemo(() => {
    return marketingMetrics.filter(metric => {
      if (!metric.date) return false;
      
      const metricDate = parseISO(metric.date);
      const inRange = isWithinInterval(metricDate, {
        start: parseISO(dateRange.start),
        end: parseISO(dateRange.end)
      });

      const sourceMatch = selectedSources.includes("all") || 
                          selectedSources.includes(metric.platform?.toLowerCase());

      return inRange && sourceMatch;
    });
  }, [marketingMetrics, dateRange, selectedSources]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      if (!apt.date) return false;
      
      const aptDate = parseISO(apt.date);
      return isWithinInterval(aptDate, {
        start: parseISO(dateRange.start),
        end: parseISO(dateRange.end)
      });
    });
  }, [appointments, dateRange]);

  const filteredEngagement = useMemo(() => {
    return engagement.filter(eng => {
      if (!eng.created_date) return false;
      
      const engDate = parseISO(eng.created_date);
      return isWithinInterval(engDate, {
        start: parseISO(dateRange.start),
        end: parseISO(dateRange.end)
      });
    });
  }, [engagement, dateRange]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalInvestment = filteredMetrics.reduce((sum, m) => sum + (m.investment || 0), 0);
    const totalRevenue = filteredMetrics.reduce((sum, m) => sum + (m.revenue || 0), 0);
    const totalLeads = filteredMetrics.reduce((sum, m) => sum + (m.leads || 0), 0);
    const totalClicks = filteredMetrics.reduce((sum, m) => sum + (m.clicks || 0), 0);
    const totalImpressions = filteredMetrics.reduce((sum, m) => sum + (m.impressions || 0), 0);
    
    const roi = totalInvestment > 0 ? ((totalRevenue - totalInvestment) / totalInvestment) * 100 : 0;
    const cac = totalLeads > 0 ? totalInvestment / totalLeads : 0;
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    
    const confirmedAppointments = filteredAppointments.filter(a => a.status === "confirmed" || a.status === "completed").length;
    const bookingRate = filteredAppointments.length > 0 
      ? (confirmedAppointments / filteredAppointments.length) * 100 
      : 0;

    const pageViews = filteredEngagement.filter(e => e.event_type === "page_view").length;
    const conversions = filteredEngagement.filter(e => e.event_type === "conversion").length;
    const conversionRate = pageViews > 0 ? (conversions / pageViews) * 100 : 0;

    return {
      roi,
      cac,
      totalLeads,
      totalRevenue,
      totalInvestment,
      ctr,
      bookingRate,
      confirmedAppointments,
      totalAppointments: filteredAppointments.length,
      pageViews,
      conversions,
      conversionRate
    };
  }, [filteredMetrics, filteredAppointments, filteredEngagement]);

  // Platform comparison data
  const platformData = useMemo(() => {
    const platforms = {};
    
    filteredMetrics.forEach(metric => {
      const platform = metric.platform || "Unknown";
      if (!platforms[platform]) {
        platforms[platform] = { 
          name: platform, 
          investment: 0, 
          revenue: 0, 
          leads: 0,
          clicks: 0,
          impressions: 0
        };
      }
      platforms[platform].investment += metric.investment || 0;
      platforms[platform].revenue += metric.revenue || 0;
      platforms[platform].leads += metric.leads || 0;
      platforms[platform].clicks += metric.clicks || 0;
      platforms[platform].impressions += metric.impressions || 0;
    });

    return Object.values(platforms).map(p => ({
      ...p,
      roi: p.investment > 0 ? ((p.revenue - p.investment) / p.investment) * 100 : 0,
      cac: p.leads > 0 ? p.investment / p.leads : 0
    }));
  }, [filteredMetrics]);

  // Time series data
  const timeSeriesData = useMemo(() => {
    const dateMap = {};
    
    filteredMetrics.forEach(metric => {
      const date = format(parseISO(metric.date), "dd/MM");
      if (!dateMap[date]) {
        dateMap[date] = { date, investment: 0, revenue: 0, leads: 0 };
      }
      dateMap[date].investment += metric.investment || 0;
      dateMap[date].revenue += metric.revenue || 0;
      dateMap[date].leads += metric.leads || 0;
    });

    return Object.values(dateMap).sort((a, b) => {
      const [dayA, monthA] = a.date.split('/');
      const [dayB, monthB] = b.date.split('/');
      return monthA === monthB ? dayA - dayB : monthA - monthB;
    });
  }, [filteredMetrics]);

  // Engagement funnel
  const engagementFunnel = useMemo(() => {
    const eventTypes = {};
    filteredEngagement.forEach(e => {
      const type = e.event_type || "unknown";
      eventTypes[type] = (eventTypes[type] || 0) + 1;
    });

    return [
      { name: "Page Views", value: eventTypes.page_view || 0 },
      { name: "Feature Uses", value: eventTypes.feature_use || 0 },
      { name: "Actions", value: eventTypes.action_completed || 0 },
      { name: "Conversions", value: eventTypes.conversion || 0 }
    ];
  }, [filteredEngagement]);

  const toggleSource = (source) => {
    if (source === "all") {
      setSelectedSources(["all"]);
    } else {
      const newSources = selectedSources.includes("all") 
        ? [source]
        : selectedSources.includes(source)
          ? selectedSources.filter(s => s !== source)
          : [...selectedSources.filter(s => s !== "all"), source];
      
      setSelectedSources(newSources.length === 0 ? ["all"] : newSources);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-indigo-600" />
                Analytics Dashboard
              </h1>
              <p className="text-slate-500 mt-1">
                Análise integrada de Google Ads, Facebook Ads e Google Calendar
              </p>
            </div>
            <ExportButton 
              data={[...filteredMetrics, ...filteredAppointments, ...filteredEngagement]} 
              filename="analytics-data"
            />
          </div>

          {/* Filters */}
          <Card className="border-indigo-200 bg-white">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label className="text-xs text-slate-600 mb-2 block">Período</Label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="flex-1"
                    />
                    <span className="self-center text-slate-400">até</span>
                    <Input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-slate-600 mb-2 block">Fontes de Dados</Label>
                  <div className="flex flex-wrap gap-2">
                    {["all", "google_ads", "facebook_ads", "google_calendar"].map(source => (
                      <Badge
                        key={source}
                        variant={selectedSources.includes(source) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleSource(source)}
                      >
                        {source === "all" ? "Todas" : source.replace(/_/g, " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">ROI</p>
                  <p className="text-xl font-bold text-slate-900">{kpis.roi.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">CAC</p>
                  <p className="text-xl font-bold text-slate-900">R$ {kpis.cac.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Leads</p>
                  <p className="text-xl font-bold text-slate-900">{kpis.totalLeads}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Taxa Agendamento</p>
                  <p className="text-xl font-bold text-slate-900">{kpis.bookingRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Charts */}
        <Tabs defaultValue="performance" className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="platforms">Plataformas</TabsTrigger>
            <TabsTrigger value="engagement">Engajamento</TabsTrigger>
            <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Investimento vs Receita</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" style={{ fontSize: 12 }} />
                      <YAxis style={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="investment" 
                        stackId="1"
                        stroke="#ef4444" 
                        fill="#fee2e2"
                        name="Investimento"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stackId="2"
                        stroke="#10b981" 
                        fill="#d1fae5"
                        name="Receita"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Leads Gerados</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" style={{ fontSize: 12 }} />
                      <YAxis style={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="leads" 
                        stroke="#6366f1" 
                        strokeWidth={3}
                        name="Leads"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Investimento Total</span>
                      <span className="font-bold text-red-600">R$ {kpis.totalInvestment.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Receita Total</span>
                      <span className="font-bold text-green-600">R$ {kpis.totalRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t">
                      <span className="text-sm font-medium text-slate-900">Lucro</span>
                      <span className={cn("font-bold", (kpis.totalRevenue - kpis.totalInvestment) >= 0 ? "text-green-600" : "text-red-600")}>
                        R$ {(kpis.totalRevenue - kpis.totalInvestment).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">CTR Médio</span>
                      <span className="font-bold text-indigo-600">{kpis.ctr.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Taxa Conversão</span>
                      <span className="font-bold text-purple-600">{kpis.conversionRate.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t">
                      <span className="text-sm font-medium text-slate-900">Conversões</span>
                      <span className="font-bold text-slate-900">{kpis.conversions}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Agendamentos</span>
                      <span className="font-bold text-blue-600">{kpis.totalAppointments}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Confirmados</span>
                      <span className="font-bold text-green-600">{kpis.confirmedAppointments}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t">
                      <span className="text-sm font-medium text-slate-900">Page Views</span>
                      <span className="font-bold text-slate-900">{kpis.pageViews}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="platforms" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Comparação de Plataformas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={platformData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" style={{ fontSize: 12 }} />
                    <YAxis style={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="investment" fill="#ef4444" name="Investimento" />
                    <Bar dataKey="revenue" fill="#10b981" name="Receita" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">ROI por Plataforma</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={platformData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" style={{ fontSize: 12 }} />
                      <YAxis type="category" dataKey="name" style={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="roi" fill="#6366f1" name="ROI %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Leads por Plataforma</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={platformData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="leads"
                      >
                        {platformData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Funil de Engajamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={engagementFunnel}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" style={{ fontSize: 12 }} />
                      <YAxis style={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Distribuição de Eventos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={engagementFunnel}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {engagementFunnel.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-900">{filteredAppointments.length}</p>
                  <p className="text-sm text-slate-500">Total de Agendamentos</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-900">{kpis.confirmedAppointments}</p>
                  <p className="text-sm text-slate-500">Confirmados</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  <Activity className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-900">{kpis.bookingRate.toFixed(1)}%</p>
                  <p className="text-sm text-slate-500">Taxa de Confirmação</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Status dos Agendamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(
                        filteredAppointments.reduce((acc, apt) => {
                          const status = apt.status || "unknown";
                          acc[status] = (acc[status] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([name, value]) => ({ name, value }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.keys(filteredAppointments.reduce((acc, apt) => {
                        acc[apt.status || "unknown"] = 1;
                        return acc;
                      }, {})).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
