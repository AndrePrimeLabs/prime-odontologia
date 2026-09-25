// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp } from "lucide-react";
import { format, endOfWeek, eachWeekOfInterval, isWithinInterval } from "date-fns";

export default function LeadConversionChart({ leads, dateRange }) {
  const getChartData = () => {
    if (!dateRange?.from || !dateRange?.to) return [];

    const weeks = eachWeekOfInterval({ start: dateRange.from, end: dateRange.to });
    
    return weeks.map(weekStart => {
      const weekEnd = endOfWeek(weekStart);
      const weekLabel = format(weekStart, "dd/MM");
      
      const weekLeads = leads.filter(lead => {
        const leadDate = lead.data_entrada ? new Date(lead.data_entrada) : new Date(lead.created_date);
        return isWithinInterval(leadDate, { start: weekStart, end: weekEnd });
      });
      
      const totalLeads = weekLeads.length;
      const convertedLeads = weekLeads.filter(l => l.status === 'fechado').length;
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
      
      return {
        week: weekLabel,
        total: totalLeads,
        converted: convertedLeads,
        rate: Math.round(conversionRate)
      };
    });
  };

  const chartData = getChartData();
  const avgConversion = chartData.length > 0 
    ? Math.round(chartData.reduce((sum, d) => sum + d.rate, 0) / chartData.length) 
    : 0;

  return (
    <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Taxa de Conversão de Leads
          </div>
          <div className="text-sm font-normal text-slate-500">
            Média: <span className="font-semibold text-indigo-600">{avgConversion}%</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="week" 
                  tick={{ fontSize: 12 }}
                  stroke="#94a3b8"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#94a3b8"
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => {
                    if (name === 'rate') return [`${value}%`, 'Taxa de Conversão'];
                    if (name === 'converted') return [value, 'Convertidos'];
                    if (name === 'total') return [value, 'Total de Leads'];
                    return value;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 flex items-center justify-center text-slate-400">
            Selecione um período para visualizar os dados
          </div>
        )}
      </CardContent>
    </Card>
  );
}
