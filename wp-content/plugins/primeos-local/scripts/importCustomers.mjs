import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabase = createClient(
  'https://foeahubnrbclbelsqikp.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Convert MongoDB ObjectID to UUID format
function toUUID(id) {
  if (!id) return undefined;
  if (id.includes('-')) return id; // already a UUID
  // pad to 32 chars and format as UUID
  const padded = id.padEnd(32, '0');
  return `${padded.slice(0,8)}-${padded.slice(8,12)}-${padded.slice(12,16)}-${padded.slice(16,20)}-${padded.slice(20,32)}`;
}

function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());

  return lines.slice(1).map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') {
        inQuotes = !inQuotes;
      } else if (line[i] === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += line[i];
      }
    }
    values.push(current.trim());

    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || null;
    });
    return record;
  });
}

function transformCustomer(row) {
  return {
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
    lifetime_value: parseFloat(row.lifetime_value) || 0,
    last_contact_date: row.last_contact_date || null,
    tags: row.tags ? (row.tags === '[]' ? [] : JSON.parse(row.tags)) : [],
    interests: row.interests ? (row.interests === '[]' ? [] : JSON.parse(row.interests)) : [],
    custom_fields: row.custom_fields || null,
    birth_date: row.birth_date || null,
    is_sample: row.is_sample === 'true',
    created_date: row.created_date || new Date().toISOString(),
    updated_date: row.updated_date || new Date().toISOString(),
  };
}

async function importCustomers() {
  const csvPath = path.join(__dirname, '../data/Customer.csv');
  const content = fs.readFileSync(csvPath, 'utf8');

  console.log('📄 Parsing Customer.csv...');
  const rows = parseCSV(content);
  console.log(`Found ${rows.length} customers\n`);

  const customers = rows.map(transformCustomer);

  let success = 0;
  let errors = 0;

  for (const customer of customers) {
    const { error } = await supabase
      .from('customers')
      .upsert(customer, { onConflict: 'id' });

    if (error) {
      console.error(`❌ Error importing ${customer.name}:`, error.message);
      errors++;
    } else {
      console.log(`✅ Imported: ${customer.name}`);
      success++;
    }
  }

  console.log('\n========== SUMMARY ==========');
  console.log(`✅ Success: ${success}`);
  console.log(`❌ Errors:  ${errors}`);
  console.log(`📊 Total:   ${rows.length}`);
  console.log('==============================');
}

importCustomers().catch(console.error);