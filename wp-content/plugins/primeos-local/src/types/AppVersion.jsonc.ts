import { createEntity } from './base';
export const AppVersion = createEntity('app_versions');
{
  "name": "AppVersion",
  "type": "object",
  "properties": {
    "app_id": {
      "type": "string",
      "description": "ID do app"
    },
    "version_number": {
      "type": "string",
      "description": "N\u00famero da vers\u00e3o (ex: 1.2.3)"
    },
    "build_number": {
      "type": "string",
      "description": "Build number"
    },
    "platform": {
      "type": "string",
      "enum": [
        "ios",
        "android"
      ],
      "description": "Plataforma"
    },
    "status": {
      "type": "string",
      "enum": [
        "development",
        "testing",
        "submitted",
        "in_review",
        "approved",
        "published",
        "rejected"
      ],
      "default": "development"
    },
    "release_notes": {
      "type": "string",
      "description": "Notas de vers\u00e3o"
    },
    "whats_new": {
      "type": "string",
      "description": "O que h\u00e1 de novo"
    },
    "submission_date": {
      "type": "string",
      "format": "date-time",
      "description": "Data de submiss\u00e3o"
    },
    "approval_date": {
      "type": "string",
      "format": "date-time",
      "description": "Data de aprova\u00e7\u00e3o"
    },
    "publish_date": {
      "type": "string",
      "format": "date-time",
      "description": "Data de publica\u00e7\u00e3o"
    },
    "file_size_mb": {
      "type": "number",
      "description": "Tamanho do app em MB"
    },
    "min_os_version": {
      "type": "string",
      "description": "Vers\u00e3o m\u00ednima do OS"
    }
  },
  "required": [
    "app_id",
    "version_number",
    "platform"
  ]
}