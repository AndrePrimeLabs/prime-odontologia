import { createEntity } from './base';
export const UserBadge = createEntity('user_badges');
{
  "name": "UserBadge",
  "type": "object",
  "properties": {
    "user_email": {
      "type": "string",
      "description": "Email do usu\u00e1rio"
    },
    "badge_id": {
      "type": "string",
      "description": "ID \u00fanico da badge"
    },
    "badge_name": {
      "type": "string",
      "description": "Nome da badge"
    },
    "badge_description": {
      "type": "string",
      "description": "Descri\u00e7\u00e3o da conquista"
    },
    "badge_icon": {
      "type": "string",
      "description": "\u00cdcone/emoji da badge"
    },
    "category": {
      "type": "string",
      "enum": [
        "sales",
        "productivity",
        "engagement",
        "leadership",
        "milestone"
      ],
      "description": "Categoria da badge"
    },
    "earned_date": {
      "type": "string",
      "format": "date",
      "description": "Data quando conquistou"
    },
    "points_awarded": {
      "type": "number",
      "default": 0,
      "description": "Pontos b\u00f4nus pela badge"
    },
    "rarity": {
      "type": "string",
      "enum": [
        "common",
        "rare",
        "epic",
        "legendary"
      ],
      "default": "common",
      "description": "Raridade da badge"
    },
    "progress": {
      "type": "number",
      "default": 100,
      "description": "Progresso 0-100 (100 = conquistada)"
    }
  },
  "required": [
    "user_email",
    "badge_id",
    "badge_name"
  ]
}