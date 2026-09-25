// @ts-nocheck
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle, AlertCircle, Search, RefreshCw, TrendingUp, TrendingDown, Scale
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function ConciliacaoBancaria() {
  const queryClient = useQueryClient();
  const [saldoBancario, setSaldoBancario] = useState("");
  const [saldoSistema, setSaldoSistema] = useState(null);
  const [conciliando, setConciliando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [search, setSearch] = useState("");

  const { data: transactions = [] } = useQuery({
    queryKey: ["financialTransactions"],
    queryFn: () => primeos.entities.FinancialTransaction.list("-date"),
  });

  const reconcileMutation = useMutation({
    mutationFn: ({ id, ref }) => primeos.entities.FinancialTransaction.update(id, { bank_statement_ref: ref }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["financialTransactions"] })
  });

  // Calcular saldo do sistema
  const calcularSaldoSistema = () => {
    const pagas = transactions.filter(t => t.status === "pago");
    const receitas = pagas.filter(t => t.type === "receita").reduce((s, t) => s + (t.amount || 0), 0);
    const despesas = pagas.filter(t => t.type === "despesa").reduce((s, t) => s + (t.amount || 0), 0);
    const saldo = receitas - despesas;
    setSaldoSistema(saldo);
    return saldo;
  };

  const conciliar = () => {
    setConciliando(true);
    const saldoSis = calcularSaldoSistema();
    const saldoBanc = parseFloat(saldoBancario.replace(",", "."));
    const diferenca = saldoBanc - saldoSis;
    setTimeout(() => {
      setResultado({ saldoSistema: saldoSis, saldoBancario: saldoBanc, diferenca });
      setConciliando(false);
      if (Math.abs(diferenca) < 0.01) {
        toast.success("Conciliação perfeita! Saldos batem.");
      } else {
        toast.warning(`Diferença de R$ ${Math.abs(diferenca).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} encontrada.`);
      }
    }, 800);
  };

  const naoConciliadas = useMemo(() =>
    transactions.filter(t => t.status === "pago" && !t.bank_statement_ref),
    [transactions]
  );

  const conciliadas = useMemo(() =>
    transactions.filter(t => t.status === "pago" && t.bank_statement_ref),
    [transactions]
  );

  const filtered = useMemo(() =>
    naoConciliadas.filter(t =>
      !search || t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.supplier?.toLowerCase().includes(search.toLowerCase())
    ),
    [naoConciliadas, search]
  );

  const [refInputs, setRefInputs] = useState({});

  const marcarConciliada = (id) => {
    const ref = refInputs[id]?.trim() || `REF-${id.slice(-6).toUpperCase()}`;
    reconcileMutation.mutate({ id, ref });
    toast.success("Transação marcada como conciliada!");
  };

  return (
    <div className="space-y-6">
      {/* Conciliação Header */}
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-600" /> Conciliação Bancária
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-500">
            Informe o saldo atual do seu extrato bancário para verificar se bate com o sistema.
          </p>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1.5">
              <Label className="text-sm">Saldo no Banco (R$)</Label>
              <Input
                type="text"
                placeholder="0,00"
                value={saldoBancario}
                onChange={e => setSaldoBancario(e.target.value)}
                className="w-44"
              />
            </div>
            <Button onClick={conciliar} disabled={!saldoBancario || conciliando}
              className="bg-indigo-600 hover:bg-indigo-700 gap-2">
              {conciliando ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Scale className="w-4 h-4" />}
              Conciliar
            </Button>
          </div>

          {resultado && (
            <div className={`p-4 rounded-xl border ${Math.abs(resultado.diferenca) < 0.01
              ? "bg-emerald-50 border-emerald-200"
              : "bg-amber-50 border-amber-200"}`}>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Saldo no Sistema</p>
                  <p className={`text-lg font-bold ${resultado.saldoSistema >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                    R$ {resultado.saldoSistema.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Saldo Bancário</p>
                  <p className="text-lg font-bold text-indigo-700">
                    R$ {resultado.saldoBancario.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Diferença</p>
                  <p className={`text-lg font-bold ${Math.abs(resultado.diferenca) < 0.01 ? "text-emerald-700" : "text-red-700"}`}>
                    {Math.abs(resultado.diferenca) < 0.01 ? "✓ OK" : `R$ ${Math.abs(resultado.diferenca).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                  </p>
                </div>
              </div>
              {Math.abs(resultado.diferenca) >= 0.01 && (
                <p className="text-sm text-amber-700 text-center mt-3">
                  ⚠️ Existe uma diferença. Verifique se há lançamentos faltando ou pagamentos não registrados.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border border-amber-100 bg-amber-50 shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-amber-500" />
            <div>
              <p className="text-xs text-slate-500">Não Conciliadas</p>
              <p className="text-xl font-bold text-amber-700">{naoConciliadas.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-emerald-100 bg-emerald-50 shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
            <div>
              <p className="text-xs text-slate-500">Conciliadas</p>
              <p className="text-xl font-bold text-emerald-700">{conciliadas.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending reconciliation */}
      <Card className="border border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Transações Não Conciliadas ({naoConciliadas.length})
            </CardTitle>
            <div className="relative w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input className="pl-8 h-8 text-xs" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filtered.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">
                {naoConciliadas.length === 0 ? "✓ Todas as transações estão conciliadas!" : "Nenhuma transação encontrada."}
              </div>
            )}
            {filtered.map(t => (
              <div key={t.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${t.type === "receita" ? "bg-emerald-100" : "bg-rose-100"}`}>
                  {t.type === "receita"
                    ? <TrendingUp className="w-4 h-4 text-emerald-600" />
                    : <TrendingDown className="w-4 h-4 text-rose-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{t.description}</p>
                  <p className="text-xs text-slate-400">
                    {t.date ? format(parseISO(t.date), "dd/MM/yyyy", { locale: ptBR }) : "—"}
                    {t.patient_name && ` · ${t.patient_name}`}
                    {t.supplier && ` · ${t.supplier}`}
                  </p>
                </div>
                <p className={`font-bold text-sm flex-shrink-0 ${t.type === "receita" ? "text-emerald-600" : "text-rose-600"}`}>
                  {t.type === "receita" ? "+" : "-"} R$ {(t.amount || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Input
                    placeholder="Ref. extrato"
                    value={refInputs[t.id] || ""}
                    onChange={e => setRefInputs(prev => ({ ...prev, [t.id]: e.target.value }))}
                    className="h-7 text-xs w-28"
                  />
                  <Button size="sm" variant="outline" onClick={() => marcarConciliada(t.id)}
                    className="h-7 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50 gap-1">
                    <CheckCircle className="w-3 h-3" /> OK
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reconciled list (collapsed) */}
      {conciliadas.length > 0 && (
        <Card className="border border-emerald-100">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-emerald-700">
              <CheckCircle className="w-4 h-4" /> {conciliadas.length} Transações Conciliadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {conciliadas.slice(0, 20).map(t => (
                <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <p className="text-sm text-slate-600 flex-1 truncate">{t.description}</p>
                  <Badge variant="outline" className="text-xs font-mono">{t.bank_statement_ref}</Badge>
                  <p className={`text-xs font-semibold ${t.type === "receita" ? "text-emerald-600" : "text-rose-600"}`}>
                    R$ {(t.amount || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
