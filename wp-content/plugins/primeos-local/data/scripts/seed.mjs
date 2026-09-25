#!/usr/bin/env node
/**
 * Load seed data for an environment.
 * Usage: node database/scripts/seed.mjs --env dev
 */
import { loadJson, parseArgs, requireDatabaseUrl, listSqlFiles, runSqlFile } from './lib/runner.mjs';
import path from 'path';
import { databaseRoot } from './lib/runner.mjs';

const { env, dryRun } = parseArgs();
const config = await loadJson('config/environments.json');
const envConfig = config.environments[env];

if (!envConfig) {
  console.error(`Unknown environment: ${env}`);
  process.exit(1);
}

const databaseUrl = requireDatabaseUrl();
console.log(`\n[PrimeOS DB] Seeding (${env}) from ${envConfig.seedPath}\n`);

const files = await listSqlFiles(envConfig.seedPath);

for (const file of files) {
  await runSqlFile(file, databaseUrl, { dryRun });
  console.log(`  ✓ ${path.relative(databaseRoot, file)}`);
}

console.log('\n[PrimeOS DB] Seed complete.\n');
