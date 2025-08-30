#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// ANSI 색상 코드
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

// 로그 함수
function log(message, color = 'white') {
  const timestamp = new Date().toLocaleString('ko-KR');
  const coloredMessage = `${colors[color]}${message}${colors.reset}`;
  console.log(`[${timestamp}] ${coloredMessage}`);
}

// DB 상태 확인
async function checkDBStatus() {
  return new Promise((resolve) => {
    exec('curl -s http://localhost:4900/api/health/db', (error, stdout, stderr) => {
      try {
        const data = JSON.parse(stdout);
        resolve(data);
      } catch (err) {
        resolve({ status: 'error', message: 'DB 상태 확인 실패' });
      }
    });
  });
}

// Prisma 상태 확인
async function checkPrismaStatus() {
  return new Promise((resolve) => {
    exec('curl -s http://localhost:4900/api/admin/prisma-status', (error, stdout, stderr) => {
      try {
        const data = JSON.parse(stdout);
        resolve(data);
      } catch (err) {
        resolve({ status: 'error', message: 'Prisma 상태 확인 실패' });
      }
    });
  });
}

// 자동 수정 함수들
async function fixPrismaGenerate() {
  log('🔧 Prisma generate 실행 중...', 'yellow');
  return new Promise((resolve) => {
    exec('npx prisma generate', { cwd: process.cwd() }, (error, stdout, stderr) => {
      if (error) {
        log(`❌ Prisma generate 실패: ${error.message}`, 'red');
        resolve(false);
      } else {
        log('✅ Prisma generate 완료', 'green');
        resolve(true);
      }
    });
  });
}

async function fixPrismaMigrate() {
  log('🔧 Prisma migrate 실행 중...', 'yellow');
  return new Promise((resolve) => {
    exec('npx prisma migrate dev --name auto-fix', { cwd: process.cwd() }, (error, stdout, stderr) => {
      if (error) {
        log(`❌ Prisma migrate 실패: ${error.message}`, 'red');
        resolve(false);
      } else {
        log('✅ Prisma migrate 완료', 'green');
        resolve(true);
      }
    });
  });
}

async function fixPrismaPush() {
  log('🔧 Prisma db push 실행 중...', 'yellow');
  return new Promise((resolve) => {
    exec('npx prisma db push', { cwd: process.cwd() }, (error, stdout, stderr) => {
      if (error) {
        log(`❌ Prisma db push 실패: ${error.message}`, 'red');
        resolve(false);
      } else {
        log('✅ Prisma db push 완료', 'green');
        resolve(true);
      }
    });
  });
}

async function fixDatabaseConnection() {
  log('🔧 데이터베이스 연결 복구 시도...', 'yellow');
  
  // 1. Prisma generate
  const generateSuccess = await fixPrismaGenerate();
  if (!generateSuccess) return false;
  
  // 2. Prisma migrate
  const migrateSuccess = await fixPrismaMigrate();
  if (!migrateSuccess) {
    // migrate 실패시 db push 시도
    log('🔄 migrate 실패, db push 시도...', 'yellow');
    const pushSuccess = await fixPrismaPush();
    if (!pushSuccess) return false;
  }
  
  return true;
}

// DB 오류 감지 및 자동 수정
async function detectAndFixDBIssues() {
  log(`${colors.bold}🗄️ DB 자동 수정 시스템 시작${colors.reset}`, 'green');
  log(`   서버 URL: http://localhost:4900`, 'green');
  log(`   ─────────────────────────────────────────`, 'green');

  let lastDBStatus = null;
  let lastPrismaStatus = null;

  const checkAndFix = async () => {
    try {
      // DB 상태 확인
      const dbStatus = await checkDBStatus();
      const prismaStatus = await checkPrismaStatus();

      // 상태 변경 감지
      const dbChanged = JSON.stringify(dbStatus) !== JSON.stringify(lastDBStatus);
      const prismaChanged = JSON.stringify(prismaStatus) !== JSON.stringify(lastPrismaStatus);

      if (dbChanged || prismaChanged) {
        log(`\n${colors.bold}🔍 DB 상태 변경 감지!${colors.reset}`, 'cyan');
        
        // DB 상태 표시
        if (dbStatus.status === 'error' || dbStatus.connected === false) {
          log(`   🚨 DB 연결 상태: 연결 안됨`, 'red');
          log(`   🔧 자동 수정 시작...`, 'yellow');
          
          const fixSuccess = await fixDatabaseConnection();
          if (fixSuccess) {
            log(`   ✅ DB 자동 수정 완료!`, 'green');
          } else {
            log(`   ❌ DB 자동 수정 실패`, 'red');
          }
        } else {
          log(`   ✅ DB 연결 상태: 정상`, 'green');
        }

        // Prisma 상태 표시
        if (prismaStatus.status === 'error' || prismaStatus.schemaGenerated === false) {
          log(`   🚨 Prisma 상태: 스키마 생성 필요`, 'red');
          log(`   🔧 Prisma generate 실행...`, 'yellow');
          
          const generateSuccess = await fixPrismaGenerate();
          if (generateSuccess) {
            log(`   ✅ Prisma 스키마 생성 완료!`, 'green');
          } else {
            log(`   ❌ Prisma 스키마 생성 실패`, 'red');
          }
        } else {
          log(`   ✅ Prisma 상태: 정상`, 'green');
        }

        // 마이그레이션 상태 확인
        if (prismaStatus.pendingMigrations && prismaStatus.pendingMigrations.length > 0) {
          log(`   🚨 대기 중인 마이그레이션: ${prismaStatus.pendingMigrations.length}개`, 'red');
          log(`   🔧 마이그레이션 실행...`, 'yellow');
          
          const migrateSuccess = await fixPrismaMigrate();
          if (migrateSuccess) {
            log(`   ✅ 마이그레이션 완료!`, 'green');
          } else {
            log(`   ❌ 마이그레이션 실패`, 'red');
          }
        } else {
          log(`   ✅ 마이그레이션 상태: 최신`, 'green');
        }

        log(`   ─────────────────────────────────────────`, 'cyan');
      }

      lastDBStatus = dbStatus;
      lastPrismaStatus = prismaStatus;

    } catch (error) {
      log(`❌ DB 상태 확인 중 오류: ${error.message}`, 'red');
    }
  };

  // 초기 상태 확인
  await checkAndFix();

  // 10초마다 상태 확인
  setInterval(checkAndFix, 10000);

  // 키보드 입력 처리
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  process.stdin.on('data', async (key) => {
    switch (key) {
      case 'q':
      case '\u0003': // Ctrl+C
        log(`\n${colors.bold}🛑 DB 자동 수정 시스템 종료${colors.reset}`, 'red');
        process.exit(0);
        break;
      case 'c':
        log(`\n${colors.bold}🧹 화면 클리어${colors.reset}`, 'yellow');
        console.clear();
        log(`${colors.bold}🗄️ DB 자동 수정 시스템${colors.reset}`, 'green');
        break;
      case 'f':
        log(`\n${colors.bold}🔧 수동 수정 실행${colors.reset}`, 'yellow');
        await fixDatabaseConnection();
        break;
      case 's':
        log(`\n${colors.bold}📊 현재 상태 확인${colors.reset}`, 'cyan');
        await checkAndFix();
        break;
    }
  });

  log(`\n${colors.bold}⌨️  키보드 단축키:${colors.reset}`, 'cyan');
  log(`   q: 종료  c: 클리어  f: 수동 수정  s: 상태 확인`, 'cyan');
  log(`   ─────────────────────────────────────────`, 'cyan');
}

// 시작
if (require.main === module) {
  detectAndFixDBIssues();
}

module.exports = { detectAndFixDBIssues, fixDatabaseConnection };
