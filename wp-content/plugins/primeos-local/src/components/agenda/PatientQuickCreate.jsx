// @ts-nocheck
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus, X } from "lucide-react";
import { primeos } from "@/api/primeosClient";

export default function PatientQuickCreate({ onCreated, onCancel }) {
  const [form, setForm] = useState({
    name: "", phone: "", email: "", birth_date: "", city: "", profession: "", notes: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name) return;
    setLoading(true);
    const patient = await primeos.entities.Customer.create({
      ...form,
      status: "lead",
      source: "whatsapp"
    });
    setLoading(false);
    onCreated(patient);
  };

  return (
    <div className="border border-blue-200 rounded-xl bg-blue-50/50 p-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-blue-700 flex items-center gap-1.5">
          <UserPlus className="w-4 h-4" /> Novo Paciente
        </span>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label className="text-xs">Nome completo *</Label>
          <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Maria Silva" className="h-8 text-sm" />
        </div>
        <div>
          <Label className="text-xs">Telefone / WhatsApp</Label>
          <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(11) 99999-0000" className="h-8 text-sm" />
        </div>
        <div>
          <Label className="text-xs">Email</Label>
          <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" className="h-8 text-sm" />
        </div>
        <div>
          <Label className="text-xs">Data de Nascimento</Label>
          <Input type="date" value={form.birth_date} onChange={e => setForm({ ...form, birth_date: e.target.value })} className="h-8 text-sm" />
        </div>
        <div>
          <Label className="text-xs">Cidade</Label>
          <Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="São Paulo" className="h-8 text-sm" />
        </div>
        <div className="col-span-2">
          <Label className="text-xs">Profissão</Label>
          <Input value={form.profession} onChange={e => setForm({ ...form, profession: e.target.value })} placeholder="Ex: Professora" className="h-8 text-sm" />
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={!form.name || loading} className="w-full h-8 text-sm bg-blue-600 hover:bg-blue-700">
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <UserPlus className="w-3.5 h-3.5 mr-1" />}
        Criar Paciente e Vincular
      </Button>
    </div>
  );
}
