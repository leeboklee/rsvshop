const { spawn, exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const fs = require('fs');
const path = require('path');
const PORT_CONFIG = require('../config/port-config');

// 오류 타입 정의
const ERROR_TYPES = {
  CLIENT: 'CLIENT',
  SERVER: 'SERVER',
  DATABASE: 'DATABASE',
  NETWORK: 'NETWORK',
  BUILD: 'BUILD'
};

// 오류 처리 클래스
class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.recoveryAttempts = 0;
    this.maxRecoveryAttempts = 5;
  }

  // 오류 로깅
  logError(type, message, details = {}) {
    const error = {
      type,
      message,
      details,
      timestamp: new Date().toISOString(),
      recoveryAttempts: this.recoveryAttempts
    };
    
    this.errorLog.push(error);
    console.log(`[${type}] ${message}`, details);
    
    // 로그 파일에 저장
    this.saveErrorLog();
  }

  // 오류 로그 저장
  saveErrorLog() {
    const logDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logFile = path.join(logDir, `error-log-${Date.now()}.json`);
    fs.writeFileSync(logFile, JSON.stringify(this.errorLog, null, 2));
  }

  // 클라이언트 오류 처리
  async handleClientError(error) {
    this.logError(ERROR_TYPES.CLIENT, '클라이언트 오류 발생', error);
    
    try {
      // 브라우저 새로고침
      await this.refreshBrowser();
      
      // 클라이언트 캐시 정리
      await this.clearClientCache();
      
      console.log('✅ 클라이언트 오류 처리 완료');
    } catch (err) {
      this.logError(ERROR_TYPES.CLIENT, '클라이언트 오류 처리 실패', err);
    }
  }

  // 서버 오류 처리
  async handleServerError(error) {
    this.logError(ERROR_TYPES.SERVER, '서버 오류 발생', error);
    
    try {
      // 서버 재시작
      await this.restartServer();
      
      // 포트 충돌 해결
      await this.resolvePortConflict();
      
      console.log('✅ 서버 오류 처리 완료');
    } catch (err) {
      this.logError(ERROR_TYPES.SERVER, '서버 오류 처리 실패', err);
    }
  }

  // 데이터베이스 오류 처리
  async handleDatabaseError(error) {
    this.logError(ERROR_TYPES.DATABASE, '데이터베이스 오류 발생', error);
    
    try {
      // 데이터베이스 연결 확인
      await this.checkDatabaseConnection();
      
      // Prisma 클라이언트 재생성
      await this.regeneratePrismaClient();
      
      console.log('✅ 데이터베이스 오류 처리 완료');
    } catch (err) {
      this.logError(ERROR_TYPES.DATABASE, '데이터베이스 오류 처리 실패', err);
    }
  }

  // 빌드 오류 처리
  async handleBuildError(error) {
    this.logError(ERROR_TYPES.BUILD, '빌드 오류 발생', error);
    
    try {
      // 캐시 정리
      await this.clearBuildCache();
      
      // 의존성 재설치
      await this.reinstallDependencies();
      
      // 다시 빌드
      await this.rebuild();
      
      console.log('✅ 빌드 오류 처리 완료');
    } catch (err) {
      this.logError(ERROR_TYPES.BUILD, '빌드 오류 처리 실패', err);
    }
  }

  // 브라우저 새로고침
  async refreshBrowser() {
    console.log('🔄 브라우저 새로고침 중...');
    const { refreshBrowser } = require('./refresh-browser');
    await refreshBrowser();
  }

  // 클라이언트 캐시 정리
  async clearClientCache() {
    console.log('🧹 클라이언트 캐시 정리 중...');
    
    // .next 폴더 삭제
    const nextDir = path.join(__dirname, '..', '.next');
    if (fs.existsSync(nextDir)) {
      fs.rmSync(nextDir, { recursive: true, force: true });
    }
    
    // node_modules/.cache 삭제
    const cacheDir = path.join(__dirname, '..', 'node_modules', '.cache');
    if (fs.existsSync(cacheDir)) {
      fs.rmSync(cacheDir, { recursive: true, force: true });
    }
  }

  // 서버 재시작
  async restartServer() {
    console.log('🔄 서버 재시작 중...');
    
    // 현재 서버 프로세스 종료
    await this.killServerProcess();
    
    // 새 서버 시작
    await this.startServer();
  }

  // 포트 충돌 해결
  async resolvePortConflict() {
    console.log('🔧 포트 충돌 해결 중...');
    
    try {
      const { stdout } = await execAsync(`netstat -ano | findstr :${PORT_CONFIG.SERVER_PORT}`);
      if (stdout.trim()) {
        const lines = stdout.trim().split('\n');
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 5 && parts[3] === 'LISTENING') {
            const pid = parts[4];
            await execAsync(`taskkill /f /pid ${pid}`);
            console.log(`✅ PID ${pid} 종료 완료`);
          }
        }
      }
    } catch (error) {
      // 포트가 사용되지 않는 경우 무시
    }
  }

  // 서버 프로세스 종료
  async killServerProcess() {
    try {
      const { stdout } = await execAsync(`netstat -ano | findstr :${PORT_CONFIG.SERVER_PORT}`);
      if (stdout.trim()) {
        const lines = stdout.trim().split('\n');
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 5 && parts[3] === 'LISTENING') {
            const pid = parts[4];
            await execAsync(`taskkill /f /pid ${pid}`);
          }
        }
      }
    } catch (error) {
      // 프로세스가 없는 경우 무시
    }
  }

  // 서버 시작
  async startServer() {
    return new Promise((resolve, reject) => {
      const server = spawn('node', ['scripts/enhanced-error-monitor.js'], {
        stdio: 'inherit',
        env: { ...process.env, PORT: PORT_CONFIG.SERVER_PORT }
      });
      
      server.on('error', reject);
      server.on('close', resolve);
      
      // 10초 후 타임아웃
      setTimeout(() => {
        server.kill();
        resolve();
      }, 10000);
    });
  }

  // 데이터베이스 연결 확인
  async checkDatabaseConnection() {
    console.log('🔍 데이터베이스 연결 확인 중...');
    
    try {
      await execAsync('npx prisma db push --accept-data-loss');
      console.log('✅ 데이터베이스 연결 성공');
    } catch (error) {
      console.log('❌ 데이터베이스 연결 실패:', error.message);
      throw error;
    }
  }

  // Prisma 클라이언트 재생성
  async regeneratePrismaClient() {
    console.log('🔄 Prisma 클라이언트 재생성 중...');
    
    try {
      await execAsync('npx prisma generate');
      console.log('✅ Prisma 클라이언트 재생성 완료');
    } catch (error) {
      console.log('❌ Prisma 클라이언트 재생성 실패:', error.message);
      throw error;
    }
  }

  // 빌드 캐시 정리
  async clearBuildCache() {
    console.log('🧹 빌드 캐시 정리 중...');
    
    try {
      await execAsync('npm run clean');
      console.log('✅ 빌드 캐시 정리 완료');
    } catch (error) {
      console.log('❌ 빌드 캐시 정리 실패:', error.message);
    }
  }

  // 의존성 재설치
  async reinstallDependencies() {
    console.log('📦 의존성 재설치 중...');
    
    try {
      await execAsync('npm install');
      console.log('✅ 의존성 재설치 완료');
    } catch (error) {
      console.log('❌ 의존성 재설치 실패:', error.message);
      throw error;
    }
  }

  // 다시 빌드
  async rebuild() {
    console.log('🔨 프로젝트 다시 빌드 중...');
    
    try {
      await execAsync('npm run build');
      console.log('✅ 빌드 완료');
    } catch (error) {
      console.log('❌ 빌드 실패:', error.message);
      throw error;
    }
  }

  // 종합 오류 처리
  async handleError(error, type = ERROR_TYPES.SERVER) {
    this.recoveryAttempts++;
    
    if (this.recoveryAttempts > this.maxRecoveryAttempts) {
      console.log('❌ 최대 복구 시도 횟수 초과');
      return false;
    }
    
    console.log(`🔄 오류 복구 시도 ${this.recoveryAttempts}/${this.maxRecoveryAttempts}`);
    
    switch (type) {
      case ERROR_TYPES.CLIENT:
        await this.handleClientError(error);
        break;
      case ERROR_TYPES.SERVER:
        await this.handleServerError(error);
        break;
      case ERROR_TYPES.DATABASE:
        await this.handleDatabaseError(error);
        break;
      case ERROR_TYPES.BUILD:
        await this.handleBuildError(error);
        break;
      default:
        await this.handleServerError(error);
    }
    
    return true;
  }

  // 헬스체크
  async healthCheck() {
    try {
      const response = await fetch(PORT_CONFIG.getApiUrl('/health'));
      // 200 응답만 정상으로 처리
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  // 상태 리포트
  getStatusReport() {
    return {
      errorCount: this.errorLog.length,
      recoveryAttempts: this.recoveryAttempts,
      lastError: this.errorLog[this.errorLog.length - 1],
      isHealthy: this.recoveryAttempts < this.maxRecoveryAttempts
    };
  }
}

module.exports = { ErrorHandler, ERROR_TYPES }; 