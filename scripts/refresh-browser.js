const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const PORT_CONFIG = require('../config/port-config');

async function refreshBrowser() {
  try {
    // Chrome에서 중앙 설정 포트 탭 찾기
    const { stdout } = await execAsync('tasklist /fi "imagename eq chrome.exe" /fo csv');
    
    if (stdout.includes('chrome.exe')) {
      // Chrome이 실행 중이면 기존 탭 새로고침 (새 창 생성하지 않음)
      console.log('[브라우저] 기존 Chrome 탭 새로고침 중...');
      await execAsync(`start chrome ${PORT_CONFIG.BROWSER_URL}`);
    } else {
      // Chrome이 없으면 새로 시작
      console.log('[브라우저] Chrome 새로 시작 중...');
      await execAsync(`start chrome ${PORT_CONFIG.BROWSER_URL}`);
    }
    
    console.log('[완료] 브라우저 새로고침 완료');
  } catch (error) {
    console.error('[오류] 브라우저 새로고침 실패:', error.message);
  }
}

module.exports = { refreshBrowser };

// 직접 실행 시
if (require.main === module) {
  refreshBrowser();
} 