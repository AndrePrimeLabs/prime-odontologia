#!/usr/bin/env node
/**
 * Validate manifests and file presence (no DB connection).
 */
import { readFile, access } from 'fs/promises';
import path from 'path';
import { databaseRoot, loadJson } from './lib/runner.mjs';

const schemaOrder = await loadJson('config/schema-order.json');
const migrationOrder = await loadJson('config/migration-order.json');
let errors = 0;

async function checkFile(relPath) {
  try {
    await access(path.join(databaseRoot, relPath));
    return true;
  } catch {
    console.error(`  missing: ${relPath}`);
    errors++;
    return false;
  }
}

console.log('\n[PrimeOS DB] Validating repository structure\n');

for (const [section, files] of Object.entries(schemaOrder)) {
  if (section === 'description') continue;
  for (const file of files) {
    await checkFile(`schema/${section}/${file}`);
  }
}

for (const file of migrationOrder.migrations) {
  await checkFile(`migrations/${file}`);
}

const envConfig = await loadJson('config/environments.json');
const { readdir } = await import('fs/promises');
for (const [name, cfg] of Object.entries(envConfig.environments)) {
  const seedFiles = await readdir(path.join(databaseRoot, cfg.seedPath)).catch(() => []);
  console.log(`  ${name}: ${seedFiles.filter((f) => f.endsWith('.sql')).length} seed file(s)`);
}

if (errors) {
  console.error(`\n${errors} error(s)\n`);
  process.exit(1);
}

console.log('\n[PrimeOS DB] Validation passed.\n');
