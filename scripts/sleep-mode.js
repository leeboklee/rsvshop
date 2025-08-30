#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 설정
const SLEEP_DURATION = 3 * 60 * 60 * 1000; // 3시간 (밀리초)
const LOG_FILE = path.join(__dirname, '../logs/sleep-mode.log');

// 로그 디렉토리 생성
const logDir = path.dirname(LOG_FILE);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 로그 함수
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage.trim());
  fs.appendFileSync(LOG_FILE, logMessage);
}

// 메인 서버 시작
function startServer() {
  log('🚀 서버 시작 중...');
  
  const server = spawn('npm', ['run', 'dev'], {
    stdio: 'pipe',
    shell: true
  });

  server.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Ready in') || output.includes('Local:')) {
      log('✅ 서버가 성공적으로 시작되었습니다.');
    }
    process.stdout.write(output);
  });

  server.stderr.on('data', (data) => {
    process.stderr.write(data);
  });

  server.on('close', (code) => {
    log(`🛑 서버가 종료되었습니다. (코드: ${code})`);
    process.exit(code);
  });

  return server;
}

// 절전 모드 타이머
function startSleepTimer() {
  log(`⏰ ${SLEEP_DURATION / (1000 * 60 * 60)}시간 후 자동 종료 타이머 시작`);
  
  setTimeout(() => {
    log('🛌 절전 모드: 3시간 경과로 서버를 종료합니다.');
    process.exit(0);
  }, SLEEP_DURATION);
}

// 메인 실행
function main() {
  log('🌙 절전 모드 서버 시작');
  
  const server = startServer();
  startSleepTimer();

  // 프로세스 종료 처리
  process.on('SIGINT', () => {
    log('🛑 사용자에 의해 종료 요청됨');
    server.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    log('🛑 시스템에 의해 종료 요청됨');
    server.kill('SIGTERM');
    process.exit(0);
  });
}

main(); 