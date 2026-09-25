import { createEntity } from './base';
export const POP = createEntity('pops');
{
  "name": "POP",
  "type": "object",
  "properties": {
    "codigo": {
      "type": "string",
      "description": "C\u00f3digo do POP (ex: POP 01)"
    },
    "nome": {
      "type": "string",
      "description": "Nome do procedimento"
    },
    "objetivo": {
      "type": "string",
      "description": "Objetivo do procedimento"
    },
    "descricao": {
      "type": "string",
      "description": "Descri\u00e7\u00e3o detalhada do procedimento"
    },
    "responsavel": {
      "type": "string",
      "description": "Respons\u00e1vel pela execu\u00e7\u00e3o"
    },
    "frequencia": {
      "type": "string",
      "enum": [
        "diaria",
        "semanal",
        "mensal",
        "sob_demanda",
        "apos_atendimento"
      ],
      "description": "Frequ\u00eancia de execu\u00e7\u00e3o"
    },
    "categoria": {
      "type": "string",
      "enum": [
        "operacional",
        "clinico",
        "administrativo",
        "marketing",
        "qualidade",
        "gestao"
      ],
      "description": "Categoria do POP"
    },
    "checklist": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Lista de itens a serem verificados"
    },
    "pontos_atencao": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Pontos importantes de aten\u00e7\u00e3o"
    },
    "indicadores": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Indicadores de performance"
    },
    "status": {
      "type": "string",
      "enum": [
        "ativo",
        "em_revisao",
        "descontinuado"
      ],
      "default": "ativo"
    },
    "versao": {
      "type": "string",
      "default": "1.0"
    },
    "arquivo_url": {
      "type": "string",
      "description": "URL do arquivo PDF do POP"
    },
    "favorito": {
      "type": "boolean",
      "default": false,
      "description": "Marcado como favorito"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Tags para busca"
    },
    "historico_versoes": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "versao": {
            "type": "string"
          },
          "data": {
            "type": "string",
            "format": "date"
          },
          "alteracoes": {
            "type": "string"
          },
          "arquivo_url": {
            "type": "string"
          }
        }
      },
      "description": "Hist\u00f3rico de vers\u00f5es anteriores"
    }
  },
  "required": [
    "codigo",
    "nome",
    "responsavel",
    "frequencia"
  ]
}