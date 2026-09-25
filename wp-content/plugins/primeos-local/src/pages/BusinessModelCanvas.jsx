// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Puzzle, Settings, Package, Gem, Heart, DoorOpen, Users, DollarSign, TrendingDown,
  Target, CheckCircle, AlertCircle, Info
} from "lucide-react";
import { cn } from "@/lib/utils";

const dependencyColors = {
  alta: { bg: "bg-red-100", text: "text-red-700", border: "border-red-300" },
  media: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-300" },
  baixa: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" }
};

const importanceColors = {
  muito_alta: { bg: "bg-purple-100", text: "text-purple-700" },
  alta: { bg: "bg-blue-100", text: "text-blue-700" },
  media: { bg: "bg-slate-100", text: "text-slate-700" }
};

const categoryLabels = {
  fornecedor_estrategico: "Fornecedor Estratégico",
  laboratorio: "Laboratório",
  equipamento_material: "Equipamento/Material",
  pagamento_financiamento: "Pagamento/Financiamento",
  profissional_saude: "Profissional Saúde",
  assistencia_tecnica: "Assistência Técnica"
};

export default function BusinessModelCanvas() {
  const [activeTab, setActiveTab] = useState("canvas");

  const { data: partners = [] } = useQuery({
    queryKey: ["keyPartners"],
    queryFn: () => primeos.entities.KeyPartner.list()
  });

  const canvasBlocks = [
    {
      id: "partners",
      title: "Key Partners",
      icon: Puzzle,
      color: "from-purple-500 to-indigo-600",
      content: [
        "Invisalign (fornecedor estratégico)",
        "Laboratórios odontológicos",
        "Fornecedores (Neodent, Dental Cremer, Promodental, Ortodente)",
        "Plataformas de pagamento e financiamento",
        "Profissionais parceiros da área da saúde",
        "Assistência técnica especializada"
      ]
    },
    {
      id: "activities",
      title: "Key Activities",
      icon: Settings,
      color: "from-blue-500 to-cyan-600",
      content: [
        "Atendimento odontológico clínico e estético",
        "Planejamento digital e execução de tratamentos",
        "Ortodontia, implantodontia, estética e reabilitação oral",
        "Gestão de relacionamento com pacientes",
        "Controle de qualidade e biossegurança"
      ]
    },
    {
      id: "resources",
      title: "Key Resources",
      icon: Package,
      color: "from-emerald-500 to-teal-600",
      content: [
        "Equipe odontológica especializada",
        "Equipamentos e tecnologias odontológicas",
        "Materiais clínicos de alta qualidade",
        "Marca Prime Odontologia",
        "Parcerias estratégicas e know-how técnico"
      ]
    },
    {
      id: "value",
      title: "Value Proposition",
      icon: Gem,
      color: "from-pink-500 to-rose-600",
      content: [
        "Tratamentos odontológicos modernos, estéticos e seguros",
        "Uso de tecnologia de ponta (alinhadores invisíveis)",
        "Atendimento humanizado e personalizado",
        "Facilidade de pagamento e acesso ao tratamento",
        "Resultados previsíveis e alto padrão de qualidade"
      ]
    },
    {
      id: "relationships",
      title: "Customer Relationships",
      icon: Heart,
      color: "from-red-500 to-pink-600",
      content: [
        "Atendimento próximo e personalizado",
        "Acompanhamento contínuo do tratamento",
        "Pós-atendimento e fidelização",
        "Comunicação clara e transparente sobre planos e custos"
      ]
    },
    {
      id: "channels",
      title: "Channels",
      icon: DoorOpen,
      color: "from-amber-500 to-orange-600",
      content: [
        "Clínica física",
        "Indicação de pacientes",
        "Parcerias profissionais",
        "Redes sociais e marketing digital",
        "WhatsApp e canais diretos de comunicação"
      ]
    },
    {
      id: "segments",
      title: "Customer Segments",
      icon: Users,
      color: "from-indigo-500 to-purple-600",
      content: [
        "Adultos que buscam estética e alinhamento dental",
        "Pacientes que necessitam de reabilitação oral",
        "Pessoas que valorizam tecnologia, conforto e qualidade",
        "Público de médio e alto poder aquisitivo"
      ]
    },
    {
      id: "revenue",
      title: "Revenue Streams",
      icon: DollarSign,
      color: "from-green-500 to-emerald-600",
      content: [
        "Tratamentos ortodônticos (alinhadores)",
        "Implantes e próteses",
        "Estética dental (facetas, lentes, clareamento)",
        "Reabilitações orais completas",
        "Procedimentos clínicos gerais"
      ]
    },
    {
      id: "costs",
      title: "Cost Structure",
      icon: TrendingDown,
      color: "from-slate-500 to-gray-600",
      content: [
        "Materiais e insumos odontológicos",
        "Custos com laboratórios",
        "Equipamentos e manutenção",
        "Folha de pagamento e honorários",
        "Marketing e aquisição de clientes",
        "Taxas financeiras e administrativas"
      ]
    }
  ];

  const partnersByDependency = {
    alta: partners.filter(p => p.dependency_level === "alta"),
    media: partners.filter(p => p.dependency_level === "media"),
    baixa: partners.filter(p => p.dependency_level === "baixa")
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-6">
      <div className="max-w-[1800px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Puzzle className="w-8 h-8 text-purple-600" />
                Business Model Canvas
              </h1>
              <p className="text-slate-500 mt-1">Prime Odontologia - Modelo de Negócio Estratégico</p>
            </div>
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="canvas"><Target className="w-4 h-4 mr-2" />Canvas Completo</TabsTrigger>
            <TabsTrigger value="partners"><Puzzle className="w-4 h-4 mr-2" />Key Partners</TabsTrigger>
            <TabsTrigger value="matrix"><Info className="w-4 h-4 mr-2" />Matriz Estratégica</TabsTrigger>
          </TabsList>

          {/* Canvas Completo */}
          <TabsContent value="canvas">
            <div className="grid lg:grid-cols-3 gap-4">
              {canvasBlocks.map((block, idx) => {
                const Icon = block.icon;
                return (
                  <motion.div key={block.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                    <Card className={cn("border-0 shadow-lg h-full overflow-hidden", block.id === "value" && "lg:col-span-3")}>
                      <CardHeader className={cn("bg-gradient-to-r text-white", block.color)}>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Icon className="w-5 h-5" />
                          {block.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <ul className={cn("space-y-2", block.id === "value" && "grid md:grid-cols-2 lg:grid-cols-5 gap-3")}>
                          {block.content.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-slate-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <Card className="mt-6 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Target className="w-6 h-6 text-purple-600 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 mb-2">Visão Executiva</h3>
                    <p className="text-slate-700 leading-relaxed">
                      A <strong>Prime Odontologia</strong> opera com um <strong>modelo premium orientado à qualidade, tecnologia e experiência do paciente</strong>, 
                      sustentado por parcerias estratégicas, processos bem definidos e foco em valor percebido — não apenas em preço.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Key Partners Detalhado */}
          <TabsContent value="partners">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(categoryLabels).map(([key, label]) => {
                const categoryPartners = partners.filter(p => p.category === key);
                return (
                  <Card key={key} className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {categoryPartners.length > 0 ? (
                        <div className="space-y-2">
                          {categoryPartners.map(p => (
                            <div key={p.id} className="p-2 bg-slate-50 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-medium text-sm">{p.name}</p>
                                <Badge className={cn(dependencyColors[p.dependency_level]?.bg, dependencyColors[p.dependency_level]?.text)}>
                                  {p.dependency_level}
                                </Badge>
                              </div>
                              {p.description && <p className="text-xs text-slate-500">{p.description}</p>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 py-4">Nenhum parceiro cadastrado</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Exemplos Estratégicos */}
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <Card className="border-0 shadow-sm border-l-4 border-l-purple-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-purple-600" />
                    Parceiros Críticos (Alta Dependência)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="font-semibold text-sm mb-1">Invisalign</p>
                      <p className="text-xs text-slate-600 mb-2">Fornecedor estratégico - Tecnologia proprietária e marca reconhecida</p>
                      <p className="text-xs text-slate-500"><strong>Gestão recomendada:</strong> Parceria de longo prazo, treinamento contínuo, avaliar alternativas secundárias</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="font-semibold text-sm mb-1">Laboratórios Odontológicos</p>
                      <p className="text-xs text-slate-600 mb-2">Impacto direto na qualidade final dos tratamentos</p>
                      <p className="text-xs text-slate-500"><strong>Gestão recomendada:</strong> Trabalhar com 2+ laboratórios homologados, padronizar SLA</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm border-l-4 border-l-amber-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info className="w-5 h-5 text-amber-600" />
                    Parceiros de Alavancagem
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-amber-50 rounded-lg">
                      <p className="font-semibold text-sm mb-1">Plataformas de Pagamento</p>
                      <p className="text-xs text-slate-600 mb-2">Forte impacto na conversão e ticket médio</p>
                      <p className="text-xs text-slate-500"><strong>Gestão recomendada:</strong> Múltiplas opções, negociar taxas, usar como ferramenta comercial</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="font-semibold text-sm mb-1">Fornecedores Operacionais</p>
                      <p className="text-xs text-slate-600 mb-2">Essenciais para operação diária, porém substituíveis</p>
                      <p className="text-xs text-slate-500"><strong>Gestão recomendada:</strong> Cadastro de alternativos, controle de custos, SLA básico</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Matriz Dependência x Importância */}
          <TabsContent value="matrix">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Matriz Estratégica: Dependência × Importância
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Quadrante 1 - Alta/Alta */}
                  <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <h3 className="font-bold text-red-900">Alta Dependência / Alta Importância</h3>
                    </div>
                    <p className="text-sm text-red-700 mb-2">Parceiros Críticos (Estratégicos)</p>
                    <ul className="space-y-1 text-xs text-slate-600">
                      <li>• Invisalign</li>
                      <li>• Laboratórios principais</li>
                    </ul>
                    <div className="mt-3 pt-3 border-t border-red-200">
                      <p className="text-xs font-medium text-red-800">Ação: Relacionamento próximo, contratos claros, plano de contingência</p>
                    </div>
                  </div>

                  {/* Quadrante 2 - Média/Alta */}
                  <div className="p-4 bg-amber-50 rounded-xl border-2 border-amber-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <h3 className="font-bold text-amber-900">Média Dependência / Alta Importância</h3>
                    </div>
                    <p className="text-sm text-amber-700 mb-2">Parceiros de Alavancagem</p>
                    <ul className="space-y-1 text-xs text-slate-600">
                      <li>• Plataformas de pagamento</li>
                      <li>• Plataformas de financiamento</li>
                    </ul>
                    <div className="mt-3 pt-3 border-t border-amber-200">
                      <p className="text-xs font-medium text-amber-800">Ação: Trabalhar com múltiplas opções, negociar condições</p>
                    </div>
                  </div>

                  {/* Quadrante 3 - Média/Média */}
                  <div className="p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <h3 className="font-bold text-yellow-900">Média Dependência / Média Importância</h3>
                    </div>
                    <p className="text-sm text-yellow-700 mb-2">Parceiros Operacionais</p>
                    <ul className="space-y-1 text-xs text-slate-600">
                      <li>• Fornecedores de equipamentos</li>
                      <li>• Assistência técnica</li>
                    </ul>
                    <div className="mt-3 pt-3 border-t border-yellow-200">
                      <p className="text-xs font-medium text-yellow-800">Ação: Cadastro de alternativos, controle de custos</p>
                    </div>
                  </div>

                  {/* Quadrante 4 - Baixa/Média */}
                  <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <h3 className="font-bold text-green-900">Baixa Dependência / Média Importância</h3>
                    </div>
                    <p className="text-sm text-green-700 mb-2">Parceiros de Suporte</p>
                    <ul className="space-y-1 text-xs text-slate-600">
                      <li>• Profissionais parceiros</li>
                      <li>• Especialistas pontuais</li>
                    </ul>
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-xs font-medium text-green-800">Ação: Rede de confiança, encaminhamentos pontuais</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-purple-900 mb-1">Insight Estratégico</h4>
                      <p className="text-sm text-slate-700">
                        Quanto maior a dependência e importância, maior deve ser o nível de gestão, controle e 
                        relacionamento estratégico com o parceiro. Os Key Partners não são apenas fornecedores, 
                        mas <strong>habilitadores diretos do modelo de negócio</strong> da Prime Odontologia.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
