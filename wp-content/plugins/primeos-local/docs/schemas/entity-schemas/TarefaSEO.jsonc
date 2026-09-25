import { createEntity } from './base';
export const TarefaSEO = createEntity('tarefa_seos');
{
  "name": "TarefaSEO",
  "type": "object",
  "properties": {
    "tarefa": {
      "type": "string",
      "description": "Nome da tarefa"
    },
    "projeto_id": {
      "type": "string",
      "description": "ID do Projeto SEO relacionado"
    },
    "projeto_nome": {
      "type": "string"
    },
    "tipo_atividade": {
      "type": "string",
      "enum": [
        "auditoria_tecnica",
        "pesquisa_palavrachave",
        "producao_conteudo",
        "link_building",
        "otimizacao_onpage",
        "relatorio"
      ],
      "default": "auditoria_tecnica"
    },
    "prioridade": {
      "type": "string",
      "enum": [
        "alta",
        "media",
        "baixa"
      ],
      "default": "media"
    },
    "responsavel": {
      "type": "string"
    },
    "prazo": {
      "type": "string",
      "format": "date"
    },
    "status": {
      "type": "string",
      "enum": [
        "a_fazer",
        "em_execucao",
        "revisao",
        "concluido"
      ],
      "default": "a_fazer"
    },
    "notas": {
      "type": "string"
    }
  },
  "required": [
    "tarefa",
    "projeto_id"
  ]
}