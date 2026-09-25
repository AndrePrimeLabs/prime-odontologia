import { createEntity } from './base';
export const Sale = createEntity('sales');
{
  "name": "Sale",
  "type": "object",
  "properties": {
    "customer_id": {
      "type": "string"
    },
    "customer_name": {
      "type": "string"
    },
    "products": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "product_id": {
            "type": "string"
          },
          "product_name": {
            "type": "string"
          },
          "quantity": {
            "type": "number"
          },
          "unit_price": {
            "type": "number"
          },
          "total": {
            "type": "number"
          }
        }
      }
    },
    "total_amount": {
      "type": "number"
    },
    "currency": {
      "type": "string",
      "default": "USD"
    },
    "channel": {
      "type": "string",
      "enum": [
        "whatsapp",
        "direct",
        "website",
        "phone",
        "in_person"
      ],
      "default": "direct"
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded"
      ],
      "default": "pending"
    },
    "payment_status": {
      "type": "string",
      "enum": [
        "pending",
        "partial",
        "paid",
        "refunded"
      ],
      "default": "pending"
    },
    "notes": {
      "type": "string"
    },
    "whatsapp_order_id": {
      "type": "string"
    }
  },
  "required": [
    "customer_name",
    "total_amount"
  ]
}