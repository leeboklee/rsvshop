#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ProcessProtector {
  constructor() {
    this.appName = 'rsvshop';
    this.port = 4900;
    this.maxRestarts = 5;
    this.restartDelay = 3000; // 3초
    this.restartCount = 0;
    this.isRunning = false;
    this.childProcess = null;
    this.logFile = path.join(__dirname, '../logs/process-protector.log');
  }

  // 로그 기록
  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    
    console.log(logMessage.trim());
    
    // 로그 파일에 기록
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFileSync(this.logFile, logMessage);
  }

  // 포트 사용 여부 확인
  isPortInUse(port) {
    try {
      const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
      return result.trim().length > 0;
    } catch (error) {
      return false;
    }
  }

  // 포트 강제 해제
  killPort(port) {
    try {
      this.log(`포트 ${port}를 사용하는 프로세스를 종료합니다...`);
      execSync(`npx kill-port ${port}`, { stdio: 'pipe' });
      return true;
    } catch (error) {
      this.log(`포트 ${port} 해제 실패: ${error.message}`);
      return false;
    }
  }

  // 프로세스 시작
  startProcess() {
    if (this.isRunning) {
      this.log('이미 실행 중입니다.');
      return;
    }

    // 포트 확인 및 해제
    if (this.isPortInUse(this.port)) {
      this.killPort(this.port);
      // 잠시 대기
      setTimeout(() => {
        this.startProcess();
      }, 1000);
      return;
    }

    this.log(`🚀 ${this.appName} 프로세스를 시작합니다 (포트: ${this.port})`);
    
    // Next.js 개발 서버 시작
    this.childProcess = spawn('npx', ['next', 'dev', '-p', this.port, '-H', '0.0.0.0'], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        PORT: this.port,
        HOSTNAME: '0.0.0.0'
      }
    });

    this.isRunning = true;

    this.childProcess.on('error', (error) => {
      this.log(`❌ 프로세스 오류: ${error.message}`);
      this.handleProcessExit(1);
    });

    this.childProcess.on('close', (code) => {
      this.log(`📴 프로세스가 종료되었습니다 (코드: ${code})`);
      this.handleProcessExit(code);
    });

    this.childProcess.on('exit', (code) => {
      this.log(`📴 프로세스가 종료되었습니다 (코드: ${code})`);
      this.handleProcessExit(code);
    });
  }

  // 프로세스 종료 처리
  handleProcessExit(code) {
    this.isRunning = false;
    this.childProcess = null;

    // 정상 종료인 경우 재시작하지 않음
    if (code === 0) {
      this.log('정상 종료되었습니다.');
      return;
    }

    // 비정상 종료 시 재시작 시도
    if (this.restartCount < this.maxRestarts) {
      this.restartCount++;
      this.log(`🔄 재시작 시도 ${this.restartCount}/${this.maxRestarts} (${this.restartDelay}ms 후)`);
      
      setTimeout(() => {
        this.startProcess();
      }, this.restartDelay);
    } else {
      this.log(`❌ 최대 재시작 횟수 초과 (${this.maxRestarts}회)`);
      this.log('수동으로 프로세스를 시작해주세요.');
    }
  }

  // 프로세스 중지
  stopProcess() {
    if (!this.isRunning || !this.childProcess) {
      this.log('실행 중인 프로세스가 없습니다.');
      return;
    }

    this.log('🛑 프로세스를 중지합니다...');
    this.childProcess.kill('SIGINT');
    
    // 강제 종료
    setTimeout(() => {
      if (this.childProcess) {
        this.childProcess.kill('SIGKILL');
      }
    }, 5000);
  }

  // 프로세스 재시작
  restartProcess() {
    this.log('🔄 프로세스를 재시작합니다...');
    this.restartCount = 0;
    this.stopProcess();
    
    setTimeout(() => {
      this.startProcess();
    }, 2000);
  }

  // 상태 확인
  checkStatus() {
    const portStatus = this.isPortInUse(this.port) ? '🔴 사용 중' : '🟢 사용 가능';
    const processStatus = this.isRunning ? '🟢 실행 중' : '🔴 중지됨';
    
    this.log(`📊 상태 확인:`);
    this.log(`  포트 ${this.port}: ${portStatus}`);
    this.log(`  프로세스: ${processStatus}`);
    this.log(`  재시작 횟수: ${this.restartCount}/${this.maxRestarts}`);
  }

  // 프로세스 보호 모드 시작
  startProtection() {
    this.log('🛡️ 프로세스 보호 모드를 시작합니다...');
    this.log('Ctrl+C로 종료할 수 있습니다.');
    
    // 프로세스 시작
    this.startProcess();

    // 시그널 핸들러
    process.on('SIGINT', () => {
      this.log('\n🛑 보호 모드를 종료합니다...');
      this.stopProcess();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      this.log('\n🛑 보호 모드를 종료합니다...');
      this.stopProcess();
      process.exit(0);
    });

    // 주기적 상태 확인 (5분마다)
    setInterval(() => {
      if (!this.isRunning && this.restartCount < this.maxRestarts) {
        this.log('🔍 프로세스가 중단되었습니다. 재시작을 시도합니다...');
        this.restartCount = 0;
        this.startProcess();
      }
    }, 5 * 60 * 1000);
  }
}

// CLI 인터페이스
function main() {
  const protector = new ProcessProtector();
  const command = process.argv[2];

  switch (command) {
    case 'start':
      protector.startProtection();
      break;
    case 'stop':
      protector.stopProcess();
      break;
    case 'restart':
      protector.restartProcess();
      break;
    case 'status':
      protector.checkStatus();
      break;
    default:
      console.log(`
🛡️ RSVShop 프로세스 보호기

사용법:
  node scripts/process-protector.js start    - 보호 모드 시작
  node scripts/process-protector.js stop     - 프로세스 중지
  node scripts/process-protector.js restart  - 프로세스 재시작
  node scripts/process-protector.js status   - 상태 확인

특징:
  ✅ 자동 재시작 (최대 5회)
  ✅ 포트 충돌 자동 해결
  ✅ 프로세스 모니터링
  ✅ 로그 기록
  ✅ taskkill 보호 (제한적)
      `);
  }
}

if (require.main === module) {
  main();
}

module.exports = ProcessProtector; 