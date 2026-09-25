// @ts-nocheck
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Check, X, Tag } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "financial_categories_v1";

export const DEFAULT_CATEGORIES = {
  receita: [
    { value: "consulta", label: "Consulta", color: "#10b981" },
    { value: "procedimento", label: "Procedimento", color: "#6366f1" },
    { value: "ortodontia", label: "Ortodontia", color: "#3b82f6" },
    { value: "implante", label: "Implante", color: "#8b5cf6" },
    { value: "clareamento", label: "Clareamento", color: "#f59e0b" },
    { value: "outros_receita", label: "Outros", color: "#64748b" },
  ],
  despesa: [
    { value: "material", label: "Material/Insumo", color: "#ef4444" },
    { value: "equipamento", label: "Equipamento", color: "#f97316" },
    { value: "aluguel", label: "Aluguel", color: "#f59e0b" },
    { value: "condominio", label: "Condomínio", color: "#f97316" },
    { value: "luz", label: "Luz/Energia", color: "#fbbf24" },
    { value: "internet", label: "Internet/Tel.", color: "#06b6d4" },
    { value: "salario", label: "Salário", color: "#3b82f6" },
    { value: "marketing", label: "Marketing", color: "#8b5cf6" },
    { value: "impostos", label: "Impostos", color: "#ef4444" },
    { value: "servicos", label: "Serviços", color: "#06b6d4" },
    { value: "tecnologia", label: "Tecnologia", color: "#6366f1" },
    { value: "outros_despesa", label: "Outros", color: "#64748b" },
  ],
};

export function loadCategories() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  } catch { return DEFAULT_CATEGORIES; }
}

function saveCategories(cats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
}

const PRESET_COLORS = ["#10b981","#6366f1","#f59e0b","#ef4444","#3b82f6","#8b5cf6","#f97316","#06b6d4","#ec4899","#64748b"];

function CategoryRow({ cat, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-white rounded-lg border hover:border-indigo-200 transition-colors group">
      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
      <span className="flex-1 text-sm text-slate-700">{cat.label}</span>
      <span className="text-xs text-slate-400 font-mono">{cat.value}</span>
      <div className="hidden group-hover:flex gap-1">
        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-indigo-600" onClick={() => onEdit(cat)}>
          <Pencil className="w-3 h-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-600" onClick={() => onDelete(cat.value)}>
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

function AddEditForm({ initial, onSave, onCancel }) {
  const [label, setLabel] = useState(initial?.label || "");
  const [color, setColor] = useState(initial?.color || PRESET_COLORS[0]);

  const handleSave = () => {
    if (!label.trim()) return;
    const value = initial?.value || label.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    onSave({ value, label: label.trim(), color });
  };

  return (
    <div className="border border-indigo-200 rounded-lg p-3 bg-indigo-50/50 space-y-3">
      <div className="flex gap-2">
        <Input value={label} onChange={e => setLabel(e.target.value)} placeholder="Nome da categoria" className="flex-1 h-8 text-sm"
          onKeyDown={e => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") onCancel(); }} autoFocus />
        <Button size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-700 px-3" onClick={handleSave}><Check className="w-3.5 h-3.5" /></Button>
        <Button size="sm" variant="ghost" className="h-8 px-3" onClick={onCancel}><X className="w-3.5 h-3.5" /></Button>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {PRESET_COLORS.map(c => (
          <button key={c} className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
            style={{ backgroundColor: c, borderColor: color === c ? "#1e293b" : "transparent" }}
            onClick={() => setColor(c)} />
        ))}
      </div>
    </div>
  );
}

export default function CategoryManager() {
  const [categories, setCategories] = useState(loadCategories);
  const [adding, setAdding] = useState(null); // "receita" | "despesa"
  const [editing, setEditing] = useState(null); // { type, cat }

  const update = (newCats) => { setCategories(newCats); saveCategories(newCats); };

  const handleSave = (type, cat) => {
    const list = categories[type];
    const existing = list.findIndex(c => c.value === cat.value);
    const newList = existing >= 0 ? list.map((c, i) => i === existing ? cat : c) : [...list, cat];
    update({ ...categories, [type]: newList });
    setAdding(null); setEditing(null);
    toast.success("Categoria salva!");
  };

  const handleDelete = (type, value) => {
    if (!confirm("Excluir esta categoria?")) return;
    update({ ...categories, [type]: categories[type].filter(c => c.value !== value) });
    toast.success("Categoria removida.");
  };

  const handleReset = () => {
    if (!confirm("Restaurar categorias padrão? Categorias personalizadas serão perdidas.")) return;
    update(DEFAULT_CATEGORIES);
    toast.success("Categorias restauradas.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Categorias Personalizadas</h2>
          <p className="text-sm text-slate-500">Configure as categorias de receitas e despesas</p>
        </div>
        <Button variant="outline" size="sm" className="text-xs" onClick={handleReset}>Restaurar padrão</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* RECEITAS */}
        <Card className="border shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600" />
                Categorias de Receita
                <Badge className="bg-emerald-100 text-emerald-700 border-0">{categories.receita.length}</Badge>
              </CardTitle>
              <Button size="sm" variant="ghost" className="h-7 text-xs text-emerald-600 hover:bg-emerald-50"
                onClick={() => { setAdding("receita"); setEditing(null); }}>
                <Plus className="w-3 h-3 mr-1" /> Adicionar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {adding === "receita" && (
              <AddEditForm onSave={(cat) => handleSave("receita", cat)} onCancel={() => setAdding(null)} />
            )}
            {categories.receita.map(cat => (
              editing?.type === "receita" && editing?.cat.value === cat.value ? (
                <AddEditForm key={cat.value} initial={cat} onSave={(c) => handleSave("receita", c)} onCancel={() => setEditing(null)} />
              ) : (
                <CategoryRow key={cat.value} cat={cat}
                  onEdit={(c) => { setEditing({ type: "receita", cat: c }); setAdding(null); }}
                  onDelete={(v) => handleDelete("receita", v)} />
              )
            ))}
            {categories.receita.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Nenhuma categoria</p>}
          </CardContent>
        </Card>

        {/* DESPESAS */}
        <Card className="border shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Tag className="w-4 h-4 text-rose-600" />
                Categorias de Despesa
                <Badge className="bg-rose-100 text-rose-700 border-0">{categories.despesa.length}</Badge>
              </CardTitle>
              <Button size="sm" variant="ghost" className="h-7 text-xs text-rose-600 hover:bg-rose-50"
                onClick={() => { setAdding("despesa"); setEditing(null); }}>
                <Plus className="w-3 h-3 mr-1" /> Adicionar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {adding === "despesa" && (
              <AddEditForm onSave={(cat) => handleSave("despesa", cat)} onCancel={() => setAdding(null)} />
            )}
            {categories.despesa.map(cat => (
              editing?.type === "despesa" && editing?.cat.value === cat.value ? (
                <AddEditForm key={cat.value} initial={cat} onSave={(c) => handleSave("despesa", c)} onCancel={() => setEditing(null)} />
              ) : (
                <CategoryRow key={cat.value} cat={cat}
                  onEdit={(c) => { setEditing({ type: "despesa", cat: c }); setAdding(null); }}
                  onDelete={(v) => handleDelete("despesa", v)} />
              )
            ))}
            {categories.despesa.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Nenhuma categoria</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
