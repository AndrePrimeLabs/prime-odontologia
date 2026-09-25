import { createEntity } from './base';
export const KnowledgeBase = createEntity('knowledge_bases');
{
  "name": "KnowledgeBase",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "T\u00edtulo do artigo"
    },
    "content": {
      "type": "string",
      "description": "Conte\u00fado do artigo"
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
      "description": "Categoria do artigo"
    },
    "keywords": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Palavras-chave para busca"
    },
    "faq": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "question": {
            "type": "string"
          },
          "answer": {
            "type": "string"
          }
        }
      },
      "description": "Perguntas frequentes do artigo"
    },
    "is_active": {
      "type": "boolean",
      "default": true
    },
    "views": {
      "type": "number",
      "default": 0
    }
  },
  "required": [
    "title",
    "content",
    "category"
  ]
}