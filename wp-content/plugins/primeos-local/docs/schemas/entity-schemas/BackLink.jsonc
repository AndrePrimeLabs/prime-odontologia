import { createEntity } from './base';
export const BackLink = createEntity('back_links');
{
  "name": "Backlink",
  "type": "object",
  "properties": {
    "dominio_origem": {
      "type": "string",
      "description": "Dom\u00ednio de origem do backlink"
    },
    "projeto_id": {
      "type": "string"
    },
    "projeto_nome": {
      "type": "string"
    },
    "autoridade_dominio": {
      "type": "number",
      "description": "DA 0-100"
    },
    "tipo_link": {
      "type": "string",
      "enum": [
        "dofollow",
        "nofollow"
      ],
      "default": "dofollow"
    },
    "url_destino": {
      "type": "string"
    },
    "data_publicacao": {
      "type": "string",
      "format": "date"
    },
    "status": {
      "type": "string",
      "enum": [
        "ativo",
        "inativo",
        "perdido"
      ],
      "default": "ativo"
    }
  },
  "required": [
    "dominio_origem",
    "projeto_id"
  ]
}