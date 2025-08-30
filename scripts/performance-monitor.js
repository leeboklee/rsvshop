const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class PerformanceMonitor {
  constructor() {
    this.logFile = path.join(__dirname, '../logs/performance.log');
    this.startTime = Date.now();
  }

  // 컴파일 시간 측정
  measureCompileTime(route) {
    const compileStart = Date.now();
    return {
      route,
      startTime: compileStart,
      end: () => {
        const duration = Date.now() - compileStart;
        this.log(`컴파일 완료: ${route} - ${duration}ms`);
        return duration;
      }
    };
  }

  // 메모리 사용량 체크
  checkMemoryUsage() {
    const memUsage = process.memoryUsage();
    const memoryMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    this.log(`메모리 사용량: ${memoryMB}MB`);
    return memoryMB;
  }

  // 성능 최적화 제안
  suggestOptimizations() {
    const suggestions = [
      '1. Turbopack 사용: npm run dev:turbo',
      '2. 불필요한 import 제거',
      '3. 큰 컴포넌트 lazy loading 적용',
      '4. 이미지 최적화 (next/image 사용)',
      '5. API 응답 캐싱 적용',
      '6. 컴포넌트 메모이제이션 (React.memo)',
      '7. 번들 분석: npm install --save-dev @next/bundle-analyzer'
    ];
    
    this.log('성능 최적화 제안:');
    suggestions.forEach(suggestion => this.log(`  ${suggestion}`));
  }

  // 로그 기록
  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    
    // 콘솔 출력
    console.log(message);
    
    // 파일에 기록
    fs.appendFileSync(this.logFile, logMessage);
  }

  // 성능 리포트 생성
  generateReport() {
    const totalTime = Date.now() - this.startTime;
    const memoryMB = this.checkMemoryUsage();
    
    this.log(`=== 성능 리포트 ===`);
    this.log(`총 실행 시간: ${totalTime}ms`);
    this.log(`최종 메모리 사용량: ${memoryMB}MB`);
    this.log(`==================`);
  }
}

module.exports = PerformanceMonitor; 