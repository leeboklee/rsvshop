const fetch = require('node-fetch');

async function testShoppingMallAPI() {
  const baseUrl = 'http://localhost:3900';
  
  try {
    console.log('=== 쇼핑몰 API 테스트 시작 ===');
    
    // 1. GET 요청 테스트
    console.log('1. GET /api/admin/shopping-malls 테스트...');
    const getResponse = await fetch(`${baseUrl}/api/admin/shopping-malls`);
    console.log('GET 응답 상태:', getResponse.status);
    
    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log('✅ GET 성공:', getData);
    } else {
      const errorData = await getResponse.json();
      console.log('❌ GET 실패:', errorData);
    }
    
    // 2. POST 요청 테스트
    console.log('\n2. POST /api/admin/shopping-malls 테스트...');
    const postData = {
      name: '테스트 쇼핑몰 API',
      commissionRate: 3.5,
      description: 'API 테스트용 쇼핑몰입니다.'
    };
    
    const postResponse = await fetch(`${baseUrl}/api/admin/shopping-malls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData)
    });
    
    console.log('POST 응답 상태:', postResponse.status);
    
    if (postResponse.ok) {
      const postResult = await postResponse.json();
      console.log('✅ POST 성공:', postResult);
    } else {
      const errorData = await postResponse.json();
      console.log('❌ POST 실패:', errorData);
    }
    
    // 3. 다시 GET으로 확인
    console.log('\n3. 생성 후 GET 확인...');
    const getResponse2 = await fetch(`${baseUrl}/api/admin/shopping-malls`);
    if (getResponse2.ok) {
      const getData2 = await getResponse2.json();
      console.log('✅ GET 재확인 성공:', getData2);
    }
    
  } catch (error) {
    console.error('❌ API 테스트 실패:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 해결방법: 서버가 실행되지 않았습니다. npm run dev를 실행하세요.');
    } else if (error.code === 'ENOTFOUND') {
      console.log('💡 해결방법: localhost:3900에 접근할 수 없습니다.');
    }
  }
}

testShoppingMallAPI(); 