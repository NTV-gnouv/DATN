#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# shellcheck disable=SC1091
source "$DIR/lib/logging.sh"

DAEMON=0
for arg in "$@"; do
  case "$arg" in
    --daemon | -d) DAEMON=1 ;;
    --help | -h)
      cat <<'EOF'
ShotVN deploy — chạy backend + frontend

Cách dùng:
  bash start.sh           Chạy foreground, in log ra màn hình + ghi file
  bash start.sh --daemon  Chạy nền, log trong thư mục logs/
  bash logs.sh            Xem log realtime
  bash status.sh          Kiểm tra process / port
  bash stop.sh            Dừng backend + frontend

Log files:
  logs/backend.log
  logs/frontend.log
EOF
      exit 0
      ;;
  esac
done

if [[ -f "$DIR/ports.env" ]]; then
  # shellcheck disable=SC1091
  source "$DIR/ports.env"
fi

BACKEND_PORT="${BACKEND_PORT:-3000}"
FRONTEND_PORT="${FRONTEND_PORT:-8080}"
export SHOTVN_DEPLOY_ROOT="$DIR"

LOG_DIR="$(shotvn_ensure_log_dir "$DIR")"
export SHOTVN_LOG_DIR="$LOG_DIR"

shotvn_log_line app "ShotVN deploy — API :$BACKEND_PORT, web :$FRONTEND_PORT"
shotvn_log_line app "Thư mục log: $LOG_DIR"

if [[ "$DAEMON" == "1" ]]; then
  export SHOTVN_LOG_STDOUT=0
  nohup bash "$DIR/backend/start.sh" >> "$LOG_DIR/backend.nohup.log" 2>&1 &
  nohup bash "$DIR/frontend/start.sh" >> "$LOG_DIR/frontend.nohup.log" 2>&1 &
  sleep 2
  if [[ -f "$LOG_DIR/backend.pid" ]]; then
    shotvn_log_line app "Backend  PID $(cat "$LOG_DIR/backend.pid") — tail -f $LOG_DIR/backend.log"
  else
    shotvn_log_line app "Backend  không khởi động được — xem $LOG_DIR/backend.log"
  fi
  if [[ -f "$LOG_DIR/frontend.pid" ]]; then
    shotvn_log_line app "Frontend PID $(cat "$LOG_DIR/frontend.pid") — tail -f $LOG_DIR/frontend.log"
  else
    shotvn_log_line app "Frontend không khởi động được — xem $LOG_DIR/frontend.log"
  fi
  shotvn_log_line app "Kiểm tra: bash status.sh | Xem log: bash logs.sh"
  exit 0
fi

export SHOTVN_LOG_STDOUT=0
bash "$DIR/backend/start.sh" &
BACKEND_PID=$!
bash "$DIR/frontend/start.sh" &
FRONTEND_PID=$!

cleanup() {
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  kill "$TAIL_BACKEND_PID" "$TAIL_FRONTEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

sleep 1
shotvn_log_line app "Đang theo dõi log (Ctrl+C để dừng)…"

tail -n 30 -F "$LOG_DIR/backend.log" 2>/dev/null | sed -u 's/^/[backend] /' &
TAIL_BACKEND_PID=$!
tail -n 30 -F "$LOG_DIR/frontend.log" 2>/dev/null | sed -u 's/^/[frontend] /' &
TAIL_FRONTEND_PID=$!

wait "$BACKEND_PID" "$FRONTEND_PID"
