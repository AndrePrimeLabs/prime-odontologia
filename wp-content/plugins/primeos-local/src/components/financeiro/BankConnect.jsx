// @ts-nocheck
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, Link, CheckCircle, RefreshCw, 
  ShieldCheck, Info, Upload, Loader2, Banknote
} from "lucide-react";
import { toast } from "sonner";
import { primeos } from "@/api/primeosClient";
import { format } from "date-fns";

const MOCK_BANKS = [
  { id: "itau", name: "Itaú", logo: "🏦", color: "bg-orange-500" },
  { id: "bradesco", name: "Bradesco", logo: "🏛", color: "bg-red-500" },
  { id: "bb", name: "Banco do Brasil", logo: "🟡", color: "bg-yellow-600" },
  { id: "nubank", name: "Nubank", logo: "💜", color: "bg-purple-600" },
  { id: "santander", name: "Santander", logo: "🔴", color: "bg-red-700" },
  { id: "inter", name: "Banco Inter", logo: "🟠", color: "bg-orange-600" },
];

const MOCK_TRANSACTIONS = [
  { date: format(new Date(), "yyyy-MM-dd"), description: "PIX RECEBIDO - MARIA SILVA", amount: 350.00, type: "receita" },
  { date: format(new Date(), "yyyy-MM-dd"), description: "FORNECEDOR DENTAL LTDA", amount: 1200.00, type: "despesa" },
  { date: format(new Date(Date.now() - 86400000), "yyyy-MM-dd"), description: "PIX RECEBIDO - JOÃO SANTOS", amount: 480.00, type: "receita" },
  { date: format(new Date(Date.now() - 86400000), "yyyy-MM-dd"), description: "ALUGUEL CLINICA", amount: 3500.00, type: "despesa" },
  { date: format(new Date(Date.now() - 172800000), "yyyy-MM-dd"), description: "PAGTO FUNCIONARIO", amount: 2200.00, type: "despesa" },
];

export default function BankConnect({ onImported }) {
  const [connectedBank, setConnectedBank] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [previewTransactions, setPreviewTransactions] = useState([]);
  const [selectedToImport, setSelectedToImport] = useState([]);
  const [step, setStep] = useState("select"); // select | preview | done

  const handleConnect = async (bank) => {
    setConnecting(true);
    await new Promise(r => setTimeout(r, 1500));
    setConnectedBank(bank);
    setConnecting(false);
    toast.success(`${bank.name} conectado com sucesso!`);
  };

  const handleSync = async () => {
    setSyncing(true);
    await new Promise(r => setTimeout(r, 1200));
    setPreviewTransactions(MOCK_TRANSACTIONS);
    setSelectedToImport(MOCK_TRANSACTIONS.map((_, i) => i));
    setSyncing(false);
    setStep("preview");
  };

  const handleImport = async () => {
    setSyncing(true);
    const toImport = previewTransactions.filter((_, i) => selectedToImport.includes(i));
    for (const tx of toImport) {
      await primeos.entities.FinancialTransaction.create({
        type: tx.type,
        category: tx.type === "receita" ? "consulta" : "outros_despesa",
        description: tx.description,
        amount: tx.amount,
        date: tx.date,
        status: "pago",
        payment_method: "pix",
        bank_statement_ref: `BANK_IMPORT_${Date.now()}`,
      });
    }
    setSyncing(false);
    setStep("done");
    onImported?.();
    toast.success(`${toImport.length} transações importadas!`);
  };

  const toggleSelect = (i) => {
    setSelectedToImport(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  return (
    <div className="space-y-5">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-blue-900">Integração Bancária — Open Finance</p>
          <p className="text-xs text-blue-700 mt-1">
            Esta funcionalidade utiliza o protocolo Open Finance do Banco Central do Brasil. 
            Em produção, conecte-se via <strong>Plaid</strong>, <strong>Belvo</strong> ou <strong>Pluggy</strong> para sincronização automática real.
            Abaixo é uma demonstração do fluxo.
          </p>
        </div>
      </div>

      {step === "select" && (
        <>
          {/* Security badge */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Conexão segura via Open Finance — dados criptografados e nunca armazenados</span>
          </div>

          {/* Connected bank */}
          {connectedBank ? (
            <Card className="border-2 border-emerald-400 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${connectedBank.color} flex items-center justify-center text-white text-lg`}>
                      {connectedBank.logo}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{connectedBank.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-xs text-emerald-600">Conectado</span>
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleSync} disabled={syncing} className="bg-emerald-600 hover:bg-emerald-700">
                    {syncing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sincronizando...</> : <><RefreshCw className="w-4 h-4 mr-2" />Sincronizar Extrato</>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  Selecione seu Banco
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {MOCK_BANKS.map(bank => (
                    <button
                      key={bank.id}
                      onClick={() => handleConnect(bank)}
                      disabled={connecting}
                      className="p-4 rounded-xl border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all flex items-center gap-3"
                    >
                      <div className={`w-9 h-9 rounded-lg ${bank.color} flex items-center justify-center text-white text-base`}>
                        {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : bank.logo}
                      </div>
                      <span className="font-medium text-sm text-slate-700">{bank.name}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-4 text-center">
                  Não encontrou seu banco? A integração via <Link className="inline w-3 h-3" /> Pluggy/Belvo suporta mais de 200 instituições.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {step === "preview" && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Banknote className="w-5 h-5 text-indigo-600" />
              Transações Encontradas ({previewTransactions.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedToImport(previewTransactions.map((_, i) => i))}>Selecionar Todos</Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedToImport([])}>Limpar</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {previewTransactions.map((tx, i) => (
              <div
                key={i}
                onClick={() => toggleSelect(i)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedToImport.includes(i) ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-slate-300"}`}
              >
                <div className={`w-2 h-2 rounded-full ${tx.type === "receita" ? "bg-emerald-500" : "bg-rose-500"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{tx.description}</p>
                  <p className="text-xs text-slate-400">{tx.date}</p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm ${tx.type === "receita" ? "text-emerald-600" : "text-rose-600"}`}>
                    {tx.type === "receita" ? "+" : "-"} R$ {tx.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <Badge className={tx.type === "receita" ? "bg-emerald-100 text-emerald-700 text-xs" : "bg-rose-100 text-rose-700 text-xs"}>
                    {tx.type}
                  </Badge>
                </div>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${selectedToImport.includes(i) ? "bg-indigo-600 border-indigo-600" : "border-slate-300"}`}>
                  {selectedToImport.includes(i) && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep("select")} className="flex-1">Voltar</Button>
              <Button
                onClick={handleImport}
                disabled={selectedToImport.length === 0 || syncing}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                {syncing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Importando...</> : <><Upload className="w-4 h-4 mr-2" />Importar {selectedToImport.length} transações</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "done" && (
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-10 pb-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Importação Concluída!</h3>
            <p className="text-slate-500 text-sm">As transações foram adicionadas ao módulo financeiro.</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => { setStep("select"); setConnectedBank(null); setPreviewTransactions([]); }}>
                Conectar outro banco
              </Button>
              <Button onClick={handleSync} className="bg-indigo-600 hover:bg-indigo-700">
                <RefreshCw className="w-4 h-4 mr-2" />Sincronizar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
