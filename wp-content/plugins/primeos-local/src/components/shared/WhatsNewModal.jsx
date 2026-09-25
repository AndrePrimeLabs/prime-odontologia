// @ts-nocheck
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Lightbulb, CheckCircle2, Calendar, ListChecks, Activity, BarChart3, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const LATEST_VERSION = "1.3.0"; // Update this when adding new features

const whatsNewItems = [
  {
    version: "1.3.0",
    date: "Fevereiro 2026",
    isNew: true,
    features: [
      {
        icon: Activity,
        title: "Métricas de Engajamento",
        description: "Acompanhe usuários ativos, duração de sessão e adoção de features em tempo real.",
        color: "text-indigo-600",
        bgColor: "bg-indigo-50"
      },
      {
        icon: ListChecks,
        title: "Sistema de Tarefas Avançado",
        description: "Atribuição multi-usuário, subtarefas, checklists e tarefas recorrentes.",
        color: "text-purple-600",
        bgColor: "bg-purple-50"
      },
      {
        icon: Calendar,
        title: "Calendário de Tarefas",
        description: "Visualize todas as tarefas em um calendário interativo mensal.",
        color: "text-blue-600",
        bgColor: "bg-blue-50"
      }
    ]
  },
  {
    version: "1.2.0",
    date: "Janeiro 2026",
    features: [
      {
        icon: FileText,
        title: "POPs Digitais",
        description: "Gerencie Procedimentos Operacionais Padrão com versionamento e histórico.",
        color: "text-teal-600",
        bgColor: "bg-teal-50"
      },
      {
        icon: BarChart3,
        title: "Dashboard de Métricas",
        description: "ROI, CAC, funil de conversão e análise por canal de marketing.",
        color: "text-emerald-600",
        bgColor: "bg-emerald-50"
      }
    ]
  }
];

const tipsAndTricks = [
  {
    category: "Produtividade",
    icon: Lightbulb,
    color: "text-amber-600",
    tips: [
      {
        title: "Tarefas Recorrentes",
        description: "Use tarefas recorrentes para rotinas diárias, semanais ou mensais. O sistema cria automaticamente a próxima ocorrência."
      },
      {
        title: "Atribuição Multi-usuário",
        description: "Atribua tarefas para múltiplos responsáveis e acompanhe o progresso de cada um no checklist."
      },
      {
        title: "Calendário Integrado",
        description: "Arraste e solte tarefas no calendário para reagendar rapidamente."
      }
    ]
  },
  {
    category: "Métricas",
    icon: BarChart3,
    color: "text-indigo-600",
    tips: [
      {
        title: "Engajamento de Usuários",
        description: "Monitore DAU, WAU e MAU para entender o nível de adoção da plataforma pela sua equipe."
      },
      {
        title: "Adoção de Features",
        description: "Identifique quais recursos são mais usados e onde sua equipe precisa de mais treinamento."
      },
      {
        title: "Funil de Marketing",
        description: "Acompanhe desde impressões até conversões para calcular ROI e CAC com precisão."
      }
    ]
  },
  {
    category: "POPs & Processos",
    icon: FileText,
    color: "text-teal-600",
    tips: [
      {
        title: "Versionamento Automático",
        description: "Toda alteração em um POP gera uma nova versão com histórico completo de mudanças."
      },
      {
        title: "Tarefas Baseadas em POPs",
        description: "Crie tarefas diretamente de POPs para garantir que os processos sejam seguidos corretamente."
      },
      {
        title: "Busca e Favoritos",
        description: "Marque POPs como favoritos e use tags para encontrá-los rapidamente."
      }
    ]
  }
];

export default function WhatsNewModal({ open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            Novidades & Dicas
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="whats-new" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="whats-new" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              O que há de novo
            </TabsTrigger>
            <TabsTrigger value="tips" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Dicas & Truques
            </TabsTrigger>
          </TabsList>

          <TabsContent value="whats-new" className="flex-1 overflow-y-auto space-y-6 pr-2">
            {whatsNewItems.map((release, idx) => (
              <div key={idx}>
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant={release.isNew ? "default" : "outline"} className={cn(release.isNew && "bg-indigo-600")}>
                    {release.isNew ? "NOVO" : ""}
                  </Badge>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Versão {release.version}
                  </h3>
                  <span className="text-sm text-slate-500">{release.date}</span>
                </div>

                <div className="grid gap-4">
                  {release.features.map((feature, fidx) => (
                    <Card key={fidx} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex items-start gap-4">
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", feature.bgColor)}>
                          <feature.icon className={cn("w-6 h-6", feature.color)} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 mb-1">{feature.title}</h4>
                          <p className="text-sm text-slate-600">{feature.description}</p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="tips" className="flex-1 overflow-y-auto space-y-6 pr-2">
            {tipsAndTricks.map((section, idx) => (
              <div key={idx}>
                <div className="flex items-center gap-3 mb-4">
                  <section.icon className={cn("w-5 h-5", section.color)} />
                  <h3 className="text-lg font-semibold text-slate-900">{section.category}</h3>
                </div>

                <div className="space-y-3">
                  {section.tips.map((tip, tidx) => (
                    <Card key={tidx} className="border-0 shadow-sm bg-slate-50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-indigo-600">{tidx + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 mb-1">{tip.title}</h4>
                            <p className="text-sm text-slate-600">{tip.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} className="bg-indigo-600 hover:bg-indigo-700">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { LATEST_VERSION };
