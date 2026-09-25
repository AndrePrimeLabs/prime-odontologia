import { createEntity } from './base';
export const PatientRecord = createEntity('patient_records');
{
  "name": "PatientRecord",
  "type": "object",
  "properties": {
    "patient_id": {
      "type": "string"
    },
    "patient_name": {
      "type": "string"
    },
    "patient_phone": {
      "type": "string"
    },
    "patient_email": {
      "type": "string"
    },
    "date_of_birth": {
      "type": "string",
      "format": "date"
    },
    "gender": {
      "type": "string",
      "enum": [
        "masculino",
        "feminino",
        "outro",
        "prefiro_nao_informar"
      ]
    },
    "cpf": {
      "type": "string"
    },
    "rg": {
      "type": "string"
    },
    "marital_status": {
      "type": "string",
      "enum": [
        "solteiro",
        "casado",
        "divorciado",
        "viuvo",
        "uniao_estavel"
      ]
    },
    "occupation": {
      "type": "string"
    },
    "address": {
      "type": "object",
      "properties": {
        "street": {
          "type": "string"
        },
        "number": {
          "type": "string"
        },
        "complement": {
          "type": "string"
        },
        "neighborhood": {
          "type": "string"
        },
        "city": {
          "type": "string"
        },
        "state": {
          "type": "string"
        },
        "zip_code": {
          "type": "string"
        }
      }
    },
    "blood_type": {
      "type": "string",
      "enum": [
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-",
        "N\u00e3o informado"
      ]
    },
    "allergies": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "allergen": {
            "type": "string"
          },
          "severity": {
            "type": "string",
            "enum": [
              "leve",
              "moderada",
              "grave"
            ]
          },
          "reaction": {
            "type": "string"
          }
        }
      }
    },
    "current_medications": {
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
          "start_date": {
            "type": "string",
            "format": "date"
          },
          "prescribing_doctor": {
            "type": "string"
          }
        }
      }
    },
    "medical_conditions": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Condi\u00e7\u00f5es m\u00e9dicas (inclui idoso como op\u00e7\u00e3o)"
    },
    "past_treatments": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "treatment": {
            "type": "string"
          },
          "tooth_number": {
            "type": "string"
          },
          "date": {
            "type": "string",
            "format": "date"
          },
          "dentist": {
            "type": "string"
          },
          "notes": {
            "type": "string"
          },
          "cost": {
            "type": "number"
          }
        }
      }
    },
    "dental_records": {
      "type": "object"
    },
    "documents": {
      "type": "array",
      "description": "Documentos anexados ao prontu\u00e1rio",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "file_url": {
            "type": "string"
          },
          "type": {
            "type": "string",
            "enum": [
              "exame",
              "receita",
              "laudo",
              "radiografia",
              "termo_consentimento",
              "atestado",
              "outro"
            ]
          },
          "date": {
            "type": "string",
            "format": "date"
          },
          "notes": {
            "type": "string"
          }
        }
      }
    },
    "x_rays": {
      "type": "array",
      "description": "Exames de imagem",
      "items": {
        "type": "object",
        "properties": {
          "date": {
            "type": "string",
            "format": "date"
          },
          "type": {
            "type": "string",
            "enum": [
              "panor\u00e2mica",
              "periapical",
              "bite-wing",
              "cefalom\u00e9trica",
              "tomografia"
            ]
          },
          "file_url": {
            "type": "string"
          },
          "findings": {
            "type": "string"
          }
        }
      }
    },
    "family_history": {
      "type": "array",
      "description": "Hist\u00f3rico familiar de doen\u00e7as",
      "items": {
        "type": "object",
        "properties": {
          "relation": {
            "type": "string"
          },
          "condition": {
            "type": "string"
          },
          "severity": {
            "type": "string",
            "enum": [
              "leve",
              "moderada",
              "grave"
            ]
          },
          "notes": {
            "type": "string"
          }
        }
      }
    },
    "prescriptions": {
      "type": "array",
      "description": "Prescri\u00e7\u00f5es m\u00e9dicas emitidas",
      "items": {
        "type": "object",
        "properties": {
          "date": {
            "type": "string",
            "format": "date"
          },
          "prescribing_doctor": {
            "type": "string"
          },
          "notes": {
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
                },
                "instructions": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "checkup_schedule": {
      "type": "array",
      "description": "Retornos preventivos programados",
      "items": {
        "type": "object",
        "properties": {
          "interval_months": {
            "type": "number"
          },
          "service_type": {
            "type": "string"
          },
          "due_date": {
            "type": "string",
            "format": "date"
          },
          "provider": {
            "type": "string"
          },
          "notes": {
            "type": "string"
          },
          "scheduled": {
            "type": "boolean",
            "default": false
          },
          "appointment_id": {
            "type": "string"
          },
          "created_at": {
            "type": "string"
          }
        }
      }
    },
    "appointments_history": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "insurance_info": {
      "type": "object",
      "properties": {
        "has_insurance": {
          "type": "boolean",
          "default": false
        },
        "provider": {
          "type": "string"
        },
        "policy_number": {
          "type": "string"
        },
        "coverage_percentage": {
          "type": "number"
        }
      }
    },
    "emergency_contact": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "relationship": {
          "type": "string"
        },
        "phone": {
          "type": "string"
        }
      }
    },
    "how_did_you_hear": {
      "type": "string",
      "enum": [
        "indicacao",
        "google",
        "instagram",
        "facebook",
        "outro"
      ]
    },
    "consents": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "type": {
            "type": "string"
          },
          "date_signed": {
            "type": "string",
            "format": "date"
          },
          "document_url": {
            "type": "string"
          }
        }
      }
    },
    "notes": {
      "type": "string"
    },
    "status": {
      "type": "string",
      "enum": [
        "ativo",
        "inativo",
        "arquivado"
      ],
      "default": "ativo"
    }
  },
  "required": [
    "patient_name"
  ]
}