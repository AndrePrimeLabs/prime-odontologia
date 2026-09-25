// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { DollarSign } from "lucide-react";
import { format, eachMonthOfInterval, isWithinInterval, endOfMonth } from "date-fns";

export default function CustomerLTVChart({ customers, dateRange }) {
  const getChartData = () => {
    if (!dateRange?.from || !dateRange?.to) return [];

    const months = eachMonthOfInterval({ start: dateRange.from, end: dateRange.to });
    
    return months.map(monthStart => {
      const monthEnd = endOfMonth(monthStart);
      const monthLabel = format(monthStart, "MMM/yy");
      
      const monthCustomers = customers.filter(customer => {
        const customerDate = new Date(customer.created_date);
        return isWithinInterval(customerDate, { start: dateRange.from, end: monthEnd });
      });
      
      const totalLTV = monthCustomers.reduce((sum, c) => sum + (c.lifetime_value || 0), 0);
      const avgLTV = monthCustomers.length > 0 ? totalLTV / monthCustomers.length : 0;
      
      return {
        month: monthLabel,
        avgLTV: Math.round(avgLTV),
        totalLTV: Math.round(totalLTV),
        customers: monthCustomers.length
      };
    });
  };

  const chartData = getChartData();
  const currentLTV = chartData.length > 0 ? chartData[chartData.length - 1].avgLTV : 0;

  return (
    <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Lifetime Value (LTV) Médio
          </div>
          <div className="text-sm font-normal text-slate-500">
            Atual: <span className="font-semibold text-emerald-600">${currentLTV.toLocaleString()}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorLTV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  stroke="#94a3b8"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#94a3b8"
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => {
                    if (name === 'avgLTV') return [`$${value.toLocaleString()}`, 'LTV Médio'];
                    if (name === 'totalLTV') return [`$${value.toLocaleString()}`, 'LTV Total'];
                    if (name === 'customers') return [value, 'Clientes'];
                    return value;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="avgLTV" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fill="url(#colorLTV)"
                />
              </AreaChart>
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
