#!/bin/bash

# ============================================================================
# PrimeOS Local Development Startup Script
# ============================================================================
# Starts the full local stack: Frontend + Supabase + Firebase + pgAdmin
# 
# Usage:
#   ./scripts/start-local.sh          # Start all services
#   ./scripts/start-local.sh --build  # Rebuild images
#   ./scripts/start-local.sh --logs   # Tail logs
#   ./scripts/start-local.sh --down   # Stop services

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================================================
# FUNCTIONS
# ============================================================================

print_header() {
  echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

check_docker() {
  if ! command -v docker &> /dev/null; then
    print_error "Docker not installed. Please install Docker Desktop first."
    exit 1
  fi
  print_success "Docker is installed"
}

check_docker_compose() {
  if ! docker compose --version &> /dev/null; then
    print_error "Docker Compose not found. Please ensure Docker Desktop is installed."
    exit 1
  fi
  print_success "Docker Compose is available"
}

build_docker_image() {
  print_header "Building Docker Image"
  docker compose -f docker-compose.local.yml build
  print_success "Docker image built successfully"
}

start_services() {
  print_header "Starting Services"
  
  if [[ "$1" == "--build" ]]; then
    docker compose -f docker-compose.local.yml up --build -d
  else
    docker compose -f docker-compose.local.yml up -d
  fi
  
  print_success "Services started"
  
  print_header "Waiting for Services to be Healthy"
  
  # Wait for Supabase
  echo -n "⏳ Waiting for Supabase..."
  for i in {1..60}; do
    if curl -s http://localhost:54321/health > /dev/null; then
      print_success "Supabase is ready"
      break
    fi
    if [ $i -eq 60 ]; then
      print_error "Supabase failed to start within 60 seconds"
      exit 1
    fi
    echo -n "."
    sleep 1
  done
  
  # Wait for PrimeOS
  echo -n "⏳ Waiting for PrimeOS..."
  for i in {1..60}; do
    if curl -s http://localhost:3000 > /dev/null; then
      print_success "PrimeOS is ready"
      break
    fi
    if [ $i -eq 60 ]; then
      print_warning "PrimeOS is taking longer than expected (still starting...)"
      break
    fi
    echo -n "."
    sleep 1
  done
}

show_endpoints() {
  print_header "🎯 Local Development Endpoints"
  
  echo -e "${GREEN}Frontend:${NC}"
  echo "  • App: ${BLUE}http://localhost:3000${NC}"
  echo "  • Dev Server: ${BLUE}http://localhost:5173${NC}"
  
  echo -e "\n${GREEN}Backend:${NC}"
  echo "  • Supabase REST API: ${BLUE}http://localhost:54321${NC}"
  echo "  • Supabase Postgres: ${BLUE}localhost:54322${NC} (user: postgres, pass: postgres)"
  echo "  • Firebase Emulator UI: ${BLUE}http://localhost:4000${NC}"
  echo "  • Firebase Auth: ${BLUE}http://localhost:5001${NC}"
  echo "  • Firebase Storage: ${BLUE}http://localhost:8085${NC}"
  
  echo -e "\n${GREEN}Admin Tools:${NC}"
  echo "  • pgAdmin: ${BLUE}http://localhost:5050${NC} (admin@primeos.local / admin123)"
  
  echo -e "\n${YELLOW}Default Credentials (Local Only):${NC}"
  echo "  • Postgres: postgres / postgres"
  echo "  • Firebase: Any credentials work (emulator)"
  echo "  • pgAdmin: admin@primeos.local / admin123"
  
  echo ""
}

show_logs() {
  print_header "📋 Tailing Logs (Ctrl+C to stop)"
  docker compose -f docker-compose.local.yml logs -f
}

stop_services() {
  print_header "Stopping Services"
  docker compose -f docker-compose.local.yml down
  print_success "Services stopped"
}

show_status() {
  print_header "📊 Container Status"
  docker compose -f docker-compose.local.yml ps
}

# ============================================================================
# MAIN SCRIPT
# ============================================================================

print_header "🚀 PrimeOS Local Development Setup"

# Parse arguments
case "$1" in
  --build)
    check_docker
    check_docker_compose
    build_docker_image
    start_services --build
    show_endpoints
    ;;
  --logs)
    show_logs
    ;;
  --down)
    stop_services
    ;;
  --status)
    show_status
    ;;
  --help)
    echo "Usage: ./scripts/start-local.sh [OPTION]"
    echo ""
    echo "Options:"
    echo "  (none)        Start services (assumes already built)"
    echo "  --build       Build and start services"
    echo "  --logs        Tail logs from all services"
    echo "  --status      Show container status"
    echo "  --down        Stop all services"
    echo "  --help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./scripts/start-local.sh           # Quick start (after first build)"
    echo "  ./scripts/start-local.sh --build   # Build and start"
    echo "  ./scripts/start-local.sh --logs    # Watch logs"
    echo "  ./scripts/start-local.sh --down    # Stop everything"
    ;;
  *)
    check_docker
    check_docker_compose
    start_services
    show_endpoints
    ;;
esac

print_header "✨ Setup Complete"
echo "Next steps:"
echo "  1. Open ${BLUE}http://localhost:3000${NC} in your browser"
echo "  2. Start making changes (hot reload enabled)"
echo "  3. Run ${BLUE}./scripts/start-local.sh --logs${NC} to watch logs"
echo "  4. Run ${BLUE}./scripts/start-local.sh --down${NC} to stop services"
echo ""
