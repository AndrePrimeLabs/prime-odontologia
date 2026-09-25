// @ts-nocheck
import React from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Handshake, TrendingUp, Users } from "lucide-react";

export default function KeyPartnerships() {
  const { data: partners = [] } = useQuery({
    queryKey: ['keyPartners'],
    queryFn: () => primeos.entities.KeyPartner.list(),
  });

  const dependencyLevels = {
    alta: { label: "Alta Dependência", color: "bg-red-100 text-red-800", count: 0 },
    media: { label: "Média Dependência", color: "bg-yellow-100 text-yellow-800", count: 0 },
    baixa: { label: "Baixa Dependência", color: "bg-green-100 text-green-800", count: 0 }
  };

  partners.forEach(p => {
    if (dependencyLevels[p.dependency_level]) {
      dependencyLevels[p.dependency_level].count++;
    }
  });

  const partnerCategories = [
    { key: "fornecedor_estrategico", label: "Fornecedores Estratégicos", icon: Handshake },
    { key: "laboratorio", label: "Laboratórios", icon: Users },
    { key: "equipamento_material", label: "Equipamentos & Materiais", icon: TrendingUp },
    { key: "profissional_saude", label: "Profissionais de Saúde", icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Parcerias-Chave</h1>
          <p className="text-slate-600">Bloco 8 - Business Model Canvas</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Parceiros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{partners.length}</div>
            </CardContent>
          </Card>
          <Card className="border-2 border-red-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Alta Dependência</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{dependencyLevels.alta.count}</div>
            </CardContent>
          </Card>
          <Card className="border-2 border-yellow-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">Média Dependência</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{dependencyLevels.media.count}</div>
            </CardContent>
          </Card>
          <Card className="border-2 border-green-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Baixa Dependência</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{dependencyLevels.baixa.count}</div>
            </CardContent>
          </Card>
        </div>

        {/* Partners by Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {partnerCategories.map((cat, idx) => {
            const categoryPartners = partners.filter(p => p.category === cat.key);
            return (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <cat.icon className="w-5 h-5 text-indigo-600" />
                    <div>
                      <CardTitle>{cat.label}</CardTitle>
                      <CardDescription>{categoryPartners.length} parceiros</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categoryPartners.map((partner) => (
                      <div key={partner.id} className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-slate-900">{partner.name}</h4>
                          <Badge className={
                            partner.dependency_level === "alta" ? "bg-red-100 text-red-800" :
                            partner.dependency_level === "media" ? "bg-yellow-100 text-yellow-800" :
                            "bg-green-100 text-green-800"
                          }>
                            {partner.dependency_level}
                          </Badge>
                        </div>
                        {partner.description && (
                          <p className="text-sm text-slate-600">{partner.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
