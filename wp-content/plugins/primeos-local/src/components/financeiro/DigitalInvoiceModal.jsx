// @ts-nocheck
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { primeos } from "@/api/primeosClient";
import { Loader2, Receipt, ExternalLink, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function DigitalInvoiceModal({ open, onClose }) {
  const [form, setForm] = useState({ description: "", amount: "", patient_name: "", patient_email: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    if (!form.description || !form.amount) return toast.error("Preencha descrição e valor");

    // Check iframe
    if (window.self !== window.top) {
      toast.error("O link de pagamento só funciona em apps publicados. Acesse o app pelo link público para testar.");
      return;
    }

    setLoading(true);
    const res = await primeos.functions.invoke("createDigitalInvoice", {
      description: form.description,
      amount: parseFloat(form.amount),
      patient_name: form.patient_name,
      patient_email: form.patient_email,
      notes: form.notes,
    });
    setLoading(false);

    if (res.data?.url) {
      setResult(res.data.url);
    } else {
      toast.error(res.data?.error || "Erro ao gerar nota");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copiado!");
  };

  const handleClose = () => {
    setResult(null);
    setForm({ description: "", amount: "", patient_name: "", patient_email: "", notes: "" });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600" />
            Nota Digital / Link de Cobrança
          </DialogTitle>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">Gere um link de pagamento Stripe para enviar ao paciente por WhatsApp ou e-mail.</p>

            <div>
              <Label>Descrição do Serviço *</Label>
              <Input value={form.description} onChange={e => set("description", e.target.value)} placeholder="Ex: Consulta de avaliação odontológica" />
            </div>

            <div>
              <Label>Valor (R$) *</Label>
              <Input type="number" min="1" step="0.01" value={form.amount} onChange={e => set("amount", e.target.value)} placeholder="Ex: 250.00" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Nome do Paciente</Label>
                <Input value={form.patient_name} onChange={e => set("patient_name", e.target.value)} placeholder="Opcional" />
              </div>
              <div>
                <Label>E-mail do Paciente</Label>
                <Input type="email" value={form.patient_email} onChange={e => set("patient_email", e.target.value)} placeholder="Opcional" />
              </div>
            </div>

            <div>
              <Label>Observações</Label>
              <Textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} placeholder="Opcional..." />
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">💳 Pagamento via Stripe — aceita cartão de crédito. Modo de teste ativo; use cartão <strong>4242 4242 4242 4242</strong>.</p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleClose}>Cancelar</Button>
              <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={handleCreate} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Receipt className="w-4 h-4 mr-2" />}
                Gerar Link
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center py-4 gap-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <p className="font-semibold text-slate-900">Link gerado com sucesso!</p>
              <p className="text-xs text-slate-500">Compartilhe com o paciente para receber o pagamento</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg break-all text-xs text-slate-700 font-mono">
              {result}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 gap-2" onClick={handleCopy}>
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copiado!" : "Copiar Link"}
              </Button>
              <Button className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700" asChild>
                <a href={result} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" /> Abrir Pagamento
                </a>
              </Button>
            </div>

            <Button variant="ghost" className="w-full text-sm" onClick={handleClose}>Fechar</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
