import { createEntity } from './base';
export const Document = createEntity('documents');
{
  "name": "Document",
  "type": "object",
  "properties": {
    "patient_id": {
      "type": "string"
    },
    "patient_name": {
      "type": "string"
    },
    "document_type": {
      "type": "string",
      "enum": [
        "termo_consentimento",
        "termo_responsabilidade",
        "autorizacao_imagem",
        "pre_operatorio",
        "pos_operatorio",
        "orcamento",
        "receita",
        "atestado",
        "declaracao",
        "contrato",
        "outro"
      ],
      "default": "termo_consentimento"
    },
    "title": {
      "type": "string"
    },
    "content": {
      "type": "string",
      "description": "Conte\u00fado do documento"
    },
    "file_url": {
      "type": "string",
      "description": "URL do arquivo PDF/imagem"
    },
    "status": {
      "type": "string",
      "enum": [
        "pendente",
        "enviado",
        "assinado",
        "arquivado"
      ],
      "default": "pendente"
    },
    "signed_at": {
      "type": "string",
      "format": "date"
    },
    "signature_url": {
      "type": "string"
    },
    "sent_via": {
      "type": "string",
      "enum": [
        "whatsapp",
        "email",
        "presencial"
      ],
      "default": "whatsapp"
    }
  },
  "required": [
    "patient_id",
    "patient_name",
    "document_type",
    "title"
  ]
}