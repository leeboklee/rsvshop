'use client';

import { useState } from 'react';
import { errorMonitor } from '@/lib/errorMonitor';
import { ErrorBoundary } from './error-boundary';
import ErrorComponent from './error-component';
import ErrorLogViewer from './error-log-viewer';

export default function TestErrorPage() {
  const [errorCount, setErrorCount] = useState(0);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [shouldError, setShouldError] = useState(false);

  // JavaScript 오류 발생
  const triggerJavaScriptError = () => {
    try {
      throw new Error('테스트용 JavaScript 오류입니다.');
    } catch (error) {
      console.error('JavaScript 오류:', error);
    }
  };

  // Promise 오류 발생
  const triggerPromiseError = () => {
    Promise.reject(new Error('테스트용 Promise 오류입니다.'));
  };

  // React 오류 발생
  const triggerReactError = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('react-error', {
        detail: {
          message: '테스트용 React 오류입니다.',
          stack: new Error().stack,
          componentStack: 'TestErrorPage'
        }
      }));
    }
  };

  // 네트워크 오류 발생
  const triggerNetworkError = () => {
    fetch('/api/non-existent-endpoint')
      .catch(error => console.error('네트워크 오류:', error));
  };

  // 의도적인 컴포넌트 오류
  const triggerComponentError = () => {
    setShouldError(true);
  };

  // 오류 모니터링 시작/중지
  const toggleMonitoring = () => {
    if (isMonitoring) {
      errorMonitor.stopMonitoring();
      setIsMonitoring(false);
    } else {
      errorMonitor.startMonitoring();
      setIsMonitoring(true);
    }
  };

  // 오류 통계 확인
  const checkErrorStats = () => {
    const stats = errorMonitor.getErrorStats();
    setErrorCount(stats.errorCount);
    setIsMonitoring(stats.isMonitoring);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🧪 에러 처리 테스트 페이지
          </h1>
          <p className="text-gray-600 mb-6">
            다양한 유형의 오류를 발생시켜 에러 처리 시스템을 테스트할 수 있습니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">오류 모니터링 상태</h3>
              <p className="text-blue-700">
                모니터링: {isMonitoring ? '🟢 활성화' : '🔴 비활성화'}
              </p>
              <p className="text-blue-700">
                감지된 오류: {errorCount}개
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">테스트 결과</h3>
              <p className="text-green-700">
                브라우저 콘솔과 네트워크 탭을 확인하여 오류 처리 동작을 관찰하세요.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={toggleMonitoring}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                isMonitoring
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isMonitoring ? '🛑 오류 모니터링 중지' : '🟢 오류 모니터링 시작'}
            </button>

            <button
              onClick={checkErrorStats}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              📊 오류 통계 확인
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-900 mb-3">JavaScript 오류</h3>
            <p className="text-sm text-gray-600 mb-3">
              일반적인 JavaScript 오류를 발생시킵니다.
            </p>
            <button
              onClick={triggerJavaScriptError}
              className="w-full py-2 px-3 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
            >
              🚨 JavaScript 오류 발생
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Promise 오류</h3>
            <p className="text-sm text-gray-600 mb-3">
              처리되지 않은 Promise 오류를 발생시킵니다.
            </p>
            <button
              onClick={triggerPromiseError}
              className="w-full py-2 px-3 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
            >
              ⚠️ Promise 오류 발생
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-900 mb-3">React 오류</h3>
            <p className="text-sm text-gray-600 mb-3">
              React 컴포넌트 오류를 시뮬레이션합니다.
            </p>
            <button
              onClick={triggerReactError}
              className="w-full py-2 px-3 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              ⚛️ React 오류 발생
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-900 mb-3">네트워크 오류</h3>
            <p className="text-sm text-gray-600 mb-3">
              존재하지 않는 API 엔드포인트에 요청을 보냅니다.
            </p>
            <button
              onClick={triggerNetworkError}
              className="w-full py-2 px-3 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              🌐 네트워크 오류 발생
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-900 mb-3">컴포넌트 오류</h3>
            <p className="text-sm text-gray-600 mb-3">
              컴포넌트에서 의도적으로 오류를 발생시킵니다.
            </p>
            <button
              onClick={triggerComponentError}
              className="w-full py-2 px-3 bg-pink-600 text-white rounded hover:bg-pink-700 transition-colors"
            >
              💥 컴포넌트 오류 발생
            </button>
            <button
              onClick={() => setShouldError(false)}
              className="w-full mt-2 py-2 px-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              ✅ 오류 해결
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-900 mb-3">테스트 가이드</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>1. 모니터링을 시작하세요</p>
              <p>2. 각 오류 유형을 테스트하세요</p>
              <p>3. 브라우저 콘솔을 확인하세요</p>
              <p>4. 네트워크 탭을 확인하세요</p>
            </div>
          </div>
        </div>

        {/* ErrorBoundary 테스트 섹션 */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🛡️ ErrorBoundary 테스트
          </h2>
          <p className="text-gray-600 mb-4">
            아래 컴포넌트는 ErrorBoundary로 감싸져 있어 오류가 발생해도 전체 페이지가 중단되지 않습니다.
          </p>
          
          <ErrorBoundary>
            <ErrorComponent shouldError={shouldError} />
          </ErrorBoundary>
        </div>

        {/* 에러 로그 뷰어 */}
        <ErrorLogViewer />

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📋 테스트 체크리스트
          </h2>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="monitoring" className="rounded" />
              <label htmlFor="monitoring">오류 모니터링이 정상적으로 시작/중지되는지 확인</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="javascript" className="rounded" />
              <label htmlFor="javascript">JavaScript 오류가 콘솔에 기록되는지 확인</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="promise" className="rounded" />
              <label htmlFor="promise">Promise 오류가 감지되는지 확인</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="react" className="rounded" />
              <label htmlFor="react">React 오류 이벤트가 발생하는지 확인</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="network" className="rounded" />
              <label htmlFor="network">네트워크 오류가 감지되는지 확인</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="stats" className="rounded" />
              <label htmlFor="stats">오류 통계가 정확하게 업데이트되는지 확인</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
