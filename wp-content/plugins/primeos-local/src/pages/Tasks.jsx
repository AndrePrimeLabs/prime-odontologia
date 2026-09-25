// @ts-nocheck
import React, { useState, useEffect } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ListChecks,
  Repeat
} from "lucide-react";
import TaskCard from "../components/tasks/TaskCard";
import TaskForm from "../components/tasks/TaskForm";
import ExportButton from "../components/shared/ExportButton";
import { toast } from "sonner";
import InteractiveTour from "../components/onboarding/InteractiveTour";
import { tasksTour } from "../components/onboarding/tours";

export default function TasksPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showTour, setShowTour] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => setShowTour(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => primeos.entities.Task.list('-data_vencimento'),
  });

  const { data: pops = [] } = useQuery({
    queryKey: ['pops'],
    queryFn: () => primeos.entities.POP.list(),
  });

  const createTaskMutation = useMutation({
    mutationFn: (data) => primeos.entities.Task.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setDialogOpen(false);
      setEditingTask(null);
      toast.success("Tarefa criada com sucesso!");
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.Task.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setDialogOpen(false);
      setEditingTask(null);
      toast.success("Tarefa atualizada!");
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id) => primeos.entities.Task.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success("Tarefa excluída!");
    },
  });

  // Real-time updates
  useEffect(() => {
    const unsubscribe = primeos.entities.Task.subscribe((event) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    });
    return unsubscribe;
  }, [queryClient]);

  const handleSubmit = (data) => {
    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask.id, data });
    } else {
      createTaskMutation.mutate(data);
    }
  };

  const handleComplete = (task) => {
    updateTaskMutation.mutate({
      id: task.id,
      data: {
        ...task,
        status: 'concluida',
        progresso: 100,
        data_conclusao: new Date().toISOString()
      }
    });
  };

  const handleUpdateChecklist = (task, itemIndex, checked) => {
    const updatedChecklist = [...task.checklist];
    updatedChecklist[itemIndex] = { ...updatedChecklist[itemIndex], concluido: checked };
    const completedCount = updatedChecklist.filter(i => i.concluido).length;
    const progress = Math.round((completedCount / updatedChecklist.length) * 100);

    updateTaskMutation.mutate({
      id: task.id,
      data: {
        ...task,
        checklist: updatedChecklist,
        progresso: progress,
        status: progress === 100 ? 'concluida' : progress > 0 ? 'em_andamento' : 'pendente'
      }
    });
  };

  const filteredTasks = tasks.filter(task => {
    const searchLower = searchQuery.toLowerCase();
    return (
      task.titulo?.toLowerCase().includes(searchLower) ||
      task.responsavel?.toLowerCase().includes(searchLower) ||
      task.pop_codigo?.toLowerCase().includes(searchLower)
    );
  });

  const tasksByStatus = {
    pendente: filteredTasks.filter(t => t.status === 'pendente'),
    em_andamento: filteredTasks.filter(t => t.status === 'em_andamento'),
    concluida: filteredTasks.filter(t => t.status === 'concluida'),
    atrasada: filteredTasks.filter(t => 
      new Date(t.data_vencimento) < new Date() && 
      t.status !== 'concluida'
    ),
    recorrentes: filteredTasks.filter(t => t.recorrente)
  };

  const stats = [
    { 
      label: "Pendentes", 
      value: tasksByStatus.pendente.length, 
      icon: Clock, 
      color: "text-slate-600",
      bg: "bg-slate-100"
    },
    { 
      label: "Em Andamento", 
      value: tasksByStatus.em_andamento.length, 
      icon: ListChecks, 
      color: "text-blue-600",
      bg: "bg-blue-100"
    },
    { 
      label: "Concluídas", 
      value: tasksByStatus.concluida.length, 
      icon: CheckCircle2, 
      color: "text-green-600",
      bg: "bg-green-100"
    },
    { 
      label: "Atrasadas", 
      value: tasksByStatus.atrasada.length, 
      icon: AlertTriangle, 
      color: "text-red-600",
      bg: "bg-red-100"
    },
    { 
      label: "Recorrentes", 
      value: tasksByStatus.recorrentes.length, 
      icon: Repeat, 
      color: "text-indigo-600",
      bg: "bg-indigo-100"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gestão de Tarefas</h1>
            <p className="text-slate-600 mt-1">Acompanhe e gerencie tarefas baseadas nos POPs</p>
          </div>
          <div className="flex gap-2">
            <ExportButton data={filteredTasks} filename="tarefas" />
            <Button
              onClick={() => {
                setEditingTask(null);
                setDialogOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-tour="create-task"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Tarefa
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6" data-tour="task-stats">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", stat.bg)}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-600">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6" data-tour="task-filters">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Buscar tarefas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tasks Tabs */}
        <Tabs defaultValue="todas" className="space-y-4">
          <TabsList>
            <TabsTrigger value="todas">Todas ({filteredTasks.length})</TabsTrigger>
            <TabsTrigger value="pendente">Pendentes ({tasksByStatus.pendente.length})</TabsTrigger>
            <TabsTrigger value="em_andamento">Em Andamento ({tasksByStatus.em_andamento.length})</TabsTrigger>
            <TabsTrigger value="atrasada">Atrasadas ({tasksByStatus.atrasada.length})</TabsTrigger>
            <TabsTrigger value="recorrentes" data-tour="recurring-tasks">Recorrentes ({tasksByStatus.recorrentes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="todas" className="space-y-4">
            {filteredTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={(task) => {
                  setEditingTask(task);
                  setDialogOpen(true);
                }}
                onDelete={(task) => deleteTaskMutation.mutate(task.id)}
                onComplete={handleComplete}
                onUpdateChecklist={handleUpdateChecklist}
              />
            ))}
            {filteredTasks.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                Nenhuma tarefa encontrada
              </div>
            )}
          </TabsContent>

          <TabsContent value="pendente" className="space-y-4">
            {tasksByStatus.pendente.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={(task) => {
                  setEditingTask(task);
                  setDialogOpen(true);
                }}
                onDelete={(task) => deleteTaskMutation.mutate(task.id)}
                onComplete={handleComplete}
                onUpdateChecklist={handleUpdateChecklist}
              />
            ))}
            {tasksByStatus.pendente.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                Nenhuma tarefa pendente
              </div>
            )}
          </TabsContent>

          <TabsContent value="em_andamento" className="space-y-4">
            {tasksByStatus.em_andamento.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={(task) => {
                  setEditingTask(task);
                  setDialogOpen(true);
                }}
                onDelete={(task) => deleteTaskMutation.mutate(task.id)}
                onComplete={handleComplete}
                onUpdateChecklist={handleUpdateChecklist}
              />
            ))}
            {tasksByStatus.em_andamento.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                Nenhuma tarefa em andamento
              </div>
            )}
          </TabsContent>

          <TabsContent value="atrasada" className="space-y-4">
            {tasksByStatus.atrasada.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={(task) => {
                  setEditingTask(task);
                  setDialogOpen(true);
                }}
                onDelete={(task) => deleteTaskMutation.mutate(task.id)}
                onComplete={handleComplete}
                onUpdateChecklist={handleUpdateChecklist}
              />
            ))}
            {tasksByStatus.atrasada.length === 0 && (
              <div className="text-center py-12 text-green-500">
                Nenhuma tarefa atrasada!
              </div>
            )}
          </TabsContent>

          <TabsContent value="recorrentes" className="space-y-4">
            {tasksByStatus.recorrentes.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={(task) => {
                  setEditingTask(task);
                  setDialogOpen(true);
                }}
                onDelete={(task) => deleteTaskMutation.mutate(task.id)}
                onComplete={handleComplete}
                onUpdateChecklist={handleUpdateChecklist}
              />
            ))}
            {tasksByStatus.recorrentes.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                Nenhuma tarefa recorrente configurada
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <TaskForm
        task={editingTask}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSubmit}
      />

      {showTour && (
        <InteractiveTour
          tourId={tasksTour.id}
          steps={tasksTour.steps}
          onComplete={() => setShowTour(false)}
          autoStart={true}
        />
      )}
    </div>
  );
}