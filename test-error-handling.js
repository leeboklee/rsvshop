#!/usr/bin/env node

/**
 * RSVShop 에러 처리 시스템 테스트 스크립트
 * 다양한 유형의 오류를 발생시켜 에러 처리 시스템을 테스트합니다.
 */

const http = require('http');

const BASE_URL = 'http://localhost:4900';
const API_URL = `${BASE_URL}/api/admin/error-report`;

// 테스트 결과 저장
const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// 테스트 헬퍼 함수
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function assert(condition, message) {
  if (condition) {
    testResults.passed++;
    log(`PASS: ${message}`, 'success');
  } else {
    testResults.failed++;
    log(`FAIL: ${message}`, 'error');
    testResults.errors.push(message);
  }
}

// HTTP 요청 헬퍼
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// 테스트 케이스들
async function testErrorReportAPI() {
  log('🧪 에러 리포트 API 테스트 시작...');
  
  try {
    // 1. GET 요청으로 통계 조회
    log('테스트 1: GET /api/admin/error-report (통계 조회)');
    const getResponse = await makeRequest(API_URL, { method: 'GET' });
    assert(getResponse.status === 200, 'GET 요청이 성공적으로 처리됨');
    assert(getResponse.data.success === true, '응답에 success 필드가 포함됨');
    assert(getResponse.data.stats, '응답에 stats 필드가 포함됨');
    
    // 2. POST 요청으로 오류 데이터 전송
    log('테스트 2: POST /api/admin/error-report (오류 데이터 전송)');
    const errorData = {
      type: 'javascript',
      message: '테스트용 JavaScript 오류',
      timestamp: new Date().toISOString(),
      userAgent: 'TestScript/1.0',
      errorId: `test-${Date.now()}`,
      sessionId: `session-${Date.now()}`
    };
    
    const postResponse = await makeRequest(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorData)
    });
    
    assert(postResponse.status === 200, 'POST 요청이 성공적으로 처리됨');
    assert(postResponse.data.success === true, '응답에 success 필드가 포함됨');
    assert(postResponse.data.errorId, '응답에 errorId 필드가 포함됨');
    
    // 3. 잘못된 데이터로 POST 요청 테스트
    log('테스트 3: 잘못된 데이터로 POST 요청 테스트');
    const invalidData = { type: 'invalid' };
    
    const invalidResponse = await makeRequest(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidData)
    });
    
    assert(invalidResponse.status === 400, '잘못된 데이터에 대해 400 에러 반환');
    
    // 4. 업데이트된 통계 확인
    log('테스트 4: 업데이트된 통계 확인');
    const updatedResponse = await makeRequest(API_URL, { method: 'GET' });
    assert(updatedResponse.status === 200, '업데이트된 통계 조회 성공');
    
    const beforeStats = getResponse.data.stats;
    const afterStats = updatedResponse.data.stats;
    assert(afterStats.total > beforeStats.total, '오류 수가 증가함');
    
  } catch (error) {
    log(`테스트 실행 중 오류 발생: ${error.message}`, 'error');
    testResults.failed++;
    testResults.errors.push(`테스트 실행 오류: ${error.message}`);
  }
}

async function testErrorPages() {
  log('🧪 에러 페이지 테스트 시작...');
  
  try {
    // 1. 전역 에러 페이지 접근 테스트 (리다이렉트 예상)
    log('테스트 1: 전역 에러 페이지 접근 (리다이렉트)');
    const globalErrorResponse = await makeRequest(`${BASE_URL}/global-error`);
    assert(globalErrorResponse.status === 307 || globalErrorResponse.status === 302, '전역 에러 페이지가 리다이렉트됨');
    
    // 2. 관리자 에러 페이지 접근 테스트 (404 예상)
    log('테스트 2: 관리자 에러 페이지 접근 (404)');
    const adminErrorResponse = await makeRequest(`${BASE_URL}/admin/error`);
    assert(adminErrorResponse.status === 404, '관리자 에러 페이지가 404 반환');
    
    // 3. 존재하지 않는 페이지 테스트 (리다이렉트 예상)
    log('테스트 3: 존재하지 않는 페이지 테스트 (리다이렉트)');
    const notFoundResponse = await makeRequest(`${BASE_URL}/non-existent-page`);
    assert(notFoundResponse.status === 307 || notFoundResponse.status === 302, '존재하지 않는 페이지가 리다이렉트됨');
    
  } catch (error) {
    log(`에러 페이지 테스트 중 오류 발생: ${error.message}`, 'error');
    testResults.failed++;
    testResults.errors.push(`에러 페이지 테스트 오류: ${error.message}`);
  }
}

async function testServerHealth() {
  log('🧪 서버 상태 테스트 시작...');
  
  try {
    // 1. 서버 응답성 테스트
    log('테스트 1: 서버 응답성 테스트');
    const healthResponse = await makeRequest(`${BASE_URL}/`);
    assert(healthResponse.status === 200 || healthResponse.status === 302, '서버가 응답함');
    
    // 2. API 엔드포인트 가용성 테스트
    log('테스트 2: API 엔드포인트 가용성 테스트');
    const apiResponse = await makeRequest(`${BASE_URL}/api/admin/error-report`);
    assert(apiResponse.status === 200, 'API 엔드포인트가 정상 작동함');
    
  } catch (error) {
    log(`서버 상태 테스트 중 오류 발생: ${error.message}`, 'error');
    testResults.failed++;
    testResults.errors.push(`서버 상태 테스트 오류: ${error.message}`);
  }
}

// 메인 테스트 실행
async function runAllTests() {
  log('🚀 RSVShop 에러 처리 시스템 테스트 시작');
  log('=====================================');
  
  const startTime = Date.now();
  
  try {
    await testServerHealth();
    await testErrorReportAPI();
    await testErrorPages();
    
  } catch (error) {
    log(`전체 테스트 실행 중 오류 발생: ${error.message}`, 'error');
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // 테스트 결과 요약
  log('=====================================');
  log('📊 테스트 결과 요약');
  log(`✅ 통과: ${testResults.passed}`);
  log(`❌ 실패: ${testResults.failed}`);
  log(`⏱️  소요시간: ${duration}ms`);
  
  if (testResults.errors.length > 0) {
    log('❌ 발생한 오류들:');
    testResults.errors.forEach((error, index) => {
      log(`   ${index + 1}. ${error}`);
    });
  }
  
  if (testResults.failed === 0) {
    log('🎉 모든 테스트가 통과했습니다!', 'success');
    process.exit(0);
  } else {
    log('💥 일부 테스트가 실패했습니다.', 'error');
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  runAllTests().catch(error => {
    log(`치명적 오류 발생: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = {
  testErrorReportAPI,
  testErrorPages,
  testServerHealth,
  runAllTests
};
