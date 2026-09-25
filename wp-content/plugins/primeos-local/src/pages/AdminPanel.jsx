// @ts-nocheck
import { useState, useEffect } from "react";
import { primeos } from "@/api/primeosClient";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Database, Activity, Settings, BarChart3, RefreshCw, SlidersHorizontal } from "lucide-react";
import AdminUsersTab from "@/components/admin/AdminUsersTab";
import AdminDataTab from "@/components/admin/AdminDataTab";
import AdminSystemTab from "@/components/admin/AdminSystemTab";
import AdminMetricsTab from "@/components/admin/AdminMetricsTab";
import AdminActivityLog from "@/components/admin/AdminActivityLog";
import AdminSettingsTab from "@/components/admin/AdminSettingsTab";

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    primeos.auth.me().then(u => {
      setUser(u);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );

  if (!user || user.role !== "admin") return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
        <Shield className="w-8 h-8 text-red-600" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900">Acesso Restrito</h1>
      <p className="text-slate-500">Esta página é exclusiva para administradores do sistema.</p>
      <Badge className="bg-red-100 text-red-700 text-sm px-3 py-1">Role: {user?.role || "não autenticado"}</Badge>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/50">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
                <p className="text-slate-400 text-sm">Controle total do sistema · Prime Odontologia OS</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1">
                ● Sistema Online
              </Badge>
              <Badge className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1">
                Admin: {user.full_name}
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="metrics">
          <TabsList className="bg-slate-800/50 border border-slate-700 mb-6 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="metrics" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 gap-2">
              <BarChart3 className="w-4 h-4" /> Métricas
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 gap-2">
              <Users className="w-4 h-4" /> Usuários
            </TabsTrigger>
            <TabsTrigger value="data" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 gap-2">
              <Database className="w-4 h-4" /> Dados
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 gap-2">
              <Activity className="w-4 h-4" /> Atividade
            </TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 gap-2">
              <Settings className="w-4 h-4" /> Sistema
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 gap-2">
              <SlidersHorizontal className="w-4 h-4" /> Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="metrics"><AdminMetricsTab /></TabsContent>
          <TabsContent value="users"><AdminUsersTab currentUser={user} /></TabsContent>
          <TabsContent value="data"><AdminDataTab /></TabsContent>
          <TabsContent value="activity"><AdminActivityLog /></TabsContent>
          <TabsContent value="system"><AdminSystemTab /></TabsContent>
          <TabsContent value="settings"><AdminSettingsTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
