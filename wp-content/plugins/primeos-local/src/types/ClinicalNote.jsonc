import { createEntity } from './base';
export const ClinicalNote = createEntity('clinical_notes');
{
  "name": "ClinicalNote",
  "type": "object",
  "properties": {
    "patient_id": {
      "type": "string"
    },
    "appointment_id": {
      "type": "string"
    },
    "patient_name": {
      "type": "string"
    },
    "chief_complaint": {
      "type": "string"
    },
    "diagnosis": {
      "type": "string"
    },
    "treatment_plan": {
      "type": "string"
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
          "duration": {
            "type": "string"
          }
        }
      }
    },
    "follow_up_required": {
      "type": "boolean",
      "default": false
    },
    "follow_up_date": {
      "type": "string",
      "format": "date"
    },
    "follow_up_notes": {
      "type": "string"
    },
    "provider": {
      "type": "string"
    }
  },
  "required": [
    "patient_id",
    "patient_name"
  ]
}