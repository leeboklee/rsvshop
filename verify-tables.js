const { PrismaClient } = require('@prisma/client');

async function verifyTables() {
  console.log('🔍 테이블 존재 여부 확인...');
  
  const prisma = new PrismaClient();
  
  try {
    // 1. 연결 정보 확인
    console.log('\n🔗 연결 정보:');
    const dbUrl = process.env.DATABASE_URL;
    console.log(`- DATABASE_URL: ${dbUrl ? '설정됨' : '설정되지 않음'}`);
    
    if (dbUrl) {
      const isNeon = dbUrl.includes('neon.tech');
      const isLocal = dbUrl.includes('localhost');
      console.log(`- 데이터베이스 타입: ${isNeon ? 'Neon DB' : isLocal ? '로컬 DB' : '기타'}`);
      
      if (isNeon) {
        const urlParts = dbUrl.split('@');
        if (urlParts.length > 1) {
          const hostPart = urlParts[1].split('/')[0];
          console.log(`- 호스트: ${hostPart}`);
        }
      }
    }
    
    // 2. 테이블 개수 확인
    console.log('\n📊 테이블 현황:');
    const tableCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log(`- 총 테이블 수: ${tableCount[0].count}개`);
    
    // 3. 테이블 목록 확인
    console.log('\n📋 테이블 목록:');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    tables.forEach((table, index) => {
      console.log(`  ${index + 1}. ${table.table_name}`);
    });
    
    // 4. 샘플 데이터 확인
    console.log('\n🔍 샘플 데이터:');
    try {
      const sampleBooking = await prisma.booking.findFirst();
      console.log(`- Booking 테이블: ${sampleBooking ? '데이터 있음' : '데이터 없음'}`);
      if (sampleBooking) {
        console.log(`  - 첫 번째 예약 ID: ${sampleBooking.id}`);
      }
    } catch (error) {
      console.log(`- Booking 테이블: 접근 불가 - ${error.message}`);
    }
    
    return {
      success: true,
      tableCount: tableCount[0].count,
      tables: tables.map(t => t.table_name)
    };
    
  } catch (error) {
    console.error('❌ 확인 실패:', error.message);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

verifyTables().then(result => {
  console.log('\n🎯 결과:', result.success ? '✅ 성공' : '❌ 실패');
  if (result.success) {
    console.log(`📊 테이블 개수: ${result.tableCount}개`);
    console.log(`📋 테이블 목록: ${result.tables.join(', ')}`);
  }
  process.exit(result.success ? 0 : 1);
}).catch(error => {
  console.error('💥 실행 오류:', error);
  process.exit(1);
});
