// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain, Sparkles, Loader2, Plus, ChevronDown, ChevronUp,
  Bot, DollarSign, AlertCircle, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ACTION_TYPE_COLORS = {
  reactivation: "bg-rose-100 text-rose-700",
  loyalty: "bg-amber-100 text-amber-700",
  upsell: "bg-emerald-100 text-emerald-700",
  referral: "bg-purple-100 text-purple-700",
  reminder: "bg-blue-100 text-blue-700",
  offer: "bg-orange-100 text-orange-700",
  followup: "bg-indigo-100 text-indigo-700",
  educational: "bg-teal-100 text-teal-700",
};

const ACTION_TYPE_LABELS = {
  reactivation: "Reativação", loyalty: "Fidelização", upsell: "Upsell",
  referral: "Indicação", reminder: "Lembrete", offer: "Oferta",
  followup: "Follow-up", educational: "Educacional",
};

function SuggestionCard({ suggestion, onImport, importing }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border border-purple-100 bg-gradient-to-br from-purple-50/50 to-white hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-purple-100 flex-shrink-0">
            {suggestion.icon || "🎯"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-900">{suggestion.name}</span>
              <Badge className="bg-purple-100 text-purple-700 border-0 text-xs gap-1">
                <Bot className="w-2.5 h-2.5" />Sugestão IA
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{suggestion.descricao}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-center">
              <div className="text-lg font-bold text-purple-700">~{suggestion.estimated_count || "?"}</div>
              <div className="text-xs text-slate-400">pacientes</div>
            </div>
            {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-purple-100 space-y-3">
            {suggestion.ai_rationale && (
              <p className="text-xs text-purple-700 bg-purple-50 rounded-lg p-3 border border-purple-100">{suggestion.ai_rationale}</p>
            )}

            {suggestion.estimated_revenue_impact && (
              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 rounded-lg p-2 border border-emerald-100">
                <DollarSign className="w-3.5 h-3.5" /><span className="font-medium">Impacto:</span> {suggestion.estimated_revenue_impact}
              </div>
            )}

            {/* Criteria summary */}
            {suggestion.criterios && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Critérios</p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestion.criterios.min_appointments && <span className="text-xs bg-slate-100 text-slate-600 rounded-full px-2.5 py-0.5">≥{suggestion.criterios.min_appointments} consultas</span>}
                  {suggestion.criterios.min_days_since_last_visit && <span className="text-xs bg-slate-100 text-slate-600 rounded-full px-2.5 py-0.5">Ausente ≥{suggestion.criterios.min_days_since_last_visit}d</span>}
                  {suggestion.criterios.min_total_spent && <span className="text-xs bg-slate-100 text-slate-600 rounded-full px-2.5 py-0.5">Gasto ≥R${Number(suggestion.criterios.min_total_spent).toLocaleString("pt-BR")}</span>}
                  {suggestion.criterios.tags?.map(t => <span key={t} className="text-xs bg-indigo-100 text-indigo-600 rounded-full px-2.5 py-0.5">#{t}</span>)}
                  {suggestion.criterios.status?.map(s => <span key={s} className="text-xs bg-blue-100 text-blue-600 rounded-full px-2.5 py-0.5 capitalize">{s}</span>)}
                </div>
              </div>
            )}

            {/* Actions */}
            {suggestion.actions?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Ações Recomendadas</p>
                <div className="space-y-1.5">
                  {suggestion.actions.map((a, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-white rounded-lg border border-slate-100">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full flex-shrink-0", ACTION_TYPE_COLORS[a.type] || "bg-slate-100 text-slate-600")}>
                        {ACTION_TYPE_LABELS[a.type] || a.type}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-800">{a.label}</p>
                        {a.description && <p className="text-xs text-slate-500">{a.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={() => onImport(suggestion)} disabled={importing} className="w-full bg-purple-600 hover:bg-purple-700 gap-2 mt-1">
              {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Importar Segmento
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AISegmentSuggestions({ customers, onImport }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [importing, setImporting] = useState(null);
  const [error, setError] = useState(null);

  const analyze = async () => {
    if (customers.length < 2) { toast.error("Adicione pelo menos 2 pacientes."); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await primeos.functions.invoke("analyzePatientSegments", {});
      if (res.data?.success && res.data?.analysis?.segments) {
        // Transform AI analysis segments into importable segment definitions
        const aiSegments = res.data.analysis.segments.map(seg => ({
          name: seg.name,
          descricao: seg.description || seg.criteria,
          icon: seg.icon || "🎯",
          cor: "#6366f1",
          ativo: true,
          ai_generated: true,
          ai_rationale: seg.criteria,
          estimated_revenue_impact: seg.financial_impact,
          estimated_count: seg.count,
          criterios: seg.criterios || {},
          actions: (seg.actions || []).map(a => ({
            label: a.label,
            description: a.description,
            type: a.type || "followup",
            channels: a.channels || ["email", "whatsapp"],
            priority: a.priority || "medium",
            message_template: a.message_template || ""
          }))
        }));
        setSuggestions(aiSegments);
        toast.success(`${aiSegments.length} segmentos identificados pela IA!`);
      } else {
        setError(res.data?.error || "Erro na análise.");
      }
    } catch (e) {
      setError("Erro ao conectar com a IA.");
    }
    setLoading(false);
  };

  const handleImport = async (suggestion) => {
    setImporting(suggestion.name);
    const { estimated_count, ...segmentData } = suggestion;
    await onImport(segmentData);
    setImporting(null);
    toast.success(`Segmento "${suggestion.name}" importado!`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-600" />
            Sugestões da IA
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">A IA analisa seus dados e sugere segmentos prontos para usar</p>
        </div>
        <Button onClick={analyze} disabled={loading}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 gap-2">
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" />Analisando...</>
            : <><Sparkles className="w-4 h-4" />{suggestions ? "Reanalisar" : "Analisar com IA"}</>}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center gap-3 py-10 text-slate-500">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-purple-100" />
            <div className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin" />
            <Brain className="absolute inset-0 m-auto w-5 h-5 text-purple-600" />
          </div>
          <p className="text-sm font-medium text-slate-700">Analisando {customers.length} pacientes...</p>
        </div>
      )}

      {suggestions && !loading && (
        <div className="space-y-3">
          {suggestions.map((s, i) => (
            <SuggestionCard key={i} suggestion={s} onImport={handleImport} importing={importing === s.name} />
          ))}
          <button onClick={analyze} disabled={loading} className="w-full text-xs text-slate-400 hover:text-indigo-600 flex items-center justify-center gap-1.5 py-2">
            <RefreshCw className="w-3 h-3" />Gerar novas sugestões
          </button>
        </div>
      )}

      {!suggestions && !loading && !error && (
        <div className="text-center py-8 border-2 border-dashed border-purple-100 rounded-xl bg-purple-50/30">
          <Brain className="w-10 h-10 text-purple-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">IA pronta para analisar</p>
          <p className="text-xs text-slate-400 mt-1">Clique em "Analisar com IA" para receber sugestões personalizadas</p>
        </div>
      )}
    </div>
  );
}
