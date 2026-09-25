// @ts-nocheck
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, RefreshCw, Trash2, AlertTriangle, Eye, Download } from "lucide-react";
import { supabase } from "@/lib/supabase";

export async function fetchEntityData(entityKey) {
  const { data, error } = await supabase.from(entityKey).select("*");
  if (error) throw new Error(`Failed to fetch ${entityKey}: ${error.message}`);
  return data ?? [];
}

export function convertToCSV(data) {
  if (!data.length) return "";
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map(row =>
    Object.values(row)
      .map(val => `"${String(val ?? "").replace(/"/g, '""')}"`)
      .join(",")
  );
  return [headers, ...rows].join("\n");
}

export function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportEntity(entityKey, format) {
  const data = await fetchEntityData(entityKey);
  if (format === "json") {
    downloadFile(JSON.stringify(data, null, 2), `${entityKey}_export.json`, "application/json");
  } else {
    downloadFile(convertToCSV(data), `${entityKey}_export.csv`, "text/csv");
  }
}

export async function exportAllEntities(entityKeys, format) {
  const results = {};
  for (const key of entityKeys) {
    results[key] = await fetchEntityData(key);
  }
  if (format === "json") {
    downloadFile(JSON.stringify(results, null, 2), `all_entities_export.json`, "application/json");
  } else {
    downloadFile(
      convertToCSV(Object.entries(results).flatMap(([k, v]) => v.map(r => ({ entity: k, ...r })))),
      `all_entities_export.csv`,
      "text/csv"
    );
  }
}

const ENTITIES = [
  { key: "PatientRecord", label: "Pacientes", color: "text-rose-400" },
  { key: "Appointment", label: "Consultas", color: "text-blue-400" },
  { key: "Lead", label: "Leads", color: "text-indigo-400" },
  { key: "Task", label: "Tarefas", color: "text-amber-400" },
  { key: "MedicalRecord", label: "Prontuários", color: "text-teal-400" },
  { key: "POP", label: "POPs", color: "text-purple-400" },
  { key: "Customer", label: "Clientes", color: "text-green-400" },
  { key: "Interaction", label: "Interações", color: "text-cyan-400" },
  { key: "CRMAppointment", label: "Agend. CRM", color: "text-orange-400" },
  { key: "Activity", label: "Atividades", color: "text-pink-400" },
  { key: "Campaign", label: "Campanhas", color: "text-violet-400" },
  { key: "Content", label: "Conteúdos", color: "text-lime-400" },
];

function EntityRow({ entity }) {
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchEntityData(entity.key);
      setCount(data.length);
    } catch (e) {
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-colors">
      <div className="flex items-center gap-3">
        <Database className={`w-4 h-4 ${entity.color}`} />
        <div>
          <p className="text-white text-sm font-medium">{entity.label}</p>
          <p className="text-slate-500 text-xs font-mono">{entity.key}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {count !== null && (
          <Badge variant="secondary" className="bg-slate-600 text-slate-300 border-slate-500 text-xs">
            {count} registros
          </Badge>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={() => exportEntity(entity.key, "csv")}
          className="h-7 text-xs border-slate-600 text-slate-400 hover:text-white hover:bg-slate-600"
        >
          <Download className="w-3 h-3" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={load}
          disabled={loading}
          className="h-7 text-xs border-slate-600 text-slate-400 hover:text-white hover:bg-slate-600"
        >
          {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3 mr-1" />}
          {count === null ? "Contar" : "Recarregar"}
        </Button>
      </div>
    </div>
  );
}

export default function AdminDataTab() {
  const entityKeys = ENTITIES.map(e => e.key);

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Database className="w-4 h-4" /> Entidades do Sistema
          </CardTitle>
          <p className="text-slate-500 text-xs">
            Clique em "Contar" para ver quantos registros cada entidade possui.
          </p>
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportAllEntities(entityKeys, "json")}
              className="h-7 text-xs border-slate-600 text-slate-400 hover:text-white hover:bg-slate-600"
            >
              <Download className="w-3 h-3 mr-1" /> Exportar Tudo (JSON)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportAllEntities(entityKeys, "csv")}
              className="h-7 text-xs border-slate-600 text-slate-400 hover:text-white hover:bg-slate-600"
            >
              <Download className="w-3 h-3 mr-1" /> Exportar Tudo (CSV)
            </Button>
          </div>
        </CardHeader>
        <div className="p-4">
          <div className="grid md:grid-cols-2 gap-2">
            {ENTITIES.map(e => <EntityRow key={e.key} entity={e} />)}
          </div>
        </div>
      </Card>

      <Card className="bg-red-900/20 border-red-800/50">
        <CardHeader>
          <CardTitle className="text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Zona de Perigo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-sm mb-4">
            Ações irreversíveis. Use com extremo cuidado. Todas as exclusões são permanentes.
          </p>
          <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-red-800/30">
            <Trash2 className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-white text-sm font-medium">Exclusão de Dados</p>
              <p className="text-slate-500 text-xs">
                Para excluir dados em massa, acesse o dashboard do PrimeOS → Entities → gerenciar registros diretamente no banco.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
