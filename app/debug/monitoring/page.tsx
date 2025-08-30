'use client';

import React, { useState, useEffect } from 'react';
import ConsoleLogger from '@/app/components/ConsoleLogger';

interface LogEntry {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  source: string;
  url?: string;
}

interface FixedError {
  id: string;
  error: LogEntry;
  fixed_at: string;
  status: 'success' | 'failed';
}

export default function MonitoringDashboard() {
  const [consoleLogs, setConsoleLogs] = useState<LogEntry[]>([]);
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [fixedErrors, setFixedErrors] = useState<FixedError[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // 로그 데이터 가져오기
  const fetchLogs = async () => {
    try {
      // 콘솔 로그
      const consoleResponse = await fetch('/api/debug/console-logs', {
        method: 'GET'
      });
      if (consoleResponse.ok) {
        const consoleData = await consoleResponse.json();
        setConsoleLogs(consoleData.logs || []);
      }

      // 서버 오류 로그
      const serverResponse = await fetch('/api/debug/server-errors', {
        method: 'GET'
      });
      if (serverResponse.ok) {
        const serverData = await serverResponse.json();
        setServerErrors(serverData.errors || []);
      }

      // 수정된 오류
      const fixedResponse = await fetch('/api/debug/fixed-errors', {
        method: 'GET'
      });
      if (fixedResponse.ok) {
        const fixedData = await fixedResponse.json();
        setFixedErrors(fixedData.errors || []);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('로그 가져오기 실패:', error);
    }
  };

  // 자동 오류 수정 실행
  const runAutoFix = async () => {
    try {
      const response = await fetch('/api/debug/auto-fix', {
        method: 'POST'
      });
      if (response.ok) {
        const result = await response.json();
        alert(`자동 오류 수정 완료: ${result.fixedCount}개 오류 처리됨`);
        fetchLogs(); // 로그 새로고침
      }
    } catch (error) {
      alert('자동 오류 수정 실패');
    }
  };

  // 모니터링 시작/중지
  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000); // 10초마다 새로고침
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <ConsoleLogger isActive={true} />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🚨 RSVShop 오류 모니터링 대시보드
            </h1>
            <p className="text-gray-600">
              실시간 오류 추적 및 자동 수정 시스템
            </p>
            <div className="mt-4 flex gap-4">
              <button
                onClick={runAutoFix}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                🔧 자동 오류 수정 실행
              </button>
              <button
                onClick={toggleMonitoring}
                className={`px-4 py-2 rounded-lg ${
                  isMonitoring 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isMonitoring ? '⏹️ 모니터링 중지' : '▶️ 모니터링 시작'}
              </button>
              <button
                onClick={fetchLogs}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                🔄 새로고침
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              마지막 업데이트: {lastUpdate.toLocaleString()}
            </div>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-red-600">
                {consoleLogs.filter(log => log.type === 'error').length}
              </div>
              <div className="text-gray-600">브라우저 오류</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-orange-600">
                {serverErrors.length}
              </div>
              <div className="text-gray-600">서버 오류</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">
                {fixedErrors.filter(e => e.status === 'success').length}
              </div>
              <div className="text-gray-600">수정 완료</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">
                {consoleLogs.length}
              </div>
              <div className="text-gray-600">전체 로그</div>
            </div>
          </div>

          {/* 로그 섹션 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 브라우저 콘솔 로그 */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  📱 브라우저 콘솔 로그
                </h2>
                <p className="text-sm text-gray-600">
                  최근 {consoleLogs.length}개 로그
                </p>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                {consoleLogs.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    아직 로그가 수집되지 않았습니다.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {consoleLogs.slice(-20).reverse().map((log, index) => (
                      <div
                        key={log.id || index}
                        className={`p-3 rounded-lg border-l-4 ${
                          log.type === 'error' 
                            ? 'border-red-500 bg-red-50' 
                            : log.type === 'warn'
                            ? 'border-yellow-500 bg-yellow-50'
                            : 'border-blue-500 bg-blue-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className={`text-sm font-medium ${
                            log.type === 'error' ? 'text-red-700' : 'text-gray-700'
                          }`}>
                            [{log.type.toUpperCase()}]
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          {log.message}
                        </div>
                        {log.url && (
                          <div className="mt-1 text-xs text-gray-500">
                            📍 {log.url}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 서버 오류 로그 */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  📡 서버 오류 로그
                </h2>
                <p className="text-sm text-gray-600">
                  최근 {serverErrors.length}개 오류
                </p>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                {serverErrors.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    서버 오류가 없습니다.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {serverErrors.slice(-20).reverse().map((error, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg border-l-4 border-red-500 bg-red-50"
                      >
                        <div className="text-sm text-red-700">
                          {error}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 수정된 오류 기록 */}
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                🔧 수정된 오류 기록
              </h2>
              <p className="text-sm text-gray-600">
                총 {fixedErrors.length}개 오류 처리됨
              </p>
            </div>
            <div className="p-6">
              {fixedErrors.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  아직 수정된 오류가 없습니다.
                </p>
              ) : (
                <div className="space-y-3">
                  {fixedErrors.slice(-10).reverse().map((fixed) => (
                    <div
                      key={fixed.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        fixed.status === 'success'
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className={`font-medium ${
                            fixed.status === 'success' ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {fixed.error.description}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {fixed.error.message}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            fixed.status === 'success'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {fixed.status === 'success' ? '✅ 성공' : '❌ 실패'}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(fixed.fixed_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
