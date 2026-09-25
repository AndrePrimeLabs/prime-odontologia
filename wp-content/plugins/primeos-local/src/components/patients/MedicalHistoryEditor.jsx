// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Pill, Activity, Stethoscope, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

const emptyAllergy = { allergen: "", severity: "leve", reaction: "" };
const emptyMed = { name: "", dosage: "", frequency: "", start_date: "", prescribing_doctor: "" };
const emptyCondition = "";
const emptyTreatment = { treatment: "", tooth_number: "", date: "", dentist: "", notes: "", cost: "" };

export default function MedicalHistoryEditor({ patient, onUpdate }) {
  const queryClient = useQueryClient();

  const [allergies, setAllergies] = useState(patient.allergies || []);
  const [medications, setMedications] = useState(patient.current_medications || []);
  const [conditions, setConditions] = useState(patient.medical_conditions || []);
  const [treatments, setTreatments] = useState(patient.past_treatments || []);
  const [newCondition, setNewCondition] = useState("");

  const saveMutation = useMutation({
    mutationFn: (data) => primeos.entities.PatientRecord.update(patient.id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      onUpdate?.(updated);
      toast.success("Histórico médico salvo!");
    }
  });

  const save = () => {
    saveMutation.mutate({
      ...patient,
      allergies,
      current_medications: medications,
      medical_conditions: conditions,
      past_treatments: treatments.map(t => ({ ...t, cost: t.cost ? Number(t.cost) : undefined })),
    });
  };

  // --- Allergies ---
  const addAllergy = () => setAllergies(prev => [...prev, { ...emptyAllergy }]);
  const updateAllergy = (i, field, value) => setAllergies(prev => prev.map((a, idx) => idx === i ? { ...a, [field]: value } : a));
  const removeAllergy = (i) => setAllergies(prev => prev.filter((_, idx) => idx !== i));

  // --- Medications ---
  const addMed = () => setMedications(prev => [...prev, { ...emptyMed }]);
  const updateMed = (i, field, value) => setMedications(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m));
  const removeMed = (i) => setMedications(prev => prev.filter((_, idx) => idx !== i));

  const CONDITION_PRESETS = ["Diabetes", "Hipertensão", "Cardiopatia", "Idoso", "Gestante", "Fumante", "Coagulação alterada", "HIV/AIDS", "Hepatite", "Asma", "Osteoporose"];

  // --- Conditions ---
  const addCondition = (val) => {
    const c = val || newCondition.trim();
    if (!c || conditions.includes(c)) return;
    setConditions(prev => [...prev, c]);
    setNewCondition("");
  };
  const removeCondition = (i) => setConditions(prev => prev.filter((_, idx) => idx !== i));

  // --- Treatments ---
  const addTreatment = () => setTreatments(prev => [...prev, { ...emptyTreatment }]);
  const updateTreatment = (i, field, value) => setTreatments(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: value } : t));
  const removeTreatment = (i) => setTreatments(prev => prev.filter((_, idx) => idx !== i));

  const severityColors = { leve: "bg-yellow-100 text-yellow-700", moderada: "bg-orange-100 text-orange-700", grave: "bg-red-100 text-red-700" };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="allergies">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="allergies" className="flex items-center gap-1.5 text-xs">
            <AlertTriangle className="w-3.5 h-3.5" />Alergias ({allergies.length})
          </TabsTrigger>
          <TabsTrigger value="medications" className="flex items-center gap-1.5 text-xs">
            <Pill className="w-3.5 h-3.5" />Medicamentos ({medications.length})
          </TabsTrigger>
          <TabsTrigger value="conditions" className="flex items-center gap-1.5 text-xs">
            <Activity className="w-3.5 h-3.5" />Condições ({conditions.length})
          </TabsTrigger>
          <TabsTrigger value="treatments" className="flex items-center gap-1.5 text-xs">
            <Stethoscope className="w-3.5 h-3.5" />Tratamentos ({treatments.length})
          </TabsTrigger>
        </TabsList>

        {/* ALLERGIES */}
        <TabsContent value="allergies" className="space-y-3 pt-3">
          {allergies.map((a, i) => (
            <div key={i} className="p-3 bg-red-50 rounded-lg border border-red-100 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Alérgeno *</Label>
                  <Input value={a.allergen} onChange={e => updateAllergy(i, "allergen", e.target.value)} placeholder="Ex: Penicilina" className="text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Severidade</Label>
                  <Select value={a.severity} onValueChange={v => updateAllergy(i, "severity", v)}>
                    <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leve">Leve</SelectItem>
                      <SelectItem value="moderada">Moderada</SelectItem>
                      <SelectItem value="grave">Grave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="ghost" size="sm" onClick={() => removeAllergy(i)} className="text-red-500 hover:text-red-700 hover:bg-red-100 w-full">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-xs">Reação</Label>
                <Input value={a.reaction} onChange={e => updateAllergy(i, "reaction", e.target.value)} placeholder="Ex: Urticária, anafilaxia..." className="text-sm" />
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addAllergy} className="w-full border-dashed border-red-300 text-red-600 hover:bg-red-50">
            <Plus className="w-4 h-4 mr-1" />Adicionar Alergia
          </Button>
        </TabsContent>

        {/* MEDICATIONS */}
        <TabsContent value="medications" className="space-y-3 pt-3">
          {medications.map((m, i) => (
            <div key={i} className="p-3 bg-blue-50 rounded-lg border border-blue-100 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Medicamento *</Label>
                  <Input value={m.name} onChange={e => updateMed(i, "name", e.target.value)} placeholder="Ex: Amoxicilina" className="text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Dosagem</Label>
                  <Input value={m.dosage} onChange={e => updateMed(i, "dosage", e.target.value)} placeholder="Ex: 500mg" className="text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Frequência</Label>
                  <Input value={m.frequency} onChange={e => updateMed(i, "frequency", e.target.value)} placeholder="Ex: 8/8h" className="text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Início</Label>
                  <Input type="date" value={m.start_date} onChange={e => updateMed(i, "start_date", e.target.value)} className="text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Médico Prescritor</Label>
                  <Input value={m.prescribing_doctor} onChange={e => updateMed(i, "prescribing_doctor", e.target.value)} className="text-sm" />
                </div>
                <div className="flex items-end">
                  <Button variant="ghost" size="sm" onClick={() => removeMed(i)} className="text-red-500 hover:text-red-700 hover:bg-red-100 w-full">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addMed} className="w-full border-dashed border-blue-300 text-blue-600 hover:bg-blue-50">
            <Plus className="w-4 h-4 mr-1" />Adicionar Medicamento
          </Button>
        </TabsContent>

        {/* CONDITIONS */}
        <TabsContent value="conditions" className="space-y-3 pt-3">
          <div className="flex gap-2">
            <Input
              value={newCondition}
              onChange={e => setNewCondition(e.target.value)}
              placeholder="Ex: Diabetes, Hipertensão..."
              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCondition())}
            />
            <Button onClick={() => addCondition()} className="bg-amber-600 hover:bg-amber-700">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5 pb-1">
            <span className="text-xs text-slate-400 w-full">Clique para adicionar rapidamente:</span>
            {CONDITION_PRESETS.filter(p => !conditions.includes(p)).map(p => (
              <button key={p} onClick={() => addCondition(p)}
                className="text-xs px-2 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors">
                + {p}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {conditions.map((c, i) => (
              <Badge key={i} className="bg-amber-100 text-amber-700 border border-amber-200 pr-1 pl-3 py-1 flex items-center gap-1">
                {c}
                <button onClick={() => removeCondition(i)} className="ml-1 hover:text-red-600">
                  <Trash2 className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {conditions.length === 0 && <p className="text-sm text-slate-400">Nenhuma condição registrada</p>}
          </div>
        </TabsContent>

        {/* TREATMENTS */}
        <TabsContent value="treatments" className="space-y-3 pt-3">
          {treatments.map((t, i) => (
            <div key={i} className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Tratamento *</Label>
                  <Input value={t.treatment} onChange={e => updateTreatment(i, "treatment", e.target.value)} placeholder="Ex: Extração, Canal..." className="text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Dente Nº</Label>
                  <Input value={t.tooth_number} onChange={e => updateTreatment(i, "tooth_number", e.target.value)} placeholder="Ex: 36" className="text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Data</Label>
                  <Input type="date" value={t.date} onChange={e => updateTreatment(i, "date", e.target.value)} className="text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Dentista</Label>
                  <Input value={t.dentist} onChange={e => updateTreatment(i, "dentist", e.target.value)} className="text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Custo (R$)</Label>
                  <Input type="number" value={t.cost} onChange={e => updateTreatment(i, "cost", e.target.value)} className="text-sm" />
                </div>
                <div className="flex items-end">
                  <Button variant="ghost" size="sm" onClick={() => removeTreatment(i)} className="text-red-500 hover:text-red-700 hover:bg-red-100 w-full">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-xs">Observações</Label>
                <Input value={t.notes} onChange={e => updateTreatment(i, "notes", e.target.value)} placeholder="Detalhes do tratamento..." className="text-sm" />
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addTreatment} className="w-full border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50">
            <Plus className="w-4 h-4 mr-1" />Adicionar Tratamento
          </Button>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end pt-2 border-t">
        <Button onClick={save} disabled={saveMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" />
          {saveMutation.isPending ? "Salvando..." : "Salvar Histórico"}
        </Button>
      </div>
    </div>
  );
}
