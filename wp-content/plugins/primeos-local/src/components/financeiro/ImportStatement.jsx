// @ts-nocheck
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Loader2, CheckCircle, FileSpreadsheet, AlertCircle } from "lucide-react";
import { primeos } from "@/api/primeosClient";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ImportStatement({ open, onClose, onImported }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
  };

  const handleExtract = async () => {
    if (!file) return;
    setLoading(true);
    setPreview(null);
    const { file_url } = await primeos.integrations.Core.UploadFile({ file });
    const result = await primeos.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: "object",
        properties: {
          transactions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                date: { type: "string" },
                description: { type: "string" },
                amount: { type: "number" },
                type: { type: "string", enum: ["receita", "despesa"] },
              }
            }
          }
        }
      }
    });
    setLoading(false);
    if (result.status === "success" && result.output?.transactions) {
      setPreview(result.output.transactions);
    } else {
      toast.error("Não foi possível extrair as transações. Verifique o arquivo.");
    }
  };

  const handleImport = async () => {
    if (!preview?.length) return;
    setLoading(true);
    const records = preview.map(t => ({
      type: t.type || "despesa",
      category: t.type === "receita" ? "outros_receita" : "outros_despesa",
      description: t.description || "Importado",
      amount: Math.abs(t.amount || 0),
      date: t.date || format(new Date(), "yyyy-MM-dd"),
      status: "pago",
      payment_method: "transferencia",
      bank_statement_ref: "importado",
    }));
    await primeos.entities.FinancialTransaction.bulkCreate(records);
    setLoading(false);
    toast.success(`${records.length} transações importadas!`);
    onImported();
    onClose();
    setFile(null);
    setPreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            Importar Extrato / Nota Fiscal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600 mb-3">Arraste ou selecione um arquivo (CSV, XLSX, PDF, imagem)</p>
            <input type="file" accept=".csv,.xlsx,.pdf,.png,.jpg,.jpeg" onChange={handleFileChange} className="hidden" id="stmt-upload" />
            <label htmlFor="stmt-upload">
              <Button variant="outline" asChild className="cursor-pointer">
                <span>Selecionar Arquivo</span>
              </Button>
            </label>
            {file && <p className="mt-3 text-sm text-emerald-600 font-medium">✓ {file.name}</p>}
          </div>

          {file && !preview && (
            <Button onClick={handleExtract} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <AlertCircle className="w-4 h-4 mr-2" />}
              Analisar com IA
            </Button>
          )}

          {preview && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-slate-700">{preview.length} transações encontradas</span>
              </div>
              <div className="max-h-52 overflow-y-auto space-y-1.5">
                {preview.slice(0, 20).map((t, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg text-xs">
                    <Badge className={t.type === "receita" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}>
                      {t.type}
                    </Badge>
                    <span className="flex-1 truncate text-slate-700">{t.description}</span>
                    <span className="font-bold text-slate-900">R$ {Math.abs(t.amount || 0).toFixed(2)}</span>
                  </div>
                ))}
                {preview.length > 20 && <p className="text-xs text-slate-400 text-center">+{preview.length - 20} mais...</p>}
              </div>
              <Button onClick={handleImport} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                Importar {preview.length} Transações
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
