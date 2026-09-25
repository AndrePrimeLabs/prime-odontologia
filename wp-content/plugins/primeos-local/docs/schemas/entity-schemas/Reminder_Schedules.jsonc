import { createEntity } from './base';
export const ReminderSchedule = createEntity('reminder_schedules');
{
  "name": "ReminderSchedule",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Nome da regra de lembrete"
    },
    "is_active": {
      "type": "boolean",
      "default": true
    },
    "hours_before": {
      "type": "number",
      "description": "Quantas horas antes da consulta enviar o lembrete"
    },
    "channels": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": [
          "email",
          "whatsapp"
        ]
      },
      "description": "Canais de envio"
    },
    "applies_to_segments": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Tags ou segmentos de pacientes (vazio = todos)"
    },
    "applies_to_services": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Tipos de servi\u00e7o (vazio = todos)"
    },
    "email_subject": {
      "type": "string",
      "description": "Assunto do email"
    },
    "email_body": {
      "type": "string",
      "description": "Corpo do email em HTML (use {{nome}}, {{data}}, {{hora}}, {{servico}}, {{profissional}})"
    },
    "whatsapp_message": {
      "type": "string",
      "description": "Mensagem WhatsApp (use {{nome}}, {{data}}, {{hora}}, {{servico}}, {{profissional}})"
    },
    "last_run_at": {
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
    "hours_before",
    "channels"
  ]
}