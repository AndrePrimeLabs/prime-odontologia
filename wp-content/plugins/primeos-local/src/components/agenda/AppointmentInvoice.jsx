// @ts-nocheck
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { SERVICE_LABELS } from "./ServicePriceConfig";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const fmtBRL = (v) => `R$ ${Number(v || 0).toFixed(2).replace(".", ",")}`;
const statusLabel = { paid: "Pago", pending: "Pendente", waived: "Isento", partial: "Parcial" };
const statusColor = { paid: "bg-green-100 text-green-700", pending: "bg-amber-100 text-amber-700", waived: "bg-slate-100 text-slate-600", partial: "bg-blue-100 text-blue-700" };
const methodLabel = { dinheiro: "Dinheiro", pix: "PIX", cartao_credito: "Cartão de Crédito", cartao_debito: "Cartão de Débito", convenio: "Convênio", outro: "Outro" };

export default function AppointmentInvoice({ appointment, onClose }) {
  const invoiceNum = appointment.invoice_number || `INV-${appointment.id?.slice(-6).toUpperCase()}`;

  const handlePrint = () => window.print();

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex gap-2 justify-end print:hidden">
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-1" /> Imprimir
        </Button>
        <Button variant="outline" size="sm" onClick={onClose}>Fechar</Button>
      </div>

      {/* Invoice */}
      <div className="border border-slate-200 rounded-xl p-6 space-y-5 bg-white print:border-0 print:shadow-none">
        {/* Header */}
        <div className="flex items-start justify-between border-b pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">RECIBO / FATURA</h2>
            <p className="text-sm text-slate-500 mt-0.5">#{invoiceNum}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-900">Prime Odontologia</p>
            <p className="text-xs text-slate-500">CNPJ: XX.XXX.XXX/0001-XX</p>
            <p className="text-xs text-slate-500">São Paulo, SP</p>
          </div>
        </div>

        {/* Patient & Date */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Paciente</p>
            <p className="font-semibold text-slate-900">{appointment.patient_name}</p>
            {appointment.patient_phone && <p className="text-slate-600">{appointment.patient_phone}</p>}
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Data da Consulta</p>
            <p className="font-semibold text-slate-900">
              {appointment.date ? format(new Date(appointment.date + "T00:00:00"), "dd/MM/yyyy", { locale: ptBR }) : "—"}
            </p>
            <p className="text-slate-600">{appointment.time} {appointment.provider ? `· Dr(a). ${appointment.provider}` : ""}</p>
          </div>
        </div>

        {/* Services table */}
        <div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 text-slate-500 font-semibold">Serviço</th>
                <th className="text-right py-2 text-slate-500 font-semibold">Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-3 text-slate-900">{SERVICE_LABELS[appointment.service_type] || appointment.service_type}</td>
                <td className="py-3 text-right font-semibold text-slate-900">{fmtBRL(appointment.price)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td className="pt-4 font-bold text-slate-900 text-base">Total</td>
                <td className="pt-4 text-right font-bold text-slate-900 text-base">{fmtBRL(appointment.price)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Payment status */}
        <div className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
          <div>
            <p className="text-xs text-slate-500">Forma de pagamento</p>
            <p className="font-medium text-slate-800">{methodLabel[appointment.payment_method] || "—"}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-1">Status</p>
            <Badge className={`${statusColor[appointment.payment_status || "pending"]}`}>
              {statusLabel[appointment.payment_status || "pending"]}
            </Badge>
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center pt-2 border-t">
          Obrigado pela confiança! Em caso de dúvidas, entre em contato conosco.
        </p>
      </div>
    </div>
  );
}
