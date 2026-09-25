// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Plus, Apple, Globe, Star, Download, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Apps() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    app_name: "", platform: "both", category: "productivity",
    description: "", price: 0, status: "development"
  });

  const queryClient = useQueryClient();

  const { data: apps = [] } = useQuery({
    queryKey: ["mobileApps"],
    queryFn: () => primeos.entities.MobileApp.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => primeos.entities.MobileApp.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mobileApps"] });
      setShowForm(false);
      setFormData({ app_name: "", platform: "both", category: "productivity", description: "", price: 0, status: "development" });
      toast.success("App criado!");
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Smartphone className="w-8 h-8 text-indigo-600" />
              Meus Apps
            </h1>
            <p className="text-slate-500 mt-1">Gerencie seus aplicativos móveis</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
            <Plus className="w-4 h-4" />
            Novo App
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <Card key={app.id} className="border-0 shadow-sm hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                  {app.icon_url ? (
                    <img src={app.icon_url} alt={app.app_name} className="w-16 h-16 rounded-2xl object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                      {app.app_name?.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{app.app_name}</CardTitle>
                    <p className="text-xs text-slate-500 truncate">{app.bundle_id || app.category}</p>
                    <div className="flex gap-1 mt-2">
                      {(app.platform === 'ios' || app.platform === 'both') && (
                        <Badge variant="outline" className="bg-slate-900 text-white border-slate-900">
                          <Apple className="w-3 h-3 mr-1" />iOS
                        </Badge>
                      )}
                      {(app.platform === 'android' || app.platform === 'both') && (
                        <Badge variant="outline" className="bg-green-600 text-white border-green-600">
                          <Globe className="w-3 h-3 mr-1" />Android
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="w-4 h-4 text-amber-500" />
                      <p className="font-bold text-lg">
                        {((app.rating_ios || 0) + (app.rating_android || 0)) / 2 || 0}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500">Rating</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Download className="w-4 h-4 text-green-600" />
                      <p className="font-bold text-lg">
                        {(((app.downloads_ios || 0) + (app.downloads_android || 0)) / 1000).toFixed(0)}k
                      </p>
                    </div>
                    <p className="text-xs text-slate-500">Downloads</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <p className="font-bold text-lg">
                        {((app.revenue_total || 0) / 1000).toFixed(0)}k
                      </p>
                    </div>
                    <p className="text-xs text-slate-500">Revenue</p>
                  </div>
                </div>

                <Badge className={cn(
                  "w-full justify-center",
                  app.status === 'published' ? 'bg-green-100 text-green-700' :
                  app.status === 'review' ? 'bg-yellow-100 text-yellow-700' :
                  app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-slate-100 text-slate-700'
                )}>
                  {app.status}
                </Badge>

                {app.price > 0 && (
                  <div className="mt-3 text-center">
                    <p className="text-2xl font-bold text-indigo-600">${app.price}</p>
                    {app.has_iap && <p className="text-xs text-slate-500">+ In-App Purchases</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo App</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome do App</Label>
                <Input value={formData.app_name} onChange={(e) => setFormData({...formData, app_name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Plataforma</Label>
                  <Select value={formData.platform} onValueChange={(v) => setFormData({...formData, platform: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ios">iOS</SelectItem>
                      <SelectItem value="android">Android</SelectItem>
                      <SelectItem value="both">Ambos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="games">Games</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="productivity">Produtividade</SelectItem>
                      <SelectItem value="education">Educação</SelectItem>
                      <SelectItem value="business">Negócios</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} />
              </div>
              <Button onClick={() => createMutation.mutate(formData)} disabled={!formData.app_name || createMutation.isPending} className="w-full bg-indigo-600 hover:bg-indigo-700">
                Criar App
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
