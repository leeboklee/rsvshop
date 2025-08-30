'use client';

import React, { useEffect } from 'react';

interface ConsoleLoggerProps {
  isActive?: boolean;
}

export default function ConsoleLogger({ isActive = true }: ConsoleLoggerProps) {
  useEffect(() => {
    if (!isActive) return;

    // 원본 콘솔 메서드들 저장
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug
    };

    // 로그 수집 배열
    const logs: Array<{
      type: string;
      message: string;
      timestamp: string;
      data?: any;
    }> = [];

    // 로그 수집 함수
    const collectLog = (type: string, ...args: any[]) => {
      const logEntry = {
        type,
        message: args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' '),
        timestamp: new Date().toISOString(),
        data: args.length > 1 ? args : args[0]
      };
      
      logs.push(logEntry);
      
      // 로그가 100개를 넘으면 오래된 것부터 제거
      if (logs.length > 100) {
        logs.shift();
      }
      
      // 서버로 로그 전송 (5초마다)
      if (logs.length % 10 === 0) {
        sendLogsToServer();
      }
    };

    // 서버로 로그 전송
    const sendLogsToServer = async () => {
      if (logs.length === 0) return;
      
      try {
        await fetch('/api/debug/console-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            logs: logs.slice(-20), // 최근 20개만 전송
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          })
        });
      } catch (error) {
        // 로그 전송 실패 시 무시 (무한 루프 방지)
      }
    };

    // 콘솔 메서드 오버라이드
    console.log = (...args) => {
      collectLog('log', ...args);
      originalConsole.log(...args);
    };

    console.error = (...args) => {
      collectLog('error', ...args);
      originalConsole.error(...args);
    };

    console.warn = (...args) => {
      collectLog('warn', ...args);
      originalConsole.warn(...args);
    };

    console.info = (...args) => {
      collectLog('info', ...args);
      originalConsole.info(...args);
    };

    console.debug = (...args) => {
      collectLog('debug', ...args);
      originalConsole.debug(...args);
    };

    // 페이지 언로드 시 로그 전송
    window.addEventListener('beforeunload', () => {
      sendLogsToServer();
    });

    // 30초마다 로그 전송
    const interval = setInterval(sendLogsToServer, 30000);

    // 정리 함수
    return () => {
      clearInterval(interval);
      console.log = originalConsole.log;
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
      console.info = originalConsole.info;
      console.debug = originalConsole.debug;
    };
  }, [isActive]);

  return null; // UI 없음
}
