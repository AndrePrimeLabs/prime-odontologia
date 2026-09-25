import { createEntity } from './base';
export const Interaction = createEntity('interactions');
{
  "name": "Interaction",
  "type": "object",
  "properties": {
    "customer_id": {
      "type": "string",
      "description": "Related customer ID"
    },
    "type": {
      "type": "string",
      "enum": [
        "call",
        "email",
        "meeting",
        "whatsapp",
        "support",
        "demo",
        "follow_up"
      ]
    },
    "subject": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "outcome": {
      "type": "string",
      "enum": [
        "positive",
        "neutral",
        "negative",
        "pending"
      ]
    },
    "next_action": {
      "type": "string"
    },
    "next_action_date": {
      "type": "string",
      "format": "date"
    }
  },
  "required": [
    "customer_id",
    "type",
    "subject"
  ]
}