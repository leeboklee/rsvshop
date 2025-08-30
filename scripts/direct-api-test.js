const fetch = require('node-fetch');

async function directApiTest() {
  console.log('=== 직접 API 테스트 시작 ===\n');
  
  try {
    // 1. 예약 목록 직접 조회
    console.log('1. 예약 목록 직접 조회...');
    const response = await fetch('http://localhost:3900/api/admin/reservations');
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response data type:', typeof data);
      console.log('Response data length:', Array.isArray(data) ? data.length : 'Not an array');
      console.log('Response data:', JSON.stringify(data, null, 2));
      
      if (data.bookings && Array.isArray(data.bookings) && data.bookings.length > 0) {
        const firstReservation = data.bookings[0];
        console.log('\n첫 번째 예약 정보:');
        console.log('- ID:', firstReservation.id);
        console.log('- 고객명:', firstReservation.guestName);
        console.log('- 상태:', firstReservation.status);
        
        // 2. 상태 변경 테스트
        console.log('\n2. 상태 변경 테스트...');
        const newStatus = firstReservation.status === 'CONFIRMED' ? 'PENDING' : 'CONFIRMED';
        console.log('변경할 상태:', newStatus);
        
        const updateResponse = await fetch(`http://localhost:3900/api/admin/reservations/${firstReservation.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        
        console.log('Update response status:', updateResponse.status);
        
        if (updateResponse.ok) {
          const updatedData = await updateResponse.json();
          console.log('✅ 상태 변경 성공:');
          console.log('업데이트된 데이터:', JSON.stringify(updatedData, null, 2));
          
          // 3. 변경 후 재조회
          console.log('\n3. 변경 후 재조회...');
          setTimeout(async () => {
            const afterResponse = await fetch('http://localhost:3900/api/admin/reservations');
            if (afterResponse.ok) {
                           const afterData = await afterResponse.json();
             const updatedReservation = afterData.bookings.find(r => r.id === firstReservation.id);
              
              if (updatedReservation) {
                console.log('✅ 재조회 성공:');
                console.log('- 고객명:', updatedReservation.guestName);
                console.log('- 현재 상태:', updatedReservation.status);
                console.log('- DB 저장 확인:', updatedReservation.status === newStatus ? '성공' : '실패');
              }
            }
          }, 1000);
          
        } else {
          const errorData = await updateResponse.json();
          console.log('❌ 상태 변경 실패:', errorData);
        }
      } else {
        console.log('❌ 예약 데이터가 없거나 배열이 아닙니다.');
      }
    } else {
      console.log('❌ API 호출 실패:', response.status);
    }
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  }
}

directApiTest(); 