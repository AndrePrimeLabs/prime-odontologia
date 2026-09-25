import { createEntity } from './base';
export const Asset = createEntity('assets');
{
  "name": "Asset",
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "type": {
      "type": "string",
      "enum": [
        "equipment",
        "software",
        "vehicle",
        "property",
        "intellectual_property",
        "other"
      ]
    },
    "value": {
      "type": "number"
    },
    "purchase_date": {
      "type": "string",
      "format": "date"
    },
    "depreciation_years": {
      "type": "number"
    },
    "status": {
      "type": "string",
      "enum": [
        "active",
        "maintenance",
        "retired"
      ],
      "default": "active"
    },
    "location": {
      "type": "string"
    },
    "assigned_to": {
      "type": "string"
    },
    "notes": {
      "type": "string"
    }
  },
  "required": [
    "name",
    "type",
    "value"
  ]
}