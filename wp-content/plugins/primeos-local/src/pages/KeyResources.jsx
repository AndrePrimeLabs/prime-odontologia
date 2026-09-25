// @ts-nocheck
import React from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, Users, Brain, Building } from "lucide-react";

export default function KeyResources() {
  const { data: assets = [] } = useQuery({
    queryKey: ['assets'],
    queryFn: () => primeos.entities.Asset.list(),
  });

  const resourceCategories = [
    {
      title: "Recursos Físicos",
      icon: Building,
      color: "text-blue-600",
      bg: "bg-blue-50",
      items: [
        { name: "Equipamentos Odontológicos", description: "Scanner 3D, cadeiras, autoclaves" },
        { name: "Consultórios", description: "Espaços modernos e acolhedores" },
        { name: "Tecnologia Invisalign", description: "Sistema de alinhadores certificado" },
        { name: "Materiais Clínicos", description: "Insumos de alta qualidade" }
      ]
    },
    {
      title: "Recursos Intelectuais",
      icon: Brain,
      color: "text-purple-600",
      bg: "bg-purple-50",
      items: [
        { name: "Marca Prime", description: "Posicionamento premium estabelecido" },
        { name: "Base de Conhecimento", description: "SOPs, protocolos e manuais" },
        { name: "Metodologia Silvia", description: "Sistema de atendimento padronizado" },
        { name: "Scripts de Vendas", description: "Roteiros testados e otimizados" }
      ]
    },
    {
      title: "Recursos Humanos",
      icon: Users,
      color: "text-green-600",
      bg: "bg-green-50",
      items: [
        { name: "Dentistas Especialistas", description: "Profissionais certificados Invisalign" },
        { name: "Equipe de Atendimento", description: "Treinados no padrão Silvia" },
        { name: "Gestão/CRM", description: "Time de relacionamento e conversão" },
        { name: "Marketing", description: "Especialistas em canais digitais" }
      ]
    },
    {
      title: "Recursos Tecnológicos",
      icon: Server,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      items: [
        { name: "Prime OS", description: "Sistema de gestão integrado" },
        { name: "CRM Avançado", description: "Automação e lead scoring" },
        { name: "Silvia AI Agent", description: "Atendimento automatizado WhatsApp" },
        { name: "Government AI", description: "Governança estratégica" }
      ]
    }
  ];

  const assetsByType = {
    equipment: assets.filter(a => a.type === "equipment").length,
    software: assets.filter(a => a.type === "software").length,
    property: assets.filter(a => a.type === "property").length,
    intellectual_property: assets.filter(a => a.type === "intellectual_property").length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Recursos-Chave</h1>
          <p className="text-slate-600">Bloco 6 - Business Model Canvas</p>
        </div>

        {/* Assets Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Equipamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{assetsByType.equipment}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Software/SaaS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">{assetsByType.software}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Propriedades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{assetsByType.property}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">PI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{assetsByType.intellectual_property}</div>
            </CardContent>
          </Card>
        </div>

        {/* Resource Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resourceCategories.map((category, idx) => (
            <Card key={idx} className="hover:shadow-xl transition-shadow">
              <CardHeader className={category.bg}>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <category.icon className={`w-6 h-6 ${category.color}`} />
                  </div>
                  <CardTitle>{category.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {category.items.map((item, i) => (
                    <div key={i} className="p-3 bg-white rounded-lg border hover:border-indigo-300 transition-colors">
                      <h4 className="font-semibold text-slate-900 mb-1">{item.name}</h4>
                      <p className="text-sm text-slate-600">{item.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
