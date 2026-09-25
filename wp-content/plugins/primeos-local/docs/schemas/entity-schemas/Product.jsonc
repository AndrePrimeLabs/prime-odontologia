import { createEntity } from './base';
export const Product = createEntity('products');
{
  "name": "Product",
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "category": {
      "type": "string"
    },
    "sku": {
      "type": "string"
    },
    "price": {
      "type": "number"
    },
    "cost": {
      "type": "number"
    },
    "currency": {
      "type": "string",
      "default": "USD"
    },
    "stock_quantity": {
      "type": "number",
      "default": 0
    },
    "min_stock_level": {
      "type": "number",
      "default": 5
    },
    "status": {
      "type": "string",
      "enum": [
        "active",
        "draft",
        "out_of_stock",
        "discontinued"
      ],
      "default": "active"
    },
    "image_url": {
      "type": "string"
    },
    "whatsapp_enabled": {
      "type": "boolean",
      "default": true
    },
    "whatsapp_message_template": {
      "type": "string",
      "description": "Custom message template for WhatsApp"
    }
  },
  "required": [
    "name",
    "price"
  ]
}