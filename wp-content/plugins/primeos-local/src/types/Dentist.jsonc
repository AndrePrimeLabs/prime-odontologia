import { createEntity } from './base';
export const Dentist = createEntity('dentists');
{
  "name": "Dentist",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Nome completo do profissional"
    },
    "specialty": {
      "type": "string",
      "enum": [
        "clinico_geral",
        "ortodontia",
        "implantodontia",
        "endodontia",
        "periodontia",
        "pediatria",
        "cirurgia",
        "protese",
        "estetica"
      ],
      "default": "clinico_geral"
    },
    "email": {
      "type": "string"
    },
    "phone": {
      "type": "string"
    },
    "cro": {
      "type": "string",
      "description": "N\u00famero do CRO"
    },
    "color": {
      "type": "string",
      "description": "Cor no calend\u00e1rio (hex)",
      "default": "#6366f1"
    },
    "avatar_url": {
      "type": "string"
    },
    "is_active": {
      "type": "boolean",
      "default": true
    },
    "working_hours": {
      "type": "object",
      "description": "Hor\u00e1rios por dia da semana (0=Dom, 6=Sab)",
      "properties": {
        "0": {
          "type": "object",
          "properties": {
            "active": {
              "type": "boolean"
            },
            "start": {
              "type": "string"
            },
            "end": {
              "type": "string"
            }
          }
        },
        "1": {
          "type": "object",
          "properties": {
            "active": {
              "type": "boolean"
            },
            "start": {
              "type": "string"
            },
            "end": {
              "type": "string"
            }
          }
        },
        "2": {
          "type": "object",
          "properties": {
            "active": {
              "type": "boolean"
            },
            "start": {
              "type": "string"
            },
            "end": {
              "type": "string"
            }
          }
        },
        "3": {
          "type": "object",
          "properties": {
            "active": {
              "type": "boolean"
            },
            "start": {
              "type": "string"
            },
            "end": {
              "type": "string"
            }
          }
        },
        "4": {
          "type": "object",
          "properties": {
            "active": {
              "type": "boolean"
            },
            "start": {
              "type": "string"
            },
            "end": {
              "type": "string"
            }
          }
        },
        "5": {
          "type": "object",
          "properties": {
            "active": {
              "type": "boolean"
            },
            "start": {
              "type": "string"
            },
            "end": {
              "type": "string"
            }
          }
        },
        "6": {
          "type": "object",
          "properties": {
            "active": {
              "type": "boolean"
            },
            "start": {
              "type": "string"
            },
            "end": {
              "type": "string"
            }
          }
        }
      }
    },
    "slot_duration_minutes": {
      "type": "number",
      "default": 30,
      "description": "Dura\u00e7\u00e3o padr\u00e3o do slot em minutos"
    },
    "services": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Tipos de servi\u00e7o que realiza"
    },
    "notes": {
      "type": "string"
    }
  },
  "required": [
    "name",
    "specialty"
  ]
}