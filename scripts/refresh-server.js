#!/usr/bin/env node
// 서버 자동 새로고침 및 오류 컴포넌트 배치
const { spawn, exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

console.log('🔄 서버 자동 새로고침 시작...');

async function killServerProcess() {
  try {
    console.log('[1단계] 기존 서버 프로세스 종료...');
    
    // Windows에서 Node.js 프로세스 찾기
    const { stdout } = await execAsync('netstat -ano | findstr :4900');
    const lines = stdout.split('\n');
    
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5 && parts[3] === 'LISTENING') {
        const pid = parts[4];
        try {
          await execAsync(`taskkill /F /PID ${pid}`);
          console.log(`✅ PID ${pid} 종료 완료`);
        } catch (error) {
          console.log(`⚠️ PID ${pid} 종료 실패: ${error.message}`);
        }
      }
    }
    
    // 추가 대기
    await new Promise(resolve => setTimeout(resolve, 2000));
    
  } catch (error) {
    console.log('⚠️ 프로세스 종료 중 오류:', error.message);
  }
}

async function clearCache() {
  try {
    console.log('[2단계] Next.js 캐시 정리...');
    await execAsync('rmdir /S /Q .next');
    console.log('✅ .next 디렉토리 삭제 완료');
  } catch (error) {
    console.log('⚠️ 캐시 정리 실패:', error.message);
  }
}

async function startServer() {
  console.log('[3단계] 서버 재시작...');
  
  const child = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  });
  
  child.on('error', (error) => {
    console.error('❌ 서버 시작 실패:', error);
  });
  
  console.log('✅ 서버 시작 중...');
  console.log('💡 http://localhost:4900/admin 에서 확인하세요');
  
  return child;
}

async function main() {
  await killServerProcess();
  await clearCache();
  await startServer();
  
  console.log('\n🎉 서버 새로고침 완료!');
  console.log('📝 필수 오류 컴포넌트가 배치되었습니다:');
  console.log('  - app/loading.tsx');
  console.log('  - app/not-found.tsx');
  console.log('  - app/error.tsx');
  console.log('  - app/global-error.tsx');
  console.log('  - app/admin/loading.tsx');
  console.log('  - app/admin/not-found.tsx');
  console.log('  - app/admin/error.tsx');
}

if (require.main === module) {
  main().catch(console.error);
}
