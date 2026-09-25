// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from "recharts";
import { TrendingUp } from "lucide-react";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CashFlowChart({ transactions }) {
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(new Date(), 5 - i);
    const key = format(d, "yyyy-MM");
    const label = format(d, "MMM/yy", { locale: ptBR });
    const monthTx = transactions.filter(t => t.date?.startsWith(key));
    const receitas = monthTx.filter(t => t.type === "receita" && t.status !== "cancelado")
      .reduce((s, t) => s + (t.amount || 0), 0);
    const despesas = monthTx.filter(t => t.type === "despesa" && t.status !== "cancelado")
      .reduce((s, t) => s + (t.amount || 0), 0);
    return { label, receitas, despesas, lucro: receitas - despesas };
  });

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Receitas vs Despesas (6 meses)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={last6Months}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
              <Legend />
              <Bar dataKey="receitas" name="Receitas" fill="#10b981" radius={[4,4,0,0]} />
              <Bar dataKey="despesas" name="Despesas" fill="#f43f5e" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            Lucro Líquido (6 meses)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={last6Months}>
              <defs>
                <linearGradient id="lucroGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
              <Area type="monotone" dataKey="lucro" name="Lucro" stroke="#6366f1" fill="url(#lucroGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
