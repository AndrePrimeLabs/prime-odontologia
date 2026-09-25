import { createEntity } from './base';
export const Channel = createEntity('channels');
{
  "name": "Channel",
  "type": "object",
  "properties": {
    "patient_id": {
      "type": "string"
    },
    "patient_name": {
      "type": "string"
    },
    "platform": {
      "type": "string",
      "enum": [
        "whatsapp",
        "instagram",
        "facebook",
        "website",
        "telefone"
      ],
      "default": "whatsapp"
    },
    "contact_id": {
      "type": "string",
      "description": "ID do contato na plataforma"
    },
    "last_message": {
      "type": "string"
    },
    "last_message_date": {
      "type": "string",
      "format": "date-time"
    },
    "status": {
      "type": "string",
      "enum": [
        "ativo",
        "aguardando",
        "resolvido",
        "arquivado"
      ],
      "default": "ativo"
    },
    "assigned_to": {
      "type": "string"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  },
  "required": [
    "patient_name",
    "platform"
  ]
}