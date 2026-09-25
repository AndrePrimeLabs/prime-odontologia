// @ts-nocheck
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES = [
  { value: "consumivel", label: "Consumível" },
  { value: "instrumental", label: "Instrumental" },
  { value: "medicamento", label: "Medicamento" },
  { value: "protecao_epi", label: "Proteção / EPI" },
  { value: "radiologia", label: "Radiologia" },
  { value: "laboratorio", label: "Laboratório" },
  { value: "limpeza", label: "Limpeza" },
  { value: "outros", label: "Outros" },
];

export default function InventoryForm({ item, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    name: item?.name || "",
    description: item?.description || "",
    sku: item?.sku || "",
    category: item?.category || "consumivel",
    quantity_on_hand: item?.quantity_on_hand ?? 0,
    unit: item?.unit || "un",
    reorder_point: item?.reorder_point ?? 5,
    reorder_quantity: item?.reorder_quantity || "",
    supplier: item?.supplier || "",
    supplier_contact: item?.supplier_contact || "",
    unit_cost: item?.unit_cost || "",
    last_restock_date: item?.last_restock_date || "",
    expiry_date: item?.expiry_date || "",
    location: item?.location || "",
    notes: item?.notes || "",
  });

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  const Field = ({ label, children }) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-slate-600">{label}</Label>
      {children}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nome do Material *">
          <Input value={form.name} onChange={e => set("name", e.target.value)} required placeholder="Ex: Luva nitrílica M" />
        </Field>
        <Field label="SKU / Código">
          <Input value={form.sku} onChange={e => set("sku", e.target.value)} placeholder="Ex: LUV-NIT-M" />
        </Field>
        <Field label="Categoria">
          <Select value={form.category} onValueChange={v => set("category", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Unidade de Medida">
          <Input value={form.unit} onChange={e => set("unit", e.target.value)} placeholder="un, cx, ml, g..." />
        </Field>
        <Field label="Qtd. em Estoque *">
          <Input type="number" min="0" value={form.quantity_on_hand} onChange={e => set("quantity_on_hand", Number(e.target.value))} required />
        </Field>
        <Field label="Ponto de Reposição *">
          <Input type="number" min="0" value={form.reorder_point} onChange={e => set("reorder_point", Number(e.target.value))} required placeholder="Alerta quando chegar neste nível" />
        </Field>
        <Field label="Qtd. Sugerida p/ Reposição">
          <Input type="number" min="0" value={form.reorder_quantity} onChange={e => set("reorder_quantity", Number(e.target.value))} />
        </Field>
        <Field label="Custo Unitário (R$)">
          <Input type="number" min="0" step="0.01" value={form.unit_cost} onChange={e => set("unit_cost", Number(e.target.value))} placeholder="0,00" />
        </Field>
        <Field label="Fornecedor">
          <Input value={form.supplier} onChange={e => set("supplier", e.target.value)} placeholder="Nome do fornecedor" />
        </Field>
        <Field label="Contato do Fornecedor">
          <Input value={form.supplier_contact} onChange={e => set("supplier_contact", e.target.value)} placeholder="Telefone ou email" />
        </Field>
        <Field label="Última Reposição">
          <Input type="date" value={form.last_restock_date} onChange={e => set("last_restock_date", e.target.value)} />
        </Field>
        <Field label="Validade">
          <Input type="date" value={form.expiry_date} onChange={e => set("expiry_date", e.target.value)} />
        </Field>
        <Field label="Localização no Consultório">
          <Input value={form.location} onChange={e => set("location", e.target.value)} placeholder="Ex: Armário A, Prateleira 2" className="sm:col-span-2" />
        </Field>
      </div>

      <Field label="Descrição">
        <Textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Descrição adicional..." rows={2} />
      </Field>
      <Field label="Observações">
        <Textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Observações internas..." rows={2} />
      </Field>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
          {loading ? "Salvando..." : item ? "Salvar Alterações" : "Adicionar Item"}
        </Button>
      </div>
    </form>
  );
}
