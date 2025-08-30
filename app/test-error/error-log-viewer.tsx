'use client';

import { useState, useEffect } from 'react';

interface ErrorLog {
  type: string;
  message: string;
  timestamp: string;
  errorId: string;
  sessionId: string;
}

interface ErrorStats {
  total: number;
  byType: Record<string, number>;
  bySession: Record<string, number>;
  recent: ErrorLog[];
}

export default function ErrorLogViewer() {
  const [errorStats, setErrorStats] = useState<ErrorStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 에러 통계 가져오기
  const fetchErrorStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/error-report');
      if (response.ok) {
        const data = await response.json();
        setErrorStats(data.stats);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('에러 통계 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 주기적으로 에러 통계 업데이트
  useEffect(() => {
    fetchErrorStats();
    
    const interval = setInterval(fetchErrorStats, 5000); // 5초마다 업데이트
    
    return () => clearInterval(interval);
  }, []);

  if (!errorStats) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📊 에러 로그 뷰어
        </h3>
        <div className="text-center py-8">
          {isLoading ? (
            <div className="text-gray-600">로딩 중...</div>
          ) : (
            <div className="text-gray-500">에러 데이터가 없습니다.</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          📊 에러 로그 뷰어
        </h3>
        <button
          onClick={fetchErrorStats}
          disabled={isLoading}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? '새로고침 중...' : '새로고침'}
        </button>
      </div>

      {lastUpdated && (
        <p className="text-sm text-gray-500 mb-4">
          마지막 업데이트: {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      {/* 전체 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-900">{errorStats.total}</div>
          <div className="text-sm text-blue-700">총 오류 수</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-900">
            {Object.keys(errorStats.byType).length}
          </div>
          <div className="text-sm text-green-700">오류 유형</div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-900">
            {Object.keys(errorStats.bySession).length}
          </div>
          <div className="text-sm text-purple-700">세션 수</div>
        </div>
      </div>

      {/* 오류 유형별 통계 */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">오류 유형별 통계</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(errorStats.byType).map(([type, count]) => (
            <div key={type} className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-lg font-semibold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600 capitalize">{type}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 최근 오류 목록 */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">최근 오류 목록</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {errorStats.recent.length === 0 ? (
            <div className="text-gray-500 text-center py-4">
              최근 오류가 없습니다.
            </div>
          ) : (
            errorStats.recent.map((error, index) => (
              <div key={error.errorId} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        error.type === 'javascript' ? 'bg-yellow-100 text-yellow-800' :
                        error.type === 'promise' ? 'bg-orange-100 text-orange-800' :
                        error.type === 'react' ? 'bg-purple-100 text-purple-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {error.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(error.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-900 font-medium mb-1">
                      {error.message}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {error.errorId} | 세션: {error.sessionId}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
