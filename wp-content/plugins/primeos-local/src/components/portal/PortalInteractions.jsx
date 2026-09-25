// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MessageSquare, Calendar, Video } from "lucide-react";
import { format } from "date-fns";

const interactionIcons = {
  call: Phone,
  email: Mail,
  whatsapp: MessageSquare,
  meeting: Calendar,
  demo: Video,
  support: MessageSquare,
  follow_up: Calendar
};

const outcomeConfig = {
  positive: { label: "Positivo", color: "bg-green-100 text-green-700" },
  neutral: { label: "Neutro", color: "bg-slate-100 text-slate-700" },
  negative: { label: "Negativo", color: "bg-red-100 text-red-700" },
  pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-700" }
};

export default function PortalInteractions({ interactions }) {
  const sortedInteractions = [...interactions].sort(
    (a, b) => new Date(b.created_date) - new Date(a.created_date)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Interações</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedInteractions.length > 0 ? (
          <div className="space-y-4">
            {sortedInteractions.map(interaction => {
              const Icon = interactionIcons[interaction.type] || MessageSquare;
              return (
                <div key={interaction.id} className="p-4 bg-white rounded-lg border border-slate-200 hover:border-indigo-200 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-indigo-50">
                      <Icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {interaction.subject}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {format(new Date(interaction.created_date), "dd/MM/yyyy 'às' HH:mm")}
                          </p>
                        </div>
                        {interaction.outcome && (
                          <Badge className={outcomeConfig[interaction.outcome]?.color}>
                            {outcomeConfig[interaction.outcome]?.label}
                          </Badge>
                        )}
                      </div>
                      
                      {interaction.description && (
                        <p className="text-sm text-slate-600 mb-2">
                          {interaction.description}
                        </p>
                      )}

                      {interaction.next_action && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs font-medium text-blue-900 mb-1">
                            Próxima ação:
                          </p>
                          <p className="text-sm text-blue-700">
                            {interaction.next_action}
                          </p>
                          {interaction.next_action_date && (
                            <p className="text-xs text-blue-600 mt-1">
                              Data: {format(new Date(interaction.next_action_date), "dd/MM/yyyy")}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-slate-400 py-8">
            Nenhuma interação registrada ainda
          </p>
        )}
      </CardContent>
    </Card>
  );
}
