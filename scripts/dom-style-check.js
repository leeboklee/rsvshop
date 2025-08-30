const { chromium } = require('playwright');

const url = process.argv[2] || 'http://localhost:3900/admin';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // 주요 요소/클래스 자동 감지 + 시각적 속성 분석
  const result = await page.evaluate(() => {
    function count(selector) {
      return document.querySelectorAll(selector).length;
    }
    function isVisible(selector) {
      const el = document.querySelector(selector);
      if (!el) return false;
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetWidth > 0 && el.offsetHeight > 0;
    }
    function getStyle(selector, prop) {
      const el = document.querySelector(selector);
      if (!el) return null;
      return window.getComputedStyle(el)[prop];
    }
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    return {
      cardCount: count('.card'),
      btnCount: count('.btn'),
      titleCount: count('.title'),
      gridCount: count('.grid'),
      cardVisible: isVisible('.card'),
      btnVisible: isVisible('.btn'),
      titleVisible: isVisible('.title'),
      mainWidth: document.body.offsetWidth,
      mainHeight: document.body.offsetHeight,
      viewport,
      cardRects: Array.from(document.querySelectorAll('.card')).map(el => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          background: style.backgroundColor,
          overflow: style.overflow,
        };
      }),
      btnRects: Array.from(document.querySelectorAll('.btn')).map(el => el.getBoundingClientRect()),
    };
  });

  // 리포트 출력
  console.log('=== DOM+스타일+시각 속성 자동 감지 리포트 ===');
  console.log(`.card 개수: ${result.cardCount}, .btn 개수: ${result.btnCount}, .title 개수: ${result.titleCount}, .grid 개수: ${result.gridCount}`);
  console.log(`.card 화면 표시: ${result.cardVisible}, .btn 표시: ${result.btnVisible}, .title 표시: ${result.titleVisible}`);
  if (result.cardCount === 0) console.log('오류: .card 요소 없음');
  if (result.btnCount === 0) console.log('오류: .btn 요소 없음');
  if (result.titleCount === 0) console.log('오류: .title 요소 없음');
  if (!result.cardVisible) console.log('오류: .card가 화면에 보이지 않음');
  if (!result.btnVisible) console.log('오류: .btn이 화면에 보이지 않음');
  if (!result.titleVisible) console.log('오류: .title이 화면에 보이지 않음');
  // 카드 위치/크기/색상/overflow 체크
  result.cardRects.forEach((rect, i) => {
    if (rect.top > result.viewport.height || rect.left > result.viewport.width) {
      console.log(`오류: .card[${i}]가 뷰포트 밖에 위치함 (top:${rect.top}, left:${rect.left})`);
    }
    if (rect.width < 100 || rect.height < 50) {
      console.log(`경고: .card[${i}] 크기 비정상 (width:${rect.width}, height:${rect.height})`);
    }
    if (rect.width > result.viewport.width * 0.95) {
      console.log(`오류: .card[${i}]가 화면을 거의 다 차지함 (width:${rect.width}, viewport:${result.viewport.width})`);
    }
    if (rect.background === 'rgb(0, 0, 255)' || rect.background === '#0000ff') {
      console.log(`경고: .card[${i}] 배경색이 비정상(파랑) (background:${rect.background})`);
    }
    if (rect.overflow && rect.overflow !== 'visible') {
      console.log(`경고: .card[${i}] overflow 속성 비정상 (overflow:${rect.overflow})`);
    }
  });
  await browser.close();
})(); 