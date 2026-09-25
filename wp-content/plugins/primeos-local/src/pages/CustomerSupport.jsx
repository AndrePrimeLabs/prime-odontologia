// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { primeos } from "@/api/primeosClient";
import PageHeader from "@/components/shared/PageHeader";
import SupportChatbot from "@/components/support/SupportChatbot";
import TicketTriageForm from "@/components/support/TicketTriageForm";
import AgentSuggestions from "@/components/support/AgentSuggestions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeadphonesIcon, AlertCircle } from "lucide-react";

export default function CustomerSupport() {
  const [selectedTicket, setSelectedTicket] = useState(null);

  const { data: tickets = [], refetch } = useQuery({
    queryKey: ["support_tickets"],
    queryFn: () => primeos.entities.SupportTicket.list(),
  });

  const criticalTickets = tickets.filter(t => t.priority === "critica");
  const openTickets = tickets.filter(t => ["novo", "em_triagem", "aberto"].includes(t.status));

  const getPriorityColor = (priority) => {
    const colors = {
      "baixa": "bg-blue-600",
      "media": "bg-yellow-600",
      "alta": "bg-orange-600",
      "critica": "bg-red-600"
    };
    return colors[priority] || "bg-gray-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Suporte ao Cliente com IA"
          subtitle="Chatbot, triagem automática e sugestões inteligentes para agentes"
          icon={HeadphonesIcon}
        />

        <Tabs defaultValue="chatbot" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chatbot">Chat</TabsTrigger>
            <TabsTrigger value="tickets">Tickets ({openTickets.length})</TabsTrigger>
            <TabsTrigger value="agent">Agente</TabsTrigger>
          </TabsList>

          {/* Chatbot Tab */}
          <TabsContent value="chatbot">
            <SupportChatbot />
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="space-y-6">
            {criticalTickets.length > 0 && (
              <Card className="border-l-4 border-l-red-600 border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base text-red-600">
                    <AlertCircle className="w-5 h-5" />
                    {criticalTickets.length} Tickets Críticos
                  </CardTitle>
                </CardHeader>
              </Card>
            )}

            <div className="grid gap-4">
              {openTickets.length > 0 ? (
                openTickets.map((ticket) => (
                  <Card
                    key={ticket.id}
                    className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900">{ticket.subject}</h3>
                            <Badge className={getPriorityColor(ticket.priority)}>
                              {ticket.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600">{ticket.customer_name}</p>
                        </div>
                        <Badge variant="outline">{ticket.ticket_id}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-slate-700">{ticket.description.substring(0, 100)}...</p>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {ticket.category}
                        </Badge>
                        {ticket.ai_analysis?.sentiment && (
                          <Badge variant="outline" className="text-xs">
                            Sentimento: {ticket.ai_analysis.sentiment}
                          </Badge>
                        )}
                        {ticket.ai_analysis?.urgency_score && (
                          <Badge variant="outline" className="text-xs">
                            Urgência: {ticket.ai_analysis.urgency_score}/10
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-8 text-center">
                    <p className="text-slate-500">Nenhum ticket aberto</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {openTickets.length === 0 && (
              <TicketTriageForm onCreated={() => refetch()} />
            )}
          </TabsContent>

          {/* Agent Tab */}
          <TabsContent value="agent" className="space-y-6">
            {selectedTicket ? (
              <div className="space-y-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{selectedTicket.subject}</CardTitle>
                        <p className="text-sm text-slate-500 mt-1">{selectedTicket.ticket_id}</p>
                      </div>
                      <Badge className={getPriorityColor(selectedTicket.priority)}>
                        {selectedTicket.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Cliente</p>
                      <p className="font-medium">{selectedTicket.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Descrição</p>
                      <p className="text-sm">{selectedTicket.description}</p>
                    </div>
                  </CardContent>
                </Card>

                <AgentSuggestions ticket={selectedTicket} />
              </div>
            ) : (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-8 text-center">
                  <p className="text-slate-500">Selecione um ticket para ver sugestões</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
