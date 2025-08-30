const { chromium } = require('playwright');

async function testAdminDeep() {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
  });
  
  const page = await context.newPage();
  
  // 에러 수집을 위한 리스너 설정
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
  
  console.log('🚀 Admin 페이지 심층 테스트 시작...');
  
  try {
    // 1. 메인 페이지 접속
    console.log('\n📱 1단계: 메인 admin 페이지 접속');
    await page.goto('http://localhost:4900/admin', { waitUntil: 'networkidle' });
    
    const title = await page.title();
    console.log(`✅ 페이지 제목: ${title}`);
    
    // 2. 사이드바 메뉴 구조 분석
    console.log('\n🔍 2단계: 사이드바 메뉴 구조 분석');
    
    const sidebarMenu = await page.$$eval('nav, aside, [role="navigation"]', elements => {
      return elements.map(nav => {
        const links = nav.querySelectorAll('a, button, [role="menuitem"]');
        return Array.from(links).map(link => ({
          text: link.textContent?.trim() || 'N/A',
          href: link.href || link.getAttribute('href') || 'N/A',
          tag: link.tagName.toLowerCase(),
          classes: link.className,
          disabled: link.disabled || link.hasAttribute('disabled'),
          visible: link.offsetParent !== null
        }));
      });
    });
    
    console.log('📋 사이드바 메뉴 구조:');
    sidebarMenu.forEach((nav, navIndex) => {
      console.log(`  네비게이션 ${navIndex + 1}:`);
      nav.forEach((item, itemIndex) => {
        console.log(`    ${itemIndex + 1}. ${item.text} (${item.tag}) - ${item.href}`);
        console.log(`       상태: ${item.disabled ? '비활성화' : '활성화'}, 표시: ${item.visible ? '보임' : '숨김'}`);
      });
    });
    
    // 3. 각 메뉴별 상세 테스트
    console.log('\n🖱️ 3단계: 메뉴별 상세 기능 테스트');
    
    const allMenuItems = sidebarMenu.flat();
    
    for (let i = 0; i < allMenuItems.length; i++) {
      const item = allMenuItems[i];
      if (!item.visible || item.disabled) continue;
      
      try {
        console.log(`\n📌 테스트 중: ${item.text}`);
        
        // 메뉴 클릭
        const menuSelector = `text="${item.text}"`;
        const menuElement = await page.$(menuSelector);
        
        if (menuElement) {
          // 클릭 전 상태 저장
          const beforeUrl = page.url();
          
          await menuElement.click();
          await page.waitForTimeout(2000);
          
          const afterUrl = page.url();
          console.log(`  ✅ 클릭 성공: ${beforeUrl} → ${afterUrl}`);
          
          // 페이지 로딩 상태 확인
          try {
            await page.waitForLoadState('networkidle', { timeout: 10000 });
            console.log(`  ✅ 페이지 로딩 완료`);
          } catch (timeoutError) {
            console.log(`  ⚠️ 페이지 로딩 타임아웃`);
          }
          
          // 에러 확인
          if (errors.length > 0) {
            console.log(`  🚨 페이지 에러 발견:`, errors.slice(-3));
          }
          
          if (consoleErrors.length > 0) {
            console.log(`  🚨 콘솔 에러 발견:`, consoleErrors.slice(-3));
          }
          
          // 페이지 내용 확인
          const pageContent = await page.evaluate(() => {
            return {
              title: document.title,
              h1: document.querySelector('h1')?.textContent?.trim(),
              mainContent: document.querySelector('main, [role="main"]')?.textContent?.substring(0, 200) || 'N/A'
            };
          });
          
          console.log(`  📄 페이지 내용: ${pageContent.title} - ${pageContent.h1}`);
          
          // 스크린샷 저장
          const screenshotName = `admin-${item.text.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
          await page.screenshot({ path: screenshotName, fullPage: true });
          console.log(`  📸 스크린샷 저장: ${screenshotName}`);
          
        } else {
          console.log(`  ❌ 메뉴 요소를 찾을 수 없음: ${item.text}`);
        }
        
      } catch (error) {
        console.log(`  ❌ 테스트 실패: ${item.text} - ${error.message}`);
      }
    }
    
    // 4. 전체 페이지 상태 분석
    console.log('\n📊 4단계: 전체 페이지 상태 분석');
    
    const pageAnalysis = await page.evaluate(() => {
      return {
        // DOM 요소 수
        totalElements: document.querySelectorAll('*').length,
        // 이미지 수
        images: document.querySelectorAll('img').length,
        // 스크립트 수
        scripts: document.querySelectorAll('script').length,
        // 스타일시트 수
        stylesheets: document.querySelectorAll('link[rel="stylesheet"]').length,
        // 폼 요소 수
        forms: document.querySelectorAll('form').length,
        // 버튼 수
        buttons: document.querySelectorAll('button').length,
        // 링크 수
        links: document.querySelectorAll('a').length,
        // 메모리 사용량 (가능한 경우)
        memory: performance.memory ? {
          used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
        } : null
      };
    });
    
    console.log('📈 페이지 분석 결과:');
    console.log(`  총 DOM 요소: ${pageAnalysis.totalElements}`);
    console.log(`  이미지: ${pageAnalysis.images}`);
    console.log(`  스크립트: ${pageAnalysis.scripts}`);
    console.log(`  스타일시트: ${pageAnalysis.stylesheets}`);
    console.log(`  폼: ${pageAnalysis.forms}`);
    console.log(`  버튼: ${pageAnalysis.buttons}`);
    console.log(`  링크: ${pageAnalysis.links}`);
    
    if (pageAnalysis.memory) {
      console.log(`  메모리 사용량: ${pageAnalysis.memory.used}MB / ${pageAnalysis.memory.total}MB (제한: ${pageAnalysis.memory.limit}MB)`);
    }
    
    // 5. 에러 요약
    console.log('\n🚨 5단계: 에러 요약');
    
    if (errors.length > 0) {
      console.log(`📊 총 페이지 에러: ${errors.length}개`);
      errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.type}: ${error.message}`);
      });
    } else {
      console.log('✅ 페이지 에러 없음');
    }
    
    if (consoleErrors.length > 0) {
      console.log(`📊 총 콘솔 에러: ${consoleErrors.length}개`);
      consoleErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.type}: ${error.message}`);
      });
    } else {
      console.log('✅ 콘솔 에러 없음');
    }
    
    // 6. 최종 스크린샷
    console.log('\n📸 6단계: 최종 전체 페이지 스크린샷');
    await page.screenshot({ 
      path: 'admin-final-complete.png', 
      fullPage: true 
    });
    console.log('✅ 최종 스크린샷 저장: admin-final-complete.png');
    
  } catch (error) {
    console.error('❌ 테스트 중 치명적 오류 발생:', error);
  } finally {
    await browser.close();
    console.log('\n🏁 심층 테스트 완료');
    
    // 에러 요약 출력
    if (errors.length > 0 || consoleErrors.length > 0) {
      console.log('\n📋 최종 에러 요약:');
      console.log(`페이지 에러: ${errors.length}개, 콘솔 에러: ${consoleErrors.length}개`);
    }
  }
}

// 테스트 실행
testAdminDeep().catch(console.error);
