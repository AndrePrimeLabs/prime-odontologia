// @ts-nocheck
import { useState, useEffect } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, MessageSquare, Loader2 } from "lucide-react";
import PortalAppointments from "@/components/portal/PortalAppointments";
import PortalInteractions from "@/components/portal/PortalInteractions";
import PortalProfile from "@/components/portal/PortalProfile";

export default function ClientPortal() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await primeos.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const { data: customer } = useQuery({
    queryKey: ["portal-customer", user?.email],
    queryFn: async () => {
      const customers = await primeos.entities.Customer.filter({ email: user.email });
      return customers[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["portal-appointments", customer?.id],
    queryFn: () => primeos.entities.Appointment.filter({ 
      patient_id: customer.id 
    }),
    enabled: !!customer?.id
  });

  const { data: interactions = [] } = useQuery({
    queryKey: ["portal-interactions", customer?.id],
    queryFn: () => primeos.entities.Interaction.filter({ 
      customer_id: customer.id 
    }),
    enabled: !!customer?.id
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Perfil não encontrado
              </h2>
              <p className="text-slate-600">
                Seu perfil ainda não foi cadastrado no sistema. Entre em contato conosco para mais informações.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
              {customer.name?.charAt(0) || "?"}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Bem-vindo, {customer.name}
              </h1>
              <p className="text-slate-500">Seu portal do cliente</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {appointments.length}
                  </p>
                  <p className="text-xs text-slate-500">Agendamentos</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-50">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {interactions.length}
                  </p>
                  <p className="text-xs text-slate-500">Interações</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50">
                  <User className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <Badge className={
                    customer.status === 'active' 
                      ? "bg-green-100 text-green-700" 
                      : "bg-slate-100 text-slate-700"
                  }>
                    {customer.status}
                  </Badge>
                  <p className="text-xs text-slate-500">Status</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appointments">
              <Calendar className="w-4 h-4 mr-2" />
              Agendamentos
            </TabsTrigger>
            <TabsTrigger value="interactions">
              <MessageSquare className="w-4 h-4 mr-2" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Meu Perfil
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments">
            <PortalAppointments appointments={appointments} />
          </TabsContent>

          <TabsContent value="interactions">
            <PortalInteractions interactions={interactions} />
          </TabsContent>

          <TabsContent value="profile">
            <PortalProfile customer={customer} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
