import { createEntity } from './base';
export const MarketingMetric = createEntity('marketing_metrics');
{
  "name": "MarketingMetric",
  "type": "object",
  "properties": {
    "data": {
      "type": "string",
      "format": "date"
    },
    "canal_id": {
      "type": "string"
    },
    "campanha_id": {
      "type": "string"
    },
    "periodo": {
      "type": "string",
      "enum": [
        "diario",
        "semanal",
        "mensal"
      ],
      "default": "semanal"
    },
    "leads_gerados": {
      "type": "number",
      "default": 0
    },
    "agendamentos": {
      "type": "number",
      "default": 0
    },
    "conversoes": {
      "type": "number",
      "default": 0
    },
    "receita_gerada": {
      "type": "number",
      "default": 0
    },
    "investimento": {
      "type": "number",
      "default": 0
    },
    "impressoes": {
      "type": "number",
      "default": 0
    },
    "cliques": {
      "type": "number",
      "default": 0
 