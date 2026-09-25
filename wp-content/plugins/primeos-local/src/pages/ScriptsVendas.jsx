// @ts-nocheck
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageCircle, Copy, Check, BookOpen, Sparkles, Target, 
  Heart, AlertCircle, TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Scripts de Vendas da Prime Odontologia
const scriptsData = {
  whatsapp: {
    title: "WhatsApp Scripts",
    icon: MessageCircle,
    color: "bg-green-500",
    scripts: [
      {
        id: "welcome",
        name: "1.1 Primeiro Contato - Boas Vindas",
        content: `Olá 😊 Tudo bem?
Aqui é a Clara, da Prime Odontologia 🦷
Que bom receber sua mensagem!
Para te ajudar da melhor forma, posso te fazer algumas perguntinhas rápidas?`,
        quando: "Primeira mensagem do lead"
      },
      {
        id: "qualification",
        name: "1.2 Qualificação (Obrigatório)",
        content: `Perfeito 💙
Me conta, por favor:
1️⃣ O que te incomoda ou o que você gostaria de melhorar no seu sorriso hoje?
2️⃣ Você sente dor ou é mais uma questão estética/preventiva?
3️⃣ Já fez algum tratamento odontológico recentemente?`,
        quando: "Após resposta inicial do lead"
      },
      {
        id: "offer",
        name: "1.3 Oferta Avaliação + Limpeza",
        content: `Entendi 😊
Aqui na Prime Odontologia trabalhamos com uma avaliação bem completa, humanizada e sem pressa.

👉 Nessa consulta fazemos:
✔ Avaliação clínica detalhada
✔ Orientação personalizada
✔ Quando indicado, limpeza preventiva

Assim conseguimos indicar o melhor tratamento para você, com clareza e sem surpresas.
Posso verificar os horários disponíveis para você?`,
        quando: "Após qualificação"
      },
      {
        id: "confirmation",
        name: "1.4 Confirmação de Agendamento",
        content: `Perfeito! Seu atendimento ficou agendado 💙
📍 Prime Odontologia
📅 Data: ____
⏰ Horário: ____

Qualquer imprevisto é só nos avisar com antecedência 😊
Te esperamos!`,
        quando: "Após agendar consulta"
      },
      {
        id: "reminder",
        name: "1.5 Lembrete 24h",
        content: `Oi 😊
Passando para confirmar sua consulta amanhã na Prime Odontologia 🦷
📅 ____ | ⏰ ____
Estamos te aguardando 💙`,
        quando: "24h antes da consulta"
      }
    ]
  },
  invisalign: {
    title: "Invisalign Script",
    icon: Sparkles,
    color: "bg-purple-500",
    scripts: [
      {
        id: "discovery",
        name: "🔹 Discovery",
        content: `Você já pensou em alinhar seus dentes, mas não queria usar aparelho metálico?`,
        quando: "Abertura da conversa sobre alinhamento"
      },
      {
        id: "education",
        name: "🔹 Education",
        content: `O Invisalign é um tratamento com alinhadores transparentes, praticamente invisíveis, removíveis e muito confortáveis.

Aqui na Prime, fazemos todo o planejamento digital para mostrar o resultado antes mesmo de começar.`,
        quando: "Explicar o tratamento"
      },
      {
        id: "value",
        name: "🔹 Value Anchor",
        content: `Além da estética, o alinhamento melhora a mordida, facilita a higiene e evita desgastes futuros.`,
        quando: "Reforçar benefícios"
      },
      {
        id: "cta",
        name: "🔹 Call to Action",
        content: `O primeiro passo é uma avaliação com escaneamento digital.
Posso verificar um horário para você?`,
        quando: "Fechamento"
      },
      {
        id: "full",
        name: "📋 Script Completo",
        content: `"O Invisalign permite alinhar seus dentes de forma discreta, confortável e previsível. Você vê o resultado antes de começar, sem metal e com menos consultas. É ideal para quem busca estética, conforto e segurança."`,
        quando: "Pitch resumido"
      }
    ]
  },
  implante: {
    title: "Implante Script",
    icon: Target,
    color: "bg-blue-500",
    scripts: [
      {
        id: "empathy",
        name: "🔹 Empathy",
        content: `Entendo como a perda de um dente pode impactar mastigação e autoestima.`,
        quando: "Conexão inicial"
      },
      {
        id: "authority",
        name: "🔹 Authority",
        content: `Aqui na Prime Odontologia trabalhamos com planejamento seguro, exames detalhados e acompanhamento próximo em todas as etapas.`,
        quando: "Gerar confiança"
      },
      {
        id: "outcome",
        name: "🔹 Outcome",
        content: `O implante devolve função, conforto e estética natural, trazendo mais segurança no dia a dia.`,
        quando: "Mostrar resultado"
      },
      {
        id: "cta",
        name: "🔹 CTA",
        content: `O ideal é fazermos uma avaliação para entender o seu caso.
Posso agendar para você?`,
        quando: "Fechamento"
      },
      {
        id: "full",
        name: "📋 Script Completo",
        content: `"O implante devolve função, estética e segurança ao sorrir e mastigar. É uma solução definitiva para quem perdeu um dente."`,
        quando: "Pitch resumido"
      }
    ]
  },
  catalogo: {
    title: "Catálogo WhatsApp",
    icon: BookOpen,
    color: "bg-amber-500",
    scripts: [
      {
        id: "avaliacao",
        name: "🦷 Avaliação + Limpeza Preventiva",
        content: `Avaliação odontológica completa com foco em saúde, estética e prevenção.
Atendimento humanizado, sem pressa e com orientações personalizadas.

Indicado para:
✔ Check-up
✔ Manutenção da saúde bucal
✔ Primeiro atendimento

📲 CTA: Deseja agendar sua avaliação?`,
        quando: "Entry Product"
      },
      {
        id: "clareamento",
        name: "✨ Clareamento",
        content: `Clareamento dental seguro, moderno e supervisionado por dentistas.
Resultado natural, respeitando a saúde dos seus dentes.

✔ Mais brilho
✔ Mais autoestima
✔ Técnica segura

📲 CTA: Quer saber se você pode clarear seus dentes?`,
        quando: "Mid Ticket"
      },
      {
        id: "invisalign_catalog",
        name: "✨ Invisalign®",
        content: `Alinhe seu sorriso com alinhadores transparentes, confortáveis e quase invisíveis.
Tratamento moderno, discreto e personalizado.

✔ Sem fios ou brackets
✔ Removível
✔ Planejamento digital

📲 CTA: Posso te explicar como funciona o Invisalign?`,
        quando: "High Ticket"
      },
      {
        id: "implantes",
        name: "🦴 Implantes Dentários",
        content: `✔ Mastigação segura
✔ Estética natural
✔ Qualidade de vida

📲 CTA: Gostaria de fazer uma avaliação para implantes?`,
        quando: "Premium Product"
      },
      {
        id: "plano",
        name: "🔄 Plano Preventivo",
        content: `Plano de acompanhamento odontológico com consultas periódicas, prevenção e cuidados contínuos.

✔ Economia
✔ Prevenção
✔ Saúde a longo prazo

📲 CTA: Quer saber como funciona nosso plano anual?`,
        quando: "Recurring Revenue"
      }
    ]
  },
  limpeza: {
    title: "Limpeza Bucal Script",
    icon: Heart,
    color: "bg-teal-500",
    scripts: [
      {
        id: "limpeza_discovery",
        name: "🔹 Discovery",
        content: `Quando foi a última vez que você fez uma limpeza profissional nos seus dentes?`,
        quando: "Abertura da conversa"
      },
      {
        id: "limpeza_education",
        name: "🔹 Education",
        content: `A limpeza bucal profissional remove tártaro e placa bacteriana que o dia a dia não consegue eliminar, mesmo com escovação regular.

Aqui na Prime fazemos de forma gentil, sem dor, com instrumentos modernos.`,
        quando: "Explicar o tratamento"
      },
      {
        id: "limpeza_value",
        name: "🔹 Value Anchor",
        content: `Uma limpeza regular previne cáries, gengivite e até problemas mais sérios como periodontite.
É o menor investimento com o maior retorno para sua saúde bucal.`,
        quando: "Reforçar benefícios"
      },
      {
        id: "limpeza_cta",
        name: "🔹 Call to Action",
        content: `O ideal é fazer a limpeza a cada 6 meses.
Posso verificar um horário próximo para você?`,
        quando: "Fechamento"
      },
      {
        id: "limpeza_full",
        name: "📋 Script Completo",
        content: `"A limpeza bucal profissional é o pilar da saúde bucal. Remove tártaro, previne cáries, gengivite e cuida do seu sorriso a longo prazo. Aqui na Prime fazemos de forma gentil, rápida e sem dor."`,
        quando: "Pitch resumido"
      },
      {
        id: "limpeza_objecao",
        name: "💬 Objeção: \"Não sinto nada, para quê?\"",
        content: `"Exatamente por isso! A prevenção evita que problemas silenciosos se tornem grandes e caros. É muito melhor e mais barato prevenir do que tratar."`,
        quando: "Paciente assintomático"
      }
    ]
  },
  siso: {
    title: "Cirurgia do Siso Script",
    icon: AlertCircle,
    color: "bg-rose-600",
    scripts: [
      {
        id: "siso_empathy",
        name: "🔹 Empathy",
        content: `Entendo que a palavra "cirurgia" pode assustar. É muito normal sentir esse receio.`,
        quando: "Conexão inicial"
      },
      {
        id: "siso_education",
        name: "🔹 Education",
        content: `A cirurgia do siso é um procedimento muito comum, rápido e seguro quando feito com planejamento adequado.

Aqui na Prime utilizamos:
✔ Radiografia panorâmica para avaliação completa
✔ Anestesia local eficiente
✔ Técnica minimamente invasiva
✔ Acompanhamento pós-operatório`,
        quando: "Explicar o procedimento"
      },
      {
        id: "siso_quando",
        name: "🔹 Quando Indicar",
        content: `A extração do siso é recomendada quando:
• Ele está impactado (preso no osso)
• Causa dor ou inflamação recorrente
• Está posicionado de forma errada e prejudica outros dentes
• Há risco de cárie ou pericoronarite`,
        quando: "Indicações clínicas"
      },
      {
        id: "siso_authority",
        name: "🔹 Authority",
        content: `Nosso protocolo inclui avaliação completa antes, durante e após a cirurgia.
Você terá orientações claras de cuidados pós-operatórios e nosso suporte em todo o processo.`,
        quando: "Gerar confiança"
      },
      {
        id: "siso_cta",
        name: "🔹 Call to Action",
        content: `O primeiro passo é uma avaliação com radiografia para analisarmos a posição do seu siso.
Posso agendar para você?`,
        quando: "Fechamento"
      },
      {
        id: "siso_full",
        name: "📋 Script Completo",
        content: `"A cirurgia do siso, quando indicada, é um procedimento seguro e rápido. Aqui na Prime fazemos uma avaliação completa antes, utilizamos técnica minimamente invasiva e damos todo o suporte pós-operatório. Você estará em boas mãos do começo ao fim."`,
        quando: "Pitch resumido"
      },
      {
        id: "siso_medo",
        name: "💬 Objeção: \"Tenho medo da cirurgia\"",
        content: `"Esse medo é muito natural e a gente respeita muito isso. Nosso atendimento é pensado para que você se sinta tranquilo e seguro em cada etapa. Muitos pacientes nos contam que foi muito mais tranquilo do que imaginavam."`,
        quando: "Objeção de medo"
      }
    ]
  },
  botox: {
    title: "Botox para ATM Script",
    icon: Sparkles,
    color: "bg-violet-500",
    scripts: [
      {
        id: "botox_discovery",
        name: "🔹 Discovery",
        content: `Você sente dor na mandíbula, dor de cabeça frequente ou range os dentes?`,
        quando: "Identificação da dor"
      },
      {
        id: "botox_education",
        name: "🔹 Education",
        content: `O Botox terapêutico para ATM (articulação temporomandibular) é uma solução moderna e eficaz para:

✔ Bruxismo (ranger e apertar os dentes)
✔ Dor na mandíbula e articulação
✔ Dores de cabeça tensionais
✔ Hipertrofia do músculo masseter (mandíbula "quadrada")

A aplicação é rápida, segura e minimamente invasiva.`,
        quando: "Explicar o tratamento"
      },
      {
        id: "botox_value",
        name: "🔹 Value Anchor",
        content: `Além do alívio da dor e da melhora funcional, muitos pacientes relatam:
• Redução significativa das dores de cabeça
• Melhor qualidade do sono
• Contorno facial mais harmonioso (nos casos de masseter)
• Proteção dos dentes contra o desgaste do bruxismo`,
        quando: "Reforçar benefícios"
      },
      {
        id: "botox_diferencial",
        name: "🔹 Diferencial Prime",
        content: `Na Prime Odontologia, o Botox para ATM é aplicado por dentista especializado, com indicação precisa, avaliação completa e protocolo de segurança.

Não é só estética — é saúde e qualidade de vida.`,
        quando: "Posicionamento"
      },
      {
        id: "botox_cta",
        name: "🔹 Call to Action",
        content: `O primeiro passo é uma avaliação para entender o seu caso e indicar o protocolo correto.
Posso agendar para você?`,
        quando: "Fechamento"
      },
      {
        id: "botox_full",
        name: "📋 Script Completo",
        content: `"O Botox terapêutico para ATM é uma solução eficaz para bruxismo, dores de mandíbula e dores de cabeça tensionais. A aplicação é rápida, segura e feita por dentista especializado. Os resultados aparecem em dias e mudam a qualidade de vida dos nossos pacientes."`,
        quando: "Pitch resumido"
      },
      {
        id: "botox_objecao",
        name: "💬 Objeção: \"Botox é só para estética\"",
        content: `"Na verdade, o Botox tem uso terapêutico muito consolidado na Odontologia. É amplamente utilizado para tratar dor e disfunção da ATM, sendo uma alternativa eficaz e segura. Aqui na Prime trabalhamos com indicação precisa e protocolo clínico adequado."`,
        quando: "Desinformação do paciente"
      }
    ]
  },
  objecoes: {
    title: "Tratamento de Objeções",
    icon: AlertCircle,
    color: "bg-rose-500",
    scripts: [
      {
        id: "caro",
        name: "💬 \"Está caro\"",
        content: `"Entendo. Antes de falar em valor, o mais importante é você se sentir seguro com a solução. Vamos revisar juntos o que está incluso?"`,
        quando: "Objeção de preço"
      },
      {
        id: "pensar",
        name: "💬 \"Preciso pensar\"",
        content: `"Claro. Pensar faz parte. Posso te explicar novamente os benefícios para te ajudar nessa decisão?"`,
        quando: "Lead indeciso"
      },
      {
        id: "medo",
        name: "💬 \"Tenho medo\"",
        content: `"Esse medo é muito comum. Nosso atendimento é focado em conforto e acolhimento. Você nunca estará sozinho no processo."`,
        quando: "Medo de procedimento"
      }
    ]
  },
  metodo: {
    title: "Método Prime de Vendas",
    icon: TrendingUp,
    color: "bg-indigo-500",
    scripts: [
      {
        id: "etapa1",
        name: "🧩 ETAPA 1 – Conexão Humana",
        content: `Objetivo: quebrar medo e criar conforto.

Frases-chave:
• "Quero entender o que mais te incomoda no seu sorriso."
• "Aqui você pode falar com tranquilidade, sem julgamento."`,
        quando: "Início do atendimento"
      },
      {
        id: "etapa2",
        name: "🧩 ETAPA 2 – Identificação da Dor",
        content: `Objetivo: entender dor funcional e emocional.

Perguntas obrigatórias:
• "O que te incomoda hoje?"
• "Isso afeta sua confiança?"
• "Há quanto tempo você pensa em resolver isso?"`,
        quando: "Descoberta"
      },
      {
        id: "etapa3",
        name: "🧩 ETAPA 3 – Validação",
        content: `Objetivo: mostrar empatia e normalizar.

Frases-chave:
• "Isso é mais comum do que você imagina."
• "Muitas pessoas chegam aqui com esse receio."`,
        quando: "Após ouvir a dor"
      },
      {
        id: "etapa4",
        name: "🧩 ETAPA 4 – Educação (Valor)",
        content: `Objetivo: explicar soluções, não vender ainda.

• Mostrar opções
• Explicar benefícios
• Falar de previsibilidade
• Usar linguagem simples`,
        quando: "Apresentar soluções"
      },
      {
        id: "etapa5",
        name: "🧩 ETAPA 5 – Proposta Consultiva",
        content: `Objetivo: recomendar, não impor.

Modelo:
"Pelo que você me contou, a solução que mais se encaixa hoje é…"`,
        quando: "Recomendação"
      },
      {
        id: "etapa6",
        name: "🧩 ETAPA 6 – Investimento (Preço)",
        content: `⚠️ Preço só entra aqui.

• Apresentar como investimento
• Mostrar formas de pagamento
• Reforçar valor entregue`,
        quando: "Falar de valor"
      },
      {
        id: "etapa7",
        name: "🧩 ETAPA 7 – Fechamento Humanizado",
        content: `Objetivo: segurança, não pressão.

Frases-chave:
• "Faz sentido para você?"
• "Quer pensar com calma ou já prefere agendar?"`,
        quando: "Fechamento"
      }
    ]
  }
};

const filosofia = {
  principio: "Na Prime, não vendemos procedimentos. Vendemos soluções para pessoas.",
  vendaAcontece: [
    "Se sente ouvido",
    "Confia no profissional",
    "Entende o valor do tratamento",
    "Visualiza o resultado"
  ],
  naoFazer: [
    "Falar de preço antes de valor",
    "Pressionar o paciente",
    "Comparar com concorrentes",
    "Usar medo ou urgência falsa"
  ],
  fazer: [
    "Escuta ativa",
    "Clareza",
    "Previsibilidade",
    "Humanização",
    "Educação"
  ],
  escadaValor: [
  { ticket: "Low Ticket", desc: "Entrada & Confiança", ex: "consulta, limpeza bucal, plano preventivo", color: "bg-green-500" },
  { ticket: "Mid Ticket", desc: "Conversão", ex: "clareamento, cirurgia do siso, botox ATM, ortodontia", color: "bg-amber-500" },
  { ticket: "High Ticket", desc: "Transformação", ex: "Invisalign, lentes de porcelana, implantes", color: "bg-blue-500" }
  ],
  regrasOuro: [
    "Valor antes de preço",
    "Pessoas antes de procedimentos",
    "Clareza gera confiança",
    "Confiança gera venda",
    "Venda gera relacionamento"
  ]
};

export default function ScriptsVendas() {
  const [activeTab, setActiveTab] = useState("filosofia");
  const [copiedId, setCopiedId] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Script copiado!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            Manual de Vendas
          </h1>
          <p className="text-slate-500 mt-1">Prime Odontologia - Scripts e Metodologia</p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="filosofia" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />Filosofia
            </TabsTrigger>
            {Object.entries(scriptsData).map(([key, data]) => (
              <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                <data.icon className="w-4 h-4" />{data.title.split(" ")[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Filosofia Tab */}
          <TabsContent value="filosofia">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Princípio Central */}
              <Card className="border-0 shadow-sm lg:col-span-2">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Target className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Princípio Central</h2>
                    <p className="text-xl text-indigo-600 font-medium">{filosofia.principio}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Venda acontece quando */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-green-700 flex items-center gap-2">
                    <Check className="w-5 h-5" />A venda acontece quando o paciente:
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {filosofia.vendaAcontece.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-slate-700">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* O que NÃO é venda */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-red-700 flex items-center gap-2">
                    ❌ O que NÃO é venda na Prime
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {filosofia.naoFazer.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-slate-700">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* O que É venda */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-green-700 flex items-center gap-2">
                    ✅ O que É venda na Prime
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {filosofia.fazer.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-slate-700">
                        <Check className="w-4 h-4 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Escada de Valor */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    Escada de Valor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filosofia.escadaValor.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className={cn("w-4 h-4 rounded-full mt-1", item.color)} />
                        <div>
                          <p className="font-semibold">{item.ticket} – {item.desc}</p>
                          <p className="text-sm text-slate-500">Ex: {item.ex}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
                    👉 Nunca pule etapas sem fit real.
                  </p>
                </CardContent>
              </Card>

              {/* Regras de Ouro */}
              <Card className="border-0 shadow-sm lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    ⭐ Regras de Ouro do Manual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {filosofia.regrasOuro.map((regra, idx) => (
                      <Badge key={idx} className="bg-indigo-100 text-indigo-800 text-sm py-2 px-4">
                        {idx + 1}. {regra}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Script Tabs */}
          {Object.entries(scriptsData).map(([key, data]) => (
            <TabsContent key={key} value={key}>
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white", data.color)}>
                    <data.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{data.title}</h2>
                    <p className="text-sm text-slate-500">{data.scripts.length} scripts disponíveis</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {data.scripts.map((script) => (
                    <Card key={script.id} className="border-0 shadow-sm">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base">{script.name}</CardTitle>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(script.content, script.id)}
                            className="h-8 px-2"
                          >
                            {copiedId === script.id ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        {script.quando && (
                          <Badge variant="outline" className="w-fit text-xs">
                            {script.quando}
                          </Badge>
                        )}
                      </CardHeader>
                      <CardContent>
                        <pre className="whitespace-pre-wrap text-sm text-slate-700 bg-slate-50 p-3 rounded-lg font-sans">
                          {script.content}
                        </pre>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
