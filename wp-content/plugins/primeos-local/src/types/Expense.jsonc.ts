import { createEntity } from './base';
export const Expense = createEntity('expenses');
{
  "name": "Expense",
  "type": "object",
  "properties": {
    "title": {
      "type": "string"
    },
    "category": {
      "type": "string",
      "enum": [
        "fixed_costs",
        "variable_costs",
        "salaries",
        "marketing",
        "technology",
        "rent",
        "utilities",
        "supplies",
        "professional_services",
        "other"
      ]
    },
    "amount": {
      "type": "number"
    },
    "currency": {
      "type": "string",
      "default": "USD"
    },
    "frequency": {
      "type": "string",
      "enum": [
        "one_time",
        "daily",
        "weekly",
        "monthly",
        "quarterly",
        "yearly"
      ],
      "default": "one_time"
    },
    "date": {
      "type": "string",
      "format": "date"
    },
    "vendor": {
      "type": "string"
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "paid",
        "cancelled"
      ],
      "default": "pending"
    },
    "notes": {
      "type": "string"
    },
    "receipt_url": {
      "type": "string"
    }
  },
  "required": [
    "title",
    "category",
    "amount"
  ]
}