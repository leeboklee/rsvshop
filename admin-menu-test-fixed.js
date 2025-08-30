const { chromium } = require('playwright');

async function testAdminMenuFixed() {
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
  
  console.log('🚀 Admin 페이지 메뉴 테스트 (수정된 버전) 시작...');
  
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
    await page.waitForTimeout(5000);
    
    // 3. 다양한 선택자로 메뉴 찾기 시도
    console.log('\n🔍 3단계: 메뉴 요소 찾기');
    
    const menuSelectors = [
      'aside a[href*="/admin"]',
      'nav a[href*="/admin"]',
      'a[href*="/admin"]',
      'button[type="button"]',
      '.sidebar a',
      '[role="menuitem"]'
    ];
    
    let allMenuItems = [];
    let usedSelector = '';
    
    for (const selector of menuSelectors) {
      try {
        console.log(`🔍 ${selector} 선택자로 시도 중...`);
        
        const items = await page.$$eval(selector, elements => {
          return elements.map(el => ({
            text: el.textContent?.trim() || 'N/A',
            href: el.href || el.getAttribute('href') || 'N/A',
            title: el.getAttribute('title') || 'N/A',
            tag: el.tagName.toLowerCase(),
            visible: el.offsetParent !== null,
            classes: el.className
          })).filter(item => item.text !== 'N/A' && item.visible && item.text.length > 0);
        });
        
        if (items.length > 0) {
          console.log(`✅ ${selector}로 ${items.length}개 메뉴 발견!`);
          allMenuItems = items;
          usedSelector = selector;
          break;
        } else {
          console.log(`⚠️ ${selector}로 메뉴를 찾을 수 없음`);
        }
      } catch (e) {
        console.log(`❌ ${selector} 선택자 오류: ${e.message}`);
      }
    }
    
    if (allMenuItems.length === 0) {
      console.log('\n❌ 모든 선택자로 메뉴를 찾을 수 없습니다. 페이지 구조를 분석해보겠습니다.');
      
      // 페이지 구조 상세 분석
      const pageAnalysis = await page.evaluate(() => {
        return {
          title: document.title,
          bodyLength: document.body.innerHTML.length,
          navCount: document.querySelectorAll('nav').length,
          asideCount: document.querySelectorAll('aside').length,
          linkCount: document.querySelectorAll('a').length,
          buttonCount: document.querySelectorAll('button').length,
          allLinks: Array.from(document.querySelectorAll('a')).map(a => ({
            text: a.textContent?.trim(),
            href: a.href,
            visible: a.offsetParent !== null
          })).filter(a => a.text && a.text.length > 0),
          allButtons: Array.from(document.querySelectorAll('button')).map(b => ({
            text: b.textContent?.trim(),
            type: b.type,
            visible: b.offsetParent !== null
          })).filter(b => b.text && b.text.length > 0)
        };
      });
      
      console.log('📄 페이지 구조 분석:', pageAnalysis);
      
      // 발견된 링크들 출력
      if (pageAnalysis.allLinks.length > 0) {
        console.log('\n🔗 발견된 모든 링크:');
        pageAnalysis.allLinks.forEach((link, index) => {
          console.log(`  ${index + 1}. ${link.text} - ${link.href} (표시: ${link.visible})`);
        });
      }
      
      // 발견된 버튼들 출력
      if (pageAnalysis.allButtons.length > 0) {
        console.log('\n🔘 발견된 모든 버튼:');
        pageAnalysis.allButtons.forEach((button, index) => {
          console.log(`  ${index + 1}. ${button.text} (타입: ${button.type}, 표시: ${button.visible})`);
        });
      }
      
      // 스크린샷 저장
      await page.screenshot({ path: 'admin-page-analysis.png', fullPage: true });
      console.log('✅ 페이지 분석 스크린샷 저장: admin-page-analysis.png');
      
      return;
    }
    
    console.log(`\n📋 총 ${allMenuItems.length}개 메뉴 항목 발견 (${usedSelector} 사용):`);
    allMenuItems.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.text} - ${item.href} (${item.tag})`);
    });
    
    // 4. 각 메뉴별 테스트
    console.log('\n🖱️ 4단계: 각 메뉴별 테스트');
    
    const testResults = [];
    
    for (let i = 0; i < allMenuItems.length; i++) {
      const item = allMenuItems[i];
      console.log(`\n📌 테스트 중: ${item.text} (${i + 1}/${allMenuItems.length})`);
      
      try {
        let menuElement;
        
        // 선택자에 따라 다른 방법으로 요소 찾기
        if (usedSelector.includes('a[')) {
          menuElement = await page.$(`a[href="${item.href}"]`);
        } else if (usedSelector.includes('button')) {
          menuElement = await page.$(`button:has-text("${item.text}")`);
        } else {
          menuElement = await page.$(`text="${item.text}"`);
        }
        
        if (menuElement) {
          const beforeUrl = page.url();
          
          // 클릭 전 요소 상태 확인
          const isVisible = await menuElement.isVisible();
          const isEnabled = await menuElement.isEnabled();
          
          console.log(`  📍 요소 상태: 표시=${isVisible}, 활성화=${isEnabled}`);
          
          if (isVisible && isEnabled) {
            await menuElement.click();
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
                  loading: document.querySelector('.loading, .spinner') !== null
                };
              });
              
              console.log(`  📄 페이지 정보: ${pageInfo.title}`);
              console.log(`  📝 제목: ${pageInfo.h1}`);
              console.log(`  🔗 URL: ${pageInfo.url}`);
              
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
            
            // 잠시 대기
            await page.waitForTimeout(3000);
            
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
    
    // 5. 테스트 결과 요약
    console.log('\n📊 5단계: 테스트 결과 요약');
    
    const successCount = testResults.filter(r => r.status === 'success').length;
    const errorCount = testResults.filter(r => r.status === 'error').length;
    const timeoutCount = testResults.filter(r => r.status === 'timeout').length;
    const notVisibleCount = testResults.filter(r => r.status === 'not_visible').length;
    const notFoundCount = testResults.filter(r => r.status === 'element_not_found').length;
    
    console.log(`\n📈 테스트 통계:`);
    console.log(`  ✅ 성공: ${successCount}개`);
    console.log(`  ❌ 오류: ${errorCount}개`);
    console.log(`  ⏰ 타임아웃: ${timeoutCount}개`);
    console.log(`  👁️ 표시 안됨: ${notVisibleCount}개`);
    console.log(`  🔍 요소 없음: ${notFoundCount}개`);
    
    // 6. 최종 스크린샷
    console.log('\n📸 6단계: 최종 스크린샷');
    await page.screenshot({ 
      path: 'admin-final-fixed-test.png', 
      fullPage: true 
    });
    console.log('✅ 최종 스크린샷 저장: admin-final-fixed-test.png');
    
    // 7. 테스트 리포트 저장
    const testReport = {
      timestamp: new Date().toISOString(),
      selector: usedSelector,
      totalMenus: allMenuItems.length,
      testResults: testResults,
      errors: errors,
      consoleErrors: consoleErrors,
      summary: {
        success: successCount,
        error: errorCount,
        timeout: timeoutCount,
        notVisible: notVisibleCount,
        notFound: notFoundCount
      }
    };
    
    require('fs').writeFileSync('admin-menu-test-fixed-report.json', JSON.stringify(testReport, null, 2));
    console.log('✅ 테스트 리포트 저장: admin-menu-test-fixed-report.json');
    
  } catch (error) {
    console.error('❌ 테스트 중 치명적 오류 발생:', error.message);
    
    try {
      await page.screenshot({ 
        path: 'admin-fatal-error-fixed.png', 
        fullPage: true 
      });
      console.log('✅ 치명적 오류 스크린샷 저장: admin-fatal-error-fixed.png');
    } catch (screenshotError) {
      console.log('❌ 스크린샷 저장 실패:', screenshotError.message);
    }
  } finally {
    await browser.close();
    console.log('\n🏁 수정된 메뉴 테스트 완료');
  }
}

// 테스트 실행
testAdminMenuFixed().catch(console.error);
