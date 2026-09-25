// @ts-nocheck
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Save, User, MapPin, Heart, Phone } from "lucide-react";

export default function PatientFormExpanded({ patient, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState({
    patient_name: "",
    patient_email: "",
    patient_phone: "",
    date_of_birth: "",
    gender: "",
    cpf: "",
    rg: "",
    marital_status: "",
    occupation: "",
    blood_type: "Não informado",
    status: "ativo",
    how_did_you_hear: "",
    notes: "",
    address: { street: "", number: "", complement: "", neighborhood: "", city: "", state: "", zip_code: "" },
    emergency_contact: { name: "", relationship: "", phone: "" },
    insurance_info: { has_insurance: false, provider: "", policy_number: "", coverage_percentage: "" },
  });

  useEffect(() => {
    if (patient) {
      setFormData({
        patient_name: patient.patient_name || "",
        patient_email: patient.patient_email || "",
        patient_phone: patient.patient_phone || "",
        date_of_birth: patient.date_of_birth || "",
        gender: patient.gender || "",
        cpf: patient.cpf || "",
        rg: patient.rg || "",
        marital_status: patient.marital_status || "",
        occupation: patient.occupation || "",
        blood_type: patient.blood_type || "Não informado",
        status: patient.status || "ativo",
        how_did_you_hear: patient.how_did_you_hear || "",
        notes: patient.notes || "",
        address: patient.address || { street: "", number: "", complement: "", neighborhood: "", city: "", state: "", zip_code: "" },
        emergency_contact: patient.emergency_contact || { name: "", relationship: "", phone: "" },
        insurance_info: patient.insurance_info || { has_insurance: false, provider: "", policy_number: "", coverage_percentage: "" },
      });
    }
  }, [patient]);

  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const setNested = (parent, field, value) => setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [field]: value } }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-xl">{patient ? "Editar Paciente" : "Novo Paciente"}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}><X className="w-5 h-5" /></Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="pessoal" className="w-full">
            <TabsList className="grid grid-cols-4 w-full mb-6">
              <TabsTrigger value="pessoal" className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Pessoal</TabsTrigger>
              <TabsTrigger value="endereco" className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />Endereço</TabsTrigger>
              <TabsTrigger value="emergencia" className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />Emergência</TabsTrigger>
              <TabsTrigger value="plano" className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" />Plano</TabsTrigger>
            </TabsList>

            {/* Dados Pessoais */}
            <TabsContent value="pessoal" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="patient_name">Nome Completo *</Label>
                  <Input id="patient_name" value={formData.patient_name} onChange={e => set("patient_name", e.target.value)} required />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={formData.patient_email} onChange={e => set("patient_email", e.target.value)} />
                </div>
                <div>
                  <Label>Telefone / WhatsApp</Label>
                  <Input value={formData.patient_phone} onChange={e => set("patient_phone", e.target.value)} placeholder="(11) 99999-9999" />
                </div>
                <div>
                  <Label>Data de Nascimento</Label>
                  <Input type="date" value={formData.date_of_birth} onChange={e => set("date_of_birth", e.target.value)} />
                </div>
                <div>
                  <Label>Gênero</Label>
                  <Select value={formData.gender} onValueChange={v => set("gender", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                      <SelectItem value="prefiro_nao_informar">Prefiro não informar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>CPF</Label>
                  <Input value={formData.cpf} onChange={e => set("cpf", e.target.value)} placeholder="000.000.000-00" />
                </div>
                <div>
                  <Label>RG</Label>
                  <Input value={formData.rg} onChange={e => set("rg", e.target.value)} />
                </div>
                <div>
                  <Label>Estado Civil</Label>
                  <Select value={formData.marital_status} onValueChange={v => set("marital_status", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                      <SelectItem value="casado">Casado(a)</SelectItem>
                      <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                      <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                      <SelectItem value="uniao_estavel">União Estável</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Profissão</Label>
                  <Input value={formData.occupation} onChange={e => set("occupation", e.target.value)} />
                </div>
                <div>
                  <Label>Tipo Sanguíneo</Label>
                  <Select value={formData.blood_type} onValueChange={v => set("blood_type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["A+","A-","B+","B-","AB+","AB-","O+","O-","Não informado"].map(bt => (
                        <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={v => set("status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="arquivado">Arquivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Como conheceu a clínica?</Label>
                  <Select value={formData.how_did_you_hear} onValueChange={v => set("how_did_you_hear", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="indicacao">Indicação</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label>Observações</Label>
                  <Textarea value={formData.notes} onChange={e => set("notes", e.target.value)} rows={3} placeholder="Informações adicionais..." />
                </div>
              </div>
            </TabsContent>

            {/* Endereço */}
            <TabsContent value="endereco" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Rua / Avenida</Label>
                  <Input value={formData.address.street} onChange={e => setNested("address", "street", e.target.value)} />
                </div>
                <div>
                  <Label>Número</Label>
                  <Input value={formData.address.number} onChange={e => setNested("address", "number", e.target.value)} />
                </div>
                <div>
                  <Label>Complemento</Label>
                  <Input value={formData.address.complement} onChange={e => setNested("address", "complement", e.target.value)} placeholder="Apto, bloco..." />
                </div>
                <div>
                  <Label>Bairro</Label>
                  <Input value={formData.address.neighborhood} onChange={e => setNested("address", "neighborhood", e.target.value)} />
                </div>
                <div>
                  <Label>CEP</Label>
                  <Input value={formData.address.zip_code} onChange={e => setNested("address", "zip_code", e.target.value)} placeholder="00000-000" />
                </div>
                <div>
                  <Label>Cidade</Label>
                  <Input value={formData.address.city} onChange={e => setNested("address", "city", e.target.value)} />
                </div>
                <div>
                  <Label>Estado</Label>
                  <Input value={formData.address.state} onChange={e => setNested("address", "state", e.target.value)} placeholder="SP" maxLength={2} />
                </div>
              </div>
            </TabsContent>

            {/* Emergência */}
            <TabsContent value="emergencia" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Nome</Label>
                  <Input value={formData.emergency_contact.name} onChange={e => setNested("emergency_contact", "name", e.target.value)} />
                </div>
                <div>
                  <Label>Relação</Label>
                  <Input value={formData.emergency_contact.relationship} onChange={e => setNested("emergency_contact", "relationship", e.target.value)} placeholder="Ex: Mãe, Cônjuge..." />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input value={formData.emergency_contact.phone} onChange={e => setNested("emergency_contact", "phone", e.target.value)} />
                </div>
              </div>
            </TabsContent>

            {/* Plano de Saúde */}
            <TabsContent value="plano" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Possui plano de saúde?</Label>
                  <Select value={formData.insurance_info.has_insurance ? "sim" : "nao"} onValueChange={v => setNested("insurance_info", "has_insurance", v === "sim")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nao">Não</SelectItem>
                      <SelectItem value="sim">Sim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.insurance_info.has_insurance && (
                  <>
                    <div>
                      <Label>Operadora</Label>
                      <Input value={formData.insurance_info.provider} onChange={e => setNested("insurance_info", "provider", e.target.value)} />
                    </div>
                    <div>
                      <Label>Número da Carteirinha</Label>
                      <Input value={formData.insurance_info.policy_number} onChange={e => setNested("insurance_info", "policy_number", e.target.value)} />
                    </div>
                    <div>
                      <Label>Cobertura (%)</Label>
                      <Input type="number" value={formData.insurance_info.coverage_percentage} onChange={e => setNested("insurance_info", "coverage_percentage", e.target.value)} min={0} max={100} />
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Salvando..." : "Salvar Paciente"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
