#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 설정
const LOG_FILE = path.join(__dirname, '../logs/memory-monitor.log');
const INTERVAL = 30000; // 30초마다 체크

// 로그 디렉토리 생성
const logDir = path.dirname(LOG_FILE);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 메모리 사용량 가져오기
function getMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    rss: Math.round(usage.rss / 1024 / 1024), // MB
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
    external: Math.round(usage.external / 1024 / 1024), // MB
    arrayBuffers: Math.round(usage.arrayBuffers / 1024 / 1024) // MB
  };
}

// 메모리 누수 감지
function detectMemoryLeak(history) {
  if (history.length < 5) return false;
  
  const recent = history.slice(-5);
  const first = recent[0];
  const last = recent[recent.length - 1];
  
  // 5분 동안 50MB 이상 증가하면 누수로 판단
  const increase = last.heapUsed - first.heapUsed;
  return increase > 50;
}

// 로그 함수
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage.trim());
  fs.appendFileSync(LOG_FILE, logMessage);
}

// 메모리 히스토리
let memoryHistory = [];

// 메모리 모니터링
function monitorMemory() {
  const memory = getMemoryUsage();
  memoryHistory.push({
    ...memory,
    timestamp: new Date()
  });
  
  // 최근 20개만 유지
  if (memoryHistory.length > 20) {
    memoryHistory = memoryHistory.slice(-20);
  }
  
  // 메모리 사용량 로그
  log(`📊 메모리 사용량: RSS=${memory.rss}MB, Heap=${memory.heapUsed}/${memory.heapTotal}MB, External=${memory.external}MB`);
  
  // 메모리 누수 감지
  if (detectMemoryLeak(memoryHistory)) {
    log('⚠️ 메모리 누수 감지! 5분 동안 50MB 이상 증가');
  }
  
  // 높은 메모리 사용량 경고
  if (memory.heapUsed > 500) {
    log('🚨 높은 메모리 사용량 경고! 500MB 초과');
  }
  
  // 가비지 컬렉션 강제 실행 (필요시)
  if (memory.heapUsed > memory.heapTotal * 0.8) {
    log('🧹 가비지 컬렉션 강제 실행');
    // --expose-gc 옵션이 없으면 가비지 컬렉션을 강제할 수 없음
    if (global.gc) {
      global.gc();
    } else {
      log('💡 가비지 컬렉션을 강제하려면 --expose-gc 옵션이 필요합니다');
    }
  }
}

// 메모리 최적화 팁
function getMemoryTips() {
  const memory = getMemoryUsage();
  const tips = [];
  
  if (memory.heapUsed > 300) {
    tips.push('💡 큰 객체들을 null로 설정하여 가비지 컬렉션 유도');
  }
  
  if (memory.external > 100) {
    tips.push('💡 외부 메모리 사용량이 높습니다. 스트림을 적절히 닫아주세요');
  }
  
  if (memory.arrayBuffers > 50) {
    tips.push('💡 ArrayBuffer 사용량이 높습니다. 큰 파일 처리를 최적화하세요');
  }
  
  return tips;
}

// 메인 실행
function main() {
  log('🧠 메모리 모니터링 시작');
  
  // 초기 메모리 상태
  monitorMemory();
  
  // 주기적 모니터링
  setInterval(() => {
    monitorMemory();
    
    // 메모리 최적화 팁 제공
    const tips = getMemoryTips();
    if (tips.length > 0) {
      tips.forEach(tip => log(tip));
    }
  }, INTERVAL);
  
  // 프로세스 종료 시 최종 메모리 상태
  process.on('exit', () => {
    const finalMemory = getMemoryUsage();
    log(`🛑 최종 메모리 상태: RSS=${finalMemory.rss}MB, Heap=${finalMemory.heapUsed}/${finalMemory.heapTotal}MB`);
  });
  
  // 프로세스 종료 처리
  process.on('SIGINT', () => {
    log('🛑 메모리 모니터링 종료');
    process.exit(0);
  });
}

main(); 