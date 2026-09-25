// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { CheckCircle2 } from "lucide-react";
import { isWithinInterval } from "date-fns";

export default function TaskCompletionChart({ tasks, dateRange }) {
  const getChartData = () => {
    if (!dateRange?.from || !dateRange?.to) return [];

    const filteredTasks = tasks.filter(task => {
      const taskDate = new Date(task.created_date);
      return isWithinInterval(taskDate, { start: dateRange.from, end: dateRange.to });
    });

    const tasksByResponsible = {};
    
    filteredTasks.forEach(task => {
      const responsibles = task.responsaveis || [];
      if (responsibles.length === 0) {
        responsibles.push('Não atribuído');
      }
      
      responsibles.forEach(responsible => {
        if (!tasksByResponsible[responsible]) {
          tasksByResponsible[responsible] = {
            name: responsible.split('@')[0] || responsible,
            total: 0,
            completed: 0,
            pending: 0,
            inProgress: 0
          };
        }
        
        tasksByResponsible[responsible].total++;
        
        if (task.status === 'concluida') {
          tasksByResponsible[responsible].completed++;
        } else if (task.status === 'em_andamento') {
          tasksByResponsible[responsible].inProgress++;
        } else {
          tasksByResponsible[responsible].pending++;
        }
      });
    });

    return Object.values(tasksByResponsible)
      .map(item => ({
        ...item,
        completionRate: item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  };

  const chartData = getChartData();
  const totalCompleted = chartData.reduce((sum, d) => sum + d.completed, 0);
  const totalTasks = chartData.reduce((sum, d) => sum + d.total, 0);
  const avgCompletion = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  return (
    <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-purple-600" />
            Taxa de Conclusão por Responsável
          </div>
          <div className="text-sm font-normal text-slate-500">
            Média: <span className="font-semibold text-purple-600">{avgCompletion}%</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={120} 
                  tick={{ fontSize: 11 }}
                  stroke="#94a3b8"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => {
                    if (name === 'completed') return [value, 'Concluídas'];
                    if (name === 'inProgress') return [value, 'Em Andamento'];
                    if (name === 'pending') return [value, 'Pendentes'];
                    return value;
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => {
                    if (value === 'completed') return 'Concluídas';
                    if (value === 'inProgress') return 'Em Andamento';
                    if (value === 'pending') return 'Pendentes';
                    return value;
                  }}
                />
                <Bar dataKey="completed" stackId="a" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                <Bar dataKey="inProgress" stackId="a" fill="#6366f1" />
                <Bar dataKey="pending" stackId="a" fill="#94a3b8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-slate-400">
            Selecione um período para visualizar os dados
          </div>
        )}
      </CardContent>
    </Card>
  );
}
