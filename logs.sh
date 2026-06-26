#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# shellcheck disable=SC1091
source "$DIR/lib/logging.sh"

export SHOTVN_DEPLOY_ROOT="$DIR"
LOG_DIR="$(shotvn_ensure_log_dir "$DIR")"

LINES=50
if [[ "${1:-}" =~ ^[0-9]+$ ]]; then
  LINES="$1"
fi

echo "Theo dõi log ShotVN (Ctrl+C thoát)"
echo "  backend:  $LOG_DIR/backend.log"
echo "  frontend: $LOG_DIR/frontend.log"
echo ""

touch "$LOG_DIR/backend.log" "$LOG_DIR/frontend.log"

tail -n "$LINES" -F "$LOG_DIR/backend.log" | sed -u 's/^/[backend]  /' &
PID_B=$!
tail -n "$LINES" -F "$LOG_DIR/frontend.log" | sed -u 's/^/[frontend] /' &
PID_F=$!

trap 'kill '"$PID_B"' '"$PID_F"' 2>/dev/null || true' EXIT INT TERM
wait
