#!/usr/bin/env bash
set -euo pipefail

if [[ ${EUID:-$(id -u)} -ne 0 ]]; then
  echo "[!!] Run as root: sudo bash $0" >&2
  exit 1
fi

cat >/etc/wsl.conf <<'EOF'
[boot]
systemd=true

[network]
generateResolvConf=true
EOF

echo "[OK] /etc/wsl.conf written with systemd=true"
echo "[NEXT] On Windows PowerShell, run:  wsl --shutdown  (then reopen WSL)"
