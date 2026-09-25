import { createEntity } from './base';
export const AutomationWorkflow = createEntity('automation_workflows');
{
  "name": "AutomationWorkflow",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Nome do fluxo de automa\u00e7\u00e3o"
    },
    "description": {
      "type": "string",
      "description": "Descri\u00e7\u00e3o do fluxo"
    },
    "type": {
      "type": "string",
      "enum": [
        "lead_nurture",
        "customer_engagement",
        "re_engagement",
        "upsell"
      ],
      "description": "Tipo de fluxo de automa\u00e7\u00e3o"
    },
    "trigger": {
      "type": "object",
      "properties": {
        "event_type": {
          "type": "string",
          "enum": [
            "lead_created",
            "email_opened",
            "link_clicked",
            "page_visited",
            "days_since_interaction",
            "purchase_made",
            "custom"
          ]
        },
        "condition": {
          "type": "string"
        },
        "wait_days": {
          "type": "number",
          "description": "Dias de espera para o gatilho ativar"
        }
      },
      "required": [
        "event_type"
      ]
    },
    "steps": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "step_id": {
            "type": "string"
          },
          "action_type": {
            "type": "string",
            "enum": [
              "send_email",
              "send_sms",
              "update_segment",
              "create_task",
              "send_notification",
              "delay"
            ]
          },
          "delay_days": {
            "type": "number"
          },
          "email_template": {
            "type": "string"
          },
          "content": {
            "type": "string"
          },
          "segment_criteria": {
            "type": "object"
          }
        }
      },
      "description": "Etapas do fluxo automatizado"
    },
    "segments": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Segmentos aplic\u00e1veis"
    },
    "is_active": {
      "type": "boolean",
      "default": true
    },
    "contacts_enrolled": {
      "type": "number",
      "default": 0
    },
    "success_rate": {
      "type": "number",
      "description": "Taxa de sucesso (%)"
    }
  },
  "required": [
    "name",
    "type",
    "trigger"
  ]
}