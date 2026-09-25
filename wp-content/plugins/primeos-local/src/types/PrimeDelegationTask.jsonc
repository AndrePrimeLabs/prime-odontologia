import { createEntity } from './base';
export const PrimeDelegationTask = createEntity('prime_delegation_tasks');
{
  "name": "PrimeDelegationTask",
  "type": "object",
  "properties": {
    "tarefa": {
      "type": "string"
    },
    "sistema": {
      "type": "string",
      "enum": [
        "marketing",
        "comercial",
        "clinica",
        "experiencia_paciente",
        "financeiro",
        "gestao"
      ],
      "default": "gestao"
    },
    "atual_responsavel": {
      "type": "string"
    },
    "responsavel_ideal": {
      "type": "string"
    },
    "frequencia": {
      "type": "string",
      "enum": [
        "diaria",
        "semanal",
        "mensal",
        "trimestral",
        "ad_hoc"
      ],
      "default": "semanal"
    },
    "frequency_score": {
      "type": "number",
      "description": "1-5"
    },
    "annoyance_level": {
      "type": "number",
      "description": "1-5"
    },
    "impact_on_business": {
      "type": "number",
      "description": "1-5"
    },
    "simplicity_to_delegate": {
      "type": "number",
      "description": "1-5"
    },
    "dps_score": {
      "type": "number",
      "description": "Delegation Priority Score (soma dos 4 scores)"
    },
    "documentado": {
      "type": "boolean",
      "default": false
    },
    "delegado": {
      "type": "boolean",
      "default": false
    },
    "tipo_documentacao": {
      "type": "string",
      "enum": [
        "video",
        "written_sop",
        "checklist",
        "decision_tree"
      ]
    },
    "sop_link": {
      "type": "string"
    },
    "status": {
      "type": "string",
      "enum": [
        "brain_dump",
        "scored",
        "assigned",
        "documented",
        "delegated",
        "optimized"
      ],
      "default": "brain_dump"
    },
    "notas": {
      "type": "string"
    }
  },
  "required": [
    "tarefa"
  ]
}