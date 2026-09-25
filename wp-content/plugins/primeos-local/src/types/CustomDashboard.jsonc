import { createEntity } from './base';
export const CustomDashboard = createEntity('custom_dashboards');
{
  "name": "CustomDashboard",
  "type": "object",
  "properties": {
    "user_email": {
      "type": "string",
      "description": "Email do usu\u00e1rio propriet\u00e1rio"
    },
    "dashboard_name": {
      "type": "string",
      "description": "Nome do dashboard personalizado"
    },
    "description": {
      "type": "string",
      "description": "Descri\u00e7\u00e3o do dashboard"
    },
    "widgets": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "type": {
            "type": "string",
            "enum": [
              "conversion_rate",
              "revenue",
              "cac",
              "roi",
              "pipeline",
              "team_performance",
              "custom_metric"
            ]
          },
          "title": {
            "type": "string"
          },
          "position": {
            "type": "object",
            "properties": {
              "row": {
                "type": "number"
              },
              "col": {
                "type": "number"
              },
              "width": {
                "type": "number"
              },
              "height": {
                "type": "number"
              }
            }
          },
          "config": {
            "type": "object",
            "description": "Configura\u00e7\u00e3o espec\u00edfica do widget"
          }
        }
      },
      "description": "Lista de widgets no dashboard"
    },
    "theme": {
      "type": "string",
      "enum": [
        "light",
        "dark"
      ],
      "default": "light"
    },
    "is_default": {
      "type": "boolean",
      "default": false,
      "description": "Se \u00e9 o dashboard padr\u00e3o do usu\u00e1rio"
    },
    "refresh_interval": {
      "type": "number",
      "default": 300,
      "description": "Intervalo de atualiza\u00e7\u00e3o em segundos"
    },
    "shared_with": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Emails de usu\u00e1rios que podem ver"
    }
 