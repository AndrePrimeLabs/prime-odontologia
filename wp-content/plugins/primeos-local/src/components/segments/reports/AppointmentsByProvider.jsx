// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users } from "lucide-react";

export default function AppointmentsByProvider({ appointments }) {
  const data = Object.entries(
    appointments.reduce((acc, apt) => {
      const provider = apt.provider || 'Não especificado';
      if (!acc[provider]) {
        acc[provider] = { provider, total: 0, completed: 0, cancelled: 0 };
      }
      acc[provider].total++;
      if (apt.status === 'completed') acc[provider].completed++;
      if (apt.status === 'cancelled') acc[provider].cancelled++;
      return acc;
    }, {})
  )
    .map(([_, data]) => data)
    .sort((a, b) => b.total - a.total);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Desempenho por Dentista
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="provider" type="category" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#10b981" name="Concluídas" />
              <Bar dataKey="total" fill="#3b82f6" name="Total" />
              <Bar dataKey="cancelled" fill="#ef4444" name="Canceladas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
