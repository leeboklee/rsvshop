#!/usr/bin/env bash
set -euo pipefail

if [[ ${EUID:-$(id -u)} -ne 0 ]]; then
  echo "[!!] Run as root: sudo bash $0" >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl gnupg lsb-release software-properties-common

# Install Node.js 20 LTS (NodeSource)
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

# Install Nginx & UFW
apt-get install -y nginx ufw

# Create service user if not exists
if ! id -u rsvshop >/dev/null 2>&1; then
  useradd -m -s /bin/bash rsvshop
fi

# UFW - allow only web
ufw allow 'Nginx Full' || true
ufw --force enable || true

# Ensure nginx enabled
systemctl enable nginx || true
systemctl restart nginx || true

echo "[OK] Base setup complete. Next: copy project to /home/rsvshop/rsvshop and enable the service."
