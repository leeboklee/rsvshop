import { test, expect } from '@playwright/test';

// 포트 설정 가져오기
const PORT_CONFIG = require('../config/port-config');

test('check styles on reservation management page', async ({ page }) => {
  await page.goto(`${PORT_CONFIG.TEST_BASE_URL}/reservations/manage`);
  
  // 페이지가 로드될 때까지 대기
  await page.waitForLoadState('networkidle');
  
  // 기본 스타일 확인
  await expect(page).toHaveScreenshot('reservation-management-styles.png');
}); 