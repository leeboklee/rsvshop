#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Detect runtime to support Windows, Linux, and WSL reliably
function getRuntimeInfo() {
  const platform = process.platform; // 'win32' | 'linux' | 'darwin'
  let isWSL = false;
  if (platform === 'linux') {
    try {
      const version = fs.readFileSync('/proc/version', 'utf8').toLowerCase();
      isWSL = version.includes('microsoft') || Boolean(process.env.WSL_DISTRO_NAME);
    } catch (_) {
      // noop
    }
  }
  return { platform, isWSL };
}

// WSL 환경에서 Windows 쪽 포트 리스너 확인 (cmd.exe 기반, 보안툴 우회)
function getWindowsPidForPort(port) {
  try {
    const { platform, isWSL } = getRuntimeInfo();
    if (!(platform === 'linux' && isWSL)) return '';
    // cmd 파이프 전체를 cmd.exe 쪽에서 처리하도록 큰따옴표로 감쌈
    const cmd = `cmd.exe /c "netstat -ano | findstr :${port} | findstr LISTENING"`;
    const out = execSync(cmd, { encoding: 'utf8' }).trim();
    if (!out) return '';
    // 마지막 토큰이 PID
    const line = out.split(/\r?\n/)[0];
    const pid = (line.trim().split(/\s+/).pop()) || '';
    return /\d+/.test(pid) ? pid : '';
  } catch (_) {
    return '';
  }
}

function killWindowsPid(pid) {
  try {
    const { platform, isWSL } = getRuntimeInfo();
    if (!(platform === 'linux' && isWSL)) return false;
    execSync(`cmd.exe /c "taskkill /F /PID ${pid}"`, { stdio: 'ignore' });
    return true;
  } catch (_) {
    return false;
  }
}

// Windows PID의 프로세스 이름 조회
function getWindowsProcessName(pid) {
  try {
    const { platform, isWSL } = getRuntimeInfo();
    if (!(platform === 'linux' && isWSL)) return '';
    const cmd = `cmd.exe /c "tasklist /FI \"PID eq ${pid}\" | findstr ${pid}"`;
    const out = execSync(cmd, { encoding: 'utf8' }).trim();
    if (!out) return '';
    const name = out.split(/\s+/)[0] || '';
    return name;
  } catch (_) {
    return '';
  }
}

// 해당 포트에 리눅스(WSL) 리스너 존재 여부
function hasLinuxListener(port) {
  try {
    const out = execSync(`ss -ltnH 'sport = :${port}' 2>/dev/null || true`, { encoding: 'utf8', shell: '/bin/bash' });
    return out.trim().length > 0;
  } catch (_) {
    return false;
  }
}

// Windows 측 wslrelay가 고아 상태(WSL 리스너 없음)로 남아있으면 안전 종료
function healWindowsOrphanRelay(port) {
  try {
    const winPid = getWindowsPidForPort(port);
    if (!winPid) return false;
    // 대상 포트에 WSL 리스너가 없고, Windows 프로세스가 wslrelay인 경우에만 종료
    if (!hasLinuxListener(port)) {
      const name = getWindowsProcessName(winPid) || '';
      if (name.toLowerCase().includes('wslrelay')) {
        const killed = killWindowsPid(winPid);
        if (killed) {
          console.log(`🧯 Windows wslrelay 잔존 정리 완료 (포트 ${port}, PID ${winPid})`);
          return true;
        }
      }
    }
    return false;
  } catch (_) {
    return false;
  }
}

class SmartPortManager {
  constructor() {
    this.configPath = path.join(__dirname, '../config/port-config.js');
    this.defaultPort = 4900;
    this.maxPortSearch = 10; // 최대 10개 포트까지 검색
    this.projectRoot = path.resolve(__dirname, '..');
  }

  // 포트 사용 여부 확인
  isPortInUse(port) {
    const { platform } = getRuntimeInfo();
    try {
      if (platform === 'win32') {
        // Windows
        const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
        return result.trim().length > 0;
      }

      // Linux/WSL/macOS
      // Prefer ss (available on Linux/WSL). Fallback to lsof for macOS.
      try {
        const bySs = execSync(`ss -ltnH 'sport = :${port}' 2>/dev/null || true`, { encoding: 'utf8', shell: '/bin/bash' });
        if (bySs.trim().length > 0) return true;
      } catch (_) {
        // ignore and try lsof
      }

      try {
        const byLsof = execSync(`lsof -i :${port} -nP 2>/dev/null | grep LISTEN || true`, { encoding: 'utf8', shell: '/bin/bash' });
        return byLsof.trim().length > 0;
      } catch (_) {
        return false;
      }
    } catch (_) {
      return false; // 포트가 사용되지 않음
    }
  }

  // 사용 가능한 포트 찾기
  findAvailablePort(startPort = this.defaultPort) {
    for (let port = startPort; port < startPort + this.maxPortSearch; port++) {
      if (!this.isPortInUse(port)) {
        return port;
      }
    }
    throw new Error(`사용 가능한 포트를 찾을 수 없습니다 (${startPort}-${startPort + this.maxPortSearch})`);
  }

  // 포트 강제 해제
  killPort(port) {
    try {
      console.log(`포트 ${port}를 사용하는 프로세스를 종료합니다...`);
      // 우선 WSL에서 직접 PID를 추출해 종료
      try {
        const out = execSync(`ss -ltnp 'sport = :${port}' | sed -n "s/.*pid=\\([0-9]\\+\\).*/\\1/p" | head -n1`, { encoding: 'utf8', shell: '/bin/bash' }).trim();
        if (out) {
          execSync(`kill -TERM ${out} 2>/dev/null || true && sleep 0.5 && kill -KILL ${out} 2>/dev/null || true`, { shell: '/bin/bash' });
        }
      } catch {}
      // 보조로 kill-port 사용(호환성)
      execSync(`npx kill-port ${port}`, { stdio: 'ignore' });
      // 마지막으로 Windows 잔존 wslrelay가 있으면 정리 (WSL 리스너가 없을 때만)
      healWindowsOrphanRelay(port);
      return true;
    } catch (error) {
      console.log(`포트 ${port} 해제 실패: ${error.message}`);
      return false;
    }
  }

  // 스마트 포트 할당
  getSmartPort() {
    const config = this.loadConfig();
    
    // 1. 설정된 포트 확인
    if (config.preferredPort && !this.isPortInUse(config.preferredPort)) {
      return config.preferredPort;
    }

    // 2. 포트가 사용 중이면 강제 해제 시도
    if (config.preferredPort && this.isPortInUse(config.preferredPort)) {
      if (config.autoKillPort) {
        this.killPort(config.preferredPort);
        if (!this.isPortInUse(config.preferredPort)) {
          return config.preferredPort;
        }
      }
    }

    // 3. 새로운 포트 찾기
    const newPort = this.findAvailablePort(config.preferredPort || this.defaultPort);
    this.updateConfig({ preferredPort: newPort });
    
    return newPort;
  }

  // 설정 로드
  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const config = require(this.configPath);
        return { ...this.getDefaultConfig(), ...config };
      }
    } catch (error) {
      console.log('설정 파일 로드 실패, 기본값 사용');
    }
    return this.getDefaultConfig();
  }

  // 기본 설정
  getDefaultConfig() {
    return {
      preferredPort: this.defaultPort,
      autoKillPort: true,
      maxRetries: 3,
      fallbackPorts: [3000, 8000, 8080, 9000]
    };
  }

  // 설정 업데이트
  updateConfig(newConfig) {
    const config = this.loadConfig();
    const updatedConfig = { ...config, ...newConfig };
    
    const configDir = path.dirname(this.configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const configContent = `module.exports = ${JSON.stringify(updatedConfig, null, 2)};`;
    fs.writeFileSync(this.configPath, configContent);
  }

  // 개발 서버 시작
  startDevServer() {
    // WSL/리눅스에서 마운트 경로(/mnt/*)에서 실행되는 경우 충돌 방지
    const inWindowsMount = this.projectRoot.startsWith('/mnt/');
    const { platform, isWSL } = getRuntimeInfo();
    if (isWSL && inWindowsMount) {
      console.error('⚠️ WSL 마운트 경로(/mnt/*)에서 실행이 감지되었습니다. WSL 홈 경로에서 실행하세요.');
      process.exit(1);
    }
    let port = this.getSmartPort();
    console.log(`🚀 개발 서버를 포트 ${port}에서 시작합니다...`);

    // Windows 측 포트 점유 감지 및 자동 치유/회피 (WSL 전용)
    let winPid = getWindowsPidForPort(port);
    if (winPid) {
      const procName = (getWindowsProcessName(winPid) || '').toLowerCase();
      const linuxHas = hasLinuxListener(port);
      // 고아 wslrelay이면 자동 종료 시도
      if (!linuxHas && procName.includes('wslrelay')) {
        const ok = killWindowsPid(winPid);
        if (ok) {
          console.log(`🧯 Windows wslrelay 잔존 종료 (PID ${winPid}). 계속 진행합니다.`);
          winPid = '';
        }
      }
      // 여전히 Windows 점유가 있으면 자동으로 가용 포트로 회피
      if (winPid) {
        const fallback = this.findAvailablePort(port + 1);
        if (fallback !== port) {
          console.log(`↪️  포트 ${port} 대신 ${fallback}로 자동 전환합니다 (Windows 점유 PID: ${winPid}).`);
          this.updateConfig({ preferredPort: fallback });
          port = fallback;
        } else {
          console.error(`❌ 포트 전환 실패. 수동으로 Windows PID ${winPid} 종료 필요.`);
          process.exit(1);
        }
      }
    }


    // 경로/로그 준비
    const logFile = path.join(this.projectRoot, 'dev-server.log');
    const pidFile = path.join(this.projectRoot, 'dev.pid');

    // 환경 변수 설정
    process.env.PORT = port;
    process.env.HOSTNAME = '0.0.0.0';

    // 백그라운드 모드 비활성화 (포그라운드 실행만 허용)
    const wantBackground = false; // 강제로 false로 설정
    const wantLogsFollow = false; // 로그 팔로우도 비활성화

    // 백그라운드 실행 방지
    console.log('⚠️  백그라운드 실행이 비활성화되었습니다.');
    console.log('🚀 포그라운드에서 서버를 실행합니다...');

    // 포그라운드 모드: stdout을 파일에도 동시 기록
    const child = spawn('npx', ['next', 'dev', '-p', port, '-H', '0.0.0.0'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true
    });

    try { fs.writeFileSync(pidFile, String(child.pid)); } catch {}
    const logStream = fs.createWriteStream(logFile, { flags: 'a' });
    const write = (prefix, chunk) => {
      const text = chunk.toString();
      const stamped = text;
      try { logStream.write(stamped); } catch {}
      process.stdout.write(prefix === 'stderr' ? stamped : stamped);
    };
    child.stdout.on('data', (d) => write('stdout', d));
    child.stderr.on('data', (d) => write('stderr', d));

    child.on('error', (error) => {
      console.error(`서버 시작 실패: ${error.message}`);
      try { logStream.end(); } catch {}
      process.exit(1);
    });

    child.on('close', (code) => {
      try { logStream.end(); } catch {}
      console.log(`서버가 종료되었습니다 (코드: ${code})`);
      process.exit(code);
    });

    // 프로세스 종료 시 정리
    process.on('SIGINT', () => {
      console.log('\n🛑 서버를 종료합니다...');
      child.kill('SIGINT');
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 서버를 종료합니다...');
      child.kill('SIGTERM');
    });
  }

  // 로그 팔로우
  followLogs() {
    try {
      const logFile = path.join(this.projectRoot, 'dev-server.log');
      if (!fs.existsSync(logFile)) {
        console.log('로그 파일이 아직 없습니다: dev-server.log');
        process.exit(0);
      }
      const tail = spawn('bash', ['-lc', `tail -n +1 -f ${JSON.stringify(logFile)} | sed -u 's/^/[DEV] /'`], { stdio: 'inherit' });
      tail.on('close', (code) => process.exit(code));
    } catch (e) {
      console.log('로그 팔로우 실패:', e.message);
    }
  }

  // 포트 상태 확인
  checkPortStatus() {
    const config = this.loadConfig();
    const ports = Array.from(new Set([this.defaultPort, config.preferredPort, ...config.fallbackPorts]));
    
    console.log('📊 포트 상태 확인:');
    ports.forEach(port => {
      const status = this.isPortInUse(port) ? '🔴 사용 중' : '🟢 사용 가능';
      const winPid = getWindowsPidForPort(port);
      const winNote = winPid ? ` (Windows PID: ${winPid})` : '';
      console.log(`  포트 ${port}: ${status}${winNote}`);
    });
  }

  // 포트 정리
  cleanupPorts() {
    const config = this.loadConfig();
    const ports = Array.from(new Set([this.defaultPort, config.preferredPort, ...config.fallbackPorts]));
    
    console.log('🧹 포트 정리 중...');
    ports.forEach(port => {
      if (this.isPortInUse(port)) {
        this.killPort(port);
      }
      // 사용 중이 아니어도 Windows 잔존 wslrelay를 정리 시도
      healWindowsOrphanRelay(port);
    });
    console.log('✅ 포트 정리 완료');
  }

  // 잔존 프록시(Windows wslrelay) 자동 치유
  heal() {
    const config = this.loadConfig();
    const ports = Array.from(new Set([this.defaultPort, config.preferredPort, ...config.fallbackPorts]));
    console.log('🩺 잔존 프록시 점검/치유:');
    ports.forEach((port) => {
      const winPid = getWindowsPidForPort(port);
      const linuxHas = hasLinuxListener(port);
      const name = winPid ? getWindowsProcessName(winPid) : '';
      const isRelay = (name || '').toLowerCase().includes('wslrelay');
      if (winPid && isRelay && !linuxHas) {
        const ok = killWindowsPid(winPid);
        if (ok) {
          console.log(`  ✔ 포트 ${port}: Windows wslrelay(PID ${winPid}) 잔존 종료`);
        } else {
          console.log(`  ✖ 포트 ${port}: Windows 잔존 종료 실패 (PID ${winPid})`);
        }
      } else {
        console.log(`  • 포트 ${port}: winPid=${winPid || '-'} name=${name || '-'} linuxListener=${linuxHas ? 'Y' : 'N'}`);
      }
    });
  }
}

// CLI 인터페이스
function main() {
  const manager = new SmartPortManager();
  const command = process.argv[2];

  switch (command) {
    case 'start':
      manager.startDevServer();
      break;
      case 'logs':
        manager.followLogs ? manager.followLogs() : console.log('logs viewer not available');
        break;
    case 'status':
      manager.checkPortStatus();
      break;
    case 'cleanup':
      manager.cleanupPorts();
      break;
    case 'kill':
      const port = process.argv[3] || manager.defaultPort;
      manager.killPort(port);
      break;
    case 'heal':
      manager.heal();
      break;
    default:
      console.log(`
🚀 RSVShop 스마트 포트 매니저

사용법:
  node scripts/port-manager.js start     - 개발 서버 시작(로그 파일 기록)
  node scripts/port-manager.js start --bg [--logs]
                                   - 백그라운드 시작(+옵션: 로그 팔로우)
  node scripts/port-manager.js logs      - dev-server.log 팔로우
  node scripts/port-manager.js status    - 포트 상태 확인
  node scripts/port-manager.js cleanup   - 포트 정리
  node scripts/port-manager.js kill 4900 - 특정 포트 강제 종료
  node scripts/port-manager.js heal      - Windows 잔존 wslrelay 자동 치유

특징:
  ✅ 자동 포트 충돌 해결
  ✅ 선호 포트 우선 사용
  ✅ 포트 강제 해제 옵션
  ✅ 설정 파일 관리
      `);
  }
}

if (require.main === module) {
  main();
}

module.exports = SmartPortManager; 