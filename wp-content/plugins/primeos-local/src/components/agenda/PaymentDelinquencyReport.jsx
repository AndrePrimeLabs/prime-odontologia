// @ts-nocheck
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, AlertTriangle, CheckCircle2, Search, RefreshCw, TrendingDown, DollarSign, Users, FileText } from "lucide-react";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";

const serviceLabels = {
  consultation: "Consulta", follow_up: "Retorno", procedure: "Procedimento",
  checkup: "Check-up", emergency: "Emergência", therapy: "Terapia", diagnostic: "Diagnóstico"
};

const fmtBRL = (v) => `R$ ${Number(v || 0).toFixed(2).replace(".", ",")}`;

function DelinquencyBadge({ days }) {
  if (days <= 3) return <Badge className="bg-amber-100 text-amber-700 text-xs">Recente</Badge>;
  if (days <= 7) return <Badge className="bg-orange-100 text-orange-700 text-xs">Atenção</Badge>;
  if (days <= 14) return <Badge className="bg-red-100 text-red-700 text-xs">Urgente</Badge>;
  return <Badge className="bg-red-200 text-red-800 text-xs font-bold">Crítico</Badge>;
}

export default function PaymentDelinquencyReport() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterDays, setFilterDays] = useState("all");
  const [runningFollowUp, setRunningFollowUp] = useState(false);

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["allAppointments"],
    queryFn: () => primeos.entities.Appointment.list("-date")
  });

  const { data: followUpLogs = [] } = useQuery({
    queryKey: ["followUpLogs"],
    queryFn: () => primeos.entities.FollowUpLog.list("-created_date")
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.Appointment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allAppointments"] });
      toast.success("Pagamento atualizado!");
    }
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Pending payment appointments (completed)
  const pendingPayments = useMemo(() => {
    return appointments
      .filter(a => a.status === "completed" && a.price > 0 && a.payment_status !== "paid" && a.payment_status !== "waived")
      .map(a => {
        const aptDate = new Date(a.date);
        const days = differenceInDays(today, aptDate);
        const logs = followUpLogs.filter(l => l.reference_id === a.id);
        return { ...a, daysOverdue: days, followUpCount: logs.length, lastFollowUp: logs[0]?.created_date };
      })
      .sort((a, b) => b.daysOverdue - a.daysOverdue);
  }, [appointments, followUpLogs, today]);

  // Payment history (paid)
  const paidPayments = useMemo(() => {
    return appointments
      .filter(a => a.status === "completed" && a.price > 0 && a.payment_status === "paid")
      .sort((a, b) => new Date(b.payment_date || b.updated_date) - new Date(a.payment_date || a.updated_date));
  }, [appointments]);

  // Delinquency by patient
  const byPatient = useMemo(() => {
    const map = {};
    pendingPayments.forEach(a => {
      if (!map[a.patient_name]) map[a.patient_name] = { name: a.patient_name, phone: a.patient_phone, total: 0, count: 0, oldest: 0 };
      map[a.patient_name].total += a.price;
      map[a.patient_name].count += 1;
      if (a.daysOverdue > map[a.patient_name].oldest) map[a.patient_name].oldest = a.daysOverdue;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [pendingPayments]);

  const totalPending = pendingPayments.reduce((s, a) => s + (a.price || 0), 0);
  const totalReceived = paidPayments.reduce((s, a) => s + (a.price || 0), 0);

  const filtered = pendingPayments.filter(a => {
    const matchSearch = !search || a.patient_name.toLowerCase().includes(search.toLowerCase());
    const matchDays = filterDays === "all" || (
      filterDays === "3" ? a.daysOverdue <= 3 :
      filterDays === "7" ? a.daysOverdue > 3 && a.daysOverdue <= 7 :
      filterDays === "14" ? a.daysOverdue > 7 && a.daysOverdue <= 14 :
      a.daysOverdue > 14
    );
    return matchSearch && matchDays;
  });

  const sendWhatsApp = (apt) => {
    const phone = apt.patient_phone?.replace(/\D/g, "");
    if (!phone) { toast.error("Paciente sem telefone cadastrado"); return; }
    const msg = `Olá ${apt.patient_name}! 👋\n\nLembrando sobre o pagamento pendente da sua consulta em ${apt.date}.\n💰 Valor: ${fmtBRL(apt.price)}\n\nEntre em contato para regularizar. Obrigado! 🦷`;
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const markAsPaid = (apt) => {
    updateMutation.mutate({ id: apt.id, data: { ...apt, payment_status: "paid", payment_date: format(new Date(), "yyyy-MM-dd") } });
  };

  const runFollowUp = async () => {
    setRunningFollowUp(true);
    try {
      const res = await primeos.functions.invoke("paymentFollowUp", {});
      const data = res.data;
      toast.success(`Follow-up executado: ${data.summary.sent} notificações enviadas`);
      queryClient.invalidateQueries({ queryKey: ["followUpLogs"] });
    } catch (e) {
      toast.error("Erro ao executar follow-up");
    }
    setRunningFollowUp(false);
  };

  const [activeTab, setActiveTab] = useState("inadimplencia");

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-xs text-slate-500">Total Inadimplente</span>
            </div>
            <p className="text-xl font-bold text-red-600">{fmtBRL(totalPending)}</p>
            <p className="text-xs text-slate-400">{pendingPayments.length} consultas</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-xs text-slate-500">Total Recebido</span>
            </div>
            <p className="text-xl font-bold text-green-600">{fmtBRL(totalReceived)}</p>
            <p className="text-xs text-slate-400">{paidPayments.length} pagas</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-slate-500">Pacientes Pendentes</span>
            </div>
            <p className="text-xl font-bold text-amber-600">{byPatient.length}</p>
            <p className="text-xs text-slate-400">com pagamento em aberto</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-indigo-500" />
              <span className="text-xs text-slate-500">Taxa Inadimplência</span>
            </div>
            <p className="text-xl font-bold text-indigo-600">
              {totalPending + totalReceived > 0 ? ((totalPending / (totalPending + totalReceived)) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-xs text-slate-400">do total faturado</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {[
          { id: "inadimplencia", label: "Inadimplência", icon: AlertTriangle },
          { id: "por_paciente", label: "Por Paciente", icon: Users },
          { id: "historico", label: "Histórico Pagamentos", icon: FileText }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "inadimplencia" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input className="pl-9" placeholder="Buscar paciente..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={filterDays} onValueChange={setFilterDays}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os períodos</SelectItem>
                <SelectItem value="3">Até 3 dias</SelectItem>
                <SelectItem value="7">4 a 7 dias</SelectItem>
                <SelectItem value="14">8 a 14 dias</SelectItem>
                <SelectItem value="14+">Mais de 14 dias</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={runFollowUp} disabled={runningFollowUp} className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">
              <RefreshCw className={`w-4 h-4 mr-2 ${runningFollowUp ? "animate-spin" : ""}`} />
              Executar Follow-up Automático
            </Button>
          </div>

          {isLoading ? (
            <p className="text-slate-400 text-sm text-center py-8">Carregando...</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-slate-500">Nenhuma pendência encontrada!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(apt => (
                <div key={apt.id} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-900">{apt.patient_name}</p>
                        <DelinquencyBadge days={apt.daysOverdue} />
                        {apt.payment_status === "partial" && <Badge className="bg-blue-100 text-blue-700 text-xs">Parcial</Badge>}
                      </div>
                      <div className="text-sm text-slate-500 mt-1 space-y-0.5">
                        <p>📅 Consulta: {apt.date} — {serviceLabels[apt.service_type] || apt.service_type}</p>
                        <p>💰 Valor: <span className="font-semibold text-red-600">{fmtBRL(apt.price)}</span></p>
                        <p>⏱ {apt.daysOverdue} dias em aberto · {apt.followUpCount} cobranças enviadas</p>
                        {apt.patient_phone && <p>📱 {apt.patient_phone}</p>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {apt.patient_phone && (
                        <Button size="sm" variant="outline" onClick={() => sendWhatsApp(apt)} className="text-green-600 hover:bg-green-50">
                          <MessageCircle className="w-3 h-3 mr-1" />WhatsApp
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => markAsPaid(apt)} className="text-emerald-600 hover:bg-emerald-50">
                        <CheckCircle2 className="w-3 h-3 mr-1" />Pago
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "por_paciente" && (
        <div className="space-y-3">
          {byPatient.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-slate-500">Nenhuma inadimplência por paciente!</p>
            </div>
          ) : byPatient.map(p => (
            <div key={p.name} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{p.name}</p>
                  <p className="text-sm text-slate-500">{p.count} consulta(s) pendente(s) · maior atraso: {p.oldest} dias</p>
                  {p.phone && <p className="text-xs text-slate-400">📱 {p.phone}</p>}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">{fmtBRL(p.total)}</p>
                  {p.phone && (
                    <Button size="sm" variant="outline" className="mt-1 text-green-600 hover:bg-green-50" onClick={() => {
                      const phone = p.phone.replace(/\D/g, "");
                      const msg = `Olá ${p.name}! 👋\n\nVocê possui ${p.count} consulta(s) com pagamento pendente totalizando ${fmtBRL(p.total)}.\n\nPor favor, entre em contato para regularizar. Obrigado! 🦷`;
                      window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`, "_blank");
                    }}>
                      <MessageCircle className="w-3 h-3 mr-1" />WhatsApp
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "historico" && (
        <div className="space-y-3">
          {paidPayments.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">Nenhum pagamento registrado ainda.</p>
          ) : paidPayments.slice(0, 50).map(apt => (
            <div key={apt.id} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{apt.patient_name}</p>
                <p className="text-sm text-slate-500">📅 {apt.date} — {serviceLabels[apt.service_type] || apt.service_type}</p>
                {apt.payment_method && <p className="text-xs text-slate-400">💳 {apt.payment_method.replace(/_/g, " ")}</p>}
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">{fmtBRL(apt.price)}</p>
                <Badge className="bg-green-100 text-green-700 text-xs">✓ Pago</Badge>
                {apt.payment_date && <p className="text-xs text-slate-400 mt-1">{apt.payment_date}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
