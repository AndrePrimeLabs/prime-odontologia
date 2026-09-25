// @ts-nocheck
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Calendar, Pencil, Trash2, Eye, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PatientCard({ patient, onEdit, onDelete, onViewDetails }) {
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

  const age = patient.date_of_birth
    ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()
    : null;

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Patient Info */}
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {patient.patient_name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-slate-900 text-lg">
                  {patient.patient_name || "Sem nome"}
                </h3>
                <Badge className={getStatusColor(patient.status)}>
                  {patient.status || "ativo"}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
                {patient.patient_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{patient.patient_email}</span>
                  </div>
                )}
                {patient.patient_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{patient.patient_phone}</span>
                  </div>
                )}
                {patient.date_of_birth && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>
                      {format(new Date(patient.date_of_birth), "dd/MM/yyyy", { locale: ptBR })}
                      {age && ` (${age} anos)`}
                    </span>
                  </div>
                )}
                {patient.blood_type && patient.blood_type !== "Não informado" && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-slate-400" />
                    <span>Tipo Sanguíneo: {patient.blood_type}</span>
                  </div>
                )}
              </div>
              {patient.notes && (
                <p className="text-sm text-slate-500 mt-2 line-clamp-2">{patient.notes}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="icon"
              onClick={onViewDetails}
              className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onEdit}
              className="hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onDelete}
              className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
