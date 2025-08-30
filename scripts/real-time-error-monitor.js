const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class RealTimeErrorMonitor {
  constructor() {
    this.browser = null;
    this.page = null;
    this.errorLog = [];
    this.isMonitoring = false;
  }

  async start() {
    console.log('🔍 실시간 오류 모니터링 시작...');
    
    try {
      this.browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
      });
      
      this.page = await this.browser.newPage();
      
      // 콘솔 오류 감지
      this.page.on('console', msg => {
        if (msg.type() === 'error') {
          this.handleError('Console Error', msg.text());
        }
      });
      
      // 페이지 오류 감지
      this.page.on('pageerror', error => {
        this.handleError('Page Error', error.message);
      });
      
      // 네트워크 오류 감지
      this.page.on('response', response => {
        if (!response.ok()) {
          this.handleError('Network Error', `${response.status()} ${response.url()}`);
        }
      });
      
      await this.page.goto('http://localhost:4900/admin', { waitUntil: 'networkidle0' });
      
      // 실시간 DOM 모니터링
      await this.startDOMMonitoring();
      
    } catch (error) {
      console.error('❌ 모니터링 시작 실패:', error.message);
      await this.autoFix();
    }
  }

  async startDOMMonitoring() {
    this.isMonitoring = true;
    
    while (this.isMonitoring) {
      try {
        // Prisma 상태 확인
        const prismaStatus = await this.checkPrismaStatus();
        if (prismaStatus.hasError) {
          await this.handlePrismaError(prismaStatus.error);
        }
        
        // API 응답 확인
        const apiStatus = await this.checkAPIStatus();
        if (apiStatus.hasError) {
          await this.handleAPIError(apiStatus.error);
        }
        
        // 페이지 로딩 상태 확인
        const pageStatus = await this.checkPageStatus();
        if (pageStatus.hasError) {
          await this.handlePageError(pageStatus.error);
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2초마다 체크
        
      } catch (error) {
        console.error('❌ 모니터링 중 오류:', error.message);
        await this.autoFix();
      }
    }
  }

  async checkPrismaStatus() {
    try {
      const response = await this.page.evaluate(async () => {
        const res = await fetch('/api/admin/prisma-status');
        return await res.json();
      });
      
      if (response.data?.client?.connectionStatus === 'disconnected') {
        return { hasError: true, error: 'Prisma 연결 안됨' };
      }
      
      return { hasError: false };
    } catch (error) {
      return { hasError: true, error: error.message };
    }
  }

  async checkAPIStatus() {
    try {
      const apis = [
        '/api/admin/reservations',
        '/api/admin/packages',
        '/api/admin/stats'
      ];
      
      for (const api of apis) {
        const response = await this.page.evaluate(async (url) => {
          const res = await fetch(url);
          return { status: res.status, url };
        }, api);
        
        if (response.status !== 200) {
          return { hasError: true, error: `${api} API 오류: ${response.status}` };
        }
      }
      
      return { hasError: false };
    } catch (error) {
      return { hasError: true, error: error.message };
    }
  }

  async checkPageStatus() {
    try {
      const errorElements = await this.page.$$eval('[class*="error"], [class*="Error"], .error, .Error', elements => {
        return elements.map(el => el.textContent).filter(text => text && text.trim());
      });
      
      if (errorElements.length > 0) {
        return { hasError: true, error: errorElements.join(', ') };
      }
      
      return { hasError: false };
    } catch (error) {
      return { hasError: true, error: error.message };
    }
  }

  async handlePrismaError(error) {
    console.log('🔧 Prisma 오류 감지, 자동 수정 중...');
    
    try {
      // Prisma 클라이언트 재생성
      const { execSync } = require('child_process');
      execSync('npx prisma generate', { stdio: 'inherit' });
      
      // 서버 재시작
      execSync('taskkill /F /IM node.exe', { stdio: 'inherit' });
      execSync('npm run dev', { stdio: 'inherit', detached: true });
      
      console.log('✅ Prisma 오류 자동 수정 완료');
      
    } catch (fixError) {
      console.error('❌ Prisma 오류 수정 실패:', fixError.message);
    }
  }

  async handleAPIError(error) {
    console.log('🔧 API 오류 감지, 자동 수정 중...');
    
    try {
      // API 캐시 클리어
      await this.page.evaluate(() => {
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
          });
        }
      });
      
      // 페이지 새로고침
      await this.page.reload({ waitUntil: 'networkidle0' });
      
      console.log('✅ API 오류 자동 수정 완료');
      
    } catch (fixError) {
      console.error('❌ API 오류 수정 실패:', fixError.message);
    }
  }

  async handlePageError(error) {
    console.log('🔧 페이지 오류 감지, 자동 수정 중...');
    
    try {
      // 페이지 새로고침
      await this.page.reload({ waitUntil: 'networkidle0' });
      
      console.log('✅ 페이지 오류 자동 수정 완료');
      
    } catch (fixError) {
      console.error('❌ 페이지 오류 수정 실패:', fixError.message);
    }
  }

  async handleError(type, message) {
    const timestamp = new Date().toISOString();
    const errorInfo = { type, message, timestamp };
    
    this.errorLog.push(errorInfo);
    console.log(`🚨 ${type}: ${message}`);
    
    // 오류 로그 저장
    this.saveErrorLog();
    
    // 자동 수정 시도
    await this.autoFix();
  }

  async autoFix() {
    console.log('🔧 자동 수정 시도 중...');
    
    try {
      // 서버 상태 확인
      const serverStatus = await this.checkServerStatus();
      if (!serverStatus.isRunning) {
        await this.restartServer();
      }
      
      // 데이터베이스 연결 확인
      const dbStatus = await this.checkDatabaseStatus();
      if (!dbStatus.isConnected) {
        await this.fixDatabaseConnection();
      }
      
    } catch (error) {
      console.error('❌ 자동 수정 실패:', error.message);
    }
  }

  async checkServerStatus() {
    try {
      const response = await fetch('http://localhost:4900/api/health');
      return { isRunning: response.ok };
    } catch (error) {
      return { isRunning: false };
    }
  }

  async checkDatabaseStatus() {
    try {
      const response = await fetch('http://localhost:4900/api/health/db');
      const data = await response.json();
      return { isConnected: data.status === 'connected' };
    } catch (error) {
      return { isConnected: false };
    }
  }

  async restartServer() {
    console.log('🔄 서버 재시작 중...');
    
    try {
      const { execSync } = require('child_process');
      execSync('taskkill /F /IM node.exe', { stdio: 'inherit' });
      execSync('npm run dev', { stdio: 'inherit', detached: true });
      
      // 서버 시작 대기
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      console.log('✅ 서버 재시작 완료');
      
    } catch (error) {
      console.error('❌ 서버 재시작 실패:', error.message);
    }
  }

  async fixDatabaseConnection() {
    console.log('🔧 데이터베이스 연결 수정 중...');
    
    try {
      const { execSync } = require('child_process');
      execSync('npx prisma db push', { stdio: 'inherit' });
      execSync('npx prisma generate', { stdio: 'inherit' });
      
      console.log('✅ 데이터베이스 연결 수정 완료');
      
    } catch (error) {
      console.error('❌ 데이터베이스 연결 수정 실패:', error.message);
    }
  }

  saveErrorLog() {
    const logPath = path.join(__dirname, '../logs/real-time-errors.json');
    fs.writeFileSync(logPath, JSON.stringify(this.errorLog, null, 2));
  }

  async stop() {
    this.isMonitoring = false;
    if (this.browser) {
      await this.browser.close();
    }
    console.log('🛑 실시간 오류 모니터링 종료');
  }
}

// 스크립트 실행
if (require.main === module) {
  const monitor = new RealTimeErrorMonitor();
  
  process.on('SIGINT', async () => {
    await monitor.stop();
    process.exit(0);
  });
  
  monitor.start().catch(console.error);
}

module.exports = RealTimeErrorMonitor;
