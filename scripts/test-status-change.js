const fetch = require('node-fetch');

async function testStatusChange() {
  console.log('=== 예약 상태 변경 테스트 시작 ===\n');
  
  try {
    // 1. 서버 상태 확인
    console.log('1. 서버 상태 확인...');
    const healthResponse = await fetch('http://localhost:3900/api/health');
    if (healthResponse.ok) {
      console.log('✅ 서버 정상 실행 중');
    } else {
      throw new Error('서버가 실행되지 않았습니다.');
    }

    // 2. 기존 예약 목록 조회
    console.log('\n2. 기존 예약 목록 조회...');
    const reservationsResponse = await fetch('http://localhost:3900/api/admin/reservations');
    if (reservationsResponse.ok) {
      const reservations = await reservationsResponse.json();
      console.log(`✅ 예약 목록 조회 성공: ${reservations.length}개`);
      
      if (reservations.length === 0) {
        console.log('❌ 테스트할 예약이 없습니다. 먼저 예약을 생성해주세요.');
        return;
      }
      
      // 첫 번째 예약 선택
      const testReservation = reservations[0];
      console.log(`   - 테스트 예약: ${testReservation.guestName}`);
      console.log(`   - 현재 상태: ${testReservation.status}`);
      console.log(`   - 예약 ID: ${testReservation.id}`);
      
      // 3. 상태 변경 테스트
      console.log('\n3. 예약 상태 변경 테스트...');
      const newStatus = testReservation.status === 'CONFIRMED' ? 'PENDING' : 'CONFIRMED';
      console.log(`   - 변경할 상태: ${newStatus}`);
      
      const updateResponse = await fetch(`http://localhost:3900/api/admin/reservations/${testReservation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (updateResponse.ok) {
        const updatedReservation = await updateResponse.json();
        console.log('✅ 상태 변경 성공:');
        console.log(`   - 변경된 상태: ${updatedReservation.status}`);
        console.log(`   - 예약 ID: ${updatedReservation.id}`);
        
        // 4. 변경 후 목록 재조회
        console.log('\n4. 변경 후 예약 목록 재조회...');
        setTimeout(async () => {
          const afterResponse = await fetch('http://localhost:3900/api/admin/reservations');
          if (afterResponse.ok) {
            const afterReservations = await afterResponse.json();
            const updatedInList = afterReservations.find(r => r.id === testReservation.id);
            
            if (updatedInList) {
              console.log('✅ 목록에서 상태 변경 확인:');
              console.log(`   - 고객명: ${updatedInList.guestName}`);
              console.log(`   - 현재 상태: ${updatedInList.status}`);
              
              if (updatedInList.status === newStatus) {
                console.log('✅ DB 저장 성공: 상태가 올바르게 저장되었습니다!');
              } else {
                console.log('❌ DB 저장 실패: 상태가 변경되지 않았습니다.');
              }
            } else {
              console.log('❌ 목록에서 예약을 찾을 수 없습니다.');
            }
          }
        }, 1000);
        
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
        
      } else {
        const error = await updateResponse.json();
        console.log('❌ 상태 변경 실패:', error.error);
      }
      
    } else {
      console.log('❌ 예약 목록 조회 실패');
    }

    console.log('\n=== 예약 상태 변경 테스트 완료 ===');
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  }
}

testStatusChange(); 