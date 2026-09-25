import { createEntity } from './base';
export const Content = createEntity('contents');
{
  "name": "Content",
  "type": "object",
  "properties": {
    "titulo": {
      "type": "string"
    },
    "tipo": {
      "type": "string",
      "enum": [
        "blog",
        "reel",
        "story",
        "youtube",
        "pinterest",
        "email",
        "carrossel",
        "tiktok"
      ],
      "default": "reel"
    },
    "canal_id": {
      "type": "string"
    },
    "estrategia_id": {
      "type": "string"
    },
    "funil": {
      "type": "string",
      "enum": [
        "topo",
        "meio",
        "fundo"
      ],
      "default": "topo"
    },
    "objetivo": {
      "type": "string",
      "enum": [
        "autoridade",
        "lead",
        "conversao",
        "engajamento"
      ],
      "default": "autoridade"
    },
    "cta": {
      "type": "string"
    },
    "status": {
      "type": "string",
      "enum": [
        "ideia",
        "producao",
        "revisao",
        "publicado"
      ],
      "default": "ideia"
    },
    "data_publicacao": {
      "type": "string",
      "format": "date"
    },
    "link_final": {
      "type": "string"
    },
    "script": {
      "type": "string"
    },
    "hashtags": {
      "type": "string"
    }
  },
  "required": [
    "titulo"
  ]
}