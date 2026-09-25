// @ts-nocheck
import React, { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ShoppingCart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function RevenueStreams() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => primeos.entities.Product.list(),
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: () => primeos.entities.Sale.list(),
  });

  const createProductMutation = useMutation({
    mutationFn: (data) => primeos.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsDialogOpen(false);
    },
  });

  const revenueStreams = [
    {
      name: "Invisalign",
      description: "Alinhadores transparentes - Produto principal",
      icon: "🦷",
      type: "Produto Premium",
      pricing: "Por caso completo",
      value: "Alto ticket",
      color: "indigo"
    },
    {
      name: "Ortodontia Tradicional",
      description: "Aparelhos fixos para público secundário",
      icon: "📐",
      type: "Produto Standard",
      pricing: "Mensalidade",
      value: "Médio ticket",
      color: "blue"
    },
    {
      name: "Clareamento Dental",
      description: "Estética complementar e upsell",
      icon: "✨",
      type: "Complementar",
      pricing: "Por sessão/tratamento",
      value: "Médio ticket",
      color: "purple"
    },
    {
      name: "Limpeza e Check-ups",
      description: "Manutenção e relacionamento contínuo",
      icon: "🪥",
      type: "Recorrente",
      pricing: "Por consulta",
      value: "Baixo ticket / Alto volume",
      color: "green"
    },
    {
      name: "Procedimentos Estéticos",
      description: "Lentes, facetas, harmonização",
      icon: "💎",
      type: "Premium",
      pricing: "Por procedimento",
      value: "Alto ticket",
      color: "pink"
    },
    {
      name: "Implantes e Próteses",
      description: "Reabilitação oral",
      icon: "🔧",
      type: "Premium",
      pricing: "Por implante/prótese",
      value: "Muito alto ticket",
      color: "orange"
    }
  ];

  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
  const avgTicket = sales.length > 0 ? totalRevenue / sales.length : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    createProductMutation.mutate({
      name: formData.get('name'),
      description: formData.get('description'),
      category: formData.get('category'),
      price: parseFloat(formData.get('price')),
      status: "active"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Fontes de Receita</h1>
            <p className="text-slate-600">Bloco 5 - Business Model Canvas</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Produto ao Catálogo</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Nome do Produto/Serviço</Label>
                  <Input name="name" required />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea name="description" rows={3} />
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Input name="category" placeholder="Ex: Invisalign, Estética, Limpeza" />
                </div>
                <div>
                  <Label>Preço Base</Label>
                  <Input name="price" type="number" step="0.01" required />
                </div>
                <Button type="submit" className="w-full">Criar Produto</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Receita Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Ticket Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">
                R$ {avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Produtos Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {products.filter(p => p.status === "active").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Streams */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Fluxos de Receita</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {revenueStreams.map((stream, idx) => (
              <Card key={idx} className={`border-2 border-${stream.color}-100 hover:shadow-xl transition-all`}>
                <CardHeader className={`bg-${stream.color}-50`}>
                  <div className="text-4xl mb-2">{stream.icon}</div>
                  <CardTitle className="text-lg">{stream.name}</CardTitle>
                  <CardDescription>{stream.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Tipo:</span>
                    <Badge variant="outline">{stream.type}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Precificação:</span>
                    <span className="text-sm font-medium">{stream.pricing}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm font-semibold text-slate-900">{stream.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Product Catalog */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-indigo-600" />
            Catálogo de Produtos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <Badge variant={product.status === "active" ? "default" : "secondary"}>
                      {product.status}
                    </Badge>
                  </div>
                  {product.category && (
                    <Badge variant="outline" className="w-fit">{product.category}</Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {product.description && (
                    <p className="text-sm text-slate-600">{product.description}</p>
                  )}
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Preço:</span>
                      <span className="text-lg font-bold text-green-600">
                        R$ {product.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
