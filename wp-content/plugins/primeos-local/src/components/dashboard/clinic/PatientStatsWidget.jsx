// @ts-nocheck
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { format, subMonths, eachMonthOfInterval, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Users } from "lucide-react";

export default function PatientStatsWidget({ appointments }) {
  const today = new Date();

  const { months, newTotal, returningTotal, uniquePatients } = useMemo(() => {
    const sorted = [...appointments].sort((a, b) => a.date.localeCompare(b.date));

    // Track first appearance per patient name (approximation without patient_id)
    const firstSeen = {};
    sorted.forEach(a => {
      const key = a.patient_name?.toLowerCase().trim();
      if (key && !firstSeen[key]) firstSeen[key] = a.date;
    });

    const ms = eachMonthOfInterval({ start: subMonths(today, 5), end: today });
    const months = ms.map(m => {
      const mStart = format(startOfMonth(m), "yyyy-MM-dd");
      const mEnd = format(endOfMonth(m), "yyyy-MM-dd");
      const inMonth = appointments.filter(a => a.date >= mStart && a.date <= mEnd && a.status !== "cancelled");
      
      const newPatients = new Set();
      const returningPatients = new Set();

      inMonth.forEach(a => {
        const key = a.patient_name?.toLowerCase().trim();
        if (!key) return;
        if (firstSeen[key] >= mStart && firstSeen[key] <= mEnd) newPatients.add(key);
        else returningPatients.add(key);
      });

      return {
        label: format(m, "MMM/yy", { locale: ptBR }),
        Novos: newPatients.size,
        Retorno: returningPatients.size,
      };
    });

    const allNew = new Set();
    const allReturn = new Set();
    appointments.filter(a => a.status !== "cancelled").forEach(a => {
      const key = a.patient_name?.toLowerCase().trim();
      if (!key) return;
      const mStart = format(startOfMonth(today), "yyyy-MM-dd");
      const mEnd = format(endOfMonth(today), "yyyy-MM-dd");
      if (firstSeen[key] >= mStart && firstSeen[key] <= mEnd) allNew.add(key);
      else allReturn.add(key);
    });

    return {
      months,
      newTotal: Object.values(firstSeen).filter(d => d >= format(subMonths(today, 1), "yyyy-MM-dd")).length,
      returningTotal: appointments.filter(a => {
        const key = a.patient_name?.toLowerCase().trim();
        return key && firstSeen[key] < format(subMonths(today, 0, "yyyy-MM-dd"), "yyyy-MM-dd");
      }).length,
      uniquePatients: Object.keys(firstSeen).length,
    };
  }, [appointments]);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <CardTitle className="text-base">Estatísticas de Pacientes</CardTitle>
        </div>
        <div className="flex gap-4 mt-1">
          <span className="text-xs text-slate-500">Total únicos: <strong className="text-slate-800">{uniquePatients}</strong></span>
          <span className="text-xs text-slate-500">Novos (último mês): <strong className="text-blue-600">{newTotal}</strong></span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={months} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Novos" fill="#6366f1" radius={[3,3,0,0]} />
              <Bar dataKey="Retorno" fill="#06b6d4" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
