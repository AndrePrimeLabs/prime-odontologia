# PrimeOS - Complete File Inventory & Architecture Guide

**Project**: PrimeOS - Digital OS for Prime Odontologia  
**Tech Stack**: React + Vite (Frontend) | Supabase + Firebase (Backend)  
**Local Setup**: Docker + MacBook Pro M1 + Nvidia Palit Pandora  
**Status**: Migrating from base44.app → Local Docker
---

## 📊 Disk Usage Summary

| Directory | Size | Purpose |
|-----------|------|---------|
| `node_modules/` | 1.2G | NPM dependencies |
| `primeos-notion-manager/` | 59M | Notion integration |
| `src/` | 4.2M | Frontend source code |
| `public/` | 1.4M | Static assets |
| `favicon/` | 244K | Brand icons |
| `supabase/` | 224K | Database migrations/schema |
| `my-project/` | 204K | Nested project (unused?) |
| `data/` | 204K | Config & seed data |
| `scripts/` | 108K | Build & deploy scripts |
| `agents/` | 76K | AI agents |
| `agent-server/` | 64K | Agent server logic |
| `api/` | 40K | Vercel API routes |
| `sdk/` | 28K | Internal SDK |
| `utils/` | 12K | Utility functions |
| `images/` | 12K | Image assets |
| `docs/` | 12K | Documentation |

**Total (excluding node_modules)**: ~2.6GB productive code

---

## 🎯 Core Architecture

### **Frontend (React + Vite)**
```
primeos-local/
├── src/                          # Main frontend source
│   ├── App.jsx                  # Root component with providers & routes
│   ├── Layout.jsx               # Sidebar navigation & theme
│   ├── main.jsx                 # React entry point
│   ├── index.js                 # Vite entry
│   ├── router.tsx               # TanStack Router config
│   ├── routeTree.gen.ts         # Auto-generated route tree
│   ├── pages/                   # Main application pages
│   │   ├── Dashboard.jsx
│   │   ├── CRM.jsx
│   │   ├── Agenda.jsx
│   │   ├── Tasks.jsx
│   │   ├── Sales.jsx
│   │   ├── Financeiro.jsx
│   │   ├── MarketingOS.jsx
│   │   └── ... (30+ pages)
│   ├── components/              # Reusable React components
│   │   ├── ui/                 # Base design system components
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── dialog.jsx
│   │   │   ├── form.jsx
│   │   │   └── ... (Radix UI)
│   │   ├── crm/                # CRM domain components
│   │   ├── sales/              # Sales domain components
│   │   ├── financeiro/         # Finance domain components
│   │   ├── marketing/          # Marketing domain components
│   │   ├── agenda/             # Calendar domain components
│   │   ├── ai/                 # AI assistant components
│   │   ├── navigation/         # Header/sidebar components
│   │   └── ...
│   ├── pages.config.js          # Auto-registration of pages
│   ├── api/                     # Frontend API clients
│   │   ├── primeosClient.js    # Main SDK for Supabase/entities
│   │   ├── entities/           # Entity definitions
│   │   └── ...
│   ├── services/               # Business logic (not UI)
│   │   ├── auth/
│   │   ├── crm/
│   │   └── ...
│   ├── hooks/                  # React custom hooks
│   ├── context/                # React Context providers
│   ├── config/                 # App configuration
│   ├── types/                  # TypeScript types
│   ├── utils/                  # Utility functions
│   ├── lib/                    # Library wrappers
│   ├── styles/                 # Global CSS
│   └── assets/                 # Images/fonts
│
├── public/                      # Static files (not processed)
│   ├── manifest.json           # PWA manifest
│   ├── api.json                # API configuration
│   └── ...
├── vite.config.js              # Vite build config
├── vitest.config.js            # Test runner config
├── tsconfig.json               # TypeScript config
├── jsconfig.json               # JS config (path aliases)
├── tailwind.config.js          # Tailwind CSS config
├── postcss.config.js           # PostCSS plugins
├── eslint.config.js            # Linting rules
├── components.json             # UI component registry
├── package.json                # NPM dependencies & scripts
└── package-lock.json           # Locked versions
```

---

## 🗄️ Backend & Database

### **Supabase (PostgreSQL + Auth)**
```
supabase/
├── migrations/                 # Database schema versioning
│   ├── 001_initial_schema.sql
│   ├── 002_auth_tables.sql
│   └── ...
├── schema/
│   ├── tables/                # Table definitions
│   │   ├── auth.sql
│   │   ├── operations.sql
│   │   ├── crm.sql
│   │   ├── financeiro.sql
│   │   ├── marketing.sql
│   │   └── ...
│   ├── views/                 # Database views
│   ├── functions/             # Postgres functions
│   ├── procedures/            # Stored procedures
│   └── ...
├── backup files/              # Snapshot exports (legacy)
└── ...

database/                      # Organized schema (NEW)
├── schema/
│   ├── tables/
│   ├── views/
│   ├── functions/
│   └── procedures/
├── migrations/
├── seeds/
└── README.md
```

### **Firebase (Functions + Hosting)**
```
functions/                      # Serverless functions
├── aiChatbot.ts
├── analyzePatient.ts
├── calculateLeadScore.ts
├── createDigitalInvoice.ts
├── generateMarketingContent.ts
├── paymentFollowUp.ts
├── processOnlineBooking.ts
├── sendAppointmentReminder.ts
├── syncGoogleCalendar.ts
├── triageTicket.ts
└── ...

api/                            # Vercel API routes
├── hostinger/
│   ├── index.js               # GET /api/hostinger
│   ├── domains.js             # GET /api/hostinger/domains
│   ├── dns/[domain].js        # GET/PUT /api/hostinger/dns/{domain}
│   ├── vps.js                 # GET /api/hostinger/vps
│   └── deploy.js              # POST /api/hostinger/deploy
├── _lib/
│   └── hostinger.js           # Hostinger SDK client
└── ...
```

---

## 🐳 Docker Configuration

### **Dockerfiles**
```
Dockerfile                      # Main production image
├── FROM node:24-alpine        # Build stage
├── BUILD: npm install & npm run build
├── FROM nginx:stable-alpine   # Runtime stage
├── COPY dist to /usr/share/nginx/html
└── EXPOSE 80 + HEALTHCHECK

Dockerfile.agent               # Agent/bot Docker image
Dockerfile.api                 # API server Docker image
```

### **Docker Compose**
```
docker-compose.yml             # Local development
├── services:
│   └── primeos:
│       ├── build: . (Dockerfile)
│       ├── ports: 3000:80
│       ├── restart: unless-stopped
│       ├── healthcheck: curl check
│       └── volumes: primeos-data

docker-compose.agent.yml       # Agent orchestration
docker-compose.prod.yml        # Production deployment
docker-compose.registry.yml    # Docker registry config
docker-compose.vps.yml         # VPS-specific config
```

---

## ⚙️ Configuration Files

### **Build & Development**
| File | Purpose |
|------|---------|
| `package.json` | Dependencies & NPM scripts |
| `vite.config.js` | Vite bundler config |
| `tsconfig.json` | TypeScript compiler options |
| `jsconfig.json` | JavaScript path aliases |
| `tailwind.config.js` | Tailwind CSS theme |
| `postcss.config.js` | CSS processing pipeline |
| `eslint.config.js` | Code linting rules |
| `vitest.config.js` | Unit test runner |
| `components.json` | UI component registry |

### **Environment Variables**
| File | Purpose |
|------|---------|
| `.env.example` | Template with all vars (safe) |
| `.env.local.example` | FTP deployment template |
| `.env.local` | **NOT COMMITTED** - Local secrets |
| `.env.docker` | Docker-specific vars |
| `.env.production` | Production vars (CI/CD) |

### **Deployment**
| File | Purpose |
|------|---------|
| `apphosting.yaml` | Firebase App Hosting config |
| `wrangler.jsonc` | Cloudflare Workers config |
| `nginx.conf` | Nginx reverse proxy config |
| `primeos-deploy.yml` | GitHub Actions workflow |
| `primeos-deploy-ftps.yml` | FTP deploy workflow |

---

## 📝 Scripts (Build & Deploy)

```
scripts/
├── postbuild.mjs               # Post-build hook (minify, etc)
├── deploy.mjs                  # FTP deployment to Hostinger
├── validate-deploy.mjs         # Verify deployment success
├── openclaw-task.mjs           # OpenClaw task management
├── openclaw-mcp.mjs            # OpenClaw MCP client
└── ...
```

**Key NPM Scripts** (in package.json):
```bash
npm run dev                    # Start Vite dev server
npm run build                  # Production build (Vite + postbuild)
npm run start                  # Preview production build
npm run docker:build           # Build Docker image
npm run docker:run             # Run Docker container locally
npm run docker:compose         # Start with Docker Compose
npm run deploy                 # Deploy to Hostinger FTP
npm run lint                   # Check code quality
npm run typecheck              # TypeScript validation
```

---

## 🤖 AI Agents & Integrations

### **Agents Directory**
```
agents/
├── clara-whatsapp/             # WhatsApp bot agent
│   ├── Dockerfile
│   ├── manifest.json           # Agent metadata
│   ├── package.json
│   └── src/
│
└── ... (other agents)

agent-server/                  # Central agent orchestration
```

### **Notion Integration**
```
primeos-notion-manager/        # Sync PrimeOS ↔ Notion
├── src/
├── package.json
├── tsconfig.json
└── README.md
```

### **MCP (Model Context Protocol)**
```
.mcp.json                      # Global MCP config (Hostinger + others)
```
> The former `primeos.mcp.json`, `hostinger.mcp.json`, and `hostinger-mcp`
> duplicates were removed; `.mcp.json` is the single source of truth.

---

## 🔧 Vendor Integration SDKs

```
sdk/
└── node/                       # Node.js SDK wrapper
    ├── package.json
    └── ...

node_modules/hostinger-api-sdk/  # Hostinger SDK
```

---

## 📚 Documentation

### **Main Docs**
| File | Content |
|------|---------|
| `PRIMEOS.md` | Full product & architecture overview |
| `DOCKER_DEPLOYMENT.md` | Docker setup & deployment guide |
| `SECURITY.md` | Security policies & best practices |
| `DEPLOYMENT_SAFETY.md` | Safe deployment procedures |
| `PrimeOSApp_Technical_Architecture.md` | Tech architecture deep-dive |
| `PrimeOSApp_Multi_Tenant_Data_Isolation.md` | Multi-tenancy & data isolation |
| `OMNICHANNEL_STRATEGY.md` | Omnichannel marketing approach |
| `OPENCLAW_CODEX_BRIDGE.md` | OpenClaw integration |
| `INCIDENT_RECOVERY.md` | Incident response procedures |
| `HOSTINGER_VPS_MANAGEMENT.md` | VPS management guide |
| `SETUP_SUMMARY.md` | Quick setup checklist |
| `VERIFICATION_CHECKLIST.md` | Pre-launch verification |
| `CODE_OF_CONDUCT.md` | Community guidelines |
| `README.md` | Project root readme |

### **Folder Documentation**
```
docs/                          # Additional docs
├── README.md
└── ...

database/README.md             # Database schema docs
```

---

## 🔐 Git & Version Control

| File | Purpose |
|------|---------|
| `.gitignore` | Files to exclude from Git (includes macOS ignores) |
| `.github/workflows/*.yml` | GitHub Actions CI/CD |
| `.github/project.json` | GitHub project settings |
| `LICENSE` | Open source license |

---

## 📋 Data & Configuration

```
data/
├── config/
│   ├── environments.json      # Environment definitions
│   ├── migration-order.json   # DB migration sequence
│   └── schema-order.json      # Schema loading order
│
└── ... (legacy data files)
```

---

## 🎨 Assets

```
favicon/                        # Brand favicon (multiple sizes)
images/                         # Promotional/brand images
public/                         # Static web assets
└── manifest.json              # PWA manifest
```

---

## 🛠️ Special Files

| File | Purpose |
|------|---------|
| `CNAME` | Custom domain config |
| `capacitor.config.ts` | Mobile app config (Capacitor) |
| `index.html` | Vite HTML entry point |
| `login.html` | Login page |
| `.claude/import.json` | Claude AI import config |
| `.jetpack/` | Jetpack integration |
| `.vscode/` | VSCode workspace settings |
| `.notion/` | Notion integration config |
| `.agents/` | Agent skills manifest |
| `primeos-local.insiders-code-workspace.code-workspace` | VSCode workspace file |

---

## 🔄 Update & Modification Guide

### **To Add a New Frontend Page:**
1. Create `src/pages/NewPage.jsx`
2. Register in `src/pages.config.js`
3. Add menu item in `src/Layout.jsx`
4. Connect to entities via `primeosClient` (from `src/api/primeosClient.js`)

### **To Add a New Backend Function:**
1. Create `functions/newFunction.ts` (Firebase) or `api/route.js` (Vercel)
2. Define Postgres functions in `database/schema/functions/`
3. Test with Supabase CLI locally
4. Deploy via Firebase or GitHub Actions

### **To Update Database Schema:**
1. Create migration in `database/migrations/`
2. Update `database/schema/tables/` definitions
3. Test locally with Supabase: `supabase db push`
4. Run migrations on production

### **To Modify Dockerfile:**
1. Edit `Dockerfile` (production) or `Dockerfile.agent` (agents)
2. Test build: `docker build -t primeos:test .`
3. Test run: `docker run -p 3000:80 primeos:test`
4. Deploy: `npm run docker:compose`

### **To Deploy to Local Docker:**
```bash
npm install                     # Install/update dependencies
npm run build                   # Build production bundle
npm run docker:compose          # Start with Docker Compose
# Access at http://localhost:3000
```

---

## 📊 Technology Stack Summary

| Layer | Technology | Files |
|-------|-----------|-------|
| **Frontend** | React 18 + Vite 6 | `src/`, vite.config.js |
| **UI Framework** | Radix UI + Tailwind CSS | `src/components/ui/`, tailwind.config.js |
| **Backend DB** | Supabase (PostgreSQL) | `database/`, `supabase/` |
| **Authentication** | Supabase Auth | `src/api/` |
| **Serverless Funcs** | Firebase Functions | `functions/` |
| **API Routes** | Vercel API | `api/` |
| **Containerization** | Docker + Docker Compose | `Dockerfile*`, `docker-compose.*.yml` |
| **Build Tool** | Vite + Node | `package.json`, vite.config.js |
| **Styling** | Tailwind CSS | `tailwind.config.js` |
| **Routing** | TanStack Router | `src/router.tsx` |
| **State Mgmt** | React Query + Context | `src/context/`, `src/hooks/` |
| **Type Safety** | TypeScript + JSDoc | `tsconfig.json` |
| **Linting** | ESLint | `eslint.config.js` |
| **Testing** | Vitest | `vitest.config.js` |
| **CI/CD** | GitHub Actions | `.github/workflows/` |
| **Hosting** | Docker VPS / Firebase / Vercel | Multiple |

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your Supabase/Firebase keys

# 3. Run locally (Node + Vite)
npm run dev
# Access at http://localhost:5173

# 4. OR Run with Docker Compose
npm run docker:compose
# Access at http://localhost:3000

# 5. Build for production
npm run build
npm run start
```

---

## 📞 Support & References

- **Product Docs**: See `PRIMEOS.md`
- **Architecture**: See `PrimeOSApp_Technical_Architecture.md`
- **Deployment**: See `DOCKER_DEPLOYMENT.md`
- **Security**: See `SECURITY.md`
- **Database**: See `database/README.md`

---

**Last Updated**: Now  
**Maintainer**: PrimeOS Team  
**Status**: Active Development
