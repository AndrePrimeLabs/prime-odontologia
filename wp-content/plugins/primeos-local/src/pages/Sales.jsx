// @ts-nocheck
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Target, Heart, TrendingUp, MessageCircle, Phone, Copy, 
  CheckCircle, XCircle, AlertTriangle, BookOpen,
  Users, DollarSign, Zap, ArrowRight, Star, Trophy, BarChart2, Medal
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Sales() {
  const [copiedScript, setCopiedScript] = useState(null);

  const copyToClipboard = (text, scriptName) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(scriptName);
    toast.success("Script copiado!");
    setTimeout(() => setCopiedScript(null), 2000);
  };

  const salesPhilosophy = {
    principle: "Na Prime, não vendemos procedimentos. Vendemos soluções para pessoas.",
    whenSaleHappens: [
      "Se sente ouvido",
      "Confia no profissional",
      "Entende o valor do tratamento",
      "Visualiza o resultado"
    ],
    notSales: [
      "Falar de preço antes de valor",
      "Pressionar o paciente",
      "Comparar com concorrentes",
      "Usar medo ou urgência falsa"
    ],
    isSales: [
      "Escuta ativa",
      "Clareza",
      "Previsibilidade",
      "Humanização",
      "Educação"
    ]
  };

  const valueStairs = [
    {
      level: "Low Ticket",
      color: "from-green-500 to-emerald-600",
      badge: "bg-green-100 text-green-700",
      title: "Entrada & Confiança",
      examples: ["Consulta", "Limpeza", "Plano preventivo"],
      icon: CheckCircle
    },
    {
      level: "Mid Ticket",
      color: "from-amber-500 to-orange-600",
      badge: "bg-amber-100 text-amber-700",
      title: "Conversão",
      examples: ["Clareamento", "Facetas em resina", "Ortodontia tradicional"],
      icon: TrendingUp
    },
    {
      level: "High Ticket",
      color: "from-indigo-500 to-purple-600",
      badge: "bg-indigo-100 text-indigo-700",
      title: "Transformação",
      examples: ["Invisalign", "Lentes de porcelana", "Implantes"],
      icon: Star
    }
  ];

  const primeMethod = [
    {
      step: 1,
      name: "Conexão Humana",
      objective: "Quebrar medo e criar conforto",
      phrases: [
        "Quero entender o que mais te incomoda no seu sorriso.",
        "Aqui você pode falar com tranquilidade, sem julgamento."
      ]
    },
    {
      step: 2,
      name: "Identificação da Dor",
      objective: "Entender dor funcional e emocional",
      phrases: [
        "O que te incomoda hoje?",
        "Isso afeta sua confiança?",
        "Há quanto tempo você pensa em resolver isso?"
      ]
    },
    {
      step: 3,
      name: "Validação",
      objective: "Mostrar empatia e normalizar",
      phrases: [
        "Isso é mais comum do que você imagina.",
        "Muitas pessoas chegam aqui com esse receio."
      ]
    },
    {
      step: 4,
      name: "Educação (Valor)",
      objective: "Explicar soluções, não vender ainda",
      items: [
        "Mostrar opções",
        "Explicar benefícios",
        "Falar de previsibilidade",
        "Usar linguagem simples"
      ]
    },
    {
      step: 5,
      name: "Proposta Consultiva",
      objective: "Recomendar, não impor",
      model: "Pelo que você me contou, a solução que mais se encaixa hoje é..."
    },
    {
      step: 6,
      name: "Investimento (Preço)",
      objective: "Preço só entra aqui",
      items: [
        "Apresentar como investimento",
        "Mostrar formas de pagamento",
        "Reforçar valor entregue"
      ],
      warning: true
    },
    {
      step: 7,
      name: "Fechamento Humanizado",
      objective: "Segurança, não pressão",
      phrases: [
        "Faz sentido para você?",
        "Quer pensar com calma ou já prefere agendar?"
      ]
    }
  ];

  const treatmentScripts = [
    {
      treatment: "Invisalign",
      tier: "High Ticket",
      color: "indigo",
      structure: [
        { label: "Discovery", text: "Você já pensou em alinhar seus dentes, mas não queria usar aparelho metálico?" },
        { label: "Education", text: "O Invisalign é um tratamento com alinhadores transparentes, praticamente invisíveis, removíveis e muito confortáveis. Aqui na Prime, fazemos todo o planejamento digital para mostrar o resultado antes mesmo de começar." },
        { label: "Value Anchor", text: "Além da estética, o alinhamento melhora a mordida, facilita a higiene e evita desgastes futuros." },
        { label: "CTA", text: "O primeiro passo é uma avaliação com escaneamento digital. Posso verificar um horário para você?" }
      ]
    },
    {
      treatment: "Implante",
      tier: "High Ticket",
      color: "purple",
      structure: [
        { label: "Empathy", text: "Entendo como a perda de um dente pode impactar mastigação e autoestima." },
        { label: "Authority", text: "Aqui na Prime Odontologia trabalhamos com planejamento seguro, exames detalhados e acompanhamento próximo em todas as etapas." },
        { label: "Outcome", text: "O implante devolve função, conforto e estética natural, trazendo mais segurança no dia a dia." },
        { label: "CTA", text: "O ideal é fazermos uma avaliação para entender o seu caso. Posso agendar para você?" }
      ]
    },
    {
      treatment: "Clareamento",
      tier: "Mid Ticket",
      color: "amber",
      script: "O clareamento é um tratamento simples, com resultado rápido e grande impacto na autoestima. Muitas pessoas começam por ele antes de outros tratamentos estéticos."
    },
    {
      treatment: "Plano Preventivo",
      tier: "Low Ticket",
      color: "green",
      script: "O plano preventivo ajuda a manter a saúde bucal ao longo do ano e evita tratamentos mais complexos no futuro."
    }
  ];

  const whatsappScripts = [
    {
      name: "1.1 Primeiro Contato",
      script: `Olá 😊 Tudo bem?
Aqui é a Clara, da Prime Odontologia 🦷

Que bom receber sua mensagem!
Para te ajudar da melhor forma, posso te fazer algumas perguntinhas rápidas?`
    },
    {
      name: "1.2 Qualificação",
      script: `Perfeito 💙
Me conta, por favor:

1️⃣ O que te incomoda ou o que você gostaria de melhorar no seu sorriso hoje?
2️⃣ Você sente dor ou é mais uma questão estética/preventiva?
3️⃣ Já fez algum tratamento odontológico recentemente?`
    },
    {
      name: "1.3 Oferta de Avaliação",
      script: `Entendi 😊
Aqui na Prime Odontologia trabalhamos com uma avaliação bem completa, humanizada e sem pressa.

👉 Nessa consulta fazemos:
✔ Avaliação clínica detalhada
✔ Orientação personalizada
✔ Quando indicado, limpeza preventiva

Assim conseguimos indicar o melhor tratamento para você, com clareza e sem surpresas.

Posso verificar os horários disponíveis para você?`
    },
    {
      name: "1.4 Confirmação",
      script: `Perfeito! Seu atendimento ficou agendado 💙

📍 Prime Odontologia
📅 Data: ____
⏰ Horário: ____

Qualquer imprevisto é só nos avisar com antecedência 😊
Te esperamos!`
    },
    {
      name: "1.5 Lembrete 24h",
      script: `Oi 😊
Passando para confirmar sua consulta amanhã na Prime Odontologia 🦷

📅 ____ | ⏰ ____

Estamos te aguardando 💙`
    }
  ];

  const objections = [
    {
      objection: "Está caro",
      response: "Entendo. Antes de falar em valor, o mais importante é você se sentir seguro com a solução. Vamos revisar juntos o que está incluso?"
    },
    {
      objection: "Preciso pensar",
      response: "Claro. Pensar faz parte. Posso te explicar novamente os benefícios para te ajudar nessa decisão?"
    },
    {
      objection: "Tenho medo",
      response: "Esse medo é muito comum. Nosso atendimento é focado em conforto e acolhimento. Você nunca estará sozinho no processo."
    }
  ];

  const topServices = [
    { name: "Invisalign", revenue: 48000, units: 12, tier: "High Ticket", color: "#6366f1", growth: "+18%" },
    { name: "Implante", revenue: 35000, units: 7, tier: "High Ticket", color: "#8b5cf6", growth: "+12%" },
    { name: "Lentes de Porcelana", revenue: 28000, units: 14, tier: "High Ticket", color: "#a78bfa", growth: "+24%" },
    { name: "Clareamento", revenue: 15000, units: 50, tier: "Mid Ticket", color: "#f59e0b", growth: "+8%" },
    { name: "Ortodontia", revenue: 12000, units: 8, tier: "Mid Ticket", color: "#f97316", growth: "+5%" },
    { name: "Consulta/Limpeza", revenue: 9000, units: 90, tier: "Low Ticket", color: "#22c55e", growth: "+3%" },
  ];

  const goldenRules = [
    "Valor antes de preço",
    "Pessoas antes de procedimentos",
    "Clareza gera confiança",
    "Confiança gera venda",
    "Venda gera relacionamento"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Sales - Manual de Vendas</h1>
              <p className="text-slate-500">Scripts, metodologia e processos de vendas Prime</p>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="philosophy" className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-7 h-auto gap-2">
            <TabsTrigger value="philosophy" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Filosofia
            </TabsTrigger>
            <TabsTrigger value="method" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Método
            </TabsTrigger>
            <TabsTrigger value="scripts" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Scripts
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="objections" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Objeções
            </TabsTrigger>
            <TabsTrigger value="top-services" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Mais Vendidos
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Regras
            </TabsTrigger>
          </TabsList>

          {/* FILOSOFIA */}
          <TabsContent value="philosophy" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Heart className="w-6 h-6 text-blue-600" />
                    Princípio Central
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl text-slate-800 font-semibold mb-6">{salesPhilosophy.principle}</p>
                  
                  <div className="bg-white rounded-xl p-6 mb-4">
                    <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      A venda acontece quando o paciente:
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {salesPhilosophy.whenSaleHappens.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-slate-700">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
                      <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                        <XCircle className="w-5 h-5" />
                        O que NÃO é venda na Prime
                      </h3>
                      <div className="space-y-2">
                        {salesPhilosophy.notSales.map((item, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-red-700">
                            <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                      <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        O que É venda na Prime
                      </h3>
                      <div className="space-y-2">
                        {salesPhilosophy.isSales.map((item, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-green-700">
                            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Escada de Valor */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-indigo-600" />
                    A Escada de Valor
                  </CardTitle>
                  <p className="text-sm text-slate-500">Toda venda na Prime segue esta ordem: LOW → MID → HIGH</p>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {valueStairs.map((tier, i) => {
                      const Icon = tier.icon;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + i * 0.1 }}
                          className={cn("rounded-xl p-6 text-white bg-gradient-to-br", tier.color)}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <Icon className="w-6 h-6" />
                            <h3 className="font-bold text-lg">{tier.level}</h3>
                          </div>
                          <p className="text-sm opacity-90 mb-4">{tier.title}</p>
                          <div className="space-y-2">
                            {tier.examples.map((ex, j) => (
                              <div key={j} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-4 h-4" />
                                {ex}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  <div className="mt-6 p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
                    <p className="text-amber-900 font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Nunca pule etapas sem fit real.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* MÉTODO PRIME */}
          <TabsContent value="method" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-6 h-6 text-indigo-600" />
                  O Método Prime de Vendas - 7 Etapas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {primeMethod.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative"
                  >
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                        {step.step}
                      </div>
                      <div className="flex-1 bg-slate-50 rounded-xl p-4 border-2 border-slate-200">
                        <h3 className="font-bold text-slate-900 text-lg mb-1">{step.name}</h3>
                        <p className="text-sm text-slate-600 mb-3 italic">Objetivo: {step.objective}</p>
                        
                        {step.phrases && (
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-slate-700">Frases-chave:</p>
                            {step.phrases.map((phrase, j) => (
                              <div key={j} className="bg-white p-3 rounded-lg border border-slate-200 text-sm text-slate-700">
                                "{phrase}"
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {step.items && (
                          <div className="space-y-2">
                            {step.items.map((item, j) => (
                              <div key={j} className="flex items-center gap-2 text-sm text-slate-700">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                {item}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {step.model && (
                          <div className="bg-indigo-50 p-3 rounded-lg border-2 border-indigo-200">
                            <p className="text-sm text-indigo-900 font-semibold">Modelo:</p>
                            <p className="text-sm text-indigo-800 italic mt-1">"{step.model}"</p>
                          </div>
                        )}
                        
                        {step.warning && (
                          <div className="mt-3 p-3 bg-amber-50 rounded-lg border-2 border-amber-200">
                            <p className="text-amber-900 font-semibold text-sm flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" />
                              Preço só entra aqui!
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    {i < primeMethod.length - 1 && (
                      <div className="ml-6 h-6 w-0.5 bg-gradient-to-b from-indigo-300 to-purple-300"></div>
                    )}
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SCRIPTS POR TRATAMENTO */}
          <TabsContent value="scripts" className="space-y-4">
            {treatmentScripts.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={cn("border-0 shadow-lg border-l-4", `border-l-${item.color}-500`)}>
                  <CardHeader className={cn("bg-gradient-to-r", `from-${item.color}-50 to-${item.color}-100`)}>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Target className={cn("w-5 h-5", `text-${item.color}-600`)} />
                        {item.treatment}
                      </CardTitle>
                      <Badge className={cn(`bg-${item.color}-100 text-${item.color}-700`)}>
                        {item.tier}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {item.structure ? (
                      <div className="space-y-4">
                        {item.structure.map((section, j) => (
                          <div key={j} className="relative">
                            <div className="flex items-start gap-3">
                              <Badge className="flex-shrink-0">{section.label}</Badge>
                              <div className="flex-1 bg-slate-50 p-3 rounded-lg">
                                <p className="text-slate-700">{section.text}</p>
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => copyToClipboard(section.text, `${item.treatment}-${section.label}`)}
                                className="flex-shrink-0"
                              >
                                {copiedScript === `${item.treatment}-${section.label}` ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <div className="flex-1 bg-slate-50 p-4 rounded-lg">
                          <p className="text-slate-700">{item.script}</p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => copyToClipboard(item.script, item.treatment)}
                          className="flex-shrink-0"
                        >
                          {copiedScript === item.treatment ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* WHATSAPP SCRIPTS */}
          <TabsContent value="whatsapp" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                  Scripts WhatsApp - Prontos para Copiar
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {whatsappScripts.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-green-600" />
                          {item.name}
                        </h3>
                        <div className="bg-slate-50 p-4 rounded-lg border-2 border-slate-200 whitespace-pre-wrap text-sm text-slate-700">
                          {item.script}
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copyToClipboard(item.script, item.name)}
                        className="flex-shrink-0 mt-8"
                      >
                        {copiedScript === item.name ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* OBJEÇÕES */}
          <TabsContent value="objections" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                  Tratamento de Objeções - Padrão Prime
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {objections.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-slate-50 rounded-xl p-5 border-2 border-slate-200"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                      <h3 className="font-bold text-slate-900 text-lg">"{item.objection}"</h3>
                    </div>
                    <div className="pl-8 flex items-start gap-3">
                      <div className="flex-1 bg-white p-4 rounded-lg border-2 border-green-200">
                        <p className="text-slate-700">{item.response}</p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copyToClipboard(item.response, item.objection)}
                        className="flex-shrink-0"
                      >
                        {copiedScript === item.objection ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* MAIS VENDIDOS */}
          <TabsContent value="top-services" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Receita Total", value: "R$ 147.000", icon: DollarSign, color: "indigo" },
                  { label: "Tratamentos Vendidos", value: "181 unid.", icon: BarChart2, color: "green" },
                  { label: "Ticket Médio", value: "R$ 812", icon: TrendingUp, color: "amber" },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={i} className="border-0 shadow-md">
                      <CardContent className="p-5 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                          <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">{stat.label}</p>
                          <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <Card className="border-0 shadow-lg h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-indigo-600" />
                      Receita por Tratamento (R$)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={topServices} layout="vertical" margin={{ left: 80, right: 20 }}>
                        <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                        <Tooltip formatter={v => [`R$ ${v.toLocaleString("pt-BR")}`, "Receita"]} />
                        <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                          {topServices.map((s, i) => <Cell key={i} fill={s.color} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                <Card className="border-0 shadow-lg h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-500" />
                      Ranking de Produtos/Serviços
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {topServices.map((s, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${i === 0 ? "bg-amber-400" : i === 1 ? "bg-slate-400" : i === 2 ? "bg-orange-400" : "bg-slate-200 text-slate-600"}`}>
                          {i < 3 ? <Medal className="w-4 h-4" /> : i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-800 text-sm truncate">{s.name}</span>
                            <span className="text-xs font-bold text-emerald-600 ml-2 flex-shrink-0">{s.growth}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full" style={{ width: `${(s.revenue / 48000) * 100}%`, backgroundColor: s.color }} />
                            </div>
                            <span className="text-xs text-slate-500 flex-shrink-0">{s.units} und.</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-slate-900">R$ {(s.revenue / 1000).toFixed(0)}k</p>
                          <Badge className="text-xs" style={{ backgroundColor: s.color + "20", color: s.color }}>{s.tier}</Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* REGRAS DE OURO */}
          <TabsContent value="rules" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-yellow-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Star className="w-6 h-6 text-amber-600" />
                    Regras de Ouro do Manual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {goldenRules.map((rule, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-xl p-6 border-2 border-amber-200 shadow-md"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold shadow-lg">
                            {i + 1}
                          </div>
                          <p className="font-bold text-slate-900">{rule}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Papel da Equipe */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-6 h-6 text-indigo-600" />
                    Papel da Equipe - Claro e Padronizado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg">
                        <Phone className="w-8 h-8" />
                      </div>
                      <h3 className="font-bold text-slate-900 mb-2">Atendimento / Recepção</h3>
                      <div className="space-y-1 text-sm text-slate-600">
                        <p>• Conectar</p>
                        <p>• Qualificar</p>
                        <p>• Agendar</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg">
                        <Heart className="w-8 h-8" />
                      </div>
                      <h3 className="font-bold text-slate-900 mb-2">Dentista</h3>
                      <div className="space-y-1 text-sm text-slate-600">
                        <p>• Diagnosticar</p>
                        <p>• Educar</p>
                        <p>• Recomendar</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg">
                        <Target className="w-8 h-8" />
                      </div>
                      <h3 className="font-bold text-slate-900 mb-2">CRM</h3>
                      <div className="space-y-1 text-sm text-slate-600">
                        <p>• Acompanhar</p>
                        <p>• Reativar</p>
                        <p>• Cuidar</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Status */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <h3 className="font-bold text-slate-900 text-xl mb-1">Status Final</h3>
                      <div className="flex flex-wrap gap-2">
                        {["Manual oficial pronto", "Ético e humanizado", "Integrado ao OS", "Pronto para IA", "Franquia-ready"].map((status, i) => (
                          <Badge key={i} className="bg-green-100 text-green-700">
                            ✓ {status}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
