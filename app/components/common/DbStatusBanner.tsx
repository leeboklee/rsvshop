'use client';

import { useState, useEffect } from 'react';

interface DbStatus {
  connected: boolean;
  error?: string;
  lastChecked: Date;
  dbType?: 'postgresql' | 'sqlite';
}

export default function DbStatusBanner() {
  const [status, setStatus] = useState<DbStatus>({
    connected: false,
    lastChecked: new Date(),
    dbType: 'postgresql'
  });
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const checkDbStatus = async () => {
    try {
      const response = await fetch('/api/health/db', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatus({
          connected: true,
          lastChecked: new Date(),
          dbType: data.dbType || 'postgresql'
        });
      } else {
        const error = await response.text();
        setStatus({
          connected: false,
          error: error,
          lastChecked: new Date(),
          dbType: 'postgresql'
        });
      }
    } catch (error) {
      setStatus({
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: new Date()
      });
    }
  };

  useEffect(() => {
    setMounted(true);
    checkDbStatus();
    const interval = setInterval(checkDbStatus, 30000); // 30초마다 체크
    return () => clearInterval(interval);
  }, []);

  if (!isVisible || !mounted) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg border ${
      status.connected 
        ? 'bg-green-50 border-green-200 text-green-800' 
        : 'bg-red-50 border-red-200 text-red-800'
    }`}>
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${
          status.connected ? 'bg-green-500' : 'bg-red-500'
        }`}></div>
        <span className="text-sm font-medium">
          DB: {status.connected ? '연결됨' : '연결 실패'} ({status.dbType?.toUpperCase()})
        </span>
        <button
          onClick={() => checkDbStatus()}
          className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          새로고침
        </button>
        <button
          onClick={async () => {
            try {
              const response = await fetch('/api/health/db/switch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
              });
              if (response.ok) {
                checkDbStatus();
              }
            } catch (error) {
              console.error('DB 전환 실패:', error);
            }
          }}
          className="ml-1 px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          전환
        </button>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-1 px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          ×
        </button>
      </div>
      {status.error && (
        <div className="mt-1 text-xs text-red-600">
          오류: {status.error}
        </div>
      )}
      <div className="mt-1 text-xs text-gray-500">
        마지막 확인: {status.lastChecked.toLocaleTimeString('ko-KR')}
      </div>
    </div>
  );
} 