// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

export default function AppointmentsByPeriod({ appointments, dateRange }) {
  // Agrupar por dia/semana/mês dependendo do range
  const groupAppointments = () => {
    const grouped = {};
    
    appointments.forEach(apt => {
      const date = new Date(apt.date);
      const key = date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
      
      if (!grouped[key]) {
        grouped[key] = { date: key, total: 0, completed: 0, cancelled: 0, scheduled: 0 };
      }
      
      grouped[key].total++;
      if (apt.status === 'completed') grouped[key].completed++;
      if (apt.status === 'cancelled') grouped[key].cancelled++;
      if (apt.status === 'scheduled' || apt.status === 'confirmed') grouped[key].scheduled++;
    });

    return Object.values(grouped).sort((a, b) => {
      // Sort by date
      return 0;
    });
  };

  const data = groupAppointments();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Consultas por Período
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#10b981" name="Concluídas" />
              <Bar dataKey="scheduled" fill="#3b82f6" name="Agendadas" />
              <Bar dataKey="cancelled" fill="#ef4444" name="Canceladas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
