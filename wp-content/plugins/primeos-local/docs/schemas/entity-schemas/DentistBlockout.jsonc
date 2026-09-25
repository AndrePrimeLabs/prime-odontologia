import { createEntity } from './base';
export const DentistBlockout = createEntity('dentist_blockouts');
{
  "name": "DentistBlockout",
  "type": "object",
  "properties": {
    "dentist_id": {
      "type": "string"
    },
    "dentist_name": {
      "type": "string"
    },
    "date": {
      "type": "string",
      "format": "date"
    },
    "start_time": {
      "type": "string"
    },
    "end_time": {
      "type": "string"
    },
    "reason": {
      "type": "string",
      "enum": [
        "ferias",
        "curso",
        "reuniao",
        "folga",
        "outro"
      ],
      "default": "outro"
    },
    "notes": {
      "type": "string"
    },
    "is_full_day": {
      "type": "boolean",
      "default": false
    }
  },
  "required": [
    "dentist_id",
    "date"
  ]
}