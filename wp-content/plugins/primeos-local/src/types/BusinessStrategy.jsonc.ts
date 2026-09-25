import { createEntity } from './base';
export const BusinessStrategy = createEntity('business_strategies');
{
  "name": "BusinessStrategy",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Nome da estrat\u00e9gia"
    },
    "visao_estrategica": {
      "type": "string",
      "description": "Vis\u00e3o estrat\u00e9gica do neg\u00f3cio"
    },
    "missao": {
      "type": "string",
      "description": "Miss\u00e3o do neg\u00f3cio"
    },
    "modelo_negocio": {
      "type": "object",
      "properties": {
        "proposta_valor": {
          "type": "string"
        },
        "segmentos_clientes": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "canais": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "relacionamento_clientes": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "fontes_receita": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "recursos_chave": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "atividades_chave": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "parcerias_chave": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "estrutura_custos": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      },
      "description": "Business Model Canvas completo"
    },
    "vantagens_competitivas": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Diferencial competitivo"
    },
    "objetivos_estrategicos": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "objetivo": {
            "type": "string"
          },
          "prazo": {
            "type": "string"
          },
          "indicadores": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "responsavel": {
            "type": "string"
          }
        }
      },
      "description": "Objetivos estrat\u00e9gicos de curto, m\u00e9dio e longo prazo"
    },
    "oportunidades": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Oportunidades identificadas"
    },
    "ameacas": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Amea\u00e7as e riscos"
    },
    "posicionamento_mercado": {
      "type": "string",
      "description": "Como a empresa se posiciona no mercado"
    },
    "escalabilidade": {
      "type": "object",
      "properties": {
        "modelo": {
          "type": "string"
        },
        "franquia_ready": {
          "type": "boolean"
        },
        "processos_padronizados": {
          "type": "boolean"
        },
        "tecnologia_suporte": {
          "type": "string"
        }
      },
      "description": "Estrat\u00e9gia de escalabilidade"
    },
    "status": {
      "type": "string",
      "enum": [
        "ativa",
        "em_revisao",
        "arquivada"
      ],
      "default": "ativa"
    },
    "data_revisao": {
      "type": "string",
      "format": "date",
      "description": "\u00daltima data de revis\u00e3o estrat\u00e9gica"
    }
  },
  "required": [
    "name",
    "visao_estrategica"
  ]
}