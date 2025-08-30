const { chromium } = require('playwright');

async function testAdminMenuUltimate() {
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
  
  console.log('🚀 Admin 페이지 메뉴 테스트 (최종 버전) 시작...');
  
  try {
    // 1. 메인 페이지 접속
    console.log('\n📱 1단계: 메인 admin 페이지 접속');
    await page.goto('http://localhost:4900/admin', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    const title = await page.title();
    console.log(`✅ 페이지 제목: ${title}`);
    
    // 2. 페이지 완전 로딩 대기
    console.log('\n⏳ 2단계: 페이지 완전 로딩 대기');
    await page.waitForTimeout(8000);
    
    // 3. 메뉴 요소 찾기 (더 정확한 방법)
    console.log('\n🔍 3단계: 메뉴 요소 찾기');
    
    // 먼저 사이드바가 로드되었는지 확인
    await page.waitForSelector('aside', { timeout: 10000 });
    
    const allMenuItems = await page.$$eval('aside a[href*="/admin"]', elements => {
      return elements.map(el => ({
        text: el.textContent?.trim() || 'N/A',
        href: el.href || el.getAttribute('href') || 'N/A',
        title: el.getAttribute('title') || 'N/A',
        tag: el.tagName.toLowerCase(),
        visible: el.offsetParent !== null,
        classes: el.className,
        innerHTML: el.innerHTML.substring(0, 100)
      })).filter(item => item.text !== 'N/A' && item.visible && item.text.length > 0);
    });
    
    console.log(`📋 총 ${allMenuItems.length}개 메뉴 항목 발견:`);
    allMenuItems.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.text} - ${item.href} (${item.tag})`);
    });
    
    // 4. 각 메뉴별 테스트 (더 정확한 선택자 사용)
    console.log('\n🖱️ 4단계: 각 메뉴별 테스트');
    
    const testResults = [];
    
    for (let i = 0; i < allMenuItems.length; i++) {
      const item = allMenuItems[i];
      console.log(`\n📌 테스트 중: ${item.text} (${i + 1}/${allMenuItems.length})`);
      
      try {
        // 더 정확한 선택자 사용
        const menuSelector = `aside a[href="${item.href}"]`;
        console.log(`  🔍 선택자: ${menuSelector}`);
        
        // 요소가 실제로 존재하는지 확인
        const elementCount = await page.$$eval(menuSelector, elements => elements.length);
        console.log(`  📊 발견된 요소 수: ${elementCount}`);
        
        if (elementCount > 0) {
          // 첫 번째 요소 가져오기
          const menuElement = await page.$(menuSelector);
          
          if (menuElement) {
            const beforeUrl = page.url();
            
            // 요소 상태 확인
            const isVisible = await menuElement.isVisible();
            const isEnabled = await menuElement.isEnabled();
            const boundingBox = await menuElement.boundingBox();
            
            console.log(`  📍 요소 상태: 표시=${isVisible}, 활성화=${isEnabled}`);
            console.log(`  📐 위치: ${boundingBox ? `x:${boundingBox.x}, y:${boundingBox.y}` : 'N/A'}`);
            
            if (isVisible && isEnabled) {
              // 스크롤해서 요소가 보이도록
              await menuElement.scrollIntoViewIfNeeded();
              await page.waitForTimeout(1000);
              
              // 클릭 시도
              try {
                await menuElement.click({ timeout: 10000 });
                console.log(`  ✅ 클릭 성공: ${beforeUrl} → ${page.url()}`);
                
                // 페이지 로딩 대기
                try {
                  await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
                  
                  // 페이지 정보 확인
                  const pageInfo = await page.evaluate(() => {
                    return {
                      title: document.title,
                      h1: document.querySelector('h1')?.textContent?.trim() || 'N/A',
                      url: window.location.href,
                      hasError: document.querySelector('.error, .alert, [role="alert"]') !== null,
                      loading: document.querySelector('.loading, .spinner') !== null,
                      bodyLength: document.body.innerHTML.length
                    };
                  });
                  
                  console.log(`  📄 페이지 정보: ${pageInfo.title}`);
                  console.log(`  📝 제목: ${pageInfo.h1}`);
                  console.log(`  🔗 URL: ${pageInfo.url}`);
                  console.log(`  📏 페이지 크기: ${pageInfo.bodyLength} 문자`);
                  
                  // 스크린샷 저장
                  const screenshotName = `admin-${item.text.replace(/[^a-zA-Z0-9가-힣]/g, '-')}.png`;
                  await page.screenshot({ path: screenshotName, fullPage: true });
                  console.log(`  📸 스크린샷 저장: ${screenshotName}`);
                  
                  testResults.push({
                    menu: item.text,
                    url: item.href,
                    status: 'success',
                    title: pageInfo.title,
                    h1: pageInfo.h1,
                    screenshot: screenshotName,
                    pageSize: pageInfo.bodyLength
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
                
                // 잠시 대기
                await page.waitForTimeout(3000);
                
              } catch (clickError) {
                console.log(`  ❌ 클릭 실패: ${clickError.message}`);
                testResults.push({
                  menu: item.text,
                  url: item.href,
                  status: 'click_failed',
                  error: `클릭 실패: ${clickError.message}`
                });
              }
              
            } else {
              console.log(`  ❌ 요소가 표시되지 않거나 비활성화됨`);
              testResults.push({
                menu: item.text,
                url: item.href,
                status: 'not_visible',
                error: '요소가 표시되지 않거나 비활성화됨'
              });
            }
            
          } else {
            console.log(`  ❌ 메뉴 요소를 가져올 수 없음`);
            testResults.push({
              menu: item.text,
              url: item.href,
              status: 'element_not_found',
              error: '메뉴 요소를 가져올 수 없음'
            });
          }
          
        } else {
          console.log(`  ❌ 선택자로 요소를 찾을 수 없음: ${menuSelector}`);
          testResults.push({
            menu: item.text,
            url: item.href,
            status: 'selector_not_found',
            error: `선택자로 요소를 찾을 수 없음: ${menuSelector}`
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
    
    // 5. 테스트 결과 요약
    console.log('\n📊 5단계: 테스트 결과 요약');
    
    const successCount = testResults.filter(r => r.status === 'success').length;
    const errorCount = testResults.filter(r => r.status === 'error').length;
    const timeoutCount = testResults.filter(r => r.status === 'timeout').length;
    const clickFailedCount = testResults.filter(r => r.status === 'click_failed').length;
    const notVisibleCount = testResults.filter(r => r.status === 'not_visible').length;
    const notFoundCount = testResults.filter(r => r.status === 'element_not_found').length;
    const selectorNotFoundCount = testResults.filter(r => r.status === 'selector_not_found').length;
    
    console.log(`\n📈 테스트 통계:`);
    console.log(`  ✅ 성공: ${successCount}개`);
    console.log(`  ❌ 오류: ${errorCount}개`);
    console.log(`  ⏰ 타임아웃: ${timeoutCount}개`);
    console.log(`  🖱️ 클릭 실패: ${clickFailedCount}개`);
    console.log(`  👁️ 표시 안됨: ${notVisibleCount}개`);
    console.log(`  🔍 요소 없음: ${notFoundCount}개`);
    console.log(`  🎯 선택자 없음: ${selectorNotFoundCount}개`);
    
    // 6. 성공한 항목들 출력
    const successfulItems = testResults.filter(r => r.status === 'success');
    if (successfulItems.length > 0) {
      console.log(`\n✅ 성공한 메뉴 항목들:`);
      successfulItems.forEach(item => {
        console.log(`  ✅ ${item.menu}: ${item.title}`);
      });
    }
    
    // 7. 실패한 항목들 상세
    const failedItems = testResults.filter(r => r.status !== 'success');
    if (failedItems.length > 0) {
      console.log(`\n🚨 실패한 메뉴 항목들:`);
      failedItems.forEach(item => {
        console.log(`  ❌ ${item.menu}: ${item.error || item.status}`);
      });
    }
    
    // 8. 최종 스크린샷
    console.log('\n📸 8단계: 최종 스크린샷');
    await page.screenshot({ 
      path: 'admin-final-ultimate-test.png', 
      fullPage: true 
    });
    console.log('✅ 최종 스크린샷 저장: admin-final-ultimate-test.png');
    
    // 9. 테스트 리포트 저장
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
        clickFailed: clickFailedCount,
        notVisible: notVisibleCount,
        notFound: notFoundCount,
        selectorNotFound: selectorNotFoundCount
      }
    };
    
    require('fs').writeFileSync('admin-menu-test-ultimate-report.json', JSON.stringify(testReport, null, 2));
    console.log('✅ 테스트 리포트 저장: admin-menu-test-ultimate-report.json');
    
  } catch (error) {
    console.error('❌ 테스트 중 치명적 오류 발생:', error.message);
    
    try {
      await page.screenshot({ 
        path: 'admin-fatal-error-ultimate.png', 
        fullPage: true 
      });
      console.log('✅ 치명적 오류 스크린샷 저장: admin-fatal-error-ultimate.png');
    } catch (screenshotError) {
      console.log('❌ 스크린샷 저장 실패:', screenshotError.message);
    }
  } finally {
    await browser.close();
    console.log('\n🏁 최종 메뉴 테스트 완료');
  }
}

// 테스트 실행
testAdminMenuUltimate().catch(console.error);
