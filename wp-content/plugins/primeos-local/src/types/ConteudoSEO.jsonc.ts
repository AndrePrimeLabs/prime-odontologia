import { createEntity } from './base';
export const ConteudoSEO = createEntity('conteudo_seo');
{
  "name": "ConteudoSEO",
  "type": "object",
  "properties": {
    "titulo": {
      "type": "string"
    },
    "projeto_id": {
      "type": "string"
    },
    "keyword_principal": {
      "type": "string"
    },
    "tipo_conteudo": {
      "type": "string",
      "enum": [
        "blog_post",
        "pagina_pilar",
        "landing_page"
      ],
      "default": "blog_post"
    },
    "status_editorial": {
      "type": "string",
      "enum": [
        "briefing",
        "redacao",
        "revisao",
        "publicado"
      ],
      "default": "briefing"
    },
    "data_publicacao": {
      "type": "string",
      "format": "date"
    },
    "url_final": {
      "type": "string"
    },
    "meta_descricao": {
      "type": "string"
    },
    "responsavel": {
      "type": "string"
    },
    "notas": {
      "type": "string"
    }
  },
  "required": [
    "titulo",
    "projeto_id"
  ]
}