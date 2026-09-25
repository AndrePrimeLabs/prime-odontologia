import { createEntity } from './base';
export const LeadInteraction = createEntity('lead_interactions');
{
  "name": "LeadInteraction",
  "type": "object",
  "properties": {
    "lead_id": {
      "type": "string"
    },
    "tipo": {
      "type": "string",
      "enum": [
        "mensagem_enviada",
        "mensagem_recebida",
        "ligacao",
        "email",
        "agendamento",
        "compareceu",
        "nao_compareceu",
        "orcamento_enviado",
        "orcamento_aceito",
        "pagamento",
        "indicacao"
      ],
      "default": "mensagem_recebida"
    },
    "canal": {
      "type": "string",
      "enum": [
        "whatsapp",
        "instagram",
        "facebook",
        "telefone",
        "email",
        "presencial"
      ],
      "default": "whatsapp"
    },
    "conteudo": {
      "type": "string"
    },
    "pontos": {
      "type": "number",
      "default": 0,
      "description": "Pontos de score gerados por esta intera\u00e7\u00e3o"
    },
    "automatico": {
      "type": "boolean",
      "default": false
    },
    "workflow_id": {
      "type": "string"
    }
  },
  "required": [
    "lead_id",
    "tipo"
  ]
}