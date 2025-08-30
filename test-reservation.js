const axios = require('axios');

async function testReservationCreation() {
  console.log('🧪 예약 생성 API 테스트 시작...\n');
  
  try {
    // 예약 생성 데이터
    const reservationData = {
      customerName: "테스트 고객",
      customerEmail: "test@example.com", 
      customerPhone: "010-1234-5678",
      roomId: "cmevqksz40002ue1ihu7pp5ks", // 기존 룸 ID
      checkInDate: "2025-01-15",
      checkOutDate: "2025-01-17",
      totalAmount: 150000,
      status: "PENDING",
      selectedPackages: ["cmevqkszt0005ue1ihu7pp5ml"], // 기존 패키지 ID
      specialRequests: "테스트 예약입니다."
    };
    
    console.log('📤 전송할 데이터:', JSON.stringify(reservationData, null, 2));
    
    // 예약 생성 API 호출
    const response = await axios.post('http://localhost:4900/api/reservations', reservationData);
    
    console.log('\n✅ 예약 생성 성공!');
    console.log('📊 응답 데이터:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('\n❌ 예약 생성 실패!');
    if (error.response) {
      console.error('📊 응답 상태:', error.response.status);
      console.error('📝 오류 메시지:', error.response.data);
    } else {
      console.error('🔍 오류:', error.message);
    }
  }
}

testReservationCreation();
