#!/usr/bin/env bash

# Project-scoped DB control script for WSL/Ubuntu
# Usage: ./scripts/db-control.sh start|stop|status|ensure|toggle

set -euo pipefail

CMD=${1:-status}

is_wsl() {
  grep -qi microsoft /proc/version 2>/dev/null || return 1
}

use_systemctl() {
  command -v systemctl >/dev/null 2>&1 && systemctl --version >/dev/null 2>&1
}

start_service() {
  if use_systemctl; then
    sudo systemctl start postgresql
  else
    sudo service postgresql start
  fi
}

stop_service() {
  if use_systemctl; then
    sudo systemctl stop postgresql
  else
    sudo service postgresql stop
  fi
}

status_service() {
  if use_systemctl; then
    sudo systemctl status postgresql --no-pager || true
  else
    sudo service postgresql status || true
  fi
}

is_running() {
  if use_systemctl; then
    systemctl is-active --quiet postgresql
  else
    pgrep -x postgres >/dev/null 2>&1
  fi
}

case "$CMD" in
  start)
    echo "Starting PostgreSQL..."
    start_service
    ;;
  stop)
    echo "Stopping PostgreSQL..."
    stop_service
    ;;
  status)
    echo "PostgreSQL status:"
    status_service
    ;;
  ensure)
    # Start only if not running
    if is_running; then
      echo "PostgreSQL already running"
    else
      echo "PostgreSQL not running — starting"
      start_service
    fi
    ;;
  toggle)
    if is_running; then
      echo "Toggling: stopping PostgreSQL"
      stop_service
    else
      echo "Toggling: starting PostgreSQL"
      start_service
    fi
    ;;
  *)
    echo "Usage: $0 start|stop|status|ensure|toggle"
    exit 1
    ;;
esac
