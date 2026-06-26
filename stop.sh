#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# shellcheck disable=SC1091
source "$DIR/lib/logging.sh"

export SHOTVN_DEPLOY_ROOT="$DIR"
LOG_DIR="$(shotvn_ensure_log_dir "$DIR")"

stop_pid_file() {
  local service="$1"
  local pid_file="$LOG_DIR/${service}.pid"
  if [[ ! -f "$pid_file" ]]; then
    shotvn_log_line stop "Không có PID file: $pid_file"
    return 0
  fi
  local pid
  pid="$(cat "$pid_file")"
  if kill -0 "$pid" 2>/dev/null; then
    kill "$pid" 2>/dev/null || true
    sleep 1
    kill -9 "$pid" 2>/dev/null || true
    shotvn_log_line stop "Đã dừng $service (PID $pid)"
  else
    shotvn_log_line stop "$service PID $pid không còn chạy"
  fi
  rm -f "$pid_file"
}

stop_pid_file backend
stop_pid_file frontend

# Dọn process con (node) còn sót theo cwd deploy
if command -v pgrep >/dev/null 2>&1; then
  pkill -f "$DIR/backend/dist/main.js" 2>/dev/null || true
  pkill -f "$DIR/frontend/server.mjs" 2>/dev/null || true
fi

shotvn_log_line stop "Hoàn tất"
