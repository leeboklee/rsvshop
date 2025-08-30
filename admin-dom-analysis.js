const { chromium } = require('playwright');

async function analyzeAdminDOM() {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  console.log('🔍 Admin 페이지 DOM 구조 분석 시작...');
  
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
    
    // 3. DOM 구조 상세 분석
    console.log('\n🔍 3단계: DOM 구조 상세 분석');
    
    const domAnalysis = await page.evaluate(() => {
      // 모든 링크 분석
      const allLinks = Array.from(document.querySelectorAll('a')).map(a => ({
        text: a.textContent?.trim(),
        href: a.href,
        getAttributeHref: a.getAttribute('href'),
        tagName: a.tagName,
        className: a.className,
        id: a.id,
        visible: a.offsetParent !== null,
        parentTag: a.parentElement?.tagName,
        parentClass: a.parentElement?.className,
        innerHTML: a.innerHTML.substring(0, 200)
      })).filter(a => a.text && a.text.length > 0);
      
      // 모든 버튼 분석
      const allButtons = Array.from(document.querySelectorAll('button')).map(b => ({
        text: b.textContent?.trim(),
        type: b.type,
        className: b.className,
        id: b.id,
        visible: b.offsetParent !== null,
        parentTag: b.parentElement?.tagName,
        parentClass: b.parentElement?.className,
        innerHTML: b.innerHTML.substring(0, 200)
      })).filter(b => b.text && b.text.length > 0);
      
      // 사이드바 구조 분석
      const sidebar = document.querySelector('aside');
      const sidebarAnalysis = sidebar ? {
        tagName: sidebar.tagName,
        className: sidebar.className,
        id: sidebar.id,
        children: Array.from(sidebar.children).map(child => ({
          tagName: child.tagName,
          className: child.className,
          textContent: child.textContent?.substring(0, 100)
        }))
      } : null;
      
      // 네비게이션 구조 분석
      const nav = document.querySelector('nav');
      const navAnalysis = nav ? {
        tagName: nav.tagName,
        className: nav.className,
        id: nav.id,
        children: Array.from(nav.children).map(child => ({
          tagName: child.tagName,
          className: child.className,
          textContent: child.textContent?.substring(0, 100)
        }))
      } : null;
      
      return {
        title: document.title,
        url: window.location.href,
        bodyLength: document.body.innerHTML.length,
        totalLinks: allLinks.length,
        totalButtons: allButtons.length,
        allLinks: allLinks,
        allButtons: allButtons,
        sidebar: sidebarAnalysis,
        nav: navAnalysis,
        // admin 관련 링크만 필터링
        adminLinks: allLinks.filter(link => 
          link.href && link.href.includes('/admin')
        ),
        // 텍스트로 admin 관련 링크 찾기
        adminTextLinks: allLinks.filter(link => 
          link.text && (
            link.text.includes('관리') || 
            link.text.includes('대시보드') || 
            link.text.includes('예약') ||
            link.text.includes('호텔') ||
            link.text.includes('패키지') ||
            link.text.includes('결제') ||
            link.text.includes('매출') ||
            link.text.includes('고객') ||
            link.text.includes('DB') ||
            link.text.includes('로그') ||
            link.text.includes('API')
          )
        )
      };
    });
    
    console.log('📊 DOM 분석 결과:');
    console.log(`  📄 페이지 제목: ${domAnalysis.title}`);
    console.log(`  🔗 현재 URL: ${domAnalysis.url}`);
    console.log(`  📏 페이지 크기: ${domAnalysis.bodyLength} 문자`);
    console.log(`  🔗 총 링크 수: ${domAnalysis.totalLinks}`);
    console.log(`  🔘 총 버튼 수: ${domAnalysis.totalButtons}`);
    
    // 사이드바 분석
    if (domAnalysis.sidebar) {
      console.log('\n📋 사이드바 구조:');
      console.log(`  태그: ${domAnalysis.sidebar.tagName}`);
      console.log(`  클래스: ${domAnalysis.sidebar.className}`);
      console.log(`  ID: ${domAnalysis.sidebar.id}`);
      console.log(`  자식 요소 수: ${domAnalysis.sidebar.children.length}`);
      
      domAnalysis.sidebar.children.forEach((child, index) => {
        console.log(`    ${index + 1}. ${child.tagName} - ${child.className}`);
        console.log(`       내용: ${child.textContent}`);
      });
    }
    
    // 네비게이션 분석
    if (domAnalysis.nav) {
      console.log('\n📋 네비게이션 구조:');
      console.log(`  태그: ${domAnalysis.nav.tagName}`);
      console.log(`  클래스: ${domAnalysis.nav.className}`);
      console.log(`  ID: ${domAnalysis.nav.id}`);
      console.log(`  자식 요소 수: ${domAnalysis.nav.children.length}`);
      
      domAnalysis.nav.children.forEach((child, index) => {
        console.log(`    ${index + 1}. ${child.tagName} - ${child.className}`);
        console.log(`       내용: ${child.textContent}`);
      });
    }
    
    // admin 관련 링크 분석
    console.log('\n🔗 Admin 관련 링크 (href 기준):');
    if (domAnalysis.adminLinks.length > 0) {
      domAnalysis.adminLinks.forEach((link, index) => {
        console.log(`  ${index + 1}. ${link.text}`);
        console.log(`     href: ${link.href}`);
        console.log(`     getAttribute('href'): ${link.getAttributeHref}`);
        console.log(`     클래스: ${link.className}`);
        console.log(`     부모: ${link.parentTag} - ${link.parentClass}`);
        console.log(`     표시: ${link.visible}`);
        console.log('');
      });
    } else {
      console.log('  ❌ admin 관련 링크를 찾을 수 없음');
    }
    
    // 텍스트 기반 admin 링크 분석
    console.log('\n🔗 Admin 관련 링크 (텍스트 기준):');
    if (domAnalysis.adminTextLinks.length > 0) {
      domAnalysis.adminTextLinks.forEach((link, index) => {
        console.log(`  ${index + 1}. ${link.text}`);
        console.log(`     href: ${link.href}`);
        console.log(`     getAttribute('href'): ${link.getAttributeHref}`);
        console.log(`     클래스: ${link.className}`);
        console.log(`     부모: ${link.parentTag} - ${link.parentClass}`);
        console.log(`     표시: ${link.visible}`);
        console.log('');
      });
    } else {
      console.log('  ❌ admin 관련 텍스트 링크를 찾을 수 없음');
    }
    
    // 4. 실제 클릭 가능한 요소 찾기
    console.log('\n🖱️ 4단계: 실제 클릭 가능한 요소 찾기');
    
    const clickableElements = await page.$$eval('a, button', elements => {
      return elements.map(el => ({
        tag: el.tagName.toLowerCase(),
        text: el.textContent?.trim(),
        href: el.href || el.getAttribute('href'),
        className: el.className,
        id: el.id,
        visible: el.offsetParent !== null,
        clickable: !el.disabled && el.offsetParent !== null,
        parent: el.parentElement ? {
          tag: el.parentElement.tagName,
          class: el.parentElement.className
        } : null
      })).filter(item => 
        item.text && 
        item.text.length > 0 && 
        item.visible && 
        item.clickable
      );
    });
    
    console.log(`\n📋 클릭 가능한 요소들 (${clickableElements.length}개):`);
    clickableElements.forEach((element, index) => {
      console.log(`  ${index + 1}. ${element.text} (${element.tag})`);
      console.log(`     href: ${element.href}`);
      console.log(`     클래스: ${element.className}`);
      console.log(`     ID: ${element.id}`);
      console.log(`     부모: ${element.parent?.tag} - ${element.parent?.class}`);
      console.log('');
    });
    
    // 5. 스크린샷 저장
    console.log('\n📸 5단계: DOM 분석 스크린샷');
    await page.screenshot({ 
      path: 'admin-dom-analysis.png', 
      fullPage: true 
    });
    console.log('✅ DOM 분석 스크린샷 저장: admin-dom-analysis.png');
    
    // 6. 분석 결과 JSON 저장
    const analysisReport = {
      timestamp: new Date().toISOString(),
      domAnalysis: domAnalysis,
      clickableElements: clickableElements
    };
    
    require('fs').writeFileSync('admin-dom-analysis-report.json', JSON.stringify(analysisReport, null, 2));
    console.log('✅ DOM 분석 리포트 저장: admin-dom-analysis-report.json');
    
  } catch (error) {
    console.error('❌ DOM 분석 중 오류 발생:', error.message);
    
    try {
      await page.screenshot({ 
        path: 'admin-dom-analysis-error.png', 
        fullPage: true 
      });
      console.log('✅ 오류 스크린샷 저장: admin-dom-analysis-error.png');
    } catch (screenshotError) {
      console.log('❌ 스크린샷 저장 실패:', screenshotError.message);
    }
  } finally {
    await browser.close();
    console.log('\n🏁 DOM 분석 완료');
  }
}

// 분석 실행
analyzeAdminDOM().catch(console.error);
