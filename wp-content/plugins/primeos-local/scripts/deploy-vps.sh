#!/bin/bash

# ============================================================================
# PRIMEOS VPS DEPLOYMENT SCRIPT
# ============================================================================
# Deploys primeos-local to VPS at primeos.primeodontologia.com.br
#
# Usage:
#   ./scripts/deploy-vps.sh [IP] [USERNAME] [ACTION]
#
# Examples:
#   ./scripts/deploy-vps.sh 82.29.56.236 root setup
#   ./scripts/deploy-vps.sh 82.29.56.236 root deploy
#   ./scripts/deploy-vps.sh 82.29.56.236 root restart
#   ./scripts/deploy-vps.sh 82.29.56.236 root status
#
# ============================================================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Variables
VPS_IP=${1:-82.29.56.236}
VPS_USER=${2:-root}
ACTION=${3:-deploy}
VPS_PATH="/root/primeos-local"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

print_header() {
  echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

print_info() {
  echo -e "${YELLOW}ℹ️  $1${NC}"
}

# ============================================================================
# SETUP: Initial VPS setup
# ============================================================================
setup_vps() {
  print_header "🚀 SETTING UP VPS"
  
  print_info "Connecting to VPS: $VPS_USER@$VPS_IP"
  
  ssh "$VPS_USER@$VPS_IP" << 'EOF'
    print_info "Installing Docker & Docker Compose..."
    
    # Update system
    apt-get update
    apt-get upgrade -y
    
    # Install Docker
    curl -fsSL https://get.docker.com | sh
    
    # Add user to docker group
    usermod -aG docker root
    
    # Install Docker Compose
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # Verify installation
    docker --version
    docker compose --version
    
    # Create project directory
    mkdir -p /root/primeos-local
    
    print_success "VPS setup complete!"
EOF
}

# ============================================================================
# DEPLOY: Deploy primeos-local to VPS
# ============================================================================
deploy() {
  print_header "📦 DEPLOYING TO VPS"
  
  # Build locally
  print_info "Building locally first..."
  npm run build
  
  # Copy files to VPS
  print_info "Copying files to VPS..."
  scp -r Dockerfile nginx.conf .dockerignore "$VPS_USER@$VPS_IP:$VPS_PATH/"
  scp -r dist "$VPS_USER@$VPS_IP:$VPS_PATH/"
  scp docker-compose.vps.yml traefik.yml config.yml "$VPS_USER@$VPS_IP:$VPS_PATH/"
  scp .env.production "$VPS_USER@$VPS_IP:$VPS_PATH/.env"
  
  # Deploy on VPS
  print_info "Deploying on VPS..."
  ssh "$VPS_USER@$VPS_IP" << DEPLOY_COMMANDS
    cd $VPS_PATH
    
    # Build Docker image
    docker build -t primeos:latest .
    
    # Start services
    docker compose -f docker-compose.vps.yml down || true
    docker compose -f docker-compose.vps.yml up -d
    
    # Wait for services
    sleep 10
    
    # Check status
    docker compose -f docker-compose.vps.yml ps
    
    print_success "Deployment complete!"
DEPLOY_COMMANDS
}

# ============================================================================
# RESTART: Restart services on VPS
# ============================================================================
restart() {
  print_header "🔄 RESTARTING VPS SERVICES"
  
  ssh "$VPS_USER@$VPS_IP" << RESTART_COMMANDS
    cd $VPS_PATH
    docker compose -f docker-compose.vps.yml restart
    sleep 5
    docker compose -f docker-compose.vps.yml ps
RESTART_COMMANDS
  
  print_success "Services restarted!"
}

# ============================================================================
# STATUS: Check VPS status
# ============================================================================
status() {
  print_header "📊 VPS STATUS"
  
  ssh "$VPS_USER@$VPS_IP" << STATUS_COMMANDS
    cd $VPS_PATH
    
    echo "🐳 Docker Containers:"
    docker compose -f docker-compose.vps.yml ps
    
    echo ""
    echo "📊 Disk Usage:"
    du -sh $VPS_PATH
    
    echo ""
    echo "🔗 Network Status:"
    docker compose -f docker-compose.vps.yml logs --tail=5 traefik 2>&1 | head -20
STATUS_COMMANDS
}

# ============================================================================
# LOGS: View VPS logs
# ============================================================================
logs() {
  print_header "📋 VPS LOGS"
  
  ssh "$VPS_USER@$VPS_IP" << LOGS_COMMANDS
    cd $VPS_PATH
    docker compose -f docker-compose.vps.yml logs -f primeos-app
LOGS_COMMANDS
}

# ============================================================================
# BACKUP: Backup VPS data
# ============================================================================
backup() {
  print_header "💾 BACKING UP VPS DATA"
  
  BACKUP_FILE="primeos-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
  
  print_info "Creating backup: $BACKUP_FILE"
  
  ssh "$VPS_USER@$VPS_IP" << BACKUP_COMMANDS
    cd /root
    tar -czf $BACKUP_FILE primeos-local/
    ls -lh $BACKUP_FILE
BACKUP_COMMANDS
  
  # Download backup
  scp "$VPS_USER@$VPS_IP:/root/$BACKUP_FILE" "./backups/$BACKUP_FILE"
  
  print_success "Backup created: ./backups/$BACKUP_FILE"
}

# ============================================================================
# SSL: Check SSL certificate status
# ============================================================================
ssl_status() {
  print_header "🔐 SSL CERTIFICATE STATUS"
  
  ssh "$VPS_USER@$VPS_IP" << SSL_COMMANDS
    cd $VPS_PATH
    
    if [ -f "/var/lib/docker/volumes/primeos-local_traefik-acme/_data/acme.json" ]; then
      echo "📄 ACME Certificates Found:"
      docker exec traefik-proxy ls -la /acme/
    else
      echo "⚠️  No ACME certificates found yet (will be created on first HTTPS request)"
    fi
    
    echo ""
    echo "🌐 Testing HTTPS:"
    curl -I https://primeos.primeodontologia.com.br
SSL_COMMANDS
}

# ============================================================================
# MAIN
# ============================================================================

case "$ACTION" in
  setup)
    setup_vps
    ;;
  deploy)
    deploy
    ;;
  restart)
    restart
    ;;
  status)
    status
    ;;
  logs)
    logs
    ;;
  backup)
    backup
    ;;
  ssl)
    ssl_status
    ;;
  *)
    print_error "Unknown action: $ACTION"
    echo ""
    echo "Available actions:"
    echo "  setup   - Initial VPS setup (install Docker, etc.)"
    echo "  deploy  - Build locally and deploy to VPS"
    echo "  restart - Restart services on VPS"
    echo "  status  - Show VPS status"
    echo "  logs    - Tail VPS logs"
    echo "  backup  - Backup VPS data"
    echo "  ssl     - Check SSL certificate status"
    exit 1
    ;;
esac
