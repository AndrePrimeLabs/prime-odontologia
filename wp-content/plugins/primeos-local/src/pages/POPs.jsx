// @ts-nocheck
import React, { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Search, 
  Star,
  LayoutGrid,
  List
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import POPCard from "../components/pops/POPCard";
import POPViewer from "../components/pops/POPViewer";
import { toast } from "sonner";

export default function POPsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedPOP, setSelectedPOP] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: pops = [], isLoading } = useQuery({
    queryKey: ['pops'],
    queryFn: () => primeos.entities.POP.list('-codigo'),
  });

  const updatePOPMutation = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.POP.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pops'] });
    },
  });

  const handleToggleFavorite = (pop) => {
    updatePOPMutation.mutate({
      id: pop.id,
      data: { ...pop, favorito: !pop.favorito }
    });
    toast.success(pop.favorito ? "Removido dos favoritos" : "Adicionado aos favoritos");
  };

  const handleView = (pop) => {
    setSelectedPOP(pop);
    setViewerOpen(true);
  };

  const filteredPOPs = pops.filter(pop => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      pop.nome?.toLowerCase().includes(searchLower) ||
      pop.codigo?.toLowerCase().includes(searchLower) ||
      pop.objetivo?.toLowerCase().includes(searchLower) ||
      pop.descricao?.toLowerCase().includes(searchLower) ||
      pop.responsavel?.toLowerCase().includes(searchLower) ||
      pop.tags?.some(tag => tag.toLowerCase().includes(searchLower));

    const matchesCategoria = categoriaFilter === "all" || pop.categoria === categoriaFilter;
    const matchesStatus = statusFilter === "all" || pop.status === statusFilter;

    return matchesSearch && matchesCategoria && matchesStatus;
  });

  const favoritePOPs = filteredPOPs.filter(p => p.favorito);
  const categorias = [...new Set(pops.map(p => p.categoria))];

  const stats = [
    { label: "Total POPs", value: pops.length, color: "bg-slate-100 text-slate-700" },
    { label: "Favoritos", value: pops.filter(p => p.favorito).length, color: "bg-yellow-100 text-yellow-700" },
    { label: "Ativos", value: pops.filter(p => p.status === "ativo").length, color: "bg-green-100 text-green-700" },
    { label: "Em Revisão", value: pops.filter(p => p.status === "em_revisao").length, color: "bg-orange-100 text-orange-700" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">POPs - Procedimentos Operacionais</h1>
              <p className="text-slate-600 mt-1">Biblioteca de procedimentos padronizados</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nome, código, responsável, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                <SelectItem value="operacional">Operacional</SelectItem>
                <SelectItem value="clinico">Clínico</SelectItem>
                <SelectItem value="administrativo">Administrativo</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="qualidade">Qualidade</SelectItem>
                <SelectItem value="gestao">Gestão</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ativo">Ativos</SelectItem>
                <SelectItem value="em_revisao">Em Revisão</SelectItem>
                <SelectItem value="descontinuado">Descontinuados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <Tabs defaultValue="todos" className="space-y-4">
          <TabsList>
            <TabsTrigger value="todos">
              Todos ({filteredPOPs.length})
            </TabsTrigger>
            <TabsTrigger value="favoritos">
              <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
              Favoritos ({favoritePOPs.length})
            </TabsTrigger>
            {categorias.map(cat => (
              <TabsTrigger key={cat} value={cat}>
                {cat} ({filteredPOPs.filter(p => p.categoria === cat).length})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="todos">
            <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
              {filteredPOPs.map(pop => (
                <POPCard
                  key={pop.id}
                  pop={pop}
                  onView={handleView}
                  onToggleFavorite={handleToggleFavorite}
                  onEdit={(pop) => toast.info("Funcionalidade em desenvolvimento")}
                />
              ))}
            </div>
            {filteredPOPs.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>Nenhum POP encontrado</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="favoritos">
            <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
              {favoritePOPs.map(pop => (
                <POPCard
                  key={pop.id}
                  pop={pop}
                  onView={handleView}
                  onToggleFavorite={handleToggleFavorite}
                  onEdit={(pop) => toast.info("Funcionalidade em desenvolvimento")}
                />
              ))}
            </div>
            {favoritePOPs.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <Star className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>Nenhum POP marcado como favorito</p>
              </div>
            )}
          </TabsContent>

          {categorias.map(cat => (
            <TabsContent key={cat} value={cat}>
              <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
                {filteredPOPs.filter(p => p.categoria === cat).map(pop => (
                  <POPCard
                    key={pop.id}
                    pop={pop}
                    onView={handleView}
                    onToggleFavorite={handleToggleFavorite}
                    onEdit={(pop) => toast.info("Funcionalidade em desenvolvimento")}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <POPViewer
        pop={selectedPOP}
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
}
