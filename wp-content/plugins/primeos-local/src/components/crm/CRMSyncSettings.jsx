// @ts-nocheck
import { useState, useEffect } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Settings, Save, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const appointmentTypes = [
  { value: "follow_up", label: "Follow-up" },
  { value: "meeting", label: "Reunião" },
  { value: "call", label: "Ligação" },
  { value: "demo", label: "Demonstração" },
  { value: "presentation", label: "Apresentação" },
  { value: "negotiation", label: "Negociação" },
  { value: "closing", label: "Fechamento" },
  { value: "onboarding", label: "Onboarding" },
];

export default function CRMSyncSettings() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState({
    google_calendar_enabled: true,
    sync_appointment_types: ["follow_up", "meeting", "call", "demo", "presentation", "negotiation", "closing"],
    default_reminder_minutes: 60,
    auto_sync_on_create: true,
    auto_sync_on_update: true,
    calendar_id: "primary",
  });

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => primeos.auth.me(),
  });

  const { data: existingSettings } = useQuery({
    queryKey: ["crm-sync-settings", user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const result = await primeos.entities.CRMSyncSettings.filter({ user_email: user.email });
      return result[0] || null;
    },
    enabled: !!user?.email,
  });

  useEffect(() => {
    if (existingSettings) {
      setSettings(existingSettings);
    }
  }, [existingSettings]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (existingSettings) {
        return primeos.entities.CRMSyncSettings.update(existingSettings.id, data);
      } else {
        return primeos.entities.CRMSyncSettings.create({ ...data, user_email: user.email });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-sync-settings"] });
      toast.success("Configurações salvas com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao salvar configurações: " + error.message);
    },
  });

  const handleToggleType = (type) => {
    setSettings((prev) => {
      const types = prev.sync_appointment_types || [];
      if (types.includes(type)) {
        return { ...prev, sync_appointment_types: types.filter((t) => t !== type) };
      } else {
        return { ...prev, sync_appointment_types: [...types, type] };
      }
    });
  };

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">Configurações de Sincronização</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Google Calendar</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Enable/Disable Sync */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-semibold">Sincronização com Google Calendar</Label>
            <p className="text-sm text-slate-500">Ativar/desativar sincronização automática</p>
          </div>
          <Switch
            checked={settings.google_calendar_enabled}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, google_calendar_enabled: checked })
            }
          />
        </div>

        {settings.google_calendar_enabled && (
          <>
            {/* Auto Sync Options */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-slate-900">Sincronização Automática</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Ao criar agendamento</Label>
                  <p className="text-sm text-slate-500">Criar evento automaticamente no Google Calendar</p>
                </div>
                <Switch
                  checked={settings.auto_sync_on_create}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, auto_sync_on_create: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Ao atualizar agendamento</Label>
                  <p className="text-sm text-slate-500">Atualizar evento automaticamente no Google Calendar</p>
                </div>
                <Switch
                  checked={settings.auto_sync_on_update}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, auto_sync_on_update: checked })
                  }
                />
              </div>
            </div>

            {/* Appointment Types to Sync */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-slate-900">Tipos de Agendamento</h3>
              <p className="text-sm text-slate-500">Selecione quais tipos devem ser sincronizados</p>
              <div className="flex flex-wrap gap-2">
                {appointmentTypes.map((type) => (
                  <Badge
                    key={type.value}
                    className={`cursor-pointer transition-colors ${
                      settings.sync_appointment_types?.includes(type.value)
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                    onClick={() => handleToggleType(type.value)}
                  >
                    {settings.sync_appointment_types?.includes(type.value) && (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    )}
                    {type.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Default Reminder */}
            <div className="pt-4 border-t">
              <Label className="text-base font-semibold">Lembrete Padrão</Label>
              <p className="text-sm text-slate-500 mb-3">Tempo antes do evento para enviar lembrete</p>
              <Select
                value={settings.default_reminder_minutes?.toString()}
                onValueChange={(value) =>
                  setSettings({ ...settings, default_reminder_minutes: parseInt(value) })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="120">2 horas</SelectItem>
                  <SelectItem value="1440">1 dia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
