// @ts-nocheck
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, Eye, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function KPICards({ data }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const kpis = [
    {
      title: "Taxa de Conversão",
      value: `${data.conversionRate?.toFixed(1) || 0}%`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: data.conversionRateChange
    },
    {
      title: "Receita Total",
      value: formatCurrency(data.totalRevenue || 0),
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: data.revenueChange
    },
    {
      title: "CAC (Custo de Aquisição)",
      value: formatCurrency(data.cac || 0),
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: data.cacChange
    },
    {
      title: "ROI",
      value: `${data.roi?.toFixed(1) || 0}%`,
      icon: Eye,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      change: data.roiChange
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        const isPositive = kpi.change >= 0;

        return (
          <Card key={idx} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-slate-500 font-medium mb-1">{kpi.title}</p>
                  <p className="text-2xl font-bold text-slate-900 mb-2">{kpi.value}</p>
                  {kpi.change !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isPositive ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {Math.abs(kpi.change).toFixed(1)}% vs período anterior
                    </div>
                  )}
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${kpi.bgColor}`}>
                  <Icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
