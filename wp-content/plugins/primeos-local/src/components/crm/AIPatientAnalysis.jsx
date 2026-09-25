// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain, Sparkles, Loader2, ChevronDown, ChevronUp,
  TrendingUp, AlertCircle, Users, Zap, Mail, MessageCircle,
  Phone, Star, RefreshCw, Target, DollarSign, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const COLOR_MAP = {
  indigo: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", badge: "bg-indigo-100 text-indigo-700", dot: "bg-indigo-500" },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  rose: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", badge: "bg-rose-100 text-rose-700", dot: "bg-rose-500" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", badge: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
  blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", badge: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", badge: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  teal: { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700", badge: "bg-teal-100 text-teal-700", dot: "bg-teal-500" },
};

const URGENCY_CONFIG = {
  high: { label: "Urgente", color: "bg-rose-100 text-rose-700" },
  medium: { label: "Média", color: "bg-amber-100 text-amber-700" },
  low: { label: "Baixa", color: "bg-slate-100 text-slate-600" },
};

const CHANNEL_ICONS = {
  email: Mail,
  whatsapp: MessageCircle,
  call: Phone,
  "in-person": Star,
  discount: DollarSign,
  campaign: Target,
};

const PRIORITY_DOT = {
  high: "bg-rose-500",
  medium: "bg-amber-500",
  low: "bg-slate-400",
};

function SegmentCard({ segment }) {
  const [expanded, setExpanded] = useState(false);
  const colors = COLOR_MAP[segment.color] || COLOR_MAP.indigo;
  const urgency = URGENCY_CONFIG[segment.urgency] || URGENCY_CONFIG.low;

  return (
    <Card className={cn("border transition-all duration-200", colors.border, expanded && colors.bg)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0", colors.bg)}>
              {segment.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-slate-900">{segment.name}</h4>
                <Badge className={cn("text-xs border-0", urgency.color)}>{urgency.label}</Badge>
              </div>
              <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{segment.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className={cn("text-center px-3 py-1.5 rounded-lg", colors.bg)}>
              <p className={cn("text-lg font-bold", colors.text)}>{segment.count}</p>
              <p className="text-xs text-slate-400">pacientes</p>
            </div>
            {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </div>

        {expanded && (
          <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
            {/* Criteria */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Como foram identificados</p>
              <p className="text-sm text-slate-600">{segment.criteria}</p>
            </div>

            {/* Example patients */}
            {segment.patient_names?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Exemplos</p>
                <div className="flex flex-wrap gap-1.5">
                  {segment.patient_names.map((name, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-2.5 py-0.5 text-xs font-medium text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs flex-shrink-0">
                        {name.charAt(0)}
                      </span>
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Financial impact */}
            {segment.financial_impact && (
              <div className={cn("flex items-start gap-2 p-3 rounded-lg", colors.bg)}>
                <DollarSign className={cn("w-4 h-4 flex-shrink-0 mt-0.5", colors.text)} />
                <div>
                  <p className="text-xs font-semibold text-slate-600">Impacto Financeiro</p>
                  <p className={cn("text-sm font-medium", colors.text)}>{segment.financial_impact}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            {segment.actions?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Ações Recomendadas</p>
                <div className="space-y-2">
                  {segment.actions.map((action, i) => {
                    const ChannelIcon = CHANNEL_ICONS[action.channel] || Zap;
                    return (
                      <div key={i} className="flex items-start gap-2.5 p-2.5 bg-white rounded-lg border border-slate-100">
                        <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0", PRIORITY_DOT[action.priority] || "bg-slate-400")} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-slate-800">{action.label}</span>
                            <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full", colors.badge)}>
                              <ChannelIcon className="w-3 h-3" />{action.channel}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{action.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AIPatientAnalysis({ customers, appointments, transactions }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const runAnalysis = async () => {
    if (customers.length < 2) {
      toast.error("Adicione pelo menos 2 pacientes para análise.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await primeos.functions.invoke("analyzePatientSegments", {});
      if (res.data?.success) {
        setAnalysis(res.data.analysis);
        toast.success("Análise de IA concluída!");
      } else {
        setError(res.data?.error || "Erro na análise.");
      }
    } catch (e) {
      setError("Erro ao conectar com a IA.");
    }
    setLoading(false);
  };

  const score = analysis?.health_score ?? analysis?.overview?.health_score;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-600" />
            Análise Inteligente de Pacientes
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            IA analisa histórico de consultas, transações e perfil para criar segmentos e sugerir ações
          </p>
        </div>
        <Button
          onClick={runAnalysis}
          disabled={loading}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 gap-2"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Analisando...</>
          ) : (
            <><Sparkles className="w-4 h-4" />{analysis ? "Reanalisar" : "Analisar com IA"}</>
          )}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center gap-3 py-10 text-slate-500">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
            <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
            <Brain className="absolute inset-0 m-auto w-6 h-6 text-indigo-600" />
          </div>
          <div className="text-center">
            <p className="font-medium text-slate-700">IA analisando dados...</p>
            <p className="text-xs text-slate-400 mt-1">Processando {customers.length} pacientes, consultas e transações</p>
          </div>
        </div>
      )}

      {/* Results */}
      {analysis && !loading && (
        <div className="space-y-5">
          {/* Overview cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border-0 bg-gradient-to-br from-indigo-50 to-purple-50">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-indigo-700">{analysis.overview?.total_patients ?? customers.length}</p>
                <p className="text-xs text-indigo-500 mt-1">Pacientes Analisados</p>
              </CardContent>
            </Card>
            {score != null && (
              <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-700">{score}<span className="text-sm">/100</span></p>
                  <p className="text-xs text-emerald-500 mt-1">Saúde do CRM</p>
                </CardContent>
              </Card>
            )}
            <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 col-span-2">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Oportunidade de Receita</p>
                <p className="text-sm font-semibold text-amber-800">{analysis.overview?.revenue_opportunity || "—"}</p>
              </CardContent>
            </Card>
          </div>

          {/* Key insight */}
          {analysis.overview?.key_insight && (
            <div className="flex items-start gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
              <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-indigo-900 mb-0.5">Insight Principal</p>
                <p className="text-sm text-indigo-700">{analysis.overview.key_insight}</p>
              </div>
            </div>
          )}

          {/* Segments */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" />
              Segmentos Identificados ({analysis.segments?.length || 0})
            </h4>
            <div className="space-y-3">
              {analysis.segments?.map((seg) => (
                <SegmentCard key={seg.id} segment={seg} />
              ))}
            </div>
          </div>

          {/* Patterns */}
          {analysis.patterns?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                Padrões Detectados
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                {analysis.patterns.map((p, i) => (
                  <div key={i} className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <p className="text-sm font-semibold text-slate-800 mb-1">{p.title}</p>
                    <p className="text-xs text-slate-500 mb-2">{p.insight}</p>
                    <div className="flex items-start gap-1.5 text-xs text-indigo-700 bg-indigo-50 rounded-lg p-2">
                      <Zap className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <span>{p.recommendation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regenerate note */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Análise realizada agora com {customers.length} pacientes
            </p>
            <button onClick={runAnalysis} disabled={loading} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />Atualizar
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!analysis && !loading && !error && (
        <div className="text-center py-10">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-indigo-600" />
          </div>
          <p className="font-semibold text-slate-700">Análise de IA pronta para rodar</p>
          <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
            Clique em "Analisar com IA" para identificar segmentos, padrões e oportunidades nos dados dos pacientes
          </p>
        </div>
      )}
    </div>
  );
}
