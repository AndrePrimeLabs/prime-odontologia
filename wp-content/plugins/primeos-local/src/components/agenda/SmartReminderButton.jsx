// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageCircle, Brain, Copy, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";

export default function SmartReminderButton({ appointment }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const generate = async () => {
    setLoading(true);
    const res = await primeos.functions.invoke('sendSmartReminder', { appointmentId: appointment.id });
    setResult(res.data);
    setLoading(false);
  };

  const openDialog = () => {
    setOpen(true);
    setResult(null);
    generate();
  };

  const sendWhatsApp = () => {
    const clean = (result?.phone || appointment.patient_phone)?.replace(/\D/g, '');
    if (!clean) { toast.error("Sem telefone cadastrado"); return; }
    window.open(`https://wa.me/55${clean}?text=${encodeURIComponent(result.message)}`, '_blank');
  };

  const copy = () => {
    navigator.clipboard.writeText(result.message);
    toast.success("Mensagem copiada!");
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={openDialog}
        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200"
      >
        <Brain className="w-4 h-4 mr-1" />
        Lembrete IA
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Lembrete Personalizado por IA
            </DialogTitle>
          </DialogHeader>

          {loading && (
            <div className="flex flex-col items-center py-8 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <p className="text-sm text-slate-500">Gerando mensagem personalizada para {appointment.patient_name}...</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Tom:</span>
                <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full capitalize">
                  {result.tone}
                </span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-slate-600">WhatsApp</span>
                  </div>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={copy}>
                    <Copy className="w-3 h-3 text-slate-400" />
                  </Button>
                </div>
                <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">{result.message}</p>
              </div>

              {result.tip && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <Zap className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800">{result.tip}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={sendWhatsApp} className="flex-1 bg-green-600 hover:bg-green-700 gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Enviar no WhatsApp
                </Button>
                <Button onClick={copy} variant="outline" className="gap-2">
                  <Copy className="w-4 h-4" />
                  Copiar
                </Button>
              </div>

              <Button onClick={generate} variant="ghost" size="sm" className="w-full text-xs text-slate-400">
                Regenerar mensagem
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
