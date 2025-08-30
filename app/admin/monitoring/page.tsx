'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: string;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
    temperature: number;
  };
  database: {
    status: 'connected' | 'disconnected' | 'error';
    responseTime: number;
  };
  api: {
    status: 'ok' | 'slow' | 'error';
    responseTime: number;
  };
}

interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  userAgent?: string;
  url?: string;
  userId?: string;
}

export default function MonitoringPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'errors' | 'health' | 'test'>('overview');

  useEffect(() => {
    const cleanup = fetchMonitoringData();
    const interval = setInterval(fetchMonitoringData, 30000); // 30초마다 업데이트
    
    return () => {
      clearInterval(interval);
      if (cleanup) cleanup();
    };
  }, []);

  const fetchMonitoringData = async () => {
    try {
      // 실제로는 API 호출
      // const [healthRes, errorsRes] = await Promise.all([
      //   fetch('/api/admin/monitoring/health'),
      //   fetch('/api/admin/monitoring/errors')
      // ]);
      
      // 임시 데이터 (실제 구현 시 제거)
      setTimeout(() => {
        setHealth({
          status: 'healthy',
          uptime: '15일 8시간 32분',
          memory: {
            used: 2048,
            total: 8192,
            percentage: 25
          },
          cpu: {
            usage: 15,
            temperature: 45
          },
          database: {
            status: 'connected',
            responseTime: 12
          },
          api: {
            status: 'ok',
            responseTime: 45
          }
        });

        setErrorLogs([
          {
            id: '1',
            timestamp: '2024-01-15 14:30:25',
            level: 'error',
            message: 'Database connection timeout',
            stack: 'Error: Connection timeout\n    at Database.connect()',
            userAgent: 'Mozilla/5.0...',
            url: '/api/admin/stats',
            userId: 'admin123'
          },
          {
            id: '2',
            timestamp: '2024-01-15 14:28:10',
            level: 'warning',
            message: 'High memory usage detected',
            stack: undefined,
            userAgent: undefined,
            url: undefined,
            userId: undefined
          },
          {
            id: '3',
            timestamp: '2024-01-15 14:25:45',
            level: 'info',
            message: 'System backup completed',
            stack: undefined,
            userAgent: undefined,
            url: undefined,
            userId: undefined
          }
        ]);

        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('모니터링 데이터 로딩 실패:', error);
      setLoading(false);
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getErrorLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const testError = () => {
    // 실제로는 API 호출
    console.error('테스트 에러 발생');
    alert('테스트 에러가 발생했습니다. 에러 로그를 확인하세요.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🔍 시스템 모니터링</h1>
              <p className="text-gray-600 mt-2">시스템 상태, 에러 로그, 성능 모니터링</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={testError}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                🧪 오류 테스트
              </button>
              <Link
                href="/admin"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← 관리자 페이지
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: '📊 개요', icon: '📊' },
              { id: 'health', label: '💚 시스템 건강', icon: '💚' },
              { id: 'errors', label: '🚨 에러 로그', icon: '🚨' },
              { id: 'test', label: '🧪 테스트', icon: '🧪' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 개요 탭 */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 시스템 상태 요약 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">시스템 상태 요약</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`text-2xl font-bold ${getHealthStatusColor(health?.status || 'unknown')}`}>
                    {health?.status === 'healthy' ? '✅ 정상' : 
                     health?.status === 'warning' ? '⚠️ 주의' : '❌ 위험'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">전체 상태</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{health?.uptime}</div>
                  <div className="text-sm text-gray-600 mt-1">가동 시간</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{health?.memory.percentage}%</div>
                  <div className="text-sm text-gray-600 mt-1">메모리 사용률</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{health?.cpu.usage}%</div>
                  <div className="text-sm text-gray-600 mt-1">CPU 사용률</div>
                </div>
              </div>
            </div>

            {/* 최근 에러 로그 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">최근 에러 로그</h2>
              <div className="space-y-3">
                {errorLogs.slice(0, 3).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getErrorLevelColor(log.level)}`}>
                        {log.level.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-600">{log.timestamp}</span>
                      <span className="text-sm font-medium text-gray-900">{log.message}</span>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      상세보기
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 시스템 건강 탭 */}
        {activeTab === 'health' && (
          <div className="space-y-6">
            {/* 상세 시스템 정보 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">💚 시스템 건강 상태</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 메모리 정보 */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">메모리 사용량</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>사용 중</span>
                      <span className="font-medium">{health?.memory.used} MB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>전체</span>
                      <span className="font-medium">{health?.memory.total} MB</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${health?.memory.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      {health?.memory.percentage}% 사용
                    </div>
                  </div>
                </div>

                {/* CPU 정보 */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">CPU 상태</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>사용률</span>
                      <span className="font-medium">{health?.cpu.usage}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>온도</span>
                      <span className="font-medium">{health?.cpu.temperature}°C</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${health?.cpu.usage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* 데이터베이스 상태 */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">데이터베이스</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>상태</span>
                      <span className={`font-medium ${
                        health?.database.status === 'connected' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {health?.database.status === 'connected' ? '연결됨' : '연결 안됨'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>응답 시간</span>
                      <span className="font-medium">{health?.database.responseTime}ms</span>
                    </div>
                  </div>
                </div>

                {/* API 상태 */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">API 상태</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>상태</span>
                      <span className={`font-medium ${
                        health?.api.status === 'ok' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {health?.api.status === 'ok' ? '정상' : '느림'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>응답 시간</span>
                      <span className="font-medium">{health?.api.responseTime}ms</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 에러 로그 탭 */}
        {activeTab === 'errors' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">🚨 에러 로그</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">시간</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">레벨</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">메시지</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사용자</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {errorLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.timestamp}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getErrorLevelColor(log.level)}`}>
                          {log.level.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {log.message}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.userId || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.url || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900">상세보기</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 테스트 탭 */}
        {activeTab === 'test' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">🧪 시스템 테스트</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">오류 테스트</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    의도적으로 오류를 발생시켜 에러 로깅 시스템을 테스트합니다.
                  </p>
                  <button
                    onClick={testError}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    🚨 오류 발생 테스트
                  </button>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">성능 테스트</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    시스템 성능과 응답 시간을 테스트합니다.
                  </p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    ⚡ 성능 테스트
                  </button>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">연결 테스트</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    데이터베이스와 외부 API 연결을 테스트합니다.
                  </p>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    🔗 연결 테스트
                  </button>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">로드 테스트</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    시스템 부하 상황을 시뮬레이션합니다.
                  </p>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    📊 로드 테스트
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
