// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2 } from "lucide-react";
import ExpenseForm from "@/components/costs/ExpenseForm";
import AssetForm from "@/components/costs/AssetForm";
import InfrastructureEditor from "@/components/costs/InfrastructureEditor";

const COST_CATEGORIES = {
  fixed_costs: { label: "Custos Fixos", color: "bg-red-100 text-red-800" },
  variable_costs: { label: "Custos Variáveis", color: "bg-yellow-100 text-yellow-800" },
  salaries: { label: "Salários", color: "bg-blue-100 text-blue-800" },
  marketing: { label: "Marketing", color: "bg-purple-100 text-purple-800" },
  technology: { label: "Tecnologia", color: "bg-indigo-100 text-indigo-800" },
  rent: { label: "Aluguel", color: "bg-orange-100 text-orange-800" },
  utilities: { label: "Utilidades", color: "bg-green-100 text-green-800" },
  supplies: { label: "Insumos", color: "bg-pink-100 text-pink-800" },
  professional_services: { label: "Serviços Prof.", color: "bg-teal-100 text-teal-800" },
  other: { label: "Outros", color: "bg-slate-100 text-slate-800" },
};

const FREQ_LABEL = {
  one_time: "Único", daily: "Diário", weekly: "Semanal",
  monthly: "Mensal", quarterly: "Trimestral", yearly: "Anual"
};

export default function CostStructure() {
  const qc = useQueryClient();
  const [expenseDialog, setExpenseDialog] = useState({ open: false, item: null });
  const [assetDialog, setAssetDialog] = useState({ open: false, item: null });

  const { data: expenses = [] } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => primeos.entities.Expense.list(),
  });

  const { data: assets = [] } = useQuery({
    queryKey: ["assets"],
    queryFn: () => primeos.entities.Asset.list(),
  });

  const createExpense = useMutation({
    mutationFn: (data) => primeos.entities.Expense.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["expenses"] }); setExpenseDialog({ open: false, item: null }); },
  });

  const updateExpense = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.Expense.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["expenses"] }); setExpenseDialog({ open: false, item: null }); },
  });

  const deleteExpense = useMutation({
    mutationFn: (id) => primeos.entities.Expense.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  });

  const createAsset = useMutation({
    mutationFn: (data) => primeos.entities.Asset.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["assets"] }); setAssetDialog({ open: false, item: null }); },
  });

  const updateAsset = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.Asset.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["assets"] }); setAssetDialog({ open: false, item: null }); },
  });

  const deleteAsset = useMutation({
    mutationFn: (id) => primeos.entities.Asset.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets"] }),
  });

  const handleSaveExpense = (form) => {
    if (expenseDialog.item) updateExpense.mutate({ id: expenseDialog.item.id, data: form });
    else createExpense.mutate(form);
  };

  const handleSaveAsset = (form) => {
    if (assetDialog.item) updateAsset.mutate({ id: assetDialog.item.id, data: form });
    else createAsset.mutate(form);
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalMonthly = expenses.filter(e => e.frequency === "monthly").reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalAssets = assets.reduce((sum, a) => sum + (a.value || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Estrutura de Custos</h1>
          <p className="text-slate-500">Bloco 9 — Business Model Canvas</p>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Despesas", value: `R$ ${totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, color: "text-red-600" },
            { label: "Custos Mensais", value: `R$ ${totalMonthly.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, color: "text-orange-600" },
            { label: "Ativos", value: assets.length, color: "text-indigo-600" },
            { label: "Valor Ativos", value: `R$ ${totalAssets.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, color: "text-emerald-600" },
          ].map(({ label, value, color }) => (
            <Card key={label}>
              <CardHeader className="pb-2"><CardTitle className="text-xs text-slate-500">{label}</CardTitle></CardHeader>
              <CardContent><div className={`text-2xl font-bold ${color}`}>{value}</div></CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="expenses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="expenses">Despesas</TabsTrigger>
            <TabsTrigger value="assets">Ativos</TabsTrigger>
            <TabsTrigger value="infrastructure">Infraestrutura</TabsTrigger>
          </TabsList>

          {/* EXPENSES TAB */}
          <TabsContent value="expenses" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800">Despesas ({expenses.length})</h2>
              <Button onClick={() => setExpenseDialog({ open: true, item: null })} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                <Plus className="w-4 h-4" /> Nova Despesa
              </Button>
            </div>

            {/* By category summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
              {Object.entries(COST_CATEGORIES).map(([key, cat]) => {
                const items = expenses.filter(e => e.category === key);
                if (!items.length) return null;
                const total = items.reduce((s, e) => s + (e.amount || 0), 0);
                return (
                  <div key={key} className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border hover:border-indigo-200 transition-colors">
                    <div className="flex items-center gap-2">
                      <Badge className={cat.color}>{cat.label}</Badge>
                      <span className="text-xs text-slate-400">{items.length} itens</span>
                    </div>
                    <span className="font-bold text-slate-800">R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                );
              })}
            </div>

            {/* Expense list */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {expenses.map((expense) => (
                <Card key={expense.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base leading-tight">{expense.title}</CardTitle>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-indigo-600"
                          onClick={() => setExpenseDialog({ open: true, item: expense })}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600"
                          onClick={() => { if (confirm("Excluir esta despesa?")) deleteExpense.mutate(expense.id); }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <Badge className={COST_CATEGORIES[expense.category]?.color || "bg-slate-100 text-slate-700"}>
                      {COST_CATEGORIES[expense.category]?.label || expense.category}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Valor</span>
                      <span className="font-bold text-slate-900">R$ {expense.amount?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Frequência</span>
                      <Badge variant="outline" className="text-xs">{FREQ_LABEL[expense.frequency] || expense.frequency}</Badge>
                    </div>
                    {expense.vendor && <div className="text-xs text-slate-400 pt-1 border-t">Fornecedor: {expense.vendor}</div>}
                  </CardContent>
                </Card>
              ))}

              {expenses.length === 0 && (
                <div className="col-span-3 text-center py-16 text-slate-400">
                  <p className="text-lg mb-2">Nenhuma despesa cadastrada</p>
                  <Button onClick={() => setExpenseDialog({ open: true, item: null })} variant="outline">+ Adicionar primeira despesa</Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ASSETS TAB */}
          <TabsContent value="assets" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800">Ativos ({assets.length})</h2>
              <Button onClick={() => setAssetDialog({ open: true, item: null })} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                <Plus className="w-4 h-4" /> Novo Ativo
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assets.map((asset) => (
                <Card key={asset.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base leading-tight">{asset.name}</CardTitle>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-indigo-600"
                          onClick={() => setAssetDialog({ open: true, item: asset })}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600"
                          onClick={() => { if (confirm("Excluir este ativo?")) deleteAsset.mutate(asset.id); }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <Badge variant="outline" className="w-fit text-xs">{asset.type}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Valor</span>
                      <span className="font-bold text-slate-900">R$ {asset.value?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                    {asset.status && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Status</span>
                        <Badge className={asset.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}>
                          {asset.status === "active" ? "Ativo" : asset.status === "maintenance" ? "Manutenção" : "Inativo"}
                        </Badge>
                      </div>
                    )}
                    {asset.location && <div className="text-xs text-slate-400 pt-1 border-t">Local: {asset.location}</div>}
                  </CardContent>
                </Card>
              ))}

              {assets.length === 0 && (
                <div className="col-span-3 text-center py-16 text-slate-400">
                  <p className="text-lg mb-2">Nenhum ativo cadastrado</p>
                  <Button onClick={() => setAssetDialog({ open: true, item: null })} variant="outline">+ Adicionar primeiro ativo</Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* INFRASTRUCTURE TAB */}
          <TabsContent value="infrastructure">
            <InfrastructureEditor />
          </TabsContent>
        </Tabs>
      </div>

      <ExpenseForm
        open={expenseDialog.open}
        expense={expenseDialog.item}
        onClose={() => setExpenseDialog({ open: false, item: null })}
        onSave={handleSaveExpense}
        isLoading={createExpense.isPending || updateExpense.isPending}
      />

      <AssetForm
        open={assetDialog.open}
        asset={assetDialog.item}
        onClose={() => setAssetDialog({ open: false, item: null })}
        onSave={handleSaveAsset}
        isLoading={createAsset.isPending || updateAsset.isPending}
      />
    </div>
  );
}
