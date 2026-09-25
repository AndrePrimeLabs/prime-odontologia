// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle, Users, FileText, Package, ArrowRight,
  Phone, Mail, Building2, Plus, Send, Copy,
  ChevronRight, Sparkles, Loader2, CheckCircle, Clock,
  Pencil, Trash2, ShoppingCart, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const pipelineStages = [
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "bg-green-500" },
  { id: "crm", label: "CRM", icon: Users, color: "bg-indigo-500" },
  { id: "script", label: "Script de Vendas", icon: FileText, color: "bg-purple-500" },
  { id: "catalog", label: "Catálogo", icon: Package, color: "bg-emerald-500" },
  { id: "sale", label: "Venda", icon: ShoppingCart, color: "bg-orange-500" },
];

const statusColors = {
  lead: "bg-slate-100 text-slate-700",
  prospect: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-green-700",
  inactive: "bg-amber-100 text-amber-700",
  churned: "bg-red-100 text-red-700",
};

function CustomerFormDialog({ open, onOpenChange, customer, onSave, loading }) {
  const [form, setForm] = useState(customer || {
    name: "", phone: "", email: "", company: "",
    segment: "individual", source: "whatsapp", status: "lead", notes: ""
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-600" />
            {customer ? "Editar Contato" : "Novo Contato WhatsApp"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Nome *</Label>
              <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Nome completo" />
            </div>
            <div>
              <Label>WhatsApp *</Label>
              <Input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+55 11 99999-9999" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="email@exemplo.com" />
            </div>
            <div>
              <Label>Empresa</Label>
              <Input value={form.company} onChange={e => set("company", e.target.value)} placeholder="Nome da empresa" />
            </div>
            <div>
              <Label>Segmento</Label>
              <Select value={form.segment} onValueChange={v => set("segment", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="small_business">Pequena Empresa</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                  <SelectItem value="partner">Parceiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Origem</Label>
            <Select value={form.source} onValueChange={v => set("source", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="referral">Indicação</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="social_media">Redes Sociais</SelectItem>
                <SelectItem value="cold_outreach">Prospecção</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Notas sobre o cliente..." rows={2} />
          </div>
          <Button
            onClick={() => onSave(form)}
            disabled={!form.name || !form.phone || loading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            {customer ? "Salvar Alterações" : "Adicionar ao CRM"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ProductFormDialog({ open, onOpenChange, product, onSave, loading }) {
  const [form, setForm] = useState(product || {
    name: "", description: "", category: "", price: "", cost: "",
    stock_quantity: 0, status: "active", whatsapp_enabled: true
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            {product ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Nome *</Label>
              <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Nome do produto/serviço" />
            </div>
            <div>
              <Label>Preço *</Label>
              <Input type="number" value={form.price} onChange={e => set("price", parseFloat(e.target.value) || "")} placeholder="0.00" />
            </div>
            <div>
              <Label>Categoria</Label>
              <Input value={form.category} onChange={e => set("category", e.target.value)} placeholder="Ex: Serviço, Produto..." />
            </div>
            <div>
              <Label>Estoque</Label>
              <Input type="number" value={form.stock_quantity} onChange={e => set("stock_quantity", parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="out_of_stock">Sem Estoque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Descreva o produto/serviço..." rows={2} />
          </div>
          <Button
            onClick={() => onSave(form)}
            disabled={!form.name || !form.price || loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            {product ? "Salvar Produto" : "Criar Produto"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CustomerPipeline() {
  const [activeStage, setActiveStage] = useState("whatsapp");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [generatingScript, setGeneratingScript] = useState(false);
  const [salesScript, setSalesScript] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [createdSale, setCreatedSale] = useState(null);

  // Dialogs
  const [customerDialog, setCustomerDialog] = useState({ open: false, customer: null });
  const [productDialog, setProductDialog] = useState({ open: false, product: null });
  const [search, setSearch] = useState("");

  const queryClient = useQueryClient();

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => primeos.entities.Customer.list("-created_date")
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => primeos.entities.Product.list("-created_date")
  });

  const { data: interactions = [] } = useQuery({
    queryKey: ["interactions", selectedCustomer?.id],
    queryFn: () => selectedCustomer ? primeos.entities.Interaction.filter({ customer_id: selectedCustomer.id }) : [],
    enabled: !!selectedCustomer
  });

  const createCustomerMutation = useMutation({
    mutationFn: (data) => primeos.entities.Customer.create(data),
    onSuccess: (newCustomer) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setSelectedCustomer(newCustomer);
      setCustomerDialog({ open: false, customer: null });
      setActiveStage("crm");
      toast.success("Cliente adicionado ao CRM!");
    }
  });

  const updateCustomerMutation = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.Customer.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setSelectedCustomer(updated);
      setCustomerDialog({ open: false, customer: null });
      toast.success("Cliente atualizado!");
    }
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: (id) => primeos.entities.Customer.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setSelectedCustomer(null);
      setActiveStage("whatsapp");
      toast.success("Cliente removido.");
    }
  });

  const createProductMutation = useMutation({
    mutationFn: (data) => primeos.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setProductDialog({ open: false, product: null });
      toast.success("Produto criado!");
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.Product.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setProductDialog({ open: false, product: null });
      toast.success("Produto atualizado!");
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id) => primeos.entities.Product.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] })
  });

  const createSaleMutation = useMutation({
    mutationFn: (data) => primeos.entities.Sale.create(data),
    onSuccess: (sale) => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      setCreatedSale(sale);
      setActiveStage("sale");
      updateCustomerMutation.mutate({ id: selectedCustomer.id, data: { ...selectedCustomer, status: "active" } });
      toast.success("Venda criada com sucesso!");
    }
  });

  const createInteractionMutation = useMutation({
    mutationFn: (data) => primeos.entities.Interaction.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["interactions", selectedCustomer?.id] })
  });

  const generateSalesScript = async () => {
    if (!selectedCustomer) return;
    setGeneratingScript(true);
    try {
      const productList = products.slice(0, 5).map(p => `- ${p.name}: R$${p.price} - ${p.description || ""}`).join("\n");
      const response = await primeos.integrations.Core.InvokeLLM({
        prompt: `Gere um script de vendas amigável para WhatsApp para o cliente:

Cliente: ${selectedCustomer.name}
Empresa: ${selectedCustomer.company || "N/A"}
Segmento: ${selectedCustomer.segment || "individual"}
Status: ${selectedCustomer.status}
Observações: ${selectedCustomer.notes || "Sem notas"}

Produtos disponíveis:
${productList}

Crie uma mensagem conversacional e profissional para WhatsApp que:
1. Cumprimente o cliente pelo nome
2. Apresente a proposta de valor
3. Destaque 1-2 produtos relevantes
4. Inclua um call-to-action claro
5. Seja concisa e adequada para mobile
6. Use emojis com moderação

Retorne apenas o texto pronto para copiar e enviar.`,
        response_json_schema: {
          type: "object",
          properties: { full_script: { type: "string" } }
        }
      });
      setSalesScript(response.full_script || "");
    } catch (error) {
      setSalesScript(`Olá, ${selectedCustomer.name}! 👋\n\nEspero que esteja bem! Gostaria de apresentar nossos produtos/serviços que podem ser perfeitos para você.\n\nPodemos conversar? Tenho uma proposta especial! 😊`);
    }
    setGeneratingScript(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  const openWhatsApp = (phone, message) => {
    const clean = phone?.replace(/\D/g, "") || "";
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const toggleProduct = (product) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      return exists ? prev.filter(p => p.id !== product.id) : [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQty = (id, qty) => {
    setSelectedProducts(prev => prev.map(p => p.id === id ? { ...p, quantity: Math.max(1, qty) } : p));
  };

  const createSale = () => {
    if (!selectedCustomer || selectedProducts.length === 0) return;
    const saleProducts = selectedProducts.map(p => ({
      product_id: p.id, product_name: p.name,
      quantity: p.quantity, unit_price: p.price, total: p.price * p.quantity
    }));
    const totalAmount = saleProducts.reduce((s, p) => s + p.total, 0);
    createSaleMutation.mutate({
      customer_id: selectedCustomer.id, customer_name: selectedCustomer.name,
      products: saleProducts, total_amount: totalAmount,
      channel: "whatsapp", status: "confirmed", payment_status: "pending"
    });
    createInteractionMutation.mutate({
      customer_id: selectedCustomer.id, type: "whatsapp",
      subject: "Venda criada via Pipeline",
      description: `${selectedProducts.length} produto(s) — Total: R$${totalAmount.toFixed(2)}`,
      outcome: "positive"
    });
  };

  const resetPipeline = () => {
    setSelectedCustomer(null);
    setSelectedProducts([]);
    setSalesScript("");
    setCreatedSale(null);
    setActiveStage("whatsapp");
  };

  const totalOrder = selectedProducts.reduce((s, p) => s + p.price * p.quantity, 0);
  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.company?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <MessageCircle className="w-7 h-7 text-green-600" />
            Pipeline de Vendas
          </h1>
          <p className="text-slate-500 mt-0.5 text-sm">WhatsApp → CRM → Script → Catálogo → Venda</p>
        </div>

        {/* Pipeline Steps */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6">
          <div className="flex items-center justify-between overflow-x-auto gap-2">
            {pipelineStages.map((stage, idx) => {
              const done = pipelineStages.findIndex(s => s.id === activeStage) > idx;
              const active = activeStage === stage.id;
              return (
                <div key={stage.id} className="flex items-center flex-1 min-w-0">
                  <button
                    onClick={() => { if (stage.id !== "sale" || createdSale) setActiveStage(stage.id); }}
                    className={cn("flex flex-col items-center gap-1.5 transition-all flex-shrink-0", active ? "scale-105" : "opacity-60 hover:opacity-90")}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                      active ? stage.color + " text-white shadow-md" : done ? "bg-slate-200 text-slate-600" : "bg-slate-100 text-slate-400"
                    )}>
                      {done ? <CheckCircle className="w-5 h-5 text-slate-600" /> : <stage.icon className="w-5 h-5" />}
                    </div>
                    <span className={cn("text-xs font-medium text-center hidden sm:block", active ? "text-slate-900" : "text-slate-400")}>
                      {stage.label}
                    </span>
                  </button>
                  {idx < pipelineStages.length - 1 && (
                    <div className="flex-1 flex items-center justify-center px-1">
                      <div className={cn("h-0.5 w-full", done ? "bg-slate-400" : "bg-slate-200")} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Stage Content */}
        <AnimatePresence mode="wait">
          {/* ── STAGE 1: WhatsApp / Customer Selection ── */}
          {activeStage === "whatsapp" && (
            <motion.div key="whatsapp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                    Selecionar ou Criar Contato
                  </CardTitle>
                  <Button onClick={() => setCustomerDialog({ open: true, customer: null })} className="bg-green-600 hover:bg-green-700" size="sm">
                    <Plus className="w-4 h-4 mr-2" />Novo Contato
                  </Button>
                </CardHeader>
                <CardContent>
                  <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome, telefone ou empresa..." className="mb-4" />
                  {filteredCustomers.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                      <Users className="w-10 h-10 mx-auto mb-2" />
                      <p>Nenhum contato encontrado. Crie um novo!</p>
                    </div>
                  )}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredCustomers.map(customer => (
                      <div key={customer.id} className={cn(
                        "p-4 rounded-xl border-2 cursor-pointer transition-all relative group",
                        selectedCustomer?.id === customer.id ? "border-green-500 bg-green-50" : "border-slate-100 hover:border-green-200 bg-white"
                      )}
                        onClick={() => { setSelectedCustomer(customer); setActiveStage("crm"); }}
                      >
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1 z-10">
                          <button onClick={e => { e.stopPropagation(); setCustomerDialog({ open: true, customer }); }}
                            className="p-1 bg-white rounded-lg shadow-sm border hover:bg-slate-50">
                            <Pencil className="w-3 h-3 text-slate-500" />
                          </button>
                          <button onClick={e => { e.stopPropagation(); if (confirm("Remover contato?")) deleteCustomerMutation.mutate(customer.id); }}
                            className="p-1 bg-white rounded-lg shadow-sm border hover:bg-red-50">
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {customer.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-slate-900 text-sm truncate">{customer.name}</h3>
                            <p className="text-xs text-slate-400 truncate">{customer.company || customer.segment}</p>
                          </div>
                        </div>
                        {customer.phone && (
                          <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                            <Phone className="w-3 h-3 text-green-500" />{customer.phone}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <Badge className={cn("text-xs border-0", statusColors[customer.status] || "bg-slate-100 text-slate-600")}>{customer.status}</Badge>
                          <ChevronRight className="w-4 h-4 text-slate-300" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ── STAGE 2: CRM ── */}
          {activeStage === "crm" && selectedCustomer && (
            <motion.div key="crm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="grid lg:grid-cols-2 gap-5">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Users className="w-5 h-5 text-indigo-600" />Perfil do Cliente
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setCustomerDialog({ open: true, customer: selectedCustomer })}>
                      <Pencil className="w-3.5 h-3.5 mr-1.5" />Editar
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                        {selectedCustomer.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">{selectedCustomer.name}</h2>
                        {selectedCustomer.company && (
                          <p className="text-slate-500 text-sm flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{selectedCustomer.company}</p>
                        )}
                        <Badge className={cn("text-xs border-0 mt-1", statusColors[selectedCustomer.status])}>{selectedCustomer.status}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Telefone", value: selectedCustomer.phone, icon: <Phone className="w-3.5 h-3.5 text-green-500" /> },
                        { label: "Email", value: selectedCustomer.email, icon: <Mail className="w-3.5 h-3.5 text-blue-500" /> },
                        { label: "Segmento", value: selectedCustomer.segment },
                        { label: "Origem", value: selectedCustomer.source },
                      ].map((item, i) => (
                        <div key={i} className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-400 mb-0.5">{item.label}</p>
                          <p className="text-sm font-medium text-slate-800 truncate flex items-center gap-1.5">
                            {item.icon}{item.value || "—"}
                          </p>
                        </div>
                      ))}
                    </div>
                    {selectedCustomer.notes && (
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-sm text-amber-900">
                        <p className="text-xs text-amber-600 mb-1 font-medium">Observações</p>
                        {selectedCustomer.notes}
                      </div>
                    )}
                    <Button onClick={() => setActiveStage("script")} className="w-full bg-indigo-600 hover:bg-indigo-700">
                      Continuar para Script de Vendas <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Clock className="w-4 h-4 text-purple-600" />Histórico de Interações
                    </CardTitle>
                    <Button size="sm" variant="outline" onClick={() => {
                      const subject = prompt("Assunto da interação:");
                      if (!subject) return;
                      const desc = prompt("Descrição:");
                      createInteractionMutation.mutate({
                        customer_id: selectedCustomer.id, type: "whatsapp",
                        subject, description: desc || "", outcome: "neutral"
                      });
                    }}>
                      <Plus className="w-3.5 h-3.5 mr-1" />Registrar
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      {interactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-sm">
                          <Clock className="w-8 h-8 mb-2 opacity-50" />Sem interações ainda
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {interactions.map(i => (
                            <div key={i.id} className="p-3 bg-slate-50 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <Badge variant="outline" className="text-xs">{i.type}</Badge>
                                <span className="text-xs text-slate-400">{new Date(i.created_date).toLocaleDateString("pt-BR")}</span>
                              </div>
                              <p className="font-medium text-sm">{i.subject}</p>
                              {i.description && <p className="text-xs text-slate-500 mt-0.5">{i.description}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* ── STAGE 3: Sales Script ── */}
          {activeStage === "script" && selectedCustomer && (
            <motion.div key="script" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="grid lg:grid-cols-2 gap-5">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      Gerador de Script com IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                      <p className="text-sm text-purple-700 mb-3">
                        Script personalizado para <strong>{selectedCustomer.name}</strong> com base no perfil e produtos cadastrados.
                      </p>
                      <Button onClick={generateSalesScript} disabled={generatingScript} className="bg-purple-600 hover:bg-purple-700">
                        {generatingScript ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Gerando...</> : <><Sparkles className="w-4 h-4 mr-2" />Gerar Script</>}
                      </Button>
                    </div>
                    {salesScript && (
                      <div className="space-y-2">
                        <Label>Script Gerado (editável)</Label>
                        <Textarea value={salesScript} onChange={e => setSalesScript(e.target.value)} rows={10} className="text-sm" />
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => copyToClipboard(salesScript)} className="flex-1">
                            <Copy className="w-4 h-4 mr-2" />Copiar
                          </Button>
                          {selectedCustomer.phone && (
                            <Button onClick={() => openWhatsApp(selectedCustomer.phone, salesScript)} className="flex-1 bg-green-600 hover:bg-green-700">
                              <Send className="w-4 h-4 mr-2" />Enviar WhatsApp
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                    <Button onClick={() => setActiveStage("catalog")} className="w-full bg-emerald-600 hover:bg-emerald-700">
                      Ir para Catálogo de Produtos <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Produtos em Destaque</CardTitle>
                    <Button size="sm" variant="outline" onClick={() => setProductDialog({ open: true, product: null })}>
                      <Plus className="w-3.5 h-3.5 mr-1" />Novo Produto
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {products.filter(p => p.status === "active").slice(0, 6).map(p => (
                        <div key={p.id} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{p.name}</p>
                            <p className="text-xs text-slate-500 truncate">{p.description?.slice(0, 50)}</p>
                          </div>
                          <span className="font-bold text-emerald-600 ml-3 flex-shrink-0">R${Number(p.price).toFixed(2)}</span>
                        </div>
                      ))}
                      {products.filter(p => p.status === "active").length === 0 && (
                        <p className="text-sm text-slate-400 text-center py-4">Nenhum produto ativo. Adicione produtos!</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* ── STAGE 4: Product Catalog ── */}
          {activeStage === "catalog" && selectedCustomer && (
            <motion.div key="catalog" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="grid lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2">
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Package className="w-5 h-5 text-emerald-600" />
                        Catálogo de Produtos
                      </CardTitle>
                      <Button size="sm" onClick={() => setProductDialog({ open: true, product: null })} className="bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="w-3.5 h-3.5 mr-1.5" />Novo Produto
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {products.length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                          <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                          <p>Nenhum produto cadastrado. Clique em "Novo Produto" para adicionar.</p>
                        </div>
                      )}
                      <div className="grid sm:grid-cols-2 gap-3">
                        {products.map(product => {
                          const isSelected = !!selectedProducts.find(p => p.id === product.id);
                          return (
                            <div key={product.id} className={cn(
                              "p-4 rounded-xl border-2 cursor-pointer transition-all relative group",
                              isSelected ? "border-emerald-500 bg-emerald-50" : "border-slate-100 hover:border-emerald-200 bg-white"
                            )} onClick={() => toggleProduct(product)}>
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1 z-10"
                                onClick={e => e.stopPropagation()}>
                                <button onClick={() => setProductDialog({ open: true, product })}
                                  className="p-1 bg-white rounded-lg shadow-sm border hover:bg-slate-50">
                                  <Pencil className="w-3 h-3 text-slate-500" />
                                </button>
                                <button onClick={() => { if (confirm("Remover produto?")) deleteProductMutation.mutate(product.id); }}
                                  className="p-1 bg-white rounded-lg shadow-sm border hover:bg-red-50">
                                  <Trash2 className="w-3 h-3 text-red-500" />
                                </button>
                              </div>
                              <div className="flex items-start justify-between mb-1 pr-12">
                                <div className="min-w-0">
                                  <h3 className="font-semibold text-slate-900 text-sm">{product.name}</h3>
                                  <p className="text-xs text-slate-400">{product.category}</p>
                                </div>
                                {isSelected && <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                              </div>
                              {product.description && <p className="text-xs text-slate-500 mb-2 line-clamp-2">{product.description}</p>}
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-emerald-600">R${Number(product.price).toFixed(2)}</span>
                                <div className="flex items-center gap-1">
                                  {product.whatsapp_enabled && (
                                    <Badge className="bg-green-100 text-green-700 text-xs border-0">
                                      <MessageCircle className="w-3 h-3 mr-1" />WhatsApp
                                    </Badge>
                                  )}
                                  <Badge className={cn("text-xs border-0", product.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500")}>
                                    {product.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Order Summary */}
                <div>
                  <Card className="border-0 shadow-sm sticky top-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <ShoppingCart className="w-5 h-5 text-indigo-600" />Resumo do Pedido
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-400 mb-0.5">Cliente</p>
                        <p className="font-medium text-sm">{selectedCustomer.name}</p>
                      </div>
                      {selectedProducts.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-sm">
                          <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          Selecione produtos para criar um pedido
                        </div>
                      ) : (
                        <>
                          <div className="space-y-2">
                            {selectedProducts.map(p => (
                              <div key={p.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">{p.name}</p>
                                  <p className="text-xs text-slate-400">R${p.price} cada</p>
                                </div>
                                <Input type="number" min="1" value={p.quantity}
                                  onChange={e => updateQty(p.id, parseInt(e.target.value) || 1)}
                                  className="w-14 h-7 text-center text-xs" />
                                <button onClick={() => toggleProduct(p)} className="text-slate-300 hover:text-red-400">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="border-t pt-3 flex items-center justify-between font-bold">
                            <span>Total</span>
                            <span className="text-emerald-600 text-lg">R${totalOrder.toFixed(2)}</span>
                          </div>
                          <Button onClick={createSale} disabled={createSaleMutation.isPending} className="w-full bg-emerald-600 hover:bg-emerald-700">
                            {createSaleMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                            Confirmar Venda
                          </Button>
                          {selectedCustomer.phone && (
                            <Button variant="outline" className="w-full" onClick={() => {
                              const msg = `Olá ${selectedCustomer.name}! Segue seu resumo de pedido:\n\n${selectedProducts.map(p => `• ${p.name} x${p.quantity} — R$${(p.price * p.quantity).toFixed(2)}`).join("\n")}\n\nTotal: R$${totalOrder.toFixed(2)}\n\nConfirma o pedido? 😊`;
                              openWhatsApp(selectedCustomer.phone, msg);
                            }}>
                              <Send className="w-4 h-4 mr-2" />Enviar Pedido via WhatsApp
                            </Button>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STAGE 5: Sale Confirmed ── */}
          {activeStage === "sale" && createdSale && (
            <motion.div key="sale" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <Card className="border-0 shadow-sm max-w-2xl mx-auto">
                <CardContent className="py-12 text-center space-y-6">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Venda Criada!</h2>
                    <p className="text-slate-500 mt-1">Pedido registrado para <strong>{createdSale.customer_name}</strong></p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2">
                    {(createdSale.products || []).map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span>{p.product_name} x{p.quantity}</span>
                        <span className="font-medium">R${p.total?.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 flex items-center justify-between font-bold">
                      <span>Total</span>
                      <span className="text-emerald-600 text-lg">R${createdSale.total_amount?.toFixed(2)}</span>
                    </div>
                  </div>
                  {selectedCustomer?.phone && (
                    <Button onClick={() => {
                      const msg = `✅ Olá ${selectedCustomer.name}! Sua venda foi confirmada.\n\n${(createdSale.products || []).map(p => `• ${p.product_name} x${p.quantity} — R$${p.total?.toFixed(2)}`).join("\n")}\n\nTotal: R$${createdSale.total_amount?.toFixed(2)}\n\nObrigado! 🙏`;
                      openWhatsApp(selectedCustomer.phone, msg);
                    }} className="bg-green-600 hover:bg-green-700">
                      <Send className="w-4 h-4 mr-2" />Enviar Confirmação via WhatsApp
                    </Button>
                  )}
                  <Button variant="outline" onClick={resetPipeline}>
                    Iniciar Nova Venda
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Customer Form Dialog */}
        <CustomerFormDialog
          open={customerDialog.open}
          onOpenChange={(open) => !open && setCustomerDialog({ open: false, customer: null })}
          customer={customerDialog.customer}
          loading={createCustomerMutation.isPending || updateCustomerMutation.isPending}
          onSave={(form) => {
            if (customerDialog.customer) {
              updateCustomerMutation.mutate({ id: customerDialog.customer.id, data: form });
            } else {
              createCustomerMutation.mutate(form);
            }
          }}
        />

        {/* Product Form Dialog */}
        <ProductFormDialog
          open={productDialog.open}
          onOpenChange={(open) => !open && setProductDialog({ open: false, product: null })}
          product={productDialog.product}
          loading={createProductMutation.isPending || updateProductMutation.isPending}
          onSave={(form) => {
            if (productDialog.product) {
              updateProductMutation.mutate({ id: productDialog.product.id, data: form });
            } else {
              createProductMutation.mutate(form);
            }
          }}
        />
      </div>
    </div>
  );
}
