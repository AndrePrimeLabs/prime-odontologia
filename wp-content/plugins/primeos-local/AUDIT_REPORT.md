# 🔍 PrimeOS Repository Audit Report

**Date:** 2026-09-25  
**Status:** ⚠️ **6 CRITICAL ISSUES FOUND**

---

## Executive Summary

| Category | Status | Details |
|----------|--------|---------|
| **Security** | 🔴 CRITICAL | Hardcoded Supabase service key in docker-compose.yml |
| **Configuration** | 🔴 CRITICAL | .dockerignore broken (escaped newlines) |
| **Git Status** | 🟡 WARNING | Uncommitted changes (23+ files) |
| **Infrastructure** | 🟡 WARNING | 8 docker-compose files (unclear which is active) |
| **Code Quality** | 🟡 WARNING | api/entities/primeos.ts has uncommitted changes |
| **Build** | 🟢 OK | dist/ and api/node_modules exist |

---

## 🚨 CRITICAL ISSUES

### ❌ ISSUE #1: Hardcoded Supabase Service Key in docker-compose.yml

**Severity:** 🔴 CRITICAL (Security Risk)  
**Location:** `docker-compose.yml`, line 63  
**Risk:** Production database credentials exposed in git history

```yaml
# CURRENT (WRONG):
environment:
  - SUPABASE_SERVICE_ROLE_KEY=sb_secret_fBIFUxSlHQUVv02xu7AD9A_SCyxO8Em
```

**Fix:**
1. Remove from docker-compose.yml
2. Add to `.env.production` (not in git)
3. Source from environment when deploying

---

### ❌ ISSUE #2: Broken .dockerignore File

**Severity:** 🔴 CRITICAL (Build Issue)  
**Location:** `.dockerignore`  
**Problem:** File contains escaped newlines (`\n` as text) instead of actual newlines

```
# CURRENT (BROKEN):
# Git\n.git\n.gitignore\n...

# SHOULD BE:
# Git
.git
.gitignore
...
```

**Impact:** Docker build context is NOT being filtered correctly, increasing build time and image size.

---

### ❌ ISSUE #3: Uncommitted Git Changes

**Severity:** 🟡 WARNING (Deployability Issue)  
**Files Changed:** 23+

```
 M .agents/skills/skill.md
 M api/entities/primeos.ts (tenant_id logic removed)
 M package-lock.json
 M package.json
 M src/lib/tenantContext.ts
 D src/controllers/appointmentController.ts.ts (deleted)
 D src/types/*.ts (20+ deleted type files)
```

**Issue:** Unstable state - changes not committed to git.

---

### ❌ ISSUE #4: Multiple Conflicting docker-compose Files

**Severity:** 🟡 WARNING (Confusion Risk)  
**Files Found:**
- `docker-compose.yml` (main)
- `docker-compose.agent.yml`
- `docker-compose.dev.yml`
- `docker-compose.local.yml`
- `docker-compose.prod.yml`
- `docker-compose.vps.yml`
- `docker-compose.pandora.yml`
- `docker-compose.registry.yml`

**Question:** Which is active on VPS (82.29.56.236)?

---

### ❌ ISSUE #5: api/entities/primeos.ts Uncommitted Changes

**Severity:** 🟡 WARNING (Logic Change)  
**Problem:** `tenant_id` filtering removed from create/update operations

```diff
- import { fromTenant, getActiveTenantId } from "@/lib/tenantContext";
+ import { fromTenant } from "@/lib/tenantContext";

- tenant_id: getActiveTenantId(),
+ (removed - entities no longer tenant-scoped)

- .eq("tenant_id", getActiveTenantId())
+ (removed - update no longer tenant-scoped)
```

**Impact:** Multi-tenancy logic broken? Data isolation may be compromised.

---

### ✅ ISSUE #6: VPS docker-compose.yml Has Exposed Keys

**Severity:** 🔴 CRITICAL (Already deployed!)  
**Location:** `/root/primeos-local/docker-compose.yml` on VPS

Same hardcoded key issue.

---

## ✅ WHAT'S WORKING WELL

| Item | Status | Details |
|------|--------|---------|
| **Dockerfile** | ✅ | Clean, optimized, multi-stage not needed (frontend only) |
| **Dockerfile.api** | ✅ | Good Node Alpine base, health checks included |
| **Health Checks** | ✅ | Configured for both services |
| **Resource Limits** | ✅ | CPU/Memory constraints set |
| **Logging** | ✅ | JSON driver with size/file limits |
| **Build Artifacts** | ✅ | dist/ (5.8M, 190 files) ready |
| **API Dependencies** | ✅ | api/node_modules installed |
| **Environment Management** | ✅ | .env files in .gitignore |

---

## 🔧 REMEDIATION PLAN

### PRIORITY 1: Security (Do First)

**1.1 Remove hardcoded keys from docker-compose.yml**
```bash
# This will be done in the next step
```

**1.2 Rotate Supabase keys (already done)**
- ✅ Keys already rotated after accidental exposure

**1.3 Update VPS docker-compose.yml**
- Remove hardcoded keys
- Use environment file

---

### PRIORITY 2: Fix .dockerignore

**File will be rewritten with proper newlines**

---

### PRIORITY 3: Git Cleanup

**Options:**
A. Commit all changes (if intentional)
B. Discard changes (if not needed)
C. Stash and review each

**Current recommendation:** Review and commit or discard

---

### PRIORITY 4: Infrastructure Clarity

**Recommend:**
- Keep only `docker-compose.yml` (primary)
- Archive others: `docker-compose.prod.yml`, `docker-compose.vps.yml`, etc.
- OR: Use `docker compose -f docker-compose.prod.yml` explicitly on production

---

### PRIORITY 5: Multi-tenancy Review

**Action:** Verify if tenant_id removal is intentional
- If multi-tenant: revert changes, update logic
- If single-tenant: document decision, merge changes

---

## 📋 Implementation Checklist

- [ ] Fix .dockerignore (rewrite with real newlines)
- [ ] Remove hardcoded keys from docker-compose.yml
- [ ] Create .env file with Supabase credentials
- [ ] Commit git changes or discard them
- [ ] Review multi-tenancy changes in api/entities/primeos.ts
- [ ] Test deployment with cleaned configuration
- [ ] Verify both domains (primeos.primeodontologia.com.br + omnios.omnios.com.br)

---

## Next Actions (Per Session)

1. **Confirm which docker-compose should be primary**
2. **Approve git changes or discard them**
3. **Fix .dockerignore and secrets**
4. **Re-deploy to VPS**
5. **Proceed with OmniOS setup**

