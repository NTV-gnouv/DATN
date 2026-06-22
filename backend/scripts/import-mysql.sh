#!/usr/bin/env bash
set -euo pipefail

# Import MySQL schema and seed using env vars (from .env if present)
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"

if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-root}"
DB_PASS="${DB_PASS:-}" 
DB_NAME="${DB_NAME:-shotvn}"

SCHEMA_SQL="$ROOT_DIR/database/mysql-schema.sql"
SEED_SQL="$ROOT_DIR/database/mysql-seed.sql"

if ! command -v mysql >/dev/null 2>&1; then
  echo "mysql client not found in PATH. Please install mysql client."
  exit 1
fi

echo "Importing schema into ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$SCHEMA_SQL"
echo "Schema import complete."

echo "Importing seed data into ${DB_NAME}"
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$SEED_SQL"
echo "Seed import complete."

echo "All done."
