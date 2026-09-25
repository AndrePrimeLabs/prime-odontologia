import { createEntity } from './base';
export const Appointment = createEntity('appointments');
{
  "name": "Appointment",
  "type": "object",
  "properties": {
    "patient_id": {
      "type": "string",
      "description": "Related customer/patient ID"
    },
    "patient_name": {
      "type": "string"
    },
    "patient_phone": {
      "type": "string"
    },
    "service_type": {
      "type": "string",
      "enum": [
        "consultation",
        "follow_up",
        "procedure",
        "checkup",
        "emergency",
        "therapy",
        "diagnostic"
      ],
      "default": "consultation"
    },
    "date": {
      "type": "string",
      "format": "date"
    },
    "time": {
      "type": "string"
    },
    "duration_minutes": {
      "type": "number",
      "default": 30
    },
    "status": {
      "type": "string",
      "enum": [
        "scheduled",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "no_show"
      ],
      "default": "scheduled"
    },
    "provider": {
      "type": "string",
      "description": "Doctor or healthcare provider name"
    },
    "dentist_id": {
      "type": "string",
      "description": "ID do dentista respons\u00e1vel"
    },
    "resource_id": {
      "type": "string",
      "description": "ID do recurso (cadeira/sala)"
    },
    "resource_name": {
      "type": "string",
      "description": "Nome do recurso"
    },
    "notes": {
      "type": "string"
    },
    "reminder_sent": {
      "type": "boolean",
      "default": false
    },
    "reminder_confirmed": {
      "type": "string",
      "enum": [
        "pending",
        "confirmed",
        "reschedule_requested",
        "cancelled"
      ],
      "default": "pending"
    },
    "follow_up_required": {
      "type": "boolean",
      "default": false
    },
    "follow_up_days": {
      "type": "number"
    },
    "follow_up_notes": {
      "type": "string"
    },
    "ehr_synced": {
      "type": "boolean",
      "default": false
    },
    "ehr_sync_date": {
      "type": "string",
      "format": "date-time"
    },
    "ehr_id": {
      "type": "string"
    },
    "ehr_system": {
      "type": "string"
    },
    "price": {
      "type": "number",
      "description": "Valor cobrado pela consulta (R$)"
    },
    "payment_status": {
      "type": "string",
      "enum": [
        "pending",
        "paid",
        "waived",
        "partial"
      ],
      "default": "pending",
      "description": "Status do pagamento"
    },
    "payment_method": {
      "type": "string",
      "enum": [
        "dinheiro",
        "pix",
        "cartao_credito",
        "cartao_debito",
        "convenio",
        "outro"
      ],
      "description": "Forma de pagamento"
    },
    "payment_date": {
      "type": "string",
      "format": "date",
      "description": "Data do pagamento"
    },
    "invoice_number": {
      "type": "string",
      "description": "N\u00famero do recibo/fatura"
    }
  },
  "required": [
    "patient_name",
    "date",
    "service_type"
  ]
}