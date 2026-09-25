// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pill, Plus, Trash2, X, Printer, PlusCircle, MinusCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const emptyMed = { name: "", dosage: "", frequency: "", duration: "", instructions: "" };

export default function PatientPrescriptions({ patient, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [medications, setMedications] = useState([{ ...emptyMed }]);
  const [prescribingDoctor, setPrescribingDoctor] = useState("");
  const [notes, setNotes] = useState("");
  const queryClient = useQueryClient();

  const prescriptions = patient.prescriptions || [];

  const saveMutation = useMutation({
    mutationFn: async (newPrescription) => {
      const updated = [newPrescription, ...prescriptions];
      return primeos.entities.PatientRecord.update(patient.id, { prescriptions: updated });
    },
    onSuccess: (data) => {
      onUpdate(data);
      setShowForm(false);
      setMedications([{ ...emptyMed }]);
      setPrescribingDoctor("");
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (index) => {
      const updated = prescriptions.filter((_, i) => i !== index);
      return primeos.entities.PatientRecord.update(patient.id, { prescriptions: updated });
    },
    onSuccess: (data) => onUpdate(data),
  });

  const handleMedChange = (index, field, value) => {
    setMedications(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate({
      date: new Date().toISOString().split("T")[0],
      prescribing_doctor: prescribingDoctor,
      medications: medications.filter(m => m.name.trim()),
      notes,
    });
  };

  const handlePrint = (prescription) => {
    const meds = prescription.medications.map(m =>
      `• ${m.name}${m.dosage ? ` - ${m.dosage}` : ""}${m.frequency ? ` | ${m.frequency}` : ""}${m.duration ? ` por ${m.duration}` : ""}${m.instructions ? `\n  Instrução: ${m.instructions}` : ""}`
    ).join("\n");
    const win = window.open("", "_blank");
    win.document.write(`<pre style="font-family:Arial;padding:40px;max-width:600px;margin:auto;">
PRESCRIÇÃO MÉDICA
Paciente: ${patient.patient_name}
Data: ${format(new Date(prescription.date), "dd/MM/yyyy", { locale: ptBR })}
Médico: ${prescription.prescribing_doctor || "—"}
\n${meds}${prescription.notes ? `\n\nObservações: ${prescription.notes}` : ""}
</pre>`);
    win.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{prescriptions.length} prescrição(ões) registrada(s)</p>
        <Button size="sm" onClick={() => setShowForm(!showForm)} variant="outline" className="gap-1.5">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancelar" : "Nova Prescrição"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
          <div>
            <Label>Médico Prescritor</Label>
            <Input value={prescribingDoctor} onChange={e => setPrescribingDoctor(e.target.value)} placeholder="Dr(a). Nome..." />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Medicamentos</Label>
              <Button type="button" variant="ghost" size="sm" className="text-blue-600 gap-1" onClick={() => setMedications(p => [...p, { ...emptyMed }])}>
                <PlusCircle className="w-4 h-4" /> Adicionar
              </Button>
            </div>
            {medications.map((med, i) => (
              <div key={i} className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Medicamento {i + 1}</span>
                  {medications.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => setMedications(p => p.filter((_, idx) => idx !== i))}>
                      <MinusCircle className="w-4 h-4 text-red-400" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Nome do medicamento *" value={med.name} onChange={e => handleMedChange(i, "name", e.target.value)} required />
                  <Input placeholder="Dosagem (ex: 500mg)" value={med.dosage} onChange={e => handleMedChange(i, "dosage", e.target.value)} />
                  <Input placeholder="Frequência (ex: 2x ao dia)" value={med.frequency} onChange={e => handleMedChange(i, "frequency", e.target.value)} />
                  <Input placeholder="Duração (ex: 7 dias)" value={med.duration} onChange={e => handleMedChange(i, "duration", e.target.value)} />
                  <Input className="col-span-2" placeholder="Instruções especiais" value={med.instructions} onChange={e => handleMedChange(i, "instructions", e.target.value)} />
                </div>
              </div>
            ))}
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Orientações adicionais..." />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" size="sm" disabled={saveMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
              {saveMutation.isPending ? "Salvando..." : "Salvar Prescrição"}
            </Button>
          </div>
        </form>
      )}

      {prescriptions.length === 0 && !showForm ? (
        <div className="text-center py-8 text-slate-500">
          <Pill className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p>Nenhuma prescrição registrada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {prescriptions.map((presc, i) => (
            <div key={i} className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-slate-800">Prescrição de {presc.date ? format(new Date(presc.date), "dd/MM/yyyy", { locale: ptBR }) : "—"}</p>
                  {presc.prescribing_doctor && <p className="text-xs text-slate-500">{presc.prescribing_doctor}</p>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handlePrint(presc)} title="Imprimir">
                    <Printer className="w-3.5 h-3.5 text-blue-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteMutation.mutate(i)}>
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {(presc.medications || []).map((med, j) => (
                  <div key={j} className="flex items-center gap-2 flex-wrap text-sm">
                    <Pill className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <span className="font-medium text-slate-800">{med.name}</span>
                    {med.dosage && <Badge className="bg-blue-50 text-blue-700 text-xs">{med.dosage}</Badge>}
                    {med.frequency && <span className="text-slate-500">{med.frequency}</span>}
                    {med.duration && <span className="text-slate-400">• {med.duration}</span>}
                  </div>
                ))}
              </div>
              {presc.notes && <p className="text-xs text-slate-500 mt-2 italic">{presc.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
