// @ts-nocheck
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Mail, Phone, TrendingUp, Calendar } from "lucide-react";

export default function SegmentPreview({ segment, customers, leads, onClose }) {
  const matchesSegment = (contact) => {
    const { criterios } = segment;
    if (!criterios) return false;

    const score = contact.score || 0;
    if (criterios.score_min && score < criterios.score_min) return false;
    if (criterios.score_max && score > criterios.score_max) return false;

    if (criterios.interacoes_min && (contact.total_interactions || 0) < criterios.interacoes_min)
      return false;

    const value = contact.lifetime_value || contact.estimated_value || 0;
    if (criterios.valor_min && value < criterios.valor_min) return false;

    if (criterios.dias_sem_contato && contact.last_contact_date) {
      const daysSince = Math.floor(
        (new Date() - new Date(contact.last_contact_date)) / (1000 * 60 * 60 * 24)
      );
      if (daysSince < criterios.dias_sem_contato) return false;
    }

    if (
      criterios.canal_preferido &&
      contact.preferred_channel !== criterios.canal_preferido
    )
      return false;

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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: segment.cor }}
            />
            {segment.name}
          </DialogTitle>
          <p className="text-sm text-slate-600">{segment.descricao}</p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs text-slate-600">Total</span>
                </div>
                <p className="text-2xl font-bold">{matchingContacts.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-slate-600">Clientes</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {matchingContacts.filter((c) => customers.includes(c)).length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  <span className="text-xs text-slate-600">Leads</span>
                </div>
                <p className="text-2xl font-bold text-amber-600">
                  {matchingContacts.filter((c) => leads.includes(c)).length}
                </p>
              </CardContent>
            </Card>
          </div>

          <ScrollArea className="h-96">
            <div className="space-y-2">
              {matchingContacts.map((contact) => (
                <Card key={contact.id} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-900">{contact.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {customers.includes(contact) ? "Cliente" : "Lead"}
                          </Badge>
                          {contact.score && (
                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{ borderColor: segment.cor, color: segment.cor }}
                            >
                              Score: {contact.score}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-slate-600 space-y-1">
                          {contact.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-3 h-3" />
                              {contact.email}
                            </div>
                          )}
                          {contact.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-3 h-3" />
                              {contact.phone}
                            </div>
                          )}
                          {contact.last_contact_date && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              Último contato:{" "}
                              {new Date(contact.last_contact_date).toLocaleDateString("pt-BR")}
                            </div>
                          )}
                        </div>
                      </div>
                      {contact.lifetime_value && (
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Valor</p>
                          <p className="font-bold text-green-600">
                            R$ {contact.lifetime_value.toLocaleString("pt-BR")}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
