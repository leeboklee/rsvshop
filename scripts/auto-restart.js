#!/usr/bin/env node

/**
 * RSVShop 자동 재시작 시스템
 * 가장 간단하고 효과적인 방법
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class AutoRestart {
  constructor() {
    this.port = 4900;
    this.maxRestarts = 10;
    this.restartDelay = 3000; // 3초
    this.restartCount = 0;
    this.isRunning = false;
    this.childProcess = null;
    this.logFile = path.join(__dirname, '../logs/auto-restart.log');
    
    // 로그 디렉토리 생성
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    
    console.log(logMessage);
    
    // 로그 파일에 기록
    fs.appendFileSync(this.logFile, logMessage + '\n');
  }

  startServer() {
    if (this.isRunning) {
      this.log('이미 실행 중입니다.');
      return;
    }

    this.log(`🚀 개발 서버를 시작합니다 (시도: ${this.restartCount + 1}/${this.maxRestarts})`);
    this.log(`📍 http://localhost:${this.port}`);
    this.log(`📍 관리자: http://localhost:${this.port}/admin`);
    
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
      this.log(`❌ 서버 시작 실패: ${error.message}`);
      this.handleExit(1);
    });

    this.childProcess.on('close', (code) => {
      this.log(`📴 서버가 종료되었습니다 (코드: ${code})`);
      this.handleExit(code);
    });

    this.childProcess.on('exit', (code) => {
      this.log(`📴 서버가 종료되었습니다 (코드: ${code})`);
      this.handleExit(code);
    });
  }

  handleExit(code) {
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
        this.startServer();
      }, this.restartDelay);
    } else {
      this.log(`❌ 최대 재시작 횟수 초과 (${this.maxRestarts}회)`);
      this.log('수동으로 서버를 시작해주세요.');
      process.exit(1);
    }
  }

  stop() {
    if (this.childProcess) {
      this.log('🛑 서버를 중지합니다...');
      this.childProcess.kill('SIGINT');
    }
  }
}

// 메인 실행
const autoRestart = new AutoRestart();

// 시그널 핸들러
process.on('SIGINT', () => {
  autoRestart.log('\n🛑 자동 재시작 시스템을 종료합니다...');
  autoRestart.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  autoRestart.log('\n🛑 자동 재시작 시스템을 종료합니다...');
  autoRestart.stop();
  process.exit(0);
});

// 서버 시작
autoRestart.log('🛡️ RSVShop 자동 재시작 시스템을 시작합니다...');
autoRestart.log('💡 서버가 종료되면 자동으로 재시작됩니다.');
autoRestart.log('💡 Ctrl+C로 종료할 수 있습니다.');
autoRestart.startServer(); 