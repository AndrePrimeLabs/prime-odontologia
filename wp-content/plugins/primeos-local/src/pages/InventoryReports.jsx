// @ts-nocheck
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import {
  BarChart3, AlertTriangle, CalendarX2, DollarSign,
  Download, Filter, RefreshCw, Package, Truck, Search, ArrowLeft
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import {
  CATEGORY_LABELS, CATEGORY_COLORS, CATEGORY_CHART_COLORS,
  getStockStatus, exportCSV
} from "@/components/inventory/inventoryConstants";

// ── helpers ────────────────────────────────────────────────────────────────
const fmt = (n) => `R$ ${Number(n || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", bg)}>
          <Icon className={cn("w-5 h-5", color)} />
        </div>
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className={cn("text-lg font-bold", color)}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── sub-reports ─────────────────────────────────────────────────────────────

function StockLevels({ items, category }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    let list = category === "all" ? items : items.filter(i => i.category === category);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(i => i.name?.toLowerCase().includes(q) || i.sku?.toLowerCase().includes(q));
    }
    return list.sort((a, b) => a.quantity_on_hand - b.quantity_on_hand);
  }, [items, category, search]);

  const chartData = useMemo(() =>
    Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
      name: label,
      items: items.filter(i => i.category === key).length,
      value: items.filter(i => i.category === key).reduce((s, i) => s + (i.quantity_on_hand || 0) * (i.unit_cost || 0), 0),
    })).filter(d => d.items > 0),
    [items]
  );

  const pieData = useMemo(() => {
    const statusCount = { ok: 0, low: 0, empty: 0 };
    items.forEach(i => { statusCount[getStockStatus(i).key]++; });
    return [
      { name: "OK", value: statusCount.ok, color: "#22c55e" },
      { name: "Repor", value: statusCount.low, color: "#f97316" },
      { name: "Sem estoque", value: statusCount.empty, color: "#ef4444" },
    ].filter(d => d.value > 0);
  }, [items]);

  const handleExport = () => {
    exportCSV(filtered.map(i => ({
      Nome: i.name, SKU: i.sku || "", Categoria: CATEGORY_LABELS[i.category] || i.category,
      "Qtd. em Estoque": i.quantity_on_hand, Unidade: i.unit || "un",
      "Ponto de Reposição": i.reorder_point, Status: getStockStatus(i).label,
      Fornecedor: i.supplier || "", "Custo Unit.": i.unit_cost || 0,
      "Valor Total": (i.quantity_on_hand || 0) * (i.unit_cost || 0),
    })), "relatorio_estoque");
  };

  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-2 gap-5">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Valor por Categoria</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: 10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [fmt(v), "Valor"]} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Status do Estoque</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} />
                <Tooltip formatter={(v, name) => [v + " itens", name]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar item..." className="pl-9" />
        </div>
        <Button variant="outline" onClick={handleExport} className="gap-2 shrink-0">
          <Download className="w-4 h-4" /> Exportar CSV
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["Item / SKU", "Categoria", "Estoque", "Ponto Reposição", "Custo Unit.", "Valor Total", "Status"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(item => {
                const st = getStockStatus(item);
                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{item.name}</p>
                      {item.sku && <p className="text-xs text-slate-400">SKU: {item.sku}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={cn("text-xs", CATEGORY_COLORS[item.category])}>{CATEGORY_LABELS[item.category] || item.category}</Badge>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{item.quantity_on_hand} <span className="text-xs font-normal text-slate-400">{item.unit || "un"}</span></td>
                    <td className="px-4 py-3 text-slate-600">{item.reorder_point} {item.unit || "un"}</td>
                    <td className="px-4 py-3 text-slate-700">{item.unit_cost ? fmt(item.unit_cost) : "—"}</td>
                    <td className="px-4 py-3 font-medium text-emerald-700">{item.unit_cost ? fmt((item.quantity_on_hand || 0) * item.unit_cost) : "—"}</td>
                    <td className="px-4 py-3"><Badge className={cn("text-xs", st.color)}>{st.label}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LowStockReport({ items }) {
  const lowStock = useMemo(() =>
    items.filter(i => i.quantity_on_hand <= i.reorder_point)
      .sort((a, b) => (a.quantity_on_hand / (a.reorder_point || 1)) - (b.quantity_on_hand / (b.reorder_point || 1))),
    [items]
  );

  const handleExport = () => {
    exportCSV(lowStock.map(i => ({
      Nome: i.name, SKU: i.sku || "", Categoria: CATEGORY_LABELS[i.category] || "",
      "Qtd. Atual": i.quantity_on_hand, "Ponto Reposição": i.reorder_point,
      "Qtd. Sugerida": i.reorder_quantity || "", Fornecedor: i.supplier || "",
      Contato: i.supplier_contact || "", Status: getStockStatus(i).label,
    })), "itens_baixo_estoque");
  };

  if (lowStock.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
        <Package className="w-10 h-10 text-green-400" />
        <p className="font-medium text-green-600">Todos os itens estão com estoque adequado!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">{lowStock.length} {lowStock.length === 1 ? "item abaixo" : "itens abaixo"} do ponto de reposição</p>
        <Button variant="outline" onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" /> Exportar CSV
        </Button>
      </div>

      <div className="space-y-3">
        {lowStock.map(item => {
          const st = getStockStatus(item);
          const pct = item.reorder_point > 0 ? Math.min(100, Math.round((item.quantity_on_hand / item.reorder_point) * 100)) : 0;
          return (
            <div key={item.id} className={cn("p-4 rounded-xl border", item.quantity_on_hand === 0 ? "bg-red-50 border-red-200" : "bg-orange-50 border-orange-200")}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    {item.sku && <span className="text-xs text-slate-400">SKU: {item.sku}</span>}
                    <Badge className={cn("text-xs", st.color)}>{st.label}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-600 mb-2">
                    <span>Atual: <strong>{item.quantity_on_hand} {item.unit || "un"}</strong></span>
                    <span>Mínimo: <strong>{item.reorder_point} {item.unit || "un"}</strong></span>
                    {item.reorder_quantity && <span>Sugestão de compra: <strong>{item.reorder_quantity} {item.unit || "un"}</strong></span>}
                  </div>
                  <div className="w-full bg-white/60 rounded-full h-1.5 mb-2">
                    <div className={cn("h-1.5 rounded-full transition-all", item.quantity_on_hand === 0 ? "bg-red-500" : "bg-orange-500")} style={{ width: `${pct}%` }} />
                  </div>
                  {item.supplier && (
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Truck className="w-3 h-3" /> {item.supplier} {item.supplier_contact && `· ${item.supplier_contact}`}
                    </p>
                  )}
                </div>
                {item.unit_cost && item.reorder_quantity && (
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-400">Custo estimado</p>
                    <p className="font-bold text-emerald-700">{fmt(item.reorder_quantity * item.unit_cost)}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ExpiringReport({ items }) {
  const [daysAhead, setDaysAhead] = useState("90");
  const days = parseInt(daysAhead);
  const today = new Date();
  const cutoff = new Date(today.getTime() + days * 864e5);

  const expiring = useMemo(() =>
    items
      .filter(i => i.expiry_date && new Date(i.expiry_date) >= today && new Date(i.expiry_date) <= cutoff)
      .sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date)),
    [items, daysAhead]
  );

  const expired = useMemo(() =>
    items.filter(i => i.expiry_date && new Date(i.expiry_date) < today)
      .sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date)),
    [items]
  );

  const handleExport = () => {
    exportCSV([...expired, ...expiring].map(i => ({
      Nome: i.name, SKU: i.sku || "", Categoria: CATEGORY_LABELS[i.category] || "",
      "Data Validade": i.expiry_date, "Dias p/ Vencer": differenceInDays(new Date(i.expiry_date), today),
      "Qtd. em Estoque": i.quantity_on_hand, Fornecedor: i.supplier || "",
    })), "itens_validade");
  };

  const urgencyColor = (d) => {
    const diff = differenceInDays(new Date(d), today);
    if (diff < 0) return "bg-red-50 border-red-300 text-red-700";
    if (diff <= 30) return "bg-red-50 border-red-200 text-red-600";
    if (diff <= 60) return "bg-orange-50 border-orange-200 text-orange-600";
    return "bg-yellow-50 border-yellow-200 text-yellow-700";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Vencimentos nos próximos</span>
          <Select value={daysAhead} onValueChange={setDaysAhead}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="60">60 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
              <SelectItem value="180">180 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" /> Exportar CSV
        </Button>
      </div>

      {expired.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-red-600 mb-2">⛔ Vencidos ({expired.length})</p>
          <div className="space-y-2">
            {expired.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-300">
                <div>
                  <p className="font-medium text-slate-900">{item.name}</p>
                  <p className="text-xs text-red-600">Venceu em {format(new Date(item.expiry_date), "dd/MM/yyyy")} · {Math.abs(differenceInDays(new Date(item.expiry_date), today))} dias atrás</p>
                </div>
                <Badge className="bg-red-100 text-red-700 border-red-200">{item.quantity_on_hand} {item.unit || "un"}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {expiring.length === 0 && expired.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
          <CalendarX2 className="w-8 h-8 text-green-400" />
          <p className="text-green-600 font-medium">Nenhum item vencendo neste período!</p>
        </div>
      ) : (
        <div>
          {expiring.length > 0 && <p className="text-sm font-semibold text-slate-700 mb-2">A vencer ({expiring.length})</p>}
          <div className="space-y-2">
            {expiring.map(item => {
              const diff = differenceInDays(new Date(item.expiry_date), today);
              return (
                <div key={item.id} className={cn("flex items-center justify-between p-3 rounded-lg border", urgencyColor(item.expiry_date))}>
                  <div>
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="text-xs">Vence em {format(new Date(item.expiry_date), "dd/MM/yyyy")} · <strong>{diff} dias</strong></p>
                  </div>
                  <Badge className="bg-white/70">{item.quantity_on_hand} {item.unit || "un"}</Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StockValueReport({ items }) {
  const categoryData = useMemo(() =>
    Object.entries(CATEGORY_LABELS).map(([key, label], i) => {
      const catItems = items.filter(i => i.category === key);
      const value = catItems.reduce((s, i) => s + (i.quantity_on_hand || 0) * (i.unit_cost || 0), 0);
      return { name: label, value, items: catItems.length, color: CATEGORY_CHART_COLORS[i] };
    }).filter(d => d.value > 0).sort((a, b) => b.value - a.value),
    [items]
  );

  const totalValue = categoryData.reduce((s, d) => s + d.value, 0);

  const topItems = useMemo(() =>
    items
      .map(i => ({ ...i, total_value: (i.quantity_on_hand || 0) * (i.unit_cost || 0) }))
      .filter(i => i.total_value > 0)
      .sort((a, b) => b.total_value - a.total_value)
      .slice(0, 10),
    [items]
  );

  const handleExport = () => {
    exportCSV(items.filter(i => i.unit_cost).map(i => ({
      Nome: i.name, SKU: i.sku || "", Categoria: CATEGORY_LABELS[i.category] || "",
      "Qtd. em Estoque": i.quantity_on_hand, "Custo Unit.": i.unit_cost,
      "Valor Total": (i.quantity_on_hand || 0) * (i.unit_cost || 0),
    })), "valor_estoque");
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button variant="outline" onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" /> Exportar CSV
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Distribuição de Valor por Categoria</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name">
                  {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs">{v}</span>} />
                <Tooltip formatter={(v) => [fmt(v), "Valor"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Valor por Categoria</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {categoryData.map((d, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    {d.name}
                  </span>
                  <span className="font-semibold text-slate-900">{fmt(d.value)}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full" style={{ width: `${(d.value / totalValue) * 100}%`, backgroundColor: d.color }} />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-bold">
              <span>Total em Estoque</span>
              <span className="text-emerald-700">{fmt(totalValue)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Top 10 Itens por Valor</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["#", "Item", "Categoria", "Qtd.", "Custo Unit.", "Valor Total"].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {topItems.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2 text-slate-400 font-medium">{idx + 1}</td>
                  <td className="px-3 py-2 font-medium text-slate-900">{item.name}</td>
                  <td className="px-3 py-2"><Badge className={cn("text-xs", CATEGORY_COLORS[item.category])}>{CATEGORY_LABELS[item.category] || item.category}</Badge></td>
                  <td className="px-3 py-2 text-slate-700">{item.quantity_on_hand} {item.unit || "un"}</td>
                  <td className="px-3 py-2 text-slate-600">{fmt(item.unit_cost)}</td>
                  <td className="px-3 py-2 font-semibold text-emerald-700">{fmt(item.total_value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function SupplierReport({ items }) {
  const supplierData = useMemo(() => {
    const map = {};
    items.forEach(i => {
      if (!i.supplier) return;
      if (!map[i.supplier]) {
        map[i.supplier] = {
          name: i.supplier, contact: i.supplier_contact || "",
          items: [], totalValue: 0, lowStockItems: 0, categories: new Set()
        };
      }
      map[i.supplier].items.push(i);
      map[i.supplier].totalValue += (i.quantity_on_hand || 0) * (i.unit_cost || 0);
      if (getStockStatus(i).key !== "ok") map[i.supplier].lowStockItems++;
      if (i.category) map[i.supplier].categories.add(i.category);
    });
    return Object.values(map)
      .map(s => ({ ...s, categories: [...s.categories] }))
      .sort((a, b) => b.totalValue - a.totalValue);
  }, [items]);

  const chartData = supplierData.slice(0, 8).map(s => ({
    name: s.name.length > 12 ? s.name.slice(0, 12) + "…" : s.name,
    itens: s.items.length,
    valor: s.totalValue,
  }));

  const handleExport = () => {
    exportCSV(supplierData.map(s => ({
      Fornecedor: s.name, Contato: s.contact,
      "Nº de Itens": s.items.length, "Itens p/ Repor": s.lowStockItems,
      "Valor Total": s.totalValue,
      Categorias: s.categories.map(c => CATEGORY_LABELS[c] || c).join(", "),
    })), "fornecedores");
  };

  if (supplierData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
        <Truck className="w-8 h-8" />
        <p className="text-sm">Nenhum fornecedor cadastrado nos itens</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button variant="outline" onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" /> Exportar CSV
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Itens por Fornecedor</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: 10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="itens" name="Itens" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {supplierData.map((s, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-slate-900">{s.name}</p>
                  {s.contact && <p className="text-xs text-slate-400">{s.contact}</p>}
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Valor em estoque</p>
                  <p className="font-bold text-emerald-700 text-sm">{fmt(s.totalValue)}</p>
                </div>
              </div>
              <div className="flex gap-3 text-xs text-slate-600 mb-3">
                <span className="flex items-center gap-1"><Package className="w-3 h-3" />{s.items.length} itens</span>
                {s.lowStockItems > 0 && (
                  <span className="flex items-center gap-1 text-orange-600">
                    <AlertTriangle className="w-3 h-3" />{s.lowStockItems} p/ repor
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {s.categories.map(c => (
                  <Badge key={c} className={cn("text-xs", CATEGORY_COLORS[c])}>{CATEGORY_LABELS[c] || c}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── main page ───────────────────────────────────────────────────────────────
export default function InventoryReports() {
  const [category, setCategory] = useState("all");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => primeos.entities.InventoryItem.list("-updated_date", 500),
  });

  const activeItems = useMemo(() => items.filter(i => i.is_active !== false), [items]);

  const totalValue = useMemo(() => activeItems.reduce((s, i) => s + (i.quantity_on_hand || 0) * (i.unit_cost || 0), 0), [activeItems]);
  const lowStock = useMemo(() => activeItems.filter(i => i.quantity_on_hand <= i.reorder_point), [activeItems]);
  const expiring30 = useMemo(() => {
    const cutoff = new Date(Date.now() + 30 * 864e5);
    return activeItems.filter(i => i.expiry_date && new Date(i.expiry_date) <= cutoff);
  }, [activeItems]);
  const suppliers = useMemo(() => new Set(activeItems.filter(i => i.supplier).map(i => i.supplier)).size, [activeItems]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" /> Carregando dados...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <Link to={createPageUrl("Inventory")} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-2">
              <ArrowLeft className="w-4 h-4" /> Voltar ao Estoque
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
              Relatórios de Estoque
            </h1>
            <p className="text-sm text-slate-500">Análise completa dos materiais odontológicos</p>
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {Object.entries(CATEGORY_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total de Itens" value={activeItems.length} icon={Package} color="text-indigo-600" bg="bg-indigo-50" />
          <StatCard label="Precisam Reposição" value={lowStock.length} icon={AlertTriangle} color="text-orange-600" bg="bg-orange-50" />
          <StatCard label="Vencendo em 30 dias" value={expiring30.length} icon={CalendarX2} color="text-red-600" bg="bg-red-50" />
          <StatCard label="Valor Total" value={fmt(totalValue)} icon={DollarSign} color="text-emerald-600" bg="bg-emerald-50" />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="stock">
          <TabsList className="flex flex-wrap gap-1 h-auto">
            <TabsTrigger value="stock" className="gap-1.5"><BarChart3 className="w-3.5 h-3.5" />Níveis de Estoque</TabsTrigger>
            <TabsTrigger value="lowstock" className="gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />Baixo Estoque
              {lowStock.length > 0 && <span className="ml-1 bg-orange-500 text-white text-[10px] rounded-full px-1.5">{lowStock.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="expiring" className="gap-1.5">
              <CalendarX2 className="w-3.5 h-3.5" />Validade
              {expiring30.length > 0 && <span className="ml-1 bg-red-500 text-white text-[10px] rounded-full px-1.5">{expiring30.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="value" className="gap-1.5"><DollarSign className="w-3.5 h-3.5" />Valor em Estoque</TabsTrigger>
            <TabsTrigger value="suppliers" className="gap-1.5"><Truck className="w-3.5 h-3.5" />Fornecedores</TabsTrigger>
          </TabsList>

          <div className="mt-5">
            <TabsContent value="stock"><StockLevels items={activeItems} category={category} /></TabsContent>
            <TabsContent value="lowstock"><LowStockReport items={activeItems} /></TabsContent>
            <TabsContent value="expiring"><ExpiringReport items={activeItems} /></TabsContent>
            <TabsContent value="value"><StockValueReport items={activeItems} /></TabsContent>
            <TabsContent value="suppliers"><SupplierReport items={activeItems} /></TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
