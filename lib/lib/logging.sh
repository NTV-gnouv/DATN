#!/usr/bin/env bash

shotvn_log_ts() {
  date '+%Y-%m-%d %H:%M:%S'
}

shotvn_log_line() {
  local service="$1"
  shift
  printf '[%s] [%s] %s\n' "$(shotvn_log_ts)" "$service" "$*"
}

shotvn_resolve_deploy_root() {
  local hint="${1:-}"
  if [[ -n "${SHOTVN_DEPLOY_ROOT:-}" ]]; then
    echo "$SHOTVN_DEPLOY_ROOT"
    return
  fi
  if [[ -n "$hint" && -f "$hint/ports.env" ]]; then
    echo "$hint"
    return
  fi
  echo "${PWD}"
}

shotvn_log_dir() {
  local deploy_root
  deploy_root="$(shotvn_resolve_deploy_root "${1:-}")"
  echo "${SHOTVN_LOG_DIR:-$deploy_root/logs}"
}

shotvn_ensure_log_dir() {
  local dir
  dir="$(shotvn_log_dir "${1:-}")"
  mkdir -p "$dir"
  echo "$dir"
}

shotvn_check_port_free() {
  local port="$1"
  local service="$2"
  if ! command -v ss >/dev/null 2>&1; then
    return 0
  fi
  if ss -tlnp 2>/dev/null | grep -qE ":${port}\b"; then
    shotvn_log_line "$service" "ERROR: port ${port} đang được sử dụng"
    ss -tlnp 2>/dev/null | grep -E ":${port}\b" || true
    return 1
  fi
  return 0
}
