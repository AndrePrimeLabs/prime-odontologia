// @ts-nocheck
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, FileText } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const STATUS_COLORS = {
  pago: "bg-emerald-100 text-emerald-700",
  pendente: "bg-amber-100 text-amber-700",
  vencido: "bg-red-100 text-red-700",
  cancelado: "bg-slate-100 text-slate-500",
};

const CATEGORY_LABELS = {
  consulta: "Consulta", procedimento: "Procedimento", material: "Material",
  equipamento: "Equipamento", aluguel: "Aluguel", salario: "Salário",
  marketing: "Marketing", impostos: "Impostos",
  outros_receita: "Outros", outros_despesa: "Outros",
};

export default function TransactionList({ transactions, onEdit, onDelete }) {
  if (!transactions.length) {
    return (
      <div className="text-center py-12 text-slate-400">
        <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p>Nenhuma transação encontrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map(tx => (
        <div key={tx.id} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 hover:shadow-sm transition-shadow">
          <div className={cn(
            "w-2 h-10 rounded-full flex-shrink-0",
            tx.type === "receita" ? "bg-emerald-500" : "bg-rose-500"
          )} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-slate-900 truncate">{tx.description}</span>
              <Badge variant="outline" className="text-xs">{CATEGORY_LABELS[tx.category] || tx.category}</Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
              <span>{tx.date ? format(new Date(tx.date), "dd/MM/yyyy") : "—"}</span>
              {tx.patient_name && <span>👤 {tx.patient_name}</span>}
              {tx.supplier && <span>🏢 {tx.supplier}</span>}
              {tx.invoice_number && <span>NF: {tx.invoice_number}</span>}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className={cn("font-bold text-base", tx.type === "receita" ? "text-emerald-600" : "text-rose-600")}>
              {tx.type === "receita" ? "+" : "-"} R$ {(tx.amount || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <Badge className={cn("text-xs mt-1", STATUS_COLORS[tx.status])}>{tx.status}</Badge>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(tx)}>
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => onDelete(tx.id)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
