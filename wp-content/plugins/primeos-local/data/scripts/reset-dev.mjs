#!/usr/bin/env node
/**
 * Dev pipeline: schema → migrations → dev seeds
 * Usage: node database/scripts/reset-dev.mjs
 */
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptsDir = __dirname;

function run(script, extraArgs = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(scriptsDir, script), '--env', 'dev', ...extraArgs], {
      stdio: 'inherit',
    });
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${script} exited ${code}`))));
  });
}

console.log('\n[PrimeOS DB] Dev reset pipeline\n');

await run('apply-schema.mjs');
await run('migrate.mjs');
await run('seed.mjs');

console.log('[PrimeOS DB] Dev reset complete.\n');
