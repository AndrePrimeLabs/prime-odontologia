import { createEntity } from './base';
export const ReportSchedule = createEntity('report_schedules');
{
  "name": "ReportSchedule",
  "type": "object",
  "properties": {
    "user_email": {
      "type": "string",
      "description": "Email do usu\u00e1rio que agendou o relat\u00f3rio"
    },
    "report_name": {
      "type": "string",
      "description": "Nome do relat\u00f3rio agendado"
    },
    "report_type": {
      "type": "string",
      "enum": [
        "sales",
        "leads",
        "appointments",
        "revenue",
        "custom"
      ],
      "description": "Tipo de relat\u00f3rio"
    },
    "frequency": {
      "type": "string",
      "enum": [
        "daily",
        "weekly",
        "monthly"
      ],
      "default": "weekly",
      "description": "Frequ\u00eancia do agendamento"
    },
    "day_of_week": {
      "type": "number",
      "description": "Dia da semana (0-6) para relat\u00f3rios semanais"
    },
    "day_of_month": {
      "type": "number",
      "description": "Dia do m\u00eas (1-31) para relat\u00f3rios mensais"
    },
    "time": {
      "type": "string",
      "description": "Hor\u00e1rio de envio (HH:MM)"
    },
    "filters": {
      "type": "object",
      "properties": {
        "category": {
          "type": "string"
        },
        "status": {
          "type": "string"
        },
        "responsible": {
          "type": "string"
        }
      },
      "description": "Filtros aplicados ao relat\u00f3rio"
    },
    "recipients": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Emails dos destinat\u00e1rios"
    },
    "format": {
      "type": "string",
      "enum": [
        "pdf",
        "csv",
        "both"
      ],
      "default": "pdf",
      "description": "Formato de envio"
    },
    "is_active": {
      "type": "boolean",
      "default": true,
      "description": "Se o agendamento est\u00e1 ativo"
    },
    "last_sent": {
      "type": "string",
      "format": "date-time",
      "description": "\u00daltima vez que foi enviado"
    },
    "send_count": {
      "type": "number",
      "default": 0,
      "description": "Quantidade de vezes enviado"
    }
  },
  "required": [
    "user_email",
    "report_name",
    "report_type",
    "frequency"
  ]
}