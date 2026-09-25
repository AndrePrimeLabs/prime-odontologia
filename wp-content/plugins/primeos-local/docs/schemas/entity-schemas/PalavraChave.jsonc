import { createEntity } from './base';
export const PalavraChave = createEntity('palavra_chaves');
{
  "name": "PalavraChave",
  "type": "object",
  "properties": {
    "keyword": {
      "type": "string",
      "description": "Palavra-chave"
    },
    "projeto_id": {
      "type": "string"
    },
    "projeto_nome": {
      "type": "string"
    },
    "volume_busca": {
      "type": "number"
    },
    "dificuldade": {
      "type": "number",
      "description": "Dificuldade 0-100%"
    },
    "intencao": {
      "type": "string",
      "enum": [
        "informacional",
        "comercial",
        "transacional"
      ],
      "default": "informacional"
    },
    "posicao_atual": {
      "type": "number"
    },
    "meta_posicao": {
      "type": "number"
    },
    "pagina_relacionada": {
      "type": "string"
    }
  },
  "required": [
    "keyword",
    "projeto_id"
  ]
}