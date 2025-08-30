#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// 로그 함수
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(title) {
  console.log('\n' + '='.repeat(60));
  log(`🔍 ${title}`, 'bright');
  console.log('='.repeat(60));
}

function logSection(title) {
  console.log('\n' + '-'.repeat(40));
  log(`📋 ${title}`, 'cyan');
  console.log('-'.repeat(40));
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// API 테스트 함수
async function testAPI(url, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const responseText = await response.text();
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      data: responseData,
      url
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      url
    };
  }
}

// 데이터베이스 테스트 함수
async function testDatabase() {
  const prisma = new PrismaClient();
  
  try {
    logSection('데이터베이스 연결 테스트');
    
    // 연결 테스트
    await prisma.$connect();
    logSuccess('데이터베이스 연결 성공');
    
    // PostgreSQL 버전 확인
    const version = await prisma.$queryRaw`SELECT version()`;
    logInfo(`PostgreSQL 버전: ${version[0].version}`);
    
    // 테이블 목록 확인
    const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    logInfo(`테이블 수: ${tables.length}개`);
    
    // 호텔 데이터 확인
    const hotels = await prisma.hotel.findMany();
    logInfo(`호텔 데이터: ${hotels.length}개`);
    if (hotels.length > 0) {
      hotels.forEach(hotel => {
        log(`  - ${hotel.name} (${hotel.status})`, 'green');
      });
    }
    
    // 사용자 데이터 확인
    const users = await prisma.user.findMany();
    logInfo(`사용자 데이터: ${users.length}개`);
    if (users.length > 0) {
      users.forEach(user => {
        log(`  - ${user.email} (${user.role})`, 'green');
      });
    }
    
    // 객실 데이터 확인
    const rooms = await prisma.room.findMany();
    logInfo(`객실 데이터: ${rooms.length}개`);
    
    // 패키지 데이터 확인
    const packages = await prisma.package.findMany();
    logInfo(`패키지 데이터: ${packages.length}개`);
    
    await prisma.$disconnect();
    logSuccess('데이터베이스 연결 종료');
    
    return true;
  } catch (error) {
    logError(`데이터베이스 테스트 실패: ${error.message}`);
    await prisma.$disconnect();
    return false;
  }
}

// API 테스트 함수
async function testAPIs() {
  const baseURL = 'http://localhost:4900';
  const apis = [
    { name: '호텔 목록 API', url: `${baseURL}/api/admin/hotels`, method: 'GET' },
    { name: '사용자 목록 API', url: `${baseURL}/api/admin/users`, method: 'GET' },
    { name: '메인 페이지', url: `${baseURL}/`, method: 'GET' },
    { name: '관리자 페이지', url: `${baseURL}/admin`, method: 'GET' },
  ];
  
  logSection('API 테스트');
  
  for (const api of apis) {
    log(`테스트 중: ${api.name}`, 'blue');
    const result = await testAPI(api.url, api.method);
    
    if (result.success) {
      logSuccess(`${api.name}: ${result.status} ${result.statusText}`);
      if (result.data && typeof result.data === 'object') {
        if (result.data.hotels) {
          logInfo(`  호텔 수: ${result.data.hotels.length}개`);
        }
        if (result.data.users) {
          logInfo(`  사용자 수: ${result.data.users.length}개`);
        }
      }
    } else {
      if (result.error) {
        logError(`${api.name}: ${result.error}`);
      } else {
        logWarning(`${api.name}: ${result.status} ${result.statusText}`);
      }
    }
    
    // API 간 간격
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// 서버 상태 확인 함수
async function checkServerStatus() {
  logSection('서버 상태 확인');
  
  try {
    const response = await fetch('http://localhost:4900/api/health');
    if (response.ok) {
      logSuccess('서버가 정상적으로 실행 중입니다');
    } else {
      logWarning(`서버 응답: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    logError(`서버 연결 실패: ${error.message}`);
  }
}

// 메인 테스트 실행 함수
async function runTests() {
  logHeader('RSVShop API 자동 테스트 시작');
  logInfo(`테스트 시작 시간: ${new Date().toLocaleString('ko-KR')}`);
  
  // 1. 서버 상태 확인
  await checkServerStatus();
  
  // 2. 데이터베이스 테스트
  const dbSuccess = await testDatabase();
  
  if (!dbSuccess) {
    logError('데이터베이스 테스트 실패로 인해 API 테스트를 건너뜁니다');
    return;
  }
  
  // 3. API 테스트
  await testAPIs();
  
  logHeader('테스트 완료');
  logSuccess('모든 테스트가 완료되었습니다!');
  logInfo(`테스트 완료 시간: ${new Date().toLocaleString('ko-KR')}`);
}

// 스크립트 실행
if (require.main === module) {
  runTests().catch(error => {
    logError(`테스트 실행 중 오류 발생: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runTests, testDatabase, testAPIs };
