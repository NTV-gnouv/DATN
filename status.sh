#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# shellcheck disable=SC1091
source "$DIR/lib/logging.sh"

if [[ -f "$DIR/ports.env" ]]; then
  # shellcheck disable=SC1091
  source "$DIR/ports.env"
fi

BACKEND_PORT="${BACKEND_PORT:-3000}"
FRONTEND_PORT="${FRONTEND_PORT:-8080}"
export SHOTVN_DEPLOY_ROOT="$DIR"
LOG_DIR="$(shotvn_ensure_log_dir "$DIR")"

print_service() {
  local name="$1"
  local port="$2"
  local pid_file="$LOG_DIR/${name}.pid"
  local log_file="$LOG_DIR/${name}.log"

  echo "=== $name (port $port) ==="
  if [[ -f "$pid_file" ]]; then
    local pid
    pid="$(cat "$pid_file")"
    if kill -0 "$pid" 2>/dev/null; then
      echo "  Status: RUNNING (PID $pid)"
    else
      echo "  Status: STOPPED (stale PID $pid)"
    fi
  else
    echo "  Status: no PID file"
  fi

  if command -v ss >/dev/null 2>&1; then
    echo "  Port:"
    ss -tlnp 2>/dev/null | grep -E ":${port}\b" | sed 's/^/    /' || echo "    (không listen)"
  fi

  if [[ -f "$log_file" ]]; then
    echo "  Log ($log_file) — 8 dòng cuối:"
    tail -n 8 "$log_file" | sed 's/^/    /'
  else
    echo "  Log: chưa có $log_file"
  fi
  echo ""
}

echo "ShotVN deploy status"
echo "Root: $DIR"
echo "Logs: $LOG_DIR"
echo ""

print_service backend "$BACKEND_PORT"
print_service frontend "$FRONTEND_PORT"

if [[ -f "$DIR/ports.env" ]]; then
  echo "=== ports.env ==="
  sed 's/^/  /' "$DIR/ports.env"
fi
