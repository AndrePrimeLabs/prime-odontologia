// @ts-nocheck
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Phone, MessageCircle, Calendar, DollarSign,
  Edit2, FileText, User, ArrowRight
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const statusBadge = {
  scheduled: { label: "Agendada", color: "bg-blue-50 text-blue-700 border-blue-200" },
  confirmed: { label: "Confirmada", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  completed: { label: "Concluída", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Cancelada", color: "bg-rose-50 text-rose-700 border-rose-200" },
  no_show: { label: "Faltou", color: "bg-amber-50 text-amber-700 border-amber-200" },
};

const txStatusBadge = {
  pago: { label: "Pago", color: "text-emerald-600" },
  pendente: { label: "Pendente", color: "text-amber-600" },
  vencido: { label: "Vencido", color: "text-rose-600" },
  cancelado: { label: "Cancelado", color: "text-slate-400" },
};

export default function PatientProfileDrawer({ patient, appointments, transactions, onClose, onEdit, onSchedule }) {
  if (!patient) return null;

  const patientName = patient.name || patient.patient_name;
  const patientPhone = patient.phone || patient.patient_phone;
  const patientEmail = patient.email || patient.patient_email;

  const patientAppointments = appointments
    .filter(a =>
      a.patient_id === patient.id ||
      a.patient_name?.toLowerCase() === patientName?.toLowerCase()
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const patientTransactions = transactions
    .filter(t =>
      t.patient_id === patient.id ||
      t.patient_name?.toLowerCase() === patientName?.toLowerCase()
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalPaid = patientTransactions
    .filter(t => t.type === "receita" && t.status === "pago")
    .reduce((s, t) => s + (t.amount || 0), 0);

  const totalPending = patientTransactions
    .filter(t => t.type === "receita" && t.status === "pendente")
    .reduce((s, t) => s + (t.amount || 0), 0);

  const completedAppts = patientAppointments.filter(a => a.status === "completed").length;

  return (
    <Sheet open={!!patient} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
              {patientName?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-left text-lg">{patientName}</SheetTitle>
              <p className="text-sm text-slate-500 mt-0.5">
                {patient.status === "active" || patient.status === "ativo" ? "Paciente Ativo" : patient.status}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => onEdit(patient)} className="gap-1.5 flex-shrink-0">
              <Edit2 className="w-3.5 h-3.5" />
              Editar
            </Button>
          </div>

          {/* Contact bar */}
          <div className="flex flex-wrap gap-2 mt-3">
            {patientPhone && (
              <a
                href={`https://wa.me/${patientPhone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="gap-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </Button>
              </a>
            )}
            {patientPhone && (
              <a href={`tel:${patientPhone}`}>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  Ligar
                </Button>
              </a>
            )}
            <Link to={createPageUrl("Agenda")}>
              <Button variant="outline" size="sm" className="gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                <Calendar className="w-3.5 h-3.5" />
                Agendar
              </Button>
            </Link>
          </div>
        </SheetHeader>

        {/* Summary KPIs */}
        <div className="grid grid-cols-3 gap-3 my-4">
          <div className="bg-emerald-50 rounded-xl p-3 text-center">
            <p className="text-xs text-emerald-600 font-medium">Total Pago</p>
            <p className="text-base font-bold text-emerald-700 mt-0.5">
              {totalPaid > 0 ? `R$ ${totalPaid.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}` : "—"}
            </p>
          </div>
          <div className={cn("rounded-xl p-3 text-center", totalPending > 0 ? "bg-amber-50" : "bg-slate-50")}>
            <p className={cn("text-xs font-medium", totalPending > 0 ? "text-amber-600" : "text-slate-400")}>Pendente</p>
            <p className={cn("text-base font-bold mt-0.5", totalPending > 0 ? "text-amber-700" : "text-slate-400")}>
              {totalPending > 0 ? `R$ ${totalPending.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}` : "—"}
            </p>
          </div>
          <div className="bg-indigo-50 rounded-xl p-3 text-center">
            <p className="text-xs text-indigo-600 font-medium">Consultas</p>
            <p className="text-base font-bold text-indigo-700 mt-0.5">{patientAppointments.length}</p>
          </div>
        </div>

        <Tabs defaultValue="consultas" className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="consultas" className="flex-1 text-xs">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              Consultas ({patientAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="financeiro" className="flex-1 text-xs">
              <DollarSign className="w-3.5 h-3.5 mr-1" />
              Financeiro ({patientTransactions.length})
            </TabsTrigger>
            <TabsTrigger value="dados" className="flex-1 text-xs">
              <User className="w-3.5 h-3.5 mr-1" />
              Dados
            </TabsTrigger>
          </TabsList>

          {/* APPOINTMENTS */}
          <TabsContent value="consultas" className="mt-4 space-y-3">
            {patientAppointments.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhuma consulta registrada</p>
                <Link to={createPageUrl("Agenda")}>
                  <Button size="sm" className="mt-3 gap-2 bg-indigo-600 hover:bg-indigo-700">
                    <Calendar className="w-3.5 h-3.5" /> Agendar Agora
                  </Button>
                </Link>
              </div>
            )}
            {patientAppointments.map(appt => {
              const s = statusBadge[appt.status] || { label: appt.status, color: "bg-slate-50 text-slate-600" };
              return (
                <div key={appt.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-800 text-sm">
                      {appt.service_type?.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {appt.date && format(parseISO(appt.date), "dd/MM/yyyy", { locale: ptBR })}
                      {appt.time ? ` às ${appt.time}` : ""}
                      {appt.provider ? ` · ${appt.provider}` : ""}
                    </p>
                  </div>
                  <Badge variant="outline" className={cn("text-xs", s.color)}>{s.label}</Badge>
                </div>
              );
            })}
          </TabsContent>

          {/* FINANCIAL */}
          <TabsContent value="financeiro" className="mt-4 space-y-3">
            {patientTransactions.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhuma transação registrada</p>
                <Link to={createPageUrl("Financeiro")}>
                  <Button size="sm" variant="outline" className="mt-3 gap-2">
                    <ArrowRight className="w-3.5 h-3.5" /> Ir para Financeiro
                  </Button>
                </Link>
              </div>
            )}
            {patientTransactions.map(tx => {
              const s = txStatusBadge[tx.status] || { label: tx.status, color: "text-slate-500" };
              return (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{tx.description}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {tx.date && format(parseISO(tx.date), "dd/MM/yyyy", { locale: ptBR })}
                      {tx.payment_method ? ` · ${tx.payment_method.replace(/_/g, " ")}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cn("font-semibold text-sm", tx.type === "receita" ? "text-emerald-600" : "text-rose-600")}>
                      {tx.type === "despesa" ? "−" : "+"} R$ {tx.amount?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    <p className={cn("text-xs", s.color)}>{s.label}</p>
                  </div>
                </div>
              );
            })}
          </TabsContent>

          {/* PROFILE DATA */}
          <TabsContent value="dados" className="mt-4">
            <div className="space-y-3 text-sm">
              {[
                { label: "Nome", value: patientName },
                { label: "Telefone", value: patientPhone },
                { label: "Email", value: patientEmail },
                { label: "CPF", value: patient.cpf },
                { label: "Data de Nascimento", value: patient.date_of_birth },
                { label: "Gênero", value: patient.gender },
                { label: "Estado civil", value: patient.marital_status },
                { label: "Ocupação", value: patient.occupation },
                { label: "Como nos conheceu", value: patient.how_did_you_hear || patient.source },
                { label: "Notas", value: patient.notes },
              ].filter(f => f.value).map(f => (
                <div key={f.label} className="flex gap-3">
                  <span className="text-slate-400 w-36 flex-shrink-0">{f.label}</span>
                  <span className="text-slate-800 font-medium">{f.value}</span>
                </div>
              ))}
              {patient._source === "patientRecord" && (
                <div className="pt-3 mt-3 border-t border-slate-100">
                  <Link to={createPageUrl("Prontuarios")}>
                    <Button variant="outline" size="sm" className="gap-2 w-full">
                      <FileText className="w-4 h-4" />
                      Ver Prontuário Completo
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
