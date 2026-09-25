import { createEntity } from './base';
export const FinancialGoal = createEntity('financial_goals');
{
  "name": "FinancialGoal",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Nome da meta"
    },
    "type": {
      "type": "string",
      "enum": [
        "economia",
        "investimento",
        "receita_minima",
        "reducao_despesa",
        "reserva_emergencia",
        "pagamento_divida",
        "outro"
      ],
      "description": "Tipo de meta"
    },
    "target_amount": {
      "type": "number",
      "description": "Valor alvo da meta"
    },
    "current_amount": {
      "type": "number",
      "default": 0,
      "description": "Valor atual acumulado"
    },
    "deadline": {
      "type": "string",
      "format": "date",
      "description": "Data limite"
    },
    "start_date": {
      "type": "string",
      "format": "date",
      "description": "Data de in\u00edcio"
    },
    "status": {
      "type": "string",
      "enum": [
        "em_andamento",
        "concluida",
        "atrasada",
        "cancelada"
      ],
      "default": "em_andamento"
    },
    "description": {
      "type": "string"
    },
    "auto_track_category": {
      "type": "string",
      "description": "Categoria de transa\u00e7\u00e3o para rastrear automaticamente"
    },
    "auto_track_type": {
      "type": "string",
      "enum": [
        "receita",
        "despesa"
      ]
    },
    "monthly_contribution": {
      "type": "number",
      "description": "Contribui\u00e7\u00e3o mensal planejada"
    },
    "color": {
      "type": "string",
      "default": "#6366f1"
    }
  },
  "required": [
    "name",
    "type",
    "target_amount"
  ]
}