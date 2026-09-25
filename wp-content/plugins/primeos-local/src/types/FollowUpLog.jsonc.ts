import { createEntity } from './base';
export const FollowUpLog = createEntity('follow_up_logs');
{
  "name": "FollowUpLog",
  "type": "object",
  "properties": {
    "rule_id": {
      "type": "string"
    },
    "rule_name": {
      "type": "string"
    },
    "patient_name": {
      "type": "string"
    },
    "patient_email": {
      "type": "string"
    },
    "patient_phone": {
      "type": "string"
    },
    "trigger": {
      "type": "string"
    },
    "channel": {
      "type": "string"
    },
    "message_sent": {
      "type": "string"
    },
    "status": {
      "type": "string",
      "enum": [
        "sent",
        "failed",
        "skipped"
      ],
      "default": "sent"
    },
    "error": {
      "type": "string"
    },
    "reference_id": {
      "type": "string",
      "description": "ID do agendamento ou transa\u00e7\u00e3o que originou o envio"
    }
  },
  "required": [
    "rule_name",
    "patient_name",
    "trigger",
    "status"
  ]
}