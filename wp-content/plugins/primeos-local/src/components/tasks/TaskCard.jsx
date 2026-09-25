// @ts-nocheck
import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  AlertCircle, 
  Calendar,
  User,
  MoreVertical,
  Repeat
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TaskCard({ task, onEdit, onDelete, onComplete, onUpdateChecklist }) {
  const statusColors = {
    pendente: "bg-slate-100 text-slate-700",
    em_andamento: "bg-blue-100 text-blue-700",
    concluida: "bg-green-100 text-green-700",
    atrasada: "bg-red-100 text-red-700",
    cancelada: "bg-gray-100 text-gray-500"
  };

  const priorityColors = {
    baixa: "bg-blue-50 text-blue-600 border-blue-200",
    media: "bg-yellow-50 text-yellow-600 border-yellow-200",
    alta: "bg-orange-50 text-orange-600 border-orange-200",
    critica: "bg-red-50 text-red-600 border-red-200"
  };

  const isOverdue = new Date(task.data_vencimento) < new Date() && task.status !== 'concluida';
  const completedItems = task.checklist?.filter(item => item.concluido).length || 0;
  const totalItems = task.checklist?.length || 0;

  return (
    <Card className={cn(
      "hover:shadow-lg transition-all duration-200",
      task.status === 'concluida' && "opacity-70"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{task.titulo}</h3>
              {task.recorrente && (
                <Repeat className="w-4 h-4 text-indigo-600" />
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={statusColors[task.status]}>
                {task.status.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className={priorityColors[task.prioridade]}>
                {task.prioridade}
              </Badge>
              {task.pop_codigo && (
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700">
                  {task.pop_codigo}
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onEdit(task)}>
                Editar
              </DropdownMenuItem>
              {task.status !== 'concluida' && (
                <DropdownMenuItem onClick={() => onComplete(task)}>
                  Marcar como concluída
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDelete(task)} className="text-red-600">
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {task.descricao && (
          <p className="text-sm text-slate-600 mb-3">{task.descricao}</p>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{task.responsavel}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(task.data_vencimento), "dd/MMM/yyyy HH:mm", { locale: ptBR })}</span>
            {isOverdue && <AlertCircle className="w-4 h-4 text-red-500 ml-1" />}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {task.checklist && task.checklist.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Checklist</span>
              <span className="text-xs text-slate-500">{completedItems}/{totalItems}</span>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {task.checklist.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Checkbox
                    checked={item.concluido}
                    onCheckedChange={(checked) => onUpdateChecklist(task, idx, checked)}
                    disabled={task.status === 'concluida'}
                  />
                  <span className={cn(
                    "text-sm",
                    item.concluido && "line-through text-slate-400"
                  )}>
                    {item.item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Progresso</span>
            <span className="font-medium">{task.progresso}%</span>
          </div>
          <Progress value={task.progresso} className="h-2" />
        </div>

        {task.recorrente && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-indigo-700">
              <Repeat className="w-4 h-4" />
              <span>Recorrência: {task.frequencia_recorrencia}</span>
            </div>
            {task.proxima_ocorrencia && (
              <p className="text-xs text-indigo-600 mt-1">
                Próxima: {format(new Date(task.proxima_ocorrencia), "dd/MMM/yyyy HH:mm", { locale: ptBR })}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
