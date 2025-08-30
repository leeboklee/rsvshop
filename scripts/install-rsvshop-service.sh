#!/usr/bin/env bash
set -euo pipefail

if [[ ${EUID:-$(id -u)} -ne 0 ]]; then
  echo "[!!] Run as root: sudo bash $0" >&2
  exit 1
fi

SRC_DIR="$(cd "$(dirname "$0")" && pwd)"
UNIT_SRC="$SRC_DIR/systemd/rsvshop.service"
UNIT_DST="/etc/systemd/system/rsvshop.service"

if [[ ! -f "$UNIT_SRC" ]]; then
  echo "[!!] Missing unit file: $UNIT_SRC" >&2
  exit 1
fi

cp "$UNIT_SRC" "$UNIT_DST"
systemctl daemon-reload
systemctl enable --now rsvshop
systemctl status rsvshop --no-pager -l || true

echo "[OK] rsvshop.service installed and started."
