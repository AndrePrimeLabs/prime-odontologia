// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Calendar, MessageCircle, Copy, Loader2, Users, Zap } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const priorityConfig = {
  urgent: { label: "Urgente", color: "bg-red-100 text-red-700" },
  high: { label: "Alta", color: "bg-orange-100 text-orange-700" },
  medium: { label: "Média", color: "bg-yellow-100 text-yellow-700" }
};

export default function AIReturnSuggestions({ onSchedule }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const run = async () => {
    setLoading(true);
    const res = await primeos.functions.invoke('suggestReturnVisits', {});
    setData(res.data);
    setLoading(false);
    if (res.data?.suggestions?.length === 0) toast.info(res.data?.message || "Nenhum retorno pendente.");
    else toast.success(`${res.data?.suggestions?.length} sugestões de retorno geradas!`);
  };

  const copyMessage = (msg, idx) => {
    navigator.clipboard.writeText(msg);
    setCopiedIdx(idx);
    toast.success("Mensagem copiada!");
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const openWhatsApp = (phone, msg) => {
    const clean = phone?.replace(/\D/g, '');
    if (!clean) { toast.error("Paciente sem telefone cadastrado"); return; }
    window.open(`https://wa.me/55${clean}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            Retornos Preventivos com IA
          </CardTitle>
          <Button onClick={run} disabled={loading} size="sm" className="bg-purple-600 hover:bg-purple-700 gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
            {loading ? "Analisando..." : data ? "Atualizar" : "Gerar Sugestões"}
          </Button>
        </div>
        <p className="text-xs text-slate-500">Pacientes com LTV alto ou risco de churn que precisam de retorno</p>
      </CardHeader>

      <CardContent>
        {!data && !loading && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-sm text-slate-500">Clique em "Gerar Sugestões" para que a IA identifique os pacientes que precisam de retorno preventivo.</p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center py-8 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <p className="text-sm text-slate-500">Analisando histórico de visitas e risco de churn...</p>
          </div>
        )}

        {data && !loading && (
          <div className="space-y-3">
            {data.summary && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-800">
                <Brain className="w-3.5 h-3.5 inline mr-1.5" />
                {data.summary}
              </div>
            )}

            {(data.suggestions || []).map((s, i) => (
              <div key={i} className="p-3 border border-slate-200 rounded-xl hover:border-purple-300 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-slate-900">{s.patient_name}</p>
                      <Badge className={cn("text-xs", priorityConfig[s.priority]?.color)}>
                        {priorityConfig[s.priority]?.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {s.days_since_visit} dias sem visita · {s.visit_reason}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-emerald-600 font-medium">{s.ltv_potential}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600 mb-3">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Sugerido: <strong>{s.suggested_date} às {s.suggested_time}</strong>
                </div>

                {s.whatsapp_message && (
                  <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg mb-3">
                    <p className="text-xs text-green-800 leading-relaxed line-clamp-3">{s.whatsapp_message}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 h-8 text-xs bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => onSchedule({ patient_name: s.patient_name, patient_id: s.patient_id, date: s.suggested_date, time: s.suggested_time, service_type: 'follow_up' })}>
                    <Calendar className="w-3 h-3 mr-1" />
                    Agendar Retorno
                  </Button>
                  {s.whatsapp_message && (
                    <>
                      <Button size="sm" variant="outline" className="h-8 text-xs text-green-700 border-green-200 hover:bg-green-50"
                        onClick={() => openWhatsApp(s.patient_phone, s.whatsapp_message)}>
                        <MessageCircle className="w-3 h-3 mr-1" />
                        WhatsApp
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0"
                        onClick={() => copyMessage(s.whatsapp_message, i)}>
                        {copiedIdx === i ? <Zap className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {data.suggestions?.length === 0 && (
              <p className="text-center text-sm text-slate-500 py-4">✅ Todos os pacientes estão com retornos em dia!</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
