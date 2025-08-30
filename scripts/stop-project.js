#!/usr/bin/env node

// Stop Next.js-related background processes started from the current project directory
// WSL/Linux only. Safe: targets only PIDs whose cwd equals the project root.

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], shell: '/bin/bash' }).trim();
}

function main() {
  const root = process.cwd();
  const patterns = [
    'next.*dev',
    'node.*next',
    'next-server',
    'auto-restart',
    'process-protector',
    'python-server-manager',
    'node-smart-server',
    'smart-monitor'
  ];
  const grep = patterns.join('|');

  try {
    const pidsRaw = sh(`pgrep -f '${grep}' || true`);
    const pids = pidsRaw.split(/\s+/).filter(Boolean);
    let stopped = 0;
    for (const pid of pids) {
      try {
        const cwd = sh(`readlink -f /proc/${pid}/cwd 2>/dev/null || echo ''`);
        if (cwd && cwd.startsWith(root)) {
          try { sh(`kill -TERM ${pid} 2>/dev/null || true`); } catch {}
          stopped++;
        }
      } catch {}
    }
    // Free port 4900 if still occupied
    try {
      sh(`ss -ltnH 'sport = :4900' | grep -q . && kill -KILL $(ss -ltnp 'sport = :4900' | sed -n "s/.*pid=\\([0-9]\\+\\).*/\\1/p" | head -n1) 2>/dev/null || true`);
    } catch {}

    // Cleanup pid files
    for (const f of ['.headless_keepalive.pid', '.refresh_browser.pid', 'dev.pid']) {
      try { fs.existsSync(path.join(root, f)) && fs.unlinkSync(path.join(root, f)); } catch {}
    }

    console.log(`Stopped ${stopped} project processes. Port 4900 freed if occupied.`);
  } catch (e) {
    console.log('No matching processes or already clean.');
  }
}

if (require.main === module) {
  main();
}


