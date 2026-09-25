// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Search, User, UserPlus, FileText, ClipboardList, Stethoscope,
  AlertTriangle, Pill, Activity, Plus, Edit, Lock, ShieldCheck,
  Phone, Mail, MapPin, Heart, Calendar, Loader2, CheckCircle,
  Download, Trash2, Users, RefreshCw, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const RECORD_TYPES = {
  anamnese:        { label: "Anamnese",            color: "bg-blue-100 text-blue-700" },
  exame_clinico:   { label: "Exame Clínico",       color: "bg-purple-100 text-purple-700" },
  plano_tratamento:{ label: "Plano de Tratamento", color: "bg-emerald-100 text-emerald-700" },
  evolucao:        { label: "Nota de Progresso",   color: "bg-amber-100 text-amber-700" },
  consulta:        { label: "Consulta",            color: "bg-sky-100 text-sky-700" },
  odontograma:     { label: "Odontograma",         color: "bg-rose-100 text-rose-700" },
  radiografia:     { label: "Radiografia",         color: "bg-indigo-100 text-indigo-700" },
  outro:           { label: "Outro",               color: "bg-slate-100 text-slate-700" },
};

const GENDERS = { masculino: "Masculino", feminino: "Feminino", outro: "Outro", prefiro_nao_informar: "Não informado" };
const BLOOD_TYPES = ["A+","A-","B+","B-","AB+","AB-","O+","O-","Não informado"];

const EMPTY_RECORD = { record_type: "consulta", title: "", content: "", provider: "", date: format(new Date(), "yyyy-MM-dd"), attachments: [] };
const EMPTY_PATIENT = {
  patient_name: "", patient_phone: "", patient_email: "", date_of_birth: "",
  gender: "", cpf: "", blood_type: "Não informado", occupation: "",
  allergies: [], medical_conditions: [], current_medications: [],
  emergency_contact: { name: "", relationship: "", phone: "" },
  address: { street: "", number: "", city: "", state: "", zip_code: "" },
  insurance_info: { has_insurance: false, provider: "", policy_number: "" },
  notes: "", status: "ativo",
};

export default function EHR() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [search, setSearch]           = useState("");
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [editingPatient, setEditingPatient]   = useState(null);
  const [showRecordForm, setShowRecordForm]   = useState(false);
  const [recordForm, setRecordForm]   = useState(EMPTY_RECORD);
  const [patientForm, setPatientForm] = useState(EMPTY_PATIENT);
  const [uploading, setUploading]     = useState(false);
  const [activeTab, setActiveTab]     = useState("history");

  const qc = useQueryClient();

  // ── Data ────────────────────────────────────────────────────────────────────
  const { data: patients = [], isLoading: loadingPatients } = useQuery({
    queryKey: ["ehr_patients"],
    queryFn: () => primeos.entities.PatientRecord.list("-created_date", 200),
  });

  const { data: records = [], isLoading: loadingRecords } = useQuery({
    queryKey: ["ehr_records", selectedPatient?.id],
    queryFn: () => primeos.entities.MedicalRecord.filter({ patient_id: selectedPatient.id }, "-date", 100),
    enabled: !!selectedPatient,
  });

  // ── Mutations ──────────────────────────────────────────────────────────────
  const createPatient = useMutation({
    mutationFn: (d) => primeos.entities.PatientRecord.create(d),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["ehr_patients"] });
      setSelectedPatient(data);
      setShowPatientForm(false);
      toast.success("Paciente cadastrado no EHR!");
    },
  });

  const updatePatient = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.PatientRecord.update(id, data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["ehr_patients"] });
      setSelectedPatient(data);
      setShowPatientForm(false);
      setEditingPatient(null);
      toast.success("Dados do paciente atualizados!");
    },
  });

  const createRecord = useMutation({
    mutationFn: (d) => primeos.entities.MedicalRecord.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ehr_records"] });
      setShowRecordForm(false);
      setRecordForm(EMPTY_RECORD);
      toast.success("Registro clínico salvo!");
    },
  });

  const deleteRecord = useMutation({
    mutationFn: (id) => primeos.entities.MedicalRecord.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ehr_records"] }),
  });

  // ── Helpers ────────────────────────────────────────────────────────────────
  const filtered = patients.filter(p =>
    p.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.cpf?.includes(search) ||
    p.patient_phone?.includes(search)
  );

  const openNew = () => { setEditingPatient(null); setPatientForm(EMPTY_PATIENT); setShowPatientForm(true); };
  const openEdit = (p) => {
    setEditingPatient(p);
    setPatientForm({ ...EMPTY_PATIENT, ...p, emergency_contact: { ...EMPTY_PATIENT.emergency_contact, ...(p.emergency_contact || {}) }, address: { ...EMPTY_PATIENT.address, ...(p.address || {}) }, insurance_info: { ...EMPTY_PATIENT.insurance_info, ...(p.insurance_info || {}) } });
    setShowPatientForm(true);
  };

  const handleSavePatient = (e) => {
    e.preventDefault();
    if (editingPatient) updatePatient.mutate({ id: editingPatient.id, data: patientForm });
    else createPatient.mutate(patientForm);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await primeos.integrations.Core.UploadFile({ file });
    setRecordForm(prev => ({ ...prev, attachments: [...prev.attachments, { name: file.name, url: file_url, type: file.type }] }));
    setUploading(false);
    toast.success("Arquivo anexado!");
  };

  const handleSaveRecord = (e) => {
    e.preventDefault();
    createRecord.mutate({ ...recordForm, patient_id: selectedPatient.id, patient_name: selectedPatient.patient_name });
  };

  const age = selectedPatient?.date_of_birth
    ? new Date().getFullYear() - new Date(selectedPatient.date_of_birth).getFullYear()
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/20 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Stethoscope className="w-7 h-7 text-teal-600" />
              Prontuário Eletrônico (EHR)
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">Histórico médico centralizado e seguro para todos os pacientes</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-teal-50 text-teal-700 border-teal-200 gap-1 px-2 py-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Dados protegidos
            </Badge>
            <Button onClick={openNew} className="bg-teal-600 hover:bg-teal-700">
              <UserPlus className="w-4 h-4 mr-2" /> Novo Paciente
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-5">

          {/* ── Patient List ───────────────────────────────────────────────── */}
          <Card className="border-0 shadow-sm lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                <Users className="w-4 h-4" /> Pacientes ({patients.length})
              </CardTitle>
              <div className="relative mt-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input className="pl-8 text-sm h-8" placeholder="Buscar por nome, CPF..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[540px]">
                {loadingPatients ? (
                  <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-sm px-4">
                    <User className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    {search ? "Nenhum resultado" : "Nenhum paciente cadastrado"}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {filtered.map(p => (
                      <button key={p.id} onClick={() => { setSelectedPatient(p); setActiveTab("history"); }}
                        className={cn("w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center gap-3",
                          selectedPatient?.id === p.id && "bg-teal-50 border-r-2 border-teal-500"
                        )}>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {p.patient_name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{p.patient_name}</p>
                          <p className="text-xs text-slate-400 truncate">{p.cpf || p.patient_phone || "—"}</p>
                        </div>
                        {selectedPatient?.id === p.id && <ChevronRight className="w-3.5 h-3.5 text-teal-500 ml-auto flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* ── Patient Detail ─────────────────────────────────────────────── */}
          <div className="lg:col-span-3">
            {!selectedPatient ? (
              <Card className="border-0 shadow-sm h-full flex items-center justify-center min-h-[400px]">
                <div className="text-center text-slate-400">
                  <Stethoscope className="w-14 h-14 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">Selecione um paciente</p>
                  <p className="text-sm mt-1">ou cadastre um novo para começar</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">

                {/* Patient Banner */}
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                          {selectedPatient.patient_name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-slate-900">{selectedPatient.patient_name}</h2>
                          <div className="flex items-center gap-3 mt-1 flex-wrap text-sm text-slate-500">
                            {selectedPatient.date_of_birth && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{age} anos</span>}
                            {selectedPatient.blood_type && selectedPatient.blood_type !== "Não informado" && <span className="flex items-center gap-1 text-red-600 font-semibold"><Heart className="w-3.5 h-3.5" />{selectedPatient.blood_type}</span>}
                            {selectedPatient.patient_phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{selectedPatient.patient_phone}</span>}
                            {selectedPatient.cpf && <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />CPF: {selectedPatient.cpf}</span>}
                          </div>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <Badge className={selectedPatient.status === "ativo" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}>
                              {selectedPatient.status || "ativo"}
                            </Badge>
                            {selectedPatient.allergies?.length > 0 && (
                              <Badge className="bg-red-100 text-red-700 gap-1">
                                <AlertTriangle className="w-3 h-3" /> {selectedPatient.allergies.length} alergia(s)
                              </Badge>
                            )}
                            {selectedPatient.insurance_info?.has_insurance && (
                              <Badge className="bg-blue-100 text-blue-700">{selectedPatient.insurance_info.provider || "Plano de saúde"}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(selectedPatient)}>
                          <Edit className="w-3.5 h-3.5 mr-1.5" /> Editar
                        </Button>
                        <Button size="sm" onClick={() => setShowRecordForm(true)} className="bg-teal-600 hover:bg-teal-700">
                          <Plus className="w-3.5 h-3.5 mr-1.5" /> Novo Registro
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Alerts */}
                {(selectedPatient.allergies?.length > 0 || selectedPatient.medical_conditions?.length > 0) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedPatient.allergies?.length > 0 && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-red-700 mb-1">⚠ Alergias conhecidas</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedPatient.allergies.map((a, i) => (
                              <Badge key={i} className="bg-red-100 text-red-700 text-xs">{a.allergen || a}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedPatient.medical_conditions?.length > 0 && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-2">
                        <Activity className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-amber-700 mb-1">Condições médicas</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedPatient.medical_conditions.map((c, i) => (
                              <Badge key={i} className="bg-amber-100 text-amber-700 text-xs">{c}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tabs */}
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="flex flex-wrap h-auto gap-1 mb-4">
                        <TabsTrigger value="history" className="text-xs">📋 Histórico</TabsTrigger>
                        <TabsTrigger value="demographics" className="text-xs">👤 Dados Pessoais</TabsTrigger>
                        <TabsTrigger value="medications" className="text-xs">💊 Medicamentos</TabsTrigger>
                        <TabsTrigger value="treatments" className="text-xs">🦷 Tratamentos</TabsTrigger>
                        <TabsTrigger value="security" className="text-xs">🔒 Conformidade</TabsTrigger>
                      </TabsList>

                      {/* HISTORY */}
                      <TabsContent value="history">
                        {loadingRecords ? (
                          <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
                        ) : records.length === 0 ? (
                          <div className="text-center py-12 text-slate-400">
                            <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p>Nenhum registro clínico ainda</p>
                            <Button size="sm" variant="outline" className="mt-3" onClick={() => setShowRecordForm(true)}>
                              <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar primeiro registro
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {records.map(rec => (
                              <div key={rec.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 group">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                      <Badge className={RECORD_TYPES[rec.record_type]?.color || "bg-slate-100 text-slate-700"}>
                                        {RECORD_TYPES[rec.record_type]?.label || rec.record_type}
                                      </Badge>
                                      <span className="text-xs text-slate-400">{rec.date && format(new Date(rec.date), "dd/MM/yyyy", { locale: ptBR })}</span>
                                      {rec.provider && <span className="text-xs text-slate-400">• {rec.provider}</span>}
                                    </div>
                                    <p className="font-medium text-slate-800 text-sm">{rec.title}</p>
                                    <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap line-clamp-3">{rec.content}</p>
                                    {rec.attachments?.length > 0 && (
                                      <div className="flex gap-2 mt-2 flex-wrap">
                                        {rec.attachments.map((att, i) => (
                                          <a key={i} href={att.url} target="_blank" className="text-xs text-blue-600 flex items-center gap-1 hover:underline">
                                            <Download className="w-3 h-3" />{att.name}
                                          </a>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 flex-shrink-0" onClick={() => deleteRecord.mutate(rec.id)}>
                                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>

                      {/* DEMOGRAPHICS */}
                      <TabsContent value="demographics">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <Section title="Contato" icon={<Phone className="w-4 h-4" />}>
                            <Field label="E-mail" value={selectedPatient.patient_email} icon={<Mail className="w-3.5 h-3.5 text-slate-400" />} />
                            <Field label="Telefone" value={selectedPatient.patient_phone} icon={<Phone className="w-3.5 h-3.5 text-slate-400" />} />
                            <Field label="CPF" value={selectedPatient.cpf} />
                            <Field label="Gênero" value={GENDERS[selectedPatient.gender]} />
                            <Field label="Profissão" value={selectedPatient.occupation} />
                          </Section>
                          <Section title="Endereço" icon={<MapPin className="w-4 h-4" />}>
                            {selectedPatient.address?.street && (
                              <Field label="Logradouro" value={`${selectedPatient.address.street}, ${selectedPatient.address.number || ""}`} />
                            )}
                            <Field label="Bairro" value={selectedPatient.address?.neighborhood} />
                            <Field label="Cidade/Estado" value={selectedPatient.address?.city && `${selectedPatient.address.city}/${selectedPatient.address.state}`} />
                            <Field label="CEP" value={selectedPatient.address?.zip_code} />
                          </Section>
                          <Section title="Contato de Emergência" icon={<Users className="w-4 h-4" />}>
                            <Field label="Nome" value={selectedPatient.emergency_contact?.name} />
                            <Field label="Relação" value={selectedPatient.emergency_contact?.relationship} />
                            <Field label="Telefone" value={selectedPatient.emergency_contact?.phone} />
                          </Section>
                          <Section title="Plano de Saúde" icon={<ShieldCheck className="w-4 h-4" />}>
                            {selectedPatient.insurance_info?.has_insurance ? (
                              <>
                                <Field label="Operadora" value={selectedPatient.insurance_info?.provider} />
                                <Field label="Apólice" value={selectedPatient.insurance_info?.policy_number} />
                                <Field label="Cobertura" value={selectedPatient.insurance_info?.coverage_percentage && `${selectedPatient.insurance_info.coverage_percentage}%`} />
                              </>
                            ) : <p className="text-sm text-slate-400">Sem plano de saúde</p>}
                          </Section>
                        </div>
                        {selectedPatient.notes && (
                          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-xs font-semibold text-slate-500 mb-1">Observações</p>
                            <p className="text-sm text-slate-700">{selectedPatient.notes}</p>
                          </div>
                        )}
                      </TabsContent>

                      {/* MEDICATIONS */}
                      <TabsContent value="medications">
                        <div className="space-y-3">
                          {selectedPatient.current_medications?.length > 0 ? (
                            selectedPatient.current_medications.map((m, i) => (
                              <div key={i} className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
                                <Pill className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-medium text-blue-900 text-sm">{m.name}</p>
                                  <p className="text-xs text-blue-600">{[m.dosage, m.frequency].filter(Boolean).join(" • ")}</p>
                                  {m.prescribing_doctor && <p className="text-xs text-blue-400 mt-0.5">Dr(a). {m.prescribing_doctor}</p>}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-10 text-slate-400">
                              <Pill className="w-10 h-10 mx-auto mb-2 opacity-20" />
                              <p className="text-sm">Nenhum medicamento em uso registrado</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      {/* TREATMENTS */}
                      <TabsContent value="treatments">
                        <div className="space-y-3">
                          {selectedPatient.past_treatments?.length > 0 ? (
                            selectedPatient.past_treatments.map((t, i) => (
                              <div key={i} className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                                <p className="font-medium text-indigo-900 text-sm">{t.treatment}</p>
                                <div className="flex gap-3 mt-1 text-xs text-indigo-600 flex-wrap">
                                  {t.date && <span>📅 {format(new Date(t.date), "dd/MM/yyyy", { locale: ptBR })}</span>}
                                  {t.tooth_number && <span>🦷 Dente {t.tooth_number}</span>}
                                  {t.dentist && <span>👨‍⚕️ {t.dentist}</span>}
                                  {t.cost && <span>💰 R$ {t.cost.toFixed(2)}</span>}
                                </div>
                                {t.notes && <p className="text-xs text-indigo-500 mt-1">{t.notes}</p>}
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-10 text-slate-400">
                              <Activity className="w-10 h-10 mx-auto mb-2 opacity-20" />
                              <p className="text-sm">Nenhum tratamento anterior registrado</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      {/* COMPLIANCE / SECURITY */}
                      <TabsContent value="security">
                        <div className="space-y-4">
                          <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex gap-3">
                            <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-green-800 text-sm">Conformidade LGPD</p>
                              <p className="text-xs text-green-700 mt-1">Dados armazenados com criptografia. Acesso restrito a profissionais autorizados. Logs de acesso mantidos.</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                              { icon: Lock, color: "text-slate-600", title: "Acesso controlado", desc: "Somente usuários autenticados acessam prontuários" },
                              { icon: ShieldCheck, color: "text-teal-600", title: "Dados criptografados", desc: "Armazenamento seguro com criptografia em repouso" },
                              { icon: FileText, color: "text-blue-600", title: "Trilha de auditoria", desc: "Todos os acessos e alterações são registrados" },
                              { icon: RefreshCw, color: "text-indigo-600", title: "Backup automático", desc: "Backups diários dos dados clínicos" },
                            ].map(({ icon: Icon, color, title, desc }) => (
                              <div key={title} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex gap-3">
                                <Icon className={`w-4 h-4 ${color} flex-shrink-0 mt-0.5`} />
                                <div>
                                  <p className="text-sm font-medium text-slate-800">{title}</p>
                                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500">
                            <p className="font-semibold text-slate-600 mb-1 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Metadados do Registro</p>
                            <p>Criado em: {selectedPatient.created_date ? format(new Date(selectedPatient.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : "—"}</p>
                            <p>Atualizado em: {selectedPatient.updated_date ? format(new Date(selectedPatient.updated_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : "—"}</p>
                            <p>ID do Registro: <span className="font-mono">{selectedPatient.id}</span></p>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Patient Form Dialog ───────────────────────────────────────────── */}
      <Dialog open={showPatientForm} onOpenChange={setShowPatientForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPatient ? "Editar Paciente" : "Novo Paciente — EHR"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSavePatient} className="space-y-5">
            <fieldset>
              <legend className="text-xs font-semibold text-slate-500 uppercase mb-2">Dados Pessoais</legend>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><Label>Nome Completo *</Label><Input required value={patientForm.patient_name} onChange={e => setPatientForm(p => ({ ...p, patient_name: e.target.value }))} placeholder="Nome do paciente" /></div>
                <div><Label>CPF</Label><Input value={patientForm.cpf} onChange={e => setPatientForm(p => ({ ...p, cpf: e.target.value }))} placeholder="000.000.000-00" /></div>
                <div><Label>Data de Nascimento</Label><Input type="date" value={patientForm.date_of_birth} onChange={e => setPatientForm(p => ({ ...p, date_of_birth: e.target.value }))} /></div>
                <div>
                  <Label>Gênero</Label>
                  <Select value={patientForm.gender} onValueChange={v => setPatientForm(p => ({ ...p, gender: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>{Object.entries(GENDERS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tipo Sanguíneo</Label>
                  <Select value={patientForm.blood_type} onValueChange={v => setPatientForm(p => ({ ...p, blood_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{BLOOD_TYPES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Telefone</Label><Input value={patientForm.patient_phone} onChange={e => setPatientForm(p => ({ ...p, patient_phone: e.target.value }))} placeholder="(11) 99999-9999" /></div>
                <div><Label>E-mail</Label><Input type="email" value={patientForm.patient_email} onChange={e => setPatientForm(p => ({ ...p, patient_email: e.target.value }))} placeholder="email@exemplo.com" /></div>
              </div>
            </fieldset>

            <Separator />

            <fieldset>
              <legend className="text-xs font-semibold text-slate-500 uppercase mb-2">Endereço</legend>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><Label>Logradouro</Label><Input value={patientForm.address.street} onChange={e => setPatientForm(p => ({ ...p, address: { ...p.address, street: e.target.value } }))} placeholder="Rua, Avenida..." /></div>
                <div><Label>Número</Label><Input value={patientForm.address.number} onChange={e => setPatientForm(p => ({ ...p, address: { ...p.address, number: e.target.value } }))} /></div>
                <div><Label>Bairro</Label><Input value={patientForm.address.neighborhood} onChange={e => setPatientForm(p => ({ ...p, address: { ...p.address, neighborhood: e.target.value } }))} /></div>
                <div><Label>Cidade</Label><Input value={patientForm.address.city} onChange={e => setPatientForm(p => ({ ...p, address: { ...p.address, city: e.target.value } }))} /></div>
                <div><Label>Estado</Label><Input value={patientForm.address.state} onChange={e => setPatientForm(p => ({ ...p, address: { ...p.address, state: e.target.value } }))} /></div>
              </div>
            </fieldset>

            <Separator />

            <fieldset>
              <legend className="text-xs font-semibold text-slate-500 uppercase mb-2">Contato de Emergência</legend>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Nome</Label><Input value={patientForm.emergency_contact.name} onChange={e => setPatientForm(p => ({ ...p, emergency_contact: { ...p.emergency_contact, name: e.target.value } }))} /></div>
                <div><Label>Relação</Label><Input value={patientForm.emergency_contact.relationship} onChange={e => setPatientForm(p => ({ ...p, emergency_contact: { ...p.emergency_contact, relationship: e.target.value } }))} /></div>
                <div><Label>Telefone</Label><Input value={patientForm.emergency_contact.phone} onChange={e => setPatientForm(p => ({ ...p, emergency_contact: { ...p.emergency_contact, phone: e.target.value } }))} /></div>
              </div>
            </fieldset>

            <Separator />

            <fieldset>
              <legend className="text-xs font-semibold text-slate-500 uppercase mb-2">Plano de Saúde</legend>
              <div className="flex items-center gap-3 mb-3">
                <Switch checked={patientForm.insurance_info.has_insurance} onCheckedChange={v => setPatientForm(p => ({ ...p, insurance_info: { ...p.insurance_info, has_insurance: v } }))} />
                <Label>Possui plano de saúde</Label>
              </div>
              {patientForm.insurance_info.has_insurance && (
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Operadora</Label><Input value={patientForm.insurance_info.provider} onChange={e => setPatientForm(p => ({ ...p, insurance_info: { ...p.insurance_info, provider: e.target.value } }))} /></div>
                  <div><Label>Nº Apólice</Label><Input value={patientForm.insurance_info.policy_number} onChange={e => setPatientForm(p => ({ ...p, insurance_info: { ...p.insurance_info, policy_number: e.target.value } }))} /></div>
                </div>
              )}
            </fieldset>

            <div><Label>Observações</Label><Textarea rows={2} value={patientForm.notes} onChange={e => setPatientForm(p => ({ ...p, notes: e.target.value }))} placeholder="Notas gerais sobre o paciente..." /></div>

            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={createPatient.isPending || updatePatient.isPending}>
              {(createPatient.isPending || updatePatient.isPending) ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              {editingPatient ? "Salvar Alterações" : "Cadastrar Paciente"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── New Clinical Record Dialog ────────────────────────────────────── */}
      <Dialog open={showRecordForm} onOpenChange={setShowRecordForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Registro Clínico — {selectedPatient?.patient_name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveRecord} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Registro</Label>
                <Select value={recordForm.record_type} onValueChange={v => setRecordForm(p => ({ ...p, record_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(RECORD_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Data</Label><Input type="date" value={recordForm.date} onChange={e => setRecordForm(p => ({ ...p, date: e.target.value }))} required /></div>
            </div>
            <div><Label>Título *</Label><Input required value={recordForm.title} onChange={e => setRecordForm(p => ({ ...p, title: e.target.value }))} placeholder="Ex: Consulta de retorno — canal" /></div>
            <div><Label>Profissional Responsável</Label><Input value={recordForm.provider} onChange={e => setRecordForm(p => ({ ...p, provider: e.target.value }))} placeholder="Dr(a). Nome" /></div>
            <div>
              <Label>Conteúdo / Nota de Progresso *</Label>
              <Textarea required rows={7} value={recordForm.content} onChange={e => setRecordForm(p => ({ ...p, content: e.target.value }))} placeholder="Descreva o atendimento, achados clínicos, conduta adotada..." />
            </div>
            <div>
              <Label>Anexar Arquivo</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input type="file" onChange={handleFileUpload} disabled={uploading} />
                {uploading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
              </div>
              {recordForm.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {recordForm.attachments.map((a, i) => <Badge key={i} variant="outline" className="text-xs">{a.name}</Badge>)}
                </div>
              )}
            </div>
            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={createRecord.isPending}>
              {createRecord.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Salvar Registro Clínico
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
      <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-3">{icon}{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Field({ label, value, icon }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      {icon && <span className="mt-0.5">{icon}</span>}
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm text-slate-800">{value}</p>
      </div>
    </div>
  );
}
