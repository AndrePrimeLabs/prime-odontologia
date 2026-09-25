# PrimeOS Local Development Guide

**Status**: ✅ Ready for local-only development on Mac M1 + Pandora  
**Setup Time**: ~5 minutes  
**Requirements**: Docker Desktop (M1 native), 8GB+ RAM, 50GB disk space

---

## 🎯 Quick Start (3 steps)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Local Stack
```bash
# First time (builds Docker image):
./scripts/start-local.sh --build

# Subsequent times (quick start):
./scripts/start-local.sh
```

### Step 3: Open App
Visit **http://localhost:3000** in your browser. You're logged in automatically (mock user).

---

## 🏗️ What's Running?

### Containers (after `./scripts/start-local.sh`)

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| **PrimeOS Frontend** | 3000 | http://localhost:3000 | React app + Nginx |
| **Supabase API** | 54321 | http://localhost:54321 | PostgreSQL + Auth (local) |
| **Supabase DB** | 54322 | localhost:54322 | Direct Postgres connection |
| **Firebase Emulator** | 4000 | http://localhost:4000 | Auth + Firestore + Storage (local) |
| **pgAdmin** | 5050 | http://localhost:5050 | Database browser |

---

## 🔧 Development Workflow

### Working on Frontend

**Option A: Hot reload via Docker** (simplest)
```bash
./scripts/start-local.sh
# Edit src/ → Changes auto-reload on http://localhost:3000
```

**Option B: Local Vite dev server** (faster iteration)
```bash
# Terminal 1: Start backend services only
docker compose -f docker-compose.local.yml up supabase pgadmin

# Terminal 2: Run Vite dev server
npm run dev
# Then visit http://localhost:5173
```

### Working on Backend / Database

**Connect to local Postgres:**
```bash
# Via psql
PGPASSWORD=postgres psql -h localhost -p 54322 -U postgres -d postgres

# Via pgAdmin UI
# Visit http://localhost:5050
# Login: admin@primeos.local / admin123
# Right-click "Servers" → Register → New Server
#   Name: PrimeOS Local
#   Host: supabase
#   Port: 5432
#   Database: postgres
#   Username: postgres
#   Password: postgres
```

**Add database migrations:**
```bash
# Create migration
supabase migration new add_feature

# Test locally
supabase db push

# View in pgAdmin UI
```

**Run Supabase SQL queries:**
```bash
# Visit http://localhost:54321 → SQL Editor
# Or use Supabase CLI
supabase start
supabase db execute < sql/my-query.sql
```

---

## 🔐 Authentication (Local Mode)

In local mode, you're **automatically logged in** as:
- **Email**: `dev@primeos.local`
- **Role**: `admin` (mock)
- **User ID**: Generated at each session

This is stored in browser localStorage. To logout:
```javascript
// In browser console:
localStorage.removeItem('primeos_local_user');
localStorage.removeItem('primeos_auth');
window.location.reload();
```

To login again, just reload the page.

---

## 🐳 Docker Commands

### View Status
```bash
./scripts/start-local.sh --status
```

### View Logs
```bash
./scripts/start-local.sh --logs
```

### Stop Everything
```bash
./scripts/start-local.sh --down
```

### Rebuild Image
```bash
./scripts/start-local.sh --build
```

### Execute Commands in Container
```bash
# Shell access
docker compose -f docker-compose.local.yml exec primeos sh

# Run npm script
docker compose -f docker-compose.local.yml exec primeos npm run typecheck

# Database query
docker compose -f docker-compose.local.yml exec supabase psql -U postgres
```

---

## 📦 Environment Variables

Local configuration is in `.env.local` (not committed):

```bash
# Frontend
VITE_LOCAL_MODE=true                # Enables local-only features
VITE_SUPABASE_URL=http://localhost:54321
VITE_FIREBASE_PROJECT_ID=primeos-local

# Backend
NODE_ENV=development
SUPABASE_DB_HOST=localhost
SUPABASE_DB_PORT=54322
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=postgres
```

**⚠️ Do NOT commit `.env.local` to Git** — it's in `.gitignore` for security.

---

## 🚀 Deploying from Local

### Build Production Image
```bash
npm run build
npm run docker:build
```

### Test Production Build Locally
```bash
docker run -p 80:80 primeos:latest
# Visit http://localhost
```

### Push to Docker Registry
```bash
# Tag for Docker Hub
docker tag primeos:latest yourusername/primeos:latest

# Login to Docker Hub
docker login

# Push
docker push yourusername/primeos:latest
```

### Deploy to VPS with Docker Compose
```bash
# Copy files to VPS
scp docker-compose.yml root@your-vps:/app/
scp Dockerfile root@your-vps:/app/

# SSH and deploy
ssh root@your-vps
cd /app
docker compose up --build -d
```

---

## 🐛 Troubleshooting

### Port 3000 Already in Use
```bash
# Kill process using port 3000
sudo lsof -ti:3000 | xargs sudo kill -9

# Or change port in docker-compose.local.yml:
# ports:
#   - "3001:80"
```

### Docker Out of Disk Space
```bash
# Clean up unused images/volumes
docker system prune -a --volumes

# Check space
docker system df
```

### Supabase Not Connecting
```bash
# Check Supabase container logs
docker compose -f docker-compose.local.yml logs supabase

# Verify it's healthy
curl http://localhost:54321/health
```

### M1 Mac Specific: ARM64 Issues
```bash
# Ensure Docker Desktop is using native ARM64 images
# Settings → Resources → Use native architecture

# Or specify platform explicitly:
docker run --platform linux/arm64 supabase/supabase:latest
```

### "Cannot find module 'supabase/supabaseClient'"
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Frontend Blank Page
```bash
# Check browser console for errors (F12)
# Check frontend logs
docker compose -f docker-compose.local.yml logs primeos

# Verify environment variables loaded
curl http://localhost:3000/api/env
```

---

## 📊 Monitoring & Debugging

### Browser DevTools
- **Console**: `F12` → Console tab
- **Network**: `F12` → Network tab (API calls)
- **Storage**: `F12` → Storage tab (localStorage, IndexedDB)

### Docker Logs
```bash
# All services
./scripts/start-local.sh --logs

# Specific service
docker compose -f docker-compose.local.yml logs -f primeos
docker compose -f docker-compose.local.yml logs -f supabase

# Last 100 lines
docker compose -f docker-compose.local.yml logs --tail=100 primeos
```

### Database Queries
```bash
# Via pgAdmin UI
# http://localhost:5050

# Via psql CLI
PGPASSWORD=postgres psql -h localhost -p 54322 -U postgres -d postgres
postgres=# SELECT * FROM users;

# Via Supabase REST API
curl http://localhost:54321/rest/v1/users \
  -H "apikey: [REDACTED]" \
  -H "Content-Type: application/json"
```

---

## 🔄 Git Workflow

### Before Committing
```bash
# Type check
npm run typecheck

# Lint
npm run lint

# Build test
npm run build

# Never commit:
# .env.local (contains secrets)
# node_modules/
# dist/
```

### Pull Latest & Restart
```bash
git pull origin main
npm install
./scripts/start-local.sh --build
```

---

## 📚 Additional Resources

| File | Purpose |
|------|---------|
| `PROJECT_FILE_INVENTORY.md` | Complete project structure |
| `DOCKER_DEPLOYMENT.md` | Docker production deployment |
| `SECURITY.md` | Security best practices |
| `PRIMEOS.md` | Product documentation |
| `database/README.md` | Database schema docs |

---

## ✅ Checklist

- [ ] Docker Desktop installed (M1 native)
- [ ] `npm install` completed
- [ ] `.env.local` created with local values
- [ ] `./scripts/start-local.sh --build` succeeded
- [ ] http://localhost:3000 opens and shows Dashboard
- [ ] http://localhost:5050 (pgAdmin) accessible
- [ ] Browser console shows no errors
- [ ] You can edit `src/` and see changes live

---

## 🆘 Getting Help

### Common Issues
1. **Port conflicts?** → Change port in `docker-compose.local.yml`
2. **M1 issues?** → Ensure Docker Desktop using native ARM64
3. **Build slow?** → Rebuild with `./scripts/start-local.sh --build`
4. **Can't connect?** → Check `docker compose -f docker-compose.local.yml ps`

### Logs to Check
```bash
# All container logs
./scripts/start-local.sh --logs

# Browser console
F12 → Console tab

# Specific service
docker compose -f docker-compose.local.yml logs -f primeos
docker compose -f docker-compose.local.yml logs -f supabase
```

---

**Ready to develop?** 🚀 Run: `./scripts/start-local.sh --build`

