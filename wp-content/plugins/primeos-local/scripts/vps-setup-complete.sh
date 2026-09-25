#!/usr/bin/env bash
set -euo pipefail

# vps-setup-complete.sh
# Run this on the VPS in the repo root (/opt/primeos). It will:
# - build and start services via docker compose
# - wait for Postgres
# - apply database/schema.sql
# - ensure .env has PRIMEOS_API_KEY (generate if missing)
# - insert API key into api_keys table

COMPOSE_FILE="docker-compose.vps.yml"
SCHEMA_FILE="database/schema.sql"

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "ERROR: $COMPOSE_FILE not found. Run from repository root where the file exists."
  exit 1
fi

if [ ! -f "$SCHEMA_FILE" ]; then
  echo "ERROR: $SCHEMA_FILE not found."
  exit 1
fi

# Load .env (if present) into environment variables for this script
if [ -f .env ]; then
  echo "Loading .env"
  set -o allexport
  # shellcheck disable=SC1091
  source .env
  set +o allexport
else
  echo "Warning: .env not found. Copy .env.example to .env and edit before running for proper secrets."
fi

echo "Bringing up services (this will build images)"
docker compose -f "$COMPOSE_FILE" up -d --build

# Wait for Postgres to be ready
echo "Waiting for Postgres to become available (timeout 180s)"
SECS=0
TIMEOUT=180
until docker compose -f "$COMPOSE_FILE" exec -T db pg_isready -U primeos >/dev/null 2>&1; do
  sleep 2
  SECS=$((SECS+2))
  if [ "$SECS" -ge "$TIMEOUT" ]; then
    echo "Postgres did not become ready within $TIMEOUT seconds. Check container logs: docker compose -f $COMPOSE_FILE logs db"
    exit 2
  fi
done

echo "Postgres ready. Applying schema from $SCHEMA_FILE"
# Pipe the schema into psql running inside the db container
docker compose -f "$COMPOSE_FILE" exec -T db psql -U primeos -d primeosdb < "$SCHEMA_FILE"

# Ensure PRIMEOS_API_KEY exists in .env; if not, generate one and append
if [ -z "${PRIMEOS_API_KEY:-}" ]; then
  echo "PRIMEOS_API_KEY not set in .env — generating a new key"
  NEWKEY=$(openssl rand -base64 32 | tr -d '\n')
  echo "PRIMEOS_API_KEY=$NEWKEY" >> .env
  PRIMEOS_API_KEY=$NEWKEY
  echo "Wrote PRIMEOS_API_KEY to .env"
fi

# Insert API key into database (if not exists)
echo "Inserting API key into database (api_keys)"
SQL="INSERT INTO api_keys(key,owner) VALUES('"${PRIMEOS_API_KEY}"','system') ON CONFLICT (key) DO NOTHING;"
# execute SQL inside db container
docker compose -f "$COMPOSE_FILE" exec -T db psql -U primeos -d primeosdb -c "$SQL"

echo "DB initialization complete. Verify services:"
docker compose -f "$COMPOSE_FILE" ps

echo "Test the API (local within VPS):"
echo "  curl -sS http://localhost:3000/health | jq || curl -I http://localhost:3000/health"

echo "If Traefik is configured and DNS pointed to this VPS, test externally:" 
echo "  curl -I https://api.primeodontologia.com.br/health"

echo "Done."
