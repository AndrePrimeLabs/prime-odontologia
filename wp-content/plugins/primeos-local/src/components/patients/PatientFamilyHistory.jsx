// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Trash2, X } from "lucide-react";

const RELATIONS = ["pai", "mãe", "irmão", "irmã", "avô paterno", "avó paterna", "avô materno", "avó materna", "filho", "filha", "tio", "tia"];
const CONDITIONS = [
  "Diabetes", "Hipertensão", "Doenças cardíacas", "Câncer", "Doença renal",
  "Osteoporose", "Asma", "Doença autoimune", "Transtorno mental", "AVC", "Outra"
];
const severityColors = { leve: "bg-green-100 text-green-700", moderada: "bg-yellow-100 text-yellow-700", grave: "bg-red-100 text-red-700" };

export default function PatientFamilyHistory({ patient, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ relation: "", condition: "", custom_condition: "", notes: "", severity: "moderada" });
  const queryClient = useQueryClient();

  const familyHistory = patient.family_history || [];

  const saveMutation = useMutation({
    mutationFn: async (entry) => {
      const updated = [...familyHistory, entry];
      return primeos.entities.PatientRecord.update(patient.id, { family_history: updated });
    },
    onSuccess: (data) => { onUpdate(data); setShowForm(false); setForm({ relation: "", condition: "", custom_condition: "", notes: "", severity: "moderada" }); queryClient.invalidateQueries({ queryKey: ["patients"] }); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (index) => {
      const updated = familyHistory.filter((_, i) => i !== index);
      return primeos.entities.PatientRecord.update(patient.id, { family_history: updated });
    },
    onSuccess: (data) => onUpdate(data),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const condition = form.condition === "Outra" ? form.custom_condition : form.condition;
    saveMutation.mutate({ relation: form.relation, condition, notes: form.notes, severity: form.severity });
  };

  // Group by relation
  const grouped = familyHistory.reduce((acc, item) => {
    if (!acc[item.relation]) acc[item.relation] = [];
    acc[item.relation].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{familyHistory.length} registro(s) familiar(es)</p>
        <Button size="sm" onClick={() => setShowForm(!showForm)} variant="outline" className="gap-1.5">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancelar" : "Adicionar"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Familiar</Label>
              <Select value={form.relation} onValueChange={v => setForm(p => ({ ...p, relation: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>{RELATIONS.map(r => <SelectItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Condição</Label>
              <Select value={form.condition} onValueChange={v => setForm(p => ({ ...p, condition: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>{CONDITIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {form.condition === "Outra" && (
              <div className="col-span-2">
                <Label>Especifique a condição</Label>
                <Input value={form.custom_condition} onChange={e => setForm(p => ({ ...p, custom_condition: e.target.value }))} placeholder="Descreva a condição..." />
              </div>
            )}
            <div>
              <Label>Gravidade</Label>
              <Select value={form.severity} onValueChange={v => setForm(p => ({ ...p, severity: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="leve">Leve</SelectItem>
                  <SelectItem value="moderada">Moderada</SelectItem>
                  <SelectItem value="grave">Grave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Observações</Label>
              <Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Observações adicionais..." />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" size="sm" disabled={saveMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
              {saveMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      )}

      {familyHistory.length === 0 && !showForm ? (
        <div className="text-center py-8 text-slate-500">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p>Nenhum histórico familiar registrado</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([relation, items]) => (
            <div key={relation} className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
              <p className="font-semibold text-slate-700 capitalize mb-2">{relation}</p>
              <div className="space-y-2">
                {items.map((item, i) => {
                  const originalIndex = familyHistory.indexOf(item);
                  return (
                    <div key={i} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-slate-800">{item.condition}</span>
                        <Badge className={severityColors[item.severity] || "bg-slate-100 text-slate-700"}>{item.severity}</Badge>
                        {item.notes && <span className="text-xs text-slate-400">{item.notes}</span>}
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => deleteMutation.mutate(originalIndex)}>
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
