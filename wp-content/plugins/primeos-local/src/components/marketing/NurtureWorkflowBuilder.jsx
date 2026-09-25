// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Plus, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";

export default function NurtureWorkflowBuilder({ onCreated }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "lead_nurture",
    trigger: { event_type: "lead_created", wait_days: 0 },
    steps: []
  });
  const [currentStep, setCurrentStep] = useState(null);

  const TRIGGER_TYPES = [
    { value: "lead_created", label: "Lead Criado" },
    { value: "email_opened", label: "Email Aberto" },
    { value: "link_clicked", label: "Link Clicado" },
    { value: "page_visited", label: "Página Visitada" },
    { value: "days_since_interaction", label: "X Dias Sem Interação" }
  ];

  const ACTION_TYPES = [
    { value: "send_email", label: "Enviar Email", icon: "📧" },
    { value: "send_sms", label: "Enviar SMS", icon: "📱" },
    { value: "send_notification", label: "Notificação Push", icon: "🔔" },
    { value: "create_task", label: "Criar Tarefa", icon: "✓" },
    { value: "delay", label: "Aguardar", icon: "⏰" }
  ];

  const addStep = () => {
    const newStep = {
      step_id: `step_${Date.now()}`,
      action_type: "send_email",
      delay_days: 1,
      content: ""
    };
    setFormData({
      ...formData,
      steps: [...formData.steps, newStep]
    });
    setCurrentStep(newStep.step_id);
  };

  const removeStep = (stepId) => {
    setFormData({
      ...formData,
      steps: formData.steps.filter(s => s.step_id !== stepId)
    });
  };

  const updateStep = (stepId, updates) => {
    setFormData({
      ...formData,
      steps: formData.steps.map(s => 
        s.step_id === stepId ? { ...s, ...updates } : s
      )
    });
  };

  const handleCreate = async () => {
    if (!formData.name || formData.steps.length === 0) {
      toast.error("Preencha o nome e adicione ao menos uma ação");
      return;
    }

    setLoading(true);
    try {
      const response = await primeos.functions.invoke('createNurtureWorkflow', {
        workflowData: formData
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setFormData({
          name: "",
          description: "",
          type: "lead_nurture",
          trigger: { event_type: "lead_created", wait_days: 0 },
          steps: []
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
          <Zap className="w-5 h-5 text-amber-600" />
          Construtor de Fluxo de Nutrição
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900">Informações Básicas</h3>
          <div>
            <Label className="text-xs">Nome do Fluxo *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Nutrição para Leads Frios"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">Descrição</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o objetivo deste fluxo"
              rows={2}
              className="mt-1 resize-none"
            />
          </div>

          <div>
            <Label className="text-xs">Tipo de Fluxo</Label>
            <Select value={formData.type} onValueChange={(value) => 
              setFormData({ ...formData, type: value })
            }>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lead_nurture">Nutrição de Leads</SelectItem>
                <SelectItem value="customer_engagement">Engajamento de Clientes</SelectItem>
                <SelectItem value="re_engagement">Reengajamento</SelectItem>
                <SelectItem value="upsell">Upsell</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Trigger */}
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-slate-900">Gatilho</h3>
          <Select value={formData.trigger.event_type} onValueChange={(value) =>
            setFormData({
              ...formData,
              trigger: { ...formData.trigger, event_type: value }
            })
          }>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRIGGER_TYPES.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {formData.trigger.event_type === "days_since_interaction" && (
            <Input
              type="number"
              value={formData.trigger.wait_days}
              onChange={(e) => setFormData({
                ...formData,
                trigger: { ...formData.trigger, wait_days: parseInt(e.target.value) }
              })}
              placeholder="Dias de inatividade"
              min="1"
            />
          )}
        </div>

        {/* Steps */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Sequência de Ações</h3>
            <Button size="sm" onClick={addStep} variant="outline" className="gap-2">
              <Plus className="w-3 h-3" />
              Adicionar Ação
            </Button>
          </div>

          {formData.steps.length > 0 ? (
            <div className="space-y-3">
              {formData.steps.map((step, idx) => (
                <div key={step.step_id} className="space-y-2">
                  {idx > 0 && <div className="flex justify-center">
                    <ArrowRight className="w-5 h-5 text-slate-400 rotate-90" />
                  </div>}
                  
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm font-medium text-slate-900">Ação {idx + 1}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeStep(step.step_id)}
                        className="h-6 text-red-600 hover:text-red-700"
                      >
                        ✕
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <Select value={step.action_type} onValueChange={(value) =>
                        updateStep(step.step_id, { action_type: value })
                      }>
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ACTION_TYPES.map(a => (
                            <SelectItem key={a.value} value={a.value}>
                              {a.icon} {a.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {(step.action_type === "delay") && (
                        <Input
                          type="number"
                          value={step.delay_days}
                          onChange={(e) => updateStep(step.step_id, { delay_days: parseInt(e.target.value) })}
                          placeholder="Dias"
                          min="1"
                          className="text-sm"
                        />
                      )}

                      {(step.action_type === "send_email" || step.action_type === "send_sms" || step.action_type === "send_notification") && (
                        <Textarea
                          value={step.content}
                          onChange={(e) => updateStep(step.step_id, { content: e.target.value })}
                          placeholder="Conteúdo da mensagem"
                          rows={2}
                          className="text-sm resize-none"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">Adicione ações ao fluxo</p>
          )}
        </div>

        <Button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-amber-600 hover:bg-amber-700 gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Criando...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Criar Fluxo de Nutrição
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
