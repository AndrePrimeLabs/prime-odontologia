// @ts-nocheck
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle } from "lucide-react";

export default function RecurringTaskTemplate({ task, onChange }) {
  const handleRecurringChange = (recorrente) => {
    onChange({
      ...task,
      recorrente,
      frequencia_recorrencia: recorrente ? "semanal" : undefined,
      proxima_ocorrencia: recorrente ? new Date().toISOString() : undefined,
    });
  };

  const handleFrequencyChange = (frequency) => {
    onChange({
      ...task,
      frequencia_recorrencia: frequency,
    });
  };

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="flex items-center gap-3">
        <Checkbox
          checked={task.recorrente || false}
          onCheckedChange={handleRecurringChange}
          id="recurring"
        />
        <label htmlFor="recurring" className="text-sm font-medium cursor-pointer">
          Configurar como tarefa recorrente
        </label>
      </div>

      {task.recorrente && (
        <div className="bg-blue-50 rounded-lg p-3 space-y-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700">
              Esta tarefa será automaticamente duplicada na frequência escolhida.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Frequência de repetição
            </label>
            <Select
              value={task.frequencia_recorrencia || "semanal"}
              onValueChange={handleFrequencyChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diaria">Diária</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="quinzenal">Quinzenal</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="trimestral">Trimestral</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
