// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { TrendingUp, ArrowRight } from "lucide-react";

export default function PipelinePreview({ leads = [] }) {
  const navigate = useNavigate();

  const stages = [
    { id: "new", name: "Novos", color: "bg-slate-100" },
    { id: "contacted", name: "Contatados", color: "bg-blue-100" },
    { id: "qualified", name: "Qualificados", color: "bg-purple-100" },
    { id: "proposal", name: "Proposta", color: "bg-indigo-100" },
    { id: "negotiation", name: "Negociação", color: "bg-orange-100" },
    { id: "closed_won", name: "Ganho", color: "bg-green-100" },
  ];

  const getLeadsByStage = (stageId) => {
    return leads.filter((lead) => lead.stage === stageId).length;
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <CardTitle>Pipeline Rápido</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(createPageUrl("SalesPipeline"))}
          >
            Ver Completo
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {stages.map((stage) => {
            const count = getLeadsByStage(stage.id);
            return (
              <div
                key={stage.id}
                className={`flex items-center justify-between p-3 rounded-lg ${stage.color}`}
              >
                <span className="font-medium text-sm">{stage.name}</span>
                <Badge variant="outline" className="bg-white">
                  {count}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
