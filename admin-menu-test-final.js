const { chromium } = require('playwright');

async function testAdminMenuFinal() {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 에러 수집
  const errors = [];
  const consoleErrors = [];
  
  page.on('pageerror', error => {
    errors.push({
      type: 'pageerror',
      message: error.message,
      stack: error.stack
    });
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push({
        type: 'console',
        message: msg.text(),
        location: msg.location()
      });
    }
  });
  
  console.log('🚀 Admin 페이지 전체 메뉴 테스트 시작...');
  
  try {
    // 1. 메인 페이지 접속
    console.log('\n📱 1단계: 메인 admin 페이지 접속');
    await page.goto('http://localhost:4900/admin', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    const title = await page.title();
    console.log(`✅ 페이지 제목: ${title}`);
    
    // 2. 모든 메뉴 항목 수집
    console.log('\n🔍 2단계: 모든 메뉴 항목 수집');
    
    const allMenuItems = await page.$$eval('aside a[href*="/admin"]', elements => {
      return elements.map(el => ({
        text: el.textContent?.trim() || 'N/A',
        href: el.href || el.getAttribute('href') || 'N/A',
        title: el.getAttribute('title') || 'N/A',
        visible: el.offsetParent !== null
      })).filter(item => item.text !== 'N/A' && item.visible);
    });
    
    console.log(`📋 총 ${allMenuItems.length}개 메뉴 항목 발견:`);
    allMenuItems.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.text} - ${item.href}`);
    });
    
    // 3. 각 메뉴별 상세 테스트
    console.log('\n🖱️ 3단계: 각 메뉴별 상세 테스트');
    
    const testResults = [];
    
    for (let i = 0; i < allMenuItems.length; i++) {
      const item = allMenuItems[i];
      console.log(`\n📌 테스트 중: ${item.text} (${i + 1}/${allMenuItems.length})`);
      
      try {
        // 메뉴 클릭
        const menuSelector = `a[href="${item.href}"]`;
        const menuElement = await page.$(menuSelector);
        
        if (menuElement) {
          const beforeUrl = page.url();
          await menuElement.click();
          
          // 페이지 로딩 대기
          try {
            await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
            console.log(`  ✅ 클릭 성공: ${beforeUrl} → ${page.url()}`);
            
            // 페이지 내용 확인
            const pageInfo = await page.evaluate(() => {
              return {
                title: document.title,
                h1: document.querySelector('h1')?.textContent?.trim() || 'N/A',
                mainContent: document.querySelector('main, [role="main"]')?.textContent?.substring(0, 200) || 'N/A',
                hasError: document.querySelector('.error, .alert, [role="alert"]') !== null,
                loading: document.querySelector('.loading, .spinner') !== null
              };
            });
            
            console.log(`  📄 페이지 정보: ${pageInfo.title}`);
            console.log(`  📝 제목: ${pageInfo.h1}`);
            console.log(`  ⚠️ 에러 표시: ${pageInfo.hasError ? '예' : '아니오'}`);
            console.log(`  🔄 로딩 중: ${pageInfo.loading ? '예' : '아니오'}`);
            
            // 스크린샷 저장
            const screenshotName = `admin-${item.text.replace(/[^a-zA-Z0-9가-힣]/g, '-')}.png`;
            await page.screenshot({ path: screenshotName, fullPage: true });
            console.log(`  📸 스크린샷 저장: ${screenshotName}`);
            
            // 테스트 결과 저장
            testResults.push({
              menu: item.text,
              url: item.href,
              status: 'success',
              title: pageInfo.title,
              h1: pageInfo.h1,
              hasError: pageInfo.hasError,
              loading: pageInfo.loading,
              screenshot: screenshotName
            });
            
          } catch (timeoutError) {
            console.log(`  ⚠️ 페이지 로딩 타임아웃`);
            testResults.push({
              menu: item.text,
              url: item.href,
              status: 'timeout',
              error: '페이지 로딩 타임아웃'
            });
          }
          
          // 잠시 대기 후 다음 메뉴로
          await page.waitForTimeout(2000);
          
        } else {
          console.log(`  ❌ 메뉴 요소를 찾을 수 없음: ${item.text}`);
          testResults.push({
            menu: item.text,
            url: item.href,
            status: 'element_not_found',
            error: '메뉴 요소를 찾을 수 없음'
          });
        }
        
      } catch (error) {
        console.log(`  ❌ 테스트 실패: ${error.message}`);
        testResults.push({
          menu: item.text,
          url: item.href,
          status: 'error',
          error: error.message
        });
      }
    }
    
    // 4. 테스트 결과 요약
    console.log('\n📊 4단계: 테스트 결과 요약');
    
    const successCount = testResults.filter(r => r.status === 'success').length;
    const errorCount = testResults.filter(r => r.status === 'error').length;
    const timeoutCount = testResults.filter(r => r.status === 'timeout').length;
    const notFoundCount = testResults.filter(r => r.status === 'element_not_found').length;
    
    console.log(`\n📈 테스트 통계:`);
    console.log(`  ✅ 성공: ${successCount}개`);
    console.log(`  ❌ 오류: ${errorCount}개`);
    console.log(`  ⏰ 타임아웃: ${timeoutCount}개`);
    console.log(`  🔍 요소 없음: ${notFoundCount}개`);
    
    // 실패한 항목들 상세
    const failedItems = testResults.filter(r => r.status !== 'success');
    if (failedItems.length > 0) {
      console.log(`\n🚨 실패한 메뉴 항목들:`);
      failedItems.forEach(item => {
        console.log(`  ❌ ${item.menu}: ${item.error || item.status}`);
      });
    }
    
    // 5. 에러 요약
    console.log('\n🚨 5단계: 에러 요약');
    
    if (errors.length > 0) {
      console.log(`📊 총 페이지 에러: ${errors.length}개`);
      errors.slice(-5).forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.type}: ${error.message}`);
      });
    } else {
      console.log('✅ 페이지 에러 없음');
    }
    
    if (consoleErrors.length > 0) {
      console.log(`📊 총 콘솔 에러: ${consoleErrors.length}개`);
      consoleErrors.slice(-5).forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.type}: ${error.message}`);
      });
    } else {
      console.log('✅ 콘솔 에러 없음');
    }
    
    // 6. 최종 스크린샷
    console.log('\n📸 6단계: 최종 전체 페이지 스크린샷');
    await page.screenshot({ 
      path: 'admin-final-menu-test.png', 
      fullPage: true 
    });
    console.log('✅ 최종 스크린샷 저장: admin-final-menu-test.png');
    
    // 7. 테스트 결과 JSON 저장
    const testReport = {
      timestamp: new Date().toISOString(),
      totalMenus: allMenuItems.length,
      testResults: testResults,
      errors: errors,
      consoleErrors: consoleErrors,
      summary: {
        success: successCount,
        error: errorCount,
        timeout: timeoutCount,
        notFound: notFoundCount
      }
    };
    
    require('fs').writeFileSync('admin-menu-test-report.json', JSON.stringify(testReport, null, 2));
    console.log('✅ 테스트 리포트 저장: admin-menu-test-report.json');
    
  } catch (error) {
    console.error('❌ 테스트 중 치명적 오류 발생:', error.message);
    
    // 에러 발생 시에도 스크린샷 시도
    try {
      await page.screenshot({ 
        path: 'admin-fatal-error.png', 
        fullPage: true 
      });
      console.log('✅ 치명적 오류 스크린샷 저장: admin-fatal-error.png');
    } catch (screenshotError) {
      console.log('❌ 스크린샷 저장 실패:', screenshotError.message);
    }
  } finally {
    await browser.close();
    console.log('\n🏁 전체 메뉴 테스트 완료');
  }
}

// 테스트 실행
testAdminMenuFinal().catch(console.error);
