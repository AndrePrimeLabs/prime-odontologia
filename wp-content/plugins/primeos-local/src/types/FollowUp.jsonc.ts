import { createEntity } from './base';
export const FollowUp = createEntity('follow_ups');
{
  "name": "FollowUp",
  "type": "object",
  "properties": {
    "patient_id": {
      "type": "string"
    },
    "patient_name": {
      "type": "string"
    },
    "patient_phone": {
      "type": "string"
    },
    "type": {
      "type": "string",
      "enum": [
        "post_appointment",
        "medication_check",
        "test_results",
        "wellness_check",
        "retention",
        "reactivation"
      ],
      "default": "post_appointment"
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "contacted",
        "scheduled",
        "completed",
        "no_response"
      ],
      "default": "pending"
    },
    "due_date": {
      "type": "string",
      "format": "date"
    },
    "priority": {
      "type": "string",
      "enum": [
        "high",
        "medium",
        "low"
      ],
      "default": "medium"
    },
    "notes": {
      "type": "string"
    },
    "contact_method": {
      "type": "string",
      "enum": [
        "whatsapp",
        "call",
        "email",
        "sms"
      ],
      "default": "whatsapp"
    },
    "message_sent": {
      "type": "string"
    }
  },
  "required": [
    "patient_id",
    "patient_name",
    "type"
  ]
}