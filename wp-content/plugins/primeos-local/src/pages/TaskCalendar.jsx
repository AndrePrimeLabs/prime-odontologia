// @ts-nocheck
import React, { useState, useCallback } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, ListChecks } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { pt } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function TaskCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => primeos.entities.Task.list('-data_vencimento'),
  });

  const getTasksForDate = useCallback((date) => {
    return tasks.filter(task => {
      if (!task.data_vencimento) return false;
      return isSameDay(new Date(task.data_vencimento), date);
    });
  }, [tasks]);

  const getTasksForMonth = useCallback((date) => {
    return tasks.filter(task => {
      if (!task.data_vencimento) return false;
      return isSameMonth(new Date(task.data_vencimento), date);
    });
  }, [tasks]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const selectedDateTasks = getTasksForDate(selectedDate);
  const monthTasks = getTasksForMonth(currentMonth);

  const getTaskColor = (priority) => {
    const colors = {
      critica: "bg-red-100 text-red-800",
      alta: "bg-orange-100 text-orange-800",
      media: "bg-blue-100 text-blue-800",
      baixa: "bg-gray-100 text-gray-800",
    };
    return colors[priority] || colors.media;
  };

  const getStatusBadge = (status) => {
    const variants = {
      pendente: "bg-slate-100 text-slate-800",
      em_andamento: "bg-blue-100 text-blue-800",
      concluida: "bg-green-100 text-green-800",
      atrasada: "bg-red-100 text-red-800",
      cancelada: "bg-gray-100 text-gray-800",
    };
    return variants[status] || variants.pendente;
  };

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-8 h-8" />
              Calendário de Tarefas
            </h1>
            <p className="text-slate-600 mt-1">Visualize suas tarefas por data</p>
          </div>
          <div className="text-sm text-slate-600">
            Total: {monthTasks.length} tarefas em {format(currentMonth, "MMMM", { locale: pt })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  {format(currentMonth, "MMMM yyyy", { locale: pt })}
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentMonth(new Date())}
                    className="text-sm"
                  >
                    Hoje
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Week Days */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {weekDays.map(day => (
                  <div key={day} className="text-center font-semibold text-slate-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {daysInMonth.map(day => {
                  const dayTasks = getTasksForDate(day);
                  const isToday = isSameDay(day, new Date());
                  const isSelected = isSameDay(day, selectedDate);
                  const isCurrent = isSameMonth(day, currentMonth);

                  return (
                    <button
                      key={day.toString()}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        "min-h-24 p-2 rounded-lg border-2 transition-all",
                        isSelected ? "border-indigo-600 bg-indigo-50" : "border-slate-200 hover:border-slate-300",
                        isToday && !isSelected && "bg-blue-50 border-blue-300",
                        !isCurrent && "opacity-50 bg-slate-50"
                      )}
                    >
                      <div className={cn("font-bold text-sm mb-1", !isCurrent && "text-slate-400")}>
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayTasks.slice(0, 2).map(task => (
                          <div
                            key={task.id}
                            className={cn(
                              "text-xs px-1 py-0.5 rounded truncate font-medium",
                              getTaskColor(task.prioridade)
                            )}
                          >
                            {task.titulo}
                          </div>
                        ))}
                        {dayTasks.length > 2 && (
                          <div className="text-xs text-slate-500 px-1">
                            +{dayTasks.length - 2} mais
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Selected Date Tasks */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {format(selectedDate, "EEEE, d 'de' MMMM", { locale: pt })}
            </h3>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {selectedDateTasks.length > 0 ? (
                selectedDateTasks.map(task => (
                  <div
                    key={task.id}
                    className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-medium text-slate-900 text-sm flex-1">{task.titulo}</h4>
                      <Badge className={cn("text-xs", getTaskColor(task.prioridade))}>
                        {task.prioridade}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <Badge className={cn("text-xs", getStatusBadge(task.status))}>
                        {task.status}
                      </Badge>
                      {task.recorrente && (
                        <Badge variant="outline" className="text-xs">
                          Recorrente
                        </Badge>
                      )}
                    </div>

                    {task.responsaveis?.length > 0 && (
                      <p className="text-xs text-slate-600">
                        Responsável: {task.responsaveis.join(", ")}
                      </p>
                    )}

                    {task.progresso > 0 && (
                      <div className="mt-2">
                        <div className="w-full bg-slate-200 rounded-full h-1">
                          <div
                            className="bg-indigo-600 h-1 rounded-full transition-all"
                            style={{ width: `${task.progresso}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{task.progresso}% concluído</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <ListChecks className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma tarefa neste dia</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}