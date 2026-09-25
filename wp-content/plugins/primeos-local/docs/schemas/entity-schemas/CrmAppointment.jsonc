import { createEntity } from './base';
export const CrmAppointment = createEntity('crm_appointments');
{
  "name": "CRMAppointment",
  "type": "object",
  "properties": {
    "customer_id": {
      "type": "string",
      "description": "ID do cliente ou lead"
    },
    "customer_name": {
      "type": "string"
    },
    "customer_email": {
      "type": "string"
    },
    "customer_phone": {
      "type": "string"
    },
    "title": {
      "type": "string",
      "description": "T\u00edtulo do agendamento"
    },
    "type": {
      "type": "string",
      "enum": [
        "follow_up",
        "meeting",
        "call",
        "demo",
        "presentation",
        "negotiation",
        "closing",
        "onboarding"
      ],
      "default": "follow_up"
    },
    "date": {
      "type": "string",
      "format": "date"
    },
    "time": {
      "type": "string",
      "description": "Hor\u00e1rio no formato HH:MM"
    },
    "duration_minutes": {
      "type": "number",
      "default": 30
    },
    "status": {
      "type": "string",
      "enum": [
        "scheduled",
        "confirmed",
        "completed",
        "cancelled",
        "no_show"
      ],
      "default": "scheduled"
    },
    "location": {
      "type": "string",
      "description": "Local ou link da reuni\u00e3o"
    },
    "description": {
      "type": "string"
    },
    "assigned_to": {
      "type": "string",
      "description": "Respons\u00e1vel pelo agendamento"
    },
    "reminder_sent": {
      "type": "boolean",
      "default": false
    },
    "reminder_time_minutes": {
      "type": "number",
      "default": 60,
      "description": "Minutos antes para enviar lembrete"
    },
    "google_calendar_event_id": {
      "type": "string",
      "description": "ID do evento no Google Calendar"
    },
    "outcome": {
      "type": "string",
      "description": "Resultado do agendamento"
    },
    "next_action": {
      "type": "string"
    },
    "related_lead_id": {
      "type": "string"
    },
    "related_customer_id": {
      "type": "string"
    },
    "priority": {
      "type": "string",
      "enum": [
        "low",
        "medium",
        "high",
        "urgent"
      ],
      "default": "medium"
    }
  },
  "required": [
    "customer_name",
    "title",
    "date",
    "time",
    "type"
  ]
}