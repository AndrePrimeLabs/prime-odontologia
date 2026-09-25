// @ts-nocheck
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

export default function SegmentForm({ segment, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState(
    segment || {
      name: "",
      descricao: "",
      criterios: {
        score_min: 0,
        score_max: 100,
        interacoes_min: 0,
        valor_min: 0,
        dias_sem_contato: 0,
        interesse: [],
        canal_preferido: "",
      },
      cor: "#6366f1",
      ativo: true,
    }
  );

  const [interesseInput, setInteresseInput] = useState("");

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCriteriaChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      criterios: { ...prev.criterios, [field]: value },
    }));
  };

  const addInteresse = () => {
    if (interesseInput.trim()) {
      const newInteresses = [...(formData.criterios.interesse || []), interesseInput.trim()];
      handleCriteriaChange("interesse", newInteresses);
      setInteresseInput("");
    }
  };

  const removeInteresse = (index) => {
    const newInteresses = formData.criterios.interesse.filter((_, i) => i !== index);
    handleCriteriaChange("interesse", newInteresses);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardTitle className="flex items-center gap-2">
          {segment ? "Editar Segmento" : "Criar Novo Segmento"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label>Nome do Segmento *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Ex: Clientes VIP"
                  required
                />
              </div>

              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) => handleChange("descricao", e.target.value)}
                  placeholder="Descreva o propósito deste segmento..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Cor do Segmento</Label>
                <Input
                  type="color"
                  value={formData.cor}
                  onChange={(e) => handleChange("cor", e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Segmento Ativo</Label>
                <Switch
                  checked={formData.ativo}
                  onCheckedChange={(checked) => handleChange("ativo", checked)}
                />
              </div>
            </div>

            {/* Criteria */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Critérios de Segmentação</h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Score Mínimo</Label>
                  <Input
                    type="number"
                    value={formData.criterios.score_min}
                    onChange={(e) =>
                      handleCriteriaChange("score_min", Number(e.target.value))
                    }
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label>Score Máximo</Label>
                  <Input
                    type="number"
                    value={formData.criterios.score_max}
                    onChange={(e) =>
                      handleCriteriaChange("score_max", Number(e.target.value))
                    }
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div>
                <Label>Interações Mínimas</Label>
                <Input
                  type="number"
                  value={formData.criterios.interacoes_min}
                  onChange={(e) =>
                    handleCriteriaChange("interacoes_min", Number(e.target.value))
                  }
                  min="0"
                />
              </div>

              <div>
                <Label>Valor Mínimo (R$)</Label>
                <Input
                  type="number"
                  value={formData.criterios.valor_min}
                  onChange={(e) =>
                    handleCriteriaChange("valor_min", Number(e.target.value))
                  }
                  min="0"
                />
              </div>

              <div>
                <Label>Dias Sem Contato</Label>
                <Input
                  type="number"
                  value={formData.criterios.dias_sem_contato}
                  onChange={(e) =>
                    handleCriteriaChange("dias_sem_contato", Number(e.target.value))
                  }
                  min="0"
                />
              </div>

              <div>
                <Label>Canal Preferido</Label>
                <Select
                  value={formData.criterios.canal_preferido}
                  onValueChange={(value) => handleCriteriaChange("canal_preferido", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um canal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Todos</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Telefone</SelectItem>
                    <SelectItem value="in_person">Presencial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Interesses</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={interesseInput}
                    onChange={(e) => setInteresseInput(e.target.value)}
                    placeholder="Ex: Produto A"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addInteresse();
                      }
                    }}
                  />
                  <Button type="button" onClick={addInteresse} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.criterios.interesse?.map((int, idx) => (
                    <Badge key={idx} variant="outline" className="gap-1">
                      {int}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeInteresse(idx)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isSubmitting ? "Salvando..." : segment ? "Atualizar" : "Criar Segmento"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
