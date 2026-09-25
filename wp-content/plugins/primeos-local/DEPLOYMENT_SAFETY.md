# 🔒 Deployment Safety Guide

## Critical: Hostinger FTP Deployment

This guide protects against catastrophic data loss during FTP deployments to Hostinger.

> **⚠️ WARNING**: On June 1, 2026, a misconfigured deployment deleted the entire `public_html` folder. This guide prevents that from happening again.

---

## 1. Environment Configuration

### Safe Setup (.env.local)

Create `.env.local` in the project root with **only the subdirectory**:

```bash
FTP_USERNAME=u188684587
FTP_PASSWORD=your_password_here
FTP_SERVER=89.117.7.117
FTP_PORT=21
FTP_REMOTE_DIR=/public_html/primeos
# FTP_DELETE_REMOTE is NOT set (defaults to false)
```

### ❌ NEVER Do This

```bash
# DANGEROUS - Will delete everything!
FTP_REMOTE_DIR=/public_html
FTP_REMOTE_DIR=/
FTP_REMOTE_DIR=/var

# DANGEROUS - Will delete remote files!
FTP_DELETE_REMOTE=true
```

---

## 2. Deployment Script Safety Checks

The `scripts/FtpDeploy.mjs` now validates:

✅ **Remote root is a safe subdirectory** (not `/public_html` root)
✅ **`deleteRemote` is never enabled**
✅ **`.env.local` exists** before deployment
✅ **`./dist` build folder exists** (requires `npm run build` first)
✅ **User confirmation** before uploading

### Running Deployment

```bash
# 1. Build the project
npm run build:primeos

# 2. Deploy (will ask for confirmation)
npm run deploy:hostinger

# 3. Answer "yes" when prompted to confirm
```

---

## 3. Git Pre-Commit Hook Protection

`.husky/pre-commit` prevents committing:

- ❌ `deleteRemote: true`
- ❌ `/public_html` as `remoteRoot`
- ⚠️ Secrets in staged files

### Setup Husky (one-time)

```bash
npm install --save-dev husky
npx husky install
```

### If You Need to Bypass (Emergency Only)

```bash
git commit --no-verify
```

**Never bypass unless absolutely necessary.**

---

## 4. Safe Remote Directories

### Allowed Remote Roots

- ✅ `/public_html/primeos`
- ✅ `/primeos`
- ✅ `/home/u188684587/public_html/primeos`

Any of these are safe because they target only the PrimeOS subdomain.

### Blocked Remote Roots

- ❌ `/public_html` — Root of the website
- ❌ `/` — Server root
- ❌ `/home` — User home directory
- ❌ `/var` — System directory

---

## 5. Disaster Recovery Checklist

If deployment goes wrong:

1. **Stop the deployment** (Ctrl+C)
2. **Check Hostinger backup:**
   - Control Panel → File Manager → Restore
   - Look for daily/weekly backups
   - Restore `public_html` to previous state
3. **Contact Hostinger support** if no backups available:
   - Request emergency recovery
   - Ask for backup snapshots
4. **Review what went wrong:**
   - Check git log: `git log --oneline -5`
   - Check `.env.local` settings
   - Verify `remoteRoot` is correct

---

## 6. Backup Best Practices

### Local Backups

Before each deployment:

```bash
# Create dated backup of current dist
cp -r dist "dist_backup_$(date +%Y%m%d_%H%M%S)"
```

### Hostinger Backups

Enable in Hostinger Control Panel:
- Setup daily automated backups
- Keep at least 7 days of history
- Test restore process quarterly

### GitHub Version Control

Every deploy is tracked in git:

```bash
git log --oneline -- scripts/FtpDeploy.mjs
# See all deployment config changes
```

---

## 7. Deployment Workflow

### Standard Deployment

```bash
# 1. Verify changes
git status

# 2. Build locally
npm run build:primeos

# 3. Test locally
npm run preview

# 4. Deploy
npm run deploy:hostinger

# 5. Verify on live site
# Visit https://primeos.primeodontologia.com.br
```

### Multi-Domain Setup

Your hosting structure:
```
public_html/
├── primeodontologia.com.br/   (main website)
├── primeos/                    (subdomain: primeos.primeodontologia.com.br)
└── other_sites/
```

**Always deploy to `/public_html/primeos` only.**

---

## 8. Troubleshooting

### "ERROR: Dangerous FTP root directory detected"

**Cause**: `FTP_REMOTE_DIR` is set to a dangerous path

**Fix**:
```bash
# Edit .env.local
FTP_REMOTE_DIR=/public_html/primeos
```

### "WARNING: deleteRemote is ENABLED"

**Cause**: `FTP_DELETE_REMOTE=true` in environment

**Fix**:
```bash
# Remove from .env.local (it should not be set)
# Verify line is removed:
grep FTP_DELETE_REMOTE .env.local
# Should print nothing
```

### "ERROR: ./dist directory not found"

**Cause**: Forgot to build before deploying

**Fix**:
```bash
npm run build:primeos
npm run deploy:hostinger
```

---

## 9. Monitoring & Logging

### Check Deployment History

```bash
# View recent commits to FtpDeploy.mjs
git log --oneline -10 -- scripts/FtpDeploy.mjs

# View what was deployed
git diff HEAD~1 -- scripts/FtpDeploy.mjs
```

### Verify Live Site

After deployment, verify:
- ✅ https://primeos.primeodontologia.com.br loads
- ✅ https://primeodontologia.com.br still works
- ✅ Assets load correctly (images, CSS, JS)
- ✅ API endpoints respond

---

## 10. Emergency Contacts

### If Disaster Strikes Again

1. **Hostinger Support**: contact@hostinger.com
   - Explain data loss
   - Request emergency backup recovery
   - Ask for automated backup setup

2. **GitHub Repository**:
   - All deployment configs are version controlled
   - Can revert to safe state: `git checkout HEAD~1 scripts/FtpDeploy.mjs`

3. **Local Backups**:
   - Keep `dist_backup_*` folders for 30 days
   - Never delete them without verification

---

## Summary

| Protection Layer | What It Does |
|---|---|
| **Script Validation** | Rejects dangerous paths & settings |
| **Git Pre-Commit Hook** | Blocks commits with `deleteRemote: true` |
| **Manual Confirmation** | Requires "yes" before uploading |
| **Build Verification** | Ensures `./dist` exists |
| **Environment Check** | Validates `.env.local` exists |
| **Hostinger Backups** | Automated recovery option |
| **Version Control** | All changes tracked in git |

---

**Last Updated**: June 1, 2026
**Status**: ✅ All protections active after restoration
