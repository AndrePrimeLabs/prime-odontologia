import { createEntity } from './base';
export const CustomerSegment = createEntity('customer_segments');
{
  "name": "CustomerSegment",
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "descricao": {
      "type": "string"
    },
    "icon": {
      "type": "string",
      "default": "\ud83c\udfaf"
    },
    "cor": {
      "type": "string",
      "default": "#6366f1"
    },
    "ativo": {
      "type": "boolean",
      "default": true
    },
    "criterios": {
      "type": "object",
      "properties": {
        "min_appointments": {
          "type": "number",
          "description": "M\u00ednimo de consultas realizadas"
        },
        "max_appointments": {
          "type": "number"
        },
        "min_total_spent": {
          "type": "number",
          "description": "Valor total gasto m\u00ednimo (R$)"
        },
        "max_total_spent": {
          "type": "number"
        },
        "min_days_since_last_visit": {
          "type": "number",
          "description": "M\u00ednimo de dias desde \u00faltima visita"
        },
        "max_days_since_last_visit": {
          "type": "number"
        },
        "tags": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Tags que o paciente deve ter (qualquer uma)"
        },
        "status": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Status do paciente (active, inactive, lead...)"
        },
        "service_types": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Tipos de servi\u00e7o utilizados"
        },
        "min_lifetime_value": {
          "type": "number"
        },
        "city": {
          "type": "string"
        },
        "has_phone": {
          "type": "boolean"
        },
        "has_email": {
          "type": "boolean"
        }
      }
    },
    "actions": {
      "type": "array",
      "description": "A\u00e7\u00f5es sugeridas para este segmento",
      "items": {
        "type": "object",
        "properties": {
          "label": {
            "type": "string"
          },
          "description": {
            "type": "string"
          },
          "type": {
            "type": "string",
            "enum": [
              "reactivation",
              "loyalty",
              "upsell",
              "referral",
              "reminder",
              "educational",
              "offer",
              "followup"
            ]
          },
          "channels": {
            "type": "array",
            "items": {
              "type": "string",
              "enum": [
                "email",
                "whatsapp",
                "sms",
                "call"
              ]
            }
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
          "message_template": {
            "type": "string"
          }
        }
      }
    },
    "ai_generated": {
      "type": "boolean",
      "default": false
    },
    "ai_rationale": {
      "type": "string",
      "description": "Justificativa da IA para este segmento"
    },
    "estimated_revenue_impact": {
      "type": "string"
    },
    "total_leads": {
      "type": "number",
      "default": 0
    }
  },
  "required": [
    "name"
  ]
}