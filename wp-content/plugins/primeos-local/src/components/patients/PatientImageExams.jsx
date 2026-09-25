// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, ImageIcon, Eye, Trash2, Plus, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const examTypes = ["panorâmica", "periapical", "bite-wing", "cefalométrica", "tomografia"];

export default function PatientImageExams({ patient, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({ date: "", type: "", findings: "", file: null });
  const queryClient = useQueryClient();

  const xRays = patient.x_rays || [];

  const saveMutation = useMutation({
    mutationFn: async (newExam) => {
      const updated = [...xRays, newExam];
      return primeos.entities.PatientRecord.update(patient.id, { x_rays: updated });
    },
    onSuccess: (data) => {
      onUpdate(data);
      setShowForm(false);
      setFormData({ date: "", type: "", findings: "", file: null });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (index) => {
      const updated = xRays.filter((_, i) => i !== index);
      return primeos.entities.PatientRecord.update(patient.id, { x_rays: updated });
    },
    onSuccess: (data) => onUpdate(data),
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData(prev => ({ ...prev, file }));
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    let file_url = "";
    if (formData.file) {
      const res = await primeos.integrations.Core.UploadFile({ file: formData.file });
      file_url = res.file_url;
    }
    setUploading(false);
    saveMutation.mutate({ date: formData.date, type: formData.type, findings: formData.findings, file_url });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{xRays.length} exame(s) registrado(s)</p>
        <Button size="sm" onClick={() => setShowForm(!showForm)} variant="outline" className="gap-1.5">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancelar" : "Adicionar Exame"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data do Exame</Label>
              <Input type="date" value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} required />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={formData.type} onValueChange={v => setFormData(p => ({ ...p, type: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {examTypes.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Arquivo (imagem/PDF)</Label>
            <div className="mt-1 border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors" onClick={() => document.getElementById("exam-file-input").click()}>
              {previewUrl ? (
                <img src={previewUrl} alt="preview" className="max-h-32 mx-auto rounded-lg object-contain" />
              ) : (
                <div className="text-slate-400">
                  <Upload className="w-8 h-8 mx-auto mb-1" />
                  <p className="text-sm">Clique para selecionar ou arraste o arquivo</p>
                </div>
              )}
              <input id="exam-file-input" type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />
            </div>
          </div>
          <div>
            <Label>Laudo / Achados</Label>
            <Textarea value={formData.findings} onChange={e => setFormData(p => ({ ...p, findings: e.target.value }))} rows={2} placeholder="Descreva os achados do exame..." />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" size="sm" disabled={uploading || saveMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
              {(uploading || saveMutation.isPending) ? <><Loader2 className="w-4 h-4 animate-spin mr-1" />Salvando...</> : "Salvar Exame"}
            </Button>
          </div>
        </form>
      )}

      {xRays.length === 0 && !showForm ? (
        <div className="text-center py-8 text-slate-500">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p>Nenhum exame de imagem registrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {xRays.map((exam, i) => (
            <div key={i} className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <Badge className="bg-indigo-100 text-indigo-700 mb-1">{exam.type}</Badge>
                  {exam.date && <p className="text-xs text-slate-500">{format(new Date(exam.date), "dd/MM/yyyy", { locale: ptBR })}</p>}
                </div>
                <div className="flex gap-1">
                  {exam.file_url && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => window.open(exam.file_url, "_blank")}>
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteMutation.mutate(i)}>
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </Button>
                </div>
              </div>
              {exam.file_url && exam.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                <img src={exam.file_url} alt={exam.type} className="w-full h-28 object-cover rounded-lg mb-2 cursor-pointer" onClick={() => window.open(exam.file_url, "_blank")} />
              )}
              {exam.findings && <p className="text-xs text-slate-600 line-clamp-2">{exam.findings}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
