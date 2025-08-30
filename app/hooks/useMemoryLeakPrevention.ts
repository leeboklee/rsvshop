import { useEffect, useRef, useCallback } from 'react';

interface MemoryLeakPreventionOptions {
  checkInterval?: number; // 메모리 체크 간격 (ms)
  memoryThreshold?: number; // 메모리 사용량 임계값 (0.8 = 80%)
  enableAutoCleanup?: boolean; // 자동 정리 활성화
}

export const useMemoryLeakPrevention = (options: MemoryLeakPreventionOptions = {}) => {
  const {
    checkInterval = 60000, // 기본 1분
    memoryThreshold = 0.8, // 기본 80%
    enableAutoCleanup = true
  } = options;

  const timersRef = useRef<Set<number>>(new Set());
  const eventListenersRef = useRef<Set<{element: Element, event: string, handler: EventListener}>>(new Set());
  const abortControllerRef = useRef<AbortController | null>(null);

  // 타이머 등록
  const registerTimer = useCallback((timer: number, type: 'interval' | 'timeout' = 'interval') => {
    timersRef.current.add(timer);
    
    // 전역 등록 (선택사항)
    if (typeof window !== 'undefined' && window.__rsvshopMemoryUtils) {
      window.__rsvshopMemoryUtils.registerTimer(timer, type);
    }
  }, []);

  // 이벤트 리스너 등록
  const registerEventListener = useCallback((
    element: Element, 
    event: string, 
    handler: EventListener
  ) => {
    const listener = { element, event, handler };
    eventListenersRef.current.add(listener);
    
    // 전역 등록 (선택사항)
    if (typeof window !== 'undefined' && window.__rsvshopMemoryUtils) {
      window.__rsvshopMemoryUtils.registerEventListener(element, event, handler);
    }
  }, []);

  // AbortController 생성
  const createAbortController = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    // 전역 등록
    if (typeof window !== 'undefined') {
      window.__rsvshopAbortController = abortControllerRef.current;
    }
    
    return abortControllerRef.current;
  }, []);

  // 메모리 사용량 체크
  const checkMemoryUsage = useCallback(() => {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
      const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
      
      console.log(`💾 [useMemoryLeakPrevention] 메모리 사용량: ${usedMB}MB / ${totalMB}MB (제한: ${limitMB}MB)`);
      
      if (usedMB > limitMB * memoryThreshold) {
        console.warn(`⚠️ [useMemoryLeakPrevention] 메모리 사용량이 높습니다 (${Math.round(usedMB/limitMB*100)}%). 페이지를 새로고침하는 것을 권장합니다.`);
        
        if (enableAutoCleanup) {
          cleanup();
        }
      }
    }
  }, [memoryThreshold, enableAutoCleanup]);

  // 정리 함수
  const cleanup = useCallback(() => {
    // 타이머 정리
    timersRef.current.forEach(timer => {
      clearInterval(timer);
      clearTimeout(timer);
    });
    timersRef.current.clear();
    
    // 이벤트 리스너 정리
    eventListenersRef.current.forEach(({element, event, handler}) => {
      element.removeEventListener(event, handler);
    });
    eventListenersRef.current.clear();
    
    // AbortController 정리
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    console.log('🧹 [useMemoryLeakPrevention] 메모리 정리 완료');
  }, []);

  // 컴포넌트 마운트 시 메모리 모니터링 시작
  useEffect(() => {
    const intervalId = setInterval(checkMemoryUsage, checkInterval);
    
    return () => {
      clearInterval(intervalId);
      cleanup();
    };
  }, [checkInterval, checkMemoryUsage, cleanup]);

  // 페이지 숨김 시 추가 정리
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && enableAutoCleanup) {
        // 페이지가 숨겨질 때 불필요한 타이머 정리
        timersRef.current.forEach(timer => clearInterval(timer));
        console.log('🔄 [useMemoryLeakPrevention] 페이지가 숨겨짐 - 타이머 정리됨');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enableAutoCleanup]);

  return {
    registerTimer,
    registerEventListener,
    createAbortController,
    checkMemoryUsage,
    cleanup,
    abortController: abortControllerRef.current
  };
};
