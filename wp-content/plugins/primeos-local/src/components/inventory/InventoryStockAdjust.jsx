// @ts-nocheck
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PackagePlus, PackageMinus } from "lucide-react";

export default function InventoryStockAdjust({ item, onConfirm, onCancel, loading }) {
  const [type, setType] = useState("add");
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState("");

  const newQty = type === "add"
    ? item.quantity_on_hand + Number(qty)
    : Math.max(0, item.quantity_on_hand - Number(qty));

  return (
    <div className="space-y-4">
      <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-700">
        Estoque atual: <strong>{item.quantity_on_hand} {item.unit || "un"}</strong>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setType("add")}
          className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${type === "add" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
        >
          <PackagePlus className="w-5 h-5" />
          <span className="text-sm font-medium">Entrada</span>
        </button>
        <button
          type="button"
          onClick={() => setType("remove")}
          className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${type === "remove" ? "border-red-400 bg-red-50 text-red-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
        >
          <PackageMinus className="w-5 h-5" />
          <span className="text-sm font-medium">Saída</span>
        </button>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-slate-600">Quantidade</Label>
        <Input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-slate-600">Motivo (opcional)</Label>
        <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="Ex: Reposição mensal, uso em procedimento..." />
      </div>

      <div className={`p-3 rounded-lg text-sm font-medium ${newQty <= item.reorder_point ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
        Novo estoque: <strong>{newQty} {item.unit || "un"}</strong>
        {newQty <= item.reorder_point && " ⚠️ Abaixo do ponto de reposição"}
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button
          disabled={loading || qty < 1}
          onClick={() => onConfirm({ type, qty: Number(qty), newQty, reason })}
          className={type === "add" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-500 hover:bg-red-600"}
        >
          {loading ? "Salvando..." : type === "add" ? "Registrar Entrada" : "Registrar Saída"}
        </Button>
      </div>
    </div>
  );
}
