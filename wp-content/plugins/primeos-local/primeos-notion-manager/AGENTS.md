## Notion as source of truth

System specs live in Notion, not in this repo. Use the Notion MCP server to read:

- PrimeOS Project — architecture, module boundaries, folder layout
- PrimeOS BaaS — Diretrizes do Sistema — business rules and backend conventions
- PrimeOsHub Data Architecture — data layer and entity engine
- Api Configurations and Api Schema — endpoints and env var names

Databases mirrored by `primeos-notion-manager`: Control Panel, Digital Tasks, CRM, Automations.

Rules:
- Notion wins on specs. If code and Notion disagree, flag it — don't silently follow the code.
- NEVER copy credentials from Notion pages into this repo, into `.env.example`, or into commit messages.