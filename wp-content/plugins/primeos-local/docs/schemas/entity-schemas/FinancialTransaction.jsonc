import { createEntity } from './base';
export const FinancialTransaction = createEntity('financial_transactions');
{
  "name": "FinancialTransaction",
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "enum": [
        "receita",
        "despesa"
      ],
      "description": "Tipo de transa\u00e7\u00e3o"
    },
    "category": {
      "type": "string",
      "enum": [
        "consulta",
        "procedimento",
        "material",
        "equipamento",
        "aluguel",
        "condominio",
        "luz",
        "internet",
        "salario",
        "marketing",
        "impostos",
        "outros_receita",
        "outros_despesa"
      ],
      "description": "Categoria da transa\u00e7\u00e3o"
    },
    "description": {
      "type": "string",
      "description": "Descri\u00e7\u00e3o da transa\u00e7\u00e3o"
    },
    "amount": {
      "type": "number",
      "description": "Valor total em R$"
    },
    "amount_paid": {
      "type": "number",
      "default": 0,
      "description": "Valor j\u00e1 pago (para pagamentos parciais)"
    },
    "date": {
      "type": "string",
      "format": "date",
      "description": "Data da transa\u00e7\u00e3o"
    },
    "due_date": {
      "type": "string",
      "format": "date",
      "description": "Data de vencimento"
    },
    "scheduled_payment_date": {
      "type": "string",
      "format": "date",
      "description": "Data agendada para pagamento"
    },
    "status": {
      "type": "string",
      "enum": [
        "pago",
        "pendente",
        "vencido",
        "cancelado",
        "parcial"
      ],
      "default": "pendente"
    },
    "payment_method": {
      "type": "string",
      "enum": [
        "dinheiro",
        "pix",
        "cartao_credito",
        "cartao_debito",
        "boleto",
        "transferencia",
        "outro"
      ],
      "default": "pix"
    },
    "patient_name": {
      "type": "string",
      "description": "Nome do paciente (para receitas)"
    },
    "patient_id": {
      "type": "string"
    },
    "patient_email": {
      "type": "string",
      "description": "Email do paciente para envio de cobran\u00e7a"
    },
    "supplier": {
      "type": "string",
      "description": "Fornecedor (para despesas)"
    },
    "invoice_number": {
      "type": "string",
      "description": "N\u00famero da nota fiscal"
    },
    "invoice_url": {
      "type": "string",
      "description": "URL da nota fiscal"
    },
    "bank_statement_ref": {
      "type": "string",
      "description": "Refer\u00eancia do extrato banc\u00e1rio"
    },
    "notes": {
      "type": "string"
    },
    "is_recurring": {
      "type": "boolean",
      "default": false
    },
    "recurrence_period": {
      "type": "string",
      "enum": [
        "mensal",
        "trimestral",
        "anual"
      ]
    },
    "recurrence_day": {
      "type": "number",
      "description": "Dia do m\u00eas para vencimento recorrente"
    },
    "partial_payments": {
      "type": "array",
      "description": "Hist\u00f3rico de pagamentos parciais",
      "items": {
        "type": "object",
        "properties": {
          "amount": {
            "type": "number"
          },
          "date": {
            "type": "string"
          },
          "method": {
            "type": "string"
          },
          "notes": {
            "type": "string"
          }
        }
      }
    },
    "boleto_id": {
      "type": "string"
    },
    "boleto_url": {
      "type": "string"
    },
    "boleto_barcode": {
      "type": "string"
    },
    "boleto_status": {
      "type": "string",
      "enum": [
        "nao_gerado",
        "gerado",
        "pago",
        "expirado",
        "cancelado"
      ],
      "default": "nao_gerado"
    },
    "boleto_generated_at": {
      "type": "string",
      "format": "date-time"
    },
    "boleto_paid_at": {
      "type": "string",
      "format": "date-time"
    },
    "reminder_sent_at": {
      "type": "string",
      "format": "date-time"
    },
    "reminder_count": {
      "type": "number",
      "default": 0
    },
    "stripe_payment_link": {
      "type": "string",
      "description": "Link Stripe para pagamento online"
    },
    "stripe_session_id": {
      "type": "string"
    }
  },
  "required": [
    "type",
    "category",
    "description",
    "amount",
    "date"
  ]
}