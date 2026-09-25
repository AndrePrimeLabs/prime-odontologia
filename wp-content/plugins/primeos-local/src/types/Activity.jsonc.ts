import { createEntity } from './base';
export const Activity = createEntity('activities');
{
  "name": "Activity",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Activity title"
    },
    "description": {
      "type": "string"
    },
    "category": {
      "type": "string",
      "enum": [
        "production",
        "marketing",
        "sales",
        "operations",
        "development",
        "support",
        "administration"
      ]
    },
    "priority": {
      "type": "string",
      "enum": [
        "critical",
        "high",
        "medium",
        "low"
      ],
      "default": "medium"
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "in_progress",
        "completed",
        "on_hold",
        "cancelled"
      ],
      "default": "pending"
    },
    "assigned_to": {
      "type": "string"
    },
    "start_date": {
      "type": "string",
      "format": "date"
    },
    "due_date": {
      "type": "string",
      "format": "date"
    },
    "estimated_hours": {
      "type": "number"
    },
    "actual_hours": {
      "type": "number"
    },
    "progress": {
      "type": "number",
      "default": 0,
      "description": "Progress percentage 0-100"
    },
    "file_url": {
      "type": "string",
      "description": "URL do arquivo relacionado \u00e0 atividade"
    },
    "pop_codigo": {
      "type": "string",
      "description": "C\u00f3digo do POP relacionado (ex: POP 01)"
    }
  },
  "required": [
    "title",
    "category"
  ]
}