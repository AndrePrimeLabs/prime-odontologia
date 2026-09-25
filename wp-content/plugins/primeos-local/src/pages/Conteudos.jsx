// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Plus, Loader2, ArrowRight, Instagram, Youtube, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

const tipoIcons = {
  reel: Instagram, story: Instagram, carrossel: Instagram,
  youtube: Youtube, tiktok: Instagram, blog: FileText,
  email: Mail, pinterest: Instagram
};

const tipoColors = {
  reel: "bg-pink-100 text-pink-700",
  story: "bg-purple-100 text-purple-700",
  carrossel: "bg-indigo-100 text-indigo-700",
  youtube: "bg-red-100 text-red-700",
  tiktok: "bg-slate-100 text-slate-700",
  blog: "bg-emerald-100 text-emerald-700",
  email: "bg-blue-100 text-blue-700",
  pinterest: "bg-rose-100 text-rose-700"
};

const statusColors = {
  ideia: "bg-slate-100 text-slate-600",
  producao: "bg-amber-100 text-amber-700",
  revisao: "bg-blue-100 text-blue-700",
  publicado: "bg-emerald-100 text-emerald-700"
};

const funilColors = {
  topo: "border-l-blue-500",
  meio: "border-l-amber-500",
  fundo: "border-l-emerald-500"
};

export default function Conteudos() {
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const queryClient = useQueryClient();

  const { data: contents = [] } = useQuery({
    queryKey: ["contents"],
    queryFn: () => primeos.entities.Content.list("-created_date")
  });

  const { data: strategies = [] } = useQuery({
    queryKey: ["marketingStrategies"],
    queryFn: () => primeos.entities.MarketingStrategy.list()
  });

  const { data: channels = [] } = useQuery({
    queryKey: ["marketingChannels"],
    queryFn: () => primeos.entities.MarketingChannel.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => primeos.entities.Content.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contents"] });
      setShowForm(false);
      toast.success("Conteúdo criado!");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.Content.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contents"] })
  });

  const [form, setForm] = useState({
    titulo: "", tipo: "reel", canal_id: "", estrategia_id: "",
    funil: "topo", objetivo: "autoridade", cta: "",
    status: "ideia", data_publicacao: "", link_final: "",
    script: "", hashtags: ""
  });

  const filteredContents = filterStatus === "all" ? contents : contents.filter(c => c.status === filterStatus);

  const contentsByStatus = {
    ideia: contents.filter(c => c.status === "ideia"),
    producao: contents.filter(c => c.status === "producao"),
    revisao: contents.filter(c => c.status === "revisao"),
    publicado: contents.filter(c => c.status === "publicado")
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-pink-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <FileText className="w-8 h-8 text-pink-600" />
              Content Hub
            </h1>
            <p className="text-slate-500 mt-1">Planejamento editorial + SEO + GEO</p>
          </div>
          <Button onClick={() => { setForm({ titulo: "", tipo: "reel", canal_id: "", estrategia_id: "", funil: "topo", objetivo: "autoridade", cta: "", status: "ideia", data_publicacao: "", link_final: "", script: "", hashtags: "" }); setShowForm(true); }} className="bg-pink-600 hover:bg-pink-700">
            <Plus className="w-4 h-4 mr-2" />Novo Conteúdo
          </Button>
        </motion.div>

        {/* Kanban View */}
        <div className="grid grid-cols-4 gap-4 mb-6 overflow-x-auto">
          {["ideia", "producao", "revisao", "publicado"].map((status) => (
            <div key={status} className="min-w-[250px]">
              <div className={cn("p-3 rounded-t-xl text-center font-medium", statusColors[status])}>
                {status.charAt(0).toUpperCase() + status.slice(1)} ({contentsByStatus[status].length})
              </div>
              <ScrollArea className="h-[500px] bg-slate-50 rounded-b-xl p-2">
                <div className="space-y-2">
                  {contentsByStatus[status].map((content) => {
                    const Icon = tipoIcons[content.tipo] || FileText;
                    return (
                      <motion.div key={content.id} whileHover={{ scale: 1.02 }} className={cn("bg-white p-3 rounded-lg shadow-sm border-l-4 cursor-pointer", funilColors[content.funil])}>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={cn("text-xs", tipoColors[content.tipo])}><Icon className="w-3 h-3 mr-1" />{content.tipo}</Badge>
                        </div>
                        <p className="font-medium text-sm mb-2">{content.titulo}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">{content.funil}</Badge>
                          {content.data_publicacao && (
                            <span className="text-xs text-slate-400">{format(new Date(content.data_publicacao), "dd/MM")}</span>
                          )}
                        </div>
                        <div className="flex gap-1 mt-2">
                          {status !== "publicado" && (
                            <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => {
                              const nextStatus = { ideia: "producao", producao: "revisao", revisao: "publicado" }[status];
                              updateMutation.mutate({ id: content.id, data: { ...content, status: nextStatus } });
                            }}>
                              <ArrowRight className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          ))}
        </div>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Conteúdo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div><Label>Título</Label><Input value={form.titulo} onChange={(e) => setForm({...form, titulo: e.target.value})} placeholder="Ex: 5 sinais que você precisa de Invisalign" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo</Label>
                  <Select value={form.tipo} onValueChange={(v) => setForm({...form, tipo: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(tipoColors).map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Funil</Label>
                  <Select value={form.funil} onValueChange={(v) => setForm({...form, funil: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="topo">Topo (Descoberta)</SelectItem>
                      <SelectItem value="meio">Meio (Consideração)</SelectItem>
                      <SelectItem value="fundo">Fundo (Decisão)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Objetivo</Label>
                  <Select value={form.objetivo} onValueChange={(v) => setForm({...form, objetivo: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="autoridade">Autoridade</SelectItem>
                      <SelectItem value="lead">Geração de Lead</SelectItem>
                      <SelectItem value="conversao">Conversão</SelectItem>
                      <SelectItem value="engajamento">Engajamento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data Publicação</Label>
                  <Input type="date" value={form.data_publicacao} onChange={(e) => setForm({...form, data_publicacao: e.target.value})} />
                </div>
              </div>
              <div><Label>CTA (Call to Action)</Label><Input value={form.cta} onChange={(e) => setForm({...form, cta: e.target.value})} placeholder="Ex: Agende sua avaliação gratuita!" /></div>
              <div><Label>Script / Roteiro</Label><Textarea value={form.script} onChange={(e) => setForm({...form, script: e.target.value})} rows={4} placeholder="Roteiro do conteúdo..." /></div>
              <div><Label>Hashtags</Label><Input value={form.hashtags} onChange={(e) => setForm({...form, hashtags: e.target.value})} placeholder="#invisalign #ortodontia #sorriso" /></div>
              <Button onClick={() => createMutation.mutate(form)} disabled={!form.titulo || createMutation.isPending} className="w-full bg-pink-600 hover:bg-pink-700">
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Criar Conteúdo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
