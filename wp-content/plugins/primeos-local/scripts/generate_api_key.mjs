#!/usr/bin/env node
/**
 * generate_api_key.mjs
 *
 * Usage:
 *   node scripts/generate_api_key.mjs --owner <owner_uuid> --name <name> --scopes read:patient_profile,write:models [--apply]
 *
 * If --apply is provided and DATABASE_URL env var is set and `psql` is available in PATH,
 * the SQL will be executed automatically. Otherwise the SQL is printed for manual execution.
 */

import crypto from 'crypto';

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--owner' && args[i+1]) { out.owner = args[++i]; }
    else if (a === '--name' && args[i+1]) { out.name = args[++i]; }
    else if (a === '--scopes' && args[i+1]) { out.scopes = args[++i]; }
    else if (a === '--apply') { out.apply = true; }
    else if (a === '--help' || a === '-h') { out.help = true; }
  }
  return out;
}

async function main() {
  const opts = parseArgs();
  if (opts.help) {
    console.log('Usage: node scripts/generate_api_key.mjs --owner <owner_uuid> --name <name> --scopes scope1,scope2 [--apply]');
    process.exit(0);
  }

  const key = crypto.randomUUID();
  const owner = opts.owner || null;
  const name = opts.name || 'generated-key';
  const scopes = opts.scopes ? opts.scopes.split(',').map(s => s.trim()).filter(Boolean) : [];

  const scopesSql = scopes.length ? `ARRAY[${scopes.map(s => `'${quoteSql(s)}'`).join(', ')}]` : "ARRAY[]::text[]";
  const ownerSql = owner ? `'${quoteSql(owner)}'` : 'NULL';
  const nameSql = name ? `'${quoteSql(name)}'` : 'NULL';

  const sql = `INSERT INTO api_keys (key, owner_user_id, name, scopes, created_at) VALUES ('${key}', ${ownerSql}, ${nameSql}, ${scopesSql}, now());`;

  console.log('\n--- API Key Generated ---');
  console.log('key:', key);
  console.log('owner_user_id:', owner || '(none)');
  console.log('name:', name);
  console.log('scopes:', scopes.length ? scopes.join(',') : '(none)');
  console.log('');
  console.log('SQL to run:');
  console.log(sql);
  console.log('');

  if (opts.apply) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.error('Cannot --apply: DATABASE_URL environment variable is not set.');
      process.exit(2);
    }

    // Check psql availability
    const which = spawnSync('psql', ['--version']);
    if (which.error) {
      console.error('psql not found in PATH. Install psql or run the SQL manually.');
      process.exit(3);
    }

    console.log('Applying SQL via psql...');
    const execRes = spawnSync('psql', [dbUrl, '-c', sql], { stdio: 'inherit' });
    if (execRes.status !== 0) {
      console.error('psql exited with code', execRes.status);
      process.exit(execRes.status || 4);
    }
    console.log('Inserted API key into database.');
  } else {
    console.log('To insert automatically, set DATABASE_URL and pass --apply.');
  }

  console.log('\nKeep the key secret. Use it in header: x-primeos-key: <key>');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(10);
});
