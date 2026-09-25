# OpenClaw and Codex Bridge

## Goal

OpenClaw and Codex should collaborate without requiring the Codex plugin to run
inside the OpenClaw runtime. The integration uses a simple file contract that
both sides can read and write.

## Why This Approach

The OpenClaw workspace owns persona, memory, and session context in `.openclaw`.
Codex owns local engineering execution in the repository. A file bridge keeps
the boundary clear:

- OpenClaw can request work.
- Codex can execute work safely in the repo.
- Humans can inspect every handoff.
- No secret tokens or plugin internals need to be shared.

## Flow

```text
OpenClaw creates task JSON
        |
        v
.openclaw/tasks/inbox
        |
        v
Codex starts task
        |
        v
.openclaw/tasks/active
        |
        +--> .openclaw/tasks/done
        |
        +--> .openclaw/tasks/blocked
```

## CLI

Create a task:

```bash
npm run openclaw:create -- --title "Create docs" --summary "Document the PrimeOS AI Hub"
```

List tasks:

```bash
npm run openclaw:list
```

Start a task:

```bash
npm run openclaw:start -- <task-id>
```

Complete a task:

```bash
npm run openclaw:complete -- <task-id> --summary "Implemented the requested bridge"
```

Block a task:

```bash
npm run openclaw:block -- <task-id> --summary "Need API credentials"
```

## OpenClaw Side

OpenClaw should write task JSON files that match:

```text
.openclaw/tasks/schema.json
```

Minimum useful fields:

- `title`
- `kind`
- `priority`
- `persona`
- `assignee`
- `summary`
- `related_files`
- `acceptance_criteria`

## Codex Side

Codex should:

1. Run `npm run openclaw:list`.
2. Pick a `pending` task.
3. Run `npm run openclaw:start -- <task-id>`.
4. Perform the repo work.
5. Run `npm run openclaw:complete -- <task-id> --summary "..."`
   or `npm run openclaw:block -- <task-id> --summary "..."`.

## Next Step: MCP

The file bridge is also exposed as a local MCP stdio server:

```bash
npm run openclaw:mcp
```

The repo `.mcp.json` registers it as `openclaw-codex`:

- `openclaw_list_tasks`
- `openclaw_show_task`
- `openclaw_create_task`
- `openclaw_start_task`
- `openclaw_complete_task`
- `openclaw_block_task`

That lets OpenClaw and Codex call the same task bridge through tool calls instead
of shell commands.

## MCP Configuration

```json
{
  "mcpServers": {
    "openclaw-codex": {
      "command": "node",
      "args": ["scripts/openclaw-mcp.mjs"]
    }
  }
}
```
