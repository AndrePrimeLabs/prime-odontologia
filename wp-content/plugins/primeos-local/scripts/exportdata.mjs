import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabase = createClient(
  'https://foeahubnrbclbelsqikp.supabase.co',
  'https://foeahubnrbclbelsqikp.supabase.co',
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

async function exportData() {
  const output = {
    exported_at: new Date().toISOString(),
    app: 'Prime Odontologia',
    total_entities: Object.keys(tableMap).length,
    data: {}
  };

  console.log('🚀 Starting export...\n');

  for (const [entity, table] of Object.entries(tableMap)) {
    console.log(`📥 Exporting ${entity}...`);

    let allRecords = [];
    let page = 0;
    const pageSize = 1000;

    // paginate through all records
    while (true) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        console.error(`❌ Error exporting ${entity}:`, error.message);
        break;
      }

      if (!data || data.length === 0) break;

      allRecords = [...allRecords, ...data];

      if (data.length < pageSize) break;
      page++;
    }

    output.data[entity] = allRecords;
    console.log(`✅ ${entity}: ${allRecords.length} records`);
  }

  // save as JSON
  const outputDir = path.join(__dirname, '../data/exports');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const jsonPath = path.join(outputDir, `export_${timestamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
  console.log(`\n📄 JSON saved: ${jsonPath}`);

  // save each entity as CSV
  for (const [entity, records] of Object.entries(output.data)) {
    if (!records || records.length === 0) continue;

    const csvPath = path.join(outputDir, `${entity}_${timestamp}.csv`);
    const headers = Object.keys(records[0]).join(',');
    const rows = records.map(r =>
      Object.values(r).map(v => {
        if (v === null || v === undefined) return '';
        if (typeof v === 'object') return `"${JSON.stringify(v).replace(/"/g, '""')}"`;
        if (typeof v === 'string' && v.includes(',')) return `"${v}"`;
        return v;
      }).join(',')
    );

    fs.writeFileSync(csvPath, [headers, ...rows].join('\n'));
    console.log(`📊 CSV saved: ${entity}_${timestamp}.csv`);
  }

  // print summary
  console.log('\n========== EXPORT SUMMARY ==========');
  for (const [entity, records] of Object.entries(output.data)) {
    console.log(`${entity}: ${records?.length || 0} records`);
  }
  console.log('=====================================');
  console.log(`\n🎉 Export complete! Files saved to: ${outputDir}`);
}

exportData().catch(console.error);
