// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Stethoscope } from "lucide-react";

const SERVICE_LABELS = {
  consultation: 'Consulta',
  follow_up: 'Retorno',
  procedure: 'Procedimento',
  checkup: 'Check-up',
  emergency: 'Emergência',
  therapy: 'Terapia',
  diagnostic: 'Diagnóstico'
};

export default function AppointmentsByService({ appointments }) {
  const data = Object.entries(
    appointments.reduce((acc, apt) => {
      const service = apt.service_type || 'consultation';
      acc[service] = (acc[service] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([service, count]) => ({
      service: SERVICE_LABELS[service] || service,
      count
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-purple-600" />
          Consultas por Tipo de Serviço
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="service" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" name="Quantidade" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
