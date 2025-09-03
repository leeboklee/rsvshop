// 쇼핑몰 연동 기능 테스트 스크립트
// 브라우저 콘솔에서 실행하세요

console.log('🛍️ 쇼핑몰 연동 기능 테스트 시작');

// 1. 쇼핑몰 등록 테스트
async function testShoppingMallCreation() {
  console.log('📝 1단계: 쇼핑몰 등록 테스트');
  
  const testMalls = [
    {
      name: '스마트스토어',
      platform: '네이버',
      commissionRate: 3.5,
      description: '네이버 스마트스토어'
    },
    {
      name: '쿠팡',
      platform: '쿠팡',
      commissionRate: 5.0,
      description: '쿠팡 파트너스'
    },
    {
      name: '11번가',
      platform: '11번가',
      commissionRate: 4.0,
      description: '11번가 파트너스'
    }
  ];

  for (const mall of testMalls) {
    try {
      const response = await fetch('/api/admin/shopping-malls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mall)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ ${mall.name} 등록 성공:`, result);
      } else {
        console.log(`❌ ${mall.name} 등록 실패:`, response.status);
      }
    } catch (error) {
      console.error(`❌ ${mall.name} 등록 오류:`, error);
    }
  }
}

// 2. 쇼핑몰 목록 조회 테스트
async function testShoppingMallList() {
  console.log('📋 2단계: 쇼핑몰 목록 조회 테스트');
  
  try {
    const response = await fetch('/api/admin/shopping-malls');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ 쇼핑몰 목록:', data);
      return data.shoppingMalls || [];
    } else {
      console.log('❌ 쇼핑몰 목록 조회 실패:', response.status);
      return [];
    }
  } catch (error) {
    console.error('❌ 쇼핑몰 목록 조회 오류:', error);
    return [];
  }
}

// 3. 수수료 계산 테스트
function testCommissionCalculation() {
  console.log('💰 3단계: 수수료 계산 테스트');
  
  const testCases = [
    { sellingPrice: 100000, commissionRate: 3.5 },
    { sellingPrice: 150000, commissionRate: 5.0 },
    { sellingPrice: 200000, commissionRate: 4.0 }
  ];
  
  testCases.forEach(({ sellingPrice, commissionRate }) => {
    const commissionAmount = Math.round(sellingPrice * (commissionRate / 100));
    const supplyPrice = sellingPrice - commissionAmount;
    
    console.log(`판매가: ${sellingPrice.toLocaleString()}원, 수수료율: ${commissionRate}%`);
    console.log(`  → 수수료: ${commissionAmount.toLocaleString()}원`);
    console.log(`  → 공급가: ${supplyPrice.toLocaleString()}원`);
    console.log('---');
  });
}

// 4. 예약 생성 시 쇼핑몰 연동 테스트
async function testReservationWithShoppingMall() {
  console.log('📅 4단계: 예약 생성 시 쇼핑몰 연동 테스트');
  
  const testReservation = {
    customerName: '테스트 고객',
    customerEmail: 'test@example.com',
    customerPhone: '010-1234-5678',
    shoppingMall: '스마트스토어',
    roomId: '테스트 객실',
    checkInDate: new Date(Date.now() + 24*60*60*1000).toISOString(),
    checkOutDate: new Date(Date.now() + 2*24*60*60*1000).toISOString(),
    sellingPrice: 150000,
    supplyPrice: 144750,
    status: 'PENDING'
  };
  
  try {
    const response = await fetch('/api/admin/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testReservation)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ 예약 생성 성공 (쇼핑몰 연동):', result);
    } else {
      const error = await response.json();
      console.log('❌ 예약 생성 실패:', error);
    }
  } catch (error) {
    console.error('❌ 예약 생성 오류:', error);
  }
}

// 전체 테스트 실행
async function runAllTests() {
  console.log('🚀 전체 테스트 시작');
  
  await testShoppingMallCreation();
  await testShoppingMallList();
  testCommissionCalculation();
  await testReservationWithShoppingMall();
  
  console.log('🎉 전체 테스트 완료!');
}

// 개별 테스트 실행 함수들
window.testShoppingMallIntegration = {
  createMalls: testShoppingMallCreation,
  listMalls: testShoppingMallList,
  calculateCommission: testCommissionCalculation,
  createReservation: testReservationWithShoppingMall,
  runAll: runAllTests
};

console.log('💡 사용법:');
console.log('  - testShoppingMallIntegration.runAll() : 전체 테스트 실행');
console.log('  - testShoppingMallIntegration.createMalls() : 쇼핑몰 등록만');
console.log('  - testShoppingMallIntegration.listMalls() : 쇼핑몰 목록만');
console.log('  - testShoppingMallIntegration.calculateCommission() : 수수료 계산만');
console.log('  - testShoppingMallIntegration.createReservation() : 예약 생성만');
