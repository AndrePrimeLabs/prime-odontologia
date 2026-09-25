// @ts-nocheck
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Edit2, Trash2, ChevronDown, ChevronUp, Users, Mail, MessageCircle,
  Phone, Star, DollarSign, Zap, Bot, Target
} from "lucide-react";
import { cn } from "@/lib/utils";

const PRIORITY_CONFIG = {
  high: { label: "Alta", color: "bg-rose-100 text-rose-700" },
  medium: { label: "Média", color: "bg-amber-100 text-amber-700" },
  low: { label: "Baixa", color: "bg-slate-100 text-slate-500" },
};

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

const CHANNEL_ICONS = { email: Mail, whatsapp: MessageCircle, sms: Star, call: Phone };

function matchesSegment(customer, appointments, transactions, criterios) {
  if (!criterios) return true;
  const c = criterios;

  const custAppts = appointments.filter(a => a.patient_id === customer.id || a.patient_name === customer.name);
  const custTxns = transactions.filter(t => t.patient_id === customer.id || t.patient_name === customer.name);
  const totalSpent = custTxns.filter(t => t.type === "receita" && t.status === "pago").reduce((s, t) => s + (t.amount || 0), 0);

  if (c.min_appointments && custAppts.length < Number(c.min_appointments)) return false;
  if (c.max_appointments && custAppts.length > Number(c.max_appointments)) return false;
  if (c.min_total_spent && totalSpent < Number(c.min_total_spent)) return false;
  if (c.max_total_spent && totalSpent > Number(c.max_total_spent)) return false;

  const lastVisit = custAppts.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  if (lastVisit) {
    const daysSince = Math.floor((new Date() - new Date(lastVisit.date)) / 86400000);
    if (c.min_days_since_last_visit && daysSince < Number(c.min_days_since_last_visit)) return false;
    if (c.max_days_since_last_visit && daysSince > Number(c.max_days_since_last_visit)) return false;
  } else if (c.min_days_since_last_visit) return false;

  if (c.tags?.length > 0 && !c.tags.some(t => customer.tags?.includes(t))) return false;
  if (c.status?.length > 0 && !c.status.includes(customer.status)) return false;
  if (c.service_types?.length > 0 && !c.service_types.some(s => custAppts.some(a => a.service_type === s))) return false;
  if (c.has_phone && !customer.phone) return false;
  if (c.has_email && !customer.email) return false;

  return true;
}

export default function PatientSegmentCard({ segment, customers, appointments, transactions, onEdit, onDelete, onActivate }) {
  const [expanded, setExpanded] = useState(false);

  const matched = customers.filter(c => matchesSegment(c, appointments, transactions, segment.criterios));
  const pct = customers.length > 0 ? Math.round((matched.length / customers.length) * 100) : 0;
  const c = segment.criterios || {};

  const criteriaRows = [
    c.min_appointments && `≥ ${c.min_appointments} consultas`,
    c.max_appointments && `≤ ${c.max_appointments} consultas`,
    c.min_total_spent && `Gasto ≥ R$${Number(c.min_total_spent).toLocaleString("pt-BR")}`,
    c.max_total_spent && `Gasto ≤ R$${Number(c.max_total_spent).toLocaleString("pt-BR")}`,
    c.min_days_since_last_visit && `Ausente há ≥ ${c.min_days_since_last_visit} dias`,
    c.max_days_since_last_visit && `Última visita há ≤ ${c.max_days_since_last_visit} dias`,
    c.tags?.length > 0 && `Tags: ${c.tags.join(", ")}`,
    c.status?.length > 0 && `Status: ${c.status.join(", ")}`,
  ].filter(Boolean);

  return (
    <Card className={cn("border transition-all duration-200 hover:shadow-md", segment.ativo ? "border-slate-200" : "border-slate-100 opacity-60")}>
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ backgroundColor: `${segment.cor}18` }}>
            {segment.icon || "🎯"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-900">{segment.name}</span>
              {segment.ai_generated && (
                <Badge className="bg-purple-100 text-purple-700 border-0 text-xs gap-1">
                  <Bot className="w-2.5 h-2.5" />IA
                </Badge>
              )}
              {segment.ativo
                ? <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">Ativo</Badge>
                : <Badge className="bg-slate-100 text-slate-500 border-0 text-xs">Inativo</Badge>}
            </div>
            {segment.descricao && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{segment.descricao}</p>}
          </div>
          <div className="flex-shrink-0 text-right">
            <div className="text-xl font-bold" style={{ color: segment.cor }}>{matched.length}</div>
            <div className="text-xs text-slate-400">{pct}% da base</div>
          </div>
          <div className="ml-1">{expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}</div>
        </div>

        {/* Criteria chips */}
        {criteriaRows.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {criteriaRows.map((r, i) => (
              <span key={i} className="text-xs bg-slate-100 text-slate-600 rounded-full px-2.5 py-0.5">{r}</span>
            ))}
          </div>
        )}

        {/* Expanded */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
            {/* AI rationale */}
            {segment.ai_rationale && (
              <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-xl border border-purple-100">
                <Bot className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-purple-700">{segment.ai_rationale}</p>
              </div>
            )}

            {/* Revenue impact */}
            {segment.estimated_revenue_impact && (
              <div className="flex items-center gap-2 p-2.5 bg-emerald-50 rounded-lg border border-emerald-100 text-xs text-emerald-700">
                <DollarSign className="w-3.5 h-3.5" />
                <span className="font-medium">Impacto estimado:</span> {segment.estimated_revenue_impact}
              </div>
            )}

            {/* Sample patients */}
            {matched.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Users className="w-3 h-3" />Pacientes neste segmento ({matched.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {matched.slice(0, 6).map(p => (
                    <span key={p.id} className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-2.5 py-0.5 text-xs text-slate-700">
                      <span className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs flex-shrink-0" style={{ fontSize: 9 }}>
                        {p.name?.charAt(0)}
                      </span>
                      {p.name}
                    </span>
                  ))}
                  {matched.length > 6 && <span className="text-xs text-slate-400 self-center">+{matched.length - 6} mais</span>}
                </div>
              </div>
            )}

            {/* Actions */}
            {segment.actions?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Zap className="w-3 h-3" />Ações Sugeridas
                </p>
                <div className="space-y-2">
                  {segment.actions.map((action, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-2.5 bg-white rounded-lg border border-slate-100">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", ACTION_TYPE_COLORS[action.type] || "bg-slate-100 text-slate-600")}>
                            {ACTION_TYPE_LABELS[action.type] || action.type}
                          </span>
                          <span className={cn("text-xs px-2 py-0.5 rounded-full", PRIORITY_CONFIG[action.priority]?.color || "bg-slate-100 text-slate-500")}>
                            {PRIORITY_CONFIG[action.priority]?.label}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-800">{action.label}</p>
                        {action.description && <p className="text-xs text-slate-500">{action.description}</p>}
                        <div className="flex gap-1.5 mt-1.5">
                          {action.channels?.map(ch => {
                            const Icon = CHANNEL_ICONS[ch] || Target;
                            return (
                              <span key={ch} className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">
                                <Icon className="w-2.5 h-2.5" />{ch}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex gap-2 pt-1">
              <Button size="sm" variant="outline" onClick={() => onEdit(segment)} className="gap-1.5">
                <Edit2 className="w-3.5 h-3.5" />Editar
              </Button>
              <Button size="sm" variant="outline" onClick={() => onDelete(segment.id)} className="gap-1.5 text-rose-500 hover:text-rose-700 hover:border-rose-200">
                <Trash2 className="w-3.5 h-3.5" />Excluir
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
