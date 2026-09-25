// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Send, Users } from "lucide-react";
import { toast } from "sonner";

export default function SegmentCampaign({ segment, customers, leads, onClose }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const matchesSegment = (contact) => {
    const { criterios } = segment;
    if (!criterios) return false;

    const score = contact.score || 0;
    if (criterios.score_min && score < criterios.score_min) return false;
    if (criterios.score_max && score > criterios.score_max) return false;

    if (criterios.interacoes_min && (contact.total_interactions || 0) < criterios.interacoes_min)
      return false;

    const value = contact.lifetime_value || contact.estimated_value || 0;
    if (criterios.valor_min && value < criterios.valor_min) return false;

    if (criterios.dias_sem_contato && contact.last_contact_date) {
      const daysSince = Math.floor(
        (new Date() - new Date(contact.last_contact_date)) / (1000 * 60 * 60 * 24)
      );
      if (daysSince < criterios.dias_sem_contato) return false;
    }

    if (
      criterios.canal_preferido &&
      contact.preferred_channel !== criterios.canal_preferido
    )
      return false;

    if (
      criterios.interesse?.length > 0 &&
      !criterios.interesse.some((i) => contact.interest?.includes(i))
    ) {
      return false;
    }

    return true;
  };

  const allContacts = [...customers, ...leads];
  const matchingContacts = allContacts.filter(matchesSegment).filter((c) => c.email);

  const handleSend = async () => {
    if (!subject || !message) {
      toast.error("Preencha assunto e mensagem");
      return;
    }

    setSending(true);
    try {
      let sent = 0;
      for (const contact of matchingContacts) {
        try {
          await primeos.integrations.Core.SendEmail({
            to: contact.email,
            subject: subject,
            body: message.replace("{nome}", contact.name || "Cliente"),
          });
          sent++;
        } catch (error) {
          console.error("Error sending to", contact.email, error);
        }
      }

      toast.success(`Campanha enviada para ${sent} contatos!`);
      onClose();
    } catch (error) {
      toast.error("Erro ao enviar campanha: " + error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-green-600" />
            Campanha de Email - {segment.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Destinatários</p>
                    <p className="text-2xl font-bold text-green-600">
                      {matchingContacts.length}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-white">
                  {matchingContacts.length} emails válidos
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div>
            <Label>Assunto do Email *</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex: Oferta Especial para Você"
            />
          </div>

          <div>
            <Label>Mensagem *</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escreva sua mensagem aqui... Use {nome} para personalizar com o nome do contato."
              rows={8}
            />
            <p className="text-xs text-slate-500 mt-1">
              Dica: Use {"{nome}"} na mensagem para personalizar
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleSend}
              disabled={sending || !subject || !message}
              className="bg-green-600 hover:bg-green-700 gap-2"
            >
              {sending ? (
                "Enviando..."
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar Campanha
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
