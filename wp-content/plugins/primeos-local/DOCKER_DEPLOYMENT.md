# Docker Deployment Guide for PrimeOS

**Deployment Method**: Self-hosted using Docker containers  
**Hosting Options**: Your own VPS, cloud VM, or local server  
**Technology**: Node.js + Nginx in Docker containers

---

## Overview

Docker allows you to package PrimeOS as a container and deploy it to any server running Docker. This gives you:

✅ **Consistent environment** — Works same everywhere  
✅ **Easy scaling** — Run multiple instances  
✅ **Simple updates** — Just rebuild and restart  
✅ **No vendor lock-in** — Works on any cloud provider  

---

## Prerequisites

### Local Machine

- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed (comes with Docker Desktop)

### Verify Installation

```bash
docker --version     # Should show: Docker version XX.XX.XX
docker-compose --version  # Should show: Docker Compose version XX.XX.XX
```

### For VPS Deployment

- Linux VPS with Docker & Docker Compose installed
- SSH access to your server
- Domain name (optional)

---

## Method 1: Local Docker Development

### Build Docker Image

```bash
# Build the image (first time only)
npm run docker:build

# Or manually:
docker build -f docker/Dockerfile -t primeos-app:latest .
```

**What it does**:

1. Installs Node.js dependencies
2. Runs production build (`npm run build`)
3. Packages app with Nginx web server
4. Creates image `primeos-app:latest`

### Run with Docker Compose (Recommended)

```bash
# Start the app with Docker Compose
npm run docker:compose

# Or manually:
docker compose -f docker/docker-compose.yml up --build
```

**What happens**:

- Builds image (if needed)
- Starts container on port 80
- App accessible at: `http://localhost`

### Verify It's Running

```bash
# Check containers
docker ps

# Should show:
# CONTAINER ID  IMAGE         STATUS         PORTS
# abc123...     primeos-app   Up XX seconds  0.0.0.0:80->80/tcp
```

### Stop the Container

```bash
# Stop with Ctrl+C (if running foreground)
# Or stop background container:
docker compose -f docker/docker-compose.yml down
```

---

## Method 2: Deploy to VPS

### Step 1: Prepare Your VPS

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Install Docker (if not already installed)
curl -fsSL https://get.docker.com | sh

# Add current user to docker group (optional, allows docker without sudo)
sudo usermod -aG docker $USER
newgrp docker

# Verify Docker works
docker --version
docker compose --version
```

### Step 2: Copy Files to VPS

### Option A: Using Git (Recommended)

```bash
# On VPS:
ssh root@your-vps-ip

# Clone repository
git clone https://github.com/PrimeOsHub/primeos.git
cd primeos

# Or pull latest:
git pull origin main
```

### Option B: Using SCP (Direct File Copy)

```bash
# From local machine:
scp -r docker-compose.yml root@your-vps-ip:/app/
scp -r docker/ root@your-vps-ip:/app/
scp -r package*.json root@your-vps-ip:/app/
```

### Step 3: Set Up Environment on VPS

```bash
# SSH into VPS
ssh root@your-vps-ip
cd /app

# Create .env file with required variables
cat > .env.production << EOF
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_FIREBASE_PROJECT_ID=your-firebase-id
# ... add other VITE_ variables
EOF
```

### Step 4: Build & Run on VPS

```bash
# SSH into VPS
ssh root@your-vps-ip
cd /app

# Build image
docker build -f docker/Dockerfile -t primeos-app:latest .

# Start with Docker Compose
docker compose -f docker/docker-compose.yml up -d

# Verify running
docker ps
```

**Expected Output**:

```text
CONTAINER ID  IMAGE              STATUS         PORTS
abc123...     primeos-app:latest Up 2 seconds   0.0.0.0:80->80/tcp
```

### Step 5: Verify Deployment

```bash
# From your local machine, visit:
http://your-vps-ip

# Or if domain configured:
http://primeos.primeodontologia.com.br
```

Should see PrimeOS frontend! 🎉

---

## Method 3: Docker with Custom Domain & SSL

### Setup Nginx Reverse Proxy (Optional)

For production with SSL, set up Nginx on host:

```nginx
# /etc/nginx/sites-available/primeos

server {
    listen 443 ssl http2;
    server_name primeos.primeodontologia.com.br;

    ssl_certificate /etc/letsencrypt/live/primeos.primeodontologia.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/primeos.primeodontologia.com.br/privkey.pem;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name primeos.primeodontologia.com.br;
    return 301 https://$server_name$request_uri;
}
```

### Setup SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d primeos.primeodontologia.com.br

# Auto-renew
sudo systemctl enable certbot.timer
```

---

## Docker Compose Configuration Reference

View current configuration:

```bash
cat docker/docker-compose.yml
```

**Current Setup**:

```yaml
services:
  primeos:
    build:
      context: ..           # Build from parent directory (repo root)
      dockerfile: docker/Dockerfile
    ports:
      - "80:80"             # Port mapping
    restart: unless-stopped # Auto-restart if container crashes
```

### Customize Configuration

**Add environment variables**:

```yaml
services:
  primeos:
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=info
```

**Change port**:

```yaml
ports:
  - "8080:80"  # Access at localhost:8080 instead of 80
```

**Add volume for persistent data**:

```yaml
volumes:
  - /path/to/data:/app/data
```

---

## Common Docker Commands

### Image Management

```bash
# List images
docker images

# Remove image
docker rmi primeos-app:latest

# Tag image
docker tag primeos-app:latest primeos-app:v1.0.0
```

### Container Management

```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# View container logs
docker logs <container-id>
docker logs -f <container-id>  # Follow logs (like tail -f)

# Stop container
docker stop <container-id>

# Start container
docker start <container-id>

# Remove container
docker rm <container-id>

# Execute command in running container
docker exec <container-id> ls -la

# Interactive shell in container
docker exec -it <container-id> sh
```

### Docker Compose Commands

```bash
# Start services
docker compose -f docker/docker-compose.yml up

# Start in background
docker compose -f docker/docker-compose.yml up -d

# View logs
docker compose -f docker/docker-compose.yml logs

# Follow logs
docker compose -f docker/docker-compose.yml logs -f

# Stop services
docker compose -f docker/docker-compose.yml stop

# Stop and remove containers
docker compose -f docker/docker-compose.yml down

# Rebuild images
docker compose -f docker/docker-compose.yml up --build
```

---

## Deployment Workflow

### Development

```bash
npm run docker:compose
# App at http://localhost
# Hit Ctrl+C to stop
```

### Local Testing Before VPS

```bash
# Build production image
npm run docker:build

# Test production build locally
docker run -p 80:80 primeos-app:latest
# Visit http://localhost
```

### Deploy to VPS

```bash
# 1. Push code to GitHub
git push origin main

# 2. On VPS, pull latest
ssh root@your-vps-ip
cd /app
git pull origin main

# 3. Rebuild and restart
docker compose -f docker/docker-compose.yml down
docker compose -f docker/docker-compose.yml up --build -d

# 4. Verify
docker ps
curl http://localhost
```

---

## Troubleshooting

### "Cannot connect to Docker daemon"

```bash
# Docker not running or not installed
sudo systemctl start docker

# Or on macOS:
# Open Docker Desktop app
```

### "Port 80 already in use"

```bash
# Change port in docker-compose.yml:
ports:
  - "8080:80"  # Use 8080 instead

# Or kill the process using port 80:
sudo lsof -ti:80 | xargs sudo kill -9
```

### "Out of disk space"

```bash
# Clean up Docker
docker system prune -a

# This removes:
# - Stopped containers
# - Unused images
# - Unused volumes
# - Build cache
```

### Container exits immediately

```bash
# Check logs
docker logs <container-id>

# Look for error messages
```

### Need to update code on running VPS

```bash
# On VPS:
cd /app
git pull origin main
docker compose -f docker/docker-compose.yml up --build -d
```

---

## Performance Tips

### Use .dockerignore

Create `docker/.dockerignore`:

```text
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.DS_Store
```

This speeds up Docker builds by excluding unnecessary files.

### Multi-stage Build

The Dockerfile already uses multi-stage builds:

1. Stage 1: Build with Node.js
2. Stage 2: Runtime with Nginx only

This results in small image size (~100-200MB).

### Use image registry for VPS

For multiple VPS or team deployments:

```bash
# Tag image for registry
docker tag primeos-app:latest your-registry/primeos-app:latest

# Push to registry (Docker Hub, AWS ECR, etc.)
docker push your-registry/primeos-app:latest

# On VPS, pull and run
docker pull your-registry/primeos-app:latest
docker run -p 80:80 your-registry/primeos-app:latest
```

---

## Docker Deployment Checklist

- [ ] Docker installed locally
- [ ] Docker Compose installed locally
- [ ] `npm run docker:build` succeeds
- [ ] `npm run docker:compose` runs without errors
- [ ] App accessible at <http://localhost>
- [ ] VPS has Docker installed
- [ ] Repository cloned to VPS
- [ ] `.env.production` set on VPS
- [ ] `docker compose up -d` succeeds on VPS
- [ ] App accessible at <http://your-vps-ip>
- [ ] Custom domain DNS configured (optional)
- [ ] SSL certificate installed (optional)
- [ ] Container auto-restarts on reboot ✓ (set in docker-compose.yml)

---

## Compare Deployment Methods

| Feature | Docker | Hostinger FTP | Firebase |
| --------- | -------- | --------------- | ---------- |
| **Complexity** | Medium | Simple | Simple |
| **Cost** | $5-20/mo VPS | ~$5/mo | Free tier available |
| **Control** | Full | Limited | Limited |
| **Scalability** | ✅ Easy | ❌ No | ✅ Yes |
| **Custom Server** | ✅ Yes | ❌ No | ❌ No |
| **Database** | ✅ Any | Via Supabase | Via Firebase/Supabase |
| **Setup Time** | 30 min | 15 min | 15 min |
| **SSL** | ✅ Easy | ✅ Included | ✅ Included |

---

## Next Steps

1. **Local Testing**: `npm run docker:compose`
2. **Get VPS**: DigitalOcean, Linode, AWS, Google Cloud, etc.
3. **Install Docker** on VPS (follow Step 1 above)
4. **Deploy** (follow Step 2-5 above)
5. **Monitor** with `docker logs -f`

---

## Resources

- [Docker Documentation](https://docs.docker.com)
- [Docker Compose Docs](https://docs.docker.com/compose)
- [Nginx Documentation](https://nginx.org)
- [Let's Encrypt SSL](https://letsencrypt.org)
- [VPS Providers](https://www.hostinger.com/vps) (DigitalOcean, Linode, etc.)

---

**Ready to deploy with Docker?** Start with:

```bash
npm run docker:compose
# Then visit http://localhost
```
