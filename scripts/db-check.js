const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 DB 연결 자동 점검 시작...\n');

// 1. .env 파일 확인
console.log('1️⃣ .env 파일 확인:');
try {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('✅ .env 파일 존재');
    console.log('📄 내용:', envContent.trim());
  } else {
    console.log('❌ .env 파일 없음');
  }
} catch (error) {
  console.log('❌ .env 파일 읽기 실패:', error.message);
}

// 2. Prisma 스키마 확인
console.log('\n2️⃣ Prisma 스키마 확인:');
try {
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  console.log('✅ schema.prisma 파일 존재');
  
  const providerMatch = schemaContent.match(/provider\s*=\s*"([^"]+)"/);
  const urlMatch = schemaContent.match(/url\s*=\s*env\("([^"]+)"\)/);
  
  if (providerMatch) {
    console.log('📋 Provider:', providerMatch[1]);
  }
  if (urlMatch) {
    console.log('🔗 URL 환경변수:', urlMatch[1]);
  }
} catch (error) {
  console.log('❌ schema.prisma 읽기 실패:', error.message);
}

// 3. PostgreSQL 서비스 상태 확인
console.log('\n3️⃣ PostgreSQL 서비스 상태:');
try {
  const serviceStatus = execSync('Get-Service postgresql*', { encoding: 'utf8' });
  console.log('✅ PostgreSQL 서비스 상태:');
  console.log(serviceStatus);
} catch (error) {
  console.log('❌ PostgreSQL 서비스 확인 실패:', error.message);
}

// 4. 직접 DB 연결 테스트
console.log('\n4️⃣ 직접 DB 연결 테스트:');
try {
  const testResult = execSync('$env:PGPASSWORD="qhraksgdl07"; psql -h localhost -U postgres -d rsvshop -c "SELECT 1;"', { encoding: 'utf8' });
  console.log('✅ 직접 DB 연결 성공');
  console.log('📊 결과:', testResult.trim());
} catch (error) {
  console.log('❌ 직접 DB 연결 실패:', error.message);
}

// 5. 환경변수 확인
console.log('\n5️⃣ 환경변수 확인:');
try {
  const envVars = execSync('echo $env:DATABASE_URL', { encoding: 'utf8' });
  console.log('🔧 DATABASE_URL:', envVars.trim() || '설정되지 않음');
} catch (error) {
  console.log('❌ 환경변수 확인 실패:', error.message);
}

// 6. Prisma 클라이언트 생성 확인
console.log('\n6️⃣ Prisma 클라이언트 확인:');
try {
  const clientPath = path.join(process.cwd(), 'node_modules', '@prisma', 'client', 'index.js');
  if (fs.existsSync(clientPath)) {
    console.log('✅ Prisma 클라이언트 존재');
  } else {
    console.log('❌ Prisma 클라이언트 없음');
  }
} catch (error) {
  console.log('❌ Prisma 클라이언트 확인 실패:', error.message);
}

console.log('\n🎯 점검 완료!');
console.log('\n💡 해결 방법:');
console.log('1. .env 파일에 DATABASE_URL 설정');
console.log('2. PostgreSQL 서비스 재시작');
console.log('3. npx prisma generate 실행');
console.log('4. 서버 재시작'); 