// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import AppointmentsByPeriod from "@/components/reports/AppointmentsByPeriod";
import AttendanceRate from "@/components/reports/AttendanceRate";
import AppointmentsByService from "@/components/reports/AppointmentsByService";
import AppointmentsByProvider from "@/components/reports/AppointmentsByProvider";
import RevenueReport from "@/components/reports/RevenueReport";
import DateRangeFilter from "@/components/dashboard/DateRangeFilter";

export default function AppointmentReports() {
  const [dateRange, setDateRange] = useState(null);

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => primeos.entities.Appointment.list(),
    initialData: []
  });

  // Calcular métricas gerais
  const filteredAppointments = dateRange 
    ? appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate >= dateRange.from && aptDate <= dateRange.to;
      })
    : appointments;

  const totalAppointments = filteredAppointments.length;
  const completedAppointments = filteredAppointments.filter(a => a.status === 'completed').length;
  const cancelledAppointments = filteredAppointments.filter(a => a.status === 'cancelled').length;
  const noShowAppointments = filteredAppointments.filter(a => a.status === 'no_show').length;
  const attendanceRate = totalAppointments > 0 
    ? ((completedAppointments / totalAppointments) * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Relatórios de Consultas</h1>
            <p className="text-slate-600 mt-1">Análise detalhada do desempenho da clínica</p>
          </div>
          <DateRangeFilter dateRange={dateRange} setDateRange={setDateRange} />
        </div>

        {/* Métricas Resumidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total de Consultas
              </CardTitle>
              <Calendar className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{totalAppointments}</div>
              <p className="text-xs text-slate-500 mt-1">
                {dateRange ? 'No período selecionado' : 'Total geral'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Taxa de Comparecimento
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{attendanceRate}%</div>
              <p className="text-xs text-slate-500 mt-1">
                {completedAppointments} consultas concluídas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Cancelamentos
              </CardTitle>
              <XCircle className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{cancelledAppointments}</div>
              <p className="text-xs text-slate-500 mt-1">
                {totalAppointments > 0 ? ((cancelledAppointments / totalAppointments) * 100).toFixed(1) : 0}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Não Compareceram
              </CardTitle>
              <CheckCircle className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{noShowAppointments}</div>
              <p className="text-xs text-slate-500 mt-1">
                {totalAppointments > 0 ? ((noShowAppointments / totalAppointments) * 100).toFixed(1) : 0}% do total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos Detalhados */}
        <Tabs defaultValue="period" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="period">Por Período</TabsTrigger>
            <TabsTrigger value="attendance">Comparecimento</TabsTrigger>
            <TabsTrigger value="service">Por Serviço</TabsTrigger>
            <TabsTrigger value="provider">Por Dentista</TabsTrigger>
            <TabsTrigger value="revenue">Receita</TabsTrigger>
          </TabsList>

          <TabsContent value="period">
            <AppointmentsByPeriod appointments={filteredAppointments} dateRange={dateRange} />
          </TabsContent>

          <TabsContent value="attendance">
            <AttendanceRate appointments={filteredAppointments} />
          </TabsContent>

          <TabsContent value="service">
            <AppointmentsByService appointments={filteredAppointments} />
          </TabsContent>

          <TabsContent value="provider">
            <AppointmentsByProvider appointments={filteredAppointments} />
          </TabsContent>

          <TabsContent value="revenue">
            <RevenueReport appointments={filteredAppointments} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
