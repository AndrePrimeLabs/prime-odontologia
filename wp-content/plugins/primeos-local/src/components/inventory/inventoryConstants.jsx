// @ts-nocheck
export const CATEGORY_LABELS = {
  consumivel: "Consumível",
  instrumental: "Instrumental",
  medicamento: "Medicamento",
  protecao_epi: "Proteção / EPI",
  radiologia: "Radiologia",
  laboratorio: "Laboratório",
  limpeza: "Limpeza",
  outros: "Outros",
};

export const CATEGORY_COLORS = {
  consumivel: "bg-blue-100 text-blue-700",
  instrumental: "bg-indigo-100 text-indigo-700",
  medicamento: "bg-purple-100 text-purple-700",
  protecao_epi: "bg-teal-100 text-teal-700",
  radiologia: "bg-orange-100 text-orange-700",
  laboratorio: "bg-pink-100 text-pink-700",
  limpeza: "bg-cyan-100 text-cyan-700",
  outros: "bg-slate-100 text-slate-600",
};

export const CATEGORY_CHART_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#14b8a6",
  "#f97316", "#06b6d4", "#84cc16", "#94a3b8"
];

export function getStockStatus(item) {
  if (item.quantity_on_hand === 0)
    return { label: "Sem estoque", color: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500", key: "empty" };
  if (item.quantity_on_hand <= item.reorder_point)
    return { label: "Repor", color: "bg-orange-100 text-orange-700 border-orange-200", dot: "bg-orange-500", key: "low" };
  return { label: "OK", color: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500", key: "ok" };
}

export function exportCSV(rows, filename) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map(r => headers.map(h => {
      const v = r[h] ?? "";
      return `"${String(v).replace(/"/g, '""')}"`;
    }).join(","))
  ].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}
