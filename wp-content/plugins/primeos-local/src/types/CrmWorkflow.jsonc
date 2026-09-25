import { createEntity } from './base';
export const CrmWorkflow = createEntity('crm_workflows');
{
  "name": "CRMWorkflow",
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "descricao": {
      "type": "string"
    },
    "gatilho": {
      "type": "string",
      "enum": [
        "lead_novo",
        "sem_resposta_24h",
        "sem_resposta_48h",
        "agendamento_confirmado",
        "nao_compareceu",
        "orcamento_enviado",
        "lead_frio",
        "lead_quente",
        "aniversario",
        "reativacao"
      ],
      "default": "lead_novo"
    },
    "canal": {
      "type": "string",
      "enum": [
        "whatsapp",
        "instagram",
        "facebook",
        "email",
        "todos"
      ],
      "default": "whatsapp"
    },
    "segmento_alvo": {
      "type": "string",
      "enum": [
        "todos",
        "vip",
        "premium",
        "standard",
        "cold",
        "reativacao"
      ],
      "default": "todos"
    },
    "etapas": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "ordem": {
            "type": "number"
          },
          "tipo": {
            "type": "string"
          },
          "mensagem": {
            "type": "string"
          },
          "delay_horas": {
            "type": "number"
          },
          "condicao": {
            "type": "string"
          }
        }
      }
    },
    "ativo": {
      "type": "boolean",
      "default": true
    },
    "leads_impactados": {
      "type": "number",
      "default": 0
    },
    "taxa_conversao": {
      "type": "number",
      "default": 0
    }
  },
  "required": [
    "name",
    "gatilho"
  ]
}