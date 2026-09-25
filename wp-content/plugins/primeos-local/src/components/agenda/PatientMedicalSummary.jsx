// @ts-nocheck
import { useState, useEffect } from "react";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  AlertCircle, 
  Pill, 
  Activity, 
  FileText, 
  RefreshCw,
  Save,
  Loader2,
  Calendar
} from "lucide-react";
import { toast } from "sonner";

export default function PatientMedicalSummary({ patientId, appointmentId }) {
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (patientId) {
      loadMedicalRecord();
    }
  }, [patientId]);

  const loadMedicalRecord = async () => {
    try {
      setLoading(true);
      const records = await primeos.entities.MedicalRecord.filter({
        patient_id: patientId
      });
      
      if (records.length > 0) {
        setMedicalRecord(records[0]);
      }
    } catch (error) {
      console.error("Erro ao carregar prontuário:", error);
    } finally {
      setLoading(false);
    }
  };

  const syncWithEHR = async () => {
    try {
      setSyncing(true);
      const response = await primeos.functions.invoke('syncPatientEHR', {
        patient_id: patientId
      });
      
      if (response.data.success) {
        toast.success("Dados sincronizados com EHR");
        await loadMedicalRecord();
      }
    } catch (error) {
      toast.error("Erro ao sincronizar com EHR");
      console.error(error);
    } finally {
      setSyncing(false);
    }
  };

  const saveNotesToEHR = async () => {
    try {
      setSaving(true);
      const response = await primeos.functions.invoke('saveNotesToEHR', {
        appointment_id: appointmentId,
        notes: notes
      });
      
      if (response.data.success) {
        toast.success("Notas salvas no EHR com sucesso");
        setNotes("");
      }
    } catch (error) {
      toast.error("Erro ao salvar notas no EHR");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
          <p className="text-sm text-gray-500 mt-2">Carregando histórico médico...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">Histórico Médico do Paciente</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={syncWithEHR}
            disabled={syncing}
          >
            {syncing ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Sincronizar EHR
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {medicalRecord ? (
            <>
              {/* Alergias */}
              {medicalRecord.allergies && medicalRecord.allergies.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <Label className="font-semibold text-red-700">Alergias</Label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {medicalRecord.allergies.map((allergy, idx) => (
                      <Badge key={idx} variant="destructive">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Condições Crônicas */}
              {medicalRecord.chronic_conditions && medicalRecord.chronic_conditions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-orange-500" />
                    <Label className="font-semibold">Condições Crônicas</Label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {medicalRecord.chronic_conditions.map((condition, idx) => (
                      <Badge key={idx} className="bg-orange-100 text-orange-700">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Medicações */}
              {medicalRecord.medications && medicalRecord.medications.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Pill className="w-4 h-4 text-blue-500" />
                    <Label className="font-semibold">Medicações em Uso</Label>
                  </div>
                  <div className="space-y-2">
                    {medicalRecord.medications.map((med, idx) => (
                      <div key={idx} className="bg-blue-50 p-3 rounded-lg">
                        <p className="font-medium text-blue-900">{med.name}</p>
                        <p className="text-sm text-blue-700">
                          {med.dosage} - {med.frequency}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Procedimentos Anteriores */}
              {medicalRecord.past_procedures && medicalRecord.past_procedures.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-green-500" />
                    <Label className="font-semibold">Procedimentos Anteriores</Label>
                  </div>
                  <div className="space-y-2">
                    {medicalRecord.past_procedures.slice(0, 5).map((proc, idx) => (
                      <div key={idx} className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-green-900">{proc.procedure}</p>
                            {proc.tooth && (
                              <p className="text-sm text-green-700">Dente: {proc.tooth}</p>
                            )}
                            {proc.notes && (
                              <p className="text-sm text-gray-600 mt-1">{proc.notes}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {new Date(proc.date).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {medicalRecord.last_ehr_sync && (
                <p className="text-xs text-gray-500 text-center pt-2 border-t">
                  Última sincronização: {new Date(medicalRecord.last_ehr_sync).toLocaleString('pt-BR')}
                </p>
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">Nenhum histórico médico encontrado</p>
              <Button onClick={syncWithEHR} disabled={syncing}>
                {syncing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Importar do EHR
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Adicionar Notas da Consulta */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notas da Consulta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Digite as observações e achados clínicos desta consulta..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
          <Button 
            onClick={saveNotesToEHR}
            disabled={!notes.trim() || saving}
            className="w-full"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar no EHR
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
