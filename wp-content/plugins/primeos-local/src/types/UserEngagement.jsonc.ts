import { createEntity } from './base';
export const UserEngagement = createEntity('user_engagements');
{
  "name": "UserEngagement",
  "type": "object",
  "properties": {
    "user_email": {
      "type": "string",
      "description": "Email do usu\u00e1rio"
    },
    "event_type": {
      "type": "string",
      "enum": [
        "page_view",
        "feature_use",
        "session_start",
        "session_end",
        "action_completed",
        "conversion"
      ],
      "description": "Tipo de evento"
    },
    "feature_name": {
      "type": "string",
      "description": "Nome da feature/p\u00e1gina acessada"
    },
    "session_id": {
      "type": "string",
      "description": "ID da sess\u00e3o"
    },
    "duration_seconds": {
      "type": "number",
      "description": "Dura\u00e7\u00e3o em segundos"
    },
    "metadata": {
      "type": "object",
      "description": "Dados adicionais do evento"
    },
    "conversion_step": {
      "type": "string",
      "description": "Etapa do funil de convers\u00e3o"
    }
  },
  "required": [
    "user_email",
    "event_type"
  ]
}