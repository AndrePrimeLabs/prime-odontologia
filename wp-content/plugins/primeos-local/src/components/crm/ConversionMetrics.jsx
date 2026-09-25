// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BarChart3, ArrowRight, TrendingUp } from "lucide-react";

export default function ConversionMetrics({ leads = [] }) {
  const navigate = useNavigate();

  const totalLeads = leads.length;
  const wonLeads = leads.filter(l => l.stage === "closed_won").length;
  const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : 0;
  
  const qualifiedLeads = leads.filter(l => ["qualified", "proposal", "negotiation"].includes(l.stage)).length;
  const qualificationRate = totalLeads > 0 ? ((qualifiedLeads / totalLeads) * 100).toFixed(1) : 0;

  const avgValue = wonLeads > 0 
    ? (leads.filter(l => l.stage === "closed_won").reduce((sum, l) => sum + (l.estimated_value || 0), 0) / wonLeads)
    : 0;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            <CardTitle>Métricas de Conversão</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(createPageUrl("SalesReports"))}
          >
            Relatórios
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Taxa de Conversão</p>
                <p className="text-3xl font-bold text-green-600">{conversionRate}%</p>
                <p className="text-xs text-slate-500 mt-1">{wonLeads} de {totalLeads} leads</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-slate-600">Qualificação</p>
              <p className="text-2xl font-bold text-blue-600">{qualificationRate}%</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-slate-600">Ticket Médio</p>
              <p className="text-2xl font-bold text-purple-600">
                R$ {avgValue.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
