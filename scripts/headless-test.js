const { chromium } = require('playwright');

async function runHeadlessTest() {
  console.log('🚀 헤드리스 브라우저 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // 관리자 페이지 테스트
    console.log('📋 관리자 페이지 테스트 중...');
    await page.goto('http://localhost:4900/admin', { waitUntil: 'networkidle2' });
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log(`📄 페이지 제목: ${title}`);
    
    // 스크린샷 캡처
    await page.screenshot({ 
      path: 'logs/admin-page-headless.png',
      fullPage: true 
    });
    console.log('📸 스크린샷 저장: logs/admin-page-headless.png');
    
    // 예약 관리 페이지 테스트
    console.log('📅 예약 관리 페이지 테스트 중...');
    await page.goto('http://localhost:4900/admin');
    
    // 예약 목록 확인
    const reservationCount = await page.locator('.reservation-item').count();
    console.log(`📊 예약 개수: ${reservationCount}`);
    
    // 성공 스크린샷
    await page.screenshot({ 
      path: 'logs/reservations-headless.png',
      fullPage: true 
    });
    console.log('📸 스크린샷 저장: logs/reservations-headless.png');
    
    console.log('✅ 헤드리스 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    
    // 오류 스크린샷
    try {
      await page.screenshot({ 
        path: 'logs/error-headless.png',
        fullPage: true 
      });
      console.log('📸 오류 스크린샷 저장: logs/error-headless.png');
    } catch (screenshotError) {
      console.error('📸 스크린샷 저장 실패:', screenshotError.message);
    }
  } finally {
    await browser.close();
  }
}

// 직접 실행 시
if (require.main === module) {
  runHeadlessTest().catch(console.error);
}

module.exports = { runHeadlessTest }; 