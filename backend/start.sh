#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"
DEPLOY_ROOT="$(cd "$DIR/.." && pwd)"

# shellcheck disable=SC1091
source "$DEPLOY_ROOT/lib/logging.sh"

_SAVED_BACKEND_PORT="${BACKEND_PORT:-}"
if [[ -f "$DEPLOY_ROOT/ports.env" ]]; then
  # shellcheck disable=SC1091
  source "$DEPLOY_ROOT/ports.env"
fi
if [[ -n "$_SAVED_BACKEND_PORT" ]]; then
  export BACKEND_PORT="$_SAVED_BACKEND_PORT"
fi

export NODE_ENV=production
export PORT="${BACKEND_PORT:-${PORT:-3000}}"
export SHOTVN_DEPLOY_ROOT="$DEPLOY_ROOT"

if [[ ! -f "$DIR/.env" ]]; then
  shotvn_log_line backend "ERROR: thiếu backend/.env — copy từ .env.example"
  exit 1
fi

LOG_DIR="$(shotvn_ensure_log_dir "$DEPLOY_ROOT")"
LOG_FILE="$LOG_DIR/backend.log"

if ! shotvn_check_port_free "$PORT" backend; then
  shotvn_log_line backend "Dừng vì port $PORT đã bị chiếm — chạy: bash stop.sh" | tee -a "$LOG_FILE"
  exit 1
fi

if [[ -f "$DIR/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$DIR/.env"
  set +a
fi

{
  shotvn_log_line backend "Khởi động API — port=$PORT, log=$LOG_FILE"
  shotvn_log_line backend "DB: ${DB_USER:-?}@${DB_HOST:-?}:${DB_PORT:-3306}/${DB_NAME:-?}"
} >> "$LOG_FILE"

echo $$ > "$LOG_DIR/backend.pid"

if [[ "${SHOTVN_LOG_STDOUT:-1}" == "1" ]]; then
  exec > >(tee -a "$LOG_FILE") 2>&1
else
  exec >> "$LOG_FILE" 2>&1
fi

shotvn_log_line backend "PID $$ — NestJS dist/main.js"
exec node dist/main.js
