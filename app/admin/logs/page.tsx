'use client';

import { useState, useEffect, useRef } from 'react';
import Card from '@/app/components/common/Card';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'log' | 'error' | 'end';
}

export default function LogViewerPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [containerId, setContainerId] = useState('rsvshop-rsvshop-dev-1');
  const [autoScroll, setAutoScroll] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // 자동 스크롤
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // SSE 연결 시작
  const startLogStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(`/api/admin/logs/stream?container=${containerId}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setLogs([]);
    };

    eventSource.onmessage = (event) => {
      try {
        const logEntry: LogEntry = JSON.parse(event.data);
        setLogs(prev => [...prev, logEntry]);
      } catch (error) {
        console.error('Failed to parse log entry:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      setIsConnected(false);
    };

    eventSource.addEventListener('end', () => {
      setIsConnected(false);
      eventSource.close();
    });
  };

  // SSE 연결 중지
  const stopLogStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  };

  // 로그 클리어
  const clearLogs = () => {
    setLogs([]);
  };

  // 컴포넌트 언마운트 시 연결 해제
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">실시간 로그 뷰어</h1>
              <p className="mt-2 text-gray-600">Docker 컨테이너 로그 실시간 모니터링</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {isConnected ? '연결됨' : '연결 안됨'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 컨트롤 패널 */}
        <Card>
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  컨테이너 ID
                </label>
                <input
                  type="text"
                  value={containerId}
                  onChange={(e) => setContainerId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="컨테이너 ID를 입력하세요"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={startLogStream}
                  disabled={isConnected}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  연결 시작
                </button>
                
                <button
                  onClick={stopLogStream}
                  disabled={!isConnected}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  연결 중지
                </button>
                
                <button
                  onClick={clearLogs}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  로그 클리어
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">자동 스크롤</span>
              </label>
              
              <span className="text-sm text-gray-500">
                총 {logs.length}개 로그
              </span>
            </div>
          </div>
        </Card>

        {/* 로그 뷰어 */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">실시간 로그</h3>
            <div
              ref={logContainerRef}
              className="bg-black text-green-400 font-mono text-sm p-4 rounded-lg h-96 overflow-y-auto"
            >
              {logs.length === 0 ? (
                <div className="text-gray-500">로그가 없습니다. 연결을 시작하세요.</div>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={index}
                    className={`mb-1 ${
                      log.type === 'error' ? 'text-red-400' : 
                      log.type === 'end' ? 'text-yellow-400' : 'text-green-400'
                    }`}
                  >
                    <span className="text-gray-500 mr-2">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs mr-2 ${
                      log.type === 'error' ? 'bg-red-900 text-red-200' :
                      log.type === 'end' ? 'bg-yellow-900 text-yellow-200' :
                      'bg-green-900 text-green-200'
                    }`}>
                      {log.type.toUpperCase()}
                    </span>
                    {log.message}
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 