// @ts-nocheck
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { primeos } from "@/api/primeosClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Upload, Trash2, Plus, ExternalLink, Loader2, File, Image } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const DOC_TYPES = [
  { value: "exame", label: "Exame" },
  { value: "receita", label: "Receita" },
  { value: "laudo", label: "Laudo" },
  { value: "radiografia", label: "Radiografia" },
  { value: "termo_consentimento", label: "Termo de Consentimento" },
  { value: "atestado", label: "Atestado" },
  { value: "outro", label: "Outro" },
];

const TYPE_COLORS = {
  exame: "bg-blue-100 text-blue-700",
  receita: "bg-purple-100 text-purple-700",
  laudo: "bg-teal-100 text-teal-700",
  radiografia: "bg-orange-100 text-orange-700",
  termo_consentimento: "bg-indigo-100 text-indigo-700",
  atestado: "bg-green-100 text-green-700",
  outro: "bg-slate-100 text-slate-600",
};

function FileIcon({ url }) {
  if (!url) return <File className="w-5 h-5 text-slate-400" />;
  if (/\.(jpg|jpeg|png|webp|gif)$/i.test(url)) return <Image className="w-5 h-5 text-blue-400" />;
  return <FileText className="w-5 h-5 text-rose-400" />;
}

export default function PatientRecordDocuments({ patient, onUpdate }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: "", type: "exame", date: new Date().toISOString().split("T")[0], notes: "", file_url: "" });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const updateMutation = useMutation({
    mutationFn: (docs) => primeos.entities.PatientRecord.update(patient.id, { documents: docs }),
    onSuccess: (_, docs) => {
      qc.invalidateQueries(["patients"]);
      onUpdate?.({ ...patient, documents: docs });
      toast.success("Documento salvo!");
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await primeos.integrations.Core.UploadFile({ file });
    set("file_url", file_url);
    if (!form.name) set("name", file.name.replace(/\.[^/.]+$/, ""));
    setUploading(false);
  };

  const handleAdd = () => {
    if (!form.name) return toast.error("Informe o nome do documento");
    const newDocs = [...(patient.documents || []), { ...form }];
    updateMutation.mutate(newDocs);
    setForm({ name: "", type: "exame", date: new Date().toISOString().split("T")[0], notes: "", file_url: "" });
    setShowForm(false);
  };

  const handleDelete = (idx) => {
    if (!confirm("Remover este documento?")) return;
    const newDocs = (patient.documents || []).filter((_, i) => i !== idx);
    updateMutation.mutate(newDocs);
  };

  const docs = patient.documents || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{docs.length} documento(s) anexado(s)</p>
        <Button size="sm" onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-1.5">
          <Plus className="w-4 h-4" /> Adicionar Documento
        </Button>
      </div>

      {docs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2 border-2 border-dashed border-slate-200 rounded-xl">
          <FileText className="w-8 h-8" />
          <p className="text-sm">Nenhum documento anexado</p>
          <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>Adicionar primeiro documento</Button>
        </div>
      )}

      <div className="space-y-2">
        {docs.map((doc, idx) => (
          <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:border-slate-200 transition-colors">
            <FileIcon url={doc.file_url} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-sm text-slate-900 truncate">{doc.name}</p>
                <Badge className={`text-xs ${TYPE_COLORS[doc.type] || TYPE_COLORS.outro}`}>
                  {DOC_TYPES.find(t => t.value === doc.type)?.label || doc.type}
                </Badge>
              </div>
              {doc.date && <p className="text-xs text-slate-400 mt-0.5">{format(new Date(doc.date), "dd/MM/yyyy", { locale: ptBR })}</p>}
              {doc.notes && <p className="text-xs text-slate-500 truncate">{doc.notes}</p>}
            </div>
            <div className="flex gap-1 flex-shrink-0">
              {doc.file_url && (
                <Button size="icon" variant="ghost" className="h-8 w-8 text-indigo-500 hover:bg-indigo-50" asChild>
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4" /></a>
                </Button>
              )}
              <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:bg-red-50" onClick={() => handleDelete(idx)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Adicionar Documento</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Arquivo</Label>
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors">
                <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf,.doc,.docx" />
                {uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                ) : form.file_url ? (
                  <p className="text-xs text-emerald-600 font-medium">✓ Arquivo carregado</p>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-slate-400 mb-1" />
                    <p className="text-xs text-slate-500">Clique para fazer upload</p>
                  </>
                )}
              </label>
            </div>
            <div>
              <Label>Nome do Documento</Label>
              <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Ex: Radiografia panorâmica" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={v => set("type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DOC_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Data</Label>
                <Input type="date" value={form.date} onChange={e => set("date", e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} placeholder="Opcional..." />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={handleAdd} disabled={updateMutation.isPending || uploading}>
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
