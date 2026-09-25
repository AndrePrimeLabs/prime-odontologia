// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain, Calendar, AlertTriangle, DollarSign, Stethoscope,
  Loader2, RefreshCw, MessageCircle, Copy, CheckCircle, TrendingUp,
  Clock, Star, ShieldAlert, Heart, Pill, Info, Zap
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const severityConfig = {
  high: { color: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500", label: "Alta" },
  medium: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-500", label: "Média" },
  low: { color: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500", label: "Baixa" },
};

const priorityConfig = {
  preventive: { label: "Preventivo", color: "bg-blue-100 text-blue-700" },
  recommended: { label: "Recomendado", color: "bg-indigo-100 text-indigo-700" },
  urgent: { label: "Urgente", color: "bg-red-100 text-red-700" },
};

const churnColors = {
  low: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  critical: "bg-red-100 text-red-700 border-red-200",
};

const segmentColors = {
  bronze: "bg-amber-700 text-white",
  silver: "bg-slate-400 text-white",
  gold: "bg-yellow-500 text-white",
  platinum: "bg-indigo-600 text-white",
};

const healthScoreColor = (score) => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-yellow-600";
  return "text-red-600";
};

const healthScoreBg = (score) => {
  if (score >= 80) return "from-green-500 to-emerald-600";
  if (score >= 60) return "from-blue-500 to-indigo-600";
  if (score >= 40) return "from-yellow-500 to-amber-600";
  return "from-red-500 to-rose-600";
};

function ClinicalInsightsSection({ ci }) {
  if (!ci) return null;

  return (
    <div className="space-y-4">
      {/* Health Score */}
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200">
        <div className={cn("w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-xl flex-shrink-0", healthScoreBg(ci.overall_health_score))}>
          {ci.overall_health_score}
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Score de Saúde Bucal</p>
          <p className={cn("text-lg font-bold", healthScoreColor(ci.overall_health_score))}>{ci.health_score_label}</p>
          <Progress value={ci.overall_health_score} className="h-1.5 w-32 mt-1" />
        </div>
        {ci.provider_notes && (
          <div className="flex-1 ml-2 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
            <p className="text-xs font-medium text-indigo-700 mb-1 flex items-center gap-1">
              <Info className="w-3 h-3" /> Nota para o Profissional
            </p>
            <p className="text-xs text-indigo-800 leading-relaxed">{ci.provider_notes}</p>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Risk Factors */}
        {ci.risk_factors?.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                Fatores de Risco Clínico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ci.risk_factors.map((rf, i) => (
                <div key={i} className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-slate-900">{rf.factor}</p>
                    <Badge className={cn("text-xs", severityConfig[rf.severity]?.color)}>
                      {severityConfig[rf.severity]?.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-1">{rf.description}</p>
                  {rf.action && (
                    <p className="text-xs text-indigo-700 font-medium flex items-start gap-1">
                      <Zap className="w-3 h-3 mt-0.5 flex-shrink-0" />{rf.action}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Preventive Measures */}
        {ci.preventive_measures?.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Heart className="w-4 h-4 text-emerald-500" />
                Medidas Preventivas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ci.preventive_measures.map((pm, i) => (
                <div key={i} className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-emerald-900">{pm.measure}</p>
                    <Badge className={cn("text-xs", severityConfig[pm.priority]?.color || "bg-emerald-100 text-emerald-700")}>
                      {pm.priority === "high" ? "Alta" : pm.priority === "medium" ? "Média" : "Baixa"}
                    </Badge>
                  </div>
                  <p className="text-xs text-emerald-700 mb-1">{pm.rationale}</p>
                  {pm.frequency && (
                    <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />{pm.frequency}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Drug Interactions */}
        {ci.drug_interactions?.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Pill className="w-4 h-4 text-purple-500" />
                Interações Medicamentosas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {ci.drug_interactions.map((di, i) => (
                <div key={i} className="p-3 rounded-lg bg-purple-50 border border-purple-100">
                  <p className="text-xs font-semibold text-purple-900 mb-1">{di.interaction}</p>
                  <p className="text-xs text-purple-700 mb-1">{di.risk}</p>
                  {di.recommendation && (
                    <p className="text-xs text-purple-600 font-medium">{di.recommendation}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Clinical Alerts */}
        {ci.clinical_alerts?.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Alertas Clínicos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {ci.clinical_alerts.map((ca, i) => (
                <div key={i} className={cn("p-3 rounded-lg border", severityConfig[ca.severity]?.color || "bg-amber-50 border-amber-100 text-amber-800")}>
                  <p className="text-xs font-semibold mb-0.5">{ca.alert}</p>
                  <p className="text-xs opacity-80">{ca.reason}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function PatientAIInsights({ patient }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState("clinical");

  const run = async () => {
    setLoading(true);
    try {
      const res = await primeos.functions.invoke('analyzePatient', { patientId: patient.id });
      setAnalysis(res.data.analysis);
      toast.success("Análise de IA concluída!");
    } catch (e) {
      toast.error("Erro ao gerar análise");
    } finally {
      setLoading(false);
    }
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center">
          <Brain className="w-8 h-8 text-indigo-600 animate-pulse" />
        </div>
        <p className="font-medium text-slate-700">Analisando histórico do paciente...</p>
        <p className="text-sm text-slate-500 text-center max-w-sm">
          A IA está processando histórico médico, medicamentos, condições crônicas e padrões clínicos
        </p>
        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
          <Brain className="w-8 h-8 text-indigo-600" />
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-slate-900 mb-2">Análise Clínica com IA</h3>
          <p className="text-sm text-slate-500 max-w-md">
            A IA analisará o histórico médico completo — condições crônicas, alergias, medicamentos, tratamentos anteriores e prontuários — para gerar:
          </p>
          <ul className="mt-3 text-sm text-slate-600 space-y-1 text-left inline-block">
            <li className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-red-400" /> Fatores de risco clínico</li>
            <li className="flex items-center gap-2"><Heart className="w-4 h-4 text-emerald-500" /> Medidas preventivas personalizadas</li>
            <li className="flex items-center gap-2"><Pill className="w-4 h-4 text-purple-500" /> Alertas de interações medicamentosas</li>
            <li className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Alertas clínicos relevantes</li>
            <li className="flex items-center gap-2"><Stethoscope className="w-4 h-4 text-blue-500" /> Sugestões de tratamento</li>
          </ul>
        </div>
        <Button onClick={run} className="bg-indigo-600 hover:bg-indigo-700 gap-2 mt-2">
          <Brain className="w-4 h-4" />
          Gerar Análise Clínica
        </Button>
      </div>
    );
  }

  const nv = analysis.next_visit;
  const cr = analysis.churn_risk;
  const ltv = analysis.lifetime_value;
  const ts = analysis.treatment_suggestions || [];
  const ci = analysis.clinical_insights;

  const tabs = [
    { key: "clinical", label: "Clínico", icon: Stethoscope },
    { key: "visits", label: "Visitas & CRM", icon: Calendar },
    { key: "value", label: "Valor", icon: DollarSign },
  ];

  return (
    <div className="space-y-5">
      {/* Summary Banner */}
      {analysis.summary && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex gap-3">
          <Brain className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-indigo-800">{analysis.summary}</p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all",
              activeTab === t.key
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Clinical Tab */}
      {activeTab === "clinical" && (
        <div className="space-y-4">
          <ClinicalInsightsSection ci={ci} />

          {/* Treatment Suggestions */}
          {ts.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                  Tratamentos Sugeridos
                </CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-3">
                {ts.map((t, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-slate-900">{t.treatment}</p>
                      <Badge className={cn("text-xs flex-shrink-0", priorityConfig[t.priority]?.color)}>
                        {priorityConfig[t.priority]?.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">{t.reason}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{t.time_frame}</span>
                      {t.estimated_value > 0 && (
                        <span className="font-medium text-emerald-600">~R$ {t.estimated_value.toLocaleString('pt-BR')}</span>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Visits & CRM Tab */}
      {activeTab === "visits" && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Próxima Visita Prevista
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">{nv?.predicted_date}</p>
                <span className="text-sm font-medium">
                  {nv?.urgency === 'high' ? '🔴 Urgente' : nv?.urgency === 'medium' ? '🟡 Médio' : '🟢 Ok'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">Melhor horário: <strong>{nv?.best_contact_time}</strong></span>
                </div>
                <p className="text-sm text-slate-600"><strong>Motivo:</strong> {nv?.contact_reason}</p>
              </div>
              {nv?.message_suggestion && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                      <MessageCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-green-800 leading-relaxed">{nv.message_suggestion}</p>
                    </div>
                    <Button size="icon" variant="ghost" className="h-7 w-7 flex-shrink-0" onClick={() => copy(nv.message_suggestion)}>
                      <Copy className="w-3.5 h-3.5 text-green-600" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                Risco de Abandono
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <Badge className={churnColors[cr?.level]}>{cr?.level?.toUpperCase()}</Badge>
                <span className="text-2xl font-bold text-slate-900">{cr?.score}%</span>
              </div>
              <Progress value={cr?.score} className="h-2" />
              {cr?.risk_factors?.length > 0 && (
                <div className="space-y-1">
                  {cr.risk_factors.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="text-orange-500 mt-0.5">•</span>{f}
                    </div>
                  ))}
                </div>
              )}
              {cr?.reengagement_campaign && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg space-y-2">
                  <p className="text-xs font-semibold text-purple-900">💡 {cr.reengagement_campaign.title}</p>
                  <p className="text-xs text-purple-700">{cr.reengagement_campaign.offer_suggestion}</p>
                  {cr.reengagement_campaign.message_template && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-purple-700 p-0" onClick={() => copy(cr.reengagement_campaign.message_template)}>
                      <Copy className="w-3 h-3" /> Copiar mensagem
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Value Tab */}
      {activeTab === "value" && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Lifetime Value & Segmento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500">LTV Atual</p>
                <p className="text-2xl font-bold text-emerald-600">
                  R$ {(ltv?.current_ltv || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Projeção 12 meses</p>
                <p className="text-xl font-bold text-indigo-600">
                  R$ {(ltv?.projected_ltv_12m || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {ltv?.segment && (
                <Badge className={cn("gap-1", segmentColors[ltv.segment])}>
                  <Star className="w-3 h-3" />
                  {ltv.segment.charAt(0).toUpperCase() + ltv.segment.slice(1)}
                </Badge>
              )}
              <span className="text-xs text-slate-500">
                Ticket médio: R$ {(ltv?.avg_ticket || 0).toLocaleString('pt-BR')} • {ltv?.visit_frequency}
              </span>
            </div>
            {ltv?.personalization_tips?.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-700">Dicas de personalização:</p>
                {ltv.personalization_tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />{tip}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={run} variant="outline" className="gap-2 text-sm">
          <RefreshCw className="w-4 h-4" />
          Refazer Análise
        </Button>
      </div>
    </div>
  );
}
