import { createEntity } from './base';
export const AppAnalytics = createEntity('app_analytics');
{
  "name": "AppAnalytics",
  "type": "object",
  "properties": {
    "app_id": {
      "type": "string",
      "description": "ID do app"
    },
    "date": {
      "type": "string",
      "format": "date",
      "description": "Data das m\u00e9tricas"
    },
    "platform": {
      "type": "string",
      "enum": [
        "ios",
        "android"
      ],
      "description": "Plataforma"
    },
    "downloads": {
      "type": "number",
      "default": 0,
      "description": "Downloads no dia"
    },
    "active_users": {
      "type": "number",
      "default": 0,
      "description": "Usu\u00e1rios ativos"
    },
    "new_users": {
      "type": "number",
      "default": 0,
      "description": "Novos usu\u00e1rios"
    },
    "revenue": {
      "type": "number",
      "default": 0,
      "description": "Receita do dia"
    },
    "iap_revenue": {
      "type": "number",
      "default": 0,
      "description": "Receita de compras in-app"
    },
    "ad_revenue": {
      "type": "number",
      "default": 0,
      "description": "Receita de an\u00fancios"
    },
    "crashes": {
      "type": "number",
      "default": 0,
      "description": "N\u00famero de crashes"
    },
    "session_duration_avg": {
      "type": "number",
      "default": 0,
      "description": "Dura\u00e7\u00e3o m\u00e9dia da sess\u00e3o (minutos)"
    },
    "retention_day1": {
      "type": "number",
      "description": "Reten\u00e7\u00e3o dia 1 (%)"
    },
    "retention_day7": {
      "type": "number",
      "description": "Reten\u00e7\u00e3o dia 7 (%)"
    },
    "retention_day30": {
      "type": "number",
      "description": "Reten\u00e7\u00e3o dia 30 (%)"
    }
  },
  "required": [
    "app_id",
    "date",
    "platform"
  ]
}