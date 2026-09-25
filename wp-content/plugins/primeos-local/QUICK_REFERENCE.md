# 🚀 PrimeOS Local Development - Quick Reference

## ⚡ Essential Commands

```bash
# Start local stack (first time)
./scripts/start-local.sh --build

# Start local stack (subsequent times)  
./scripts/start-local.sh

# View logs
./scripts/start-local.sh --logs

# Stop everything
./scripts/start-local.sh --down

# Hot reload development
npm run dev              # Terminal 1: Backend (docker-compose.local.yml)
                         # Terminal 2: Vite (npm run dev)

# Build production
npm run build
npm run docker:build

# Type check
npm run typecheck

# Lint
npm run lint
```

---

## 🌐 Local URLs

| What | URL |
|------|-----|
| App | http://localhost:3000 |
| Vite Dev Server | http://localhost:5173 |
| Supabase API | http://localhost:54321 |
| Supabase DB (psql) | localhost:54322 |
| Firebase Emulator | http://localhost:4000 |
| pgAdmin | http://localhost:5050 |

---

## 🔐 Default Credentials

| Service | User | Pass |
|---------|------|------|
| App (Local) | dev@primeos.local | (auto-login) |
| Supabase DB | postgres | postgres |
| pgAdmin | admin@primeos.local | admin123 |
| Firebase Emulator | (any) | (any) |

---

## 📁 Important Files

- `.env.local` - Local config (NOT committed)
- `docker-compose.local.yml` - Local Docker stack
- `scripts/start-local.sh` - Startup script
- `src/lib/AuthContext.jsx` - Auth handler (now supports local mode)
- `supabase/supabaseClient.js` - Backend client (detects local vs prod)

---

## 🔄 Workflow: Edit → Build → Test

### Frontend Changes
```bash
npm run dev
# Edit src/ → Auto-reload at http://localhost:5173
```

### Backend/Database Changes  
```bash
# pgAdmin at http://localhost:5050 for SQL
# Or: PGPASSWORD=postgres psql -h localhost -p 54322 -U postgres
```

### Production Build
```bash
npm run build           # Build
npm run docker:build    # Build Docker image
docker run primeos      # Test locally
```

---

## 🐛 Quick Fixes

| Problem | Fix |
|---------|-----|
| Port 3000 in use | `./scripts/start-local.sh --down` then try again |
| Can't connect DB | `docker compose -f docker-compose.local.yml logs supabase` |
| App blank | Open DevTools (F12) → Console → Check errors |
| Need to rebuild | `./scripts/start-local.sh --build` |

---

## 📚 Need Help?

- **Quick questions?** → See **LOCAL_DEVELOPMENT.md**
- **Project structure?** → See **PROJECT_FILE_INVENTORY.md**
- **Production deploy?** → See **DOCKER_DEPLOYMENT.md**
- **Backend schema?** → See **database/README.md**
- **Product docs?** → See **PRIMEOS.md**

---

## ✅ Pre-Commit Checklist

```bash
npm run typecheck    # ✅ No type errors
npm run lint         # ✅ Code style OK
npm run build        # ✅ Builds successfully
git status           # ✅ No .env.local committed
```

---

**Stuck?** Run: `./scripts/start-local.sh --logs`  
**Want details?** Read: `LOCAL_DEVELOPMENT.md`

