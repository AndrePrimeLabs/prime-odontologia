// Loads ../../../data-export/customers.csv into the customers table.
//
// Expected CSV columns (rename in your export if they differ):
//   name,email,phone
//
// A tenant_id must be supplied since Base44 exports are single-tenant —
// pass it as an env var or command-line arg so every seeded row is
// correctly scoped from day one.
//
// Usage:
//   TENANT_ID=<uuid> npm run seed

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { Pool } = require('pg');

const TENANT_ID = process.env.TENANT_ID;
if (!TENANT_ID) {
  console.error('❌ Set TENANT_ID env var before seeding, e.g.:');
  console.error('   TENANT_ID=00000000-0000-0000-0000-000000000001 npm run seed');
  process.exit(1);
}

const CSV_PATH = path.join(__dirname, '../../../data-export/customers.csv');

async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`❌ No file found at ${CSV_PATH}`);
    console.error('   Export your customers collection from Base44 (Dashboard → Data → Export) and place it there.');
    process.exit(1);
  }

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!UUID_REGEX.test(TENANT_ID)) {
    console.error('❌ TENANT_ID must be a valid UUID');
    process.exit(1);
  }

  const raw = fs.readFileSync(CSV_PATH, 'utf8');
  const records = parse(raw, { columns: true, skip_empty_lines: true });

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    // Set tenant context via parameterized query so RLS allows these inserts
    await client.query("SELECT set_config('app.current_tenant', $1, true)", [TENANT_ID]);

    let count = 0;
    for (const row of records) {
      await client.query(
        `INSERT INTO customers (tenant_id, name, email, phone) VALUES ($1, $2, $3, $4)`,
        [TENANT_ID, row.name || row.Name, row.email || row.Email, row.phone || row.Phone]
      );
      count++;
    }

    await client.query('COMMIT');
    console.log(`✅ Seeded ${count} customers for tenant ${TENANT_ID}`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
