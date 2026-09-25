import { createEntity } from './base';
export const MedicalRecord = createEntity('medical_records');
{
  "name": "MedicalRecord",
  "type": "object",
  "properties": {
    "patient_id": {
      "type": "string"
    },
    "patient_name": {
      "type": "string"
    },
    "ehr_id": {
      "type": "string",
      "description": "ID do paciente no sistema EHR externo"
    },
    "record_type": {
      "type": "string",
      "enum": [
        "anamnese",
        "exame_clinico",
        "plano_tratamento",
        "evolucao",
        "odontograma",
        "radiografia",
        "outro"
      ],
      "default": "anamnese"
    },
    "title": {
      "type": "string"
    },
    "content": {
      "type": "string",
      "description": "Conte\u00fado do prontu\u00e1rio em texto"
    },
    "allergies": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Alergias conhecidas"
    },
    "medications": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "dosage": {
            "type": "string"
          },
          "frequency": {
            "type": "string"
          },
          "started_date": {
            "type": "string",
            "format": "date"
          }
        }
      },
      "description": "Medica\u00e7\u00f5es em uso"
    },
    "past_procedures": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "procedure": {
            "type": "string"
          },
          "date": {
            "type": "string",
            "format": "date"
          },
          "tooth": {
            "type": "string"
          },
          "notes": {
            "type": "string"
          }
        }
      },
      "description": "Procedimentos realizados anteriormente"
    },
    "chronic_conditions": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Condi\u00e7\u00f5es cr\u00f4nicas (diabetes, hipertens\u00e3o, etc)"
    },
    "attachments": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "url": {
            "type": "string"
          },
          "type": {
            "type": "string"
          }
        }
      }
    },
    "provider": {
      "type": "string"
    },
    "date": {
      "type": "string",
      "format": "date"
    },
    "synced_to_ehr": {
      "type": "boolean",
      "default": false,
      "description": "Se foi sincronizado com EHR externo"
    },
    "last_ehr_sync": {
      "type": "string",
      "format": "date-time",
      "description": "\u00daltima sincroniza\u00e7\u00e3o com EHR"
    }
  },
  "required": [
    "patient_id",
    "patient_name",
    "record_type"
  ]
}