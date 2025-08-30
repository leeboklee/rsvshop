const fetch = require('node-fetch');

async function simpleStatusTest() {
  console.log('=== 간단한 상태 변경 테스트 ===\n');
  
  try {
    // 1. 예약 목록 조회
    const response = await fetch('http://localhost:3900/api/admin/reservations');
    const data = await response.json();
    
    if (!data.bookings || data.bookings.length === 0) {
      console.log('❌ 테스트할 예약이 없습니다.');
      return;
    }
    
    const testReservation = data.bookings[0];
    console.log(`테스트 예약: ${testReservation.guestName} (${testReservation.status})`);
    
    // 2. 상태 변경
    const newStatus = testReservation.status === 'CONFIRMED' ? 'PENDING' : 'CONFIRMED';
    console.log(`상태 변경: ${testReservation.status} → ${newStatus}`);
    
    const updateResponse = await fetch(`http://localhost:3900/api/admin/reservations/${testReservation.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    
    if (updateResponse.ok) {
      const updated = await updateResponse.json();
      console.log('✅ 상태 변경 성공!');
      console.log(`변경된 상태: ${updated.status}`);
      
      // 3. 재조회로 확인
      setTimeout(async () => {
        const afterResponse = await fetch('http://localhost:3900/api/admin/reservations');
        const afterData = await afterResponse.json();
        const afterReservation = afterData.bookings.find(r => r.id === testReservation.id);
        
        if (afterReservation && afterReservation.status === newStatus) {
          console.log('✅ DB 저장 확인 완료!');
        } else {
          console.log('❌ DB 저장 실패');
        }
      }, 1000);
      
    } else {
      const error = await updateResponse.json();
      console.log('❌ 상태 변경 실패:', error);
    }
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  }
}

simpleStatusTest(); 