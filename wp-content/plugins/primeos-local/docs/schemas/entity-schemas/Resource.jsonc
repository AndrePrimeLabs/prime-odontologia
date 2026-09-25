import { createEntity } from './base';
export const Resource = createEntity('resources');
{
  "name": "Resource",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Nome do recurso"
    },
    "type": {
      "type": "string",
      "enum": [
        "cadeira",
        "sala",
        "equipamento",
        "instrumento"
      ],
      "default": "cadeira"
    },
    "location": {
      "type": "string",
      "description": "Sala/localiza\u00e7\u00e3o"
    },
    "description": {
      "type": "string"
    },
    "is_active": {
      "type": "boolean",
      "default": true
    },
    "working_hours": {
      "type": "object",
      "description": "Disponibilidade por dia (igual ao Dentist)"
    },
    "notes": {
      "type": "string"
    },
    "requires_sterilization_minutes": {
      "type": "number",
      "default": 15,
      "description": "Tempo de limpeza entre pacientes (min)"
    }
  },
  "required": [
    "name",
    "type"
  ]
}