Agents system - NemoClaw & OpenClaw integration

Purpose
This folder hosts agent implementations and a generator to scaffold new agents following the "10 body parts" architecture. Agents run as containers and integrate with local model servers (Clara) and OpenClaw orchestration.

10 body parts (standard)
1. interface      - network/webhook adapters (WhatsApp, HTTP)
2. perception     - input preprocessing, speech->text, OCR
3. memory         - short/long-term memory (vector DB hooks)
4. knowledge      - static knowledge & retrieval
5. reasoning      - core LLM calls / chain orchestration
6. planning       - multi-step plan generation and task queueing
7. executor       - action execution (APIs, DB writes)
8. safety         - filters, policy enforcement, moderation
9. telemetry      - logs, metrics, traces
10. ops           - health, config, lifecycle (start/stop)

Generating new agents
Use the generator script scripts/generate_agent.js to scaffold a new agent with stubs for each body part:
  node scripts/generate_agent.js --name clara-whatsapp --display "Clara WhatsApp Agent"

Starter example: agents/clara-whatsapp contains a minimal working structure.

Notes
- "NemoClaw" refers to the agent creation tooling and lifecycle conventions; "OpenClaw" refers to runtime orchestration and AI task plumbing.
- Keep secrets out of manifests. Use .env files or secret stores on the host (not in repo).
