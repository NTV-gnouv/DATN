#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"
DEPLOY_ROOT="$(cd "$DIR/.." && pwd)"

# shellcheck disable=SC1091
source "$DEPLOY_ROOT/lib/logging.sh"

_SAVED_FRONTEND_PORT="${FRONTEND_PORT:-}"
if [[ -f "$DEPLOY_ROOT/ports.env" ]]; then
  # shellcheck disable=SC1091
  source "$DEPLOY_ROOT/ports.env"
fi
if [[ -n "$_SAVED_FRONTEND_PORT" ]]; then
  export FRONTEND_PORT="$_SAVED_FRONTEND_PORT"
fi

export FRONTEND_PORT="${FRONTEND_PORT:-8080}"
export BACKEND_PORT="${BACKEND_PORT:-3000}"
export NODE_ENV=production
export SHOTVN_DEPLOY_ROOT="$DEPLOY_ROOT"

LOG_DIR="$(shotvn_ensure_log_dir "$DEPLOY_ROOT")"
LOG_FILE="$LOG_DIR/frontend.log"

if ! shotvn_check_port_free "$FRONTEND_PORT" frontend; then
  shotvn_log_line frontend "Dừng vì port $FRONTEND_PORT đã bị chiếm — chạy: bash stop.sh" | tee -a "$LOG_FILE"
  exit 1
fi

{
  shotvn_log_line frontend "Khởi động web tĩnh — port=$FRONTEND_PORT, log=$LOG_FILE"
} >> "$LOG_FILE"

echo $$ > "$LOG_DIR/frontend.pid"

if [[ "${SHOTVN_LOG_STDOUT:-1}" == "1" ]]; then
  exec > >(tee -a "$LOG_FILE") 2>&1
else
  exec >> "$LOG_FILE" 2>&1
fi

shotvn_log_line frontend "PID $$ — node server.mjs"
exec node server.mjs
