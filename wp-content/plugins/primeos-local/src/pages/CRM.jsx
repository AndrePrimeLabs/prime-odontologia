// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import PatientProfileDrawer from "@/components/crm/PatientProfileDrawer";
import CustomerForm from "@/components/crm/CustomerForm";
import InteractionForm from "@/components/crm/InteractionForm";
import SegmentationPanel from "@/components/crm/SegmentationPanel";
import AIPatientAnalysis from "@/components/crm/AIPatientAnalysis";
import {
  Users, Search, UserPlus, Calendar, DollarSign,
  Phone, Mail, MessageCircle, Star, Brain,
  UserCheck, AlertCircle, MoreVertical, X, BookmarkCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusColors = {
  lead: "bg-amber-50 text-amber-700 border-amber-200",
  prospect: "bg-blue-50 text-blue-700 border-blue-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactive: "bg-slate-50 text-slate-500 border-slate-200",
  churned: "bg-rose-50 text-rose-700 border-rose-200",
  ativo: "bg-emerald-50 text-emerald-700 border-emerald-200",
  inativo: "bg-slate-50 text-slate-500 border-slate-200",
};

const statusLabel = {
  lead: "Lead", prospect: "Prospect", active: "Ativo",
  inactive: "Inativo", churned: "Perdido", ativo: "Ativo", inativo: "Inativo",
};

function PatientCard({ patient, appointments, transactions, onView, onEdit, onInteraction, onDelete }) {
  const lastAppointment = appointments
    .filter(a => a.patient_id === patient.id || a.patient_name === patient.name)
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

  const totalSpent = transactions
    .filter(t => t.patient_id === patient.id || t.patient_name === patient.name)
    .filter(t => t.type === "receita" && t.status === "pago")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const pending = transactions
    .filter(t => (t.patient_id === patient.id || t.patient_name === patient.name) && t.status === "pendente")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -1 }}
      className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={() => onView(patient)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {patient.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 truncate">{patient.name}</h3>
            <Badge variant="outline" className={cn("text-xs mt-0.5", statusColors[patient.status])}>
              {statusLabel[patient.status] || patient.status}
            </Badge>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(patient); }}>Ver Perfil Completo</DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(patient); }}>Editar</DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onInteraction(patient); }}>Registrar Interação</DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(patient); }} className="text-rose-600">Excluir</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-1.5 text-sm text-slate-600 mb-3">
        {patient.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>{patient.phone}</span>
          </div>
        )}
        {patient.email && (
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate">{patient.email}</span>
          </div>
        )}
        {patient.profession && (
          <div className="flex items-center gap-2">
            <Star className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">{patient.profession}</span>
          </div>
        )}
      </div>

      {patient.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {patient.tags.slice(0, 3).map(tag => (
            <Badge key={tag} className="bg-indigo-50 text-indigo-600 border-0 text-xs">#{tag}</Badge>
          ))}
          {patient.tags.length > 3 && <Badge className="bg-slate-50 text-slate-500 border-0 text-xs">+{patient.tags.length - 3}</Badge>}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
        <div>
          <p className="text-xs text-slate-400">Gasto Total</p>
          <p className="text-sm font-semibold text-emerald-600">
            {totalSpent > 0 ? `R$ ${totalSpent.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}` : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Pendente</p>
          <p className={cn("text-sm font-semibold", pending > 0 ? "text-amber-600" : "text-slate-400")}>
            {pending > 0 ? `R$ ${pending.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}` : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Últ. Consulta</p>
          <p className="text-sm font-semibold text-slate-700">
            {lastAppointment ? format(parseISO(lastAppointment.date), "dd/MM", { locale: ptBR }) : "—"}
          </p>
        </div>
      </div>

      {patient.phone && (
        <a
          href={`https://wa.me/${patient.phone.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
        >
          <MessageCircle className="w-3.5 h-3.5" />WhatsApp
        </a>
      )}
    </motion.div>
  );
}

export default function CRM() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("");
  const [activeSegmentId, setActiveSegmentId] = useState(null);
  const [segmentCustomers, setSegmentCustomers] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showInteraction, setShowInteraction] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [viewingPatient, setViewingPatient] = useState(null);

  const queryClient = useQueryClient();

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => primeos.entities.Customer.list("-created_date")
  });

  const { data: patientRecords = [] } = useQuery({
    queryKey: ["patientRecords"],
    queryFn: () => primeos.entities.PatientRecord.list("-created_date")
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => primeos.entities.Appointment.list("-date")
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["financialTransactions"],
    queryFn: () => primeos.entities.FinancialTransaction.list("-date")
  });

  const allPatients = [
    ...customers.map(c => ({ ...c, _source: "customer" })),
    ...patientRecords
      .filter(pr => !customers.find(c =>
        c.name?.toLowerCase() === pr.patient_name?.toLowerCase() ||
        c.email === pr.patient_email ||
        c.phone === pr.patient_phone
      ))
      .map(pr => ({
        ...pr,
        id: pr.id,
        name: pr.patient_name,
        phone: pr.patient_phone,
        email: pr.patient_email,
        status: pr.status === "ativo" ? "active" : pr.status,
        _source: "patientRecord",
      }))
  ];

  const createMutation = useMutation({
    mutationFn: (data) => primeos.entities.Customer.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["customers"] }); setShowForm(false); setEditingCustomer(null); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.Customer.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["customers"] }); setShowForm(false); setEditingCustomer(null); }
  });

  const deleteMutation = useMutation({
    mutationFn: (p) => p._source === "customer"
      ? primeos.entities.Customer.delete(p.id)
      : primeos.entities.PatientRecord.delete(p.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["patientRecords"] });
    }
  });

  const interactionMutation = useMutation({
    mutationFn: (data) => primeos.entities.Interaction.create(data),
    onSuccess: () => { setShowInteraction(false); setSelectedCustomer(null); }
  });

  const handleSave = (data) => {
    if (editingCustomer?._source === "customer") {
      updateMutation.mutate({ id: editingCustomer.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const baseList = segmentCustomers !== null ? segmentCustomers : allPatients;
  const filtered = baseList.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q) || p.phone?.includes(q) || p.tags?.some(t => t.toLowerCase().includes(q));
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchTag = !tagFilter || p.tags?.some(t => t.toLowerCase().includes(tagFilter.toLowerCase()));
    return matchSearch && matchStatus && matchTag;
  });

  const allTags = [...new Set(allPatients.flatMap(p => p.tags || []))].sort();
  const activeCount = allPatients.filter(p => p.status === "active" || p.status === "ativo").length;
  const totalRevenue = transactions.filter(t => t.type === "receita" && t.status === "pago").reduce((s, t) => s + (t.amount || 0), 0);
  const pendingRevenue = transactions.filter(t => t.type === "receita" && t.status === "pendente").reduce((s, t) => s + (t.amount || 0), 0);
  const thisMonth = appointments.filter(a => {
    const d = new Date(a.date); const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">CRM — Central de Pacientes</h1>
            <p className="text-sm text-slate-500 mt-0.5">Dados unificados: prontuários, agendamentos e financeiro</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
            <UserPlus className="w-4 h-4" />Novo Paciente
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Pacientes", value: allPatients.length, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Ativos", value: activeCount, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Consultas este Mês", value: thisMonth, icon: Calendar, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Receita Confirmada", value: `R$ ${totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map((s) => (
            <Card key={s.label} className="border-0 shadow-sm bg-white/80">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", s.bg)}>
                  <s.icon className={cn("w-5 h-5", s.color)} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className="text-lg font-bold text-slate-900">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pending alert */}
        {pendingRevenue > 0 && (
          <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-sm text-amber-800">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>
              <strong>R$ {pendingRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong> em cobranças pendentes.{" "}
              <Link to={createPageUrl("Financeiro")} className="underline font-medium">Ver no Financeiro →</Link>
            </span>
          </div>
        )}

        {/* Main tabs */}
        <Tabs defaultValue="patients" className="space-y-5">
          <TabsList>
            <TabsTrigger value="patients" className="gap-2"><Users className="w-4 h-4" />Pacientes</TabsTrigger>
            <TabsTrigger value="ai" className="gap-2"><Brain className="w-4 h-4" />Análise IA</TabsTrigger>
          </TabsList>

          {/* AI Analysis Tab */}
          <TabsContent value="ai">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <AIPatientAnalysis
                customers={allPatients}
                appointments={appointments}
                transactions={transactions}
              />
            </div>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nome, email, telefone ou tag..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="lead">Leads</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-slate-400 self-center">{filtered.length} cliente(s)</span>
            </div>

            {/* Tag Quick Filters */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {allTags.slice(0, 15).map(tag => (
                  <button key={tag} onClick={() => setTagFilter(tagFilter === tag ? "" : tag)}
                    className={cn("text-xs px-2.5 py-1 rounded-full border transition-all",
                      tagFilter === tag ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                    )}>#{tag}</button>
                ))}
                {tagFilter && (
                  <button onClick={() => setTagFilter("")} className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center gap-1">
                    <X className="w-3 h-3" />limpar
                  </button>
                )}
              </div>
            )}

            {/* Active Segment Banner */}
            {activeSegmentId && (
              <div className="flex items-center gap-2 p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-700">
                <BookmarkCheck className="w-4 h-4" />
                <span>Segmentação ativa: <strong>{activeSegmentId}</strong> — {filtered.length} clientes</span>
                <button onClick={() => { setActiveSegmentId(null); setSegmentCustomers(null); }} className="ml-auto hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Grid + Sidebar */}
            <div className="grid xl:grid-cols-4 gap-6 items-start">
              <div className="xl:col-span-3">
                {filtered.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                      {filtered.map((patient) => (
                        <PatientCard
                          key={patient.id}
                          patient={patient}
                          appointments={appointments}
                          transactions={transactions}
                          onView={setViewingPatient}
                          onEdit={(p) => { setEditingCustomer(p); setShowForm(true); }}
                          onInteraction={(p) => { setSelectedCustomer(p); setShowInteraction(true); }}
                          onDelete={(p) => deleteMutation.mutate(p)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="text-center py-16 text-slate-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Nenhum cliente encontrado</p>
                    <Button onClick={() => setShowForm(true)} className="mt-4 gap-2 bg-indigo-600 hover:bg-indigo-700">
                      <UserPlus className="w-4 h-4" />Adicionar Cliente
                    </Button>
                  </div>
                )}
              </div>

              {/* Segmentation Sidebar */}
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                <SegmentationPanel
                  customers={allPatients}
                  transactions={transactions}
                  activeSegmentId={activeSegmentId}
                  onFilter={() => {}}
                  onSegmentSelect={(id, list) => { setActiveSegmentId(id); setSegmentCustomers(list); }}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Drawers / Dialogs */}
      <PatientProfileDrawer
        patient={viewingPatient}
        appointments={appointments}
        transactions={transactions}
        onClose={() => setViewingPatient(null)}
        onEdit={(p) => { setViewingPatient(null); setEditingCustomer(p); setShowForm(true); }}
        onSchedule={() => window.location.href = createPageUrl("Agenda")}
      />

      <CustomerForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditingCustomer(null); }}
        onSave={handleSave}
        customer={editingCustomer}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <InteractionForm
        open={showInteraction}
        onClose={() => { setShowInteraction(false); setSelectedCustomer(null); }}
        onSave={(data) => interactionMutation.mutate(data)}
        customer={selectedCustomer}
        isLoading={interactionMutation.isPending}
      />
    </div>
  );
}
