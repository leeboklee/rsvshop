const { chromium } = require('playwright');

async function testAdminSimple() {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  console.log('🚀 Admin 페이지 간단 테스트 시작...');
  
  try {
    // 1. 메인 페이지 접속 (타임아웃 단축)
    console.log('\n📱 1단계: 메인 admin 페이지 접속');
    await page.goto('http://localhost:4900/admin', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    const title = await page.title();
    console.log(`✅ 페이지 제목: ${title}`);
    
    // 2. 기본 메뉴 요소 찾기
    console.log('\n🔍 2단계: 기본 메뉴 요소 찾기');
    
    // 여러 선택자로 메뉴 찾기 시도
    const menuSelectors = [
      'nav a',
      'aside a', 
      '[role="navigation"] a',
      'a[href*="/admin"]',
      'button',
      '.menu a',
      '.sidebar a'
    ];
    
    let menuItems = [];
    for (const selector of menuSelectors) {
      try {
        const items = await page.$$eval(selector, elements => 
          elements.map(el => ({
            text: el.textContent?.trim() || 'N/A',
            href: el.href || el.getAttribute('href') || 'N/A',
            tag: el.tagName.toLowerCase(),
            visible: el.offsetParent !== null
          })).filter(item => item.text !== 'N/A' && item.visible)
        );
        
        if (items.length > 0) {
          console.log(`✅ ${selector}로 ${items.length}개 메뉴 발견`);
          menuItems = items;
          break;
        }
      } catch (e) {
        console.log(`⚠️ ${selector} 선택자 실패: ${e.message}`);
      }
    }
    
    if (menuItems.length === 0) {
      console.log('❌ 메뉴를 찾을 수 없습니다. 페이지 구조를 확인해보겠습니다.');
      
      // 페이지 구조 분석
      const pageStructure = await page.evaluate(() => {
        return {
          title: document.title,
          body: document.body.innerHTML.substring(0, 1000),
          navCount: document.querySelectorAll('nav').length,
          asideCount: document.querySelectorAll('aside').length,
          linkCount: document.querySelectorAll('a').length,
          buttonCount: document.querySelectorAll('button').length
        };
      });
      
      console.log('📄 페이지 구조:', pageStructure);
    } else {
      console.log('\n📋 발견된 메뉴 항목들:');
      menuItems.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.text} (${item.tag}) - ${item.href}`);
      });
      
      // 3. 첫 번째 메뉴 클릭 테스트
      console.log('\n🖱️ 3단계: 첫 번째 메뉴 클릭 테스트');
      
      if (menuItems.length > 0) {
        const firstItem = menuItems[0];
        console.log(`📌 테스트 중: ${firstItem.text}`);
        
        try {
          const menuSelector = `text="${firstItem.text}"`;
          const menuElement = await page.$(menuSelector);
          
          if (menuElement) {
            const beforeUrl = page.url();
            await menuElement.click();
            await page.waitForTimeout(3000);
            
            const afterUrl = page.url();
            console.log(`  ✅ 클릭 성공: ${beforeUrl} → ${afterUrl}`);
            
            // 페이지 내용 확인
            const newTitle = await page.title();
            console.log(`  📄 새 페이지 제목: ${newTitle}`);
            
          } else {
            console.log(`  ❌ 메뉴 요소를 찾을 수 없음: ${firstItem.text}`);
          }
        } catch (error) {
          console.log(`  ❌ 클릭 테스트 실패: ${error.message}`);
        }
      }
    }
    
    // 4. 페이지 스크린샷
    console.log('\n📸 4단계: 페이지 스크린샷');
    await page.screenshot({ 
      path: 'admin-simple-test.png', 
      fullPage: true 
    });
    console.log('✅ 스크린샷 저장: admin-simple-test.png');
    
    // 5. 에러 확인
    console.log('\n🚨 5단계: 에러 확인');
    
    const pageErrors = await page.evaluate(() => {
      return {
        consoleErrors: window.consoleErrors || [],
        pageErrors: window.errors || [],
        hasError: window.onerror !== null
      };
    });
    
    if (pageErrors.consoleErrors.length > 0) {
      console.log(`⚠️ 콘솔 에러: ${pageErrors.consoleErrors.length}개`);
    } else {
      console.log('✅ 콘솔 에러 없음');
    }
    
    if (pageErrors.pageErrors.length > 0) {
      console.log(`⚠️ 페이지 에러: ${pageErrors.pageErrors.length}개`);
    } else {
      console.log('✅ 페이지 에러 없음');
    }
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error.message);
    
    // 에러 발생 시에도 스크린샷 시도
    try {
      await page.screenshot({ 
        path: 'admin-error-screenshot.png', 
        fullPage: true 
      });
      console.log('✅ 에러 스크린샷 저장: admin-error-screenshot.png');
    } catch (screenshotError) {
      console.log('❌ 스크린샷 저장 실패:', screenshotError.message);
    }
  } finally {
    await browser.close();
    console.log('\n🏁 간단 테스트 완료');
  }
}

// 테스트 실행
testAdminSimple().catch(console.error);
