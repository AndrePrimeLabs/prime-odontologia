// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Shield, User, Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function AdminUsersTab({ currentUser }) {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => primeos.entities.User.list()
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }) => primeos.entities.User.update(id, { role }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("Role atualizado!"); },
    onError: () => toast.error("Erro ao atualizar role")
  });

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const roleColors = {
    admin: "bg-red-500/20 text-red-400 border-red-500/30",
    user: "bg-slate-500/20 text-slate-300 border-slate-500/30"
  };

  return (
    <div className="space-y-6">
      {/* User List */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-white text-sm flex items-center gap-2"><Users className="w-4 h-4" /> Usuários ({users.length})</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="pl-9 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 w-48" />
              </div>
              <Button variant="outline" size="icon" onClick={() => refetch()} className="border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><RefreshCw className="w-6 h-6 animate-spin text-indigo-400" /></div>
          ) : (
            <div className="space-y-2">
              {filtered.map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-300 font-semibold text-sm">
                      {u.full_name?.charAt(0) || u.email?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{u.full_name || "Sem nome"}</p>
                      <p className="text-slate-400 text-xs">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs border ${roleColors[u.role] || roleColors.user}`}>
                      {u.role === "admin" ? <Shield className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                      {u.role || "user"}
                    </Badge>
                    {u.id !== currentUser?.id && (
                      <Select value={u.role || "user"} onValueChange={role => updateRoleMutation.mutate({ id: u.id, role })}>
                        <SelectTrigger className="w-28 h-7 text-xs bg-slate-600 border-slate-500 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Usuário</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <p className="text-center text-slate-500 py-6">Nenhum usuário encontrado</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
