// @ts-nocheck
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download, TrendingUp, DollarSign,
  BarChart3, Users, Scale, ArrowDownCircle, Printer
} from "lucide-react";
import { parseISO, format, isWithinInterval, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from "recharts";

const fmtBRL = (v) => `R$ ${(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

const CATEGORIES = [
  "consulta", "procedimento", "material", "equipamento",
  "aluguel", "salario", "marketing", "impostos", "outros_receita", "outros_despesa"
];

const STATUS_OPTIONS = ["pago", "pendente", "vencido", "cancelado"];

// ─── Filters Bar ────────────────────────────────────────────────────────────
function FiltersBar({ filters, onChange, onExportCSV, onExportPDF, count }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="pt-5 pb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <Label className="text-xs text-slate-500 mb-1 block">Data Inicial</Label>
            <Input type="date" value={filters.startDate} onChange={e => onChange({ ...filters, startDate: e.target.value })} className="w-40" />
          </div>
          <div>
            <Label className="text-xs text-slate-500 mb-1 block">Data Final</Label>
            <Input type="date" value={filters.endDate} onChange={e => onChange({ ...filters, endDate: e.target.value })} className="w-40" />
          </div>
          <div>
            <Label className="text-xs text-slate-500 mb-1 block">Tipo</Label>
            <Select value={filters.type} onValueChange={v => onChange({ ...filters, type: v })}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="receita">Receitas</SelectItem>
                <SelectItem value="despesa">Despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-slate-500 mb-1 block">Categoria</Label>
            <Select value={filters.category} onValueChange={v => onChange({ ...filters, category: v })}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace(/_/g, " ")}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-slate-500 mb-1 block">Status</Label>
            <Select value={filters.status} onValueChange={v => onChange({ ...filters, status: v })}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={onExportCSV} className="gap-1.5">
              <Download className="w-3.5 h-3.5" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={onExportPDF} className="gap-1.5">
              <Printer className="w-3.5 h-3.5" /> PDF
            </Button>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2">{count} transações no período</p>
      </CardContent>
    </Card>
  );
}

// ─── DRE ────────────────────────────────────────────────────────────────────
function DREReport({ transactions, period }) {
  const receitas = transactions.filter(t => t.type === "receita" && t.status !== "cancelado");
  const despesas = transactions.filter(t => t.type === "despesa" && t.status !== "cancelado");
  const totalReceita = receitas.reduce((s, t) => s + (t.amount || 0), 0);
  const totalDespesa = despesas.reduce((s, t) => s + (t.amount || 0), 0);
  const lucro = totalReceita - totalDespesa;
  const margin = totalReceita > 0 ? (lucro / totalReceita) * 100 : 0;

  const recCat = {};
  receitas.forEach(t => { recCat[t.category] = (recCat[t.category] || 0) + (t.amount || 0); });
  const despCat = {};
  despesas.forEach(t => { despCat[t.category] = (despCat[t.category] || 0) + (t.amount || 0); });

  // Monthly chart data
  const months = {};
  transactions.filter(t => t.status !== "cancelado" && t.date).forEach(t => {
    const k = format(parseISO(t.date), "MMM/yy", { locale: ptBR });
    if (!months[k]) months[k] = { name: k, Receitas: 0, Despesas: 0 };
    if (t.type === "receita") months[k].Receitas += t.amount || 0;
    else months[k].Despesas += t.amount || 0;
  });
  const chartData = Object.values(months);

  const Section = ({ title, data, total, colorClass, sign = "" }) => (
    <div className="mb-4">
      <div className={`font-bold text-sm mb-2 ${colorClass}`}>{title}</div>
      {Object.entries(data).sort(([,a],[,b]) => b-a).map(([cat, val]) => (
        <div key={cat} className="flex justify-between py-1 border-b border-slate-100 text-sm">
          <span className="ml-4 capitalize text-slate-600">{cat.replace(/_/g, " ")}</span>
          <span className="text-slate-700">{sign}{fmtBRL(val)}</span>
        </div>
      ))}
      <div className={`flex justify-between font-bold text-sm pt-1.5 mt-1 border-t border-slate-300 ${colorClass}`}>
        <span>TOTAL {title}</span>
        <span>{sign}{fmtBRL(total)}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {chartData.length > 1 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Receitas × Despesas por Período</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => fmtBRL(v)} />
                <Legend />
                <Bar dataKey="Receitas" fill="#10b981" radius={[4,4,0,0]} />
                <Bar dataKey="Despesas" fill="#f43f5e" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="bg-slate-50 rounded-xl p-5 font-mono text-sm">
        <h3 className="font-bold text-center text-slate-900 mb-1 uppercase tracking-wide text-base">
          DRE – Demonstração do Resultado do Exercício
        </h3>
        <p className="text-center text-xs text-slate-500 mb-5">{period}</p>

        <Section title="RECEITAS BRUTAS" data={recCat} total={totalReceita} colorClass="text-emerald-700" />
        <Section title="DESPESAS" data={despCat} total={totalDespesa} colorClass="text-rose-700" sign="(" />

        <div className={`flex justify-between font-bold text-base border-t-2 border-slate-400 pt-3 mt-2 ${lucro >= 0 ? "text-indigo-700" : "text-red-700"}`}>
          <span>RESULTADO LÍQUIDO DO EXERCÍCIO</span>
          <span>{lucro >= 0 ? fmtBRL(lucro) : `(${fmtBRL(Math.abs(lucro))})`}</span>
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>Margem Líquida</span>
          <span className={margin >= 0 ? "text-indigo-600" : "text-red-600"}>{margin.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

// ─── Balancete ───────────────────────────────────────────────────────────────
function BalanceteReport({ transactions }) {
  const paid = transactions.filter(t => t.status === "pago");
  const pending = transactions.filter(t => t.status === "pendente");
  const overdue = transactions.filter(t => t.status === "vencido");

  const totalReceived = paid.filter(t => t.type === "receita").reduce((s, t) => s + (t.amount || 0), 0);
  const totalPaid     = paid.filter(t => t.type === "despesa").reduce((s, t) => s + (t.amount || 0), 0);
  const toReceive     = pending.filter(t => t.type === "receita").reduce((s, t) => s + (t.amount || 0), 0);
  const toPay         = pending.filter(t => t.type === "despesa").reduce((s, t) => s + (t.amount || 0), 0);
  const overdueRec    = overdue.filter(t => t.type === "receita").reduce((s, t) => s + (t.amount || 0), 0);
  const overdueDesp   = overdue.filter(t => t.type === "despesa").reduce((s, t) => s + (t.amount || 0), 0);

  const groups = [
    {
      title: "ATIVO",
      items: [
        { label: "Caixa e Equivalentes (Receitas Recebidas)", value: totalReceived, positive: true },
        { label: "Contas a Receber (Pendente)", value: toReceive, positive: true },
        { label: "Créditos Vencidos a Receber", value: overdueRec, positive: true },
      ]
    },
    {
      title: "PASSIVO",
      items: [
        { label: "Obrigações Pagas (Despesas Quitadas)", value: totalPaid, positive: false },
        { label: "Contas a Pagar (Pendente)", value: toPay, positive: false },
        { label: "Obrigações Vencidas", value: overdueDesp, positive: false },
      ]
    }
  ];

  const totalAtivo = totalReceived + toReceive + overdueRec;
  const totalPassivo = totalPaid + toPay + overdueDesp;
  const pl = totalAtivo - totalPassivo;

  return (
    <div className="bg-slate-50 rounded-xl p-5 font-mono text-sm space-y-5">
      <h3 className="font-bold text-center text-slate-900 uppercase tracking-wide text-base mb-1">
        Balancete de Verificação
      </h3>
      <div className="grid md:grid-cols-2 gap-6">
        {groups.map(group => (
          <div key={group.title}>
            <p className={`font-bold text-sm mb-3 ${group.title === "ATIVO" ? "text-emerald-700" : "text-rose-700"}`}>{group.title}</p>
            {group.items.map((item, i) => (
              <div key={i} className="flex justify-between border-b border-slate-200 py-1.5">
                <span className="text-slate-600 text-xs">{item.label}</span>
                <span className={`font-semibold text-xs ${item.positive ? "text-emerald-700" : "text-rose-700"}`}>
                  {fmtBRL(item.value)}
                </span>
              </div>
            ))}
            <div className={`flex justify-between font-bold text-sm pt-2 mt-1 ${group.title === "ATIVO" ? "text-emerald-800" : "text-rose-800"}`}>
              <span>Total {group.title}</span>
              <span>{fmtBRL(group.title === "ATIVO" ? totalAtivo : totalPassivo)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className={`flex justify-between font-bold text-base border-t-2 border-slate-400 pt-3 ${pl >= 0 ? "text-indigo-700" : "text-red-700"}`}>
        <span>PATRIMÔNIO LÍQUIDO (Ativo − Passivo)</span>
        <span>{pl >= 0 ? fmtBRL(pl) : `(${fmtBRL(Math.abs(pl))})`}</span>
      </div>
    </div>
  );
}

// ─── Fluxo de Caixa Projetado ────────────────────────────────────────────────
function FluxoProjetadoReport({ allTransactions }) {
  const today = new Date();
  const horizon = 90; // 3 months projection

  // Realized (past, paid)
  const realized = {};
  allTransactions.filter(t => t.status === "pago" && t.date).forEach(t => {
    const k = format(parseISO(t.date), "yyyy-MM");
    if (!realized[k]) realized[k] = { rec: 0, desp: 0 };
    if (t.type === "receita") realized[k].rec += t.amount || 0;
    else realized[k].desp += t.amount || 0;
  });

  // Projected (pending/overdue, future due_date)
  const projected = {};
  allTransactions.filter(t => (t.status === "pendente" || t.status === "vencido") && t.due_date).forEach(t => {
    const k = format(parseISO(t.due_date), "yyyy-MM");
    if (!projected[k]) projected[k] = { rec: 0, desp: 0 };
    if (t.type === "receita") projected[k].rec += t.amount || 0;
    else projected[k].desp += t.amount || 0;
  });

  // Build rows for next 3 months + last 3 months
  const months = [];
  for (let i = -3; i <= 3; i++) {
    const d = addMonths(today, i);
    const k = format(d, "yyyy-MM");
    months.push({
      key: k,
      label: format(d, "MMM/yyyy", { locale: ptBR }),
      isPast: i < 0,
      isNow: i === 0,
      rec: (realized[k]?.rec || 0) + (i >= 0 ? (projected[k]?.rec || 0) : 0),
      desp: (realized[k]?.desp || 0) + (i >= 0 ? (projected[k]?.desp || 0) : 0),
      projRec: i >= 0 ? (projected[k]?.rec || 0) : 0,
      projDesp: i >= 0 ? (projected[k]?.desp || 0) : 0,
    });
  }

  let accum = 0;
  const rows = months.map(m => {
    const saldo = m.rec - m.desp;
    accum += saldo;
    return { ...m, saldo, accum };
  });

  const chartData = rows.map(r => ({
    name: r.label,
    Entradas: r.rec,
    Saídas: r.desp,
    "Saldo Acum.": r.accum,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
        <ArrowDownCircle className="w-4 h-4 flex-shrink-0" />
        Meses futuros incluem pagamentos <strong>pendentes/vencidos</strong> com data de vencimento prevista.
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="pt-4">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => fmtBRL(v)} />
              <Legend />
              <Line type="monotone" dataKey="Entradas" stroke="#10b981" strokeWidth={2} dot />
              <Line type="monotone" dataKey="Saídas" stroke="#f43f5e" strokeWidth={2} dot />
              <Line type="monotone" dataKey="Saldo Acum." stroke="#6366f1" strokeWidth={2} strokeDasharray="5 5" dot />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="bg-slate-100 text-slate-700">
              <th className="text-left p-2 text-xs">Período</th>
              <th className="text-right p-2 text-xs text-emerald-700">Entradas</th>
              <th className="text-right p-2 text-xs text-rose-700">Saídas</th>
              <th className="text-right p-2 text-xs text-indigo-700">Saldo Mensal</th>
              <th className="text-right p-2 text-xs text-slate-700">Acumulado</th>
              <th className="text-right p-2 text-xs text-amber-600">Projetado Rec.</th>
              <th className="text-right p-2 text-xs text-orange-600">Projetado Desp.</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.key} className={`border-b border-slate-100 ${r.isNow ? "bg-indigo-50 font-bold" : "hover:bg-slate-50"}`}>
                <td className="p-2">
                  {r.label}
                  {r.isNow && <Badge className="ml-1 text-[10px] bg-indigo-100 text-indigo-700 border-indigo-200">Atual</Badge>}
                  {r.isPast && <span className="ml-1 text-[10px] text-slate-400">✓</span>}
                </td>
                <td className="text-right p-2 text-emerald-600">{fmtBRL(r.rec)}</td>
                <td className="text-right p-2 text-rose-600">({fmtBRL(r.desp)})</td>
                <td className={`text-right p-2 font-semibold ${r.saldo >= 0 ? "text-indigo-600" : "text-red-600"}`}>{fmtBRL(r.saldo)}</td>
                <td className={`text-right p-2 font-bold ${r.accum >= 0 ? "text-slate-800" : "text-red-700"}`}>{fmtBRL(r.accum)}</td>
                <td className="text-right p-2 text-amber-600 text-xs">{r.projRec > 0 ? fmtBRL(r.projRec) : "—"}</td>
                <td className="text-right p-2 text-orange-600 text-xs">{r.projDesp > 0 ? fmtBRL(r.projDesp) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Performance por Paciente ────────────────────────────────────────────────
function PatientReport({ transactions }) {
  const byPatient = {};
  transactions
    .filter(t => t.type === "receita" && t.status !== "cancelado" && t.patient_name)
    .forEach(t => {
      const k = t.patient_name;
      if (!byPatient[k]) byPatient[k] = { name: k, total: 0, paid: 0, pending: 0, count: 0 };
      byPatient[k].count++;
      byPatient[k].total += t.amount || 0;
      if (t.status === "pago") byPatient[k].paid += t.amount || 0;
      else byPatient[k].pending += t.amount || 0;
    });

  const rows = Object.values(byPatient).sort((a, b) => b.total - a.total);
  const grandTotal = rows.reduce((s, r) => s + r.total, 0);

  const chartData = rows.slice(0, 10).map(r => ({ name: r.name.split(" ")[0], Total: r.total, Recebido: r.paid }));

  return (
    <div className="space-y-5">
      {chartData.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Top 10 Pacientes por Receita</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={70} />
                <Tooltip formatter={v => fmtBRL(v)} />
                <Legend />
                <Bar dataKey="Total" fill="#6366f1" radius={[0,4,4,0]} />
                <Bar dataKey="Recebido" fill="#10b981" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100 text-slate-700 text-xs uppercase">
              <th className="text-left p-2">#</th>
              <th className="text-left p-2">Paciente</th>
              <th className="text-right p-2">Procedimentos</th>
              <th className="text-right p-2 text-indigo-700">Total Faturado</th>
              <th className="text-right p-2 text-emerald-700">Recebido</th>
              <th className="text-right p-2 text-amber-700">Pendente</th>
              <th className="text-right p-2">% do Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.name} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-2 text-slate-400 font-mono text-xs">{i + 1}</td>
                <td className="p-2 font-medium text-slate-800">{r.name}</td>
                <td className="text-right p-2 text-slate-500">{r.count}</td>
                <td className="text-right p-2 font-semibold text-indigo-700">{fmtBRL(r.total)}</td>
                <td className="text-right p-2 text-emerald-700">{fmtBRL(r.paid)}</td>
                <td className="text-right p-2 text-amber-600">{r.pending > 0 ? fmtBRL(r.pending) : "—"}</td>
                <td className="text-right p-2 text-slate-500">
                  {grandTotal > 0 ? `${((r.total / grandTotal) * 100).toFixed(1)}%` : "—"}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="text-center text-slate-400 py-8 text-sm">Nenhuma receita por paciente no período</td></tr>
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="bg-slate-50 font-bold text-sm">
                <td colSpan={3} className="p-2 text-slate-700">TOTAL</td>
                <td className="text-right p-2 text-indigo-700">{fmtBRL(grandTotal)}</td>
                <td className="text-right p-2 text-emerald-700">{fmtBRL(rows.reduce((s,r)=>s+r.paid,0))}</td>
                <td className="text-right p-2 text-amber-600">{fmtBRL(rows.reduce((s,r)=>s+r.pending,0))}</td>
                <td className="text-right p-2">100%</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

// ─── Centro de Custo ─────────────────────────────────────────────────────────
function CentroCustoReport({ transactions }) {
  const byCategory = {};
  transactions.filter(t => t.status !== "cancelado").forEach(t => {
    const cat = t.category || "outros";
    if (!byCategory[cat]) byCategory[cat] = { cat, rec: 0, desp: 0, recCount: 0, despCount: 0 };
    if (t.type === "receita") { byCategory[cat].rec += t.amount || 0; byCategory[cat].recCount++; }
    else { byCategory[cat].desp += t.amount || 0; byCategory[cat].despCount++; }
  });

  const rows = Object.values(byCategory).sort((a, b) => (b.rec + b.desp) - (a.rec + a.desp));
  const totalRec = rows.reduce((s, r) => s + r.rec, 0);
  const totalDesp = rows.reduce((s, r) => s + r.desp, 0);

  const chartData = rows.map(r => ({
    name: r.cat.replace(/_/g, " "),
    Receitas: r.rec,
    Despesas: r.desp,
    Saldo: r.rec - r.desp,
  }));

  return (
    <div className="space-y-5">
      {chartData.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Receitas × Despesas por Centro de Custo</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => fmtBRL(v)} />
                <Legend />
                <Bar dataKey="Receitas" fill="#10b981" radius={[4,4,0,0]} />
                <Bar dataKey="Despesas" fill="#f43f5e" radius={[4,4,0,0]} />
                <Bar dataKey="Saldo" fill="#6366f1" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100 text-slate-700 text-xs uppercase">
              <th className="text-left p-2">Centro de Custo / Categoria</th>
              <th className="text-right p-2 text-emerald-700">Receitas</th>
              <th className="text-right p-2 text-rose-700">Despesas</th>
              <th className="text-right p-2 text-indigo-700">Saldo</th>
              <th className="text-right p-2">% Receita</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const saldo = r.rec - r.desp;
              return (
                <tr key={r.cat} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-2 capitalize font-medium text-slate-800">{r.cat.replace(/_/g, " ")}</td>
                  <td className="text-right p-2 text-emerald-700">{r.rec > 0 ? fmtBRL(r.rec) : "—"}</td>
                  <td className="text-right p-2 text-rose-700">{r.desp > 0 ? fmtBRL(r.desp) : "—"}</td>
                  <td className={`text-right p-2 font-semibold ${saldo >= 0 ? "text-indigo-700" : "text-red-600"}`}>{fmtBRL(saldo)}</td>
                  <td className="text-right p-2 text-slate-500">
                    {totalRec > 0 && r.rec > 0 ? `${((r.rec / totalRec) * 100).toFixed(1)}%` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 font-bold text-sm">
              <td className="p-2 text-slate-700">TOTAL</td>
              <td className="text-right p-2 text-emerald-700">{fmtBRL(totalRec)}</td>
              <td className="text-right p-2 text-rose-700">{fmtBRL(totalDesp)}</td>
              <td className={`text-right p-2 ${totalRec - totalDesp >= 0 ? "text-indigo-700" : "text-red-700"}`}>{fmtBRL(totalRec - totalDesp)}</td>
              <td className="text-right p-2">100%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ReportBuilder({ transactions }) {
  const today = new Date();
  const [filters, setFilters] = useState({
    startDate: format(new Date(today.getFullYear(), today.getMonth(), 1), "yyyy-MM-dd"),
    endDate: format(today, "yyyy-MM-dd"),
    type: "all",
    category: "all",
    status: "all",
  });

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (!t.date) return false;
      const d = parseISO(t.date);
      const inRange = isWithinInterval(d, { start: parseISO(filters.startDate), end: parseISO(filters.endDate) });
      const matchType = filters.type === "all" || t.type === filters.type;
      const matchCat = filters.category === "all" || t.category === filters.category;
      const matchStatus = filters.status === "all" || t.status === filters.status;
      return inRange && matchType && matchCat && matchStatus;
    });
  }, [transactions, filters]);

  const period = `${format(parseISO(filters.startDate), "dd/MM/yyyy")} a ${format(parseISO(filters.endDate), "dd/MM/yyyy")}`;

  const exportCSV = (type) => {
    const data = type === "fluxo" ? transactions : filtered;
    const headers = ["Data", "Vencimento", "Tipo", "Categoria", "Descrição", "Valor", "Status", "Método", "Paciente", "Fornecedor"];
    const rows = data.map(t => [
      t.date, t.due_date || "", t.type, t.category, t.description,
      t.amount, t.status, t.payment_method, t.patient_name || "", t.supplier || ""
    ]);
    const csv = [headers, ...rows].map(r => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `relatorio_${type}_${filters.startDate}_${filters.endDate}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado!");
  };

  const exportPDF = (title) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) { toast.error("Permita pop-ups para exportar PDF"); return; }
    const content = document.getElementById("report-content");
    printWindow.document.write(`
      <html><head><title>${title} - Prime Odontologia</title>
      <style>
        body { font-family: 'Courier New', monospace; font-size: 12px; padding: 20px; color: #1e293b; }
        h1 { text-align: center; font-size: 16px; text-transform: uppercase; margin-bottom: 4px; }
        .subtitle { text-align: center; color: #64748b; font-size: 11px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th { background: #f1f5f9; padding: 6px; text-align: left; font-size: 11px; }
        td { padding: 5px 6px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
        .text-right { text-align: right; }
        .green { color: #059669; } .red { color: #dc2626; } .blue { color: #4f46e5; }
        @media print { body { padding: 0; } }
      </style></head>
      <body>
        <h1>${title}</h1>
        <div class="subtitle">Prime Odontologia · ${period} · Gerado em ${format(new Date(), "dd/MM/yyyy HH:mm")}</div>
        ${content ? content.innerHTML : ""}
      </body></html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 400);
  };

  return (
    <div className="space-y-5">
      <Tabs defaultValue="dre">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <TabsList className="flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="dre" className="gap-1.5 text-xs">
              <TrendingUp className="w-3.5 h-3.5" /> DRE
            </TabsTrigger>
            <TabsTrigger value="balancete" className="gap-1.5 text-xs">
              <Scale className="w-3.5 h-3.5" /> Balancete
            </TabsTrigger>
            <TabsTrigger value="fluxo" className="gap-1.5 text-xs">
              <BarChart3 className="w-3.5 h-3.5" /> Fluxo Projetado
            </TabsTrigger>
            <TabsTrigger value="pacientes" className="gap-1.5 text-xs">
              <Users className="w-3.5 h-3.5" /> Por Paciente
            </TabsTrigger>
            <TabsTrigger value="centros" className="gap-1.5 text-xs">
              <DollarSign className="w-3.5 h-3.5" /> Centro de Custo
            </TabsTrigger>
          </TabsList>
        </div>

        {/* DRE */}
        <TabsContent value="dre" className="space-y-4">
          <FiltersBar
            filters={filters} onChange={setFilters} count={filtered.length}
            onExportCSV={() => exportCSV("dre")}
            onExportPDF={() => exportPDF("DRE – Demonstração do Resultado do Exercício")}
          />
          <div id="report-content">
            <DREReport transactions={filtered} period={period} />
          </div>
        </TabsContent>

        {/* Balancete */}
        <TabsContent value="balancete" className="space-y-4">
          <FiltersBar
            filters={filters} onChange={setFilters} count={filtered.length}
            onExportCSV={() => exportCSV("balancete")}
            onExportPDF={() => exportPDF("Balancete de Verificação")}
          />
          <div id="report-content">
            <BalanceteReport transactions={filtered} />
          </div>
        </TabsContent>

        {/* Fluxo Projetado */}
        <TabsContent value="fluxo" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-3 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => exportCSV("fluxo")} className="gap-1.5">
                <Download className="w-3.5 h-3.5" /> CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportPDF("Fluxo de Caixa Projetado")} className="gap-1.5">
                <Printer className="w-3.5 h-3.5" /> PDF
              </Button>
            </CardContent>
          </Card>
          <div id="report-content">
            <FluxoProjetadoReport allTransactions={transactions} />
          </div>
        </TabsContent>

        {/* Por Paciente */}
        <TabsContent value="pacientes" className="space-y-4">
          <FiltersBar
            filters={filters} onChange={setFilters} count={filtered.length}
            onExportCSV={() => exportCSV("pacientes")}
            onExportPDF={() => exportPDF("Relatório de Performance por Paciente")}
          />
          <div id="report-content">
            <PatientReport transactions={filtered} />
          </div>
        </TabsContent>

        {/* Centro de Custo */}
        <TabsContent value="centros" className="space-y-4">
          <FiltersBar
            filters={filters} onChange={setFilters} count={filtered.length}
            onExportCSV={() => exportCSV("centros")}
            onExportPDF={() => exportPDF("Relatório por Centro de Custo")}
          />
          <div id="report-content">
            <CentroCustoReport transactions={filtered} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
