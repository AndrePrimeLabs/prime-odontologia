// @ts-nocheck
import { primeos } from "@/api/primeosClient";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Brain, FileText, Share2, Megaphone, Users, BarChart3,
  TrendingUp, DollarSign, Target, Zap, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const modules = [
  { id: "estrategia", name: "Estratégia", icon: Brain, color: "from-purple-500 to-indigo-600", href: "Estrategias" },
  { id: "conteudo", name: "Conteúdo", icon: FileText, color: "from-pink-500 to-rose-600", href: "Conteudos" },
  { id: "canais", name: "Canais", icon: Share2, color: "from-green-500 to-emerald-600", href: "Canais" },
  { id: "campanhas", name: "Campanhas", icon: Megaphone, color: "from-amber-500 to-orange-600", href: "Campanhas" },
  { id: "leads", name: "Leads", icon: Users, color: "from-blue-500 to-cyan-600", href: "LeadsPipeline" },
  { id: "metricas", name: "Métricas", icon: BarChart3, color: "from-teal-500 to-green-600", href: "Metricas" }
];

export default function MarketingOS() {
  const { data: strategies = [] } = useQuery({
    queryKey: ["marketingStrategies"],
    queryFn: () => primeos.entities.MarketingStrategy.list("-created_date")
  });

  const { data: contents = [] } = useQuery({
    queryKey: ["contents"],
    queryFn: () => primeos.entities.Content.list("-created_date")
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => primeos.entities.Campaign.list("-created_date")
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: () => primeos.entities.Lead.list("-created_date")
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ["metrics"],
    queryFn: () => primeos.entities.MarketingMetric.list("-data")
  });

  // Calculate totals
  const totalLeads = leads.length;
  const leadsNovos = leads.filter(l => l.status === "novo").length;
  const leadsFechados = leads.filter(l => l.status === "fechado").length;
  const totalReceita = metrics.reduce((sum, m) => sum + (m.receita_gerada || 0), 0);
  const totalInvestimento = metrics.reduce((sum, m) => sum + (m.investimento || 0), 0);
  const roi = totalInvestimento > 0 ? ((totalReceita - totalInvestimento) / totalInvestimento * 100).toFixed(1) : 0;

  const contentsByStatus = {
    ideia: contents.filter(c => c.status === "ideia").length,
    producao: contents.filter(c => c.status === "producao").length,
    publicado: contents.filter(c => c.status === "publicado").length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-200">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Marketing OS</h1>
              <p className="text-slate-500">Sistema Omnichannel de Marketing</p>
            </div>
          </div>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: "Leads Total", value: totalLeads, icon: Users, color: "text-blue-600" },
            { label: "Leads Novos", value: leadsNovos, icon: Zap, color: "text-amber-600" },
            { label: "Convertidos", value: leadsFechados, icon: Target, color: "text-emerald-600" },
            { label: "Conteúdos", value: contents.length, icon: FileText, color: "text-pink-600" },
            { label: "Receita", value: `R$ ${(totalReceita/1000).toFixed(0)}k`, icon: DollarSign, color: "text-green-600" },
            { label: "ROI", value: `${roi}%`, icon: TrendingUp, color: "text-purple-600" }
          ].map((kpi, idx) => (
            <Card key={idx} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <kpi.icon className={cn("w-4 h-4", kpi.color)} />
                  <span className="text-xs text-slate-500">{kpi.label}</span>
                </div>
                <p className={cn("text-2xl font-bold", kpi.color)}>{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Module Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {modules.map((module) => (
            <Link key={module.id} to={createPageUrl(module.href)}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden">
                  <CardContent className="p-0">
                    <div className={cn("p-6 bg-gradient-to-br text-white", module.color)}>
                      <module.icon className="w-8 h-8 mb-3" />
                      <h3 className="text-xl font-bold">{module.name}</h3>
                    </div>
                    <div className="p-4 bg-white">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Acessar módulo</span>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Flow Visualization */}
        <Card className="border-0 shadow-sm mb-8">
          <CardHeader>
            <CardTitle className="text-base">Fluxo do Marketing OS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between overflow-x-auto py-4">
              {[
                { name: "Estratégia", icon: Brain, count: strategies.filter(s => s.status === "ativo").length },
                { name: "Conteúdo", icon: FileText, count: contentsByStatus.publicado },
                { name: "Campanha", icon: Megaphone, count: campaigns.filter(c => c.status === "ativa").length },
                { name: "Lead", icon: Users, count: leadsNovos },
                { name: "WhatsApp", icon: Share2, count: leads.filter(l => l.canal_conversao === "whatsapp").length },
                { name: "Receita", icon: DollarSign, count: `R$${(totalReceita/1000).toFixed(0)}k` }
              ].map((step, idx, arr) => (
                <div key={idx} className="flex items-center">
                  <div className="flex flex-col items-center min-w-[100px]">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-2">
                      <step.icon className="w-6 h-6 text-slate-600" />
                    </div>
                    <p className="text-sm font-medium text-slate-700">{step.name}</p>
                    <Badge variant="secondary" className="mt-1">{step.count}</Badge>
                  </div>
                  {idx < arr.length - 1 && (
                    <ArrowRight className="w-6 h-6 text-slate-300 mx-2" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardContent className="p-4">
              <h3 className="font-semibold text-purple-900 mb-2">🤖 IA Agents Ready</h3>
              <p className="text-sm text-purple-700">Marketing, Sales, CRM e Manager Agents conectados ao sistema.</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-4">
              <h3 className="font-semibold text-green-900 mb-2">📲 WhatsApp Integrado</h3>
              <p className="text-sm text-green-700">Leads entram automaticamente com status e origem rastreados.</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-4">
              <h3 className="font-semibold text-amber-900 mb-2">📊 ROI Tracking</h3>
              <p className="text-sm text-amber-700">Marketing ligado à receita. Cada lead rastreado até conversão.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
