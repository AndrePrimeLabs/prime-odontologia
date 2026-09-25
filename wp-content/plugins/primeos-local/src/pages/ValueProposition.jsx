// @ts-nocheck
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Heart, Shield, Zap, Award, Check } from "lucide-react";

export default function ValueProposition() {
  const valueProps = [
    {
      title: "Estética Natural",
      description: "Sorrisos bonitos e alinhados sem exageros, respeitando a naturalidade",
      icon: Sparkles,
      color: "text-pink-600",
      bg: "bg-pink-50",
      benefits: [
        "Sem aparência artificial",
        "Harmonia facial respeitada",
        "Resultado elegante e discreto"
      ]
    },
    {
      title: "Saúde Bucal",
      description: "Foco em tratamentos que garantem saúde a longo prazo",
      icon: Heart,
      color: "text-red-600",
      bg: "bg-red-50",
      benefits: [
        "Prevenção de problemas futuros",
        "Higiene facilitada",
        "Bem-estar completo"
      ]
    },
    {
      title: "Discrição",
      description: "Invisalign e tratamentos invisíveis para quem valoriza privacidade",
      icon: Shield,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      benefits: [
        "Alinhadores transparentes",
        "Ninguém percebe o tratamento",
        "Conforto no dia a dia"
      ]
    },
    {
      title: "Tecnologia",
      description: "Planejamento digital, escaneamento 3D e previsibilidade total",
      icon: Zap,
      color: "text-blue-600",
      bg: "bg-blue-50",
      benefits: [
        "Visualização antes de começar",
        "Precisão no tratamento",
        "Resultados previsíveis"
      ]
    },
    {
      title: "Atendimento Premium",
      description: "Experiência humanizada com a Silvia e equipe especializada",
      icon: Award,
      color: "text-purple-600",
      bg: "bg-purple-50",
      benefits: [
        "Escuta ativa e empatia",
        "Acompanhamento personalizado",
        "Suporte em todas as etapas"
      ]
    }
  ];

  const customerPains = [
    "Vergonha de sorrir em público",
    "Dentes tortos ou desalinhados",
    "Dentes manchados",
    "Medo de aparelhos metálicos",
    "Falta de tempo para consultas longas",
    "Experiências ruins anteriores",
    "Insegurança ao falar",
    "Falta de previsibilidade no tratamento"
  ];

  const customerGains = [
    "Sorriso bonito e confiante",
    "Tratamento praticamente invisível",
    "Conforto no dia a dia",
    "Resultados previsíveis",
    "Aumento da autoestima",
    "Melhora na imagem profissional",
    "Saúde bucal garantida",
    "Experiência premium"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Proposta de Valor</h1>
          <p className="text-slate-600">Bloco 2 - Business Model Canvas</p>
        </div>

        {/* Main Value Proposition */}
        <Card className="mb-8 border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-2xl text-indigo-900">
              Sorrisos Alinhados com Naturalidade
            </CardTitle>
            <CardDescription className="text-lg text-indigo-700">
              Tecnologia, saúde e estética em equilíbrio para quem valoriza imagem e bem-estar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 leading-relaxed">
              A Prime Odontologia oferece um sorriso higiênico, limpo, saudável, alinhado e natural — 
              que transmite confiança, cuidado e sucesso. Através de Invisalign e ortodontia digital estética, 
              proporcionamos tratamentos discretos, confortáveis e previsíveis para adultos que valorizam sua imagem.
            </p>
          </CardContent>
        </Card>

        {/* Value Pillars */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Pilares de Valor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {valueProps.map((prop, idx) => (
              <Card key={idx} className="hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl ${prop.bg} flex items-center justify-center mb-3`}>
                    <prop.icon className={`w-6 h-6 ${prop.color}`} />
                  </div>
                  <CardTitle className="text-lg">{prop.title}</CardTitle>
                  <CardDescription>{prop.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {prop.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pain Relievers & Gain Creators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-2 border-red-100">
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center gap-2 text-red-900">
                <span className="text-2xl">😟</span>
                Dores que Resolvemos
              </CardTitle>
              <CardDescription>Pain Relievers</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {customerPains.map((pain, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 p-2 bg-white rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                    {pain}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-100">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center gap-2 text-green-900">
                <span className="text-2xl">😊</span>
                Ganhos que Entregamos
              </CardTitle>
              <CardDescription>Gain Creators</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {customerGains.map((gain, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 p-2 bg-white rounded-lg">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {gain}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
