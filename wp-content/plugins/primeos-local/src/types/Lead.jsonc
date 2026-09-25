import { createEntity } from './base';
export const Lead = createEntity('leads');
{
  "name": "Lead",
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "phone": {
      "type": "string"
    },
    "email": {
      "type": "string"
    },
    "origem_canal_id": {
      "type": "string"
    },
    "campanha_id": {
      "type": "string"
    },
    "interesse": {
      "type": "string",
      "enum": [
        "invisalign",
        "ortodontia",
        "limpeza",
        "clareamento",
        "implante",
        "protese",
        "estetica",
        "checkup",
        "outro"
      ],
      "default": "invisalign"
    },
    "status": {
      "type": "string",
      "enum": [
        "novo",
        "em_conversa",
        "avaliacao",
        "orcamento",
        "fechado",
        "perdido"
      ],
      "default": "novo"
    },
    "data_entrada": {
      "type": "string",
      "format": "date"
    },
    "canal_conversao": {
      "type": "string",
      "enum": [
        "whatsapp",
        "telefone",
        "presencial",
 