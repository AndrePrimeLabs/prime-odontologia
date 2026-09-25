# PrimeOSApp — VS Code Setup, Base44 Migration & Palit Pandora Deployment Guide

---

## Part 1 — Get Your Base44 Project Into VS Code

### 1.1 Export the code
1. Open your PrimeOS project in Base44 → click **Code** (top nav).
2. Click **GitHub** in the top bar → authorize the Base44 GitHub app → create a repo (e.g. `primeos-app`).
   - Use GitHub, not the ZIP download — ZIP is a one-time snapshot; GitHub sync lets you keep pulling Base44 changes while you build the local split-out.
3. Clone it:
   ```bash
   git clone https://github.com/<your-org>/primeos-app.git
   cd primeos-app
   npm install
   ```
4. Export your data separately (Base44 doesn't include this in the GitHub repo):
   - Dashboard → **Data** → select each collection → **⋯ More Actions → Export** → CSV per collection (customers, transactions, activities, etc.)
   - Put these in `primeos-app/data-export/` — you'll seed your local databases from these.

### 1.2 What you now have vs. what you need
| You have | You still need |
|---|---|
| Frontend React code calling the Base44 SDK | 9 standalone backend services replacing those SDK calls |
| CSV data exports per entity | Seed scripts to load that data into Postgres/Mongo schemas from Part 3 |
| `VITE_BASE44_APP_BASE_URL` pointing at Base44 | To swap this for `VITE_API_GATEWAY_URL` pointing at your own API Gateway |

This is the actual work of "finishing the app" — Base44 got you a working prototype and validated UI; the architecture docs from earlier are the blueprint for what replaces its backend.

---

## Part 2 — VS Code Workspace Setup

### 2.1 Install these extensions
- **Remote - SSH** (`ms-vscode-remote.remote-ssh`) — to edit/run code directly on the Pandora over the network, not just locally
- **Dev Containers** (`ms-vscode-remote.remote-containers`)
- **Docker** (`ms-azuretools.vscode-docker`)
- **YAML** (`redhat.vscode-yaml`) — for docker-compose / k3s manifests
- **ESLint** + **Prettier**
- **Thunder Client** or **REST Client** — for testing each microservice's API directly from VS Code
- **Mermaid Preview** — to view the architecture diagrams from the earlier docs inline

### 2.2 Project folder structure
Set this up as a VS Code **multi-root workspace** so each service is independently runnable/debuggable, but you can still see everything at once:

```
primeos-app/
├── docs/
│   ├── PrimeOSApp_Technical_Architecture.md
│   ├── PrimeOSApp_Multi_Tenant_Data_Isolation.md
│   └── PrimeOSApp_Pandora_Deployment.md      ← Part 3 below
├── frontend/                                  ← your exported Base44 React app
│   └── src/
├── services/
│   ├── crm-x/
│   ├── seg-x/
│   ├── chan-x/
│   ├── cost-x/
│   ├── act-x/
│   ├── part-x/
│   ├── res-x/
│   ├── rev-x/
│   └── value-x/
├── gateway/                                   ← API Gateway config (Kong/Traefik)
├── data-export/                               ← CSVs from Base44
├── docker-compose.pandora.yml                 ← Part 3
└── primeos.code-workspace
```

`primeos.code-workspace`:
```json
{
  "folders": [
    { "path": "frontend" },
    { "path": "services/crm-x" },
    { "path": "services/seg-x" },
    { "path": "services/rev-x" },
    { "path": "services/cost-x" },
    { "path": "gateway" },
    { "path": "docs" }
  ],
  "settings": {
    "docker.host": "ssh://pandora-user@<pandora-ip>"
  }
}
```
Open with `code primeos.code-workspace`. Setting `docker.host` to the Pandora's SSH address means the Docker extension in VS Code controls containers running *on the Pandora*, even while you edit locally — you get local editing with remote execution.

### 2.3 Connect VS Code to the Pandora directly
```bash
# On your main machine
ssh-copy-id pandora-user@<pandora-ip>
```
Then in VS Code: `Cmd/Ctrl+Shift+P` → **Remote-SSH: Connect to Host** → enter `pandora-user@<pandora-ip>`. This opens a VS Code window running entirely against the Pandora's filesystem and terminal — the most reliable way to develop for ARM64 without cross-compilation surprises.

---

## Part 3 — Adjusting the Architecture for the Pandora's Hardware

The earlier architecture doc assumed a full cloud cluster. On a single 8–16GB ARM edge box, trim it down:

| Original | Pandora-adjusted | Why |
|---|---|---|
| Postgres + MongoDB + MySQL (3 DB engines) | **Postgres only**, with MongoDB-style JSON stored in `jsonb` columns for SEG-X/VALUE-X | Running 3 database engines on 16GB leaves almost nothing for services themselves |
| Kafka event bus | **NATS** (or Redis Streams) | Kafka's JVM footprint alone can eat 1-2GB+ at idle; NATS runs in ~20MB |
| Kubernetes | **K3s** (Rancher's lightweight Kubernetes, built for ARM/edge) | K3s is a single ~70MB binary designed specifically for devices like the Jetson |
| Kong API Gateway | **Traefik** | Lighter, native Docker/K3s label-based routing, lower memory |
| 9 always-on services | Run **2-4 services at a time** during dev, rest scaled to zero | You will not fit all 9 + DB + bus in 8-16GB simultaneously during active development |

### 3.1 Confirm GPU/AI stack is active
```bash
# On the Pandora
sudo apt update && sudo apt install -y nvidia-jetpack
jtop        # install via: sudo pip3 install jetson-stats — live GPU/CPU/mem monitor
```
Use the Pandora's Ampere GPU for the workloads that actually benefit — SEG-X's clustering model and VALUE-X's feedback/sentiment analysis are the best candidates to run on-device rather than in the cloud.

### 3.2 docker-compose.pandora.yml (ARM64, trimmed)
```yaml
version: "3.9"
services:
  gateway:
    image: traefik:v3.0
    ports: ["80:80", "8080:8080"]
    volumes:
      - ./gateway/traefik.yml:/etc/traefik/traefik.yml

  postgres:
    image: postgres:16          # multi-arch, works natively on ARM64
    environment:
      - POSTGRES_PASSWORD=pass
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports: ["5432:5432"]

  nats:
    image: nats:2.10-alpine     # multi-arch, ~20MB footprint
    ports: ["4222:4222"]

  crm-x:
    build: ./services/crm-x
    platform: linux/arm64
    environment:
      - DATABASE_URL=postgres://postgres:pass@postgres:5432/crmx
      - NATS_URL=nats://nats:4222
    depends_on: [postgres, nats]
    labels:
      - "traefik.http.routers.crmx.rule=PathPrefix(`/api/crm`)"

  rev-x:
    build: ./services/rev-x
    platform: linux/arm64
    environment:
      - DATABASE_URL=postgres://postgres:pass@postgres:5432/revx
      - NATS_URL=nats://nats:4222
    depends_on: [postgres, nats]
    labels:
      - "traefik.http.routers.revx.rule=PathPrefix(`/api/rev`)"

volumes:
  pgdata:
```
Run it:
```bash
docker compose -f docker-compose.pandora.yml up -d crm-x rev-x
```
Bring up only the 2-3 services you're actively working on; the `docker-compose.pandora.yml` file can list all 9, but you selectively `up` a subset to stay within memory.

### 3.3 Building each service for ARM64
When you `docker build` on the Pandora itself (via Remote-SSH), images build natively for ARM64 automatically — no cross-compilation needed. If you build from an x86 machine instead:
```bash
docker buildx build --platform linux/arm64 -t crm-x:latest --push .
```

---

## Part 4 — Order of Operations to Actually Finish This

1. **Pick one building block first** — CRM-X is the right starting point (it's the dependency root for the others).
2. Scaffold `services/crm-x` with the Postgres schema from the earlier architecture doc, exposed as REST endpoints.
3. Seed it from your `data-export/customers.csv`.
4. Point one screen of your Base44-exported frontend at `crm-x` instead of the Base44 SDK — get one real end-to-end flow working locally before touching the other 8 blocks.
5. Repeat per block, wiring each into NATS as you go so events start flowing between them (e.g. `customer.created` → SEG-X).
6. Only after 2-3 blocks work locally, decide whether you still want a full Base44 cutover or a hybrid (Base44 frontend + your own backend microservices, which is a very workable middle ground).

This mirrors the phased build order from the architecture doc — Foundation → Revenue Core → Growth → Operations → Strategy — just now scoped to what the Pandora can actually run at once.
