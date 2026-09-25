// Applies db/schema.sql against DATABASE_URL.
// Usage: npm run migrate
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  console.log('Applying schema.sql to', process.env.DATABASE_URL);
  await client.query(sql);
  console.log('✅ Schema applied.');
  await client.end();
}

main().catch((err) => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
