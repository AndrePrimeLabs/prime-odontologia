#!/usr/bin/env node
/**
 * Run incremental migrations in version order (skips already applied).
 * Usage: node database/scripts/migrate.mjs --env dev
 */
import {
  loadJson,
  parseArgs,
  requireDatabaseUrl,
  runSqlFile,
} from './lib/runner.mjs';
import path from 'path';
import { databaseRoot } from './lib/runner.mjs';

const { env, dryRun } = parseArgs();
const { migrations } = await loadJson('config/migration-order.json');
const databaseUrl = requireDatabaseUrl();

console.log(`\n[PrimeOS DB] Migrating (${env})\n`);

for (const file of migrations) {
  const fullPath = path.join(databaseRoot, 'migrations', file);
  try {
    await runSqlFile(fullPath, databaseUrl, { dryRun });
    console.log(`  ✓ ${file}`);
  } catch (error) {
    console.error(`  ✗ ${file}:`, error.message);
    process.exit(1);
  }
}

console.log('\n[PrimeOS DB] Migrations complete.\n');
