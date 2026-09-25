// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, Instagram, Facebook, Globe, Phone, 
  Send, Clock, CheckCircle, Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const platforms = {
  whatsapp: { label: "WhatsApp", icon: MessageCircle, color: "bg-green-500", textColor: "text-green-600" },
  instagram: { label: "Instagram", icon: Instagram, color: "bg-gradient-to-br from-purple-500 to-pink-500", textColor: "text-pink-600" },
  facebook: { label: "Facebook", icon: Facebook, color: "bg-blue-600", textColor: "text-blue-600" },
  website: { label: "Website", icon: Globe, color: "bg-slate-600", textColor: "text-slate-600" },
  telefone: { label: "Telefone", icon: Phone, color: "bg-amber-500", textColor: "text-amber-600" }
};

const statusColors = {
  ativo: "bg-green-100 text-green-700",
  aguardando: "bg-amber-100 text-amber-700",
  resolvido: "bg-blue-100 text-blue-700",
  arquivado: "bg-slate-100 text-slate-700"
};

export default function Canais() {
  const [activePlatform, setActivePlatform] = useState("all");
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [messageText, setMessageText] = useState("");
  
  const queryClient = useQueryClient();

  const { data: channels = [] } = useQuery({
    queryKey: ["channels"],
    queryFn: () => primeos.entities.Channel.list("-last_message_date")
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => primeos.entities.Customer.list()
  });

  const createChannelMutation = useMutation({
    mutationFn: (data) => primeos.entities.Channel.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      toast.success("Canal criado!");
    }
  });

  const updateChannelMutation = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.Channel.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["channels"] })
  });

  const filteredChannels = channels.filter(ch => {
    const matchesPlatform = activePlatform === "all" || ch.platform === activePlatform;
    const matchesSearch = ch.patient_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPlatform && matchesSearch;
  });

  const openPlatform = (channel, message) => {
    const patient = patients.find(p => p.id === channel.patient_id);
    const phone = patient?.phone?.replace(/\D/g, "") || "";
    
    switch(channel.platform) {
      case "whatsapp":
        window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, "_blank");
        break;
      case "instagram":
        window.open("https://instagram.com/direct/inbox", "_blank");
        break;
      case "facebook":
        window.open("https://facebook.com/messages", "_blank");
        break;
      default:
        toast.info("Abra a plataforma correspondente");
    }
    
    updateChannelMutation.mutate({
      id: channel.id,
      data: { ...channel, last_message: message, last_message_date: new Date().toISOString() }
    });
  };

  const platformStats = {
    whatsapp: channels.filter(c => c.platform === "whatsapp").length,
    instagram: channels.filter(c => c.platform === "instagram").length,
    facebook: channels.filter(c => c.platform === "facebook").length,
    ativos: channels.filter(c => c.status === "ativo").length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-purple-600" />
            Central de Canais
          </h1>
          <p className="text-slate-500 mt-1">WhatsApp • Instagram • Facebook - Atendimento unificado</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "WhatsApp", value: platformStats.whatsapp, icon: MessageCircle, color: "bg-green-500" },
            { label: "Instagram", value: platformStats.instagram, icon: Instagram, color: "bg-gradient-to-br from-purple-500 to-pink-500" },
            { label: "Facebook", value: platformStats.facebook, icon: Facebook, color: "bg-blue-600" },
            { label: "Ativos", value: platformStats.ativos, icon: Clock, color: "bg-amber-500" }
          ].map((stat, idx) => (
            <Card key={idx} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white", stat.color)}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Channels List */}
          <Card className="border-0 shadow-sm lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Conversas</CardTitle>
              </div>
              <div className="relative mt-2">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
              </div>
              <div className="flex gap-1 mt-2 flex-wrap">
                <Button size="sm" variant={activePlatform === "all" ? "default" : "ghost"} onClick={() => setActivePlatform("all")}>Todos</Button>
                {Object.entries(platforms).slice(0, 3).map(([key, val]) => (
                  <Button key={key} size="sm" variant={activePlatform === key ? "default" : "ghost"} onClick={() => setActivePlatform(key)} className="p-2">
                    <val.icon className="w-4 h-4" />
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {filteredChannels.map((channel) => {
                    const PlatformIcon = platforms[channel.platform]?.icon || MessageCircle;
                    return (
                      <button
                        key={channel.id}
                        onClick={() => setSelectedChannel(channel)}
                        className={cn(
                          "w-full p-3 rounded-xl text-left transition-all",
                          selectedChannel?.id === channel.id ? "bg-purple-100 border-purple-300 border" : "bg-slate-50 hover:bg-slate-100"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white", platforms[channel.platform]?.color)}>
                            <PlatformIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{channel.patient_name}</p>
                            <p className="text-xs text-slate-500 truncate">{channel.last_message || "Sem mensagens"}</p>
                          </div>
                          <Badge className={cn("text-xs", statusColors[channel.status])}>{channel.status}</Badge>
                        </div>
                      </button>
                    );
                  })}
                  {filteredChannels.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Nenhuma conversa</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="border-0 shadow-sm lg:col-span-2">
            {selectedChannel ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white", platforms[selectedChannel.platform]?.color)}>
                        {(() => { const Icon = platforms[selectedChannel.platform]?.icon || MessageCircle; return <Icon className="w-6 h-6" />; })()}
                      </div>
                      <div>
                        <h2 className="font-bold">{selectedChannel.patient_name}</h2>
                        <p className="text-sm text-slate-500">{platforms[selectedChannel.platform]?.label}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Select value={selectedChannel.status} onValueChange={(v) => updateChannelMutation.mutate({ id: selectedChannel.id, data: { ...selectedChannel, status: v } })}>
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="aguardando">Aguardando</SelectItem>
                          <SelectItem value="resolvido">Resolvido</SelectItem>
                          <SelectItem value="arquivado">Arquivado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  {/* Quick Templates */}
                  <div className="mb-4">
                    <p className="text-xs text-slate-500 mb-2">Respostas rápidas:</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Olá! Como posso ajudar? 😊",
                        "Obrigado pelo contato! Vou verificar e já retorno.",
                        "Seu agendamento foi confirmado! ✅",
                        "Posso agendar sua consulta para qual dia?"
                      ].map((template, idx) => (
                        <Button key={idx} size="sm" variant="outline" onClick={() => setMessageText(template)} className="text-xs">
                          {template.slice(0, 30)}...
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="flex gap-2">
                    <Textarea 
                      value={messageText} 
                      onChange={(e) => setMessageText(e.target.value)} 
                      placeholder="Digite sua mensagem..." 
                      rows={3}
                      className="flex-1"
                    />
                    <Button 
                      onClick={() => {
                        if (messageText.trim()) {
                          openPlatform(selectedChannel, messageText);
                          setMessageText("");
                        }
                      }}
                      className={cn("h-auto", platforms[selectedChannel.platform]?.color)}
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Platform specific buttons */}
                  <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm font-medium mb-2">Ações rápidas</p>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => openPlatform(selectedChannel, `Olá ${selectedChannel.patient_name}! 📅 Gostaria de agendar uma consulta?`)}>
                        Convidar Agendamento
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openPlatform(selectedChannel, `Olá! 🦷 Confira nossos tratamentos em primeodontologia.com.br`)}>
                        Enviar Link
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        updateChannelMutation.mutate({ id: selectedChannel.id, data: { ...selectedChannel, status: "resolvido" } });
                        toast.success("Conversa encerrada!");
                      }}>
                        <CheckCircle className="w-4 h-4 mr-1" />Encerrar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex items-center justify-center h-full py-20 text-slate-400">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-lg">Selecione uma conversa</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
