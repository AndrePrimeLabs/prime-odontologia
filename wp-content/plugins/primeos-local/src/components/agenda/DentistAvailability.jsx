// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, User, X, CalendarOff } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const SPECIALTIES = {
  clinico_geral: "Clínico Geral", ortodontia: "Ortodontia", implantodontia: "Implantodontia",
  endodontia: "Endodontia", periodontia: "Periodontia", pediatria: "Pediatria",
  cirurgia: "Cirurgia", protese: "Prótese", estetica: "Estética"
};

const defaultWorkingHours = () => ({
  0: { active: false, start: "08:00", end: "18:00" },
  1: { active: true,  start: "08:00", end: "18:00" },
  2: { active: true,  start: "08:00", end: "18:00" },
  3: { active: true,  start: "08:00", end: "18:00" },
  4: { active: true,  start: "08:00", end: "18:00" },
  5: { active: true,  start: "08:00", end: "18:00" },
  6: { active: false, start: "08:00", end: "13:00" },
});

const COLORS = ["#6366f1","#10b981","#f59e0b","#f43f5e","#3b82f6","#8b5cf6","#ec4899","#06b6d4"];

const emptyForm = { name: "", specialty: "clinico_geral", email: "", phone: "", cro: "", color: "#6366f1", slot_duration_minutes: 30, is_active: true, working_hours: defaultWorkingHours(), notes: "" };

export default function DentistAvailability() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showBlockout, setShowBlockout] = useState(null); // dentist obj
  const [blockoutForm, setBlockoutForm] = useState({ date: "", start_time: "08:00", end_time: "09:00", reason: "outro", is_full_day: false, notes: "" });

  const { data: dentists = [] } = useQuery({
    queryKey: ["dentists"],
    queryFn: () => primeos.entities.Dentist.list("name"),
  });

  const { data: blockouts = [] } = useQuery({
    queryKey: ["blockouts"],
    queryFn: () => primeos.entities.DentistBlockout.list("-date"),
  });

  const createMutation = useMutation({
    mutationFn: (d) => primeos.entities.Dentist.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["dentists"] }); setShowForm(false); toast.success("Profissional cadastrado!"); }
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.Dentist.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["dentists"] }); setShowForm(false); toast.success("Atualizado!"); }
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => primeos.entities.Dentist.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["dentists"] }); toast.success("Removido!"); }
  });
  const createBlockoutMutation = useMutation({
    mutationFn: (d) => primeos.entities.DentistBlockout.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["blockouts"] }); setShowBlockout(null); toast.success("Bloqueio criado!"); }
  });
  const deleteBlockoutMutation = useMutation({
    mutationFn: (id) => primeos.entities.DentistBlockout.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["blockouts"] })
  });

  const openNew = () => { setForm(emptyForm); setEditing(null); setShowForm(true); };
  const openEdit = (d) => { setForm({ ...d, working_hours: d.working_hours || defaultWorkingHours() }); setEditing(d); setShowForm(true); };
  const handleSave = () => {
    if (editing) updateMutation.mutate({ id: editing.id, data: form });
    else createMutation.mutate(form);
  };
  const setDay = (dayIdx, field, value) => {
    setForm(f => ({ ...f, working_hours: { ...f.working_hours, [dayIdx]: { ...f.working_hours[dayIdx], [field]: value } } }));
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-slate-800">Profissionais Cadastrados ({dentists.length})</h3>
        <Button onClick={openNew} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />Novo Profissional
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {dentists.map(d => (
          <Card key={d.id} className="border-0 shadow-sm overflow-hidden">
            <div className="h-1.5" style={{ backgroundColor: d.color || "#6366f1" }} />
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: d.color || "#6366f1" }}>
                    {d.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{d.name}</p>
                    <p className="text-xs text-slate-500">{SPECIALTIES[d.specialty] || d.specialty}</p>
                    {d.cro && <p className="text-xs text-slate-400">CRO: {d.cro}</p>}
                  </div>
                </div>
                <Badge className={d.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}>
                  {d.is_active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {DAYS.map((day, i) => {
                  const wh = d.working_hours?.[i];
                  return (
                    <span key={i} className={cn("text-xs px-1.5 py-0.5 rounded", wh?.active ? "bg-indigo-100 text-indigo-700 font-medium" : "bg-slate-100 text-slate-400 line-through")}>
                      {day}
                    </span>
                  );
                })}
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => openEdit(d)} className="flex-1 text-xs">
                  <Pencil className="w-3 h-3 mr-1" />Editar
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowBlockout(d)} className="flex-1 text-xs">
                  <CalendarOff className="w-3 h-3 mr-1" />Bloqueio
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(d.id)} className="text-red-400 hover:text-red-600 text-xs px-2">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {dentists.length === 0 && (
          <div className="col-span-3 text-center py-12 text-slate-400">
            <User className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p>Nenhum profissional cadastrado</p>
          </div>
        )}
      </div>

      {/* Upcoming blockouts */}
      {blockouts.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Bloqueios de Agenda</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {blockouts.slice(0, 8).map(b => {
                const dentist = dentists.find(d => d.id === b.dentist_id);
                return (
                  <div key={b.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dentist?.color || "#94a3b8" }} />
                      <span className="font-medium">{dentist?.name || b.dentist_name}</span>
                      <span className="text-slate-500">{b.date}</span>
                      {!b.is_full_day && <span className="text-slate-500">{b.start_time}–{b.end_time}</span>}
                      {b.is_full_day && <Badge className="bg-orange-100 text-orange-700 text-xs">Dia inteiro</Badge>}
                    </div>
                    <button onClick={() => deleteBlockoutMutation.mutate(b.id)} className="text-slate-400 hover:text-red-500">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dentist form dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Profissional" : "Novo Profissional"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Nome Completo *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <Label>Especialidade</Label>
                <Select value={form.specialty} onValueChange={v => setForm(f => ({ ...f, specialty: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(SPECIALTIES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>CRO</Label>
                <Input value={form.cro} onChange={e => setForm(f => ({ ...f, cro: e.target.value }))} placeholder="SP-12345" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <Label>Slot padrão (min)</Label>
                <Select value={String(form.slot_duration_minutes)} onValueChange={v => setForm(f => ({ ...f, slot_duration_minutes: parseInt(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[15,20,30,45,60].map(m => <SelectItem key={m} value={String(m)}>{m} min</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cor no calendário</Label>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                      className={cn("w-7 h-7 rounded-full border-2 transition-all", form.color === c ? "border-slate-900 scale-110" : "border-transparent")}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label className="mb-3 block">Horários de Trabalho</Label>
              <div className="space-y-2">
                {DAYS.map((day, i) => {
                  const wh = form.working_hours?.[i] || { active: false, start: "08:00", end: "18:00" };
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex items-center gap-2 w-24">
                        <Switch checked={wh.active} onCheckedChange={v => setDay(i, "active", v)} />
                        <span className={cn("text-sm font-medium", wh.active ? "text-slate-900" : "text-slate-400")}>{day}</span>
                      </div>
                      {wh.active && (
                        <>
                          <Input type="time" value={wh.start} onChange={e => setDay(i, "start", e.target.value)} className="w-32 text-sm" />
                          <span className="text-slate-400 text-sm">até</span>
                          <Input type="time" value={wh.end} onChange={e => setDay(i, "end", e.target.value)} className="w-32 text-sm" />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              <Label>Profissional ativo</Label>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancelar</Button>
              <Button onClick={handleSave} className="flex-1 bg-indigo-600 hover:bg-indigo-700" disabled={!form.name}>
                {editing ? "Salvar" : "Cadastrar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Blockout dialog */}
      <Dialog open={!!showBlockout} onOpenChange={() => setShowBlockout(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarOff className="w-5 h-5 text-orange-500" />
              Bloquear Agenda — {showBlockout?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Data</Label>
              <Input type="date" value={blockoutForm.date} onChange={e => setBlockoutForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={blockoutForm.is_full_day} onCheckedChange={v => setBlockoutForm(f => ({ ...f, is_full_day: v }))} />
              <Label>Dia inteiro</Label>
            </div>
            {!blockoutForm.is_full_day && (
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Início</Label><Input type="time" value={blockoutForm.start_time} onChange={e => setBlockoutForm(f => ({ ...f, start_time: e.target.value }))} /></div>
                <div><Label>Fim</Label><Input type="time" value={blockoutForm.end_time} onChange={e => setBlockoutForm(f => ({ ...f, end_time: e.target.value }))} /></div>
              </div>
            )}
            <div>
              <Label>Motivo</Label>
              <Select value={blockoutForm.reason} onValueChange={v => setBlockoutForm(f => ({ ...f, reason: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ferias">Férias</SelectItem>
                  <SelectItem value="curso">Curso/Congresso</SelectItem>
                  <SelectItem value="reuniao">Reunião</SelectItem>
                  <SelectItem value="folga">Folga</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowBlockout(null)} className="flex-1">Cancelar</Button>
              <Button
                onClick={() => createBlockoutMutation.mutate({ ...blockoutForm, dentist_id: showBlockout.id, dentist_name: showBlockout.name })}
                disabled={!blockoutForm.date}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                Bloquear
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
