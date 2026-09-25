import { createEntity } from './base';
export const ClientJourney = createEntity('client_journeys');
{
  "name": "ClientJourney",
  "type": "object",
  "properties": {
    "patient_id": {
      "type": "string"
    },
    "patient_name": {
      "type": "string"
    },
    "current_stage": {
      "type": "string",
      "enum": [
        "lead",
        "primeiro_contato",
        "agendamento",
        "consulta",
        "tratamento",
        "pos_tratamento",
        "retorno",
        "fidelizado"
      ],
      "default": "lead"
    },
    "entry_channel": {
      "type": "string",
      "enum": [
        "whatsapp",
        "instagram",
        "facebook",
        "indicacao",
        "google",
        "website"
      ],
      "default": "whatsapp"
    },
    "treatments": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "status": {
            "type": "string"
          },
          "value": {
            "type": "number"
          },
          "start_date": {
            "type": "string"
          },
          "end_date": {
            "type": "string"
          }
        }
      }
    },
    "total_value": {
      "type": "number",
      "default": 0
    },
    "satisfaction_score": {
      "type": "number"
    },
    "notes": {
      "type": "string"
    }
  },
  "required": [
    "patient_name",
    "current_stage"
  ]
}