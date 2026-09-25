import { createEntity } from './base';
export const ProjetoSEO = createEntity('projeto_seo');
{
  "name": "ProjetoSEO",
  "type": "object",
  "properties": {
    "projeto": {
      "type": "string",
      "description": "Nome do projeto"
    },
    "cliente": {
      "type": "string",
      "description": "Nome do cliente/empresa"
    },
    "website": {
      "type": "string",
      "description": "URL do site a ser otimizado"
    },
    "contato_principal": {
      "type": "string"
    },
    "telefone": {
      "type": "string"
    },
    "email_cliente": {
      "type": "string"
    },
    "fase_atual": {
      "type": "string",
      "enum": [
        "analise",
        "planejamento",
        "execucao",
        "monitoramento",
        "relatorio"
      ],
      "default": "analise"
    },
    "status_operacional": {
      "type": "string",
      "enum": [
        "backlog",
        "em_andamento",
        "aguardando_cliente",
        "finalizado"
      ],
      "default": "backlog"
    },
    "plano_contratado": {
      "type": "string",
      "enum": [
        "basico",
        "intermediario",
        "avancado"
      ]
    },
    "receita_mensal": {
      "type": "number"
    },
    "data_inicio": {
      "type": "string",
      "format": "date"
    },
    "previsao_entrega": {
      "type": "string",
      "format": "date"
    },
    "responsavel": {
      "type": "string"
    },
    "kpis_meta": {
      "type": "string"
    },
    "observacoes": {
      "type": "string"
    },
    "diagnostico_inicial": {
      "type": "string"
    },
    "estrategia": {
      "type": "string"
    },
    "plano_execucao": {
      "type": "string"
    },
    "trafego_inicial": {
      "type": "number"
    },
    "trafego_atual": {
      "type": "number"
    }
  },
  "required": [
    "projeto",
    "cliente"
  ]
}