// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function ScheduleReportForm({ onScheduled }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    reportName: "",
    reportType: "sales",
    frequency: "weekly",
    time: "09:00",
    format: "pdf",
    recipients: []
  });

  const handleSchedule = async () => {
    if (!formData.reportName) {
      toast.error("Digite um nome para o relatório");
      return;
    }

    setLoading(true);
    try {
      const response = await primeos.functions.invoke('scheduleReport', formData);

      if (response.data.success) {
        toast.success(response.data.message);
        setFormData({
          reportName: "",
          reportType: "sales",
          frequency: "weekly",
          time: "09:00",
          format: "pdf",
          recipients: []
        });
        onScheduled?.(response.data.data);
      }
    } catch (error) {
      toast.error("Erro ao agendar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-600" />
          Agendar Relatório Recorrente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label className="text-xs">Nome do Relatório *</Label>
            <Input
              value={formData.reportName}
              onChange={(e) => setFormData({ ...formData, reportName: e.target.value })}
              placeholder="Ex: Relatório de Vendas Semanal"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Tipo de Relatório</Label>
              <Select value={formData.reportType} onValueChange={(value) =>
                setFormData({ ...formData, reportType: value })
              }>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Vendas</SelectItem>
                  <SelectItem value="leads">Leads</SelectItem>
                  <SelectItem value="appointments">Agendamentos</SelectItem>
                  <SelectItem value="revenue">Receita</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Frequência</Label>
              <Select value={formData.frequency} onValueChange={(value) =>
                setFormData({ ...formData, frequency: value })
              }>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diário</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Horário de Envio</Label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">Formato</Label>
              <Select value={formData.format} onValueChange={(value) =>
                setFormData({ ...formData, format: value })
              }>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="both">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg border border-purple-200">
            <p className="text-xs text-slate-600 mb-2">
              <Sparkles className="w-3 h-3 inline mr-1 text-purple-600" />
              Ganhe pontos cada vez que o relatório for gerado automaticamente!
            </p>
            <Badge className="bg-purple-600">+25 pontos por relatório</Badge>
          </div>

          <Button
            onClick={handleSchedule}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Agendando...
              </>
            ) : (
              <>
                <Clock className="w-4 h-4" />
                Agendar Relatório
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
