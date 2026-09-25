// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Valores médios por tipo de serviço (exemplo - ajustar conforme necessário)
const SERVICE_PRICES = {
  consultation: 150,
  follow_up: 100,
  procedure: 500,
  checkup: 120,
  emergency: 300,
  therapy: 200,
  diagnostic: 180
};

export default function RevenueReport({ appointments }) {
  // Calcular receita baseada em consultas concluídas
  const completedAppointments = appointments.filter(a => a.status === 'completed');
  
  const totalRevenue = completedAppointments.reduce((sum, apt) => {
    return sum + (SERVICE_PRICES[apt.service_type] || 150);
  }, 0);

  // Agrupar receita por período
  const revenueByDate = completedAppointments.reduce((acc, apt) => {
    const date = new Date(apt.date);
    const key = date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
    
    if (!acc[key]) {
      acc[key] = { date: key, revenue: 0, count: 0 };
    }
    
    acc[key].revenue += SERVICE_PRICES[apt.service_type] || 150;
    acc[key].count++;
    return acc;
  }, {});

  const data = Object.values(revenueByDate).sort();

  const avgTicket = completedAppointments.length > 0 
    ? (totalRevenue / completedAppointments.length).toFixed(2)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Relatório de Receita
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-700 font-medium">Receita Total</p>
            <p className="text-2xl font-bold text-green-900 mt-1">
              R$ {totalRevenue.toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700 font-medium">Ticket Médio</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              R$ {avgTicket}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-700 font-medium">Consultas Concluídas</p>
            <p className="text-2xl font-bold text-purple-900 mt-1">
              {completedAppointments.length}
            </p>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
                labelFormatter={(label) => `Data: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Receita"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-slate-500 mb-3">Receita por tipo de serviço:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(SERVICE_PRICES).map(([service, price]) => (
              <Badge key={service} variant="outline">
                {service}: R$ {price}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
