// @ts-nocheck
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText, Copy, ExternalLink, CheckCircle, Loader2,
  Bell, CreditCard, AlertTriangle
} from "lucide-react";
import { primeos } from "@/api/primeosClient";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const PAYMENT_METHODS = [
  { value: "boleto", label: "Boleto" },
  { value: "pix", label: "PIX" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "cartao_credito", label: "Cartão de Crédito" },
  { value: "cartao_debito", label: "Cartão de Débito" },
  { value: "transferencia", label: "Transferência" },
  { value: "outro", label: "Outro" },
];

export default function CobrancaModal({ transaction, open, onClose, onUpdated }) {
  const [tab, setTab] = useState("cobranca"); // cobranca | baixa
  const [loading, setLoading] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [baixaData, setBaixaData] = useState({
    payment_method: transaction?.payment_method || "pix",
    payment_date: new Date().toISOString().split("T")[0],
    notes: ""
  });

  if (!transaction) return null;

  const hasBoleto = transaction.boleto_status === "gerado" || transaction.boleto_status === "pago";
  const isPago = transaction.status === "pago";

  const handleGerarCobranca = async () => {
    setLoading(true);
    try {
      const res = await primeos.functions.invoke("gerarCobranca", { transaction_id: transaction.id });
      if (res.data?.error) throw new Error(res.data.error);
      toast.success("Cobrança gerada com sucesso!");
      onUpdated?.();
    } catch (e) {
      toast.error(e.message || "Erro ao gerar cobrança");
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarLembrete = async () => {
    setReminderLoading(true);
    try {
      const res = await primeos.functions.invoke("enviarLembreteCobranca", { transaction_id: transaction.id });
      if (res.data?.error) throw new Error(res.data.error);
      toast.success("Lembrete enviado!");
      onUpdated?.();
    } catch (e) {
      toast.error(e.message || "Erro ao enviar lembrete");
    } finally {
      setReminderLoading(false);
    }
  };

  const handleBaixar = async () => {
    setLoading(true);
    try {
      const res = await primeos.functions.invoke("baixarPagamento", {
        transaction_id: transaction.id,
        ...baixaData
      });
      if (res.data?.error) throw new Error(res.data.error);
      toast.success("Baixa registrada! Transação marcada como paga.");
      onUpdated?.();
      onClose();
    } catch (e) {
      toast.error(e.message || "Erro ao registrar baixa");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            Gestão de Cobrança
          </DialogTitle>
        </DialogHeader>

        {/* Transaction summary */}
        <div className="bg-slate-50 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-slate-900 text-sm truncate">{transaction.description}</p>
            <Badge className={isPago
              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
              : "bg-amber-100 text-amber-700 border-amber-200"
            }>
              {isPago ? "Pago" : "Pendente"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-xs">{transaction.patient_name}</p>
            <p className="font-bold text-emerald-600">
              R$ {(transaction.amount || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
          {transaction.due_date && (
            <p className="text-xs text-slate-400">
              Vencimento: {format(parseISO(transaction.due_date), "dd/MM/yyyy", { locale: ptBR })}
            </p>
          )}
          {transaction.reminder_count > 0 && (
            <p className="text-xs text-indigo-500">
              📬 {transaction.reminder_count} lembrete(s) enviado(s)
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setTab("cobranca")}
            className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${
              tab === "cobranca" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <FileText className="w-3.5 h-3.5 inline mr-1" />Cobrança
          </button>
          <button
            onClick={() => setTab("baixa")}
            className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${
              tab === "baixa" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5 inline mr-1" />Registrar Baixa
          </button>
        </div>

        {/* Tab: Cobrança */}
        {tab === "cobranca" && (
          <div className="space-y-4">
            {!hasBoleto && !isPago && (
              <div className="space-y-3">
                {!transaction.patient_email && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">
                      Sem e-mail do paciente cadastrado. A cobrança será gerada mas o e-mail não será enviado automaticamente.
                    </p>
                  </div>
                )}
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2"
                  onClick={handleGerarCobranca}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  Gerar Cobrança / Boleto
                </Button>
                <p className="text-xs text-slate-400 text-center">
                  Gera um link de pagamento (cartão + boleto) via Stripe
                </p>
              </div>
            )}

            {hasBoleto && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${transaction.boleto_status === "pago" ? "bg-emerald-500" : "bg-blue-500"}`} />
                  <span className="text-sm font-medium text-slate-700">
                    Cobrança {transaction.boleto_status === "pago" ? "Paga" : "Gerada"}
                  </span>
                  {transaction.boleto_generated_at && (
                    <span className="text-xs text-slate-400 ml-auto">
                      {format(new Date(transaction.boleto_generated_at), "dd/MM HH:mm")}
                    </span>
                  )}
                </div>

                {transaction.boleto_url && (
                  <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                    <p className="text-xs text-slate-500 font-medium">Link de Pagamento</p>
                    <div className="flex items-center gap-2">
                      <Input value={transaction.boleto_url} readOnly className="text-xs h-8" />
                      <Button size="sm" variant="outline" className="h-8 px-2 flex-shrink-0"
                        onClick={() => copyToClipboard(transaction.boleto_url)}>
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 px-2 flex-shrink-0"
                        onClick={() => window.open(transaction.boleto_url, "_blank")}>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}

                {transaction.boleto_barcode && (
                  <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                    <p className="text-xs text-slate-500 font-medium">Linha Digitável</p>
                    <div className="flex items-center gap-2">
                      <Input value={transaction.boleto_barcode} readOnly className="text-xs h-8 font-mono" />
                      <Button size="sm" variant="outline" className="h-8 px-2 flex-shrink-0"
                        onClick={() => copyToClipboard(transaction.boleto_barcode)}>
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}

                {!isPago && transaction.patient_email && (
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    onClick={handleEnviarLembrete}
                    disabled={reminderLoading}
                  >
                    {reminderLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                    Enviar Lembrete por Email
                  </Button>
                )}

                {!isPago && (
                  <Button
                    variant="outline"
                    className="w-full gap-2 text-slate-600"
                    onClick={handleGerarCobranca}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                    Gerar Nova Cobrança
                  </Button>
                )}
              </div>
            )}

            {isPago && (
              <div className="flex items-center justify-center gap-2 py-4 text-emerald-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Esta cobrança já foi paga!</span>
              </div>
            )}
          </div>
        )}

        {/* Tab: Baixa */}
        {tab === "baixa" && (
          <div className="space-y-4">
            {isPago ? (
              <div className="flex items-center justify-center gap-2 py-4 text-emerald-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Baixa já registrada!</span>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Forma de Pagamento</label>
                  <Select value={baixaData.payment_method} onValueChange={v => setBaixaData(p => ({ ...p, payment_method: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Data do Pagamento</label>
                  <Input
                    type="date"
                    value={baixaData.payment_date}
                    onChange={e => setBaixaData(p => ({ ...p, payment_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Observações (opcional)</label>
                  <Input
                    placeholder="Ex: Pago via transferência banco X..."
                    value={baixaData.notes}
                    onChange={e => setBaixaData(p => ({ ...p, notes: e.target.value }))}
                  />
                </div>
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2"
                  onClick={handleBaixar}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Confirmar Baixa — R$ {(transaction.amount || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </Button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
