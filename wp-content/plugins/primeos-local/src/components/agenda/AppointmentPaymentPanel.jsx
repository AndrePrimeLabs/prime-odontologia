// @ts-nocheck
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CheckCircle, FileText, Loader2 } from "lucide-react";
import { primeos } from "@/api/primeosClient";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AppointmentInvoice from "./AppointmentInvoice";

const fmtBRL = (v) => `R$ ${Number(v || 0).toFixed(2).replace(".", ",")}`;
const statusLabel = { paid: "Pago", pending: "Pendente", waived: "Isento", partial: "Parcial" };
const statusColor = { paid: "bg-green-100 text-green-700", pending: "bg-amber-100 text-amber-700", waived: "bg-slate-100 text-slate-600", partial: "bg-blue-100 text-blue-700" };

export default function AppointmentPaymentPanel({ appointment, onUpdated }) {
  const qc = useQueryClient();
  const [price, setPrice] = useState(appointment.price ?? "");
  const [paymentStatus, setPaymentStatus] = useState(appointment.payment_status || "pending");
  const [paymentMethod, setPaymentMethod] = useState(appointment.payment_method || "");
  const [saving, setSaving] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const today = new Date().toISOString().split("T")[0];
    const invoiceNumber = appointment.invoice_number || `INV-${appointment.id?.slice(-6).toUpperCase()}`;
    await primeos.entities.Appointment.update(appointment.id, {
      price: parseFloat(price) || 0,
      payment_status: paymentStatus,
      payment_method: paymentMethod || undefined,
      payment_date: paymentStatus === "paid" ? today : appointment.payment_date,
      invoice_number: invoiceNumber
    });
    setSaving(false);
    qc.invalidateQueries({ queryKey: ["allAppointments"] });
    toast.success("Informações de pagamento atualizadas!");
    onUpdated?.();
  };

  const updatedAppointment = {
    ...appointment,
    price: parseFloat(price) || 0,
    payment_status: paymentStatus,
    payment_method: paymentMethod,
    invoice_number: appointment.invoice_number || `INV-${appointment.id?.slice(-6).toUpperCase()}`
  };

  return (
    <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-green-600" /> Pagamento
        </p>
        <Badge className={statusColor[appointment.payment_status || "pending"]}>
          {statusLabel[appointment.payment_status || "pending"]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Valor (R$)</Label>
          <Input
            type="number"
            className="h-8 text-sm"
            placeholder="0,00"
            value={price}
            onChange={e => setPrice(e.target.value)}
          />
        </div>
        <div>
          <Label className="text-xs">Status</Label>
          <Select value={paymentStatus} onValueChange={setPaymentStatus}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="paid">Pago</SelectItem>
              <SelectItem value="partial">Parcial</SelectItem>
              <SelectItem value="waived">Isento</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2">
          <Label className="text-xs">Forma de Pagamento</Label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pix">PIX</SelectItem>
              <SelectItem value="dinheiro">Dinheiro</SelectItem>
              <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
              <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
              <SelectItem value="convenio">Convênio</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <CheckCircle className="w-3 h-3 mr-1" />}
          Salvar
        </Button>
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setShowInvoice(true)}>
          <FileText className="w-3 h-3 mr-1" /> Recibo
        </Button>
      </div>

      <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Recibo da Consulta</DialogTitle></DialogHeader>
          <AppointmentInvoice appointment={updatedAppointment} onClose={() => setShowInvoice(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
