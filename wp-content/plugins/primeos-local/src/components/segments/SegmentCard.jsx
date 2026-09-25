// @ts-nocheck
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Eye, Mail, Users, TrendingUp } from "lucide-react";

export default function SegmentCard({
  segment,
  customers,
  leads,
  onEdit,
  onDelete,
  onPreview,
  onCampaign,
}) {
  const matchesSegment = (contact) => {
    const { criterios } = segment;
    if (!criterios) return false;

    // Score check
    const score = contact.score || 0;
    if (criterios.score_min && score < criterios.score_min) return false;
    if (criterios.score_max && score > criterios.score_max) return false;

    // Interactions check
    if (criterios.interacoes_min && (contact.total_interactions || 0) < criterios.interacoes_min)
      return false;

    // Value check
    const value = contact.lifetime_value || contact.estimated_value || 0;
    if (criterios.valor_min && value < criterios.valor_min) return false;

    // Days without contact
    if (criterios.dias_sem_contato && contact.last_contact_date) {
      const daysSince = Math.floor(
        (new Date() - new Date(contact.last_contact_date)) / (1000 * 60 * 60 * 24)
      );
      if (daysSince < criterios.dias_sem_contato) return false;
    }

    // Channel preference
    if (
      criterios.canal_preferido &&
      contact.preferred_channel !== criterios.canal_preferido
    )
      return false;

    // Interests
    if (
      criterios.interesse?.length > 0 &&
      !criterios.interesse.some((i) => contact.interest?.includes(i))
    ) {
      return false;
    }

    return true;
  };

  const allContacts = [...customers, ...leads];
  const matchingContacts = allContacts.filter(matchesSegment);
  const matchCount = matchingContacts.length;
  const percentMatch = allContacts.length > 0 ? (matchCount / allContacts.length) * 100 : 0;

  return (
    <Card className="border-0 shadow-sm hover:shadow-lg transition-shadow">
      <CardHeader
        className="pb-3"
        style={{
          background: `linear-gradient(135deg, ${segment.cor}15 0%, ${segment.cor}05 100%)`,
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.cor }}
              />
              <h3 className="font-bold text-slate-900">{segment.name}</h3>
            </div>
            {segment.descricao && (
              <p className="text-sm text-slate-600 line-clamp-2">{segment.descricao}</p>
            )}
          </div>
          <Badge variant={segment.ativo ? "default" : "secondary"}>
            {segment.ativo ? "Ativo" : "Inativo"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="space-y-3">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-slate-600" />
                <span className="text-xs text-slate-600">Contatos</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{matchCount}</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span className="text-xs text-indigo-600">Match</span>
              </div>
              <p className="text-2xl font-bold text-indigo-600">{percentMatch.toFixed(0)}%</p>
            </div>
          </div>

          {/* Criteria Summary */}
          <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg">
            {segment.criterios?.score_min > 0 && (
              <div>Score: {segment.criterios.score_min}-{segment.criterios.score_max}</div>
            )}
            {segment.criterios?.interacoes_min > 0 && (
              <div>Min. {segment.criterios.interacoes_min} interações</div>
            )}
            {segment.criterios?.valor_min > 0 && (
              <div>Valor mín: R$ {segment.criterios.valor_min}</div>
            )}
            {segment.criterios?.canal_preferido && (
              <div>Canal: {segment.criterios.canal_preferido}</div>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPreview(segment)}
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              Ver
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCampaign(segment)}
              className="gap-2 text-green-600 hover:text-green-700 hover:border-green-300"
            >
              <Mail className="w-4 h-4" />
              Campanha
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(segment)}
              className="flex-1"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Editar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(segment.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
