// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Beaker } from "lucide-react";
import { toast } from "sonner";

export default function ABTestBuilder({ onCreated }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    test_name: "",
    campaign_type: "email",
    test_duration_days: 7,
    audience_size: 100,
    variant_a: { name: "Variante A", subject: "", body: "", cta: "" },
    variant_b: { name: "Variante B", subject: "", body: "", cta: "" }
  });

  const handleCreate = async () => {
    if (!formData.test_name || !formData.variant_a.subject || !formData.variant_b.subject) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      const response = await primeos.functions.invoke('createABTest', {
        testData: formData
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setFormData({
          test_name: "",
          campaign_type: "email",
          test_duration_days: 7,
          audience_size: 100,
          variant_a: { name: "Variante A", subject: "", body: "", cta: "" },
          variant_b: { name: "Variante B", subject: "", body: "", cta: "" }
        });
        onCreated?.(response.data.data);
      }
    } catch (error) {
      toast.error("Erro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Beaker className="w-5 h-5 text-blue-600" />
          Criar Teste A/B
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test Info */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900">Informações do Teste</h3>
          
          <div>
            <Label className="text-xs">Nome do Teste *</Label>
            <Input
              value={formData.test_name}
              onChange={(e) => setFormData({ ...formData, test_name: e.target.value })}
              placeholder="Ex: Teste de Assunto de Email Março"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-xs">Tipo de Campanha</Label>
              <Select value={formData.campaign_type} onValueChange={(value) =>
                setFormData({ ...formData, campaign_type: value })
              }>
                <SelectTrigger className="mt-1 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="push">Push</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Duração (dias)</Label>
              <Input
                type="number"
                value={formData.test_duration_days}
                onChange={(e) => setFormData({ ...formData, test_duration_days: parseInt(e.target.value) })}
                min="3"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">Tamanho por Variante</Label>
              <Input
                type="number"
                value={formData.audience_size}
                onChange={(e) => setFormData({ ...formData, audience_size: parseInt(e.target.value) })}
                min="10"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {["a", "b"].map((variant) => {
            const key = `variant_${variant}`;
            const data = formData[key];
            
            return (
              <div key={variant} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <Badge className="bg-blue-600">Variante {variant.toUpperCase()}</Badge>
                
                <div>
                  <Label className="text-xs">Nome</Label>
                  <Input
                    value={data.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      [key]: { ...data, name: e.target.value }
                    })}
                    className="mt-1 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs">Assunto/Título *</Label>
                  <Input
                    value={data.subject}
                    onChange={(e) => setFormData({
                      ...formData,
                      [key]: { ...data, subject: e.target.value }
                    })}
                    placeholder="Assunto principal"
                    className="mt-1 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs">Corpo/Descrição</Label>
                  <Textarea
                    value={data.body}
                    onChange={(e) => setFormData({
                      ...formData,
                      [key]: { ...data, body: e.target.value }
                    })}
                    placeholder="Conteúdo principal"
                    rows={3}
                    className="mt-1 text-sm resize-none"
                  />
                </div>

                <div>
                  <Label className="text-xs">CTA (Call-to-Action)</Label>
                  <Input
                    value={data.cta}
                    onChange={(e) => setFormData({
                      ...formData,
                      [key]: { ...data, cta: e.target.value }
                    })}
                    placeholder="Botão de ação"
                    className="mt-1 text-sm"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <Button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Criando...
            </>
          ) : (
            <>
              <Beaker className="w-4 h-4" />
              Criar Teste A/B
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
