import { createEntity } from './base';
export const EmailSequence = createEntity('email_sequences');
{
  "name": "EmailSequence",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Nome da sequ\u00eancia"
    },
    "description": {
      "type": "string"
    },
    "target_segment": {
      "type": "string",
      "description": "Segmento alvo"
    },
    "status": {
      "type": "string",
      "enum": [
        "active",
        "paused",
        "draft"
      ],
      "default": "draft"
    },
    "emails": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "subject": {
            "type": "string"
          },
          "body": {
            "type": "string"
          },
          "delay_days": {
            "type": "number",
            "description": "Dias ap\u00f3s o email anterior"
          },
          "order": {
            "type": "number"
          }
        }
      }
    },
    "trigger_event": {
      "type": "string",
      "enum": [
        "lead_created",
        "manual",
        "status_change"
      ],
      "default": "manual"
    },
    "total_sent": {
      "type": "number",
      "default": 0
    },
    "total_opened": {
      "type": "number",
      "default": 0
    },
    "total_clicked": {
      "type": "number",
      "default": 0
    }
  },
  "required": [
    "name"
  ]
}