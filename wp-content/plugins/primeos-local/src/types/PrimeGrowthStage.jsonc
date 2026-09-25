import { createEntity } from './base';
export const PrimeGrowthStage = createEntity('prime_growth_stages');
{
  "name": "SalesScript",
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "categoria": {
      "type": "string",
      "enum": [
        "whatsapp",
        "invisalign",
        "implante",
        "clareamento",
        "objecoes",
        "follow_up",
        "confirmacao"
      ],
      "default": "whatsapp"
    },
    "tipo": {
      "type": "string",
      "enum": [
        "primeiro_contato",
        "qualificacao",
        "oferta",
        "fechamento",
        "follow_up",
        "objecao",
        "confirmacao"
      ],
      "default": "primeiro_contato"
    },
    "conteudo": {
      "type": "string"
    },
    "quando_usar": {
      "type": "string"
    },
    "dicas": {
      "type": "string"
    },
    "ordem": {
      "type": "number",
      "default": 0
    },
    "ativo": {
      "type": "boolean",
      "default": true
    }
  },
  "required": [
    "name",
    "categoria",
    "conteudo"
  ]
}{
  "name": "PrimeGrowthStage",
  "type": "object",
  "properties": {
    "stage_name": {
      "type": "string",
      "description": "Nome do est\u00e1gio"
    },
    "revenue_range": {
      "type": "string",
      "description": "Ex: R$5K \u2192 R$20K/m\u00eas"
    },
    "primary_focus": {
      "type": "string"
    },
    "core_objective": {
      "type": "string"
    },
    "status": {
      "type": "string",
      "enum": [
        "not_started",
        "active",
        "completed"
      ],
      "default": "not_started"
    },
    "receita_atual": {
      "type": "number"
    },
    "receita_meta": {
      "type": "number"
    },
    "avaliacoes_agendadas": {
      "type": "number"
    },
    "taxa_comparecimento": {
      "type": "number"
    },
    "taxa_fechamento": {
      "type": "number"
    },
    "leads_semana": {
      "type": "number"
    },
    "custo_por_lead": {
      "type": "number"
    },
    "notas": {
      "type": "string"
    }
  },
  "required": [
    "stage_name"
  ]
}