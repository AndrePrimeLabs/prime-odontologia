#!/bin/bash
set -e

# ============================================================================
# PrimeOS Production Deployment Script for Hostinger VPS
# ============================================================================
# This script deploys PrimeOS with Pandora backend and OpenClaw orchestration
# Usage: bash deploy.sh [dev|staging|prod]
# ============================================================================

ENVIRONMENT="${1:-prod}"
DEPLOY_DIR="/home/primeos"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
    exit 1
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# ============================================================================
# PRE-DEPLOYMENT CHECKS
# ============================================================================
log "Starting PrimeOS deployment to $ENVIRONMENT..."

if ! command -v docker &> /dev/null; then
    error "Docker not installed. Please install Docker first."
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose not installed. Please install Docker Compose first."
fi

log "✓ Docker and Docker Compose are installed"

# ============================================================================
# BACKUP EXISTING DATA
# ============================================================================
if [ -d "$DEPLOY_DIR" ]; then
    log "Backing up existing deployment..."
    BACKUP_DIR="$DEPLOY_DIR/backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup volumes
    docker compose -f "$DEPLOY_DIR/$DOCKER_COMPOSE_FILE" down -v --remove-orphans 2>/dev/null || true
    
    # Backup data folders
    if [ -d "$DEPLOY_DIR/data" ]; then
        cp -r "$DEPLOY_DIR/data" "$BACKUP_DIR/"
        log "✓ Backed up to $BACKUP_DIR"
    fi
fi

# ============================================================================
# ENVIRONMENT SETUP
# ============================================================================
log "Setting up environment files..."

if [ ! -f "$DEPLOY_DIR/.env.docker" ]; then
    warn "Missing .env.docker - copy from backup or create new"
    mkdir -p "$DEPLOY_DIR"
    cp .env.docker "$DEPLOY_DIR/.env.docker" 2>/dev/null || {
        warn "Please configure .env.docker with your production values"
    }
fi

if [ ! -f "$DEPLOY_DIR/.env.pandora" ]; then
    cp .env.pandora "$DEPLOY_DIR/.env.pandora"
    warn "Configure .env.pandora with Pandora API keys"
fi

if [ ! -f "$DEPLOY_DIR/.env.postgres" ]; then
    cp .env.postgres "$DEPLOY_DIR/.env.postgres"
    warn "Configure .env.postgres with database credentials"
fi

if [ ! -f "$DEPLOY_DIR/.env.openclaw" ]; then
    cp .env.openclaw "$DEPLOY_DIR/.env.openclaw"
    warn "Configure .env.openclaw with OpenClaw settings"
fi

log "✓ Environment files configured"

# ============================================================================
# PULL LATEST CODE
# ============================================================================
log "Pulling latest code from repository..."
cd "$DEPLOY_DIR"

if [ -d ".git" ]; then
    git fetch origin
    git reset --hard origin/main || git reset --hard origin/master
    log "✓ Code updated"
else
    warn "Not a git repository, skipping code update"
fi

# ============================================================================
# BUILD & DEPLOY
# ============================================================================
log "Building Docker images..."
docker compose -f "$DOCKER_COMPOSE_FILE" build --no-cache

log "Starting services..."
docker compose -f "$DOCKER_COMPOSE_FILE" up -d

log "Waiting for services to be healthy..."
sleep 10

# ============================================================================
# HEALTH CHECKS
# ============================================================================
log "Running health checks..."

check_service() {
    local service=$1
    local port=$2
    local endpoint=${3:-/}
    
    if docker compose -f "$DOCKER_COMPOSE_FILE" ps "$service" | grep -q "Up"; then
        log "✓ $service is running"
        return 0
    else
        error "$service failed to start"
    fi
}

check_service "primeos-app" "3000"
check_service "pandora-backend" "3001"
check_service "postgres" "5432"
check_service "openclaw" "3002"

# ============================================================================
# DATABASE INITIALIZATION
# ============================================================================
log "Initializing databases..."

# Wait for PostgreSQL to be ready
until docker compose -f "$DOCKER_COMPOSE_FILE" exec -T postgres pg_isready -U pandora_user &>/dev/null; do
    log "Waiting for PostgreSQL..."
    sleep 2
done

log "✓ PostgreSQL is ready"

# Run database migrations if script exists
if [ -f "./scripts/init-db.sql" ]; then
    log "Running database migrations..."
    docker compose -f "$DOCKER_COMPOSE_FILE" exec -T postgres psql -U pandora_user -d pandora_db -f /docker-entrypoint-initdb.d/init.sql
    log "✓ Database initialized"
fi

# ============================================================================
# SSL SETUP (Let's Encrypt)
# ============================================================================
if [ ! -f "$DEPLOY_DIR/ssl/fullchain.pem" ]; then
    log "Setting up SSL with Let's Encrypt..."
    
    if command -v certbot &> /dev/null; then
        certbot certonly --standalone \
            -d primeos.primeodontologia.com.br \
            -d admin.primeos.primeodontologia.com.br \
            --email admin@primeodontologia.com.br \
            --agree-tos \
            --non-interactive
        
        # Copy certs to nginx volume
        mkdir -p "$DEPLOY_DIR/ssl"
        cp /etc/letsencrypt/live/primeos.primeodontologia.com.br/fullchain.pem "$DEPLOY_DIR/ssl/"
        cp /etc/letsencrypt/live/primeos.primeodontologia.com.br/privkey.pem "$DEPLOY_DIR/ssl/"
        
        log "✓ SSL certificates configured"
    else
        warn "Certbot not installed - SSL setup skipped. Install with: sudo apt-get install certbot"
    fi
fi

# ============================================================================
# POST-DEPLOYMENT
# ============================================================================
log "Running post-deployment tasks..."

# Create cron job for Let's Encrypt renewal
if ! crontab -l 2>/dev/null | grep -q "certbot renew"; then
    log "Setting up certificate renewal cron job..."
    (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet") | crontab -
    log "✓ Certificate renewal scheduled daily at 3 AM"
fi

# Create backup cron job
if ! crontab -l 2>/dev/null | grep -q "backup-db.sh"; then
    log "Setting up database backup cron job..."
    (crontab -l 2>/dev/null; echo "0 2 * * * $DEPLOY_DIR/scripts/backup-db.sh") | crontab -
    log "✓ Daily backups scheduled at 2 AM"
fi

# ============================================================================
# DEPLOYMENT SUMMARY
# ============================================================================
log ""
log "========================================="
log "✓ DEPLOYMENT COMPLETE!"
log "========================================="
log ""
log "Services running:"
docker compose -f "$DOCKER_COMPOSE_FILE" ps
log ""
log "Access points:"
log "  PrimeOS Frontend: https://primeos.primeodontologia.com.br"
log "  Pandora Backend API: https://primeos.primeodontologia.com.br/api/pandora"
log "  OpenClaw Management: https://primeos.primeodontologia.com.br/api/openclaw"
log "  Admin Dashboard: https://admin.primeos.primeodontologia.com.br (internal only)"
log ""
log "Logs:"
log "  docker compose -f $DOCKER_COMPOSE_FILE logs -f [service]"
log ""
log "Next steps:"
log "  1. Verify services are healthy: docker compose ps"
log "  2. Check logs: docker compose logs -f"
log "  3. Configure Pandora API keys in .env.pandora"
log "  4. Set up DNS records pointing to this VPS"
log ""

exit 0
