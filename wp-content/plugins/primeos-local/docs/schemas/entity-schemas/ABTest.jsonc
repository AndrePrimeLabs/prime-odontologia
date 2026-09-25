{
  "name": "ABTest",
  "type": "object",
  "properties": {
    "test_name": {
      "type": "string",
      "description": "Nome do teste A/B"
    },
    "campaign_type": {
      "type": "string",
      "enum": [
        "email",
        "push",
        "landing_page",
        "ad"
      ],
      "description": "Tipo de campanha testada"
    },
    "variant_a": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "subject": {
          "type": "string"
        },
        "body": {
          "type": "string"
        },
        "cta": {
          "type": "string"
        },
        "image_url": {
          "type": "string"
        }
      }
    },
    "variant_b": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "subject": {
          "type": "string"
        },
        "body": {
          "type": "string"
        },
        "cta": {
          "type": "string"
        },
        "image_url": {
          "type": "string"
        }
      }
    },
    "test_duration_days": {
      "type": "number",
      "description": "Dura\u00e7\u00e3o do teste em dias"
    },
    "audience_size": {
      "type": "number",
      "description": "Tamanho da audi\u00eancia por variante"
    },
    "status": {
      "type": "string",
      "enum": [
        "draft",
        "running",
        "completed",
        "paused"
      ],
      "default": "draft"
    },
    "start_date": {
      "type": "string",
      "format": "date-time"
    },
    "end_date": {
      "type": "string",
      "format": "date-time"
    },
    "results": {
      "type": "object",
      "properties": {
        "variant_a_metrics": {
          "type": "object",
          "properties": {
            "sent": {
              "type": "number"
            },
            "opened": {
              "type": "number"
            },
            "clicked": {
              "type": "number"
            },
            "converted": {
              "type": "number"
            }
          }
        },
        "variant_b_metrics": {
          "type": "object",
          "properties": {
            "sent": {
              "type": "number"
            },
            "opened": {
              "type": "number"
            },
            "clicked": {
              "type": "number"
            },
            "converted": {
              "type": "number"
            }
          }
        },
        "winner": {
          "type": "string"
        },
        "confidence_level": {
          "type": "number"
        }
      }
    },
    "ai_recommendation": {
      "type": "string",
      "description": "Recomenda\u00e7\u00e3o de IA com base nos resultados"
    }
  },
  "required": [
    "test_name",
    "campaign_type",
    "variant_a",
    "variant_b"
  ]
}