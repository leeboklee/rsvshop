'use client';

import React, { useState } from 'react';

interface ServerErrorDisplayProps {
  error: {
    message: string;
    details?: string;
    code?: string;
    stack?: string;
  };
  onClose?: () => void;
}

export default function ServerErrorDisplay({ error, onClose }: ServerErrorDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const copyErrorToClipboard = () => {
    const errorText = `서버 오류 정보:
오류 메시지: ${error.message}
${error.details ? `상세 정보: ${error.details}` : ''}
${error.code ? `오류 코드: ${error.code}` : ''}
${error.stack ? `스택 트레이스:\n${error.stack}` : ''}
발생 시간: ${new Date().toLocaleString()}
URL: ${window.location.href}`;

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="bg-red-600 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">🚨 서버 오류 발생</h2>
          <div className="flex gap-2">
            <button
              onClick={copyErrorToClipboard}
              className="bg-red-700 hover:bg-red-800 px-3 py-1 rounded text-sm transition-colors"
              title="오류 정보 복사"
            >
              📋 복사
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="bg-red-700 hover:bg-red-800 px-3 py-1 rounded text-sm transition-colors"
              >
                ✕ 닫기
              </button>
            )}
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">오류 메시지:</h3>
              <div className="bg-red-50 border border-red-200 rounded p-3 text-red-800">
                {error.message}
              </div>
            </div>

            {error.details && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">상세 정보:</h3>
                <div className="bg-gray-50 border border-gray-200 rounded p-3 text-gray-700">
                  <pre className="whitespace-pre-wrap text-sm">{error.details}</pre>
                </div>
              </div>
            )}

            {error.code && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">오류 코드:</h3>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-blue-800 font-mono text-sm">
                  {error.code}
                </div>
              </div>
            )}

            {error.stack && (
              <div>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="font-semibold text-gray-800 mb-2 hover:text-gray-600 transition-colors"
                >
                  {isExpanded ? '▼' : '▶'} 스택 트레이스 {isExpanded ? '숨기기' : '보기'}
                </button>
                {isExpanded && (
                  <div className="bg-gray-900 text-green-400 border border-gray-700 rounded p-3 font-mono text-xs overflow-x-auto">
                    <pre className="whitespace-pre-wrap">{error.stack}</pre>
                  </div>
                )}
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">💡 해결 방법:</h4>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• 위의 "복사" 버튼을 클릭하여 오류 정보를 클립보드에 복사하세요</li>
                <li>• 개발자에게 오류 정보를 전달하여 문제를 해결할 수 있습니다</li>
                <li>• 페이지를 새로고침하거나 잠시 후 다시 시도해보세요</li>
                <li>• 문제가 지속되면 관리자에게 문의하세요</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
