const fetch = require('node-fetch');
const PORT_CONFIG = require('../config/port-config');

async function simpleTest() {
  console.log('🧪 간단한 API 테스트 시작...\n');
  
  try {
    // 1. 헬스체크
    console.log('1️⃣ 헬스체크 테스트...');
    const healthResponse = await fetch(PORT_CONFIG.getApiUrl('/health'));
    console.log(`   상태: ${healthResponse.status} ${healthResponse.statusText}`);
    
    // 2. 통계 API
    console.log('\n2️⃣ 통계 API 테스트...');
    const statsResponse = await fetch(PORT_CONFIG.getApiUrl('/admin/stats'));
    console.log(`   상태: ${statsResponse.status} ${statsResponse.statusText}`);
    
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log(`   📊 총 예약: ${stats.totalReservations}`);
      console.log(`   📊 총 호텔: ${stats.totalHotels}`);
    }
    
    // 3. 예약 목록 API
    console.log('\n3️⃣ 예약 목록 API 테스트...');
    const reservationsResponse = await fetch(PORT_CONFIG.getApiUrl('/admin/reservations'));
    console.log(`   상태: ${reservationsResponse.status} ${reservationsResponse.statusText}`);
    
    if (reservationsResponse.ok) {
      const reservations = await reservationsResponse.json();
      console.log(`   📅 예약 개수: ${reservations.length}`);
    }
    
    // 4. 쇼핑몰 목록 API
    console.log('\n4️⃣ 쇼핑몰 목록 API 테스트...');
    const mallsResponse = await fetch(PORT_CONFIG.getApiUrl('/admin/shopping-malls'));
    console.log(`   상태: ${mallsResponse.status} ${mallsResponse.statusText}`);
    
    if (mallsResponse.ok) {
      const malls = await mallsResponse.json();
      console.log(`   🏪 쇼핑몰 개수: ${malls.length}`);
    }
    
    // 5. 데이터베이스 상태 API
    console.log('\n5️⃣ 데이터베이스 상태 API 테스트...');
    const dbResponse = await fetch(PORT_CONFIG.getApiUrl('/admin/database'));
    console.log(`   상태: ${dbResponse.status} ${dbResponse.statusText}`);
    
    if (dbResponse.ok) {
      const dbStatus = await dbResponse.json();
      console.log(`   💾 데이터베이스: ${dbStatus.status}`);
    }
    
    console.log('\n✅ 모든 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    console.log('\n💡 서버가 실행 중인지 확인하세요: npm run dev');
  }
}

// 직접 실행 시
if (require.main === module) {
  simpleTest();
}

module.exports = { simpleTest }; 