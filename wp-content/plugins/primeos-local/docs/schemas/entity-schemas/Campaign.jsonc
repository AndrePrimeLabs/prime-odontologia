import { createEntity } from './base';
export const Campaign = createEntity('campaigns');
{
  "name": "Campaign",
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "oferta": {
      "type": "string",
      "enum": [
        "invisalign",
        "ortodontia",
        "limpeza",
        "clareamento",
        "implante",
        "protese",
        "estetica",
        "checkup"
      ],
      "default": "invisalign"
    },
    "canal_principal_id": {
      "type": "string"
    },
    "estrategia_id": {
      "type": "string"
    },
    "whatsapp_flow": {
      "type": "string",
      "description": "Fluxo de mensagens WhatsApp"
    },
    "landing_page": {
      "type": "string"
    },
    "status": {
      "type": "string",
      "enum": [
        "planejamento",
        "ativa",
        "pausada",
        "encerrada"
      ],
      "default": "planejamento"
    },
    "orcamento": {
      "type": "number",
      "default": 0
    },
    "data_inicio": {
      "type": "string",
      "format": "date"
    },
    "data_fim": {
      "type": "string",
      "format": "date"
    },
    "meta_leads": {
      "type": "number"
    },
    "meta_conversao": {
      "type": "number"
    }
  },
  "required": [
    "name"
  ]
}