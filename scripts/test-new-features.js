const fetch = require('node-fetch');

const baseUrl = 'http://localhost:3900';

async function testNewFeatures() {
  console.log('=== 새 기능 테스트 시작 ===\n');

  try {
    // 1. 서버 상태 확인
    console.log('1. 서버 상태 확인...');
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    if (healthResponse.ok) {
      console.log('✅ 서버 정상 실행 중');
    } else {
      throw new Error('서버가 실행되지 않았습니다.');
    }

    // 2. 호텔 등록 테스트 (주소 필수 해제)
    console.log('\n2. 호텔 등록 테스트 (주소 없이)...');
    const hotelData = {
      name: '테스트 호텔 (주소 없음)',
      phone: '02-1234-5678',
      email: 'test@hotel.com',
      description: '주소 없이 등록되는지 테스트'
    };

    const hotelResponse = await fetch(`${baseUrl}/api/admin/hotels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hotelData)
    });

    if (hotelResponse.ok) {
      const hotel = await hotelResponse.json();
      console.log('✅ 호텔 등록 성공 (주소 없이):', hotel.name);
    } else {
      const error = await hotelResponse.json();
      console.log('❌ 호텔 등록 실패:', error.error);
    }

    // 3. 예약 생성 테스트 (상태 선택)
    console.log('\n3. 예약 생성 테스트 (상태 선택)...');
    const reservationData = {
      customerName: '테스트 고객',
      customerEmail: 'test@example.com',
      customerPhone: '01012345678',
      checkInDate: '2025-08-01',
      checkOutDate: '2025-08-03',
      guests: 2,
      notes: '상태 선택 테스트',
      status: 'PENDING', // 대기 상태로 테스트
      totalPrice: 100000,
      originalPrice: 100000,
      commissionRate: 5,
      commissionAmount: 5000,
      supplyPrice: 95000,
      shoppingMallId: null,
      source: 'ADMIN'
    };

    const reservationResponse = await fetch(`${baseUrl}/api/admin/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reservationData)
    });

    if (reservationResponse.ok) {
      const reservation = await reservationResponse.json();
      console.log('✅ 예약 생성 성공 (대기 상태):', reservation.guestName);
    } else {
      const error = await reservationResponse.json();
      console.log('❌ 예약 생성 실패:', error.error);
    }

    // 4. 예약 목록 조회 테스트
    console.log('\n4. 예약 목록 조회 테스트...');
    const reservationsResponse = await fetch(`${baseUrl}/api/admin/reservations`);
    if (reservationsResponse.ok) {
      const reservations = await reservationsResponse.json();
      console.log(`✅ 예약 목록 조회 성공: ${reservations.length}개`);
      
      // 최근 생성된 예약 확인
      if (reservations.length > 0) {
        const latest = reservations[0];
        console.log(`   - 최근 예약: ${latest.guestName} (${latest.status})`);
        console.log(`   - 전화번호: ${latest.guestPhone}`);
      }
    } else {
      console.log('❌ 예약 목록 조회 실패');
    }

    // 5. 호텔 목록 조회 테스트
    console.log('\n5. 호텔 목록 조회 테스트...');
    const hotelsResponse = await fetch(`${baseUrl}/api/admin/hotels`);
    if (hotelsResponse.ok) {
      const hotels = await hotelsResponse.json();
      console.log(`✅ 호텔 목록 조회 성공: ${hotels.length}개`);
      
      if (hotels.length > 0) {
        const latest = hotels[0];
        console.log(`   - 최근 호텔: ${latest.name}`);
        console.log(`   - 주소: ${latest.address || '주소 없음'}`);
      }
    } else {
      console.log('❌ 호텔 목록 조회 실패');
    }

    // 6. 통계 조회 테스트
    console.log('\n6. 통계 조회 테스트...');
    const statsResponse = await fetch(`${baseUrl}/api/admin/stats`);
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('✅ 통계 조회 성공:');
      console.log(`   - 총 예약: ${stats.totalReservations}`);
      console.log(`   - 오늘 예약: ${stats.todayReservations}`);
      console.log(`   - 이번 주 예약: ${stats.thisWeekReservations}`);
    } else {
      console.log('❌ 통계 조회 실패');
    }

    console.log('\n=== 모든 테스트 완료 ===');

  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 해결방법: npm run dev로 서버를 실행하세요.');
    }
  }
}

testNewFeatures(); 