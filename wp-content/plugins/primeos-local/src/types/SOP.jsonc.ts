import { createEntity } from './base';
export const SOP = createEntity('sops');
{
  "name": "SOP",
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "area": {
      "type": "string",
      "enum": [
        "Sales",
        "CRM",
        "Trainer",
        "Manager",
        "Marketing",
        "Operations"
      ],
      "default": "Sales"
    },
    "owner": {
      "type": "string"
    },
    "goal": {
      "type": "string"
    },
    "primary_offer": {
      "type": "string"
    },
    "status": {
      "type": "string",
      "enum": [
        "Active",
        "Draft",
        "Archived"
      ],
      "default": "Active"
    },
    "last_update": {
      "type": "string",
      "format": "date"
    },
    "kpi_principal": {
      "type": "string"
    },
    "content": {
      "type": "string"
    }
  },
  "required": [
    "name",
    "area"
  ]
}