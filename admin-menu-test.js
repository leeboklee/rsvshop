const { chromium } = require('playwright');

async function testAdminMenu() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🚀 Admin 페이지 테스트 시작...');
  
  try {
    // 1. 메인 admin 페이지 접속
    console.log('📱 메인 admin 페이지 접속 중...');
    await page.goto('http://localhost:4900/admin');
    await page.waitForLoadState('networkidle');
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log(`✅ 페이지 제목: ${title}`);
    
    // 2. 전체 메뉴 항목들 확인
    console.log('\n🔍 전체 메뉴 항목 확인 중...');
    
    const menuItems = await page.$$eval('nav a, nav button, [role="menuitem"]', elements => 
      elements.map(el => ({
        text: el.textContent?.trim() || el.innerText?.trim() || 'N/A',
        href: el.href || el.getAttribute('href') || 'N/A',
        tag: el.tagName.toLowerCase()
      }))
    );
    
    console.log('📋 발견된 메뉴 항목들:');
    menuItems.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.text} (${item.tag}) - ${item.href}`);
    });
    
    // 3. 각 메뉴 클릭 테스트
    console.log('\n🖱️ 메뉴 클릭 테스트 시작...');
    
    for (let i = 0; i < menuItems.length; i++) {
      const item = menuItems[i];
      try {
        console.log(`\n📌 테스트 중: ${item.text}`);
        
        // 메뉴 클릭
        const menuElement = await page.$(`text=${item.text}`);
        if (menuElement) {
          await menuElement.click();
          await page.waitForTimeout(1000);
          
          // 페이지 변경 확인
          const currentUrl = page.url();
          console.log(`  ✅ 클릭 성공: ${currentUrl}`);
          
          // 에러 확인
          const errors = await page.evaluate(() => {
            return window.errors || [];
          });
          
          if (errors.length > 0) {
            console.log(`  ⚠️ 에러 발견:`, errors);
          }
          
          // 콘솔 에러 확인
          const consoleErrors = await page.evaluate(() => {
            return window.consoleErrors || [];
          });
          
          if (consoleErrors.length > 0) {
            console.log(`  ⚠️ 콘솔 에러:`, consoleErrors);
          }
          
        } else {
          console.log(`  ❌ 메뉴 요소를 찾을 수 없음: ${item.text}`);
        }
        
      } catch (error) {
        console.log(`  ❌ 테스트 실패: ${item.text} - ${error.message}`);
      }
    }
    
    // 4. 페이지 전체 스크린샷
    console.log('\n📸 페이지 스크린샷 촬영 중...');
    await page.screenshot({ 
      path: 'admin-page-full.png', 
      fullPage: true 
    });
    console.log('✅ 스크린샷 저장됨: admin-page-full.png');
    
    // 5. 메모리 사용량 확인
    const memoryInfo = await page.evaluate(() => {
      if (performance.memory) {
        return {
          usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + ' MB',
          totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + ' MB',
          jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + ' MB'
        };
      }
      return 'Memory API not available';
    });
    
    console.log('\n💾 메모리 사용량:', memoryInfo);
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  } finally {
    await browser.close();
    console.log('\n🏁 테스트 완료');
  }
}

// 에러 모니터링 설정
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// 테스트 실행
testAdminMenu().catch(console.error);
