const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 DB 연결 자동 수정 시작...\n');

// 1. 환경변수 설정
console.log('1️⃣ 환경변수 설정:');
try {
  process.env.DATABASE_URL = "postgresql://postgres:qhraksgdl07@localhost:5432/rsvshop?schema=public";
  process.env.PGPASSWORD = "qhraksgdl07";
  console.log('✅ 환경변수 설정 완료');
} catch (error) {
  console.log('❌ 환경변수 설정 실패:', error.message);
}

// 2. PostgreSQL 서비스 재시작
console.log('\n2️⃣ PostgreSQL 서비스 재시작:');
try {
  execSync('Start-Process powershell -Verb RunAs -ArgumentList "-Command", "Restart-Service postgresql-x64-17"', { stdio: 'inherit' });
  console.log('✅ PostgreSQL 서비스 재시작 완료');
} catch (error) {
  console.log('⚠️ PostgreSQL 서비스 재시작 실패 (관리자 권한 필요):', error.message);
}

// 3. Prisma 클라이언트 재생성
console.log('\n3️⃣ Prisma 클라이언트 재생성:');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma 클라이언트 재생성 완료');
} catch (error) {
  console.log('❌ Prisma 클라이언트 재생성 실패:', error.message);
}

// 4. DB 연결 테스트
console.log('\n4️⃣ DB 연결 테스트:');
try {
  const testResult = execSync('psql -h localhost -U postgres -d rsvshop -c "SELECT 1;"', { 
    encoding: 'utf8',
    env: { ...process.env, PGPASSWORD: 'qhraksgdl07' }
  });
  console.log('✅ DB 연결 테스트 성공');
  console.log('📊 결과:', testResult.trim());
} catch (error) {
  console.log('❌ DB 연결 테스트 실패:', error.message);
}

// 5. 서버 재시작 안내
console.log('\n5️⃣ 서버 재시작:');
console.log('🔄 서버를 재시작하세요:');
console.log('   npm run dev');

console.log('\n🎯 수정 완료!');
console.log('\n📋 다음 단계:');
console.log('1. 서버 재시작');
console.log('2. http://localhost:3900/api/health/db 테스트');
console.log('3. DB 상태 배너 확인'); 