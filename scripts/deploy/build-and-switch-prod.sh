#!/usr/bin/env bash
set -euo pipefail

if [[ ${EUID:-$(id -u)} -ne 0 ]]; then
  echo "[!!] Run as root: sudo bash $0" >&2
  exit 1
fi

APP_DIR=/home/rsvshop/rsvshop
cd "$APP_DIR"

# Build as app user
sudo -u rsvshop bash -lc 'cd /home/rsvshop/rsvshop && npm run build'

# Install prod service
cp /home/rsvshop/rsvshop/scripts/systemd/rsvshop-prod.service /etc/systemd/system/rsvshop-prod.service
systemctl daemon-reload
systemctl enable --now rsvshop-prod

# Install prod nginx site
cp /home/rsvshop/rsvshop/scripts/nginx-rsvshop-prod.conf /etc/nginx/sites-available/rsvshop
ln -sf /etc/nginx/sites-available/rsvshop /etc/nginx/sites-enabled/rsvshop
nginx -t
systemctl restart nginx

# Health checks
/bin/sleep 2 || true
curl -I http://localhost/ || true
curl -I http://localhost/dev/ || true

echo "[OK] Build complete and switched nginx to prod (4901). Dev at /dev (4900)."
