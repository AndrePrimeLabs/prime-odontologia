// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertCircle, Clock, Phone, Mail, MessageCircle, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function FollowUpReminders() {
  const [loading, setLoading] = useState(false);
  const [reminders, setReminders] = useState(null);

  const generateReminders = async () => {
    setLoading(true);
    try {
      const response = await primeos.functions.invoke('generateFollowUpReminders', {});

      if (response.data.success) {
        setReminders(response.data.data);
        toast.success("Lembretes gerados!");
      }
    } catch (error) {
      toast.error("Erro ao gerar lembretes: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const channelIcons = {
    whatsapp: MessageCircle,
    email: Mail,
    phone: Phone,
    call: Phone
  };

  const priorityStyles = {
    critical: "bg-red-100 text-red-700 border-red-200",
    high: "bg-orange-100 text-orange-700 border-orange-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    low: "bg-blue-100 text-blue-700 border-blue-200"
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Lembretes de Follow-up Automáticos
          </CardTitle>
          <Button
            onClick={generateReminders}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Lembretes
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!reminders && !loading && (
          <div className="text-center py-12 text-slate-500">
            <Bell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Clique em "Gerar Lembretes" para analisar leads</p>
          </div>
        )}

        {reminders && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
              <p className="text-sm text-slate-700 mb-4">{reminders.summary}</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Total Follow-ups</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {reminders.total_follow_ups_needed}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Críticos</p>
                  <p className="text-3xl font-bold text-red-600">
                    {reminders.critical_count}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Urgentes</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {reminders.urgent_follow_ups?.filter(f => f.priority === 'high').length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Urgent Follow-ups */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                Follow-ups Necessários ({reminders.urgent_follow_ups?.length || 0})
              </h4>
              <div className="space-y-3">
                {reminders.urgent_follow_ups?.map((followUp, idx) => {
                  const ChannelIcon = channelIcons[followUp.recommended_channel?.toLowerCase()] || MessageCircle;
                  
                  return (
                    <Card key={idx} className={`border-l-4 ${
                      followUp.priority === 'critical' ? 'border-l-red-500' :
                      followUp.priority === 'high' ? 'border-l-orange-500' :
                      'border-l-yellow-500'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h5 className="font-semibold text-slate-900 mb-1">
                              {followUp.lead_name}
                            </h5>
                            <p className="text-sm text-slate-600">{followUp.reason}</p>
                          </div>
                          <div className="flex flex-col gap-2 items-end">
                            <Badge className={priorityStyles[followUp.priority]}>
                              {followUp.priority}
                            </Badge>
                            {followUp.risk_of_losing && (
                              <Badge variant="destructive" className="text-xs">
                                Risco de perder
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-slate-500">Canal</p>
                            <div className="flex items-center gap-1 mt-1">
                              <ChannelIcon className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium">
                                {followUp.recommended_channel}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Timing</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span className="text-sm font-medium">{followUp.timing}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Engajamento</p>
                            <span className="text-sm font-medium">
                              {followUp.engagement_score}/100
                            </span>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs font-medium text-slate-700 mb-2">
                            Mensagem Sugerida:
                          </p>
                          <p className="text-sm text-slate-600 italic">
                            "{followUp.suggested_message}"
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Engagement Insights */}
            {reminders.engagement_insights?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Insights de Engajamento</h4>
                <div className="space-y-2">
                  {reminders.engagement_insights.map((insight, idx) => (
                    <Card key={idx} className="bg-gradient-to-r from-purple-50 to-pink-50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm font-medium text-slate-800 flex-1">
                            {insight.insight}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {insight.affected_leads} leads
                          </Badge>
                        </div>
                        <p className="text-xs text-purple-700">
                          💡 {insight.recommendation}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
