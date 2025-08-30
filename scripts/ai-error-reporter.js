#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 오류 데이터 파일 경로
const ERROR_JSON_FILE = path.join(__dirname, '../logs/browser-errors.json');

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

// 오류 타입별 색상
function getErrorColor(type) {
  switch (type) {
    case 'javascript': return 'red';
    case 'network': return 'yellow';
    case 'promise': return 'magenta';
    case 'react': return 'cyan';
    case 'manual': return 'blue';
    case 'ai_connection': return 'green';
    case 'page_status': return 'cyan';
    case 'db_status': return 'purple';
    case 'database': return 'red';
    case 'prisma': return 'orange';
    default: return 'white';
  }
}

// 오류 표시
function displayError(error) {
  const color = getErrorColor(error.type);
  const typeIcon = {
    javascript: '🚨',
    network: '🌐',
    promise: '⚠️',
    react: '⚛️',
    manual: '📝',
    ai_connection: '🤖',
    page_status: '📊',
    db_status: '🗄️',
    database: '🚨',
    prisma: '⚙️'
  }[error.type] || '❓';

  log(`\n${typeIcon} ${colors.bold}새로운 이벤트 감지!${colors.reset}`, color);
  log(`   타입: ${error.type}`, color);
  log(`   메시지: ${error.message}`, color);
  log(`   URL: ${error.url}`, color);
  log(`   시간: ${new Date(error.timestamp).toLocaleString('ko-KR')}`, color);
  
  if (error.stack) {
    log(`   스택: ${error.stack.split('\n')[0]}`, color);
  }
  
  if (error.consoleLog) {
    log(`   콘솔 로그: ${error.consoleLog}`, color);
  }

  // 특별한 타입별 추가 정보 표시
  if (error.type === 'ai_connection' && error.pageInfo) {
    log(`   🤖 AI 연결 정보:`, color);
    log(`     활성 섹션: ${error.pageInfo.activeSection}`, color);
    log(`     현재 날짜: ${error.pageInfo.currentDate}`, color);
  }

  if (error.type === 'page_status' && error.statusInfo) {
    log(`   📊 페이지 상태 정보:`, color);
    log(`     예약 수: ${error.statusInfo.reservations}`, color);
    log(`     호텔 수: ${error.statusInfo.hotels}`, color);
    log(`     패키지 수: ${error.statusInfo.packages}`, color);
    log(`     쇼핑몰 수: ${error.statusInfo.shoppingMalls}`, color);
  }

  if (error.type === 'db_status' && error.dbStatus) {
    log(`   🗄️ DB 상태 정보:`, color);
    log(`     연결 상태: ${error.dbStatus.connected ? '정상' : '연결 안됨'}`, color);
    if (error.prismaStatus) {
      log(`     스키마 생성: ${error.prismaStatus.schemaGenerated ? '완료' : '미완료'}`, color);
      log(`     마이그레이션: ${error.prismaStatus.pendingMigrations?.length || 0}개 대기`, color);
    }
  }
  
  log(`   ─────────────────────────────────────────`, color);
}

// 자동 해결책 제안
function suggestSolution(error) {
  const solutions = {
    javascript: [
      '🔧 JavaScript 문법 오류 - 코드 검토 필요',
      '🔧 변수/함수 정의 확인',
      '🔧 브라우저 호환성 확인',
      '🔧 콘솔에서 스택 트레이스 확인'
    ],
    network: [
      '🌐 네트워크 연결 확인',
      '🌐 API 엔드포인트 상태 확인',
      '🌐 CORS 설정 확인',
      '🌐 서버 응답 상태 확인'
    ],
    promise: [
      '⚠️ Promise 처리 로직 검토',
      '⚠️ async/await 사용 권장',
      '⚠️ 에러 핸들링 추가',
      '⚠️ 콘솔에서 Promise 체인 확인'
    ],
    react: [
      '⚛️ React 컴포넌트 렌더링 오류',
      '⚛️ Props 타입 확인',
      '⚛️ State 업데이트 로직 검토',
      '⚛️ React DevTools로 디버깅'
    ],
    manual: [
      '📝 사용자가 의도적으로 발생시킨 오류',
      '📝 브라우저 콘솔에서 상세 정보 확인',
      '📝 실제 오류 상황인지 확인 필요',
      '📝 사용자 피드백 수집'
    ],
    ai_connection: [
      '🤖 AI 연결 성공 - 실시간 모니터링 시작',
      '🤖 페이지 상태 추적 활성화',
      '🤖 사용자 활동 모니터링 중',
      '🤖 추가 이벤트 대기 중'
    ],
    page_status: [
      '📊 페이지 상태 정상 - 모든 데이터 로드됨',
      '📊 예약, 호텔, 패키지 데이터 확인',
      '📊 사용자 인터페이스 정상 작동',
      '📊 추가 모니터링 계속'
    ],
    db_status: [
      '🗄️ DB 상태 확인 완료',
      '🗄️ 연결 문제 시 자동 수정 시도',
      '🗄️ Prisma 스키마 상태 확인',
      '🗄️ 마이그레이션 필요 시 자동 실행'
    ],
    database: [
      '🚨 DB 연결 문제 감지',
      '🚨 자동 수정 시도 중...',
      '🚨 Prisma generate 실행',
      '🚨 마이그레이션 확인'
    ],
    prisma: [
      '⚙️ Prisma 스키마 문제 감지',
      '⚙️ 자동 스키마 생성 시도',
      '⚙️ 마이그레이션 실행',
      '⚙️ DB push 시도'
    ]
  };

  const typeSolutions = solutions[error.type] || ['🔍 일반적인 이벤트 - 로그 분석 필요'];
  
  log(`\n${colors.bold}💡 자동 해결책 제안:${colors.reset}`, 'green');
  typeSolutions.forEach(solution => {
    log(`   ${solution}`, 'green');
  });
  
  // 브라우저 콘솔 확인 안내
  log(`\n${colors.bold}🔍 브라우저 콘솔 확인 방법:${colors.reset}`, 'cyan');
  log(`   1. 브라우저에서 F12 키 누르기`, 'cyan');
  log(`   2. Console 탭으로 이동`, 'cyan');
  log(`   3. "[AI 확인]" 태그가 붙은 로그 확인`, 'cyan');
  log(`   4. 이벤트 상세 정보 및 상태 확인`, 'cyan');
}

// 파일 감시 및 AI 알림
function startAIReporting() {
  log(`${colors.bold}🤖 AI 오류 리포터 시작${colors.reset}`, 'green');
  log(`   파일 감시: ${ERROR_JSON_FILE}`, 'green');
  log(`   서버 URL: http://localhost:4900`, 'green');
  log(`   ─────────────────────────────────────────`, 'green');

  let lastErrorCount = 0;
  let lastSize = 0;

  const checkFile = () => {
    try {
      if (fs.existsSync(ERROR_JSON_FILE)) {
        const stats = fs.statSync(ERROR_JSON_FILE);
        if (stats.size !== lastSize) {
          lastSize = stats.size;
          const data = JSON.parse(fs.readFileSync(ERROR_JSON_FILE, 'utf8'));
          
          // 새로운 오류 확인
          if (data.errors && data.errors.length > lastErrorCount) {
            const newErrors = data.errors.slice(0, data.errors.length - lastErrorCount);
            newErrors.reverse().forEach(error => {
              displayError(error);
              suggestSolution(error);
              
              // AI가 즉시 확인할 수 있도록 명확한 알림
              log(`\n${colors.bold}🎯 AI 확인 필요:${colors.reset}`, 'red');
              log(`   오류 ID: ${error.id}`, 'red');
              log(`   즉시 수정이 필요한 오류입니다!`, 'red');
              log(`   ─────────────────────────────────────────`, 'red');
            });
          }
          
          lastErrorCount = data.errors ? data.errors.length : 0;
        }
      }
    } catch (err) {
      // 파일 읽기 오류는 무시
    }
  };

  // 1초마다 파일 확인
  setInterval(checkFile, 1000);

  // 키보드 입력 처리
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  process.stdin.on('data', (key) => {
    switch (key) {
      case 'q':
      case '\u0003': // Ctrl+C
        log(`\n${colors.bold}🛑 AI 리포터 종료${colors.reset}`, 'red');
        process.exit(0);
        break;
      case 'c':
        log(`\n${colors.bold}🧹 화면 클리어${colors.reset}`, 'yellow');
        console.clear();
        log(`${colors.bold}🤖 AI 오류 리포터${colors.reset}`, 'green');
        break;
    }
  });

  log(`\n${colors.bold}⌨️  키보드 단축키:${colors.reset}`, 'cyan');
  log(`   q: 종료  c: 클리어`, 'cyan');
  log(`   ─────────────────────────────────────────`, 'cyan');
}

// 시작
if (require.main === module) {
  startAIReporting();
}

module.exports = { displayError, suggestSolution };
