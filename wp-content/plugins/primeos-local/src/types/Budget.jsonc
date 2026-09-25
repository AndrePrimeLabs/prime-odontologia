import { createEntity } from './base';
export const Budget = createEntity('budgets');
{
  "name": "Budget",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Nome do or\u00e7amento"
    },
    "period": {
      "type": "string",
      "enum": [
        "mensal",
        "trimestral",
        "anual"
      ],
      "default": "mensal"
    },
    "year": {
      "type": "number",
      "description": "Ano"
    },
    "month": {
      "type": "number",
      "description": "M\u00eas (1-12), para or\u00e7amentos mensais"
    },
    "quarter": {
      "type": "number",
      "description": "Trimestre (1-4)"
    },
    "category": {
      "type": "string",
      "enum": [
        "consulta",
        "procedimento",
        "material",
        "equipamento",
        "aluguel",
        "salario",
        "marketing",
        "impostos",
        "outros_receita",
        "outros_despesa",
        "total"
      ]
    },
    "type": {
      "type": "string",
      "enum": [
        "receita",
        "despesa"
      ],
      "default": "despesa"
    },
    "budgeted_amount": {
      "type": "number",
      "description": "Valor or\u00e7ado"
    },
    "alert_threshold": {
      "type": "number",
      "default": 80,
      "description": "% de uso para disparar alerta (padr\u00e3o 80%)"
    },
    "notes": {
      "type": "string"
    }
  },
  "required": [
    "name",
    "period",
    "year",
    "category",
    "type",
    "budgeted_amount"
  ]
}