// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Mail, Play, Pause, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

export default function EmailAutomation() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingSequence, setEditingSequence] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    target_segment: "",
    status: "draft",
    trigger_event: "manual",
    emails: [{ subject: "", body: "", delay_days: 0, order: 1 }],
  });

  const { data: sequences = [] } = useQuery({
    queryKey: ["email-sequences"],
    queryFn: () => primeos.entities.EmailSequence.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => primeos.entities.EmailSequence.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-sequences"] });
      setShowForm(false);
      resetForm();
      toast.success("Sequência criada!");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.EmailSequence.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-sequences"] });
      setShowForm(false);
      resetForm();
      toast.success("Sequência atualizada!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => primeos.entities.EmailSequence.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-sequences"] });
      toast.success("Sequência excluída!");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      target_segment: "",
      status: "draft",
      trigger_event: "manual",
      emails: [{ subject: "", body: "", delay_days: 0, order: 1 }],
    });
    setEditingSequence(null);
  };

  const handleEdit = (sequence) => {
    setEditingSequence(sequence);
    setFormData(sequence);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingSequence) {
      updateMutation.mutate({ id: editingSequence.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const addEmail = () => {
    setFormData({
      ...formData,
      emails: [
        ...formData.emails,
        { subject: "", body: "", delay_days: 1, order: formData.emails.length + 1 },
      ],
    });
  };

  const removeEmail = (index) => {
    const newEmails = formData.emails.filter((_, i) => i !== index);
    setFormData({ ...formData, emails: newEmails });
  };

  const updateEmail = (index, field, value) => {
    const newEmails = [...formData.emails];
    newEmails[index][field] = value;
    setFormData({ ...formData, emails: newEmails });
  };

  const toggleStatus = (sequence) => {
    const newStatus = sequence.status === "active" ? "paused" : "active";
    updateMutation.mutate({
      id: sequence.id,
      data: { ...sequence, status: newStatus },
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "paused":
        return "bg-yellow-100 text-yellow-700";
      case "draft":
        return "bg-slate-100 text-slate-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Automação de Email</h1>
              <p className="text-slate-500 mt-1">
                Crie sequências automáticas de emails para leads
              </p>
            </div>
            <Button
              onClick={() => {
                setShowForm(true);
                resetForm();
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nova Sequência
            </Button>
          </div>
        </motion.div>

        {showForm && (
          <Card className="mb-8 border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle>
                {editingSequence ? "Editar Sequência" : "Nova Sequência"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome da Sequência *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Segmento Alvo</Label>
                    <Input
                      value={formData.target_segment}
                      onChange={(e) =>
                        setFormData({ ...formData, target_segment: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Gatilho</Label>
                    <Select
                      value={formData.trigger_event}
                      onValueChange={(value) =>
                        setFormData({ ...formData, trigger_event: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lead_created">Novo Lead</SelectItem>
                        <SelectItem value="status_change">Mudança de Status</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Rascunho</SelectItem>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="paused">Pausado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">Emails da Sequência</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addEmail}>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Email
                    </Button>
                  </div>

                  {formData.emails.map((email, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="font-semibold">Email {index + 1}</Label>
                          {formData.emails.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEmail(index)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                        <div>
                          <Label>Dias de Atraso</Label>
                          <Input
                            type="number"
                            value={email.delay_days}
                            onChange={(e) =>
                              updateEmail(index, "delay_days", parseInt(e.target.value))
                            }
                            min="0"
                          />
                        </div>
                        <div>
                          <Label>Assunto</Label>
                          <Input
                            value={email.subject}
                            onChange={(e) => updateEmail(index, "subject", e.target.value)}
                            placeholder="Assunto do email"
                          />
                        </div>
                        <div>
                          <Label>Corpo do Email</Label>
                          <Textarea
                            value={email.body}
                            onChange={(e) => updateEmail(index, "body", e.target.value)}
                            rows={4}
                            placeholder="Conteúdo do email..."
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Salvar Sequência
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Sequences List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sequences.map((sequence) => (
            <Card key={sequence.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{sequence.name}</CardTitle>
                    <Badge className={getStatusColor(sequence.status)}>
                      {sequence.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleStatus(sequence)}
                    >
                      {sequence.status === "active" ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sequence.description && (
                    <p className="text-sm text-slate-600">{sequence.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Mail className="w-4 h-4" />
                    <span>{sequence.emails?.length || 0} emails</span>
                  </div>
                  {sequence.target_segment && (
                    <p className="text-sm text-slate-500">
                      Segmento: {sequence.target_segment}
                    </p>
                  )}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t text-center">
                    <div>
                      <p className="text-xs text-slate-500">Enviados</p>
                      <p className="text-lg font-semibold">{sequence.total_sent || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Abertos</p>
                      <p className="text-lg font-semibold">{sequence.total_opened || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Cliques</p>
                      <p className="text-lg font-semibold">{sequence.total_clicked || 0}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(sequence)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm("Excluir esta sequência?")) {
                          deleteMutation.mutate(sequence.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
