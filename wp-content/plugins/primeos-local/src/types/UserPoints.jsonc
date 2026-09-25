import { createEntity } from './base';
export const UserPoints = createEntity('user_points');
{
  "name": "UserPoints",
  "type": "object",
  "properties": {
    "user_email": {
      "type": "string",
      "description": "Email do usu\u00e1rio"
    },
    "total_points": {
      "type": "number",
      "default": 0,
      "description": "Total de pontos acumulados"
    },
    "current_level": {
      "type": "number",
      "default": 1,
      "description": "N\u00edvel atual (1-10)"
    },
    "points_to_next_level": {
      "type": "number",
      "default": 100,
      "description": "Pontos necess\u00e1rios para pr\u00f3ximo n\u00edvel"
    },
    "lifetime_points": {
      "type": "number",
      "default": 0,
      "description": "Pontos totais na vida \u00fatil (nunca diminui)"
    },
    "points_breakdown": {
      "type": "object",
      "properties": {
        "tasks_completed": {
          "type": "number",
          "default": 0
        },
        "deals_closed": {
          "type": "number",
          "default": 0
        },
        "reports_generated": {
          "type": "number",
          "default": 0
        },
        "interactions_completed": {
          "type": "number",
          "default": 0
        },
        "feedback_given": {
          "type": "number",
          "default": 0
        },
        "bonus_points": {
          "type": "number",
          "default": 0
        }
      }
    },
 