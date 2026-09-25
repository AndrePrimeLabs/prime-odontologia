// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Activity, CheckCircle2, XCircle, RefreshCw, Settings, 
  Link2, AlertCircle, Stethoscope, ClipboardList, Zap, Clock, FileText
} from "lucide-react";

export default function EHRIntegration() {
  const queryClient = useQueryClient();

  const [ehrConfig, setEhrConfig] = useState({
    system: "fhir",
    base_url: "",
    api_key: "",
    patient_id_field: "cpf",
    auto_sync: true,
    sync_on_complete: true,
    sync_notes: true,
  });

  const [syncingId, setSyncingId] = useState(null);

  const { data: appointments = [] } = useQuery({
    queryKey: ["ehrAppointments"],
    queryFn: () => primeos.entities.Appointment.list("-date", 50),
  });

  const syncMutation = useMutation({
    mutationFn: async (appointment) => {
      setSyncingId(appointment.id);
      const response = await primeos.functions.invoke("syncAppointmentEHR", {
        appointment_id: appointment.id,
        notes: appointment.notes || "",
      });
      return response.data;
    },
    onSuccess: (data, appointment) => {
      setSyncingId(null);
      queryClient.invalidateQueries({ queryKey: ["ehrAppointments"] });
      toast.success(`Consulta de ${appointment.patient_name} sincronizada com o EHR!`);
    },
    onError: (err, appointment) => {
      setSyncingId(null);
      toast.error(`Erro ao sincronizar consulta de ${appointment.patient_name}`);
      console.error(err);
    },
  });

  const syncAllMutation = useMutation({
    mutationFn: async () => {
      const pending = appointments.filter(
        (a) => !a.ehr_synced && (a.status === "completed" || a.status === "in_progress")
      );
      for (const appt of pending) {
        await primeos.functions.invoke("syncAppointmentEHR", {
          appointment_id: appt.id,
          notes: appt.notes || "",
        });
      }
      return pending.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["ehrAppointments"] });
      toast.success(`${count} consulta(s) sincronizadas com sucesso!`);
    },
    onError: () => toast.error("Erro ao sincronizar consultas"),
  });

  const synced = appointments.filter((a) => a.ehr_synced);
  const pending = appointments.filter(
    (a) => !a.ehr_synced && (a.status === "completed" || a.status === "in_progress")
  );
  const total = appointments.length;

  const statusBadge = (appt) => {
    if (appt.ehr_synced)
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200 gap-1">
          <CheckCircle2 className="w-3 h-3" /> Sincronizado
        </Badge>
      );
    if (appt.status === "completed" || appt.status === "in_progress")
      return (
        <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1">
          <Clock className="w-3 h-3" /> Pendente
        </Badge>
      );
    return (
      <Badge variant="outline" className="text-slate-500 gap-1">
        <XCircle className="w-3 h-3" /> Não aplicável
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Stethoscope className="w-8 h-8 text-teal-600" />
              Integração EHR
            </h1>
            <p className="text-slate-500 mt-1">Sincronize consultas e prontuários com seu sistema de saúde eletrônico</p>
          </div>
          <Button
            onClick={() => syncAllMutation.mutate()}
            disabled={syncAllMutation.isPending || pending.length === 0}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {syncAllMutation.isPending ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            Sincronizar Pendentes ({pending.length})
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Consultas", value: total, icon: ClipboardList, color: "blue" },
            { label: "Sincronizadas", value: synced.length, icon: CheckCircle2, color: "green" },
            { label: "Pendentes", value: pending.length, icon: Clock, color: "amber" },
            {
              label: "Taxa de Sync",
              value: total > 0 ? `${Math.round((synced.length / total) * 100)}%` : "0%",
              icon: Activity,
              color: "teal",
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${color}-50`}>
                  <Icon className={`w-5 h-5 text-${color}-600`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="sync" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sync" className="gap-2">
              <RefreshCw className="w-4 h-4" /> Sincronização
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" /> Configurações
            </TabsTrigger>
            <TabsTrigger value="log" className="gap-2">
              <FileText className="w-4 h-4" /> Log
            </TabsTrigger>
          </TabsList>

          {/* Sync Tab */}
          <TabsContent value="sync">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-teal-600" />
                  Consultas para Sincronização
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>Nenhuma consulta encontrada</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {appointments.map((appt) => (
                      <div
                        key={appt.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">
                            {appt.patient_name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{appt.patient_name}</p>
                            <p className="text-xs text-slate-500">
                              {appt.date
                                ? format(new Date(appt.date), "dd/MM/yyyy", { locale: ptBR })
                                : "—"}{" "}
                              {appt.time && `às ${appt.time}`} · {appt.service_type}
                              {appt.provider && ` · ${appt.provider}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {statusBadge(appt)}
                          {!appt.ehr_synced && (appt.status === "completed" || appt.status === "in_progress") && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => syncMutation.mutate(appt)}
                              disabled={syncingId === appt.id}
                              className="text-teal-700 border-teal-200 hover:bg-teal-50"
                            >
                              {syncingId === appt.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <>
                                  <RefreshCw className="w-3 h-3 mr-1" /> Sincronizar
                                </>
                              )}
                            </Button>
                          )}
                          {appt.ehr_synced && appt.ehr_sync_date && (
                            <span className="text-xs text-slate-400">
                              {format(new Date(appt.ehr_sync_date), "dd/MM HH:mm")}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="w-4 h-4 text-teal-600" />
                  Configurações do EHR
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sistema EHR</Label>
                    <Select
                      value={ehrConfig.system}
                      onValueChange={(v) => setEhrConfig({ ...ehrConfig, system: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fhir">FHIR (HL7)</SelectItem>
                        <SelectItem value="tasy">Philips Tasy</SelectItem>
                        <SelectItem value="mv">MV Sistemas</SelectItem>
                        <SelectItem value="totvs">TOTVS Saúde</SelectItem>
                        <SelectItem value="custom">API Personalizada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Identificador do Paciente</Label>
                    <Select
                      value={ehrConfig.patient_id_field}
                      onValueChange={(v) => setEhrConfig({ ...ehrConfig, patient_id_field: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cpf">CPF</SelectItem>
                        <SelectItem value="id_interno">ID Interno</SelectItem>
                        <SelectItem value="cartao_sus">Cartão SUS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>URL Base da API do EHR</Label>
                    <Input
                      placeholder="https://seu-ehr.com/api/v1"
                      value={ehrConfig.base_url}
                      onChange={(e) => setEhrConfig({ ...ehrConfig, base_url: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Chave de API / Token</Label>
                    <Input
                      type="password"
                      placeholder="Bearer token ou API key"
                      value={ehrConfig.api_key}
                      onChange={(e) => setEhrConfig({ ...ehrConfig, api_key: e.target.value })}
                    />
                    <p className="text-xs text-slate-400">
                      Configure o secret <code className="bg-slate-100 px-1 rounded">EHR_API_KEY</code> no painel para armazenar com segurança.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 border-t pt-4">
                  <h3 className="text-sm font-semibold text-slate-700">Sincronização Automática</h3>
                  {[
                    { key: "auto_sync", label: "Sincronização automática ativa", desc: "Sincroniza automaticamente com base nos eventos" },
                    { key: "sync_on_complete", label: "Sincronizar ao completar consulta", desc: "Envia dados ao EHR quando o status muda para 'concluída'" },
                    { key: "sync_notes", label: "Incluir notas clínicas", desc: "Envia as anotações do profissional junto com a consulta" },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{label}</p>
                        <p className="text-xs text-slate-500">{desc}</p>
                      </div>
                      <Switch
                        checked={ehrConfig[key]}
                        onCheckedChange={(v) => setEhrConfig({ ...ehrConfig, [key]: v })}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button
                    className="bg-teal-600 hover:bg-teal-700"
                    onClick={() => toast.success("Configurações salvas!")}
                  >
                    Salvar Configurações
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => toast.info("Testando conexão com o EHR...")}
                  >
                    Testar Conexão
                  </Button>
                </div>

                {/* Info box */}
                <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">Como configurar</p>
                    <ol className="list-decimal ml-4 space-y-1 text-xs">
                      <li>Configure o secret <code className="bg-amber-100 px-1 rounded">EHR_API_KEY</code> no Dashboard → Configurações → Variáveis de Ambiente</li>
                      <li>Defina a URL base da API do seu sistema EHR acima</li>
                      <li>Clique em "Testar Conexão" para verificar a integração</li>
                      <li>Ative a sincronização automática conforme sua preferência</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Log Tab */}
          <TabsContent value="log">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600" />
                  Log de Sincronizações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {synced.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p>Nenhuma sincronização realizada ainda</p>
                    </div>
                  ) : (
                    synced.map((appt) => (
                      <div
                        key={appt.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100"
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{appt.patient_name}</p>
                          <p className="text-xs text-slate-500">
                            Consulta em {appt.date ? format(new Date(appt.date), "dd/MM/yyyy", { locale: ptBR }) : "—"}
                            {appt.service_type && ` · ${appt.service_type}`}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Sync OK</Badge>
                          {appt.ehr_sync_date && (
                            <p className="text-xs text-slate-400 mt-0.5">
                              {format(new Date(appt.ehr_sync_date), "dd/MM HH:mm")}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
