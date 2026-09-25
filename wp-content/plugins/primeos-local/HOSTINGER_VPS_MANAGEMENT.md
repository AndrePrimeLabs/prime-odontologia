# Hostinger VPS Multi-Service Management Guide

## Architecture Overview

Your production stack on Hostinger VPS:

```
┌─────────────────────────────────────────────────────┐
│ Public (HTTPS: primeos.primeodontologia.com.br)     │
├─────────────────────────────────────────────────────┤
│ Nginx Reverse Proxy (SSL Termination)               │
└──────────────┬──────────────┬───────────┬───────────┘
               │              │           │
     ┌─────────▼────┐  ┌──────▼──────┐  ┌─▼──────────┐
     │  PrimeOS     │  │  Pandora    │  │ OpenClaw   │
     │  Frontend    │  │  Backend    │  │ Orchestr.  │
     │  (Port 3000) │  │  (Port 3001)│  │ (Port 3002)│
     └──────────────┘  └──────┬──────┘  └────────────┘
                               │
                    ┌──────────▼────────────┐
                    │  PostgreSQL Database  │
                    │  (Port 5432)          │
                    └───────────────────────┘
                    
                    ┌───────────────────────┐
                    │  Redis Cache          │
                    │  (Port 6379)          │
                    └───────────────────────┘
```

## Quick Commands

### Status & Monitoring

```bash
# Check all services
docker compose -f docker-compose.prod.yml ps

# View logs (all services)
docker compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker compose -f docker-compose.prod.yml logs -f pandora-backend
docker compose -f docker-compose.prod.yml logs -f primeos-app
docker compose -f docker-compose.prod.yml logs -f openclaw

# Monitor resource usage
docker stats

# Check service health
curl https://primeos.primeodontologia.com.br/_health/primeos
curl https://primeos.primeodontologia.com.br/_health/pandora
curl https://primeos.primeodontologia.com.br/_health/openclaw
```

### Service Management

```bash
# Start all services
docker compose -f docker-compose.prod.yml up -d

# Stop all services
docker compose -f docker-compose.prod.yml down

# Restart specific service
docker compose -f docker-compose.prod.yml restart pandora-backend

# Rebuild specific service
docker compose -f docker-compose.prod.yml build pandora-backend
docker compose -f docker-compose.prod.yml up -d pandora-backend

# Execute command in service
docker compose -f docker-compose.prod.yml exec pandora-backend npm run migrate
docker compose -f docker-compose.prod.yml exec postgres psql -U pandora_user -d pandora_db
```

### Database Management

```bash
# Connect to PostgreSQL
docker compose -f docker-compose.prod.yml exec postgres psql -U pandora_user -d pandora_db

# Backup database
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U pandora_user pandora_db > backup-$(date +%Y%m%d_%H%M%S).sql

# Restore database
docker compose -f docker-compose.prod.yml exec -T postgres psql -U pandora_user -d pandora_db < backup.sql

# View database size
docker compose -f docker-compose.prod.yml exec postgres psql -U pandora_user -d pandora_db -c "SELECT pg_size_pretty(pg_database.datsize) FROM pg_database WHERE datname = 'pandora_db';"
```

### Container Shell Access

```bash
# Access PrimeOS frontend
docker compose -f docker-compose.prod.yml exec primeos-app sh

# Access Pandora backend
docker compose -f docker-compose.prod.yml exec pandora-backend /bin/bash

# Access OpenClaw
docker compose -f docker-compose.prod.yml exec openclaw /bin/bash

# Access PostgreSQL container
docker compose -f docker-compose.prod.yml exec postgres /bin/sh
```

## Deployment Process

### Initial Deployment

```bash
# 1. SSH into Hostinger VPS
ssh user@your-vps-ip

# 2. Clone or copy repository
git clone https://github.com/PrimeOsHub/primeos.git ~/primeos
cd ~/primeos

# 3. Configure environment files
cp .env.docker .env.docker.local
cp .env.pandora .env.pandora.local
cp .env.postgres .env.postgres.local
cp .env.openclaw .env.openclaw.local

# Edit each file with your production values
nano .env.docker.local
nano .env.pandora.local
nano .env.postgres.local
nano .env.openclaw.local

# 4. Run deployment script
bash scripts/deploy-hostinger.sh prod

# 5. Verify
docker compose -f docker-compose.prod.yml ps
```

### Updating Services

```bash
# Pull latest code
git pull origin main

# Rebuild services
docker compose -f docker-compose.prod.yml build --no-cache

# Restart with new builds
docker compose -f docker-compose.prod.yml up -d

# Verify all services are running
docker compose -f docker-compose.prod.yml ps
```

## Environment Configuration

### .env.docker (Frontend)
```bash
VITE_APP_BASE_URL=https://primeos.primeodontologia.com.br
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
```

### .env.pandora (Backend)
```bash
DB_HOST=postgres
DB_PASSWORD=your-strong-password
PANDORA_API_KEY=your-pandora-api-key
JWT_SECRET=your-jwt-secret-key
```

### .env.postgres (Database)
```bash
POSTGRES_PASSWORD=your-strong-password
POSTGRES_DB=pandora_db
POSTGRES_USER=pandora_user
```

### .env.openclaw (Orchestration)
```bash
PANDORA_API_URL=http://pandora-backend:3001
OPENCLAW_PORT=3000
```

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs pandora-backend

# Common issues:
# 1. Port already in use
lsof -i :3001
kill -9 <PID>

# 2. Missing environment variables
docker compose -f docker-compose.prod.yml config | grep -i undefined

# 3. Database connection failed
docker compose -f docker-compose.prod.yml exec postgres pg_isready -U pandora_user
```

### High CPU/Memory Usage

```bash
# Check which container is using resources
docker stats

# Check container logs for errors
docker compose -f docker-compose.prod.yml logs --tail 50

# Restart container
docker compose -f docker-compose.prod.yml restart pandora-backend
```

### Database Issues

```bash
# Check PostgreSQL logs
docker compose -f docker-compose.prod.yml logs postgres

# Test connection
docker compose -f docker-compose.prod.yml exec postgres pg_isready -U pandora_user

# Check disk space
docker compose -f docker-compose.prod.yml exec postgres du -sh /var/lib/postgresql/data
```

### Nginx Issues

```bash
# Test Nginx config
docker compose -f docker-compose.prod.yml exec nginx nginx -t

# Check Nginx logs
docker compose -f docker-compose.prod.yml logs nginx

# Reload Nginx
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

## Backup & Recovery

### Automated Backups

```bash
# Create backup script
cat > scripts/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/primeos/backups"
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
docker compose -f /home/primeos/docker-compose.prod.yml exec -T postgres \
  pg_dump -U pandora_user pandora_db > $BACKUP_DIR/pandora_$DATE.sql

# Backup volumes
tar -czf $BACKUP_DIR/primeos-data_$DATE.tar.gz -C /var/lib/docker/volumes primeos-data

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x scripts/backup-db.sh

# Schedule daily at 2 AM
crontab -e
# Add: 0 2 * * * /home/primeos/scripts/backup-db.sh
```

### Manual Backup

```bash
# Backup database
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U pandora_user pandora_db > backup-$(date +%Y%m%d_%H%M%S).sql

# Backup volumes
docker compose -f docker-compose.prod.yml exec -T postgres tar -czf - /var/lib/postgresql/data > db-volume-$(date +%Y%m%d_%H%M%S).tar.gz

# Download from VPS
scp user@vps-ip:~/primeos/backup-*.sql ./
scp user@vps-ip:~/primeos/db-volume-*.tar.gz ./
```

### Recovery

```bash
# Stop services
docker compose -f docker-compose.prod.yml down

# Restore database
docker compose -f docker-compose.prod.yml up -d postgres
sleep 10
docker compose -f docker-compose.prod.yml exec -T postgres psql -U pandora_user -d pandora_db < backup-20240101_120000.sql

# Restart all services
docker compose -f docker-compose.prod.yml up -d
```

## Security Best Practices

1. **Secrets Management**
   - Never commit `.env.*` files to Git
   - Use separate keys for dev/staging/production
   - Rotate API keys quarterly
   - Use strong passwords (20+ chars, mixed case, symbols)

2. **Network Security**
   ```bash
   # Enable UFW firewall
   sudo ufw allow 22
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   
   # Disable unnecessary services
   sudo systemctl disable unused-service
   ```

3. **SSL/TLS**
   - Auto-renewal via Certbot
   - Monitor certificate expiration:
     ```bash
     certbot certificates
     ```

4. **Database Security**
   - Use strong PostgreSQL password
   - Enable connection logging
   - Regular backups with encryption
   - Restrict database access to containers only

5. **Access Control**
   - Admin dashboard internal-only (restricted IPs)
   - SSH key-based authentication (no passwords)
   - Regular security updates:
     ```bash
     sudo apt-get update && sudo apt-get upgrade -y
     ```

## Performance Optimization

```bash
# View resource usage
docker stats --no-stream

# Optimize images
docker compose -f docker-compose.prod.yml build --no-cache

# Prune unused images/volumes
docker image prune -a
docker volume prune

# Check disk space
df -h
docker system df
```

## Monitoring & Alerts

### Manual Monitoring

```bash
# Check all services healthy
docker compose -f docker-compose.prod.yml ps | grep "Up"

# Monitor in real-time
watch -n 5 'docker compose -f docker-compose.prod.yml ps'
```

### Logging Setup (Optional)

```bash
# Centralize logs to /var/log/docker-compose/
mkdir -p /var/log/docker-compose
docker compose -f docker-compose.prod.yml logs > /var/log/docker-compose/primeos.log
```

## Documentation

- **PrimeOS Frontend**: See `.env.docker` for Vite/React variables
- **Pandora Backend**: See `.env.pandora` for API configuration
- **OpenClaw Tasks**: See `.env.openclaw` for task settings
- **Database**: PostgreSQL 16 Alpine, initialized with `scripts/init-db.sql`
- **Cache**: Redis 7 Alpine for session/cache management

## Support & Troubleshooting

For issues:
1. Check service logs: `docker compose logs [service]`
2. Verify configuration: `docker compose config`
3. Test connectivity: `docker compose exec postgres pg_isready`
4. Review resource usage: `docker stats`

