// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, X } from "lucide-react";
import { primeos } from "@/api/primeosClient";
import { useQuery } from "@tanstack/react-query";
import SubtaskManager from "./SubtaskManager";
import RecurringTaskTemplate from "./RecurringTaskTemplate";
import MultiUserAssignment from "./MultiUserAssignment";

export default function TaskForm({ task, open, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    pop_id: "",
    pop_codigo: "",
    responsaveis: [],
    categoria: "operacional",
    prioridade: "media",
    data_vencimento: "",
    recorrente: false,
    frequencia_recorrencia: "",
    subtarefas: [],
    checklist: []
  });

  const [newChecklistItem, setNewChecklistItem] = useState("");

  const { data: pops = [] } = useQuery({
    queryKey: ['pops'],
    queryFn: () => primeos.entities.POP.list(),
  });

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        data_vencimento: task.data_vencimento?.slice(0, 16) || ""
      });
    } else {
      setFormData({
        titulo: "",
        descricao: "",
        pop_id: "",
        pop_codigo: "",
        responsaveis: [],
        categoria: "operacional",
        prioridade: "media",
        data_vencimento: "",
        recorrente: false,
        frequencia_recorrencia: "",
        subtarefas: [],
        checklist: []
      });
    }
  }, [task, open]);

  const handlePopChange = (popId) => {
    const selectedPop = pops.find(p => p.id === popId);
    if (selectedPop) {
      setFormData({
        ...formData,
        pop_id: popId,
        pop_codigo: selectedPop.codigo,
        titulo: selectedPop.nome,
        descricao: selectedPop.objetivo,
        responsavel: selectedPop.responsavel,
        categoria: selectedPop.categoria,
        frequencia_recorrencia: selectedPop.frequencia,
        recorrente: selectedPop.frequencia !== "sob_demanda",
        checklist: selectedPop.checklist?.map(item => ({ item, concluido: false })) || []
      });
    }
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setFormData({
        ...formData,
        checklist: [...(formData.checklist || []), { item: newChecklistItem, concluido: false }]
      });
      setNewChecklistItem("");
    }
  };

  const removeChecklistItem = (index) => {
    setFormData({
      ...formData,
      checklist: formData.checklist.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      progresso: formData.checklist?.length > 0 
        ? Math.round((formData.checklist.filter(i => i.concluido).length / formData.checklist.length) * 100)
        : 0
    };
    onSubmit(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Baseado em POP (Opcional)</Label>
            <Select value={formData.pop_id} onValueChange={handlePopChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um POP" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_custom">Tarefa personalizada</SelectItem>
                {pops.map(pop => (
                  <SelectItem key={pop.id} value={pop.id}>
                    {pop.codigo} - {pop.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Título *</Label>
            <Input
              value={formData.titulo}
              onChange={(e) => setFormData({...formData, titulo: e.target.value})}
              required
            />
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea
              value={formData.descricao}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <MultiUserAssignment
                responsaveis={formData.responsaveis}
                onChange={(responsaveis) => setFormData({...formData, responsaveis})}
              />
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={formData.categoria} onValueChange={(value) => setFormData({...formData, categoria: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operacional">Operacional</SelectItem>
                  <SelectItem value="clinico">Clínico</SelectItem>
                  <SelectItem value="administrativo">Administrativo</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="qualidade">Qualidade</SelectItem>
                  <SelectItem value="gestao">Gestão</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Prioridade</Label>
              <Select value={formData.prioridade} onValueChange={(value) => setFormData({...formData, prioridade: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="critica">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data de Vencimento *</Label>
              <Input
                type="datetime-local"
                value={formData.data_vencimento}
                onChange={(e) => setFormData({...formData, data_vencimento: e.target.value})}
                required
              />
            </div>
          </div>

          <RecurringTaskTemplate 
            task={formData}
            onChange={setFormData}
          />

          <SubtaskManager
            subtarefas={formData.subtarefas}
            onChange={(subtarefas) => setFormData({...formData, subtarefas})}
          />

          <div className="border rounded-lg p-4 space-y-3">
            <Label>Checklist</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Adicionar item..."
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())}
              />
              <Button type="button" onClick={addChecklistItem} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {formData.checklist?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-50 p-2 rounded">
                  <span className="text-sm">{item.item}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeChecklistItem(idx)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea
              value={formData.observacoes || ""}
              onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
              {task ? "Atualizar" : "Criar"} Tarefa
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
