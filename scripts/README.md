# Scripts Overview (WSL2 setup)

Quick steps inside WSL2 Ubuntu (run as root where noted):

1) Enable systemd
```bash
sudo bash ./scripts/wsl-enable-systemd.sh && powershell.exe -Command wsl --shutdown
```
Reopen WSL.

2) Base setup (Nginx/Node/UFW, create user)
```bash
sudo bash ./scripts/wsl-setup.sh
```

3) Copy project into Linux FS (optional but recommended)
```bash
sudo bash ./scripts/wsl2-sync-to-linux.sh
```

4) Install service and start
```bash
sudo bash ./scripts/install-rsvshop-service.sh
```

5) Install nginx reverse proxy
```bash
sudo bash ./scripts/install-nginx-proxy.sh
```

Check:
```bash
systemctl status rsvshop --no-pager
curl -I http://localhost/
```

Notes:
- Default app port is 4900. Nginx listens on 80 and proxies to 127.0.0.1:4900.
- For production, edit `scripts/systemd/rsvshop.service` to use `npm run start` after `npm run build`.
- Logs: `journalctl -u rsvshop -f`.
