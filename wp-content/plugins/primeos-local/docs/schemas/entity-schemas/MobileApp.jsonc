import { createEntity } from './base';
export const MobileApp = createEntity('mobile_apps');
{
  "name": "MobileApp",
  "type": "object",
  "properties": {
    "app_name": {
      "type": "string",
      "description": "Nome do aplicativo"
    },
    "bundle_id": {
      "type": "string",
      "description": "Bundle ID (iOS) ou Package Name (Android)"
    },
    "platform": {
      "type": "string",
      "enum": [
        "ios",
        "android",
        "both"
      ],
      "default": "both",
      "description": "Plataforma do app"
    },
    "category": {
      "type": "string",
      "enum": [
        "games",
        "social",
        "productivity",
        "education",
        "entertainment",
        "business",
        "health",
        "lifestyle",
        "shopping",
        "utilities",
        "other"
      ],
      "description": "Categoria na store"
    },
    "icon_url": {
      "type": "string",
      "description": "URL do \u00edcone do app"
    },
    "description": {
      "type": "string",
      "description": "Descri\u00e7\u00e3o do app"
    },
    "short_description": {
      "type": "string",
      "description": "Descri\u00e7\u00e3o curta para stores"
    },
    "current_version": {
      "type": "string",
      "description": "Vers\u00e3o atual publicada"
    },
    "status": {
      "type": "string",
      "enum": [
        "development",
        "review",
        "published",
        "rejected",
        "removed"
      ],
      "default": "development",
      "description": "Status na store"
    },
    "apple_store_url": {
      "type": "string",
      "description": "URL na Apple Store"
    },
    "google_play_url": {
      "type": "string",
      "description": "URL no Google Play"
    },
    "price": {
      "type": "number",
      "default": 0,
      "description": "Pre\u00e7o do app (0 = gr\u00e1tis)"
    },
    "has_iap": {
      "type": "boolean",
      "default": false,
      "description": "Tem compras in-app"
    },
    "rating_ios": {
      "type": "number",
      "description": "Avalia\u00e7\u00e3o m\u00e9dia iOS (0-5)"
    },
    "rating_android": {
      "type": "number",
      "description": "Avalia\u00e7\u00e3o m\u00e9dia Android (0-5)"
    },
    "downloads_ios": {
      "type": "number",
      "default": 0,
      "description": "Total downloads iOS"
    },
    "downloads_android": {
      "type": "number",
      "default": 0,
      "description": "Total downloads Android"
    },
    "revenue_total": {
      "type": "number",
      "default": 0,
      "description": "Receita total gerada"
    },
    "keywords": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Keywords para ASO"
    },
    "screenshots": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "URLs das screenshots"
    },
    "release_date": {
      "type": "string",
      "format": "date",
      "description": "Data de lan\u00e7amento"
    },
    "last_update": {
      "type": "string",
      "format": "date",
      "description": "\u00daltima atualiza\u00e7\u00e3o"
    }
  },
  "required": [
    "app_name",
    "platform"
  ]
}