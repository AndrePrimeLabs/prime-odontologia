// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mail, Phone, Calendar, Heart, CreditCard, Briefcase, MapPin,
  Users, Shield, AlertTriangle, User
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

function InfoRow({ icon: Icon, label, value, highlight }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
      <Icon className={cn("w-4 h-4 mt-0.5 flex-shrink-0", highlight ? "text-red-500" : "text-slate-400")} />
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className={cn("text-sm font-medium", highlight ? "text-red-600" : "text-slate-800")}>{value}</p>
      </div>
    </div>
  );
}

export default function PatientProfileCard({ patient }) {
  const age = patient.date_of_birth
    ? Math.floor((new Date() - new Date(patient.date_of_birth)) / (365.25 * 24 * 3600 * 1000))
    : null;

  const address = patient.address
    ? [patient.address.street, patient.address.number, patient.address.complement,
       patient.address.neighborhood, patient.address.city, patient.address.state]
        .filter(Boolean).join(", ")
    : null;

  const statusColors = {
    ativo: "bg-emerald-100 text-emerald-700",
    inativo: "bg-slate-100 text-slate-600",
    arquivado: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="space-y-4">
      {/* Identity */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><User className="w-4 h-4" />Dados Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-3 mb-3 pb-3 border-b">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
              {patient.patient_name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{patient.patient_name}</h3>
              <Badge className={cn("text-xs", statusColors[patient.status] || statusColors.ativo)}>
                {patient.status || "ativo"}
              </Badge>
              {patient.gender && <p className="text-xs text-slate-400 mt-0.5">{patient.gender}</p>}
            </div>
          </div>
          <InfoRow icon={Mail} label="Email" value={patient.patient_email} />
          <InfoRow icon={Phone} label="Telefone" value={patient.patient_phone} />
          <InfoRow icon={Calendar} label="Nascimento" value={
            patient.date_of_birth
              ? `${format(new Date(patient.date_of_birth), "dd/MM/yyyy", { locale: ptBR })}${age ? ` (${age} anos)` : ""}`
              : null
          } />
          <InfoRow icon={CreditCard} label="CPF" value={patient.cpf} />
          <InfoRow icon={Briefcase} label="Profissão" value={patient.occupation} />
          <InfoRow icon={MapPin} label="Endereço" value={address} />
          <InfoRow icon={Heart} label="Tipo Sanguíneo" value={patient.blood_type !== "Não informado" ? patient.blood_type : null} highlight />
        </CardContent>
      </Card>

      {/* Allergies Alert */}
      {patient.allergies?.length > 0 && (
        <Card className="border-0 shadow-sm border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <p className="text-sm font-semibold text-red-700">Alergias Registradas</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {patient.allergies.map((a, i) => (
                <Badge key={i} className={cn(
                  "text-xs",
                  a.severity === "grave" ? "bg-red-100 text-red-700" :
                  a.severity === "moderada" ? "bg-orange-100 text-orange-700" : "bg-yellow-100 text-yellow-700"
                )}>
                  ⚠ {a.allergen} ({a.severity})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emergency Contact */}
      {patient.emergency_contact?.name && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Users className="w-4 h-4" />Contato de Emergência</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-1">
            <p className="text-sm font-medium text-slate-800">{patient.emergency_contact.name}</p>
            {patient.emergency_contact.relationship && (
              <p className="text-xs text-slate-500">{patient.emergency_contact.relationship}</p>
            )}
            {patient.emergency_contact.phone && (
              <a href={`tel:${patient.emergency_contact.phone}`} className="text-sm text-indigo-600 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />{patient.emergency_contact.phone}
              </a>
            )}
          </CardContent>
        </Card>
      )}

      {/* Insurance */}
      {patient.insurance_info?.has_insurance && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-600" />Plano de Saúde</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-1">
            {patient.insurance_info.provider && (
              <p className="text-sm font-medium text-slate-800">{patient.insurance_info.provider}</p>
            )}
            {patient.insurance_info.policy_number && (
              <p className="text-xs text-slate-500">Carteirinha: {patient.insurance_info.policy_number}</p>
            )}
            {patient.insurance_info.coverage_percentage && (
              <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                {patient.insurance_info.coverage_percentage}% de cobertura
              </Badge>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
