// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Megaphone, Plus, Loader2, Target, DollarSign, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const statusColors = {
  planejamento: "bg-slate-100 text-slate-700",
  ativa: "bg-emerald-100 text-emerald-700",
  pausada: "bg-amber-100 text-amber-700",
  encerrada: "bg-blue-100 text-blue-700"
};

const ofertas = ["invisalign", "ortodontia", "limpeza", "clareamento", "implante", "protese", "estetica", "checkup"];

export default function Campanhas() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => primeos.entities.Campaign.list("-created_date")
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: () => primeos.entities.Lead.list()
  });

  const { data: channels = [] } = useQuery({
    queryKey: ["marketingChannels"],
    queryFn: () => primeos.entities.MarketingChannel.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => primeos.entities.Campaign.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      setShowForm(false);
      toast.success("Campanha criada!");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.Campaign.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["campaigns"] })
  });

  const [form, setForm] = useState({
    name: "", oferta: "invisalign", canal_principal_id: "",
    whatsapp_flow: "", landing_page: "", status: "planejamento",
    orcamento: 0, data_inicio: "", data_fim: "",
    meta_leads: 0, meta_conversao: 0
  });

  const getCampaignLeads = (campaignId) => leads.filter(l => l.campanha_id === campaignId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Megaphone className="w-8 h-8 text-orange-600" />
              Campanhas & Funis
            </h1>
            <p className="text-slate-500 mt-1">Marketing → Vendas</p>
          </div>
          <Button onClick={() => { setForm({ name: "", oferta: "invisalign", canal_principal_id: "", whatsapp_flow: "", landing_page: "", status: "planejamento", orcamento: 0, data_inicio: "", data_fim: "", meta_leads: 0, meta_conversao: 0 }); setShowForm(true); }} className="bg-orange-600 hover:bg-orange-700">
            <Plus className="w-4 h-4 mr-2" />Nova Campanha
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Campanhas Ativas", value: campaigns.filter(c => c.status === "ativa").length, color: "text-emerald-600" },
            { label: "Orçamento Total", value: `R$ ${campaigns.reduce((s, c) => s + (c.orcamento || 0), 0).toLocaleString()}`, color: "text-blue-600" },
            { label: "Leads Gerados", value: leads.length, color: "text-purple-600" },
            { label: "Taxa Conversão", value: `${leads.length > 0 ? ((leads.filter(l => l.status === "fechado").length / leads.length) * 100).toFixed(1) : 0}%`, color: "text-orange-600" }
          ].map((stat, idx) => (
            <Card key={idx} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">{stat.label}</p>
                <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Campaigns Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign) => {
            const campaignLeads = getCampaignLeads(campaign.id);
            const fechados = campaignLeads.filter(l => l.status === "fechado").length;
            const progress = campaign.meta_leads > 0 ? (campaignLeads.length / campaign.meta_leads) * 100 : 0;
            const channel = channels.find(c => c.id === campaign.canal_principal_id);

            return (
              <motion.div key={campaign.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-0 shadow-sm hover:shadow-md transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge className={statusColors[campaign.status]}>{campaign.status}</Badge>
                        <CardTitle className="mt-2">{campaign.name}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4 text-orange-500" />
                        <span>{campaign.oferta}</span>
                      </div>
                      {channel && (
                        <Badge variant="outline">{channel.plataforma}</Badge>
                      )}
                    </div>

                    {campaign.orcamento > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span>R$ {campaign.orcamento.toLocaleString()}</span>
                      </div>
                    )}

                    {campaign.data_inicio && (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="w-4 h-4" />
                        <span>{campaign.data_inicio} → {campaign.data_fim || "..."}</span>
                      </div>
                    )}

                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-500">Leads: {campaignLeads.length}/{campaign.meta_leads || "∞"}</span>
                        <span className="text-xs text-emerald-600">{fechados} convertidos</span>
                      </div>
                      <Progress value={Math.min(progress, 100)} className="h-2" />
                    </div>

                    <div className="flex gap-2">
                      {campaign.status === "planejamento" && (
                        <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ id: campaign.id, data: { ...campaign, status: "ativa" } })}>
                          Ativar
                        </Button>
                      )}
                      {campaign.status === "ativa" && (
                        <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ id: campaign.id, data: { ...campaign, status: "pausada" } })}>
                          Pausar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {campaigns.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <Megaphone className="w-16 h-16 mx-auto mb-4" />
            <p>Nenhuma campanha criada</p>
          </div>
        )}

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Nova Campanha</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div><Label>Nome da Campanha</Label><Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Ex: Invisalign Verão 2024" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Oferta</Label>
                  <Select value={form.oferta} onValueChange={(v) => setForm({...form, oferta: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ofertas.map(o => <SelectItem key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Canal Principal</Label>
                  <Select value={form.canal_principal_id} onValueChange={(v) => setForm({...form, canal_principal_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {channels.map(c => <SelectItem key={c.id} value={c.id}>{c.name} ({c.plataforma})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Orçamento (R$)</Label><Input type="number" value={form.orcamento} onChange={(e) => setForm({...form, orcamento: parseFloat(e.target.value) || 0})} /></div>
                <div><Label>Meta Leads</Label><Input type="number" value={form.meta_leads} onChange={(e) => setForm({...form, meta_leads: parseInt(e.target.value) || 0})} /></div>
                <div><Label>Meta Conversão</Label><Input type="number" value={form.meta_conversao} onChange={(e) => setForm({...form, meta_conversao: parseInt(e.target.value) || 0})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Data Início</Label><Input type="date" value={form.data_inicio} onChange={(e) => setForm({...form, data_inicio: e.target.value})} /></div>
                <div><Label>Data Fim</Label><Input type="date" value={form.data_fim} onChange={(e) => setForm({...form, data_fim: e.target.value})} /></div>
              </div>
              <div><Label>Landing Page</Label><Input value={form.landing_page} onChange={(e) => setForm({...form, landing_page: e.target.value})} placeholder="https://..." /></div>
              <div><Label>WhatsApp Flow</Label><Textarea value={form.whatsapp_flow} onChange={(e) => setForm({...form, whatsapp_flow: e.target.value})} rows={3} placeholder="Fluxo de mensagens para leads..." /></div>
              <Button onClick={() => createMutation.mutate(form)} disabled={!form.name || createMutation.isPending} className="w-full bg-orange-600 hover:bg-orange-700">
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Criar Campanha
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
