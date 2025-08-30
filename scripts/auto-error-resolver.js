const { spawn, exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const fs = require('fs');
const path = require('path');

const PORT = 4900;
const HEALTH_CHECK_INTERVAL = 10000; // 10초

// 오류 타입별 해결 방법
const errorResolvers = {
  // 포트 충돌 해결
  async resolvePortConflict() {
    console.log('[자동해결] 포트 충돌 해결 중...');
    try {
      const { stdout } = await execAsync(`netstat -ano | findstr :${PORT}`);
      if (stdout.trim()) {
        const lines = stdout.trim().split('\n');
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 5 && parts[3] === 'LISTENING') {
            const pid = parts[4];
            console.log(`[자동해결] PID ${pid} 종료 중...`);
            await execAsync(`taskkill /f /pid ${pid}`);
          }
        }
      }
      console.log('[자동해결] 포트 충돌 해결 완료');
      return true;
    } catch (error) {
      console.log('[자동해결] 포트 충돌 해결 실패:', error.message);
      return false;
    }
  },

  // 의존성 문제 해결
  async resolveDependencyIssues() {
    console.log('[자동해결] 의존성 문제 해결 중...');
    try {
      // node_modules 삭제 후 재설치
      if (fs.existsSync('node_modules')) {
        console.log('[자동해결] node_modules 삭제 중...');
        await execAsync('rmdir /s /q node_modules');
      }
      
      // package-lock.json 삭제
      if (fs.existsSync('package-lock.json')) {
        console.log('[자동해결] package-lock.json 삭제 중...');
        fs.unlinkSync('package-lock.json');
      }
      
      // 의존성 재설치
      console.log('[자동해결] 의존성 재설치 중...');
      await execAsync('npm install');
      
      console.log('[자동해결] 의존성 문제 해결 완료');
      return true;
    } catch (error) {
      console.log('[자동해결] 의존성 문제 해결 실패:', error.message);
      return false;
    }
  },

  // Prisma 문제 해결
  async resolvePrismaIssues() {
    console.log('[자동해결] Prisma 문제 해결 중...');
    try {
      // Prisma 클라이언트 재생성
      console.log('[자동해결] Prisma 클라이언트 재생성 중...');
      await execAsync('npx prisma generate');
      
      // DB 마이그레이션
      console.log('[자동해결] DB 마이그레이션 중...');
      await execAsync('npx prisma db push');
      
      // 스키마 검증 및 수정
      console.log('[자동해결] 스키마 검증 중...');
      await this.validateAndFixSchema();
      
      console.log('[자동해결] Prisma 문제 해결 완료');
      return true;
    } catch (error) {
      console.log('[자동해결] Prisma 문제 해결 실패:', error.message);
      return false;
    }
  },

  // 스키마 검증 및 수정
  async validateAndFixSchema() {
    try {
      const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
      let schemaContent = fs.readFileSync(schemaPath, 'utf8');
      
      // Room 모델에 isActive 필드 추가 (없는 경우)
      if (!schemaContent.includes('isActive')) {
        console.log('[자동해결] Room 모델에 isActive 필드 추가 중...');
        schemaContent = schemaContent.replace(
          /model Room \{([^}]+)\}/,
          `model Room {
  id          String      @id @default(uuid())
  name        String
  description String
  imageUrl    String?
  capacity    Int
  isActive    Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  bookings    Booking[]
  inventory   Inventory[]
  packages    Package[]
}`
        );
        fs.writeFileSync(schemaPath, schemaContent);
        console.log('[자동해결] Room 모델 수정 완료');
      }
      
      // Package 모델에 isActive 필드 추가 (없는 경우)
      if (!schemaContent.includes('isActive.*Boolean')) {
        console.log('[자동해결] Package 모델에 isActive 필드 추가 중...');
        schemaContent = schemaContent.replace(
          /model Package \{([^}]+)\}/,
          `model Package {
  id          String        @id @default(uuid())
  name        String
  description String
  price       Float
  roomId      String
  isActive    Boolean       @default(true)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  bookings    BookingItem[]
  inventory   Inventory[]
  room        Room          @relation(fields: [roomId], references: [id], onDelete: Cascade)
}`
        );
        fs.writeFileSync(schemaPath, schemaContent);
        console.log('[자동해결] Package 모델 수정 완료');
      }
      
      // 스키마 변경 후 재생성
      await execAsync('npx prisma generate');
      await execAsync('npx prisma db push');
      
    } catch (error) {
      console.log('[자동해결] 스키마 검증 실패:', error.message);
    }
  },

  // 캐시 문제 해결
  async resolveCacheIssues() {
    console.log('[자동해결] 캐시 문제 해결 중...');
    try {
      // Next.js 캐시 삭제
      if (fs.existsSync('.next')) {
        console.log('[자동해결] .next 캐시 삭제 중...');
        await execAsync('rmdir /s /q .next');
      }
      
      // npm 캐시 정리
      console.log('[자동해결] npm 캐시 정리 중...');
      await execAsync('npm cache clean --force');
      
      console.log('[자동해결] 캐시 문제 해결 완료');
      return true;
    } catch (error) {
      console.log('[자동해결] 캐시 문제 해결 실패:', error.message);
      return false;
    }
  },

  // 환경 변수 문제 해결
  async resolveEnvIssues() {
    console.log('[자동해결] 환경 변수 문제 해결 중...');
    try {
      // .env 파일 확인 및 생성
      if (!fs.existsSync('.env')) {
        console.log('[자동해결] .env 파일 생성 중...');
                 const envContent = `DATABASE_URL="postgresql://postgres:qhraksgdl07@localhost:5432/rsvshop"
 NODE_ENV=development
 PORT=4900`;
        fs.writeFileSync('.env', envContent);
      }
      
      console.log('[자동해결] 환경 변수 문제 해결 완료');
      return true;
    } catch (error) {
      console.log('[자동해결] 환경 변수 문제 해결 실패:', error.message);
      return false;
    }
  }
};

// 서버 상태 확인
async function checkServerHealth() {
  try {
    const response = await fetch(`http://localhost:${PORT}/api/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// API 오류 감지 및 수정
async function detectAndFixApiErrors() {
  try {
    // 통계 API 테스트
    const statsResponse = await fetch(`http://localhost:${PORT}/api/admin/stats`);
    if (!statsResponse.ok) {
      console.log('[자동감지] 통계 API 오류 감지, 수정 시도');
      await errorResolvers.resolvePrismaIssues();
      return false;
    }
    
    // 예약 API 테스트
    const reservationsResponse = await fetch(`http://localhost:${PORT}/api/admin/reservations`);
    if (!reservationsResponse.ok) {
      console.log('[자동감지] 예약 API 오류 감지, 수정 시도');
      await errorResolvers.resolvePrismaIssues();
      return false;
    }
    
    // DB API 테스트
    const dbResponse = await fetch(`http://localhost:${PORT}/api/admin/database`);
    if (!dbResponse.ok) {
      console.log('[자동감지] DB API 오류 감지, 수정 시도');
      await errorResolvers.resolvePrismaIssues();
      return false;
    }
    
    return true;
  } catch (error) {
    console.log('[자동감지] API 오류 감지:', error.message);
    return false;
  }
}

// 서버 상태 모니터링
async function monitorServer(child) {
  let consecutiveFailures = 0;
  const maxConsecutiveFailures = 3;
  
  const healthCheckInterval = setInterval(async () => {
    const isHealthy = await checkServerHealth();
    const isApiHealthy = await detectAndFixApiErrors();
    
    if (!isHealthy || !isApiHealthy) {
      consecutiveFailures++;
      console.log(`[경고] 서버 또는 API 헬스체크 실패 (${consecutiveFailures}/${maxConsecutiveFailures})`);
      
      if (consecutiveFailures >= maxConsecutiveFailures) {
        console.log(`[재시작] 연속 헬스체크 실패로 인한 서버 재시작`);
        clearInterval(healthCheckInterval);
        child.kill('SIGTERM');
      }
    } else {
      consecutiveFailures = 0;
      console.log(`[정상] 서버 및 API 헬스체크 성공`);
    }
  }, HEALTH_CHECK_INTERVAL);
  
  return healthCheckInterval;
}

// 자동 오류 해결 메인 함수
async function autoResolveErrors() {
  console.log('[자동해결] 서버 오류 자동 해결 시작');
  
  // 1. 포트 충돌 해결
  await errorResolvers.resolvePortConflict();
  
  // 2. 환경 변수 문제 해결
  await errorResolvers.resolveEnvIssues();
  
  // 3. 캐시 문제 해결
  await errorResolvers.resolveCacheIssues();
  
  // 4. Prisma 문제 해결
  await errorResolvers.resolvePrismaIssues();
  
  // 5. API 오류 감지 및 수정
  await detectAndFixApiErrors();
  
  // 6. 의존성 문제 해결 (마지막에 실행)
  await errorResolvers.resolveDependencyIssues();
  
  console.log('[자동해결] 모든 오류 해결 시도 완료');
}

// 서버 시작 및 모니터링
async function startServerWithAutoRecovery() {
  console.log('[자동복구] 서버 자동 복구 모드 시작');
  
  let restartCount = 0;
  const maxRestarts = 15;
  
  async function startServer() {
    try {
      console.log(`[자동복구] 서버 시작 시도 ${restartCount + 1}/${maxRestarts}`);
      
      const child = spawn('npx', ['next', 'dev', '-p', PORT], {
        stdio: 'inherit',
        shell: true,
        env: { ...process.env, NODE_ENV: 'development', PORT: PORT.toString() }
      });
      
      // 서버 시작 후 헬스체크
      const healthCheckInterval = await monitorServer(child);
      
      child.on('close', async (code) => {
        console.log(`[자동복구] 서버 종료 (코드: ${code})`);
        
        if (code !== 0 && restartCount < maxRestarts) {
          restartCount++;
          console.log(`[자동복구] 오류 해결 후 재시작 시도 ${restartCount}/${maxRestarts}`);
          
          // 오류 해결 시도
          await autoResolveErrors();
          
          // 5초 후 재시작
          setTimeout(() => {
            startServer();
          }, 5000);
        } else if (restartCount >= maxRestarts) {
          console.log('[자동복구] 최대 재시작 횟수 도달, 수동 개입 필요');
          process.exit(1);
        }
      });
      
      child.on('error', async (err) => {
        console.error('[자동복구] 서버 시작 오류:', err);
        
        if (restartCount < maxRestarts) {
          restartCount++;
          console.log(`[자동복구] 오류 해결 후 재시작 시도 ${restartCount}/${maxRestarts}`);
          
          await autoResolveErrors();
          
          setTimeout(() => {
            startServer();
          }, 5000);
        }
      });
      
      return child;
    } catch (error) {
      console.error('[자동복구] 서버 시작 실패:', error);
      
      if (restartCount < maxRestarts) {
        restartCount++;
        await autoResolveErrors();
        setTimeout(() => {
          startServer();
        }, 5000);
      }
    }
  }
  
  // 프로세스 종료 시그널 처리
  process.on('SIGINT', () => {
    console.log('[자동복구] 사용자 종료 요청');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('[자동복구] 시스템 종료 요청');
    process.exit(0);
  });
  
  await startServer();
}

// 스크립트 실행
if (require.main === module) {
  startServerWithAutoRecovery().catch(console.error);
}

module.exports = { autoResolveErrors, startServerWithAutoRecovery }; 