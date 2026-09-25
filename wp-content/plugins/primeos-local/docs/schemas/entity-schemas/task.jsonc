{
import { createEntity } from './base';
export const Task = createEntity('tasks');
  "name": "Task",
  "type": "object",
  "properties": {
    "titulo": {
      "type": "string",
      "description": "T\u00edtulo da tarefa"
    },
    "descricao": {
      "type": "string",
      "description": "Descri\u00e7\u00e3o detalhada"
    },
    "pop_id": {
      "type": "string",
      "description": "ID do POP relacionado"
    },
    "pop_codigo": {
      "type": "string",
      "description": "C\u00f3digo do POP (ex: POP 01)"
    },
    "responsaveis": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Lista de respons\u00e1veis pela execu\u00e7\u00e3o"
    },
    "categoria": {
      "type": "string",
      "enum": [
        "operacional",
        "clinico",
        "administrativo",
        "marketing",
        "qualidade",
        "gestao"
      ],
      "description": "Categoria da tarefa"
    },
    "prioridade": {
      "type": "string",
      "enum": [
        "baixa",
        "media",
        "alta",
        "critica"
      ],
      "default": "media"
    },
    "status": {
      "type": "string",
      "enum": [
        "pendente",
        "em_andamento",
        "concluida",
        "atrasada",
        "cancelada"
      ],
      "default": "pendente"
    },
    "data_vencimento": {
      "type": "string",
      "format": "date-time",
      "description": "Data e hora de vencimento"
    },
    "data_conclusao": {
      "type": "string",
      "format": "date-time",
      "description": "Data e hora de conclus\u00e3o"
    },
    "progresso": {
      "type": "number",
      "default": 0,
      "description": "Progresso 0-100"
    },
    "subtarefas": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "titulo": {
            "type": "string"
          },
          "concluida": {
            "type": "boolean",
            "default": false
          },
          "responsavel": {
            "type": "string"
          },
          "data_vencimento": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "description": "Subtarefas relacionadas"
    },
    "recorrente": {
      "type": "boolean",
      "default": false,
      "description": "Se a tarefa \u00e9 recorrente"
    },
    "frequencia_recorrencia": {
      "type": "string",
      "enum": [
        "diaria",
        "semanal",
        "quinzenal",
        "mensal",
        "trimestral",
        "anual"
      ],
      "description": "Frequ\u00eancia de recorr\u00eancia"
    },
    "template_id": {
      "type": "string",
      "description": "ID do template de tarefa recorrente"
    },
    "proxima_ocorrencia": {
      "type": "string",
      "format": "date-time",
      "description": "Data da pr\u00f3xima ocorr\u00eancia"
    },
    "tarefa_pai_id": {
      "type": "string",
      "description": "ID da tarefa recorrente original"
    },
    "checklist": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "item": {
            "type": "string"
          },
          "concluido": {
            "type": "boolean",
            "default": false
          }
        }
      },
      "description": "Checklist de itens da tarefa"
    },
    "notificacao_enviada": {
      "type": "boolean",
      "default": false
    },
    "observacoes": {
      "type": "string"
    }
  },
  "required": [
    "titulo",
    "data_vencimento"
  ]
}