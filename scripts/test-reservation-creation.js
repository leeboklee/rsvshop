const fetch = require('node-fetch');

async function testReservationCreation() {
  console.log('=== 예약 생성 테스트 시작 ===\n');
  
  try {
    // 1. 서버 상태 확인
    console.log('1. 서버 상태 확인...');
    const healthResponse = await fetch('http://localhost:3900/api/health');
    if (healthResponse.ok) {
      console.log('✅ 서버 정상 실행 중');
    } else {
      throw new Error('서버가 실행되지 않았습니다.');
    }

    // 2. 기존 예약 목록 확인
    console.log('\n2. 기존 예약 목록 확인...');
    const beforeResponse = await fetch('http://localhost:3900/api/admin/reservations');
    if (beforeResponse.ok) {
      const beforeData = await beforeResponse.json();
      console.log(`✅ 기존 예약 수: ${beforeData.length}개`);
    }

    // 3. 새 예약 생성 테스트
    console.log('\n3. 새 예약 생성 테스트...');
    const reservationData = {
      customerName: '테스트 고객 (메뉴 테스트)',
      customerEmail: 'test@menu.com',
      customerPhone: '01012345678',
      checkInDate: '2025-08-15',
      checkOutDate: '2025-08-17',
      guests: 2,
      notes: '예약 생성 메뉴 테스트로 생성된 예약입니다.',
      status: 'CONFIRMED',
      totalPrice: 150000,
      originalPrice: 150000,
      commissionRate: 5,
      commissionAmount: 7500,
      supplyPrice: 142500,
      shoppingMallId: null,
      source: 'ADMIN'
    };

    const createResponse = await fetch('http://localhost:3900/api/admin/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reservationData)
    });

    if (createResponse.ok) {
      const newReservation = await createResponse.json();
      console.log('✅ 예약 생성 성공:');
      console.log(`   - 고객명: ${newReservation.guestName}`);
      console.log(`   - 상태: ${newReservation.status}`);
      console.log(`   - 체크인: ${newReservation.checkInDate}`);
      console.log(`   - 체크아웃: ${newReservation.checkOutDate}`);
    } else {
      const error = await createResponse.json();
      console.log('❌ 예약 생성 실패:', error.error);
    }

    // 4. 생성 후 예약 목록 확인
    console.log('\n4. 생성 후 예약 목록 확인...');
    setTimeout(async () => {
      const afterResponse = await fetch('http://localhost:3900/api/admin/reservations');
      if (afterResponse.ok) {
        const afterData = await afterResponse.json();
        console.log(`✅ 생성 후 예약 수: ${afterData.length}개`);
        
        // 최근 생성된 예약 확인
        if (afterData.length > 0) {
          const latest = afterData[0];
          console.log(`   - 최근 예약: ${latest.guestName}`);
          console.log(`   - 전화번호: ${latest.guestPhone}`);
          console.log(`   - 상태: ${latest.status}`);
        }
      }
    }, 2000);

    // 5. 통계 확인
    console.log('\n5. 통계 확인...');
    const statsResponse = await fetch('http://localhost:3900/api/admin/stats');
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('✅ 통계 조회 성공:');
      console.log(`   - 총 예약: ${stats.totalReservations}`);
      console.log(`   - 오늘 예약: ${stats.todayReservations}`);
      console.log(`   - 이번 주 예약: ${stats.thisWeekReservations}`);
    }

    console.log('\n=== 예약 생성 테스트 완료 ===');
    console.log('💡 이제 브라우저에서 http://localhost:3900/admin 접속 후');
    console.log('   "예약 생성" 메뉴를 클릭하여 UI를 확인하세요!');

  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  }
}

testReservationCreation(); 