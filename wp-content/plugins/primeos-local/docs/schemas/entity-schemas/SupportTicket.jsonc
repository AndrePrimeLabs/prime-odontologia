import { createEntity } from './base';
export const SupportTicket = createEntity('support_tickets');
{
  "name": "SupportTicket",
  "type": "object",
  "properties": {
    "ticket_id": {
      "type": "string",
      "description": "ID \u00fanico do ticket"
    },
    "customer_name": {
      "type": "string",
      "description": "Nome do cliente"
    },
    "customer_email": {
      "type": "string",
      "description": "Email do cliente"
    },
    "subject": {
      "type": "string",
      "description": "Assunto do ticket"
    },
    "description": {
      "type": "string",
      "description": "Descri\u00e7\u00e3o detalhada do problema"
    },
    "category": {
      "type": "string",
      "enum": [
        "faturamento",
        "agendamento",
        "procedimentos",
        "pagamento",
        "cancelamento",
        "geral"
      ],
      "description": "Categoria do ticket"
    },
    "priority": {
      "type": "string",
      "enum": [
        "baixa",
        "media",
        "alta",
        "critica"
      ],
      "default": "media",
      "description": "Prioridade do ticket"
    },
    "status": {
      "type": "string",
      "enum": [
        "novo",
        "em_triagem",
        "aberto",
        "em_espera",
        "resolvido",
        "fechado"
      ],
      "default": "novo",
      "description": "Status do ticket"
    },
    "assigned_to": {
      "type": "string",
      "description": "Email do agente respons\u00e1vel"
    },
    "ai_analysis": {
      "type": "object",
      "properties": {
        "sentiment": {
          "type": "string"
        },
        "urgency_score": {
          "type": "number"
        },
        "suggested_category": {
          "type": "string"
        },
        "suggested_responses": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      }
    },
    "conversation": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "author": {
            "type": "string"
          },
          "message": {
            "type": "string"
          },
          "timestamp": {
            "type": "string",
            "format": "date-time"
          }
        }
      }
    },
    "resolution_time_hours": {
      "type": "number",
      "description": "Tempo para resolver em horas"
    }
  },
  "required": [
    "ticket_id",
    "customer_name",
    "subject",
    "description"
  ]
}