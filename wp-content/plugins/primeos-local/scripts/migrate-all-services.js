// Migrates all 9 microservices databases sequentially
// Usage: node scripts/migrate-all-services.js
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const databaseUrl = process.env.DATABASE_URL || 'postgres://primeos:primeos_secret@localhost:5432/primeos_app';

const services = [
  'crm-x',
  'chan-x',
  'seg-x',
  'rev-x',
  'act-x',
  'value-x',
  'part-x',
  'res-x',
  'cost-x'
];

async function migrateAll() {
  console.log(`🚀 Connecting to PostgreSQL at ${databaseUrl}...`);
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  // Ensure non-superuser application role exists and has permissions
  console.log('🔒 Provisioning non-superuser application role primeos_app for RLS...');
  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'primeos_app') THEN
        CREATE ROLE primeos_app WITH LOGIN PASSWORD 'primeos_secret';
      END IF;
    END
    $$;
    GRANT ALL PRIVILEGES ON DATABASE primeos_app TO primeos_app;
    GRANT ALL ON SCHEMA public TO primeos_app;
  `);

  for (const svc of services) {
    const schemaPath = path.join(__dirname, '..', 'services', svc, 'db', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      console.log(`📦 Applying migration for [${svc}]...`);
      const sql = fs.readFileSync(schemaPath, 'utf8');
      try {
        await client.query(sql);
        console.log(`✅ [${svc}] schema applied successfully.`);
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log(`ℹ️  [${svc}] schema partially or already applied: ${err.message}`);
        } else {
          throw err;
        }
      }
    } else {
      console.warn(`⚠️  No schema.sql found for [${svc}] at ${schemaPath}`);
    }
  }

  // Grant privileges on all newly created tables to primeos_app and force RLS
  await client.query(`
    GRANT ALL ON ALL TABLES IN SCHEMA public TO primeos_app;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO primeos_app;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO primeos_app;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO primeos_app;
  `);

  // Force RLS on all public tables to prevent table owners from bypassing
  const tablesResult = await client.query(`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public';
  `);
  for (const row of tablesResult.rows) {
    await client.query(`ALTER TABLE "${row.tablename}" FORCE ROW LEVEL SECURITY;`);
  }

  await client.end();
  console.log('🎉 All 9 microservices migrated and RLS hardened successfully!');
}

migrateAll().catch((err) => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
