const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const playwright = require('playwright');

const LOGS_DIR = path.join(__dirname, '../logs');
if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR);

// --- 포트 관리 ---
async function cleanupPorts(ports = [3900, 4000, 4001]) {
  console.log(`${ports.join(', ')}번 포트를 정리합니다.`);
  for (const port of ports) {
    try {
      execSync(`npx kill-port ${port}`);
      console.log(`포트 ${port} 정리 완료.`);
    } catch (error) {
      console.log(`포트 ${port}는 이미 비어있습니다.`);
    }
  }
}

// --- 브라우저 제어 ---
async function launchBrowser() {
  console.log('브라우저를 실행합니다...');
  return await playwright.chromium.launch({ headless: true });
}

async function captureScreenshot(page, url, filePath) {
    console.log(`스크린샷을 캡처합니다: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle' });
    const screenshotPath = path.join(LOGS_DIR, filePath || `screenshot-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`스크린샷 저장 완료: ${screenshotPath}`);
    return screenshotPath;
}

// --- 정보 캡처 ---
async function captureConsoleLogs(page) {
    console.log('콘솔 로그를 수집합니다...');
    const logs = [];
    page.on('console', msg => logs.push({ type: msg.type(), text: msg.text() }));
    return logs;
}

async function captureDom(page) {
    console.log('DOM 스냅샷을 캡처합니다...');
    return await page.content();
}


// --- 메인 실행 로직 ---
async function run(task, url) {
  await cleanupPorts();
  const browser = await launchBrowser();
  const page = await browser.newPage();
  
  try {
    const consoleLogs = await captureConsoleLogs(page);
    
    switch(task) {
      case 'screenshot':
        await captureScreenshot(page, url);
        break;
      case 'dom':
        const dom = await captureDom(page);
        fs.writeFileSync(path.join(LOGS_DIR, `dom-${Date.now()}.html`), dom);
        break;
      // 다른 태스크 추가 가능
      default:
        console.log('지원되지 않는 태스크입니다.');
    }

    fs.writeFileSync(path.join(LOGS_DIR, `console-${Date.now()}.json`), JSON.stringify(consoleLogs, null, 2));

  } finally {
    await browser.close();
    console.log('브라우저를 종료했습니다.');
  }
}

// --- CLI 인터페이스 ---
if (require.main === module) {
  const [,, task, url] = process.argv;
  if (!task || !url) {
    console.log('사용법: node scripts/unified-debug-agent.js <task> <url>');
    console.log('  <task>: screenshot, dom 등');
    process.exit(1);
  }
  run(task, url).catch(console.error);
}

module.exports = { run, cleanupPorts, launchBrowser, captureScreenshot, captureConsoleLogs, captureDom }; 