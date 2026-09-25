#!/usr/bin/env node
/**
 * Apply state-based schema blueprints in manifest order.
 * Usage: node database/scripts/apply-schema.mjs --env dev
 */
import {
  databaseRoot,
  loadJson,
  parseArgs,
  requireDatabaseUrl,
  runSqlFile,
} from './lib/runner.mjs';
import path from 'path';

const { env, dryRun } = parseArgs();
const order = await loadJson('config/schema-order.json');
const databaseUrl = requireDatabaseUrl();

console.log(`\n[PrimeOS DB] Applying schema (${env}) from ${databaseRoot}\n`);

for (const section of ['tables', 'views', 'functions', 'procedures']) {
  const files = order[section] ?? [];
  for (const file of files) {
    const fullPath = path.join(databaseRoot, 'schema', section, file);
    await runSqlFile(fullPath, databaseUrl, { dryRun });
    console.log(`  ✓ schema/${section}/${file}`);
  }
}

console.log('\n[PrimeOS DB] Schema apply complete.\n');
