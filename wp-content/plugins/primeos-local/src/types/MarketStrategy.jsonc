import { createEntity } from './base';
export const MarketStrategy = createEntity('market_strategies');
{
  "name": "MarketingStrategy",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Nome da estrat\u00e9gia"
    },
    "objetivo": {
      "type": "string"
    },
    "oferta_principal": {
      "type": "string",
      "enum": [
        "invisalign",
        "ortodontia",
        "limpeza",
        "clareamento",
        "implante",
        "protese",
        "estetica",
        "outro"
      ],
      "default": "invisalign"
    },
    "publico_alvo": {
      "type": "string"
    },
    "dor_principal": {
      "type": "string"
    },
    "promessa": {
      "type": "string"
    },
    "kpi_principal": {
      "type": "string"
    },
    "status": {
      "type": "string",
      "enum": [
        "planejamento",
        "ativo",
        "pausado"
      ],
      "default": "planejamento"
    }
  },
  "required": [
    "name"
  ]
}