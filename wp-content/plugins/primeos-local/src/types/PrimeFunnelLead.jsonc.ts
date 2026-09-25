import { createEntity } from './base';
export const PrimeFunnelLead = createEntity('prime_funnel_leads');
{
  "name": "PrimeFunnelLead",
  "type": "object",
  "properties": {
    "nome": {
      "type": "string"
    },
    "lead_source": {
      "type": "string",
      "enum": [
        "instagram",
        "whatsapp",
        "google",
        "indicacao",
        "trafego_pago",
        "outro"
      ],
      "default": "instagram"
    },
    "data_entrada": {
      "type": "string",
      "format": "date"
    },
    "status": {
      "type": "string",
      "enum": [
        "lead",
        "contato",
        "avaliacao_marcada",
        "compareceu",
        "proposta_enviada",
        "fechado",
        "perdido"
      ],
      "default": "lead"
    },
    "ticket_estimado": {
      "type": "number"
    },
    "procedimento": {
      "type": "string"
    },
    "motivo_perda": {
      "type": "string"
    },
    "telefone": {
      "type": "string"
    },
    "email": {
      "type": "string"
    },
    "notas": {
      "type": "string"
    }
  },
  "required": [
    "nome"
  ]
}