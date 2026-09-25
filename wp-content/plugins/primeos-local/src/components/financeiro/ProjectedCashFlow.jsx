// @ts-nocheck
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine
} from "recharts";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { format, addMonths, startOfMonth, endOfMonth, parseISO, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

function buildMonthData(transactions, monthDate) {
  const start = startOfMonth(monthDate);
  const end = endOfMonth(monthDate);
  const inMonth = transactions.filter(t => {
    const d = t.due_date || t.date;
    if (!d) return false;
    try { return isWithinInterval(parseISO(d), { start, end }); } catch { return false; }
  });
  const receitas = inMonth.filter(t => t.type === "receita" && t.status !== "cancelado").reduce((s, t) => s + (t.amount || 0), 0);
  const despesas = inMonth.filter(t => t.type === "despesa" && t.status !== "cancelado").reduce((s, t) => s + (t.amount || 0), 0);
  const recebido = inMonth.filter(t => t.type === "receita" && t.status === "pago").reduce((s, t) => s + (t.amount || 0), 0);
  const pago = inMonth.filter(t => t.type === "despesa" && t.status === "pago").reduce((s, t) => s + (t.amount || 0), 0);
  return { receitas, despesas, recebido, pago, saldo: receitas - despesas };
}

export default function ProjectedCashFlow({ transactions }) {
  const data = useMemo(() => {
    const now = new Date();
    // 3 months history + current + 3 months projected
    return Array.from({ length: 7 }, (_, i) => {
      const monthDate = addMonths(startOfMonth(now), i - 3);
      const label = format(monthDate, "MMM/yy", { locale: ptBR });
      const isProjected = monthDate > now;
      const { receitas, despesas, saldo } = buildMonthData(transactions, monthDate);
      return { label, receitas, despesas, saldo, isProjected };
    });
  }, [transactions]);

  // Running balance
  let balance = 0;
  const dataWithBalance = data.map(d => {
    balance += d.saldo;
    return { ...d, saldoAcumulado: balance };
  });

  const projectedRevenue = data.filter(d => d.isProjected).reduce((s, d) => s + d.receitas, 0);
  const projectedExpenses = data.filter(d => d.isProjected).reduce((s, d) => s + d.despesas, 0);
  const projectedBalance = projectedRevenue - projectedExpenses;

  return (
    <div className="space-y-6">
      {/* Projected summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-xs text-emerald-700 font-medium">Receita Projetada (3 meses)</span>
            </div>
            <p className="text-2xl font-bold text-emerald-700">
              R$ {projectedRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-rose-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-rose-600" />
              <span className="text-xs text-rose-700 font-medium">Despesa Projetada (3 meses)</span>
            </div>
            <p className="text-2xl font-bold text-rose-700">
              R$ {projectedExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card className={`border-0 shadow-sm ${projectedBalance >= 0 ? "bg-indigo-50" : "bg-amber-50"}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className={`w-4 h-4 ${projectedBalance >= 0 ? "text-indigo-600" : "text-amber-600"}`} />
              <span className={`text-xs font-medium ${projectedBalance >= 0 ? "text-indigo-700" : "text-amber-700"}`}>Saldo Projetado</span>
            </div>
            <p className={`text-2xl font-bold ${projectedBalance >= 0 ? "text-indigo-700" : "text-amber-700"}`}>
              R$ {projectedBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Fluxo de Caixa — Histórico + Projeção</CardTitle>
            <div className="flex gap-2">
              <Badge className="bg-slate-100 text-slate-600 border-0 text-xs">Histórico</Badge>
              <Badge className="bg-indigo-100 text-indigo-600 border-0 text-xs">Projetado</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={dataWithBalance} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v, name) => [`R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, name]}
                contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
              <Bar dataKey="receitas" name="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.85}
                stroke="#059669" strokeWidth={0}
              />
              <Bar dataKey="despesas" name="Despesas" fill="#f43f5e" radius={[4, 4, 0, 0]} opacity={0.85} />
              <Line dataKey="saldoAcumulado" name="Saldo Acumulado" type="monotone" stroke="#6366f1"
                strokeWidth={2.5} dot={{ r: 4, fill: "#6366f1" }} strokeDasharray="0" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly breakdown table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Detalhamento Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 px-3 text-xs font-medium text-slate-500">Mês</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-emerald-600">Receitas</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-rose-600">Despesas</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-indigo-600">Saldo</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-slate-500">Acumulado</th>
                  <th className="text-center py-2 px-3 text-xs font-medium text-slate-400">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {dataWithBalance.map((row, i) => (
                  <tr key={i} className={`border-b border-slate-50 hover:bg-slate-50 ${row.isProjected ? "opacity-80" : ""}`}>
                    <td className="py-2 px-3 font-medium text-slate-700">{row.label}</td>
                    <td className="py-2 px-3 text-right text-emerald-700">
                      R$ {row.receitas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-right text-rose-700">
                      R$ {row.despesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`py-2 px-3 text-right font-semibold ${row.saldo >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                      R$ {row.saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`py-2 px-3 text-right ${row.saldoAcumulado >= 0 ? "text-indigo-700" : "text-amber-700"}`}>
                      R$ {row.saldoAcumulado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <Badge className={`text-xs border-0 ${row.isProjected ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"}`}>
                        {row.isProjected ? "Projeção" : "Real"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
