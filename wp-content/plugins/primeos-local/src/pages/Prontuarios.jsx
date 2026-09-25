// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
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
import { Plus, Search, User, Download,
  ClipboardList, FileSignature, Loader2, Eye, CheckCircle, MessageCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

const recordTypes = {
  anamnese: { label: "Anamnese", color: "bg-blue-100 text-blue-700" },
  exame_clinico: { label: "Exame Clínico", color: "bg-purple-100 text-purple-700" },
  plano_tratamento: { label: "Plano de Tratamento", color: "bg-emerald-100 text-emerald-700" },
  evolucao: { label: "Evolução", color: "bg-amber-100 text-amber-700" },
  odontograma: { label: "Odontograma", color: "bg-rose-100 text-rose-700" },
  radiografia: { label: "Radiografia", color: "bg-indigo-100 text-indigo-700" },
  outro: { label: "Outro", color: "bg-slate-100 text-slate-700" }
};

const documentTypes = {
  termo_consentimento: { label: "Termo de Consentimento", color: "bg-blue-100 text-blue-700" },
  termo_responsabilidade: { label: "Termo de Responsabilidade", color: "bg-purple-100 text-purple-700" },
  autorizacao_imagem: { label: "Autorização de Imagem", color: "bg-pink-100 text-pink-700" },
  pre_operatorio: { label: "Pré-Operatório", color: "bg-amber-100 text-amber-700" },
  pos_operatorio: { label: "Pós-Operatório", color: "bg-emerald-100 text-emerald-700" },
  orcamento: { label: "Orçamento", color: "bg-green-100 text-green-700" },
  receita: { label: "Receita", color: "bg-rose-100 text-rose-700" },
  atestado: { label: "Atestado", color: "bg-indigo-100 text-indigo-700" },
  declaracao: { label: "Declaração", color: "bg-cyan-100 text-cyan-700" },
  contrato: { label: "Contrato", color: "bg-orange-100 text-orange-700" },
  outro: { label: "Outro", color: "bg-slate-100 text-slate-700" }
};

export default function Prontuarios() {
  const [activeTab, setActiveTab] = useState("prontuarios");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: patients = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => primeos.entities.Customer.list("-created_date")
  });

  const { data: records = [] } = useQuery({
    queryKey: ["medicalRecords", selectedPatient?.id],
    queryFn: () => selectedPatient ? primeos.entities.MedicalRecord.filter({ patient_id: selectedPatient.id }, "-created_date") : [],
    enabled: !!selectedPatient
  });

  const { data: documents = [] } = useQuery({
    queryKey: ["documents", selectedPatient?.id],
    queryFn: () => selectedPatient ? primeos.entities.Document.filter({ patient_id: selectedPatient.id }, "-created_date") : [],
    enabled: !!selectedPatient
  });

  const createRecordMutation = useMutation({
    mutationFn: (data) => primeos.entities.MedicalRecord.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicalRecords"] });
      setShowRecordForm(false);
      toast.success("Prontuário salvo!");
    }
  });

  const createDocumentMutation = useMutation({
    mutationFn: (data) => primeos.entities.Document.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setShowDocumentForm(false);
      toast.success("Documento salvo!");
    }
  });

  const updateDocumentMutation = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.Document.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] })
  });

  const [recordForm, setRecordForm] = useState({
    record_type: "anamnese", title: "", content: "", provider: "", date: format(new Date(), "yyyy-MM-dd"), attachments: []
  });

  const [documentForm, setDocumentForm] = useState({
    document_type: "termo_consentimento", title: "", content: "", file_url: "", status: "pendente", sent_via: "whatsapp"
  });

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await primeos.integrations.Core.UploadFile({ file });
      if (type === "record") {
        setRecordForm(prev => ({
          ...prev,
          attachments: [...prev.attachments, { name: file.name, url: file_url, type: file.type }]
        }));
      } else {
        setDocumentForm(prev => ({ ...prev, file_url }));
      }
      toast.success("Arquivo enviado!");
    } catch (error) {
      toast.error("Erro ao enviar arquivo");
    }
    setUploading(false);
  };

  const openWhatsApp = (phone, message) => {
    const cleanPhone = phone?.replace(/\D/g, "") || "";
    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const filteredPatients = patients.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-blue-600" />
            Prontuários e Documentos
          </h1>
          <p className="text-slate-500 mt-1">Prime Odontologia - Gestão de prontuários digitais</p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Patients List */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4" />Pacientes
              </CardTitle>
              <div className="relative mt-2">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {filteredPatients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => setSelectedPatient(patient)}
                      className={cn(
                        "w-full p-3 rounded-lg text-left transition-all",
                        selectedPatient?.id === patient.id ? "bg-blue-100 border-blue-300 border" : "bg-slate-50 hover:bg-slate-100"
                      )}
                    >
                      <p className="font-medium text-sm">{patient.name}</p>
                      <p className="text-xs text-slate-500">{patient.phone}</p>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Records & Documents */}
          <div className="lg:col-span-3">
            {selectedPatient ? (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-lg font-bold">
                        {selectedPatient.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <h2 className="font-bold text-lg">{selectedPatient.name}</h2>
                        <p className="text-sm text-slate-500">{selectedPatient.phone} • {selectedPatient.email}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="prontuarios">
                        <ClipboardList className="w-4 h-4 mr-2" />Prontuários
                      </TabsTrigger>
                      <TabsTrigger value="documentos">
                        <FileSignature className="w-4 h-4 mr-2" />Documentos
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="prontuarios">
                      <div className="flex justify-end mb-4">
                        <Button onClick={() => setShowRecordForm(true)} className="bg-blue-600 hover:bg-blue-700">
                          <Plus className="w-4 h-4 mr-2" />Novo Prontuário
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {records.map((record) => (
                          <div key={record.id} className="p-4 bg-slate-50 rounded-xl">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <Badge className={recordTypes[record.record_type]?.color}>{recordTypes[record.record_type]?.label}</Badge>
                                <h3 className="font-medium mt-1">{record.title}</h3>
                              </div>
                              <span className="text-xs text-slate-500">{record.date}</span>
                            </div>
                            <p className="text-sm text-slate-600 whitespace-pre-wrap">{record.content?.slice(0, 200)}...</p>
                            {record.attachments?.length > 0 && (
                              <div className="flex gap-2 mt-2">
                                {record.attachments.map((att, idx) => (
                                  <a key={idx} href={att.url} target="_blank" className="text-xs text-blue-600 flex items-center gap-1">
                                    <Download className="w-3 h-3" />{att.name}
                                  </a>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-slate-400 mt-2">Dr(a). {record.provider}</p>
                          </div>
                        ))}
                        {records.length === 0 && (
                          <div className="text-center py-12 text-slate-400">
                            <ClipboardList className="w-12 h-12 mx-auto mb-3" />
                            <p>Nenhum prontuário encontrado</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="documentos">
                      <div className="flex justify-end mb-4">
                        <Button onClick={() => setShowDocumentForm(true)} className="bg-purple-600 hover:bg-purple-700">
                          <Plus className="w-4 h-4 mr-2" />Novo Documento
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {documents.map((doc) => (
                          <div key={doc.id} className="p-4 bg-slate-50 rounded-xl">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <Badge className={documentTypes[doc.document_type]?.color}>{documentTypes[doc.document_type]?.label}</Badge>
                                <h3 className="font-medium mt-1">{doc.title}</h3>
                              </div>
                              <Badge variant="outline" className={cn(
                                doc.status === "assinado" ? "text-emerald-600" : doc.status === "enviado" ? "text-blue-600" : "text-amber-600"
                              )}>{doc.status}</Badge>
                            </div>
                            <div className="flex gap-2 mt-3">
                              {doc.file_url && (
                                <Button size="sm" variant="outline" asChild>
                                  <a href={doc.file_url} target="_blank"><Eye className="w-3 h-3 mr-1" />Ver</a>
                                </Button>
                              )}
                              {doc.status === "pendente" && selectedPatient.phone && (
                                <Button size="sm" variant="outline" onClick={() => {
                                  const msg = `Olá ${selectedPatient.name}! 📄\n\nSegue o documento "${doc.title}" para sua análise e assinatura.\n\n${doc.file_url || "O documento será enviado em anexo."}\n\nPor favor, confirme o recebimento. 🙏\n\nPrime Odontologia`;
                                  openWhatsApp(selectedPatient.phone, msg);
                                  updateDocumentMutation.mutate({ id: doc.id, data: { ...doc, status: "enviado" } });
                                }}>
                                  <MessageCircle className="w-3 h-3 mr-1" />Enviar WhatsApp
                                </Button>
                              )}
                              {doc.status === "enviado" && (
                                <Button size="sm" variant="outline" onClick={() => {
                                  updateDocumentMutation.mutate({ id: doc.id, data: { ...doc, status: "assinado", signed_at: format(new Date(), "yyyy-MM-dd") } });
                                  toast.success("Documento marcado como assinado!");
                                }}>
                                  <CheckCircle className="w-3 h-3 mr-1" />Marcar Assinado
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                        {documents.length === 0 && (
                          <div className="text-center py-12 text-slate-400">
                            <FileSignature className="w-12 h-12 mx-auto mb-3" />
                            <p>Nenhum documento encontrado</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-sm h-full flex items-center justify-center">
                <div className="text-center py-20 text-slate-400">
                  <User className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-lg">Selecione um paciente</p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Record Form Dialog */}
        <Dialog open={showRecordForm} onOpenChange={setShowRecordForm}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader><DialogTitle>Novo Prontuário - {selectedPatient?.name}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo</Label>
                  <Select value={recordForm.record_type} onValueChange={(v) => setRecordForm({...recordForm, record_type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(recordTypes).map(([key, val]) => (
                        <SelectItem key={key} value={key}>{val.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Data</Label><Input type="date" value={recordForm.date} onChange={(e) => setRecordForm({...recordForm, date: e.target.value})} /></div>
              </div>
              <div><Label>Título</Label><Input value={recordForm.title} onChange={(e) => setRecordForm({...recordForm, title: e.target.value})} placeholder="Ex: Anamnese Inicial" /></div>
              <div><Label>Profissional</Label><Input value={recordForm.provider} onChange={(e) => setRecordForm({...recordForm, provider: e.target.value})} placeholder="Nome do dentista" /></div>
              <div><Label>Conteúdo</Label><Textarea value={recordForm.content} onChange={(e) => setRecordForm({...recordForm, content: e.target.value})} rows={6} placeholder="Descreva o atendimento..." /></div>
              <div>
                <Label>Anexos</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input type="file" onChange={(e) => handleFileUpload(e, "record")} disabled={uploading} />
                  {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                </div>
                {recordForm.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {recordForm.attachments.map((att, idx) => (
                      <Badge key={idx} variant="outline">{att.name}</Badge>
                    ))}
                  </div>
                )}
              </div>
              <Button onClick={() => createRecordMutation.mutate({ ...recordForm, patient_id: selectedPatient.id, patient_name: selectedPatient.name })} disabled={createRecordMutation.isPending} className="w-full bg-blue-600 hover:bg-blue-700">
                {createRecordMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}Salvar Prontuário
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Document Form Dialog */}
        <Dialog open={showDocumentForm} onOpenChange={setShowDocumentForm}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader><DialogTitle>Novo Documento - {selectedPatient?.name}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Documento</Label>
                  <Select value={documentForm.document_type} onValueChange={(v) => setDocumentForm({...documentForm, document_type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(documentTypes).map(([key, val]) => (
                        <SelectItem key={key} value={key}>{val.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Enviar via</Label>
                  <Select value={documentForm.sent_via} onValueChange={(v) => setDocumentForm({...documentForm, sent_via: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="presencial">Presencial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Título</Label><Input value={documentForm.title} onChange={(e) => setDocumentForm({...documentForm, title: e.target.value})} placeholder="Ex: Termo de Consentimento Clareamento" /></div>
              <div><Label>Conteúdo (opcional)</Label><Textarea value={documentForm.content} onChange={(e) => setDocumentForm({...documentForm, content: e.target.value})} rows={4} placeholder="Conteúdo do documento..." /></div>
              <div>
                <Label>Upload de Arquivo (PDF/Imagem)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => handleFileUpload(e, "document")} disabled={uploading} />
                  {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                </div>
                {documentForm.file_url && <p className="text-xs text-emerald-600 mt-1">✓ Arquivo carregado</p>}
              </div>
              <Button onClick={() => createDocumentMutation.mutate({ ...documentForm, patient_id: selectedPatient.id, patient_name: selectedPatient.name })} disabled={createDocumentMutation.isPending} className="w-full bg-purple-600 hover:bg-purple-700">
                {createDocumentMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileSignature className="w-4 h-4 mr-2" />}Salvar Documento
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
