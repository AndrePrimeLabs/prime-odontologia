#!/usr/bin/env node
import process from 'node:process';
import { createTask, listTasks, moveTask, showTask } from './openclaw-task.mjs';

const encoder = new TextEncoder();
let buffer = Buffer.alloc(0);

const tools = [
  {
    name: 'openclaw_list_tasks',
    description: 'List OpenClaw bridge tasks across inbox, active, done, and blocked folders.',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['pending', 'active', 'done', 'blocked'],
          description: 'Optional task status filter.',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'openclaw_show_task',
    description: 'Show one OpenClaw bridge task by id.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'openclaw_create_task',
    description: 'Create a pending OpenClaw bridge task for Codex, OpenClaw, or a human.',
    inputSchema: {
      type: 'object',
      required: ['title', 'summary'],
      properties: {
        title: { type: 'string' },
        summary: { type: 'string' },
        persona: { type: 'string', enum: ['clara', 'luzia', 'codex', 'primeos'] },
        kind: { type: 'string', enum: ['implementation', 'docs', 'review', 'research', 'deploy'] },
        priority: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'] },
        assignee: { type: 'string', enum: ['codex', 'openclaw', 'human'] },
        file: {
          type: 'array',
          items: { type: 'string' },
          description: 'Related local file paths.',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'openclaw_start_task',
    description: 'Move a task to active.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'openclaw_complete_task',
    description: 'Move a task to done and attach a completion summary.',
    inputSchema: {
      type: 'object',
      required: ['id', 'summary'],
      properties: {
        id: { type: 'string' },
        summary: { type: 'string' },
        result: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional result paths or URLs.',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'openclaw_block_task',
    description: 'Move a task to blocked and attach a blocker summary.',
    inputSchema: {
      type: 'object',
      required: ['id', 'summary'],
      properties: {
        id: { type: 'string' },
        summary: { type: 'string' },
        result: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional supporting paths or URLs.',
        },
      },
      additionalProperties: false,
    },
  },
];

function send(message) {
  const body = JSON.stringify(message);
  const bytes = encoder.encode(body);
  process.stdout.write(`Content-Length: ${bytes.byteLength}\r\n\r\n${body}`);
}

function toolResponse(data) {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

async function callTool(name, args = {}) {
  switch (name) {
    case 'openclaw_list_tasks':
      return toolResponse(await listTasks(args.status));
    case 'openclaw_show_task':
      return toolResponse(await showTask(args.id));
    case 'openclaw_create_task':
      return toolResponse(await createTask(args));
    case 'openclaw_start_task':
      return toolResponse(await moveTask(args.id, 'active'));
    case 'openclaw_complete_task':
      return toolResponse(await moveTask(args.id, 'done', args));
    case 'openclaw_block_task':
      return toolResponse(await moveTask(args.id, 'blocked', args));
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function handle(message) {
  if (!message || typeof message !== 'object') return;
  if (!message.id && String(message.method || '').startsWith('notifications/')) return;

  try {
    if (message.method === 'initialize') {
      send({
        jsonrpc: '2.0',
        id: message.id,
        result: {
          protocolVersion: message.params?.protocolVersion ?? '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: {
            name: 'primeos-openclaw-codex-bridge',
            version: '1.0.0',
          },
        },
      });
      return;
    }

    if (message.method === 'tools/list') {
      send({ jsonrpc: '2.0', id: message.id, result: { tools } });
      return;
    }

    if (message.method === 'tools/call') {
      const result = await callTool(message.params?.name, message.params?.arguments ?? {});
      send({ jsonrpc: '2.0', id: message.id, result });
      return;
    }

    send({
      jsonrpc: '2.0',
      id: message.id,
      error: { code: -32601, message: `Method not found: ${message.method}` },
    });
  } catch (error) {
    send({
      jsonrpc: '2.0',
      id: message.id,
      error: {
        code: -32000,
        message: error instanceof Error ? error.message : String(error),
      },
    });
  }
}

function parseMessages() {
  while (buffer.length > 0) {
    const headerEnd = buffer.indexOf('\r\n\r\n');
    if (headerEnd === -1) return;

    const header = buffer.slice(0, headerEnd).toString('utf8');
    const match = header.match(/Content-Length:\s*(\d+)/i);
    if (!match) {
      buffer = Buffer.alloc(0);
      return;
    }

    const length = Number(match[1]);
    const bodyStart = headerEnd + 4;
    const bodyEnd = bodyStart + length;
    if (buffer.length < bodyEnd) return;

    const body = buffer.slice(bodyStart, bodyEnd).toString('utf8');
    buffer = buffer.slice(bodyEnd);
    void handle(JSON.parse(body));
  }
}

process.stdin.on('data', (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);
  parseMessages();
});

process.stdin.on('error', (error) => {
  console.error(error);
});
