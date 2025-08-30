'use client';

import { useEffect } from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🛠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            관리자 페이지 오류
          </h1>
          <p className="text-gray-600 mb-6">
            관리자 페이지에서 오류가 발생했습니다. React Hook 규칙 위반으로 인한 문제일 수 있습니다.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              페이지 새로고침
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              홈으로 돌아가기
            </button>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                오류 상세 정보
              </summary>
              <div className="mt-2 p-3 bg-red-50 rounded text-xs font-mono text-red-800 overflow-auto">
                <div><strong>Error:</strong> {error.message}</div>
                {error.digest && <div><strong>Digest:</strong> {error.digest}</div>}
                {error.stack && (
                  <>
                    <div><strong>Stack:</strong></div>
                    <pre className="whitespace-pre-wrap">{error.stack}</pre>
                  </>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}


