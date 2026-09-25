#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const workspaceRoot = process.cwd();
const tasksRoot = path.join(workspaceRoot, '.openclaw', 'tasks');
const folders = {
  pending: path.join(tasksRoot, 'inbox'),
  active: path.join(tasksRoot, 'active'),
  done: path.join(tasksRoot, 'done'),
  blocked: path.join(tasksRoot, 'blocked'),
};

const allowedStatuses = new Set(Object.keys(folders));

function usage(exitCode = 0) {
  const text = `
OpenClaw <-> Codex task bridge

Usage:
  npm run openclaw:create -- --title "Task title" --summary "What to do"
  npm run openclaw:list
  npm run openclaw:show -- <task-id>
  npm run openclaw:start -- <task-id>
  npm run openclaw:complete -- <task-id> --summary "What changed"
  npm run openclaw:block -- <task-id> --summary "Why blocked"

Options for create:
  --title       Required short title
  --summary     Required task context
  --persona     clara | luzia | codex | primeos (default: codex)
  --kind        implementation | docs | review | research | deploy (default: implementation)
  --priority    low | normal | high | urgent (default: normal)
  --assignee    codex | openclaw | human (default: codex)
  --file        Related file path. Can be repeated.

Options for complete/block:
  --summary     Required result or blocker note
  --result      Optional report path or URL. Can be repeated.
`;
  console.log(text.trim());
  process.exit(exitCode);
}

function parseArgs(argv) {
  const positional = [];
  const options = {};

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      positional.push(token);
      continue;
    }

    const key = token.slice(2);
    const next = argv[i + 1];
    const value = next && !next.startsWith('--') ? next : true;
    if (value !== true) i += 1;

    if (key === 'file' || key === 'result') {
      options[key] = [...(options[key] ?? []), value];
    } else {
      options[key] = value;
    }
  }

  return { positional, options };
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'task';
}

function nowIso() {
  return new Date().toISOString();
}

async function ensureStructure() {
  await fs.mkdir(tasksRoot, { recursive: true });
  await Promise.all(Object.values(folders).map((folder) => fs.mkdir(folder, { recursive: true })));
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

async function findTaskFile(id) {
  await ensureStructure();
  for (const [status, folder] of Object.entries(folders)) {
    const filePath = path.join(folder, `${id}.json`);
    try {
      await fs.access(filePath);
      return { filePath, status };
    } catch {
      // Continue searching other status folders.
    }
  }
  throw new Error(`Task not found: ${id}`);
}

export async function listTasks(filterStatus) {
  await ensureStructure();
  const statuses = filterStatus ? [filterStatus] : Object.keys(folders);
  const tasks = [];

  for (const status of statuses) {
    if (!allowedStatuses.has(status)) throw new Error(`Unknown status: ${status}`);
    const entries = await fs.readdir(folders[status], { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
      const filePath = path.join(folders[status], entry.name);
      const task = await readJson(filePath);
      tasks.push({ ...task, _file: path.relative(workspaceRoot, filePath) });
    }
  }

  tasks.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  return tasks;
}

export async function createTask(options) {
  if (!options.title || !options.summary) {
    throw new Error('create requires --title and --summary');
  }

  await ensureStructure();
  const createdAt = nowIso();
  const compactStamp = createdAt.replace(/[-:.TZ]/g, '').slice(0, 14);
  const id = `${compactStamp}-${slugify(options.title)}`;
  const task = {
    schema_version: 1,
    id,
    title: String(options.title),
    status: 'pending',
    kind: String(options.kind ?? 'implementation'),
    priority: String(options.priority ?? 'normal'),
    persona: String(options.persona ?? 'codex'),
    assignee: String(options.assignee ?? 'codex'),
    created_at: createdAt,
    updated_at: createdAt,
    summary: String(options.summary),
    related_files: options.file ?? [],
    acceptance_criteria: [],
    results: [],
    notes: [],
  };

  const filePath = path.join(folders.pending, `${id}.json`);
  await writeJson(filePath, task);
  return { task, filePath: path.relative(workspaceRoot, filePath) };
}

export async function moveTask(id, nextStatus, options = {}) {
  if (!allowedStatuses.has(nextStatus)) throw new Error(`Unknown status: ${nextStatus}`);
  const { filePath, status: oldStatus } = await findTaskFile(id);
  const task = await readJson(filePath);
  const updatedAt = nowIso();

  task.status = nextStatus;
  task.updated_at = updatedAt;

  if (nextStatus === 'active' && !task.started_at) task.started_at = updatedAt;
  if (nextStatus === 'done') {
    if (!options.summary) throw new Error('complete requires --summary');
    task.completed_at = updatedAt;
    task.results = [
      ...(task.results ?? []),
      { at: updatedAt, summary: String(options.summary), links: options.result ?? [] },
    ];
  }
  if (nextStatus === 'blocked') {
    if (!options.summary) throw new Error('block requires --summary');
    task.blocked_at = updatedAt;
    task.notes = [
      ...(task.notes ?? []),
      { at: updatedAt, type: 'blocker', summary: String(options.summary), links: options.result ?? [] },
    ];
  }

  const nextPath = path.join(folders[nextStatus], `${id}.json`);
  await writeJson(nextPath, task);
  if (oldStatus !== nextStatus) await fs.unlink(filePath);
  return {
    task,
    oldStatus,
    nextStatus,
    filePath: path.relative(workspaceRoot, nextPath),
  };
}

export async function showTask(id) {
  const { filePath } = await findTaskFile(id);
  return readJson(filePath);
}

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  const { positional, options } = parseArgs(rest);

  if (!command || command === 'help' || command === '--help') usage();

  switch (command) {
    case 'create':
      {
        const result = await createTask(options);
        console.log(`Created ${result.task.id}`);
        console.log(result.filePath);
      }
      break;
    case 'list': {
      const tasks = await listTasks(options.status);
      if (tasks.length === 0) {
        console.log('No tasks found.');
        break;
      }
      for (const task of tasks) {
        console.log(`${task.status.padEnd(7)} ${task.priority.padEnd(6)} ${task.id} - ${task.title}`);
      }
      break;
    }
    case 'show':
      if (!positional[0]) throw new Error('show requires <task-id>');
      console.log(`${JSON.stringify(await showTask(positional[0]), null, 2)}\n`);
      break;
    case 'start':
      if (!positional[0]) throw new Error('start requires <task-id>');
      {
        const result = await moveTask(positional[0], 'active');
        console.log(`${positional[0]}: ${result.oldStatus} -> ${result.nextStatus}`);
        console.log(result.filePath);
      }
      break;
    case 'complete':
      if (!positional[0]) throw new Error('complete requires <task-id>');
      {
        const result = await moveTask(positional[0], 'done', options);
        console.log(`${positional[0]}: ${result.oldStatus} -> ${result.nextStatus}`);
        console.log(result.filePath);
      }
      break;
    case 'block':
      if (!positional[0]) throw new Error('block requires <task-id>');
      {
        const result = await moveTask(positional[0], 'blocked', options);
        console.log(`${positional[0]}: ${result.oldStatus} -> ${result.nextStatus}`);
        console.log(result.filePath);
      }
      break;
    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

const isCli = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isCli) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
