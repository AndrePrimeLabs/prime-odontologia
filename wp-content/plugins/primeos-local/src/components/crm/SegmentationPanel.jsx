// @ts-nocheck
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  BookmarkCheck, Plus, Trash2, Filter, Users, Save
} from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "crm_saved_segments";

function loadSegments() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

function saveSegments(segs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(segs));
}

export default function SegmentationPanel({ customers, transactions, onFilter, activeSegmentId, onSegmentSelect }) {
  const [saved, setSaved] = useState(loadSegments);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", status: "all", segment: "all", value_tier: "all", tag: "", min_purchases: "", source: "all" });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const applyFilter = (filters) => {
    return customers.filter(c => {
      if (filters.status !== "all" && c.status !== filters.status) return false;
      if (filters.segment !== "all" && c.segment !== filters.segment) return false;
      if (filters.value_tier !== "all" && c.value_tier !== filters.value_tier) return false;
      if (filters.source !== "all" && c.source !== filters.source) return false;
      if (filters.tag) {
        const hasTag = c.tags?.some(t => t.toLowerCase().includes(filters.tag.toLowerCase()));
        if (!hasTag) return false;
      }
      if (filters.min_purchases) {
        const spent = transactions
          .filter(t => (t.patient_id === c.id || t.patient_name === c.name) && t.type === "receita" && t.status === "pago")
          .reduce((s, t) => s + (t.amount || 0), 0);
        if (spent < parseFloat(filters.min_purchases)) return false;
      }
      return true;
    });
  };

  const saveSegment = () => {
    if (!form.name) return;
    const newSeg = { id: Date.now().toString(), ...form, created_at: new Date().toISOString() };
    const updated = [...saved, newSeg];
    setSaved(updated);
    saveSegments(updated);
    setShowCreate(false);
    setForm({ name: "", status: "all", segment: "all", value_tier: "all", tag: "", min_purchases: "", source: "all" });
    onSegmentSelect(newSeg.id, applyFilter(newSeg));
  };

  const deleteSegment = (id) => {
    const updated = saved.filter(s => s.id !== id);
    setSaved(updated);
    saveSegments(updated);
    if (activeSegmentId === id) onFilter(null);
  };

  const handleSelect = (seg) => {
    if (activeSegmentId === seg.id) {
      onSegmentSelect(null, null);
    } else {
      onSegmentSelect(seg.id, applyFilter(seg));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-indigo-500" />Segmentações Salvas
        </h3>
        <Button size="sm" variant="outline" onClick={() => setShowCreate(true)} className="h-7 text-xs gap-1">
          <Plus className="w-3 h-3" />Nova
        </Button>
      </div>

      {saved.length === 0 && (
        <p className="text-xs text-slate-400 py-2 text-center">Nenhuma segmentação salva.</p>
      )}

      <div className="space-y-1.5">
        {saved.map(seg => {
          const count = applyFilter(seg).length;
          const isActive = activeSegmentId === seg.id;
          return (
            <div key={seg.id} className={cn(
              "flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all text-sm",
              isActive ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-100 hover:border-indigo-200"
            )} onClick={() => handleSelect(seg)}>
              <div className="flex items-center gap-2 min-w-0">
                <BookmarkCheck className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-indigo-600" : "text-slate-400")} />
                <span className={cn("font-medium truncate", isActive ? "text-indigo-700" : "text-slate-700")}>{seg.name}</span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Badge className={cn("text-xs border-0", isActive ? "bg-indigo-200 text-indigo-800" : "bg-slate-100 text-slate-600")}>
                  {count}
                </Badge>
                <button onClick={e => { e.stopPropagation(); deleteSegment(seg.id); }} className="text-slate-300 hover:text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Segment Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-indigo-600" />Nova Segmentação
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nome da Segmentação *</Label>
              <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Ex: Clientes VIP, Leads Frios..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="churned">Perdido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Segmento</Label>
                <Select value={form.segment} onValueChange={v => set("segment", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                    <SelectItem value="small_business">Pequena Empresa</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="partner">Parceiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Valor do Cliente</Label>
                <Select value={form.value_tier} onValueChange={v => set("value_tier", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="high">Alto</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="low">Baixo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Origem</Label>
                <Select value={form.source} onValueChange={v => set("source", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="referral">Indicação</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="social_media">Redes Sociais</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tag contém</Label>
                <Input value={form.tag} onChange={e => set("tag", e.target.value)} placeholder="Ex: vip, fidelizado..." />
              </div>
              <div>
                <Label>Gasto mínimo (R$)</Label>
                <Input type="number" value={form.min_purchases} onChange={e => set("min_purchases", e.target.value)} placeholder="0" />
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" />
              <span><strong>{customers ? customers.filter ? applyFilter(form) : [] : [].length}</strong> clientes correspondem a esses filtros</span>
            </div>
            <Button onClick={saveSegment} disabled={!form.name} className="w-full bg-indigo-600 hover:bg-indigo-700">
              <Save className="w-4 h-4 mr-2" />Salvar Segmentação
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
