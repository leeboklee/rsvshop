const { spawn } = require('child_process');
const { ErrorHandler, ERROR_TYPES } = require('./error-handler');
const PORT_CONFIG = require('../config/port-config');

class EnhancedErrorMonitor {
  constructor() {
    this.errorHandler = new ErrorHandler();
    this.serverProcess = null;
    this.healthCheckInterval = null;
    this.isRunning = false;
    this.restartCount = 0;
  }

  // 서버 시작
  async startServer() {
    console.log('🚀 강화된 오류 모니터링 시작');
    console.log(`📡 포트: ${PORT_CONFIG.SERVER_PORT}`);
    console.log(`🌐 URL: ${PORT_CONFIG.BROWSER_URL}`);
    
    this.isRunning = true;
    
    try {
      // 서버 프로세스 시작
      await this.spawnServer();
      
      // 헬스체크 시작
      this.startHealthCheck();
      
      // 프로세스 종료 시그널 처리
      this.setupProcessHandlers();
      
      console.log('✅ 서버 모니터링 시작 완료');
    } catch (error) {
      console.error('❌ 서버 시작 실패:', error.message);
      await this.errorHandler.handleError(error, ERROR_TYPES.SERVER);
    }
  }

  // 서버 프로세스 생성
  async spawnServer() {
    return new Promise((resolve, reject) => {
      console.log('🔄 서버 프로세스 시작 중...');
      
      this.serverProcess = spawn('node', ['scripts/auto-port-manager.js'], {
        stdio: ['inherit', 'pipe', 'pipe'], // stderr만 파이프로 처리
        env: { ...process.env, PORT: PORT_CONFIG.SERVER_PORT }
      });
      
      // stdout 로그 최소화
      this.serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        // 중요한 로그만 출력
        if (output.includes('Ready') || output.includes('Error') || output.includes('Failed')) {
          console.log(output.trim());
        }
      });
      
      // stderr 로그 최소화
      this.serverProcess.stderr.on('data', (data) => {
        const error = data.toString();
        // 중요한 오류만 출력
        if (error.includes('Error') || error.includes('Failed') || error.includes('EADDRINUSE')) {
          console.error(error.trim());
        }
      });
      
      this.serverProcess.on('error', (error) => {
        console.error('❌ 서버 프로세스 오류:', error.message);
        reject(error);
      });
      
      this.serverProcess.on('close', (code) => {
        if (code !== 0) {
          console.log(`📋 서버 프로세스 종료 (코드: ${code})`);
        }
        if (this.isRunning) {
          this.handleServerCrash(code);
        }
      });
      
      // 서버 시작 대기
      setTimeout(() => {
        resolve();
      }, 3000);
    });
  }

  // 헬스체크 시작
  startHealthCheck() {
    console.log('🔍 헬스체크 모니터링 시작 (비활성화됨)');
    
    // 헬스체크 모니터링 비활성화
    // this.healthCheckInterval = setInterval(async () => {
    //   if (!this.isRunning) return;
    //   
    //   const isHealthy = await this.errorHandler.healthCheck();
    //   
    //   if (!isHealthy) {
    //     console.log('⚠️ 서버 헬스체크 실패');
    //     // 헬스체크 실패 시 즉시 재시작하지 않고 로그만 남김
    //     // await this.errorHandler.handleError(
    //     //   { message: '헬스체크 실패' }, 
    //     //   ERROR_TYPES.SERVER
    //     // );
    //   } else {
    //     console.log('✅ 서버 헬스체크 성공');
    //   }
    // }, 30000); // 30초마다 체크
  }

  // 서버 크래시 처리
  async handleServerCrash(code) {
    if (!this.isRunning) return;
    
    console.log(`🚨 서버 크래시 감지 (코드: ${code})`);
    
    // 최대 재시작 횟수 제한
    if (this.restartCount >= 3) {
      console.log('❌ 최대 재시작 횟수 초과');
      console.log('❌ 최대 재시작 횟수 초과. 서버를 수동으로 재시작해주세요.');
      this.isRunning = false;
      process.exit(1);
      return;
    }
    
    this.restartCount++;
    console.log(`🔄 오류 복구 시도 ${this.restartCount}/3`);
    
    try {
      // 오류 로그 기록
      console.log('[SERVER] 서버 오류 발생', {
        message: '서버 프로세스 크래시',
        code: code,
        timestamp: new Date().toISOString()
      });
      
      // 잠시 대기 후 재시작
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('🔄 서버 재시작 중...');
      await this.spawnServer();
      console.log('✅ 서버 재시작 완료');
      
    } catch (error) {
      console.error('❌ 재시작 실패:', error.message);
      this.isRunning = false;
      process.exit(1);
    }
  }

  // 프로세스 핸들러 설정
  setupProcessHandlers() {
    process.on('SIGINT', async () => {
      console.log('🛑 종료 시그널 수신');
      await this.shutdown();
    });
    
    process.on('SIGTERM', async () => {
      console.log('🛑 종료 시그널 수신');
      await this.shutdown();
    });
    
    process.on('uncaughtException', async (error) => {
      console.error('💥 처리되지 않은 예외:', error);
      await this.errorHandler.handleError(error, ERROR_TYPES.SERVER);
    });
    
    process.on('unhandledRejection', async (reason, promise) => {
      console.error('💥 처리되지 않은 Promise 거부:', reason);
      await this.errorHandler.handleError(reason, ERROR_TYPES.SERVER);
    });
  }

  // 종료 처리
  async shutdown() {
    console.log('🛑 서버 종료 중...');
    
    this.isRunning = false;
    
    // 헬스체크 중지
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    // 서버 프로세스 종료
    if (this.serverProcess) {
      this.serverProcess.kill('SIGTERM');
    }
    
    // 상태 리포트 출력
    const status = this.errorHandler.getStatusReport();
    console.log('📊 최종 상태 리포트:', status);
    
    process.exit(0);
  }

  // 상태 확인
  getStatus() {
    return {
      isRunning: this.isRunning,
      serverProcess: this.serverProcess ? 'running' : 'stopped',
      errorHandler: this.errorHandler.getStatusReport()
    };
  }
}

// 메인 실행
async function main() {
  const monitor = new EnhancedErrorMonitor();
  
  try {
    await monitor.startServer();
  } catch (error) {
    console.error('❌ 모니터링 시작 실패:', error.message);
    process.exit(1);
  }
}

// 직접 실행 시
if (require.main === module) {
  main();
}

module.exports = { EnhancedErrorMonitor }; 