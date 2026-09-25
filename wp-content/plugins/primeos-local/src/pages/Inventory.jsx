// @ts-nocheck
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { primeos } from "@/api/primeosClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Package, Plus, Search, AlertTriangle, Edit2, Trash2,
  PackagePlus, Filter, RefreshCw, CalendarX2, MapPin, DollarSign, BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { createPageUrl } from "@/utils";
import InventoryForm from "@/components/inventory/InventoryForm";
import InventoryStockAdjust from "@/components/inventory/InventoryStockAdjust";
import { CATEGORY_LABELS, CATEGORY_COLORS, getStockStatus } from "@/components/inventory/inventoryConstants";

export default function Inventory() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showLowStock, setShowLowStock] = useState(false);
  const [modal, setModal] = useState(null); // null | { type: "add"|"edit"|"adjust"|"delete", item? }

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => primeos.entities.InventoryItem.list("-updated_date", 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => primeos.entities.InventoryItem.create({ ...data, is_active: true }),
    onSuccess: () => { qc.invalidateQueries(["inventory"]); toast.success("Item adicionado!"); setModal(null); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.InventoryItem.update(id, data),
    onSuccess: () => { qc.invalidateQueries(["inventory"]); toast.success("Item atualizado!"); setModal(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => primeos.entities.InventoryItem.delete(id),
    onSuccess: () => { qc.invalidateQueries(["inventory"]); toast.success("Item removido!"); setModal(null); },
  });

  const lowStockItems = useMemo(() =>
    items.filter(i => i.is_active !== false && i.quantity_on_hand <= i.reorder_point),
    [items]
  );

  const expiringItems = useMemo(() => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 30);
    return items.filter(i => i.expiry_date && new Date(i.expiry_date) <= soon && new Date(i.expiry_date) >= new Date());
  }, [items]);

  const filtered = useMemo(() => {
    let list = items.filter(i => i.is_active !== false);
    if (showLowStock) list = list.filter(i => i.quantity_on_hand <= i.reorder_point);
    if (categoryFilter !== "all") list = list.filter(i => i.category === categoryFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(i =>
        i.name?.toLowerCase().includes(q) ||
        i.sku?.toLowerCase().includes(q) ||
        i.supplier?.toLowerCase().includes(q) ||
        i.location?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [items, search, categoryFilter, showLowStock]);

  const totalValue = useMemo(() =>
    items.reduce((s, i) => s + (i.quantity_on_hand || 0) * (i.unit_cost || 0), 0),
    [items]
  );

  const handleStockAdjust = ({ type, newQty }) => {
    const today = new Date().toISOString().split("T")[0];
    const update = { quantity_on_hand: newQty };
    if (type === "add") update.last_restock_date = today;
    updateMutation.mutate({ id: modal.item.id, data: update });
    if (newQty <= modal.item.reorder_point) {
      toast.warning(`⚠️ ${modal.item.name} abaixo do ponto de reposição!`);
    }
  };



  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-indigo-600" />
              Estoque de Materiais
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">Gerencie os materiais odontológicos do consultório</p>
          </div>
          <div className="flex gap-2">
            <Link to={createPageUrl("InventoryReports")}>
              <Button variant="outline" className="gap-2">
                <BarChart3 className="w-4 h-4" /> Relatórios
              </Button>
            </Link>
            <Button onClick={() => setModal({ type: "add" })} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
              <Plus className="w-4 h-4" /> Novo Item
            </Button>
          </div>
        </div>

        {/* Alert banners */}
        {lowStockItems.length > 0 && (
          <div
            className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl cursor-pointer hover:bg-orange-100 transition-colors"
            onClick={() => setShowLowStock(true)}
          >
            <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-orange-800">
                {lowStockItems.length} {lowStockItems.length === 1 ? "item precisa" : "itens precisam"} de reposição
              </p>
              <p className="text-xs text-orange-600">
                {lowStockItems.slice(0, 3).map(i => i.name).join(", ")}{lowStockItems.length > 3 ? ` +${lowStockItems.length - 3} mais` : ""}
              </p>
            </div>
            <Badge className="bg-orange-100 text-orange-700 border-orange-200">Ver todos</Badge>
          </div>
        )}

        {expiringItems.length > 0 && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <CalendarX2 className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-800">
                {expiringItems.length} {expiringItems.length === 1 ? "item vence" : "itens vencem"} em até 30 dias
              </p>
              <p className="text-xs text-red-600">{expiringItems.map(i => i.name).join(", ")}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total de Itens", value: items.filter(i => i.is_active !== false).length, icon: Package, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Precisam Reposição", value: lowStockItems.length, icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50" },
            { label: "Sem Estoque", value: items.filter(i => i.quantity_on_hand === 0).length, icon: PackagePlus, color: "text-red-600", bg: "bg-red-50" },
            { label: "Valor em Estoque", value: `R$ ${totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map((s, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", s.bg)}>
                  <s.icon className={cn("w-5 h-5", s.color)} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className={cn("text-lg font-bold", s.color)}>{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome, SKU, fornecedor..." className="pl-9" />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {Object.entries(CATEGORY_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button
            variant={showLowStock ? "default" : "outline"}
            onClick={() => setShowLowStock(v => !v)}
            className={cn("gap-2", showLowStock && "bg-orange-500 hover:bg-orange-600 border-orange-500")}
          >
            <AlertTriangle className="w-4 h-4" />
            Só críticos {showLowStock && `(${lowStockItems.length})`}
          </Button>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" /> Carregando estoque...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <Package className="w-10 h-10" />
            <p className="text-sm">Nenhum item encontrado</p>
            <Button onClick={() => setModal({ type: "add" })} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
              <Plus className="w-4 h-4" /> Adicionar primeiro item
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {["Item", "Categoria", "Estoque", "Ponto de Reposição", "Fornecedor", "Custo Unit.", "Validade", "Ações"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(item => {
                    const status = getStockStatus(item);
                    const isExpiringSoon = item.expiry_date && new Date(item.expiry_date) <= new Date(Date.now() + 30 * 864e5);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-slate-900">{item.name}</p>
                            {item.sku && <p className="text-xs text-slate-400">SKU: {item.sku}</p>}
                            {item.location && (
                              <p className="text-xs text-slate-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />{item.location}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={cn("text-xs", CATEGORY_COLORS[item.category])}>
                            {CATEGORY_LABELS[item.category] || item.category}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={cn("w-2 h-2 rounded-full flex-shrink-0", status.dot)} />
                            <span className="font-semibold text-slate-900">{item.quantity_on_hand}</span>
                            <span className="text-slate-400 text-xs">{item.unit || "un"}</span>
                            <Badge className={cn("text-xs ml-1", status.color)}>{status.label}</Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {item.reorder_point} {item.unit || "un"}
                        </td>
                        <td className="px-4 py-3">
                          {item.supplier ? (
                            <div>
                              <p className="text-slate-700">{item.supplier}</p>
                              {item.supplier_contact && <p className="text-xs text-slate-400">{item.supplier_contact}</p>}
                            </div>
                          ) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {item.unit_cost ? `R$ ${Number(item.unit_cost).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {item.expiry_date ? (
                            <span className={cn("text-xs font-medium", isExpiringSoon ? "text-red-600" : "text-slate-600")}>
                              {isExpiringSoon && "⚠️ "}{format(new Date(item.expiry_date), "dd/MM/yyyy")}
                            </span>
                          ) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50" title="Ajustar estoque" onClick={() => setModal({ type: "adjust", item })}>
                              <PackagePlus className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:bg-slate-100" title="Editar" onClick={() => setModal({ type: "edit", item })}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-50" title="Remover" onClick={() => setModal({ type: "delete", item })}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Dialog open={modal?.type === "add" || modal?.type === "edit"} onOpenChange={() => setModal(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modal?.type === "edit" ? "Editar Item" : "Novo Item de Estoque"}</DialogTitle>
          </DialogHeader>
          <InventoryForm
            item={modal?.item}
            loading={createMutation.isPending || updateMutation.isPending}
            onCancel={() => setModal(null)}
            onSubmit={(data) => {
              if (modal?.type === "edit") {
                updateMutation.mutate({ id: modal.item.id, data });
              } else {
                createMutation.mutate(data);
              }
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Stock Adjust Modal */}
      <Dialog open={modal?.type === "adjust"} onOpenChange={() => setModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajustar Estoque — {modal?.item?.name}</DialogTitle>
          </DialogHeader>
          {modal?.item && (
            <InventoryStockAdjust
              item={modal.item}
              loading={updateMutation.isPending}
              onCancel={() => setModal(null)}
              onConfirm={handleStockAdjust}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Modal */}
      <Dialog open={modal?.type === "delete"} onOpenChange={() => setModal(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remover Item</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Tem certeza que deseja remover <strong>{modal?.item?.name}</strong>? Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setModal(null)}>Cancelar</Button>
            <Button
              className="bg-red-500 hover:bg-red-600"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(modal.item.id)}
            >
              {deleteMutation.isPending ? "Removendo..." : "Remover"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
