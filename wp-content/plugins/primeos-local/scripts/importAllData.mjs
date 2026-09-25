import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.SUPABASE_URL || 'https://foeahubnrbclbelsqikp.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Convert MongoDB ObjectID to UUID
function toUUID(id) {
  if (!id) return undefined;
  if (id.includes('-')) return id;
  const padded = id.padEnd(32, '0');
  return `${padded.slice(0,8)}-${padded.slice(8,12)}-${padded.slice(12,16)}-${padded.slice(16,20)}-${padded.slice(20,32)}`;
}

// Safe JSON parse
function safeJSON(val, fallback = []) {
  if (!val || val === '' || val === '[]' || val === '{}') return fallback;
  try { return JSON.parse(val); } catch { return fallback; }
}

// Safe float
function safeFloat(val) {
  const f = parseFloat(val);
  return isNaN(f) ? 0 : f;
}

// Safe int
function safeInt(val) {
  const i = parseInt(val);
  return isNaN(i) ? 0 : i;
}

// Safe date
function safeDate(val) {
  if (!val || val.trim() === '') return null;
  return val.trim();
}

function parseRow(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

function parseCSV(content) {
  const lines = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if (char === '\n' && !inQuotes) {
      lines.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) lines.push(current);

  // Guard against empty file
  if (lines.length === 0) return [];
  
  const headers = parseRow(lines[0]);
  if (!headers || headers.length === 0) return [];

  return lines.slice(1)
    .filter(line => line && line.trim())
    .map(line => {
      const values = parseRow(line);
      const record = {};
      headers.forEach((header, index) => {
        record[header] = values[index] ?? null;
      });
      return record;
    });
}

// Transform functions per entity
const transformers = {
  Customer: row => ({
    id: toUUID(row.id),
    name: row.name || null,
    email: row.email || null,
    phone: row.phone || null,
    company: row.company || null,
    profession: row.profession || null,
    city: row.city || null,
    state: row.state || null,
    source: row.source || null,
    segment: row.segment || null,
    value_tier: row.value_tier || null,
    status: row.status || 'active',
    notes: row.notes || null,
    lifetime_value: safeFloat(row.lifetime_value),
    last_contact_date: safeDate(row.last_contact_date),
    tags: safeJSON(row.tags, []),
    interests: safeJSON(row.interests, []),
    custom_fields: row.custom_fields || null,
    birth_date: safeDate(row.birth_date),
    is_sample: row.is_sample === 'true',
    created_date: safeDate(row.created_date),
    updated_date: safeDate(row.updated_date),
  }),

  Appointment: row => ({
    id: toUUID(row.id),
    date: safeDate(row.date),
    time: row.time || null,
    duration_minutes: safeInt(row.duration_minutes),
    patient_id: toUUID(row.patient_id),
    patient_name: row.patient_name || null,
    patient_phone: row.patient_phone || null,
    dentist_id: toUUID(row.dentist_id),
    resource_id: toUUID(row.resource_id),
    resource_name: row.resource_name || null,
    service_type: row.service_type || null,
    status: row.status || 'scheduled',
    payment_status: row.payment_status || 'pending',
    payment_method: row.payment_method || null,
    payment_date: safeDate(row.payment_date),
    price: safeFloat(row.price),
    notes: row.notes ? String(row.notes).replace(/\n/g, ' ').trim() : null,
    follow_up_required: row.follow_up_required === 'true',
    follow_up_notes: row.follow_up_notes || null,
    reminder_sent: row.reminder_sent === 'true',
    is_sample: row.is_sample === 'true',
    created_date: safeDate(row.created_date),
    updated_date: safeDate(row.updated_date),
  }),

  Lead: row => ({
    id: toUUID(row.id),
    name: row.name || null,
    email: row.email || null,
    phone: row.phone || null,
    status: row.status || 'novo',
    temperatura: row.temperatura || null,
    interesse: row.interesse || null,
    segmento: row.segmento || null,
    fonte_original: row.fonte_original || null,
    canal_conversao: row.canal_conversao || null,
    lead_score: safeFloat(row.lead_score),
    valor_estimado: safeFloat(row.valor_estimado),
    lifetime_value: safeFloat(row.lifetime_value),
    tags: safeJSON(row.tags, []),
    notas: row.notas || row.notes || null,
    is_sample: row.is_sample === 'true',
    created_date: safeDate(row.created_date),
    updated_date: safeDate(row.updated_date),
  }),

  Task: row => ({
    id: toUUID(row.id),
    titulo: row.titulo || row.title || null,
    descricao: row.descricao || row.description || null,
    status: row.status || 'pendente',
    prioridade: row.prioridade || row.priority || 'media',
    categoria: row.categoria || row.category || null,
    progresso: safeInt(row.progresso || row.progress),
    data_vencimento: safeDate(row.data_vencimento || row.due_date),
    data_conclusao: safeDate(row.data_conclusao),
    responsaveis: safeJSON(row.responsaveis, []),
    checklist: safeJSON(row.checklist, []),
    observacoes: row.observacoes || null,
    is_sample: row.is_sample === 'true',
    created_date: safeDate(row.created_date),
    updated_date: safeDate(row.updated_date),
  }),

  PatientRecord: row => ({
    id: toUUID(row.id),
    patient_name: row.patient_name || null,
    patient_email: row.patient_email || null,
    patient_phone: row.patient_phone || null,
    patient_id: row.patient_id || null,
    date_of_birth: safeDate(row.date_of_birth),
    blood_type: row.blood_type || null,
    allergies: safeJSON(row.allergies, []),
    current_medications: safeJSON(row.current_medications, []),
    medical_conditions: safeJSON(row.medical_conditions, []),
    notes: row.notes || null,
    status: row.status || 'active',
    is_sample: row.is_sample === 'true',
    created_date: safeDate(row.created_date),
    updated_date: safeDate(row.updated_date),
  }),

  Dentist: row => ({
    id: toUUID(row.id),
    name: row.name || null,
    email: row.email || null,
    phone: row.phone || null,
    cro: row.cro || null,
    specialty: row.specialty || null,
    color: row.color || null,
    slot_duration_minutes: safeInt(row.slot_duration_minutes) || 30,
    is_active: row.is_active !== 'false',
    notes: row.notes || null,
    is_sample: row.is_sample === 'true',
    created_date: safeDate(row.created_date),
    updated_date: safeDate(row.updated_date),
  }),

  Product: row => ({
    id: toUUID(row.id),
    name: row.name || null,
    description: row.description || null,
    category: row.category || null,
    sku: row.sku || null,
    price: safeFloat(row.price),
    cost: safeFloat(row.cost),
    stock_quantity: safeInt(row.stock_quantity),
    min_stock_level: safeInt(row.min_stock_level),
    status: row.status || 'active',
    is_sample: row.is_sample === 'true',
    created_date: safeDate(row.created_date),
    updated_date: safeDate(row.updated_date),
  }),

  FinancialTransaction: row => ({
    id: toUUID(row.id),
    description: row.description || null,
    type: row.type || null,
    category: row.category || null,
    amount: safeFloat(row.amount),
    amount_paid: safeFloat(row.amount_paid),
    status: row.status || 'pending',
    date: safeDate(row.date),
    due_date: safeDate(row.due_date),
    payment_method: row.payment_method || null,
    payment_date: safeDate(row.payment_date),
    patient_id: toUUID(row.patient_id),
    patient_name: row.patient_name || null,
    notes: row.notes || null,
    is_sample: row.is_sample === 'true',
    created_date: safeDate(row.created_date),
    updated_date: safeDate(row.updated_date),
  }),

  POP: row => ({
    id: toUUID(row.id),
    codigo: row.codigo || null,
    nome: row.nome || row.name || null,
    objetivo: row.objetivo || null,
    descricao: row.descricao || null,
    responsavel: row.responsavel || null,
    categoria: row.categoria || null,
    status: row.status || 'ativo',
    checklist: safeJSON(row.checklist, []),
    tags: safeJSON(row.tags, []),
    is_sample: row.is_sample === 'true',
    created_date: safeDate(row.created_date),
    updated_date: safeDate(row.updated_date),
  }),

  SOP: row => ({
    id: toUUID(row.id),
    name: row.name || null,
    area: row.area || null,
    owner: row.owner || null,
    goal: row.goal || null,
    status: row.status || 'active',
    content: safeJSON(row.content, {}),
    is_sample: row.is_sample === 'true',
    created_date: safeDate(row.created_date),
    updated_date: safeDate(row.updated_date),
  }),

  Campaign: row => ({
    id: toUUID(row.id),
    name: row.name || null,
    status: row.status || 'draft',
    oferta: row.oferta || null,
    orcamento: safeFloat(row.orcamento),
    data_inicio: safeDate(row.data_inicio),
    data_fim: safeDate(row.data_fim),
    meta_leads: safeInt(row.meta_leads),
    is_sample: row.is_sample === 'true',
    created_date: safeDate(row.created_date),
    updated_date: safeDate(row.updated_date),
  }),

  Interaction: row => ({
    id: toUUID(row.id),
    customer_id: toUUID(row.customer_id),
    type: row.type || null,
    subject: row.subject || null,
    description: row.description || null,
    outcome: row.outcome || null,
    next_action: row.next_action || null,
    next_action_date: safeDate(row.next_action_date),
    is_sample: row.is_sample === 'true',
    created_date: safeDate(row.created_date),
    updated_date: safeDate(row.updated_date),
  }),

  Sale: row => ({
    id: toUUID(row.id),
    customer_id: toUUID(row.customer_id),
    customer_name: row.customer_name || null,
    products: safeJSON(row.products, []),
    total_amount: safeFloat(row.total_amount),
    status: row.status || 'pending',
    payment_status: row.payment_status || 'pending',
    channel: row.channel || null,
    notes: row.notes || null,
    is_sample: row.is_sample === 'true',
    created_date: safeDate(row.created_date),
    updated_date: safeDate(row.updated_date),
  }),

  InventoryItem: row => ({
    id: toUUID(row.id),
    name: row.name || null,
    category: row.category || null,
    sku: row.sku || null,
    quantity: safeInt(row.quantity),
    min_quantity: safeInt(row.min_quantity),
    unit_price: safeFloat(row.unit_price),
    supplier: row.supplier || null,
    status: row.status || 'active',
    notes: row.notes || null,
    is_sample: row.is_sample === 'true',
    created_date: safeDate(row.created_date),
    updated_date: safeDate(row.updated_date),
  }),

  SupportTicket: row => ({
    id: toUUID(row.id),
    title: row.title || null,
    description: row.description || null,
    status: row.status || 'open',
    priority: row.priority || 'medium',
    customer_id: toUUID(row.customer_id),
    customer_name: row.customer_name || null,
    assigned_to: row.assigned_to || null,
    notes: row.notes || null,
    is_sample: row.is_sample === 'true',
    created_date: safeDate(row.created_date),
    updated_date: safeDate(row.updated_date),
  }),
};

// Map entity name to Supabase table
const tableMap = {
  Customer: 'customers',
  Appointment: 'appointments',
  Lead: 'leads',
  Task: 'tasks',
  PatientRecord: 'patient_records',
  Dentist: 'dentists',
  Product: 'products',
  FinancialTransaction: 'financial_transactions',
  POP: 'pops',
  SOP: 'sops',
  Campaign: 'campaigns',
  Interaction: 'interactions',
  Sale: 'sales',
  InventoryItem: 'inventory_items',
  SupportTicket: 'support_tickets',
};

async function importEntity(entityName, tableName) {
  const csvPath = path.join(__dirname, `../data/${entityName}.csv`);

  if (!fs.existsSync(csvPath)) {
    console.log(`⚠️  Skipping ${entityName} - file not found: ${csvPath}`);
    return { success: 0, errors: 0, total: 0 };
  }

  const content = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(content);
  const transformer = transformers[entityName];

  if (!transformer) {
    console.log(`⚠️  Skipping ${entityName} - no transformer defined`);
    return { success: 0, errors: 0, total: 0 };
  }

  const records = rows.map(transformer);
  let success = 0;
  let errors = 0;

  for (const record of records) {
    const { error } = await supabase
      .from(tableName)
      .upsert(record, { onConflict: 'id' });

    if (error) {
      console.error(`  ❌ ${record.name || record.titulo || record.nome || record.id}:`, error.message);
      errors++;
    } else {
      success++;
    }
  }

  return { success, errors, total: rows.length };
}

async function importAll() {
  console.log('🚀 Starting full data import...\n');

  const results = {};

  for (const [entity, table] of Object.entries(tableMap)) {
    console.log(`📥 Importing ${entity}...`);
    const result = await importEntity(entity, table);
    results[entity] = result;
    console.log(`   ✅ ${result.success}/${result.total} imported\n`);
  }

  console.log('\n========== FINAL SUMMARY ==========');
  let totalSuccess = 0;
  let totalErrors = 0;
  for (const [entity, result] of Object.entries(results)) {
    console.log(`${entity}: ${result.success}✅  ${result.errors}❌  (${result.total} total)`);
    totalSuccess += result.success;
    totalErrors += result.errors;
  }
  console.log('------------------------------------');
  console.log(`TOTAL: ${totalSuccess}✅  ${totalErrors}❌`);
  console.log('====================================');
}

importAll().catch(console.error);