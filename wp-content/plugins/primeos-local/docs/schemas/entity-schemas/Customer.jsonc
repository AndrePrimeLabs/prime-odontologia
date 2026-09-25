import { createEntity } from './base';
export const CustomDashboard = createEntity('custom_dashboards');
{
  "name": "Customer",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Nome completo"
    },
    "email": {
      "type": "string",
      "description": "Email"
    },
    "phone": {
      "type": "string",
      "description": "Telefone/WhatsApp"
    },
    "company": {
      "type": "string",
      "description": "Empresa"
    },
    "segment": {
      "type": "string",
      "enum": [
        "enterprise",
        "small_business",
        "individual",
        "partner"
      ],
      "description": "Segmento"
    },
    "status": {
      "type": "string",
      "enum": [
        "lead",
        "prospect",
        "active",
        "inactive",
        "churned"
      ],
      "default": "lead"
    },
    "value_tier": {
      "type": "string",
      "enum": [
        "high",
        "medium",
        "low"
      ],
      "default": "medium"
    },
    "source": {
      "type": "string",
      "enum": [
        "referral",
        "website",
        "social_media",
        "whatsapp",
        "google",
        "cold_outreach",
        "other"
      ]
    },
    "notes": {
      "type": "string"
    },
    "last_contact_date": {
      "type": "string",
      "format": "date"
    },
    "lifetime_value": {
      "type": "number",
      "default": 0
    },
    "birth_date": {
      "type": "string",
      "format": "date",
      "description": "Data de Nascimento"
    },
    "profession": {
      "type": "string",
      "description": "Profiss\u00e3o"
    },
    "interests": {
      "type": "string",
      "description": "Interesses e prefer\u00eancias"
    },
    "city": {
      "type": "string",
      "description": "Cidade"
    },
    "state": {
      "type": "string",
      "description": "Estado"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Tags personalizadas para categoriza\u00e7\u00e3o"
    },
    "custom_fields": {
      "type": "object",
      "description": "Campos customizados adicionais",
      "additionalProperties": true
    }
  },
  "required": [
    "name"
  ]
}