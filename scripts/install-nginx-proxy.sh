#!/usr/bin/env bash
set -euo pipefail

if [[ ${EUID:-$(id -u)} -ne 0 ]]; then
  echo "[!!] Run as root: sudo bash $0" >&2
  exit 1
fi

SRC_DIR="$(cd "$(dirname "$0")" && pwd)"
SITE_SRC="$SRC_DIR/nginx-rsvshop.conf"
SITE_DST="/etc/nginx/sites-available/rsvshop"

if [[ ! -f "$SITE_SRC" ]]; then
  echo "[!!] Missing nginx conf: $SITE_SRC" >&2
  exit 1
fi

cp "$SITE_SRC" "$SITE_DST"
ln -sf "$SITE_DST" /etc/nginx/sites-enabled/rsvshop
nginx -t
systemctl reload nginx

echo "[OK] nginx reverse proxy installed and reloaded."
