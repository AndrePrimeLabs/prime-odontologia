// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, MonitorCheck, Zap } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const TYPE_ICONS = { cadeira: "🦷", sala: "🏥", equipamento: "⚙️", instrumento: "🔧" };
const TYPE_LABELS = { cadeira: "Cadeira Odontológica", sala: "Sala / Consultório", equipamento: "Equipamento", instrumento: "Instrumento" };

const emptyForm = { name: "", type: "cadeira", location: "", description: "", is_active: true, requires_sterilization_minutes: 15, notes: "" };

export default function ResourceManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [viewDate, setViewDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const { data: resources = [] } = useQuery({
    queryKey: ["resources"],
    queryFn: () => primeos.entities.Resource.list("name"),
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointmentsForResources", viewDate],
    queryFn: () => primeos.entities.Appointment.filter({ date: viewDate }),
  });

  const createMutation = useMutation({
    mutationFn: (d) => primeos.entities.Resource.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["resources"] }); setShowForm(false); toast.success("Recurso criado!"); }
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.Resource.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["resources"] }); setShowForm(false); toast.success("Atualizado!"); }
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => primeos.entities.Resource.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["resources"] }); toast.success("Removido!"); }
  });

  const openNew = () => { setForm(emptyForm); setEditing(null); setShowForm(true); };
  const openEdit = (r) => { setForm({ ...r }); setEditing(r); setShowForm(true); };
  const handleSave = () => {
    if (editing) updateMutation.mutate({ id: editing.id, data: form });
    else createMutation.mutate(form);
  };

  // Build occupation grid for the day
  const TIME_SLOTS = ["08:00","09:00","10:00","11:00","12:00","14:00","15:00","16:00","17:00","18:00"];
  const getResourceOccupation = (resourceId, time) => {
    const [h, m] = time.split(":").map(Number);
    const slotStart = h * 60 + m;
    return appointments.find(a => {
      if (a.resource_id !== resourceId) return false;
      const [ah, am] = (a.time || "").split(":").map(Number);
      const aptStart = ah * 60 + am;
      const aptEnd = aptStart + (a.duration_minutes || 30);
      return slotStart >= aptStart && slotStart < aptEnd;
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-slate-800">Recursos ({resources.length})</h3>
        <Button onClick={openNew} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />Novo Recurso
        </Button>
      </div>

      {/* Resource Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map(r => {
          const todayCount = appointments.filter(a => a.resource_id === r.id).length;
          return (
            <Card key={r.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl">
                      {TYPE_ICONS[r.type]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{r.name}</p>
                      <p className="text-xs text-slate-500">{TYPE_LABELS[r.type]}</p>
                      {r.location && <p className="text-xs text-slate-400">{r.location}</p>}
                    </div>
                  </div>
                  <Badge className={r.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}>
                    {r.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                {r.requires_sterilization_minutes > 0 && (
                  <p className="text-xs text-amber-600 flex items-center gap-1 mb-2">
                    <Zap className="w-3 h-3" />
                    {r.requires_sterilization_minutes}min de esterilização entre pacientes
                  </p>
                )}
                <p className="text-xs text-indigo-600 font-medium">{todayCount} consulta(s) hoje</p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => openEdit(r)} className="flex-1 text-xs">
                    <Pencil className="w-3 h-3 mr-1" />Editar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(r.id)} className="text-red-400 hover:text-red-600 text-xs px-2">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {resources.length === 0 && (
          <div className="col-span-3 text-center py-12 text-slate-400">
            <MonitorCheck className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p>Nenhum recurso cadastrado</p>
          </div>
        )}
      </div>

      {/* Occupation Grid */}
      {resources.length > 0 && (
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="p-4 border-b flex items-center gap-3">
            <h3 className="font-semibold text-slate-800">Ocupação de Recursos</h3>
            <Input type="date" value={viewDate} onChange={e => setViewDate(e.target.value)} className="w-40 text-sm" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[600px]">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left p-2 text-slate-500 font-medium w-20">Horário</th>
                  {resources.filter(r => r.is_active).map(r => (
                    <th key={r.id} className="text-center p-2 text-slate-700 font-medium">
                      <div>{TYPE_ICONS[r.type]} {r.name}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map(time => (
                  <tr key={time} className="border-t border-slate-100">
                    <td className="p-2 text-slate-500 font-mono">{time}</td>
                    {resources.filter(r => r.is_active).map(r => {
                      const apt = getResourceOccupation(r.id, time);
                      return (
                        <td key={r.id} className="p-1 text-center">
                          {apt ? (
                            <div className="bg-indigo-100 text-indigo-800 rounded px-1.5 py-1 text-xs truncate max-w-[120px] mx-auto">
                              {apt.patient_name}
                            </div>
                          ) : (
                            <div className="text-emerald-400 text-xs">livre</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Recurso" : "Novo Recurso"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Cadeira 1, Raio-X Panorâmico" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Localização</Label>
                <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Ex: Sala 2" />
              </div>
            </div>
            <div>
              <Label>Tempo esterilização (min)</Label>
              <Input type="number" value={form.requires_sterilization_minutes} onChange={e => setForm(f => ({ ...f, requires_sterilization_minutes: parseInt(e.target.value) || 0 }))} />
            </div>
            <div>
              <Label>Descrição</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              <Label>Recurso ativo</Label>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancelar</Button>
              <Button onClick={handleSave} className="flex-1 bg-indigo-600 hover:bg-indigo-700" disabled={!form.name}>
                {editing ? "Salvar" : "Criar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
