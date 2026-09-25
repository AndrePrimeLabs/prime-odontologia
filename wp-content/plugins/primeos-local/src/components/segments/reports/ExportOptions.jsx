// @ts-nocheck
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { resolveFunctionUrl } from "@/lib/functionsApi";

export default function ExportOptions({ reportData, reportTitle, filters, loading }) {
  const handleExport = async (format) => {
    if (!reportData || reportData.length === 0) {
      toast.error("Nenhum dado para exportar");
      return;
    }

    try {
      const response = await fetch(resolveFunctionUrl('exportReport'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          reportData,
          reportTitle,
          filters
        })
      });

      if (!response.ok) throw new Error('Erro ao exportar');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportTitle}_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      toast.success(`Relatório exportado em ${format.toUpperCase()}!`);
    } catch (error) {
      toast.error(`Erro ao exportar: ${error.message}`);
    }
  };

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <FileDown className="w-5 h-5 text-blue-600" />
              Exportar Relatório
            </h3>
            <p className="text-sm text-slate-600">Baixe o relatório em seu formato preferido</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={() => handleExport('csv')}
              disabled={loading}
              variant="outline"
              className="flex-1 sm:flex-none gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
              CSV
            </Button>
            <Button
              onClick={() => handleExport('pdf')}
              disabled={loading}
              className="flex-1 sm:flex-none gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
              PDF
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
