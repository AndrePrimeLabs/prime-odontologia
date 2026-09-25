// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Clock, Target, Activity, Zap } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { format, subDays, startOfDay } from "date-fns";

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#14b8a6', '#f97316'];

export default function EngagementMetrics({ engagementData }) {
  // Calculate active users
  const now = new Date();
  const dayAgo = subDays(now, 1);
  const weekAgo = subDays(now, 7);
  const monthAgo = subDays(now, 30);

  const uniqueUsers = (data, since) => {
    return new Set(
      data
        .filter(e => new Date(e.created_date) >= since)
        .map(e => e.user_email)
    ).size;
  };

  const dau = uniqueUsers(engagementData, dayAgo);
  const wau = uniqueUsers(engagementData, weekAgo);
  const mau = uniqueUsers(engagementData, monthAgo);

  // Session metrics
  const sessionEndEvents = engagementData.filter(e => e.event_type === 'session_end');
  const avgSessionDuration = sessionEndEvents.length > 0
    ? Math.round(sessionEndEvents.reduce((sum, e) => sum + (e.duration_seconds || 0), 0) / sessionEndEvents.length)
    : 0;

  // Feature adoption
  const featureUses = engagementData.filter(e => e.event_type === 'page_view' || e.event_type === 'feature_use');
  const featureAdoption = featureUses.reduce((acc, event) => {
    const feature = event.feature_name || 'Unknown';
    acc[feature] = (acc[feature] || 0) + 1;
    return acc;
  }, {});

  const topFeatures = Object.entries(featureAdoption)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));

  // Daily activity (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(now, 6 - i);
    const dayStart = startOfDay(date);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59);

    const dayEvents = engagementData.filter(e => {
      const eventDate = new Date(e.created_date);
      return eventDate >= dayStart && eventDate <= dayEnd;
    });

    const uniqueUsersCount = new Set(dayEvents.map(e => e.user_email)).size;
    const pageViews = dayEvents.filter(e => e.event_type === 'page_view').length;

    return {
      date: format(date, 'dd/MM'),
      users: uniqueUsersCount,
      pageViews: pageViews
    };
  });

  // Conversion funnel
  const conversions = engagementData.filter(e => e.event_type === 'conversion');
  const conversionSteps = conversions.reduce((acc, event) => {
    const step = event.conversion_step || 'Unknown';
    acc[step] = (acc[step] || 0) + 1;
    return acc;
  }, {});

  const totalUsers = new Set(engagementData.map(e => e.user_email)).size;
  const totalPageViews = engagementData.filter(e => e.event_type === 'page_view').length;
  const totalFeatureUses = engagementData.filter(e => e.event_type === 'feature_use').length;

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "DAU", value: dau, icon: Users, color: "text-indigo-600", desc: "Usuários ativos hoje" },
          { label: "WAU", value: wau, icon: Users, color: "text-purple-600", desc: "Últimos 7 dias" },
          { label: "MAU", value: mau, icon: Users, color: "text-pink-600", desc: "Últimos 30 dias" },
          { label: "Sessão Média", value: formatDuration(avgSessionDuration), icon: Clock, color: "text-blue-600", desc: "Duração média" },
          { label: "Visualizações", value: totalPageViews, icon: Activity, color: "text-emerald-600", desc: "Total de páginas" },
          { label: "Ações", value: totalFeatureUses, icon: Zap, color: "text-amber-600", desc: "Features usadas" }
        ].map((metric, idx) => (
          <Card key={idx} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <metric.icon className={cn("w-4 h-4", metric.color)} />
                <span className="text-xs text-slate-500">{metric.label}</span>
              </div>
              <p className={cn("text-2xl font-bold", metric.color)}>{metric.value}</p>
              <p className="text-xs text-slate-400 mt-1">{metric.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Active Users */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Atividade Diária (7 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={2} name="Usuários" />
                <Line yAxisId="right" type="monotone" dataKey="pageViews" stroke="#10b981" strokeWidth={2} name="Páginas" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Features */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Adoção de Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topFeatures}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" name="Acessos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Feature Adoption Breakdown */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Distribuição de Uso por Feature</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {topFeatures.map((feature, idx) => (
              <div key={idx} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-xs font-medium text-slate-600 truncate">{feature.name}</span>
                </div>
                <p className="text-lg font-bold text-slate-900">{feature.value}</p>
                <p className="text-xs text-slate-400">
                  {((feature.value / totalPageViews) * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conversion Funnel */}
      {Object.keys(conversionSteps).length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Funil de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-2 overflow-x-auto">
              {Object.entries(conversionSteps)
                .sort((a, b) => b[1] - a[1])
                .map(([step, count], idx, arr) => (
                  <div key={idx} className="flex-1 min-w-[120px] text-center">
                    <div className="mx-auto w-20 h-20 rounded-xl flex flex-col items-center justify-center text-white font-bold mb-2 bg-gradient-to-br from-indigo-600 to-purple-600">
                      <span className="text-2xl">{count}</span>
                      {idx > 0 && (
                        <span className="text-xs opacity-80">
                          {((count / arr[idx - 1][1]) * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-700">{step}</p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {((count / totalUsers) * 100).toFixed(1)}% dos usuários
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Engagement Summary */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-base">Resumo de Engajamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-slate-600 mb-2">Retenção</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-indigo-600">
                  {totalUsers > 0 ? ((wau / totalUsers) * 100).toFixed(0) : 0}%
                </span>
                <span className="text-xs text-slate-500">usuários retornaram</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-2">Engajamento Médio</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-purple-600">
                  {totalUsers > 0 ? (totalPageViews / totalUsers).toFixed(1) : 0}
                </span>
                <span className="text-xs text-slate-500">páginas por usuário</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-2">Taxa de Ação</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-pink-600">
                  {totalPageViews > 0 ? ((totalFeatureUses / totalPageViews) * 100).toFixed(0) : 0}%
                </span>
                <span className="text-xs text-slate-500">ações por página</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
