import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabase = createClient(
  'https://foeahubnrbclbelsqikp.supabase.co',
  'https://foeahubnrbclbelsqikp.supabase.co'
);

const tableMap = {
  PatientRecord: 'patient_records',
  Appointment: 'appointments',
  Dentist: 'dentists',
  Customer: 'customers',
  Lead: 'leads',
  Task: 'tasks',
  Product: 'products',
  FinancialTransaction: 'financial_transactions',
  Sale: 'sales',
  Interaction: 'interactions',
  ClinicalNote: 'clinical_notes',
  MedicalRecord: 'medical_records',
  POP: 'pops',
  SOP: 'sops',
  Activity: 'activities',
  Campaign: 'campaigns',
  CustomerSegment: 'customer_segments',
  Resource: 'resources',
  FollowUp: 'follow_ups',
  InventoryItem: 'inventory_items',
  SupportTicket: 'support_tickets',
};

async function importData() {
  const dbPath = path.join(__dirname, '../data/database.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  for (const [entity, table] of Object.entries(tableMap)) {
    const records = db.data[entity];
    if (!records || records.length === 0) {
      console.log(`Skipping ${entity} - no data`);
      continue;
    }
    console.log(`Importing ${records.length} ${entity} records...`);
    for (let i = 0; i < records.length; i += 50) {
      const chunk = records.slice(i, i + 50);
      const { error } = await supabase.from(table).upsert(chunk, { onConflict: 'id' });
      if (error) console.error(`Error importing ${entity}:`, error.message);
    }
    console.log(`${entity} done!`);
  }
  console.log('Import complete!');
}

importData().catch(console.error);
