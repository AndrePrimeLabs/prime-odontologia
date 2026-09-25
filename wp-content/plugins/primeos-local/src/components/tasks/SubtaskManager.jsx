// @ts-nocheck
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus } from "lucide-react";

export default function SubtaskManager({ subtarefas = [], onChange }) {
  const [newSubtask, setNewSubtask] = useState("");

  const handleAdd = () => {
    if (newSubtask.trim()) {
      const updatedSubtasks = [
        ...subtarefas,
        {
          id: Date.now().toString(),
          titulo: newSubtask,
          concluida: false,
        },
      ];
      onChange(updatedSubtasks);
      setNewSubtask("");
    }
  };

  const handleToggle = (id) => {
    const updatedSubtasks = subtarefas.map(st =>
      st.id === id ? { ...st, concluida: !st.concluida } : st
    );
    onChange(updatedSubtasks);
  };

  const handleDelete = (id) => {
    const updatedSubtasks = subtarefas.filter(st => st.id !== id);
    onChange(updatedSubtasks);
  };

  const completedCount = subtarefas.filter(st => st.concluida).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">Subtarefas</label>
        {subtarefas.length > 0 && (
          <span className="text-xs text-slate-500">
            {completedCount}/{subtarefas.length} concluídas
          </span>
        )}
      </div>

      <div className="space-y-2 bg-slate-50 rounded-lg p-3">
        {subtarefas.map(subtask => (
          <div key={subtask.id} className="flex items-center gap-2">
            <Checkbox
              checked={subtask.concluida}
              onCheckedChange={() => handleToggle(subtask.id)}
              id={`subtask-${subtask.id}`}
            />
            <label
              htmlFor={`subtask-${subtask.id}`}
              className={`flex-1 text-sm cursor-pointer ${
                subtask.concluida ? "line-through text-slate-400" : "text-slate-700"
              }`}
            >
              {subtask.titulo}
            </label>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(subtask.id)}
              className="h-6 w-6"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}

        <div className="flex gap-2">
          <Input
            placeholder="Nova subtarefa..."
            value={newSubtask}
            onChange={e => setNewSubtask(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            className="text-sm"
          />
          <Button
            onClick={handleAdd}
            variant="outline"
            size="sm"
            disabled={!newSubtask.trim()}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
