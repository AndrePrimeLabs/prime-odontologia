// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CreditCard, Copy, RefreshCw, CheckCircle, MessageCircle, QrCode, Zap, AlertCircle
} from "lucide-react";
import { toast } from "sonner";

const SERVICES = [
  "Consulta Inicial", "Limpeza Dental", "Clareamento", "Ortodontia - Mensalidade",
  "Implante Dentário", "Prótese", "Cirurgia", "Endodontia (Canal)",
  "Restauração", "Extração", "Outro"
];

const PAYMENT_METHODS = [
  { value: "pix", label: "PIX", color: "bg-green-100 text-green-700" },
  { value: "cartao_credito", label: "Cartão de Crédito", color: "bg-blue-100 text-blue-700" },
  { value: "boleto", label: "Boleto", color: "bg-amber-100 text-amber-700" },
  { value: "todos", label: "Todos os Métodos", color: "bg-indigo-100 text-indigo-700" },
];

export default function PaymentLink({ open, onClose, onCreated }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState(null);
  const [form, setForm] = useState({
    patient_name: "",
    amount: "",
    service: "Consulta Inicial",
    description: "",
    payment_method: "todos",
    due_days: "3",
    installments: "1",
    notes: "",
  });

  const isInIframe = window.self !== window.top;

  const generateStripeLink = async () => {
    if (isInIframe) {
      toast.error("O checkout Stripe só funciona no app publicado, não no preview.");
      return;
    }
    if (!form.patient_name || !form.amount) {
      toast.error("Preencha paciente e valor.");
      return;
    }
    setLoading(true);
    try {
      const amount = parseFloat(form.amount.replace(",", "."));
      const res = await primeos.functions.invoke("stripeCheckout", {
        patient_name: form.patient_name,
        amount,
        service: form.service,
        description: form.notes,
        success_url: window.location.origin + window.location.pathname + "?payment=success",
        cancel_url: window.location.origin + window.location.pathname + "?payment=cancelled",
      });

      if (res.data?.url) {
        // Register in system
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + parseInt(form.due_days));
        await primeos.entities.FinancialTransaction.create({
          type: "receita",
          category: "consulta",
          description: `${form.service} - ${form.patient_name} [Stripe]`,
          amount,
          date: new Date().toISOString().split("T")[0],
          due_date: dueDate.toISOString().split("T")[0],
          status: "pendente",
          patient_name: form.patient_name,
          payment_method: "cartao_credito",
          notes: `Stripe session: ${res.data.session_id}`,
          bank_statement_ref: res.data.session_id,
        });
        onCreated?.();
        window.open(res.data.url, "_blank");
        toast.success("Redirecionando para o checkout Stripe!");
        onClose();
        reset();
      }
    } catch (err) {
      toast.error("Erro ao criar sessão Stripe: " + err.message);
    }
    setLoading(false);
  };

  const generateLink = async () => {
    if (!form.patient_name || !form.amount) {
      toast.error("Preencha paciente e valor.");
      return;
    }
    setLoading(true);
    try {
      const amount = parseFloat(form.amount.replace(",", "."));
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + parseInt(form.due_days));
      
      const message = encodeURIComponent(
        `💳 *Cobrança - Prime Odontologia*\n\n` +
        `👤 Paciente: ${form.patient_name}\n` +
        `🦷 Serviço: ${form.service}\n` +
        `💰 Valor: R$ ${amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n` +
        `📅 Vencimento: ${dueDate.toLocaleDateString("pt-BR")}\n` +
        (form.installments !== "1" ? `📊 Parcelas: ${form.installments}x de R$ ${(amount / parseInt(form.installments)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n` : "") +
        (form.notes ? `\n📝 ${form.notes}\n` : "") +
        `\nFormas de pagamento aceitas: PIX, Cartão, Transferência.\n\n` +
        `_Para confirmar o pagamento, responda esta mensagem._`
      );

      const paymentCode = `PRIME-${Date.now().toString(36).toUpperCase()}`;
      
      setGeneratedLink({
        amount,
        patient_name: form.patient_name,
        service: form.service,
        due_date: dueDate.toLocaleDateString("pt-BR"),
        payment_code: paymentCode,
        pix_key: "pagamentos@primeodontologia.com.br",
        whatsapp_message: message,
        installments: form.installments,
      });

      const txDate = new Date().toISOString().split("T")[0];
      const txDue = dueDate.toISOString().split("T")[0];
      await primeos.entities.FinancialTransaction.create({
        type: "receita",
        category: "consulta",
        description: `${form.service} - ${form.patient_name} [${paymentCode}]`,
        amount,
        date: txDate,
        due_date: txDue,
        status: "pendente",
        patient_name: form.patient_name,
        payment_method: form.payment_method === "todos" ? "pix" : form.payment_method,
        notes: form.notes || `Link gerado: ${paymentCode}`,
        bank_statement_ref: paymentCode,
      });

      setStep(2);
      onCreated?.();
    } catch (err) {
      toast.error("Erro ao gerar link. Tente novamente.");
    }
    setLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  const reset = () => {
    setStep(1);
    setGeneratedLink(null);
    setForm({ patient_name: "", amount: "", service: "Consulta Inicial", description: "", payment_method: "todos", due_days: "3", installments: "1", notes: "" });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(); reset(); } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            {step === 1 ? "Gerar Link de Pagamento" : "Link Gerado com Sucesso!"}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label>Paciente *</Label>
                <Input placeholder="Nome do paciente" value={form.patient_name}
                  onChange={e => setForm({ ...form, patient_name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Valor (R$) *</Label>
                <Input placeholder="0,00" value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Parcelas</Label>
                <Select value={form.installments} onValueChange={v => setForm({ ...form, installments: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["1","2","3","4","5","6","10","12"].map(v => (
                      <SelectItem key={v} value={v}>{v === "1" ? "À vista" : `${v}x`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Serviço</Label>
                <Select value={form.service} onValueChange={v => setForm({ ...form, service: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SERVICES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Forma de Pagamento</Label>
                <Select value={form.payment_method} onValueChange={v => setForm({ ...form, payment_method: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Vencimento (dias)</Label>
                <Select value={form.due_days} onValueChange={v => setForm({ ...form, due_days: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["1","2","3","5","7","10","15","30"].map(v => (
                      <SelectItem key={v} value={v}>{v} dia{v !== "1" ? "s" : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Observações (opcional)</Label>
                <Textarea placeholder="Instruções, detalhes do tratamento..." rows={2}
                  value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="resize-none" />
              </div>
            </div>

            {isInIframe && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 flex gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>O checkout Stripe funciona apenas no app publicado. Use "PIX / WhatsApp" para testar no preview.</p>
              </div>
            )}

            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-700">
              <p className="font-semibold mb-1 flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> A cobrança é registrada automaticamente no financeiro.</p>
            </div>

            <div className="flex gap-2 justify-end flex-wrap">
              <Button variant="outline" onClick={() => { onClose(); reset(); }}>Cancelar</Button>
              <Button variant="outline" onClick={generateLink} disabled={loading} className="border-green-300 text-green-700 hover:bg-green-50 gap-2">
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                PIX / WhatsApp
              </Button>
              <Button onClick={generateStripeLink} disabled={loading || isInIframe} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                Pagar com Stripe
              </Button>
            </div>
          </div>
        )}

        {step === 2 && generatedLink && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-emerald-800">Cobrança criada!</p>
              <p className="text-emerald-600 text-sm">{generatedLink.patient_name} · R$ {generatedLink.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              <p className="text-emerald-500 text-xs mt-1">Vence em: {generatedLink.due_date}</p>
            </div>

            <div className="space-y-3">
              {/* PIX Key */}
              <div className="p-3 bg-green-50 border border-green-100 rounded-xl">
                <p className="text-xs font-semibold text-green-700 mb-2 flex items-center gap-1"><QrCode className="w-3.5 h-3.5" /> Chave PIX</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-white p-2 rounded-lg border border-green-100 text-green-800 font-mono">
                    {generatedLink.pix_key}
                  </code>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(generatedLink.pix_key)} className="h-8 gap-1">
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Payment code */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-xs font-semibold text-slate-600 mb-2">Código de Referência</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-white p-2 rounded-lg border font-mono text-slate-800">
                    {generatedLink.payment_code}
                  </code>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(generatedLink.payment_code)} className="h-8 gap-1">
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* WhatsApp button */}
              <a
                href={`https://wa.me/?text=${generatedLink.whatsapp_message}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full bg-green-600 hover:bg-green-700 gap-2">
                  <MessageCircle className="w-4 h-4" /> Enviar via WhatsApp
                </Button>
              </a>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { reset(); }}>
                Gerar Outro
              </Button>
              <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => { onClose(); reset(); }}>
                Concluir
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
