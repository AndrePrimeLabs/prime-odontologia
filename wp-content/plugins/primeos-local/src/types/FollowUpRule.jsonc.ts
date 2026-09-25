import { createEntity } from './base';
export const FollowUpRule = createEntity('follow_up_rules');
{
  "name": "FollowUpRule",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Nome da regra"
    },
    "trigger": {
      "type": "string",
      "enum": [
        "appointment_reminder",
        "post_consultation",
        "overdue_payment",
        "inactive_patient"
      ],
      "description": "Tipo de gatilho"
    },
    "is_active": {
      "type": "boolean",
      "default": true
    },
    "channel": {
      "type": "string",
      "enum": [
        "email",
        "whatsapp_link",
        "both"
      ],
      "default": "email"
    },
    "days_offset": {
      "type": "number",
      "description": "Dias antes (negativo) ou depois (positivo) do evento"
    },
    "subject": {
      "type": "string",
      "description": "Assunto do email"
    },
    "message_template": {
      "type": "string",
      "description": "Template da mensagem. Use {nome}, {data}, {hora}, {valor}, {servico}"
    },
    "last_run": {
      "type": "string",
      "format": "date-time"
    },
    "total_sent": {
      "type": "number",
      "default": 0
    }
  },
  "required": [
    "name",
    "trigger",
    "message_template"
  ]
}