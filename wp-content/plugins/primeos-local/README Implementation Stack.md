# PrimeOsHub — Implementation Stack

> **Virtual Digital Lab** · Enterprise tools for all 11 market segments  
> Hardware: Palit Pandora Box · NVIDIA JetPack 6 · Scale → Cloud  
> GitHub: [github.com/enterprises/PrimeOsHub](https://github.com/enterprises/PrimeOsHub)

---

## Architecture at a glance

```
WhatsApp → Clara Agent → OpenClaw → NemoClaw Sandbox → PrimeOS Core → Luzia Governance
                                          ↓
                                    PostgreSQL + Redis
                                          ↓
                              9 BMC Blocks · 4 Departments
                              11 Market Segments · 5 Tiers
```

---

## Repositories in this release

| Repo | Purpose | Status |
|------|---------|--------|
| `primeos-core` | API kernel, BMC routes, auth, WebSocket | ✅ Ready |
| `primeos-db-schema` | PostgreSQL migrations (Flyway) | ✅ Ready |
| `clara-agent` | WhatsApp AI agent (Claude + OpenClaw) | ✅ Ready |
| `luzia-agent` | Governance agent (policy + audit) | ✅ Ready |
| `nemoclaw-config` | NemoClaw security policies (YAML) | ✅ Ready |
| `infra-edge` | Docker Compose + NGINX for Pandora | ✅ Ready |
| `.github/workflows` | CI/CD pipelines | ✅ Ready |

---

## Quick Start — Palit Pandora (Phase 0)

### Prerequisites
- NVIDIA JetPack 6 installed on Palit Pandora
- Docker Engine + Docker Compose v2
- `nvidia-container-toolkit` installed
- Domain or local IP for NGINX

### 1. Clone & configure

```bash
git clone https://github.com/enterprises/PrimeOsHub/primeos-core
cd infra-edge
cp .env.example .env
nano .env   # Fill in ALL values — especially API keys
```

### 2. Generate SSL certificate (dev/self-signed)

```bash
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/primeos.key \
  -out nginx/ssl/primeos.crt \
  -subj "/C=BR/ST=MG/L=BH/O=PrimeOsHub/CN=localhost"
```

### 3. Run database migrations

```bash
# One-time init
docker compose up -d postgres
docker compose exec postgres psql -U primeos -d primeos_db \
  -f /docker-entrypoint-initdb.d/V001__init_primeos_schema.sql
```

### 4. Start the full stack

```bash
docker compose up -d
docker compose ps       # all services should show "healthy"
curl http://localhost/health
```

### 5. Verify agents

```bash
# Clara health
curl http://localhost:3001/health

# Luzia health  
curl http://localhost:3002/health

# NemoClaw health
curl http://localhost:8080/health
```

---

## Environment variables reference

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | ✅ | Claude API key — powers Clara + Luzia |
| `POSTGRES_PASSWORD` | ✅ | PostgreSQL root password |
| `REDIS_PASSWORD` | ✅ | Redis auth password |
| `JWT_SECRET` | ✅ | 256-bit random string for JWT signing |
| `WHATSAPP_TOKEN` | ✅ | Meta WhatsApp Business API token |
| `WHATSAPP_PHONE_ID` | ✅ | WhatsApp Phone Number ID |
| `WHATSAPP_VERIFY_TOKEN` | ✅ | Webhook verification token |
| `INTERNAL_API_KEY` | ✅ | Service-to-service auth (Clara↔Core) |
| `GITHUB_TOKEN` | ⬜ | GitHub integration (optional at P-0) |
| `NOTION_TOKEN` | ⬜ | Notion integration (optional at P-0) |
| `GRAFANA_PASSWORD` | ✅ | Grafana admin password |
| `LUZIA_ALERT_WEBHOOK` | ✅ | Slack webhook for Luzia alerts |

---

## Clara — WhatsApp Setup

1. Create a **Meta Business App** at [developers.facebook.com](https://developers.facebook.com)
2. Add **WhatsApp** product, create a phone number
3. Set webhook URL to: `https://your-domain.com/webhook/whatsapp`
4. Set `WHATSAPP_VERIFY_TOKEN` to match your `.env`
5. Subscribe to `messages` and `message_status` webhooks
6. Clara starts responding automatically once the stack is running

### Clara skills (OpenClaw tools)
- `get_org_info` — identify client by phone
- `capture_lead` — CRM lead capture
- `schedule_demo` — book product demos
- `get_module_status` — check module health
- `get_bmc_summary` — BMC dashboard summary
- `create_support_ticket` — L1 support
- `escalate_to_human` — human handoff
- `get_pricing_info` — pricing & plans

---

## Luzia — Governance Checks

Luzia runs every 60 seconds (configurable via `GOVERNANCE_INTERVAL_MS`):

| Check | Severity | What it catches |
|-------|----------|----------------|
| `inactive_orgs_check` | LOW | Orgs inactive >30 days |
| `audit_log_gaps` | HIGH | >10k audit events/table/24h |
| `revenue_data_integrity` | CRITICAL | Negative MRR values |
| `lgpd_compliance_check` | CRITICAL | PII in unencrypted fields |
| `soft_delete_orphans` | MEDIUM | Stale soft-deleted records |
| `agent_activity_audit` | HIGH | AI agent loops (>500 calls/hr) |

Alerts go to your `LUZIA_ALERT_WEBHOOK` (Slack) with AI-generated analysis.

---

## NemoClaw Policies

Policies live in `nemoclaw-config/policies/`:

| Policy | Applies to | Key rules |
|--------|-----------|-----------|
| `clara-whatsapp-policy.yaml` | Clara agent | Cross-tenant block, PII masking, tool allowlist, rate limits |
| `luzia-governance-policy.yaml` | Luzia agent | Read-only DB, no destructive ops without human confirm |
| `openclaw-default-policy.yaml` | All agents | Base network egress, filesystem isolation |

---

## CI/CD Pipeline

Every push to `main`:
1. **Lint + TypeScript** → fail fast
2. **Tests** (unit + integration) with live Postgres + Redis
3. **Security** (CodeQL SAST + dependency audit + secret scan)
4. **Build** multi-arch Docker image (amd64 + arm64 for Pandora)
5. **Deploy** to Palit Pandora via SSH with zero-downtime rollout
6. **Luzia** triggered post-deploy for governance check
7. **Slack** notification (success/failure)

On **GitHub Release**: also deploys to cloud Kubernetes (P-2+).

---

## Scale-out path

| Phase | Infrastructure | Orgs | Trigger |
|-------|---------------|------|---------|
| P-0 | Single Pandora · Docker Compose | 1–10 | Now |
| P-1 | 2–3 Pandora nodes · Docker Swarm | 10–50 | 10+ orgs |
| P-2 | Edge + Cloud VPC · Managed DB | 50–200 | 50+ orgs |
| P-3 | Kubernetes (EKS/GKE) | 200–1000 | 200+ orgs |
| P-4 | Multi-region k8s · CockroachDB | 1000+ | Series A |

---

## Support & governance

- **Clara** handles L1 customer support via WhatsApp 24/7
- **Luzia** monitors system health every 60s and alerts on violations
- **NemoClaw** enforces security policies on all agent actions
- Admin dashboard: `https://your-domain.com` (PrimeOS UI)
- Grafana metrics: `http://localhost:3030`
- Prometheus: `http://localhost:9090`

---

*Built with ❤️ on NVIDIA JetPack 6 · Palit Pandora Box · PrimeOsHub Enterprises*
