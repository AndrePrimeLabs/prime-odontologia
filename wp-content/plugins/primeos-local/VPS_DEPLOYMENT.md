# 🚀 VPS DEPLOYMENT GUIDE - primeos.primeodontologia.com.br

**Status**: Production Deployment Ready  
**Domain**: primeos.primeodontologia.com.br  
**VPS**: Hostinger (82.29.56.236)  
**Tech**: Docker + Traefik (SSL/TLS)  

---

## 📋 Prerequisites

### Local Requirements
- ✅ Node 26 LTS
- ✅ npm 11.19.0
- ✅ Docker installed
- ✅ SSH access to VPS
- ✅ Git installed

### VPS Requirements
- ✅ Linux VPS (Ubuntu 20.04+)
- ✅ Minimum 2GB RAM
- ✅ 20GB disk space
- ✅ SSH root access
- ✅ Domain DNS pointing to VPS IP (82.29.56.236)

---

## 🔧 Setup Steps

### Step 1: Prepare Local Environment

```bash
# Build the app
npm run build

# Verify dist/ exists
ls -la dist/

# Create production env file
cp .env.example .env.production
# Edit with production values
nano .env.production
```

### Step 2: Configure DNS

Point your domain to the VPS IP:

```
primeos.primeodontologia.com.br  A  82.29.56.236
```

**Where**: Hostinger DNS settings  
**TTL**: 3600 (1 hour)  
**Propagation time**: 5-30 minutes

### Step 3: Initial VPS Setup

```bash
# Run setup script (one-time)
./scripts/deploy-vps.sh 82.29.56.236 root setup
```

This will:
- ✅ Update system packages
- ✅ Install Docker
- ✅ Install Docker Compose
- ✅ Create project directory

### Step 4: Deploy to VPS

```bash
# Deploy app
./scripts/deploy-vps.sh 82.29.56.236 root deploy
```

This will:
- ✅ Build locally
- ✅ Copy files to VPS
- ✅ Build Docker image on VPS
- ✅ Start services

### Step 5: Verify Deployment

```bash
# Check status
./scripts/deploy-vps.sh 82.29.56.236 root status

# View logs
./scripts/deploy-vps.sh 82.29.56.236 root logs

# Check SSL (after 2-3 minutes)
./scripts/deploy-vps.sh 82.29.56.236 root ssl
```

---

## 📊 What Gets Deployed

### Services

| Service | Role | Port | SSL |
|---------|------|------|-----|
| **Traefik** | Reverse proxy, SSL/TLS | 80, 443 | ✅ Let's Encrypt |
| **primeos-app** | Frontend (React + Nginx) | 80 | ✅ Via Traefik |
| **postgres** (optional) | Database | 5432 | Internal |
| **redis** (optional) | Cache | 6379 | Internal |

### Endpoints

| URL | Purpose | Status |
|-----|---------|--------|
| https://primeos.primeodontologia.com.br | App | ✅ Public |
| https://primeos.primeodontologia.com.br/health | Health check | ✅ Public |
| http://82.29.56.236:8080/dashboard | Traefik dashboard | 🔒 Internal |

---

## 🔐 Security Configuration

### SSL/TLS (Automatic)
- **Provider**: Let's Encrypt
- **Auto-renewal**: 30 days before expiration
- **Certificate file**: /acme/acme.json (in traefik volume)
- **Min TLS version**: 1.2
- **Ciphers**: Strong ECDHE + ChaCha20

### Security Headers
```
X-Frame-Options: SAMEORIGIN            (Clickjacking protection)
X-Content-Type-Options: nosniff         (MIME sniffing protection)
Strict-Transport-Security: 2 years      (Force HTTPS)
Content-Security-Policy: strict         (XSS protection)
```

### Network Isolation
- **traefik-net**: Traefik + app only
- **primeos-internal**: Private backend services
- **No direct internet access**: Databases, cache isolated

---

## 🔄 Common Operations

### Deploy Updates

```bash
# Make changes locally
git commit -am "Update feature"
git push origin main

# Deploy to VPS
npm run build
./scripts/deploy-vps.sh 82.29.56.236 root deploy
```

### View Logs

```bash
# Tail app logs
./scripts/deploy-vps.sh 82.29.56.236 root logs

# Or SSH directly
ssh root@82.29.56.236
cd /root/primeos-local
docker compose -f docker-compose.vps.yml logs -f primeos-app
```

### Restart Services

```bash
./scripts/deploy-vps.sh 82.29.56.236 root restart
```

### Check Status

```bash
./scripts/deploy-vps.sh 82.29.56.236 root status
```

### Backup Data

```bash
./scripts/deploy-vps.sh 82.29.56.236 root backup
```

---

## 🆘 Troubleshooting

### SSL Certificate Not Issued
```bash
# Check Traefik logs
docker compose -f docker-compose.vps.yml logs traefik

# Common causes:
# - DNS not pointing to VPS yet
# - Port 80 not accessible from internet
# - Wrong email in .env.production
```

### App Not Loading
```bash
# Check app health
curl https://primeos.primeodontologia.com.br/health

# View logs
./scripts/deploy-vps.sh 82.29.56.236 root logs

# Check if container is running
docker compose -f docker-compose.vps.yml ps
```

### SSL Connection Errors
```bash
# Check certificate
curl -v https://primeos.primeodontologia.com.br

# Verify certificate chain
openssl s_client -connect primeos.primeodontologia.com.br:443
```

### Out of Memory
```bash
# SSH and check
ssh root@82.29.56.236
free -h
docker system df
docker system prune -a
```

---

## 📈 Monitoring

### Health Checks (Automated)
- ✅ Traefik: Every 10 seconds
- ✅ primeos-app: Every 30 seconds

### Manual Monitoring

```bash
# Real-time resource usage
ssh root@82.29.56.236
docker stats

# Disk usage
docker system df

# Network connections
netstat -tlnp | grep docker
```

---

## 🔄 Upgrade Process

### Update App Code

```bash
# 1. Make changes locally
# 2. Commit and push
# 3. Deploy
./scripts/deploy-vps.sh 82.29.56.236 root deploy

# The deploy script will:
# - Build locally
# - Copy to VPS
# - Rebuild Docker image
# - Restart services (zero-downtime)
```

### Rollback (Emergency)

```bash
# SSH to VPS
ssh root@82.29.56.236

# Get previous image (if tagged)
docker images | grep primeos

# Restart with previous version
cd /root/primeos-local
docker compose -f docker-compose.vps.yml down
docker run -d -p 80:80 primeos:previous-tag
```

---

## 💾 Backup Strategy

### Automated Backups

```bash
# Backup data
./scripts/deploy-vps.sh 82.29.56.236 root backup

# Backup downloads to ./backups/
ls -lh backups/
```

### Manual Backup

```bash
ssh root@82.29.56.236
cd /root/primeos-local
tar -czf primeos-backup-$(date +%Y%m%d).tar.gz .

# Download
scp root@82.29.56.236:/root/primeos-backup-*.tar.gz ./backups/
```

---

## 🔑 Important Notes

### Environment Variables
- ✅ **.env.production**: Keep secure, don't commit
- ✅ **ACME_EMAIL**: Required for SSL certificates
- ✅ Supabase/Firebase keys: Use production keys

### Firewall Rules
- ✅ Port 80: Open (HTTP → HTTPS redirect)
- ✅ Port 443: Open (HTTPS)
- ✅ Port 8080: Close or restrict (Traefik dashboard)

### Performance
- ✅ Traefik handles SSL/TLS termination
- ✅ App accessible via primeos-internal network
- ✅ Rate limiting: 100 req/min (configurable)
- ✅ Gzip compression: Auto-enabled

---

## 📞 Support

### Check Deployment Status
```bash
./scripts/deploy-vps.sh 82.29.56.236 root status
```

### View Recent Logs
```bash
./scripts/deploy-vps.sh 82.29.56.236 root logs
```

### Emergency Stop
```bash
ssh root@82.29.56.236
docker compose -f /root/primeos-local/docker-compose.vps.yml down
```

---

## ✅ Deployment Checklist

Before deploying:
- [ ] Node 26 LTS installed locally
- [ ] `npm run build` succeeds
- [ ] `.env.production` filled with real values
- [ ] DNS points to VPS IP
- [ ] SSH access verified: `ssh root@82.29.56.236`
- [ ] VPS has minimum 2GB RAM

After deploying:
- [ ] `curl https://primeos.primeodontologia.com.br/health` returns "healthy"
- [ ] `https://primeos.primeodontologia.com.br` loads in browser
- [ ] SSL certificate valid: `curl -I https://primeos.primeodontologia.com.br`
- [ ] Traefik dashboard accessible: `http://82.29.56.236:8080/dashboard`
- [ ] App accessible from outside: test on mobile/different network

---

**Ready to deploy!** 🚀

```bash
./scripts/deploy-vps.sh 82.29.56.236 root deploy
```

