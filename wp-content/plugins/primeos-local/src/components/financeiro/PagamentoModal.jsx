// @ts-nocheck
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Loader2, SplitSquareHorizontal, Calendar, History } from "lucide-react";
import { primeos } from "@/api/primeosClient";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const PAYMENT_METHODS = [
  { value: "pix", label: "PIX" },
  { value: "transferencia", label: "Transferência" },
  { value: "boleto", label: "Boleto" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "cartao_credito", label: "Cartão de Crédito" },
  { value: "cartao_debito", label: "Cartão de Débito" },
  { value: "outro", label: "Outro" },
];

export default function PagamentoModal({ transaction, open, onClose }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("total"); // total | parcial | agendar
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    payment_method: "pix",
    payment_date: today,
    partial_amount: "",
    scheduled_date: "",
    notes: ""
  });

  if (!transaction) return null;

  const totalPaid = transaction.amount_paid || 0;
  const balance = (transaction.amount || 0) - totalPaid;
  const partials = transaction.partial_payments || [];

  const invalidateAndClose = () => {
    queryClient.invalidateQueries({ queryKey: ["financialTransactions"] });
    onClose();
  };

  const handlePagarTotal = async () => {
    setLoading(true);
    try {
      await primeos.entities.FinancialTransaction.update(transaction.id, {
        status: "pago",
        amount_paid: transaction.amount,
        payment_method: form.payment_method,
        notes: form.notes ? (transaction.notes ? transaction.notes + "\n" + form.notes : form.notes) : transaction.notes
      });
      toast.success("Pagamento total registrado!");
      invalidateAndClose();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePagarParcial = async () => {
    const partial = parseFloat(form.partial_amount);
    if (!partial || partial <= 0) { toast.error("Informe um valor válido"); return; }
    if (partial > balance) { toast.error(`Valor excede o saldo devedor (R$ ${balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})`); return; }

    setLoading(true);
    try {
      const newPaid = totalPaid + partial;
      const newPartials = [...partials, {
        amount: partial,
        date: form.payment_date,
        method: form.payment_method,
        notes: form.notes
      }];
      const isPaidOff = newPaid >= (transaction.amount || 0);

      await primeos.entities.FinancialTransaction.update(transaction.id, {
        status: isPaidOff ? "pago" : "parcial",
        amount_paid: newPaid,
        partial_payments: newPartials
      });
      toast.success(isPaidOff ? "Pago integralmente!" : `Pagamento parcial de R$ ${partial.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} registrado!`);
      invalidateAndClose();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAgendar = async () => {
    if (!form.scheduled_date) { toast.error("Informe a data de pagamento"); return; }
    setLoading(true);
    try {
      await primeos.entities.FinancialTransaction.update(transaction.id, {
        scheduled_payment_date: form.scheduled_date,
        notes: form.notes ? (transaction.notes ? transaction.notes + "\n" + form.notes : form.notes) : transaction.notes
      });
      toast.success(`Pagamento agendado para ${format(parseISO(form.scheduled_date), "dd/MM/yyyy", { locale: ptBR })}`);
      invalidateAndClose();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-900">Registrar Pagamento</DialogTitle>
        </DialogHeader>

        {/* Summary */}
        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-slate-900 text-sm">{transaction.description}</p>
              {transaction.supplier && <p className="text-xs text-slate-500">{transaction.supplier}</p>}
            </div>
            <Badge className={
              transaction.status === "parcial" ? "bg-blue-100 text-blue-700 border-blue-200" :
              transaction.status === "pago" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
              "bg-amber-100 text-amber-700 border-amber-200"
            }>
              {transaction.status === "parcial" ? "Parcial" : transaction.status === "pago" ? "Pago" : "Pendente"}
            </Badge>
          </div>
          <div className="flex justify-between text-sm pt-1 border-t border-slate-200">
            <span className="text-slate-500">Total</span>
            <span className="font-bold text-rose-600">R$ {(transaction.amount || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
          </div>
          {totalPaid > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Pago</span>
              <span className="font-medium text-emerald-600">R$ {totalPaid.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-semibold">
            <span className="text-slate-700">Saldo Devedor</span>
            <span className="text-rose-700">R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Histórico de parciais */}
        {partials.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500 flex items-center gap-1"><History className="w-3.5 h-3.5" /> Histórico de Pagamentos</p>
            <div className="bg-slate-50 rounded-lg divide-y divide-slate-100">
              {partials.map((p, i) => (
                <div key={i} className="flex justify-between items-center px-3 py-2 text-xs">
                  <span className="text-slate-600">{p.date ? format(parseISO(p.date), "dd/MM/yyyy") : "-"} · {p.method}</span>
                  <span className="font-medium text-emerald-600">R$ {(p.amount || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {transaction.status !== "pago" && (
          <>
            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
              {[
                { key: "total", label: "Pagar Total", icon: CheckCircle },
                { key: "parcial", label: "Parcial", icon: SplitSquareHorizontal },
                { key: "agendar", label: "Agendar", icon: Calendar },
              ].map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => setTab(key)}
                  className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                    tab === key ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"
                  }`}>
                  <Icon className="w-3 h-3" />{label}
                </button>
              ))}
            </div>

            {/* Common fields */}
            {(tab === "total" || tab === "parcial") && (
              <div className="space-y-3">
                {tab === "parcial" && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">Valor a Pagar (R$)</label>
                    <Input
                      type="number"
                      placeholder={`Máx: ${balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                      value={form.partial_amount}
                      onChange={e => setForm(p => ({ ...p, partial_amount: e.target.value }))}
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Forma de Pagamento</label>
                  <Select value={form.payment_method} onValueChange={v => setForm(p => ({ ...p, payment_method: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Data do Pagamento</label>
                  <Input type="date" value={form.payment_date} onChange={e => setForm(p => ({ ...p, payment_date: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Observações</label>
                  <Input placeholder="Ex: Pago via TED..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                </div>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2" disabled={loading}
                  onClick={tab === "total" ? handlePagarTotal : handlePagarParcial}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {tab === "total"
                    ? `Confirmar Pagamento — R$ ${balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                    : "Registrar Pagamento Parcial"
                  }
                </Button>
              </div>
            )}

            {tab === "agendar" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Data do Pagamento</label>
                  <Input type="date" min={today} value={form.scheduled_date} onChange={e => setForm(p => ({ ...p, scheduled_date: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Observações</label>
                  <Input placeholder="Ex: Aguardando aprovação..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                </div>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2" disabled={loading} onClick={handleAgendar}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                  Agendar Pagamento
                </Button>
                {transaction.scheduled_payment_date && (
                  <p className="text-xs text-center text-indigo-600">
                    Agendado para: {format(parseISO(transaction.scheduled_payment_date), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
