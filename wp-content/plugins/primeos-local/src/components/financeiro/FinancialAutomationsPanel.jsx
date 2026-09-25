// @ts-nocheck
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { primeos } from "@/api/primeosClient";
import {
  Bell, RefreshCw, CheckCircle2, AlertTriangle, TrendingDown,
  TrendingUp, Repeat, Mail, Zap, Play
} from "lucide-react";
import { parseISO, differenceInDays, isPast, isToday, addDays } from "date-fns";
import { toast } from "sonner";

const fmtBRL = (v) => `R$ ${(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

export default function FinancialAutomationsPanel({ transactions }) {
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in7 = addDays(today, 7);
  const in30 = addDays(today, 30);

  // ── Resumo de contas a pagar ──────────────────────────────────
  const contasPagarAlerta = useMemo(() => transactions.filter(t => {
    if (t.type !== "despesa" || t.status === "pago" || t.status === "cancelado" || !t.due_date) return false;
    const due = parseISO(t.due_date);
    return due <= in7;
  }).sort((a, b) => parseISO(a.due_date) - parseISO(b.due_date)), [transactions]);

  // ── Resumo de contas a receber ────────────────────────────────
  const contasReceberAlerta = useMemo(() => transactions.filter(t => {
    if (t.type !== "receita" || t.status === "pago" || t.status === "cancelado" || !t.due_date) return false;
    const due = parseISO(t.due_date);
    return due <= in7;
  }).sort((a, b) => parseISO(a.due_date) - parseISO(b.due_date)), [transactions]);

  // ── Transações recorrentes ─────────────────────────────────────
  const recorrentes = useMemo(() => transactions.filter(t => t.is_recurring && t.status === "pago"), [transactions]);

  // ── Projeção de saldo 30 dias ─────────────────────────────────
  const { receitasPrev, despesasPrev, saldoProj } = useMemo(() => {
    const receitasPrev = transactions
      .filter(t => t.type === "receita" && !["cancelado","pago"].includes(t.status) && t.due_date)
      .filter(t => { const d = parseISO(t.due_date); return d >= today && d <= in30; })
      .reduce((s, t) => s + (t.amount || 0), 0);
    const despesasPrev = transactions
      .filter(t => t.type === "despesa" && !["cancelado","pago"].includes(t.status) && t.due_date)
      .filter(t => { const d = parseISO(t.due_date); return d >= today && d <= in30; })
      .reduce((s, t) => s + (t.amount || 0), 0);
    return { receitasPrev, despesasPrev, saldoProj: receitasPrev - despesasPrev };
  }, [transactions]);

  const runAutomation = async (preview = false) => {
    setRunning(true);
    try {
      const res = await primeos.functions.invoke("financialAutomations", preview ? { mode: "preview" } : {});
      setLastResult(res.data);
      if (!preview) toast.success("Automações executadas com sucesso!");
      else toast.success("Preview concluído — nenhum email enviado");
    } catch (e) {
      toast.error("Erro ao executar automações: " + e.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-600" />Automações Financeiras
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Executadas automaticamente todos os dias às 7h. Execute manualmente se necessário.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => runAutomation(true)} disabled={running} className="gap-1.5 text-xs">
            <Play className="w-3.5 h-3.5" />Preview
          </Button>
          <Button size="sm" onClick={() => runAutomation(false)} disabled={running} className="bg-indigo-600 hover:bg-indigo-700 gap-1.5 text-xs">
            {running ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            Executar Agora
          </Button>
        </div>
      </div>

      {/* Resultado da última execução */}
      {lastResult && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Resultado da Execução</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Lembretes A Pagar", value: lastResult.reminders_pagar, color: "text-rose-700" },
              { label: "Lembretes A Receber", value: lastResult.reminders_receber, color: "text-emerald-700" },
              { label: "Recorrentes Criadas", value: lastResult.recorrentes_criadas, color: "text-indigo-700" },
              { label: "Alerta Baixo Saldo", value: lastResult.baixo_saldo_alerta ? "Sim" : "Não", color: lastResult.baixo_saldo_alerta ? "text-red-700" : "text-slate-500" },
            ].map((r, i) => (
              <div key={i} className="bg-white rounded-lg border border-slate-100 p-3">
                <p className="text-xs text-slate-400">{r.label}</p>
                <p className={`text-xl font-bold ${r.color}`}>{r.value}</p>
              </div>
            ))}
          </div>
          {lastResult.errors?.length > 0 && (
            <div className="bg-red-50 rounded-lg p-3 text-xs text-red-600">
              <strong>Erros:</strong> {lastResult.errors.join(" · ")}
            </div>
          )}
        </div>
      )}

      {/* Grid de painéis */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* ── Alertas A Pagar ── */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-rose-700">
              <TrendingDown className="w-4 h-4" />A Pagar — Próximos 7 dias
              <Badge className="bg-rose-100 text-rose-700 border-0 ml-auto">{contasPagarAlerta.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {contasPagarAlerta.length === 0 && (
              <div className="flex items-center gap-2 text-emerald-600 py-3 text-sm">
                <CheckCircle2 className="w-4 h-4" />Nenhuma conta a pagar nos próximos 7 dias
              </div>
            )}
            {contasPagarAlerta.slice(0, 6).map(t => {
              const due = parseISO(t.due_date);
              const days = differenceInDays(due, today);
              const isOver = isPast(due) && !isToday(due);
              return (
                <div key={t.id} className={`flex items-center justify-between p-2.5 rounded-lg text-sm ${isOver ? "bg-red-50" : days <= 3 ? "bg-amber-50" : "bg-slate-50"}`}>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate text-xs">{t.description}</p>
                    <p className="text-xs text-slate-400">{t.supplier || t.category}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                    <span className={`text-xs font-semibold ${isOver ? "text-red-600" : days <= 3 ? "text-amber-600" : "text-slate-500"}`}>
                      {isOver ? `Venceu ${Math.abs(days)}d atrás` : isToday(due) ? "Hoje" : `em ${days}d`}
                    </span>
                    <span className="font-bold text-rose-600 text-xs">{fmtBRL(t.amount)}</span>
                  </div>
                </div>
              );
            })}
            {contasPagarAlerta.length > 6 && (
              <p className="text-xs text-slate-400 text-center pt-1">+{contasPagarAlerta.length - 6} mais</p>
            )}
          </CardContent>
        </Card>

        {/* ── Alertas A Receber ── */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-700">
              <Bell className="w-4 h-4" />A Receber — Próximos 7 dias
              <Badge className="bg-amber-100 text-amber-700 border-0 ml-auto">{contasReceberAlerta.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {contasReceberAlerta.length === 0 && (
              <div className="flex items-center gap-2 text-emerald-600 py-3 text-sm">
                <CheckCircle2 className="w-4 h-4" />Nenhuma cobrança pendente nos próximos 7 dias
              </div>
            )}
            {contasReceberAlerta.slice(0, 6).map(t => {
              const due = parseISO(t.due_date);
              const days = differenceInDays(due, today);
              const isOver = isPast(due) && !isToday(due);
              return (
                <div key={t.id} className={`flex items-center justify-between p-2.5 rounded-lg text-sm ${isOver ? "bg-red-50" : days <= 3 ? "bg-amber-50" : "bg-slate-50"}`}>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate text-xs">{t.description}</p>
                    <p className="text-xs text-slate-400">{t.patient_name || "-"} {t.patient_email ? <Mail className="inline w-3 h-3" /> : "⚠️ sem email"}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                    <span className={`text-xs font-semibold ${isOver ? "text-red-600" : days <= 3 ? "text-amber-600" : "text-slate-500"}`}>
                      {isOver ? `Venceu ${Math.abs(days)}d atrás` : isToday(due) ? "Hoje" : `em ${days}d`}
                    </span>
                    <span className="font-bold text-emerald-600 text-xs">{fmtBRL(t.amount)}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* ── Projeção de Saldo 30 dias ── */}
        <Card className={`border-0 shadow-sm ${saldoProj < 0 ? "ring-2 ring-red-400" : ""}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />Projeção de Saldo — 30 dias
              {saldoProj < 0 && <Badge className="bg-red-100 text-red-700 border-0 ml-auto text-xs">⚠️ Saldo Negativo</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className={`rounded-xl p-4 ${saldoProj < 0 ? "bg-red-50 border border-red-200" : "bg-emerald-50 border border-emerald-100"}`}>
              <p className={`text-3xl font-bold ${saldoProj < 0 ? "text-red-700" : "text-emerald-700"}`}>
                {fmtBRL(saldoProj)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Saldo líquido projetado</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 rounded-lg p-3">
                <p className="text-xs text-slate-500">Receitas previstas</p>
                <p className="font-bold text-emerald-700 text-sm">{fmtBRL(receitasPrev)}</p>
              </div>
              <div className="bg-rose-50 rounded-lg p-3">
                <p className="text-xs text-slate-500">Despesas previstas</p>
                <p className="font-bold text-rose-700 text-sm">{fmtBRL(despesasPrev)}</p>
              </div>
            </div>
            {saldoProj < 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Atenção: as despesas previstas superam as receitas em {fmtBRL(Math.abs(saldoProj))}. Revise seus compromissos financeiros.</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Transações Recorrentes ── */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-indigo-700">
              <Repeat className="w-4 h-4" />Transações Recorrentes
              <Badge className="bg-indigo-100 text-indigo-700 border-0 ml-auto">{recorrentes.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recorrentes.length === 0 && (
              <p className="text-sm text-slate-400 py-4 text-center">Nenhuma transação recorrente cadastrada.<br /><span className="text-xs">Marque uma transação como recorrente ao criá-la.</span></p>
            )}
            {recorrentes.slice(0, 6).map(t => (
              <div key={t.id} className="flex items-center justify-between p-2.5 bg-indigo-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-xs truncate">{t.description}</p>
                  <p className="text-xs text-slate-400 capitalize">{t.recurrence_period} · {t.supplier || t.patient_name || t.category}</p>
                </div>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  <Badge variant="outline" className="text-xs text-indigo-600 border-indigo-200 capitalize">{t.recurrence_period}</Badge>
                  <span className={`font-bold text-xs ${t.type === "receita" ? "text-emerald-600" : "text-rose-600"}`}>{fmtBRL(t.amount)}</span>
                </div>
              </div>
            ))}
            {recorrentes.length > 6 && (
              <p className="text-xs text-slate-400 text-center pt-1">+{recorrentes.length - 6} mais recorrentes</p>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
