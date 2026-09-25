// @ts-nocheck
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Target, Gem, Trophy, Users, DoorOpen, Zap, Heart,
  TrendingUp, Rocket, CheckCircle, Star, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Strategy() {
  const sections = [
    {
      id: "value",
      title: "Proposta de Valor",
      icon: Gem,
      color: "from-purple-500 to-pink-600",
      promise: "Estética, conforto e confiança em cada sorriso.",
      items: [
        "Tratamentos odontológicos modernos, estéticos e confortáveis",
        "Foco estratégico em Invisalign",
        "Planejamento digital e atendimento humanizado",
        "Promove saúde bucal, autoestima e confiança"
      ]
    },
    {
      id: "differentials",
      title: "Diferencial Competitivo",
      icon: Trophy,
      color: "from-amber-500 to-orange-600",
      items: [
        "Foco estratégico em Invisalign como produto premium",
        "Tecnologia aliada ao cuidado humano",
        "Planejamento previsível do sorriso",
        "Experiência confortável e sem julgamentos",
        "Operação padronizada, escalável e franquia-ready"
      ]
    },
    {
      id: "segments",
      title: "Segmentos de Clientes",
      icon: Users,
      color: "from-blue-500 to-indigo-600",
      segments: [
        { label: "Principal", desc: "Adultos e jovens adultos (18-45 anos) que valorizam estética, conforto e discrição", type: "primary" },
        { label: "Secundário", desc: "Pacientes de manutenção da saúde bucal e ortodontia tradicional", type: "secondary" },
        { label: "Expansão", desc: "Clínicas/franquias que adotam o modelo Prime (via OMNIOS)", type: "expansion" }
      ]
    },
    {
      id: "channels",
      title: "Canais",
      icon: DoorOpen,
      color: "from-green-500 to-emerald-600",
      channels: [
        { name: "WhatsApp", role: "Principal canal de conversão", priority: "high" },
        { name: "Instagram", role: "Atração, educação e autoridade", priority: "high" },
        { name: "Site Institucional", role: "Credibilidade", priority: "medium" },
        { name: "Google", role: "SEO e avaliações", priority: "medium" },
        { name: "Indicação", role: "Boca a boca", priority: "high" }
      ]
    },
    {
      id: "relationship",
      title: "Relacionamento com Clientes",
      icon: Heart,
      color: "from-red-500 to-pink-600",
      items: [
        "Atendimento acolhedor e empático",
        "Escuta ativa e abordagem consultiva",
        "Comunicação clara e educativa",
        "Acompanhamento contínuo durante todo o tratamento",
        "Pós-atendimento e relacionamento de longo prazo"
      ]
    },
    {
      id: "revenue",
      title: "Fontes de Receita",
      icon: TrendingUp,
      color: "from-emerald-500 to-teal-600",
      items: [
        "Invisalign (principal fonte – ticket alto)",
        "Ortodontia tradicional",
        "Limpeza e procedimentos preventivos",
        "Manutenções e revisões periódicas",
        "Planos e parcelamentos personalizados",
        "Upsell e cross-sell de tratamentos estéticos"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Estratégia Prime Odontologia</h1>
              <p className="text-slate-500">Business Model Generation Canvas</p>
            </div>
          </div>

          {/* Visão Estratégica */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50 mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Rocket className="w-8 h-8 text-indigo-600 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Visão Estratégica
                  </h2>
                  <p className="text-lg text-slate-700 leading-relaxed mb-3">
                    A Prime Odontologia se posiciona como uma <strong>clínica moderna, estética e humana</strong>, 
                    com um modelo de negócio replicável, sustentado por tecnologia, processos e inteligência artificial, 
                    preparada para escala e franquias.
                  </p>
                  <div className="p-4 bg-white rounded-xl border-2 border-indigo-200">
                    <p className="text-base font-semibold text-indigo-900">
                      💎 Em uma frase:
                    </p>
                    <p className="text-lg text-slate-800 mt-2">
                      A Prime Odontologia combina <strong>estética, tecnologia e cuidado humano</strong> para 
                      transformar sorrisos de forma previsível, confortável e escalável.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Grid de Seções Estratégicas */}
        <div className="space-y-6">
          {/* Proposta de Valor - Destaque */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white overflow-hidden">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Gem className="w-7 h-7" />
                  Proposta de Valor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-4">
                  <p className="text-3xl font-bold mb-2">"{sections[0].promise}"</p>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {sections[0].items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Diferencial Competitivo */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="border-0 shadow-lg border-l-4 border-l-amber-500">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-amber-600" />
                  Diferencial Competitivo
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-3">
                  {sections[1].items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <Star className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Segmentos de Clientes */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-0 shadow-lg border-l-4 border-l-blue-500">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-600" />
                  Segmentos de Clientes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-4">
                  {sections[2].segments.map((seg, i) => {
                    const colors = seg.type === "primary" ? "bg-blue-500" : seg.type === "secondary" ? "bg-indigo-500" : "bg-purple-500";
                    return (
                      <div key={i} className="relative">
                        <div className={cn("absolute top-0 left-0 w-1 h-full rounded-l-lg", colors)}></div>
                        <div className="pl-4 p-4 bg-slate-50 rounded-lg">
                          <Badge className={cn("mb-2", colors, "text-white")}>{seg.label}</Badge>
                          <p className="text-sm text-slate-700">{seg.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Canais */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <Card className="border-0 shadow-lg border-l-4 border-l-green-500 h-full">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="flex items-center gap-2">
                    <DoorOpen className="w-6 h-6 text-green-600" />
                    Canais
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    {sections[3].channels.map((ch, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className={cn("w-2 h-2 rounded-full", ch.priority === "high" ? "bg-green-500" : "bg-slate-400")}></div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{ch.name}</p>
                          <p className="text-xs text-slate-500">{ch.role}</p>
                        </div>
                        {ch.priority === "high" && <Badge className="bg-green-100 text-green-700">Alta Prioridade</Badge>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Relacionamento com Clientes */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="border-0 shadow-lg border-l-4 border-l-red-500 h-full">
                <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-6 h-6 text-red-600" />
                    Relacionamento com Clientes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    {sections[4].items.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Fontes de Receita */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Card className="border-0 shadow-lg border-l-4 border-l-emerald-500">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                  Fontes de Receita
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sections[5].items.map((item, i) => (
                    <div key={i} className={cn("p-4 rounded-xl border-2", i === 0 ? "bg-emerald-100 border-emerald-400" : "bg-slate-50 border-slate-200")}>
                      <div className="flex items-start gap-2">
                        {i === 0 && <Star className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />}
                        <div>
                          <p className={cn("font-semibold text-sm", i === 0 ? "text-emerald-900" : "text-slate-900")}>{item}</p>
                          {i === 0 && <p className="text-xs text-emerald-700 mt-1">Receita Principal</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recursos e Atividades-Chave */}
          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="border-0 shadow-lg border-l-4 border-l-cyan-500 h-full">
                <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Zap className="w-5 h-5 text-cyan-600" />
                    Recursos-Chave
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    {[
                      "Equipe odontológica especializada",
                      "Certificação e tecnologia Invisalign",
                      "Equipamentos odontológicos modernos",
                      "Planejamento digital do sorriso",
                      "Marca Prime Odontologia",
                      "Sistema de gestão (OMNIOS + Notion + IA)"
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
              <Card className="border-0 shadow-lg border-l-4 border-l-violet-500 h-full">
                <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Target className="w-5 h-5 text-violet-600" />
                    Atividades-Chave
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    {[
                      "Avaliações e diagnósticos personalizados",
                      "Planejamento digital dos tratamentos",
                      "Execução clínica dos tratamentos",
                      "Atendimento e relacionamento com pacientes",
                      "Marketing digital e geração de demanda",
                      "Gestão da experiência do paciente"
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500"></div>
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}