import { readFile, readdir } from 'fs/promises';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const databaseRoot = path.resolve(__dirname, '../..');

export function parseArgs(argv = process.argv.slice(2)) {
  const args = { env: 'dev', dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--env' && argv[i + 1]) args.env = argv[++i];
    if (argv[i] === '--dry-run') args.dryRun = true;
  }
  return args;
}

export async function loadJson(relativePath) {
  const raw = await readFile(path.join(databaseRoot, relativePath), 'utf8');
  return JSON.parse(raw);
}

export async function listSqlFiles(dirRelative) {
  const dir = path.join(databaseRoot, dirRelative);
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith('.sql'))
    .map((e) => path.join(dir, e.name))
    .sort();
}

export async function runSqlFile(filePath, databaseUrl, { dryRun = false } = {}) {
  const sql = await readFile(filePath, 'utf8');
  const name = path.relative(databaseRoot, filePath);

  if (dryRun) {
    console.log(`[dry-run] would execute: ${name}`);
    return { ok: true, file: name };
  }

  return new Promise((resolve, reject) => {
    const child = spawn('psql', [databaseUrl, '-v', 'ON_ERROR_STOP=1', '-f', filePath], {
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    child.on('error', (err) => {
      if (err.code === 'ENOENT') {
        reject(
          new Error(
            `psql not found. Install PostgreSQL client or run manually:\n  psql "$DATABASE_URL" -f "${filePath}"`
          )
        );
      } else {
        reject(err);
      }
    });
    child.on('close', (code) => {
      if (code === 0) resolve({ ok: true, file: name });
      else reject(new Error(`Failed (${code}): ${name}`));
    });
  });
}

export function requireDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set. Add it to .env.local at the repo root.');
  }
  return url;
}
