// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, MessageSquare, Phone, Mail, Calendar } from "lucide-react";

const channelIcons = {
  whatsapp: MessageSquare,
  email: Mail,
  phone: Phone,
  meeting: Calendar,
  call: Phone
};

export default function TouchpointRecommendations({ touchpoints, strategies }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Optimal Touchpoints */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            Touchpoints Ótimos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {touchpoints?.map((tp, idx) => {
            const Icon = channelIcons[tp.channels?.[0]?.toLowerCase()] || MessageSquare;
            
            return (
              <div key={idx} className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900 capitalize">{tp.stage}</h4>
                  <Badge variant="outline" className="text-xs">{tp.timing}</Badge>
                </div>
                
                <div className="space-y-2">
                  {tp.touchpoints?.map((point, pIdx) => (
                    <p key={pIdx} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-amber-600 mt-1">•</span>
                      {point}
                    </p>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {tp.channels?.map((channel, cIdx) => {
                    const ChIcon = channelIcons[channel.toLowerCase()] || MessageSquare;
                    return (
                      <Badge key={cIdx} variant="outline" className="flex items-center gap-1 text-xs">
                        <ChIcon className="w-3 h-3" />
                        {channel}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Communication Strategies */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Estratégias de Comunicação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {strategies?.map((strategy, idx) => (
            <div key={idx} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="mb-3">
                <h4 className="font-semibold text-slate-900 capitalize">{strategy.stage}</h4>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">{strategy.tone}</Badge>
                  <Badge variant="outline" className="text-xs">{strategy.frequency}</Badge>
                </div>
              </div>

              <p className="text-sm text-slate-700 italic">
                "{strategy.message}"
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
