// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Plus, List, CalendarDays } from "lucide-react";
import CRMAppointmentForm from "@/components/crm/CRMAppointmentForm";
import CRMAppointmentCalendar from "@/components/crm/CRMAppointmentCalendar";
import CRMAppointmentList from "@/components/crm/CRMAppointmentList";
import UpcomingAppointments from "@/components/crm/UpcomingAppointments";
import CRMSyncSettings from "@/components/crm/CRMSyncSettings";
import { toast } from "sonner";

export default function CRMAgenda() {
  const [showSettings, setShowSettings] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["crm-appointments"],
    queryFn: () => primeos.entities.CRMAppointment.list("-date"),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => primeos.entities.Customer.list(),
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: () => primeos.entities.Lead.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => primeos.entities.CRMAppointment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-appointments"] });
      setShowForm(false);
      setEditingAppointment(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.CRMAppointment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-appointments"] });
      setShowForm(false);
      setEditingAppointment(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => primeos.entities.CRMAppointment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-appointments"] });
    },
  });

  const handleSubmit = async (data) => {
    try {
      if (editingAppointment) {
        await updateMutation.mutateAsync({ id: editingAppointment.id, data });
        
        // Sync to Google Calendar
        const syncResult = await primeos.functions.invoke('syncCRMToGoogleCalendar', {
          appointment: { ...editingAppointment, ...data },
          action: 'update'
        });
        
        if (syncResult.data.success) {
          toast.success("Agendamento atualizado e sincronizado com Google Calendar!");
        }
      } else {
        const newAppointment = await createMutation.mutateAsync(data);
        
        // Sync to Google Calendar
        const syncResult = await primeos.functions.invoke('syncCRMToGoogleCalendar', {
          appointment: { ...data, id: newAppointment.id },
          action: 'create'
        });
        
        if (syncResult.data.success) {
          toast.success("Agendamento criado e sincronizado com Google Calendar!");
        }
      }
    } catch (error) {
      toast.error("Erro ao processar agendamento: " + error.message);
    }
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Tem certeza que deseja excluir este agendamento?")) {
      const appointment = appointments.find(a => a.id === id);
      
      // Delete from Google Calendar first if synced
      if (appointment?.google_calendar_event_id) {
        try {
          await primeos.functions.invoke('syncCRMToGoogleCalendar', {
            appointment,
            action: 'delete'
          });
        } catch (error) {
          console.error("Error deleting from Google Calendar:", error);
        }
      }
      
      deleteMutation.mutate(id);
      toast.success("Agendamento excluído!");
    }
  };

  const handleStatusChange = (id, status) => {
    const appointment = appointments.find((a) => a.id === id);
    if (appointment) {
      updateMutation.mutate({
        id,
        data: { ...appointment, status },
      });
    }
  };

  const todayAppointments = appointments.filter(
    (apt) => apt.date === new Date().toISOString().split("T")[0]
  ).length;

  const upcomingCount = appointments.filter(
    (apt) =>
      apt.status === "scheduled" &&
      new Date(apt.date) >= new Date() &&
      apt.date !== new Date().toISOString().split("T")[0]
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Agenda CRM</h1>
              <p className="text-slate-500 mt-1">
                Gerencie seus agendamentos com leads e clientes
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Configurações
              </Button>
              <Button
                onClick={() => {
                  setShowForm(true);
                  setEditingAppointment(null);
                }}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Novo Agendamento
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Hoje</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">
                    {todayAppointments}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Próximos</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">
                    {upcomingCount}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <CalendarDays className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {appointments.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                  <List className="w-6 h-6 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sync Settings */}
        {showSettings && (
          <div className="mb-6">
            <CRMSyncSettings />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form and Upcoming */}
          <div className="space-y-6">
            {showForm && (
              <CRMAppointmentForm
                appointment={editingAppointment}
                customers={customers}
                leads={leads}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingAppointment(null);
                }}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
              />
            )}

            <UpcomingAppointments
              appointments={appointments}
              onEdit={handleEdit}
              onStatusChange={handleStatusChange}
            />
          </div>

          {/* Right Column - Calendar and List */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Calendário de Agendamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="calendar">
                  <TabsList className="grid grid-cols-2 w-full mb-4">
                    <TabsTrigger value="calendar">
                      <Calendar className="w-4 h-4 mr-2" />
                      Calendário
                    </TabsTrigger>
                    <TabsTrigger value="list">
                      <List className="w-4 h-4 mr-2" />
                      Lista
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="calendar">
                    <CRMAppointmentCalendar
                      appointments={appointments}
                      selectedDate={selectedDate}
                      onDateSelect={setSelectedDate}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </TabsContent>

                  <TabsContent value="list">
                    <CRMAppointmentList
                      appointments={appointments}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onStatusChange={handleStatusChange}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
