// @ts-nocheck
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen, Search, Copy, CheckCircle,
  MessageCircle, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const catalog = [
  {
    id: 1,
    name: "Manutenção Periodontal e Limpeza Bucal",
    tier: "Low Ticket",
    tierColor: "green",
    price: 180,
    priceLabel: "R$ 180,00",
    regularPrice: "R$ 250,00",
    installments: "2x",
    category: "Prevenção",
    emoji: "🦷",
    indicado: "Prevenção de gengivite, periodontite, mau hálito e acúmulo de tártaro.",
    includes: [
      "Avaliação periodontal completa",
      "Limpeza profissional",
      "Orientações personalizadas de higiene bucal",
      "Limpeza com ultrassom, cureta gengival e profilaxia com bicarbonato de sódio",
      "Acompanhamento, manutenção e suporte clínico",
    ],
    cta: "Ideal para manter gengivas saudáveis e o sorriso sempre limpo.",
    whatsapp: `Olá! 😊 Gostaria de saber mais sobre a Manutenção Periodontal e Limpeza Bucal da Prime Odontologia.\n\nValor: R$ 180,00 (promoção)\nInclui: Avaliação periodontal, limpeza profissional e orientações de higiene.\n\nPoderia me informar os horários disponíveis?`,
    script: `Você sabia que a limpeza profissional vai muito além do que você consegue fazer em casa? 😊\n\nNa Prime, fazemos uma avaliação periodontal completa + limpeza com ultrassom + profilaxia — tudo numa única consulta.\n\nIsso previne gengivite, periodontite, mau hálito e cuida da saúde das gengivas de verdade.\n\nValor: R$ 180,00 (regular R$ 250,00)\n\nQuer agendar?`,
  },
  {
    id: 2,
    name: "Invisalign Express",
    tier: "High Ticket",
    tierColor: "indigo",
    price: 6900,
    priceLabel: "R$ 6.900,00 à vista",
    regularPrice: null,
    installments: "12x de R$ 625,00",
    category: "Ortodontia",
    emoji: "✨",
    indicado: "Pacientes que desejam alinhar os dentes sem aparelho metálico, com tecnologia e conforto.",
    includes: [
      "06 pares de alinhadores — arcada superior e inferior",
      "Duração aproximada: até 12 meses",
      "Todas as manutenções ortodônticas por até 12 meses",
      "Limpezas bucais periódicas em toda consulta mensal",
      "Planejamento digital do sorriso",
      "Tratamento estético, moderno e previsível",
    ],
    painRelievers: [
      "Elimina desconforto estético e dor do metal",
      "Atendimento acolhedor reduz medo e ansiedade",
      "Planejamento digital aumenta previsibilidade e segurança",
      "Processos claros e explicados com transparência",
    ],
    gainCreators: [
      "Sorriso alinhado com tecnologia de ponta",
      "Tratamentos personalizados para cada paciente",
      "Resultados visíveis e planejados desde a primeira consulta",
      "Acompanhamento próximo e humanizado",
    ],
    cta: "O primeiro passo é uma avaliação com escaneamento digital.",
    whatsapp: `Olá! 😊 Tenho interesse no Invisalign Express da Prime Odontologia.\n\nValor: R$ 6.900,00 à vista ou 12x de R$ 625,00\nInclui: 6 pares de alinhadores, manutenções por 12 meses e planejamento digital.\n\nGostaria de agendar uma avaliação!`,
    script: `Você já pensou em alinhar seus dentes sem usar aparelho metálico? 😊\n\nO Invisalign Express é um tratamento com alinhadores transparentes, removíveis e muito confortáveis. Aqui na Prime, fazemos todo o planejamento digital para você ver o resultado antes mesmo de começar.\n\nInclui 6 pares de alinhadores + todas as manutenções por 12 meses + limpeza em toda consulta.\n\nValor: R$ 6.900,00 à vista ou 12x de R$ 625,00\n\nO primeiro passo é uma avaliação com escaneamento digital. Posso verificar um horário para você?`,
  },
  {
    id: 3,
    name: "Consulta e Limpeza Bucal",
    tier: "Low Ticket",
    tierColor: "green",
    price: 180,
    priceLabel: "R$ 180,00",
    regularPrice: "R$ 250,00",
    installments: "2x",
    category: "Prevenção",
    emoji: "😁",
    indicado: "Quem busca avaliação completa e prevenção em um único atendimento.",
    includes: [
      "Consulta odontológica completa",
      "Limpeza bucal profissional",
      "Orientações preventivas personalizadas",
      "Limpeza com ultrassom, cureta gengival e profilaxia com bicarbonato de sódio",
    ],
    cta: "O cuidado essencial para manter dentes e gengivas saudáveis.",
    whatsapp: `Olá! 😊 Quero agendar a Consulta e Limpeza Bucal da Prime Odontologia.\n\nValor promocional: R$ 180,00\nInclui: Consulta odontológica + limpeza profissional + orientações preventivas.\n\nQuais horários estão disponíveis?`,
    script: `Consulta + Limpeza em uma única visita por apenas R$ 180,00 (regular R$ 250,00). 😊\n\nIdeal para quem quer fazer uma avaliação completa e já sair com os dentes limpos e orientações personalizadas.\n\nAgende agora e invista na sua saúde bucal!`,
  },
  {
    id: 4,
    name: "Prevenção Odontológica",
    tier: "Low Ticket",
    tierColor: "green",
    price: 180,
    priceLabel: "R$ 180,00",
    regularPrice: null,
    installments: "2x",
    category: "Prevenção",
    emoji: "🛡️",
    indicado: "Todos os pacientes que buscam manter a saúde bucal e prevenir doenças.",
    includes: [
      "Consulta odontológica preventiva",
      "Limpeza com ultrassom e profilaxia",
      "Avaliação e manutenção da saúde gengival",
      "Educação e instrução sobre higiene bucal",
      "Acompanhamento e suporte clínico",
    ],
    cta: "Prevenir é sempre mais barato e confortável que tratar.",
    whatsapp: `Olá! 😊 Gostaria de agendar uma Consulta de Prevenção Odontológica na Prime Odontologia.\n\nValor: R$ 180,00\nInclui: Consulta preventiva + limpeza + orientações de saúde bucal.\n\nPoderia me informar os horários disponíveis?`,
    script: `Sabia que a maioria dos problemas bucais são 100% evitáveis? 😊\n\nNossa consulta preventiva inclui avaliação completa, limpeza profissional e orientações personalizadas para você manter a saúde bucal ao longo de todo o ano.\n\nValor: R$ 180,00\n\nAgende agora e invista na sua prevenção!`,
  },
  {
    id: 5,
    name: "Cirurgia de Remoção dos Sisos Inclusos e Impactados",
    tier: "Mid Ticket",
    tierColor: "amber",
    price: 600,
    priceLabel: "R$ 600,00 por dente",
    regularPrice: "R$ 700,00",
    installments: null,
    category: "Cirurgia",
    emoji: "🦷",
    indicado: "Dor, inflamação, falta de espaço ou indicação preventiva para remoção dos sisos.",
    includes: [
      "Consulta inicial e avaliação",
      "Planejamento cirúrgico",
      "Procedimento de extração com segurança",
      "Limpeza bucal pré-cirúrgica",
      "Orientação pré e pós-cirúrgica",
      "Acompanhamento e suporte clínico",
    ],
    note: "+ R$ 200,00 diária da auxiliar",
    cta: "Procedimento seguro, com planejamento e conforto.",
    whatsapp: `Olá! 😊 Preciso de informações sobre a Cirurgia de Remoção dos Sisos na Prime Odontologia.\n\nValor: R$ 600,00 por dente (regular R$ 700,00)\nInclui: Consulta, planejamento cirúrgico e procedimento.\n\nGostaria de agendar uma avaliação.`,
    script: `A remoção dos sisos é um procedimento muito comum, e aqui na Prime fazemos com segurança, planejamento e muito cuidado. 😊\n\nInclui consulta inicial, planejamento cirúrgico completo e orientações pré e pós-cirúrgicas.\n\nValor: R$ 600,00 por dente (regular R$ 700,00)\n\nFale conosco para uma avaliação personalizada.`,
  },
  {
    id: 6,
    name: "Tratamento de Canal (Endodontia)",
    tier: "Mid Ticket",
    tierColor: "amber",
    price: 280,
    priceLabel: "R$ 280,00 por sessão",
    regularPrice: "R$ 350,00",
    installments: null,
    category: "Endodontia",
    emoji: "⚡",
    indicado: "Dor intensa, inflamação ou infecção no dente.",
    includes: [
      "Atendimento por sessão",
      "Tratamento endodôntico completo",
      "Limpeza com ultrassom e controle do processo infeccioso",
      "Medicação intracanal",
      "Alívio da dor e preservação do dente natural",
      "Orientações pré e pós-procedimento",
    ],
    note: "Dentes anteriores: ~2 sessões | Dentes posteriores: ~3-4 sessões",
    cta: "Alívio rápido da dor e preservação do seu dente natural.",
    whatsapp: `Olá! 😊 Estou com dor de dente e gostaria de informações sobre o Tratamento de Canal na Prime Odontologia.\n\nValor: R$ 280,00 por sessão (regular R$ 350,00)\n\nPoderia me ajudar a agendar uma avaliação?`,
    script: `Está sentindo dor de dente? O tratamento de canal não precisa ser o bicho-papão que muitos pensam. 😊\n\nAlívio rápido, preservação do dente natural e atendimento humanizado.\n\nValor: R$ 280,00 por sessão (regular R$ 350,00)\nDentes anteriores: ~2 sessões | Posteriores: ~3-4 sessões\n\nEntre em contato e agende sua avaliação!`,
  },
  {
    id: 7,
    name: "Clareamento Dental a Lazer e/ou Caseiro",
    tier: "Mid Ticket",
    tierColor: "amber",
    price: 240,
    priceLabel: "R$ 240,00 por sessão",
    regularPrice: null,
    installments: null,
    category: "Estética",
    emoji: "✦",
    indicado: "Pacientes que desejam um sorriso mais branco e luminoso.",
    includes: [
      "Consulta odontológica + limpeza prévia ao clareamento",
      "Clareamento dental a laser (1 a 6 sessões conforme necessidade)",
      "Clareamento caseiro com confecção de moldeira (2 sessões)",
      "Profilaxia completa pré-procedimento",
      "Orientações e acompanhamento pós-procedimento",
    ],
    cta: "Resultado rápido com grande impacto na autoestima.",
    whatsapp: `Olá! 😊 Tenho interesse no Clareamento Dental da Prime Odontologia.\n\nValor: R$ 240,00 por sessão\nOpções: Clareamento a laser ou caseiro com moldeira.\n\nGostaria de saber mais e agendar uma avaliação!`,
    script: `O clareamento é o tratamento que mais transforma um sorriso em pouco tempo! 😁\n\nNa Prime, temos clareamento a laser (resultado em 1 sessão) e clareamento caseiro com moldeira personalizada.\n\nValor: R$ 240,00 por sessão\n\nÉ simples, rápido e muda a autoestima! Quer agendar?`,
  },
  {
    id: 8,
    name: "Facetas em Resina Composta",
    tier: "Mid Ticket",
    tierColor: "amber",
    price: 520,
    priceLabel: "R$ 520,00 por dente",
    regularPrice: null,
    installments: null,
    category: "Estética",
    emoji: "💎",
    indicado: "Reconstrução estética da estrutura dentária com resultado natural.",
    includes: [
      "Consulta odontológica + limpeza prévia",
      "Reconstrução estética da estrutura dentária",
      "Profilaxia completa",
      "Orientações de manutenção e cuidados",
      "Acompanhamento clínico pós-procedimento",
    ],
    cta: "Transformação do sorriso de forma rápida e com resultado natural.",
    whatsapp: `Olá! 😊 Gostaria de saber mais sobre as Facetas em Resina Composta da Prime Odontologia.\n\nValor: R$ 520,00 por dente\n\nPoderia me informar mais sobre o procedimento e agendar uma avaliação?`,
    script: `As facetas em resina composta são uma das formas mais rápidas de transformar o sorriso! ✨\n\nFazemos diretamente no consultório, em uma ou poucas sessões, com resultado natural e beleza imediata.\n\nValor: R$ 520,00 por dente\n\nQuer agendar uma avaliação?`,
  },
  {
    id: 9,
    name: "Plástica Gengival e Estética do Sorriso Gengival",
    tier: "Mid Ticket",
    tierColor: "amber",
    price: 690,
    priceLabel: "R$ 690,00",
    regularPrice: null,
    installments: null,
    category: "Cirurgia Estética",
    emoji: "🌟",
    indicado: "Pacientes com sorriso gengival ou excesso de gengiva nos dentes anteriores superiores.",
    includes: [
      "Consulta odontológica + limpeza prévia",
      "Plástica gengival nos dentes anteriores superiores (todos inclusos)",
      "Profilaxia completa",
      "Manutenção e proservação periodontal",
      "Orientações e acompanhamento pós-procedimento",
    ],
    cta: "Harmonize seu sorriso corrigindo o excesso de gengiva.",
    whatsapp: `Olá! 😊 Gostaria de saber sobre a Plástica Gengival da Prime Odontologia.\n\nValor: R$ 690,00 (todos os dentes anteriores superiores inclusos)\n\nPoderia me informar mais sobre o procedimento e agendar uma avaliação?`,
    script: `Você já notou que quando sorri aparece muita gengiva? Isso tem solução simples e rápida! 😊\n\nA plástica gengival harmoniza o sorriso corrigindo o excesso de gengiva, e aqui na Prime inclui todos os dentes anteriores superiores num único valor.\n\nValor: R$ 690,00\n\nQuer agendar uma avaliação?`,
  },
  {
    id: 10,
    name: "Facetas em Porcelana / Lentes de Contato Dental",
    tier: "High Ticket",
    tierColor: "indigo",
    price: 2200,
    priceLabel: "R$ 2.200,00 por dente",
    regularPrice: null,
    installments: null,
    category: "Alta Estética",
    emoji: "👑",
    indicado: "Transformação completa e duradoura do sorriso com material de alta qualidade.",
    includes: [
      "Consulta odontológica + limpeza prévia",
      "Planejamento digital do sorriso",
      "Reconstrução estética da estrutura dentária",
      "Confecção das facetas/lentes de contato laboratorial",
      "Recuperação e harmonização da estrutura dentária",
      "Acompanhamento e suporte clínico completo",
    ],
    cta: "A transformação mais sofisticada e duradoura para o seu sorriso.",
    whatsapp: `Olá! 😊 Tenho interesse nas Facetas em Porcelana / Lentes de Contato Dental da Prime Odontologia.\n\nValor: R$ 2.200,00 por dente\n\nGostaria de agendar uma avaliação para saber mais sobre o procedimento.`,
    script: `As lentes de contato dental são a transformação mais sofisticada disponível hoje em Odontologia. ✨\n\nUltra finas, naturais e com durabilidade de anos. Fazemos planejamento digital para você aprovar o resultado antes mesmo de começar.\n\nValor: R$ 2.200,00 por dente\n\nO primeiro passo é uma avaliação. Posso verificar um horário para você?`,
  },
];

const tierConfig = {
  "Low Ticket":  { bg: "bg-green-100",  text: "text-green-700",  border: "border-green-300",  gradient: "from-green-500 to-emerald-600" },
  "Mid Ticket":  { bg: "bg-amber-100",  text: "text-amber-700",  border: "border-amber-300",  gradient: "from-amber-500 to-orange-500" },
  "High Ticket": { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-300", gradient: "from-indigo-500 to-purple-600" },
};

const categoryColors = {
  "Prevenção":       "bg-green-50 text-green-700 border-green-200",
  "Ortodontia":      "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Cirurgia":        "bg-red-50 text-red-700 border-red-200",
  "Endodontia":      "bg-orange-50 text-orange-700 border-orange-200",
  "Estética":        "bg-pink-50 text-pink-700 border-pink-200",
  "Cirurgia Estética": "bg-purple-50 text-purple-700 border-purple-200",
  "Alta Estética":   "bg-yellow-50 text-yellow-700 border-yellow-200",
};

function ProductCard({ product, onSelect, selected }) {
  const tier = tierConfig[product.tier];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn("border-0 shadow-md cursor-pointer transition-all", selected && "ring-2 ring-indigo-500 shadow-lg")}
        onClick={() => onSelect(product)}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{product.emoji}</span>
              <div>
                <h3 className="font-bold text-slate-900 text-sm leading-tight">{product.name}</h3>
                <span className={cn("text-xs px-2 py-0.5 rounded-full border mt-1 inline-block", categoryColors[product.category] || "bg-slate-100 text-slate-600 border-slate-200")}>{product.category}</span>
              </div>
            </div>
            <Badge className={cn(tier.bg, tier.text, "border", tier.border, "text-xs flex-shrink-0")}>{product.tier}</Badge>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xl font-bold text-slate-900">{product.priceLabel}</p>
              {product.installments && <p className="text-xs text-slate-500">{product.installments}</p>}
              {product.regularPrice && <p className="text-xs text-slate-400 line-through">{product.regularPrice}</p>}
            </div>
            <Button size="sm" variant="outline" className="text-xs">Ver detalhes</Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ProductDetail({ product, onClose }) {
  const [copied, setCopied] = useState(null);
  const tier = tierConfig[product.tier];

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success("Copiado!");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
      {/* Header */}
      <div className={cn("rounded-2xl p-6 text-white bg-gradient-to-br", tier.gradient)}>
        <div className="flex items-start justify-between">
          <div>
            <span className="text-3xl">{product.emoji}</span>
            <h2 className="text-xl font-bold mt-2 leading-tight">{product.name}</h2>
            <Badge className="bg-white/20 text-white border-white/30 mt-2">{product.tier}</Badge>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose} className="text-white hover:bg-white/20">✕</Button>
        </div>
        <div className="mt-4 pt-4 border-t border-white/20 flex flex-wrap gap-4">
          <div>
            <p className="text-white/70 text-xs">Valor Promocional</p>
            <p className="text-2xl font-bold">{product.priceLabel}</p>
          </div>
          {product.regularPrice && (
            <div>
              <p className="text-white/70 text-xs">Valor Regular</p>
              <p className="text-lg line-through text-white/60">{product.regularPrice}</p>
            </div>
          )}
          {product.installments && (
            <div>
              <p className="text-white/70 text-xs">Parcelamento</p>
              <p className="text-lg font-semibold">{product.installments}</p>
            </div>
          )}
        </div>
      </div>

      {/* Indicado para */}
      <Card className="border-0 shadow-sm bg-blue-50">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Indicado para</p>
          <p className="text-slate-800 text-sm">{product.indicado}</p>
        </CardContent>
      </Card>

      {/* O que inclui */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" />O que está incluso</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-2">
          {product.includes.map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              {item}
            </div>
          ))}
          {product.note && (
            <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800">
              📌 {product.note}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pain Relievers / Gain Creators (Invisalign) */}
      {product.painRelievers && (
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 shadow-sm bg-red-50">
            <CardContent className="p-3">
              <p className="text-xs font-bold text-red-700 mb-2">🔧 Alívio das Dores</p>
              {product.painRelievers.map((item, i) => (
                <div key={i} className="text-xs text-slate-700 flex items-start gap-1 mb-1"><span className="text-red-400">•</span>{item}</div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-green-50">
            <CardContent className="p-3">
              <p className="text-xs font-bold text-green-700 mb-2">🚀 Geradores de Ganho</p>
              {product.gainCreators.map((item, i) => (
                <div key={i} className="text-xs text-slate-700 flex items-start gap-1 mb-1"><span className="text-green-400">•</span>{item}</div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* CTA */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-slate-50 to-indigo-50">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-slate-800 italic">👉 {product.cta}</p>
        </CardContent>
      </Card>

      {/* Scripts */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm flex items-center gap-2"><MessageCircle className="w-4 h-4 text-green-600" />Script de Venda (WhatsApp)</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-wrap relative">
            {product.whatsapp}
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 h-7 w-7"
              onClick={() => copy(product.whatsapp, "whatsapp")}
            >
              {copied === "whatsapp" ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm flex items-center gap-2"><Zap className="w-4 h-4 text-indigo-600" />Script Abordagem Consultiva</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-wrap relative">
            {product.script}
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 h-7 w-7"
              onClick={() => copy(product.script, "script")}
            >
              {copied === "script" ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Catalogo() {
  const [selected, setSelected] = useState(catalog[0]);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");

  const filtered = catalog.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchTier = tierFilter === "all" || p.tier === tierFilter;
    return matchSearch && matchTier;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/20 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Catálogo de Produtos & Serviços</h1>
              <p className="text-slate-500 text-sm">Revenue Stream · Prime Odontologia · {catalog.length} serviços</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Low Ticket", count: catalog.filter(p => p.tier === "Low Ticket").length, color: "green" },
            { label: "Mid Ticket", count: catalog.filter(p => p.tier === "Mid Ticket").length, color: "amber" },
            { label: "High Ticket", count: catalog.filter(p => p.tier === "High Ticket").length, color: "indigo" },
          ].map((s, i) => (
            <Card key={i} className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setTierFilter(tierFilter === s.label ? "all" : s.label)}>
              <CardContent className={cn("p-3 text-center rounded-xl", tierFilter === s.label && `ring-2 ring-${s.color}-400`)}>
                <p className={cn("text-2xl font-bold", `text-${s.color}-600`)}>{s.count}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: List */}
          <div className="lg:col-span-2 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar serviço..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
              {filtered.map(p => (
                <ProductCard key={p.id} product={p} onSelect={setSelected} selected={selected?.id === p.id} />
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Nenhum serviço encontrado</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Detail */}
          <div className="lg:col-span-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
            <AnimatePresence mode="wait">
              {selected ? (
                <ProductDetail key={selected.id} product={selected} onClose={() => setSelected(null)} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400">
                  <BookOpen className="w-12 h-12 mb-3 opacity-30" />
                  <p>Selecione um serviço para ver os detalhes</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
