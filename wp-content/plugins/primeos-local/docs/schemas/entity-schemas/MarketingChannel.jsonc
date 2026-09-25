import { createEntity } from './base';
export const MarketingChannel = createEntity('marketing_channels');
{
  "name": "MarketingChannel",
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "tipo": {
      "type": "string",
      "enum": [
        "social",
        "busca",
        "proprio",
        "pago"
      ],
      "default": "social"
    },
    "plataforma": {
      "type": "string",
      "enum": [
        "instagram",
        "facebook",
        "google",
        "youtube",
        "tiktok",
        "pinterest",
        "blog",
        "whatsapp",
        "email",
        "linkedin"
      ],
      "default": "instagram"
    },
    "funcao_funil": {
      "type": "string",
      "enum": [
        "aquisicao",
        "conversao",
        "retencao"
      ],
      "default": "aquisicao"
    },
    "integracoes": {
      "type": "string"
    },
    "kpi_principal": {
      "type": "string"
    },
    "status": {
      "type": "string",
 