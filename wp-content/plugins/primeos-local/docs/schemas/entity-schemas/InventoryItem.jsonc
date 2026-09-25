import { createEntity } from './base';
export const InventoryItem = createEntity('inventory_items');
{
  "name": "InventoryItem",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Nome do material"
    },
    "description": {
      "type": "string",
      "description": "Descri\u00e7\u00e3o detalhada"
    },
    "sku": {
      "type": "string",
      "description": "C\u00f3digo \u00fanico do item"
    },
    "category": {
      "type": "string",
      "enum": [
        "consumivel",
        "instrumental",
        "medicamento",
        "protecao_epi",
        "radiologia",
        "laboratorio",
        "limpeza",
        "outros"
      ],
      "default": "consumivel",
      "description": "Categoria do material"
    },
    "quantity_on_hand": {
      "type": "number",
      "default": 0,
      "description": "Quantidade atual em estoque"
    },
    "unit": {
      "type": "string",
      "description": "Unidade de medida (un, cx, ml, g, etc.)"
    },
    "reorder_point": {
      "type": "number",
      "default": 0,
      "description": "Quantidade m\u00ednima para gerar alerta de reposi\u00e7\u00e3o"
    },
    "reorder_quantity": {
      "type": "number",
      "description": "Quantidade sugerida para reposi\u00e7\u00e3o"
    },
    "supplier": {
      "type": "string",
      "description": "Fornecedor"
    },
    "supplier_contact": {
      "type": "string",
      "description": "Telefone ou email do fornecedor"
    },
    "unit_cost": {
      "type": "number",
      "description": "Custo unit\u00e1rio (R$)"
    },
    "last_restock_date": {
      "type": "string",
      "format": "date",
      "description": "Data da \u00faltima reposi\u00e7\u00e3o"
    },
    "expiry_date": {
      "type": "string",
      "format": "date",
      "description": "Data de validade (se aplic\u00e1vel)"
    },
    "location": {
      "type": "string",
      "description": "Localiza\u00e7\u00e3o no consult\u00f3rio (ex: arm\u00e1rio A, gaveta 3)"
    },
    "notes": {
      "type": "string"
    },
    "is_active": {
      "type": "boolean",
      "default": true
    }
  },
  "required": [
    "name",
    "quantity_on_hand",
    "reorder_point"
  ]
}