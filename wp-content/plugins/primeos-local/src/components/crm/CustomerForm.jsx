// @ts-nocheck
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, X, Plus } from "lucide-react";

const EMPTY = {
  name: "", email: "", phone: "", company: "", segment: "",
  status: "lead", value_tier: "medium", source: "", notes: "",
  birth_date: "", profession: "", interests: "", city: "", state: "",
  tags: []
};

export default function CustomerForm({ open, onClose, onSave, customer, isLoading }) {
  const [form, setForm] = useState(EMPTY);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    setForm(customer ? { ...EMPTY, ...customer, tags: customer.tags || [] } : EMPTY);
    setTagInput("");
  }, [customer, open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (!t || form.tags?.includes(t)) return;
    set("tags", [...(form.tags || []), t]);
    setTagInput("");
  };

  const removeTag = (tag) => set("tags", form.tags.filter(t => t !== tag));

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); addTag(); }
    if (e.key === ",") { e.preventDefault(); addTag(); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{customer ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic">
          <TabsList className="mb-4">
            <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="tags">Tags & Notas</TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Dados Básicos ── */}
          <TabsContent value="basic" className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Nome *</Label>
                <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Nome completo" required />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="email@exemplo.com" />
              </div>
              <div>
                <Label>Telefone / WhatsApp</Label>
                <Input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+55 11 99999-9999" />
              </div>
              <div>
                <Label>Empresa</Label>
                <Input value={form.company} onChange={e => set("company", e.target.value)} placeholder="Nome da empresa" />
              </div>
              <div>
                <Label>Segmento</Label>
                <Select value={form.segment} onValueChange={v => set("segment", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                    <SelectItem value="small_business">Pequena Empresa</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
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
                    <SelectItem value="churned">Perdido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Valor do Cliente</Label>
                <Select value={form.value_tier} onValueChange={v => set("value_tier", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Alto</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="low">Baixo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Origem</Label>
                <Select value={form.source} onValueChange={v => set("source", v)}>
                  <SelectTrigger><SelectValue placeholder="Como chegou?" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="referral">Indicação</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="social_media">Redes Sociais</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="cold_outreach">Prospecção</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* ── Tab 2: Perfil ── */}
          <TabsContent value="profile" className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Data de Nascimento</Label>
                <Input type="date" value={form.birth_date || ""} onChange={e => set("birth_date", e.target.value)} />
              </div>
              <div>
                <Label>Profissão</Label>
                <Input value={form.profession || ""} onChange={e => set("profession", e.target.value)} placeholder="Ex: Dentista, Engenheiro..." />
              </div>
              <div>
                <Label>Cidade</Label>
                <Input value={form.city || ""} onChange={e => set("city", e.target.value)} placeholder="Cidade" />
              </div>
              <div>
                <Label>Estado</Label>
                <Input value={form.state || ""} onChange={e => set("state", e.target.value)} placeholder="SP, RJ..." />
              </div>
              <div className="col-span-2">
                <Label>Interesses</Label>
                <Textarea
                  value={form.interests || ""}
                  onChange={e => set("interests", e.target.value)}
                  placeholder="Ex: tecnologia, viagens, gastronomia..."
                  rows={2}
                />
              </div>
            </div>
          </TabsContent>

          {/* ── Tab 3: Tags & Notas ── */}
          <TabsContent value="tags" className="space-y-4">
            <div>
              <Label>Tags</Label>
              <p className="text-xs text-slate-400 mb-2">Pressione Enter ou vírgula para adicionar</p>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Nova tag..."
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="icon" onClick={addTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {form.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {form.tags.map(tag => (
                    <Badge key={tag} className="bg-indigo-100 text-indigo-700 border-0 gap-1 pr-1">
                      #{tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea
                value={form.notes || ""}
                onChange={e => set("notes", e.target.value)}
                placeholder="Notas sobre o cliente..."
                rows={4}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={() => onSave(form)}
            disabled={!form.name || isLoading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {customer ? "Salvar Alterações" : "Criar Cliente"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
