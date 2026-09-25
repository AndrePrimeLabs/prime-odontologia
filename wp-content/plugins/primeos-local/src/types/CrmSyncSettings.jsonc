import { createEntity } from './base';
export const CrmSyncSettings = createEntity('crm_sync_settings');
{
  "name": "CRMSyncSettings",
  "type": "object",
  "properties": {
    "user_email": {
      "type": "string",
      "description": "Email do usu\u00e1rio"
    },
    "google_calendar_enabled": {
      "type": "boolean",
      "default": true
    },
    "sync_appointment_types": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "default": [
        "follow_up",
        "meeting",
        "call",
        "demo",
        "presentation",
        "negotiation",
        "closing"
      ],
      "description": "Tipos de agendamentos a serem sincronizados"
    },
    "default_reminder_minutes": {
      "type": "number",
      "default": 60
    },
    "auto_sync_on_create": {
      "type": "boolean",
      "default": true,
      "description": "Sincronizar automaticamente ao criar agendamento"
    },
    "auto_sync_on_update": {
      "type": "boolean",
      "default": true,
      "description": "Sincronizar automaticamente ao atualizar agendamento"
    },
    "calendar_id": {
      "type": "string",
      "default": "primary",
      "description": "ID do calend\u00e1rio do Google"
    }
  },
  "required": [
    "user_email"
  ]
}