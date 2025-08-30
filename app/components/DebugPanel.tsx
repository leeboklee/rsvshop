'use client';

import React, { useState, useEffect } from 'react';

interface DebugPanelProps {
  isVisible?: boolean;
}

export default function DebugPanel({ isVisible = true }: DebugPanelProps) {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const updateDebugInfo = () => {
      // 전역 상태나 로컬 스토리지에서 데이터 수집
      const info = {
        timestamp: new Date().toISOString(),
        localStorage: Object.keys(localStorage).reduce((acc, key) => {
          try {
            acc[key] = localStorage.getItem(key);
          } catch (e) {
            acc[key] = '접근 불가';
          }
          return acc;
        }, {} as any),
        sessionStorage: Object.keys(sessionStorage).reduce((acc, key) => {
          try {
            acc[key] = sessionStorage.getItem(key);
          } catch (e) {
            acc[key] = '접근 불가';
          }
          return acc;
        }, {} as any),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };
      setDebugInfo(info);
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 2000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`bg-black/90 text-white p-4 rounded-lg shadow-lg transition-all duration-300 ${
        isExpanded ? 'w-96 h-96' : 'w-16 h-16'
      }`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute top-2 right-2 text-xs bg-white/20 px-2 py-1 rounded"
        >
          {isExpanded ? '접기' : '펼치기'}
        </button>
        
        {isExpanded && (
          <div className="text-xs space-y-2 overflow-auto h-full">
            <h3 className="font-bold text-yellow-400">🔍 디버그 패널</h3>
            
            <div>
              <strong>현재 URL:</strong>
              <div className="text-blue-300 break-all">{debugInfo.url}</div>
            </div>
            
            <div>
              <strong>LocalStorage:</strong>
              <pre className="text-xs bg-gray-800 p-2 rounded overflow-auto max-h-20">
                {JSON.stringify(debugInfo.localStorage, null, 2)}
              </pre>
            </div>
            
            <div>
              <strong>SessionStorage:</strong>
              <pre className="text-xs bg-gray-800 p-2 rounded overflow-auto max-h-20">
                {JSON.stringify(debugInfo.sessionStorage, null, 2)}
              </pre>
            </div>
            
            <div>
              <strong>타임스탬프:</strong>
              <div className="text-green-300">{debugInfo.timestamp}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
