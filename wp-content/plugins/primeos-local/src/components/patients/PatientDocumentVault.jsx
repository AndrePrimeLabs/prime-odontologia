// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Eye, Download, Plus, Loader2, Trash2, Image, File } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const DOC_TYPES = {
  receita: { label: "Receita", color: "bg-rose-100 text-rose-700" },
  atestado: { label: "Atestado", color: "bg-indigo-100 text-indigo-700" },
  radiografia: { label: "Radiografia / Imagem", color: "bg-purple-100 text-purple-700" },
  exame: { label: "Exame Laboratorial", color: "bg-cyan-100 text-cyan-700" },
  orcamento: { label: "Orçamento", color: "bg-green-100 text-green-700" },
  termo_consentimento: { label: "Termo de Consentimento", color: "bg-blue-100 text-blue-700" },
  contrato: { label: "Contrato", color: "bg-orange-100 text-orange-700" },
  laudo: { label: "Laudo Médico", color: "bg-amber-100 text-amber-700" },
  outro: { label: "Outro", color: "bg-slate-100 text-slate-700" },
};

function fileIcon(url) {
  if (!url) return <File className="w-5 h-5 text-slate-400" />;
  if (/\.(jpg|jpeg|png|gif|webp)/i.test(url)) return <Image className="w-5 h-5 text-blue-400" />;
  return <FileText className="w-5 h-5 text-rose-400" />;
}

export default function PatientDocumentVault({ patient }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ document_type: "receita", title: "", notes: "", file_url: "", date: format(new Date(), "yyyy-MM-dd") });

  const { data: documents = [] } = useQuery({
    queryKey: ["patient-docs", patient.id],
    queryFn: () => primeos.entities.Document.filter({ patient_id: patient.id }, "-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => primeos.entities.Document.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-docs", patient.id] });
      setShowForm(false);
      setForm({ document_type: "receita", title: "", notes: "", file_url: "", date: format(new Date(), "yyyy-MM-dd") });
      toast.success("Documento salvo!");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => primeos.entities.Document.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["patient-docs", patient.id] })
  });

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await primeos.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, file_url, title: prev.title || file.name }));
    setUploading(false);
    toast.success("Arquivo carregado!");
  };

  const handleSave = () => {
    if (!form.title) return toast.error("Informe um título");
    createMutation.mutate({
      ...form,
      patient_id: patient.id,
      patient_name: patient.patient_name,
      status: "arquivado",
      content: form.notes,
    });
  };

  const grouped = documents.reduce((acc, d) => {
    const type = d.document_type || "outro";
    if (!acc[type]) acc[type] = [];
    acc[type].push(d);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{documents.length} documento{documents.length !== 1 ? "s" : ""} arquivado{documents.length !== 1 ? "s" : ""}</p>
        <Button size="sm" onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-1" />Novo Documento
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
          <Upload className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">Nenhum documento arquivado</p>
          <Button variant="ghost" size="sm" className="mt-2 text-indigo-600" onClick={() => setShowForm(true)}>Fazer upload</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([type, docs]) => {
            const cfg = DOC_TYPES[type] || DOC_TYPES.outro;
            return (
              <div key={type}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{cfg.label}</p>
                <div className="space-y-2">
                  {docs.map(doc => (
                    <div key={doc.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 group">
                      <div className="flex-shrink-0">{fileIcon(doc.file_url)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{doc.title}</p>
                        <p className="text-xs text-slate-400">
                          {doc.date ? format(new Date(doc.date), "dd/MM/yyyy", { locale: ptBR }) : "—"}
                          {doc.content && ` · ${doc.content.slice(0, 50)}${doc.content.length > 50 ? "..." : ""}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {doc.file_url && (
                          <>
                            <Button size="icon" variant="ghost" className="h-7 w-7" asChild>
                              <a href={doc.file_url} target="_blank"><Eye className="w-3.5 h-3.5" /></a>
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7" asChild>
                              <a href={doc.file_url} download><Download className="w-3.5 h-3.5" /></a>
                            </Button>
                          </>
                        )}
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => confirm("Excluir documento?") && deleteMutation.mutate(doc.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Novo Documento — {patient.patient_name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo *</Label>
                <Select value={form.document_type} onValueChange={v => setForm(p => ({ ...p, document_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(DOC_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Data</Label>
                <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Título *</Label>
              <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Ex: Receita Amoxicilina 500mg" />
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="Detalhes adicionais..." />
            </div>
            <div>
              <Label>Arquivo (PDF, Imagem)</Label>
              <div className={cn("mt-1 border-2 border-dashed rounded-lg p-4 text-center transition-colors", form.file_url ? "border-emerald-300 bg-emerald-50" : "border-slate-200 hover:border-indigo-300")}>
                {form.file_url ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-600">
                    <FileText className="w-5 h-5" />
                    <span className="text-sm font-medium">Arquivo carregado com sucesso</span>
                  </div>
                ) : uploading ? (
                  <div className="flex items-center justify-center gap-2 text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Carregando...</span>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <p className="text-sm text-slate-500">Clique para selecionar ou arraste o arquivo</p>
                    <p className="text-xs text-slate-400 mt-1">PDF, PNG, JPG até 10MB</p>
                    <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={handleUpload} />
                  </label>
                )}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={handleSave} disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Salvar Documento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
