const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 최종 DB 연결 해결 시작...\n');

// 1. .env 파일 재생성
console.log('1️⃣ .env 파일 재생성:');
try {
  const envContent = 'DATABASE_URL="postgresql://postgres:qhraksgdl07@localhost:5432/rsvshop?schema=public"';
  fs.writeFileSync('.env', envContent);
  console.log('✅ .env 파일 재생성 완료');
} catch (error) {
  console.log('❌ .env 파일 재생성 실패:', error.message);
}

// 2. 환경변수 설정
console.log('\n2️⃣ 환경변수 설정:');
try {
  process.env.DATABASE_URL = "postgresql://postgres:qhraksgdl07@localhost:5432/rsvshop?schema=public";
  process.env.PGPASSWORD = "qhraksgdl07";
  console.log('✅ 환경변수 설정 완료');
} catch (error) {
  console.log('❌ 환경변수 설정 실패:', error.message);
}

// 3. .next 캐시 삭제
console.log('\n3️⃣ .next 캐시 삭제:');
try {
  if (fs.existsSync('.next')) {
    fs.rmSync('.next', { recursive: true, force: true });
    console.log('✅ .next 캐시 삭제 완료');
  } else {
    console.log('ℹ️ .next 폴더 없음');
  }
} catch (error) {
  console.log('❌ .next 캐시 삭제 실패:', error.message);
}

// 4. Prisma 클라이언트 재생성
console.log('\n4️⃣ Prisma 클라이언트 재생성:');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma 클라이언트 재생성 완료');
} catch (error) {
  console.log('❌ Prisma 클라이언트 재생성 실패:', error.message);
}

// 5. DB 연결 테스트
console.log('\n5️⃣ DB 연결 테스트:');
try {
  const testResult = execSync('psql -h localhost -U postgres -d rsvshop -c "SELECT COUNT(*) FROM \\"Room\\";"', { 
    encoding: 'utf8',
    env: { ...process.env, PGPASSWORD: 'qhraksgdl07' }
  });
  console.log('✅ DB 연결 테스트 성공');
  console.log('📊 결과:', testResult.trim());
} catch (error) {
  console.log('❌ DB 연결 테스트 실패:', error.message);
}

// 6. 서버 재시작
console.log('\n6️⃣ 서버 재시작:');
try {
  execSync('taskkill /f /im node.exe', { stdio: 'ignore' });
  console.log('✅ 기존 서버 종료');
  
  console.log('🔄 서버 시작 중...');
  execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
  console.log('⚠️ 서버 재시작 실패:', error.message);
  console.log('🔄 수동으로 서버를 시작하세요: npm run dev');
}

console.log('\n🎯 최종 수정 완료!');
console.log('\n📋 확인 사항:');
console.log('1. http://localhost:3900 접속');
console.log('2. DB 상태 배너 확인');
console.log('3. 예약 생성 테스트'); 