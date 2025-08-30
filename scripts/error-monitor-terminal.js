#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 오류 로그 파일 경로
const ERROR_LOG_FILE = path.join(__dirname, '../logs/browser-errors.log');
const ERROR_JSON_FILE = path.join(__dirname, '../logs/browser-errors.json');

// 로그 디렉토리 생성
const logDir = path.dirname(ERROR_LOG_FILE);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 오류 데이터 저장소
let errorStore = [];
let errorStats = {
  totalErrors: 0,
  byType: {},
  byHour: {},
  recentErrors: []
};

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
  bold: '\x1b[1m',
  underline: '\x1b[4m'
};

// 로그 함수
function log(message, color = 'white') {
  const timestamp = new Date().toISOString();
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
    default: return 'white';
  }
}

// 오류 저장
function saveError(errorData) {
  const timestamp = new Date().toISOString();
  const error = {
    ...errorData,
    timestamp,
    id: errorData.errorId || `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };

  // 오류 저장소에 추가
  errorStore.unshift(error);
  if (errorStore.length > 100) {
    errorStore = errorStore.slice(0, 100);
  }

  // 통계 업데이트
  errorStats.totalErrors++;
  errorStats.byType[error.type] = (errorStats.byType[error.type] || 0) + 1;
  
  const hour = new Date().getHours();
  errorStats.byHour[hour] = (errorStats.byHour[hour] || 0) + 1;

  // 최근 오류 목록 업데이트
  errorStats.recentErrors.unshift(error);
  if (errorStats.recentErrors.length > 10) {
    errorStats.recentErrors = errorStats.recentErrors.slice(0, 10);
  }

  // 파일에 저장
  try {
    fs.writeFileSync(ERROR_JSON_FILE, JSON.stringify({
      errors: errorStore,
      stats: errorStats,
      lastUpdated: timestamp
    }, null, 2));
  } catch (err) {
    log(`❌ 오류 데이터 저장 실패: ${err.message}`, 'red');
  }

  // 터미널에 출력
  displayError(error);
  displayStats();
}

// 오류 표시
function displayError(error) {
  const color = getErrorColor(error.type);
  const typeIcon = {
    javascript: '🚨',
    network: '🌐',
    promise: '⚠️',
    react: '⚛️',
    manual: '📝'
  }[error.type] || '❓';

  log(`\n${typeIcon} ${colors.bold}새로운 오류 감지!${colors.reset}`, color);
  log(`   타입: ${error.type}`, color);
  log(`   메시지: ${error.message}`, color);
  log(`   URL: ${error.url}`, color);
  log(`   시간: ${new Date(error.timestamp).toLocaleString('ko-KR')}`, color);
  
  if (error.stack) {
    log(`   스택: ${error.stack.split('\n')[0]}`, color);
  }
  
  log(`   ─────────────────────────────────────────`, color);
}

// 통계 표시
function displayStats() {
  log(`\n${colors.bold}📊 실시간 오류 통계${colors.reset}`, 'cyan');
  log(`   총 오류 수: ${errorStats.totalErrors}`, 'cyan');
  
  if (Object.keys(errorStats.byType).length > 0) {
    log(`   타입별 분포:`, 'cyan');
    Object.entries(errorStats.byType).forEach(([type, count]) => {
      const color = getErrorColor(type);
      log(`     ${type}: ${count}개`, color);
    });
  }
  
  if (errorStats.recentErrors.length > 0) {
    log(`   최근 오류 (최대 5개):`, 'cyan');
    errorStats.recentErrors.slice(0, 5).forEach((error, index) => {
      const color = getErrorColor(error.type);
      log(`     ${index + 1}. [${error.type}] ${error.message.substring(0, 50)}...`, color);
    });
  }
  
  log(`   ─────────────────────────────────────────`, 'cyan');
}

// 자동 해결책 제안
function suggestSolution(error) {
  const solutions = {
    javascript: [
      '🔧 JavaScript 문법 오류 - 코드 검토 필요',
      '🔧 변수/함수 정의 확인',
      '🔧 브라우저 호환성 확인'
    ],
    network: [
      '🌐 네트워크 연결 확인',
      '🌐 API 엔드포인트 상태 확인',
      '🌐 CORS 설정 확인'
    ],
    promise: [
      '⚠️ Promise 처리 로직 검토',
      '⚠️ async/await 사용 권장',
      '⚠️ 에러 핸들링 추가'
    ],
    react: [
      '⚛️ React 컴포넌트 렌더링 오류',
      '⚛️ Props 타입 확인',
      '⚛️ State 업데이트 로직 검토'
    ]
  };

  const typeSolutions = solutions[error.type] || ['🔍 일반적인 오류 - 로그 분석 필요'];
  
  log(`\n${colors.bold}💡 자동 해결책 제안:${colors.reset}`, 'green');
  typeSolutions.forEach(solution => {
    log(`   ${solution}`, 'green');
  });
}

// 메인 모니터링 루프
function startMonitoring() {
  log(`${colors.bold}🛡️ 브라우저 오류 모니터링 시스템 시작${colors.reset}`, 'green');
  log(`   로그 파일: ${ERROR_LOG_FILE}`, 'green');
  log(`   JSON 파일: ${ERROR_JSON_FILE}`, 'green');
  log(`   서버 URL: http://localhost:4900`, 'green');
  log(`   ─────────────────────────────────────────`, 'green');

  // 기존 오류 데이터 로드
  try {
    if (fs.existsSync(ERROR_JSON_FILE)) {
      const data = JSON.parse(fs.readFileSync(ERROR_JSON_FILE, 'utf8'));
      errorStore = data.errors || [];
      errorStats = data.stats || { totalErrors: 0, byType: {}, byHour: {}, recentErrors: [] };
      log(`   기존 오류 데이터 로드됨: ${errorStore.length}개`, 'green');
    }
  } catch (err) {
    log(`   기존 데이터 로드 실패: ${err.message}`, 'yellow');
  }

  // 파일 감시 설정
  let lastSize = 0;
  const checkFile = () => {
    try {
      if (fs.existsSync(ERROR_JSON_FILE)) {
        const stats = fs.statSync(ERROR_JSON_FILE);
        if (stats.size !== lastSize) {
          lastSize = stats.size;
          const data = JSON.parse(fs.readFileSync(ERROR_JSON_FILE, 'utf8'));
          
          // 새로운 오류 확인
          if (data.errors && data.errors.length > errorStore.length) {
            const newErrors = data.errors.slice(0, data.errors.length - errorStore.length);
            newErrors.reverse().forEach(error => {
              saveError(error);
              suggestSolution(error);
            });
          }
          
          errorStore = data.errors || [];
          errorStats = data.stats || { totalErrors: 0, byType: {}, byHour: {}, recentErrors: [] };
        }
      }
    } catch (err) {
      // 파일 읽기 오류는 무시 (파일이 아직 생성되지 않았을 수 있음)
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
        log(`\n${colors.bold}🛑 모니터링 종료${colors.reset}`, 'red');
        process.exit(0);
        break;
      case 's':
        log(`\n${colors.bold}📊 통계 새로고침${colors.reset}`, 'cyan');
        displayStats();
        break;
      case 'c':
        log(`\n${colors.bold}🧹 화면 클리어${colors.reset}`, 'yellow');
        console.clear();
        log(`${colors.bold}🛡️ 브라우저 오류 모니터링 시스템${colors.reset}`, 'green');
        break;
      case 'h':
        log(`\n${colors.bold}📖 도움말${colors.reset}`, 'cyan');
        log(`   q: 종료`, 'white');
        log(`   s: 통계 표시`, 'white');
        log(`   c: 화면 클리어`, 'white');
        log(`   h: 도움말`, 'white');
        break;
    }
  });

  log(`\n${colors.bold}⌨️  키보드 단축키:${colors.reset}`, 'cyan');
  log(`   q: 종료  s: 통계  c: 클리어  h: 도움말`, 'cyan');
  log(`   ─────────────────────────────────────────`, 'cyan');
}

// 시작
if (require.main === module) {
  startMonitoring();
}

module.exports = { saveError, displayError, displayStats };
