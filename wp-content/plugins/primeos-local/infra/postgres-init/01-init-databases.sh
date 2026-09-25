#!/bin/bash
# Runs automatically on first container start (Postgres only executes files
# in /docker-entrypoint-initdb.d/ against a brand-new data volume).
# Add a new database name here every time you add a Postgres-backed service.
set -e

for db in crmx revx; do
  echo "Creating database: $db"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    SELECT 'CREATE DATABASE $db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$db')\gexec
EOSQL
done
