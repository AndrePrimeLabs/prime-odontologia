// @ts-nocheck
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { primeos } from "@/api/primeosClient";
import PageHeader from "@/components/shared/PageHeader";
import ReportFilters from "@/components/reports/ReportFilters";
import KPICards from "@/components/reports/KPICards";
import InteractiveCharts from "@/components/reports/InteractiveCharts";
import ExportOptions from "@/components/reports/ExportOptions";
import ScheduleReportForm from "@/components/reports/ScheduleReportForm";
import CustomDashboardBuilder from "@/components/reports/CustomDashboardBuilder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3 } from "lucide-react";

export default function AdvancedReports() {
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    category: "",
    status: "",
    responsible: ""
  });

  const [loading, setLoading] = useState(false);

  // Fetch data
  const { data: sales = [] } = useQuery({
    queryKey: ["sales"],
    queryFn: () => primeos.entities.Sale.list(),
  });

  const { data: interactions = [] } = useQuery({
    queryKey: ["interactions"],
    queryFn: () => primeos.entities.Interaction.list(),
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: () => primeos.entities.Lead.list(),
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => primeos.entities.Expense.list(),
  });

  // Process data based on filters
  const processedData = useMemo(() => {
    const startDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);

    // Filter sales
    const filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.created_date);
      return saleDate >= startDate && saleDate <= endDate;
    });

    // Filter interactions
    const filteredInteractions = interactions.filter(interaction => {
      const intDate = new Date(interaction.created_date);
      return intDate >= startDate && intDate <= endDate;
    });

    // Filter leads
    const filteredLeads = leads.filter(lead => {
      const leadDate = new Date(lead.created_date);
      return leadDate >= startDate && leadDate <= endDate;
    });

    // Filter expenses
    const filteredExpenses = expenses.filter(expense => {
      const expDate = new Date(expense.date);
      return expDate >= startDate && expDate <= endDate;
    });

    // Calculate KPIs
    const totalRevenue = filteredSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const conversionRate = filteredLeads.length > 0 
      ? (filteredSales.length / filteredLeads.length) * 100 
      : 0;
    const cac = filteredSales.length > 0 ? totalExpenses / filteredSales.length : 0;
    const roi = totalExpenses > 0 ? ((totalRevenue - totalExpenses) / totalExpenses) * 100 : 0;

    // Revenue by channel
    const revenueByChannel = {};
    filteredSales.forEach(sale => {
      const channel = sale.channel || 'Direto';
      revenueByChannel[channel] = (revenueByChannel[channel] || 0) + (sale.total_amount || 0);
    });

    // Pipeline distribution
    const pipelineDistribution = {};
    filteredLeads.forEach(lead => {
      const stage = lead.stage || 'Não especificado';
      pipelineDistribution[stage] = (pipelineDistribution[stage] || 0) + 1;
    });

    // Performance by category (from interactions)
    const performanceByCategory = {};
    filteredInteractions.forEach(interaction => {
      const type = interaction.type || 'Outro';
      if (!performanceByCategory[type]) {
        performanceByCategory[type] = { category: type, completed: 0, pending: 0, cancelled: 0 };
      }
      if (interaction.outcome === 'positive') performanceByCategory[type].completed++;
      else if (interaction.outcome === 'pending') performanceByCategory[type].pending++;
      else if (interaction.outcome === 'negative') performanceByCategory[type].cancelled++;
    });

    // Conversion history (daily)
    const conversionHistory = [];
    for (let d = new Date(filters.startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayLeads = filteredLeads.filter(l => {
        const ld = new Date(l.created_date);
        return ld.toDateString() === d.toDateString();
      }).length;
      const daySales = filteredSales.filter(s => {
        const sd = new Date(s.created_date);
        return sd.toDateString() === d.toDateString();
      }).length;
      conversionHistory.push({
        date: d.toLocaleDateString('pt-BR'),
        rate: dayLeads > 0 ? (daySales / dayLeads) * 100 : 0
      });
    }

    // ROI trend (daily)
    const roiTrend = [];
    for (let d = new Date(filters.startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayRevenue = filteredSales
        .filter(s => new Date(s.created_date).toDateString() === d.toDateString())
        .reduce((sum, s) => sum + (s.total_amount || 0), 0);
      const dayExpenses = filteredExpenses
        .filter(e => new Date(e.date).toDateString() === d.toDateString())
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      roiTrend.push({
        date: d.toLocaleDateString('pt-BR'),
        roi: dayExpenses > 0 ? ((dayRevenue - dayExpenses) / dayExpenses) * 100 : 0
      });
    }

    // Team performance
    const teamPerformance = {};
    filteredInteractions.forEach(interaction => {
      const responsible = interaction.responsible_user || 'Não atribuído';
      if (!teamPerformance[responsible]) {
        teamPerformance[responsible] = { name: responsible, tasks: 0, completed: 0 };
      }
      teamPerformance[responsible].tasks++;
      if (interaction.outcome === 'positive') teamPerformance[responsible].completed++;
    });

    return {
      kpis: {
        conversionRate,
        totalRevenue,
        cac,
        roi,
        conversionRateChange: 5.2,
        revenueChange: 12.3,
        cacChange: -3.1,
        roiChange: 8.5
      },
      charts: {
        revenueByChannel: Object.entries(revenueByChannel).map(([channel, value]) => ({
          channel,
          value
        })),
        conversionHistory,
        pipelineDistribution: Object.entries(pipelineDistribution).map(([name, value]) => ({
          name,
          value
        })),
        performanceByCategory: Object.values(performanceByCategory),
        roiTrend,
        teamPerformance: Object.values(teamPerformance)
      },
      tableData: filteredSales.map(sale => ({
        'Data': new Date(sale.created_date).toLocaleDateString('pt-BR'),
        'Cliente': sale.customer_name,
        'Valor': `R$ ${(sale.total_amount || 0).toFixed(2)}`,
        'Canal': sale.channel || 'Direto',
        'Status': sale.status,
        'Produtos': sale.products?.length || 0
      }))
    };
  }, [sales, interactions, leads, expenses, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      category: "",
      status: "",
      responsible: ""
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Relatórios Avançados"
          subtitle="Análise detalhada de dados com visualizações interativas"
          icon={BarChart3}
        />

        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="schedule">Agendar</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-6">
            {/* Filters */}
            <ReportFilters 
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />

            {/* KPI Cards */}
            <KPICards data={processedData.kpis} />

            {/* Interactive Charts */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-slate-900">Visualizações</h2>
              <InteractiveCharts data={processedData.charts} />
            </div>

            {/* Export Options */}
            <ExportOptions 
              reportData={processedData.tableData}
              reportTitle={`Relatório_${new Date().toISOString().split('T')[0]}`}
              filters={filters}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="schedule">
            <ScheduleReportForm />
          </TabsContent>

          <TabsContent value="dashboard">
            <CustomDashboardBuilder />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
