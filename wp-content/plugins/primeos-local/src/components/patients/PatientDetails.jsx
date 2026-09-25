// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Pencil,
  Brain,
} from "lucide-react";
import { useState, useEffect } from "react";
import PatientAIInsights from "@/components/patients/PatientAIInsights";
import PatientAppointmentHistory from "@/components/patients/PatientAppointmentHistory";
import PatientImageExams from "@/components/patients/PatientImageExams";
import PatientFamilyHistory from "@/components/patients/PatientFamilyHistory";
import PatientPrescriptions from "@/components/patients/PatientPrescriptions";
import PatientCheckup from "@/components/patients/PatientCheckup";
import MedicalHistoryEditor from "@/components/patients/MedicalHistoryEditor";
import PatientDocumentVault from "@/components/patients/PatientDocumentVault";
import PatientRecordDocuments from "@/components/patients/PatientRecordDocuments";
import PatientProfileCard from "@/components/patients/PatientProfileCard";

export default function PatientDetails({ patient: initialPatient, onBack, onEdit }) {
  const [patient, setPatient] = useState(initialPatient);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchProfile() {
      if (!initialPatient || !initialPatient.id) return;
      setLoadingProfile(true);
      try {
        const res = await fetch(`/patients/${initialPatient.id}/profile`);
        if (!res.ok) {
          // Try proxied api-server path
          const res2 = await fetch(`/api/patients/${initialPatient.id}/profile`);
          if (res2.ok) {
            const json = await res2.json();
            if (!cancelled) setPatient((p) => ({ ...p, ... (json.profile?.patient || json.profile || json) }));
          }
        } else {
          const json = await res.json();
          if (!cancelled) setPatient((p) => ({ ...p, ... (json.profile?.patient || json.profile || json) }));
        }
      } catch (err) {
        // ignore - leave initial patient data
        console.warn('Failed to fetch aggregated profile', err.message || err);
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    }
    fetchProfile();
    return () => { cancelled = true; };
  }, [initialPatient]);
  const age = patient.date_of_birth
    ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()
    : null;

  const getStatusColor = (status) => {
    switch (status) {
      case "ativo":
        return "bg-green-100 text-green-700 border-green-200";
      case "inativo":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "arquivado":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Pacientes
          </Button>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl">
                {patient.patient_name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  {patient.patient_name || "Sem nome"}
                </h1>
                <Badge className={getStatusColor(patient.status)}>
                  {patient.status || "ativo"}
                </Badge>
              </div>
            </div>
            <Button onClick={onEdit} className="bg-blue-600 hover:bg-blue-700">
              <Pencil className="w-4 h-4 mr-2" />
              Editar Paciente
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div>
            <PatientProfileCard patient={patient} />
          </div>

          {/* Right Column - Medical History */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Histórico Médico</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="appointments" className="w-full">
                  <TabsList className="flex flex-wrap gap-1 h-auto w-full mb-2">
                    <TabsTrigger value="appointments" className="text-xs">Consultas</TabsTrigger>
                    <TabsTrigger value="historico" className="text-xs">Histórico Médico</TabsTrigger>
                    <TabsTrigger value="documentos" className="text-xs">Documentos</TabsTrigger>
                    <TabsTrigger value="arquivos" className="text-xs">Arquivos</TabsTrigger>
                    <TabsTrigger value="prescriptions" className="text-xs">Prescrições</TabsTrigger>
                    <TabsTrigger value="checkup" className="text-xs">Check-up</TabsTrigger>
                    <TabsTrigger value="images" className="text-xs">Imagens</TabsTrigger>
                    <TabsTrigger value="family" className="text-xs">Família</TabsTrigger>
                    <TabsTrigger value="ai" className="text-xs flex items-center gap-1">
                      <Brain className="w-3 h-3 text-indigo-600" />IA
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="appointments" className="pt-4">
                    <PatientAppointmentHistory patient={patient} />
                  </TabsContent>

                  <TabsContent value="historico" className="pt-4">
                    <MedicalHistoryEditor patient={patient} onUpdate={setPatient} />
                  </TabsContent>

                  <TabsContent value="documentos" className="pt-4">
                    <PatientDocumentVault patient={patient} />
                  </TabsContent>

                  <TabsContent value="arquivos" className="pt-4">
                    <PatientRecordDocuments patient={patient} onUpdate={setPatient} />
                  </TabsContent>

                  <TabsContent value="prescriptions" className="pt-4">
                    <PatientPrescriptions patient={patient} onUpdate={setPatient} />
                  </TabsContent>

                  <TabsContent value="checkup" className="pt-4">
                    <PatientCheckup patient={patient} onUpdate={setPatient} />
                  </TabsContent>

                  <TabsContent value="images" className="pt-4">
                    <PatientImageExams patient={patient} onUpdate={setPatient} />
                  </TabsContent>

                  <TabsContent value="family" className="pt-4">
                    <PatientFamilyHistory patient={patient} onUpdate={setPatient} />
                  </TabsContent>

                  <TabsContent value="ai" className="pt-4">
                    <PatientAIInsights patient={patient} />
                  </TabsContent>
                </Tabs>

                {patient.notes && (
                  <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-500 mb-2">Observações Gerais</p>
                    <p className="text-sm text-slate-700">{patient.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
