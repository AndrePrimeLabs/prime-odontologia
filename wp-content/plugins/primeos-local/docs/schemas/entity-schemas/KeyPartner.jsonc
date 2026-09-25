import { createEntity } from './base';
export const KeyPartner = createEntity('key_partners');
{
  "name": "KeyPartner",
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "category": {
      "type": "string",
      "enum": [
        "fornecedor_estrategico",
        "laboratorio",
        "equipamento_material",
        "pagamento_financiamento",
        "profissional_saude",
        "assistencia_tecnica"
      ],
      "default": "fornecedor_estrategico"
    },
    "dependency_level": {
      "type": "string",
      "enum": [
        "alta",
        "media",
        "baixa"
      ],
      "default": "media",
      "description": "N\u00edvel de depend\u00eancia"
    },
    "strategic_importance": {
      "type": "string",
      "enum": [
        "muito_alta",
        "alta",
        "media"
      ],
      "default": "alta",
      "description": "Import\u00e2ncia estrat\u00e9gica"
    },
    "description": {
      "type": "string"
    },
    "risk_level": {
      "type": "string"
    },
    "recommended_actions": {
      "type": "string"
    },
    "contact_info": {
      "type": "string"
    },
    "contract_details": {
      "type": "string"
    },
    "status": {
      "type": "string",
      "enum": [
        "ativo",
        "inativo",
        "em_negociacao"
      ],
      "default": "ativo"
    }
  },
  "required": [
    "name",
    "category"
  ]
}