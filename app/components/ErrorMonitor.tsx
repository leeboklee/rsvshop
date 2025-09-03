'use client';

import React, { useState, useEffect } from 'react';

interface ErrorInfo {
  message: string;
  stack?: string;
  timestamp: string;
  url: string;
  userAgent: string;
}

interface ErrorMonitorProps {
  isActive?: boolean;
}

export default function ErrorMonitor({ isActive = true }: ErrorMonitorProps) {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    // 전역 오류 핸들러
    const handleError = (event: ErrorEvent) => {
      const errorInfo: ErrorInfo = {
        message: event.message,
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };
      setErrors(prev => [errorInfo, ...prev.slice(0, 9)]); // 최대 10개 유지
    };

    // Promise rejection 핸들러
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorInfo: ErrorInfo = {
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };
      setErrors(prev => [errorInfo, ...prev.slice(0, 9)]);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [isActive]);

  const copyErrorToClipboard = (error: ErrorInfo) => {
    const errorText = `오류 발생 시간: ${error.timestamp}
URL: ${error.url}
오류 메시지: ${error.message}
${error.stack ? `스택 트레이스:\n${error.stack}` : ''}
사용자 에이전트: ${error.userAgent}`;

    navigator.clipboard.writeText(errorText).then(() => {
      alert('오류 정보가 클립보드에 복사되었습니다!');
    }).catch(() => {
      // 폴백: 텍스트 영역 사용
      const textArea = document.createElement('textarea');
      textArea.value = errorText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('오류 정보가 클립보드에 복사되었습니다!');
    });
  };

  const copyAllErrorsToClipboard = () => {
    const allErrorsText = errors.map((error, index) => 
      `=== 오류 ${index + 1} ===
오류 발생 시간: ${error.timestamp}
URL: ${error.url}
오류 메시지: ${error.message}
${error.stack ? `스택 트레이스:\n${error.stack}` : ''}
사용자 에이전트: ${error.userAgent}

`
    ).join('\n');

    navigator.clipboard.writeText(allErrorsText).then(() => {
      alert('모든 오류 정보가 클립보드에 복사되었습니다!');
    }).catch(() => {
      const textArea = document.createElement('textarea');
      textArea.value = allErrorsText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('모든 오류 정보가 클립보드에 복사되었습니다!');
    });
  };

  const clearErrors = () => {
    setErrors([]);
  };

  if (!isActive || errors.length === 0) {
    return null;
  }

  return (
    <>
      {/* 오류 모니터 토글 버튼 */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center gap-2"
        >
          <span className="text-sm font-medium">🚨 오류 모니터</span>
          <span className="bg-red-800 text-xs px-2 py-1 rounded-full">
            {errors.length}
          </span>
        </button>
      </div>

      {/* 오류 모니터 패널 */}
      {isVisible && (
        <div className="fixed bottom-20 right-4 w-96 max-h-96 bg-white border border-gray-300 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between">
            <h3 className="font-semibold">오류 모니터 ({errors.length}개)</h3>
            <div className="flex gap-2">
              <button
                onClick={copyAllErrorsToClipboard}
                className="text-xs bg-red-700 hover:bg-red-800 px-2 py-1 rounded transition-colors"
                title="모든 오류 복사"
              >
                📋 전체 복사
              </button>
              <button
                onClick={clearErrors}
                className="text-xs bg-red-700 hover:bg-red-800 px-2 py-1 rounded transition-colors"
                title="오류 목록 지우기"
              >
                🗑️ 지우기
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="text-xs bg-red-700 hover:bg-red-800 px-2 py-1 rounded transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {errors.map((error, index) => (
              <div key={index} className="border-b border-gray-200 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-red-600 truncate" title={error.message}>
                      {error.message}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(error.timestamp).toLocaleString()}
                    </div>
                    {error.stack && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                          스택 트레이스 보기
                        </summary>
                        <pre className="text-xs text-gray-700 mt-1 whitespace-pre-wrap overflow-x-auto">
                          {error.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                  <button
                    onClick={() => copyErrorToClipboard(error)}
                    className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition-colors flex-shrink-0"
                    title="이 오류 복사"
                  >
                    📋
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
