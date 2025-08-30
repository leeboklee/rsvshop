#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function isWSL() {
  if (process.platform !== 'linux') return false;
  try {
    const v = fs.readFileSync('/proc/version', 'utf8').toLowerCase();
    return v.includes('microsoft') || Boolean(process.env.WSL_DISTRO_NAME);
  } catch (_) {
    return false;
  }
}

function fail(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

function info(msg) {
  console.log(`ℹ️  ${msg}`);
}

try {
  const cwd = process.cwd();
  const wsl = isWSL();
  info(`cwd: ${cwd}`);

  // 1) WSL 마운트 경로에서 실행 금지
  if (wsl && cwd.startsWith('/mnt/')) {
    fail('WSL 마운트 경로(/mnt/*)에서 실행이 감지되었습니다. 프로젝트를 WSL 홈 디렉터리(예: ~/projects)에서 실행하세요.');
  }

  // 2) Windows 측 4900 리스너 존재 여부 (WSL에서만 체크, cmd.exe 기반)
  if (wsl) {
    try {
      const winOut = execSync('cmd.exe /c "netstat -ano | findstr :4900 | findstr LISTENING"', { encoding: 'utf8' }).trim();
      // 동시에 WSL 내부 리스너가 있는지 확인
      let hasLinuxListener = false;
      try {
        const ss = execSync("ss -ltnH 'sport = :4900' 2>/dev/null || true", { encoding: 'utf8', shell: '/bin/bash' }).trim();
        hasLinuxListener = ss.length > 0;
      } catch (_) {}

      if (winOut && !hasLinuxListener) {
        console.error('\n⚠️  Windows에서 4900 포트를 청취 중인 프로세스가 감지되었습니다. (WSL 리스너 없음)');
        console.error('    - 확인: cmd.exe /c netstat -ano | findstr :4900 | findstr LISTENING');
        console.error('    - 종료(승인 필요): cmd.exe /c taskkill /F /PID <PID>');
        fail('Windows 포트 점유 해제를 먼저 진행해 주세요.');
      }
    } catch (_) {
      // PowerShell 조회 실패는 무시
    }
  }

  // 3) WSL 측 4900 리스너가 이미 있는지 안내 (중복 실행 방지)
  try {
    const ss = execSync("ss -ltnp 'sport = :4900' | grep -v 'ESTAB'", { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], shell: '/bin/bash' }).trim();
    if (ss.length > 0) {
      console.error('\n⚠️  WSL에서 이미 4900 포트를 리스닝 중입니다.');
      console.error('    - 현재 리스너 확인: ss -ltnp \"sport = :4900\"');
      console.error('    - 해제: node scripts/port-manager.js kill 4900');
      fail('포트를 비운 뒤 다시 실행하세요.');
    }
  } catch (_) {
    // ss 결과 없음 = 포트 비어있음
  }

  console.log('\n✅ 실행 가드 통과. 서버를 시작합니다...');
  process.exit(0);
} catch (err) {
  fail(err.message || String(err));
}


