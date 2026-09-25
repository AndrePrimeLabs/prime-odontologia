import { createEntity } from './base';
export const AppReview = createEntity('app_reviews');
{
  "name": "AppReview",
  "type": "object",
  "properties": {
    "app_id": {
      "type": "string",
      "description": "ID do app"
    },
    "platform": {
      "type": "string",
      "enum": [
        "ios",
        "android"
      ],
      "description": "Plataforma"
    },
    "rating": {
      "type": "number",
      "description": "Nota 1-5"
    },
    "title": {
      "type": "string",
      "description": "T\u00edtulo da avalia\u00e7\u00e3o"
    },
    "review_text": {
      "type": "string",
      "description": "Texto da avalia\u00e7\u00e3o"
    },
    "user_name": {
      "type": "string",
      "description": "Nome do usu\u00e1rio"
    },
    "review_date": {
      "type": "string",
      "format": "date-time",
      "description": "Data da avalia\u00e7\u00e3o"
    },
    "version": {
      "type": "string",
      "description": "Vers\u00e3o do app avaliada"
    },
    "country": {
      "type": "string",
      "description": "Pa\u00eds do reviewer"
    },
    "response": {
      "type": "string",
      "description": "Resposta do desenvolvedor"
    },
    "response_date": {
      "type": "string",
      "format": "date-time",
      "description": "Data da resposta"
    },
    "sentiment": {
      "type": "string",
      "enum": [
        "positive",
        "neutral",
        "negative"
      ],
      "description": "Sentimento da review (AI)"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Tags identificadas (AI)"
    }
  },
  "required": [
    "app_id",
    "platform",
    "rating"
  ]
}