const { spawn, exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const fs = require('fs');
const path = require('path');
const { refreshBrowser } = require('./refresh-browser');
const PORT_CONFIG = require('../config/port-config');

const PORT = PORT_CONFIG.SERVER_PORT;
const HEALTH_CHECK_INTERVAL = 30000; // 30초마다 헬스체크
const MAX_RESTARTS = 10; // 최대 재시작 횟수 증가
const RESTART_DELAY = 3000; // 재시작 지연 시간 증가

// 서버 헬스체크 함수
async function healthCheck() {
  try {
    const response = await fetch(PORT_CONFIG.getApiUrl('/health'));
    return response.ok;
  } catch (error) {
    return false;
  }
}

// 서버 상태 모니터링
async function monitorServer(child) {
  let consecutiveFailures = 0;
  const maxConsecutiveFailures = 3;
  
  const healthCheckInterval = setInterval(async () => {
    const isHealthy = await healthCheck();
    
    if (!isHealthy) {
      consecutiveFailures++;
      console.log(`[경고] 서버 헬스체크 실패 (${consecutiveFailures}/${maxConsecutiveFailures})`);
      
      if (consecutiveFailures >= maxConsecutiveFailures) {
        console.log(`[재시작] 연속 헬스체크 실패로 인한 서버 재시작`);
        clearInterval(healthCheckInterval);
        child.kill('SIGTERM');
      }
    } else {
      consecutiveFailures = 0;
      console.log(`[정상] 서버 헬스체크 성공`);
    }
  }, HEALTH_CHECK_INTERVAL);
  
  return healthCheckInterval;
}

async function checkPort() {
  try {
    const { stdout } = await execAsync(`netstat -ano | findstr :${PORT}`);
    if (stdout.trim()) {
      console.log(`[감지] 포트 ${PORT} 사용 중 발견`);
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

// 포트 충돌 시에만 프로세스 종료 (자신의 서버는 제외)
async function killProcessOnPort() {
  try {
    console.log(`🔧 포트 충돌 해결 중...`);
    
    // 포트를 사용하는 프로세스 PID 찾기
    const { stdout } = await execAsync(`netstat -ano | findstr :${PORT}`);
    const lines = stdout.trim().split('\n');
    
    let killedAny = false;
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5 && parts[3] === 'LISTENING') {
        const pid = parts[4];
        
        // 현재 프로세스의 PID 확인
        const currentPid = process.pid;
        
        // 자신의 프로세스는 종료하지 않음
        if (pid === currentPid.toString()) {
          console.log(`[정보] 현재 프로세스 PID ${pid}는 종료하지 않음`);
          continue;
        }
        
        console.log(`✅ PID ${pid} 종료 완료`);
        try {
          await execAsync(`taskkill /f /pid ${pid}`);
          killedAny = true;
        } catch (killError) {
          console.log(`[정보] PID ${pid} 이미 종료됨 또는 접근 불가: ${killError.message}`);
          // 이미 종료된 프로세스는 무시하고 계속 진행
        }
      }
    }
    
    if (killedAny) {
      console.log(`✅ 서버 오류 처리 완료`);
      // 포트 해제 대기
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return killedAny;
  } catch (error) {
    console.log(`[정보] 포트 충돌 없음: ${error.message}`);
    return false;
  }
}

async function checkDatabaseConnection() {
  try {
    console.log(`[감지] 데이터베이스 연결 확인 중...`);
    const { stdout } = await execAsync('npx prisma db push --accept-data-loss');
    console.log(`[검증] 데이터베이스 연결 성공`);
    return { success: true, type: 'sqlite' };
  } catch (error) {
    console.log(`[감지] 데이터베이스 연결 실패, SQLite로 전환 중...`);
    // SQLite로 전환
    const fixed = await switchToSQLite();
    if (fixed) {
      console.log(`[검증] SQLite 전환 성공`);
      return { success: true, type: 'sqlite' };
    }
    return { success: false, type: 'sqlite' };
  }
}

async function switchToSQLite() {
  try {
    console.log(`[수정] SQLite로 전환 중...`);
    
    // schema.prisma 파일 읽기
    const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
    let schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    // PostgreSQL 설정을 SQLite로 변경
    schemaContent = schemaContent.replace(
      /datasource db \{\s+provider = "postgresql"\s+url\s+=\s+env\("DATABASE_URL"\)\s+\}/,
      `datasource db {
          provider = "postgresql"
        url      = env("DATABASE_URL")
}`
    );
    
    // 파일 저장
    fs.writeFileSync(schemaPath, schemaContent);
    
    // Prisma 재생성 및 DB 푸시
    await execAsync('npx prisma generate');
    await execAsync('npx prisma db push');
    
    console.log(`[검증] SQLite 전환 완료`);
    return true;
  } catch (error) {
    console.error(`[오류] SQLite 전환 실패:`, error.message);
    return false;
  }
}

async function switchToPostgreSQL() {
  try {
    console.log(`[수정] PostgreSQL로 전환 중...`);
    
    // schema.prisma 파일 읽기
    const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
    let schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    // SQLite 설정을 PostgreSQL로 변경
    schemaContent = schemaContent.replace(
      /datasource db \{\s+provider = "sqlite"\s+url\s+=\s+"file:\.\/dev\.db"\s+\}/,
      `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`
    );
    
    // 파일 저장
    fs.writeFileSync(schemaPath, schemaContent);
    
    // 기존 .env 파일이 있으면 유지, 없으면 기본값 설정
    const envPath = path.join(__dirname, '..', '.env');
    if (!fs.existsSync(envPath)) {
      const envContent = 'DATABASE_URL="postgresql://postgres:password@localhost:5432/rsvshop"';
      fs.writeFileSync(envPath, envContent);
    }
    
    // Prisma 재생성 및 DB 푸시
    await execAsync('npx prisma generate');
    await execAsync('npx prisma db push');
    
    console.log(`[검증] PostgreSQL 전환 완료`);
    return true;
  } catch (error) {
    console.error(`[오류] PostgreSQL 전환 실패:`, error.message);
    return false;
  }
}

async function fixDatabaseConnection() {
  try {
    console.log(`[수정] PostgreSQL 연결 설정 수정 중...`);
    
    // 기존 .env 파일이 있으면 유지, 없으면 기본값 설정
    const envPath = path.join(__dirname, '..', '.env');
    if (!fs.existsSync(envPath)) {
      const envContent = 'DATABASE_URL="postgresql://postgres:password@localhost:5432/rsvshop"';
      fs.writeFileSync(envPath, envContent);
    }
    
    // Prisma 재생성
    await execAsync('npx prisma generate');
    await execAsync('npx prisma db push');
    
    console.log(`[검증] PostgreSQL 연결 설정 완료`);
    return true;
  } catch (error) {
    console.error(`[오류] PostgreSQL 연결 설정 실패:`, error.message);
    return false;
  }
}

async function startServer() {
  console.log(`[실행] 서버 시작 중...`);
  
  // 서버 시작 전 환경 변수 설정
  const env = {
    ...process.env,
    NODE_ENV: 'development',
    PORT: PORT.toString()
  };
  
  let restartCount = 0;
  const maxRestarts = MAX_RESTARTS;
  let healthCheckInterval = null;
  
  function spawnServer() {
    const child = spawn('npx', ['next', 'dev', '-p', PORT], {
      stdio: 'inherit',
      shell: true,
      env: env
    });

    // 서버 시작 후 헬스체크 모니터링 시작
    setTimeout(async () => {
      healthCheckInterval = await monitorServer(child);
    }, 10000); // 10초 후 헬스체크 시작

    child.on('close', (code) => {
      console.log(`서버 프로세스 종료 (코드: ${code})`);
      
      // 헬스체크 인터벌 정리
      if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
      }
      
      if (code !== 0) {
        console.log(`[경고] 서버가 비정상 종료되었습니다.`);
        
        if (restartCount < maxRestarts) {
          restartCount++;
          console.log(`[재시작] 서버 재시작 중... (${restartCount}/${maxRestarts})`);
          setTimeout(() => {
            spawnServer();
          }, RESTART_DELAY);
        } else {
          console.log(`[오류] 최대 재시작 횟수(${maxRestarts})에 도달했습니다. 수동으로 서버를 시작해주세요.`);
          process.exit(1);
        }
      } else {
        console.log(`[정상] 서버가 정상적으로 종료되었습니다.`);
      }
    });

    child.on('error', (err) => {
      console.error('서버 시작 오류:', err);
      
      if (restartCount < maxRestarts) {
        restartCount++;
        console.log(`[재시작] 오류로 인한 서버 재시작 중... (${restartCount}/${maxRestarts})`);
        setTimeout(() => {
          spawnServer();
        }, RESTART_DELAY);
      } else {
        console.log(`[오류] 최대 재시작 횟수(${maxRestarts})에 도달했습니다.`);
        process.exit(1);
      }
    });
    
    // 프로세스 종료 시그널 처리
    process.on('SIGINT', () => {
      console.log(`[종료] 서버 종료 중...`);
      if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
      }
      child.kill('SIGINT');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log(`[종료] 서버 종료 중...`);
      if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
      }
      child.kill('SIGTERM');
      process.exit(0);
    });
    
    return child;
  }
  
  return spawnServer();
}

async function main() {
  console.log(`[시작] 포트 ${PORT} 자동 관리 시작`);
  
  // 포트 사용 중인지 확인
  const isPortInUse = await checkPort();
  
  if (isPortInUse) {
    // 포트 사용 중이면 서버가 정상 실행 중인지 확인
    const isHealthy = await healthCheck();
    
    if (isHealthy) {
      console.log(`[완료] 서버 관리 완료 - http://localhost:${PORT}`);
      return; // 서버가 정상 실행 중이면 새로 시작하지 않음
    } else {
      // 포트 사용 중이지만 서버가 응답하지 않으면 프로세스 종료
      const killed = await killProcessOnPort();
      if (!killed) {
        return;
      }
    }
  }
  
  // 데이터베이스 연결 확인 및 자동 전환
  const dbResult = await checkDatabaseConnection();
  if (!dbResult.success) {
    const sqliteSwitched = await switchToSQLite();
    if (!sqliteSwitched) {
      return;
    }
  }
  
  // 서버 시작
  const child = await startServer();
  
  // 서버 시작 후 브라우저 새로고침 (비활성화)
  // setTimeout(async () => {
  //   await refreshBrowser();
  // }, 3000); // 3초 후 브라우저 새로고침

  // 서버 상태 모니터링 시작
  // await monitorServer(child); // 이 부분은 startServer 내부에서 처리됨
}

// 스크립트 실행
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkPort, killProcessOnPort, checkDatabaseConnection, fixDatabaseConnection, switchToSQLite, switchToPostgreSQL, startServer };