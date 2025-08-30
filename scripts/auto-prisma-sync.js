#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 설정
const LOG_FILE = path.join(__dirname, '../logs/prisma-sync.log');
const SCHEMA_PATH = path.join(__dirname, '../prisma/schema.prisma');

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

// Prisma 스키마 파일 감시
function watchSchemaFile() {
  log('🔍 Prisma 스키마 파일 감시 시작');
  
  let lastModified = fs.statSync(SCHEMA_PATH).mtime.getTime();
  
  setInterval(() => {
    try {
      const stats = fs.statSync(SCHEMA_PATH);
      if (stats.mtime.getTime() > lastModified) {
        lastModified = stats.mtime.getTime();
        log('📝 스키마 파일 변경 감지');
        syncPrisma();
      }
    } catch (error) {
      log(`❌ 스키마 파일 감시 오류: ${error.message}`);
    }
  }, 1000); // 1초마다 확인
}

// Prisma 동기화
function syncPrisma() {
  log('🔄 Prisma 동기화 시작');
  
  // 1. Prisma 클라이언트 재생성
  const generate = spawn('npx', ['prisma', 'generate'], {
    stdio: 'pipe',
    shell: true
  });

  generate.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Generated Prisma Client')) {
      log('✅ Prisma 클라이언트 재생성 완료');
    }
    process.stdout.write(output);
  });

  generate.stderr.on('data', (data) => {
    process.stderr.write(data);
  });

  generate.on('close', (code) => {
    if (code === 0) {
      log('✅ Prisma 클라이언트 생성 성공');
      // 2. 데이터베이스 동기화
      pushToDatabase();
    } else {
      log(`❌ Prisma 클라이언트 생성 실패 (코드: ${code})`);
    }
  });
}

// 데이터베이스에 스키마 적용
function pushToDatabase() {
  log('🗄️ 데이터베이스에 스키마 적용 중...');
  
  const push = spawn('npx', ['prisma', 'db', 'push'], {
    stdio: 'pipe',
    shell: true
  });

  push.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('The database is already in sync') || output.includes('Pushed to database')) {
      log('✅ 데이터베이스 동기화 완료');
    }
    process.stdout.write(output);
  });

  push.stderr.on('data', (data) => {
    process.stderr.write(data);
  });

  push.on('close', (code) => {
    if (code === 0) {
      log('✅ Prisma 동기화 완료');
    } else {
      log(`❌ 데이터베이스 동기화 실패 (코드: ${code})`);
    }
  });
}

// 초기 동기화
function initialSync() {
  log('🚀 초기 Prisma 동기화 시작');
  syncPrisma();
}

// 메인 실행
function main() {
  log('🔄 Prisma 자동 동기화 서비스 시작');
  
  // 초기 동기화
  initialSync();
  
  // 스키마 파일 감시 시작
  watchSchemaFile();
  
  // 프로세스 종료 처리
  process.on('SIGINT', () => {
    log('🛑 사용자에 의해 종료 요청됨');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    log('🛑 시스템에 의해 종료 요청됨');
    process.exit(0);
  });
}

main(); 