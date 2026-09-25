// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function TicketTriageForm({ onCreated }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    subject: "",
    description: ""
  });
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    if (!formData.customer_name || !formData.subject || !formData.description) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      const response = await primeos.functions.invoke('triageTicket', {
        ticketData: formData
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setResult({
          ticket: response.data.data,
          analysis: response.data.analysis
        });
        setFormData({
          customer_name: "",
          customer_email: "",
          subject: "",
          description: ""
        });
        onCreated?.(response.data.data);
      }
    } catch (error) {
      toast.error("Erro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <Card className="border-0 shadow-sm border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="text-base">Ticket Criado: {result.ticket.ticket_id}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-600">Prioridade</p>
              <Badge className="mt-1 capitalize bg-orange-600">{result.analysis.priority}</Badge>
            </div>
            <div>
              <p className="text-xs text-slate-600">Categoria</p>
              <Badge className="mt-1 capitalize">{result.analysis.category}</Badge>
            </div>
            <div>
              <p className="text-xs text-slate-600">Sentimento</p>
              <Badge className="mt-1 capitalize">{result.analysis.sentiment}</Badge>
            </div>
            <div>
              <p className="text-xs text-slate-600">Urgência</p>
              <p className="text-lg font-bold mt-1">{result.analysis.urgency_score}/10</p>
            </div>
          </div>

          {result.analysis.needs_escalation && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">Requer escalação imediata</p>
            </div>
          )}

          <p className="text-sm text-slate-700">{result.analysis.reasoning}</p>

          <Button
            onClick={() => setResult(null)}
            variant="outline"
            className="w-full"
          >
            Criar Outro Ticket
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Novo Ticket de Suporte</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Nome do Cliente *</Label>
            <Input
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              placeholder="Nome"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Email</Label>
            <Input
              value={formData.customer_email}
              onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
              placeholder="email@example.com"
              className="mt-1"
              type="email"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs">Assunto *</Label>
          <Input
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Assunto do problema"
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-xs">Descrição *</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descreva o problema em detalhes"
            rows={4}
            className="mt-1 resize-none"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analisando...
            </>
          ) : (
            "Criar e Triar Ticket"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
