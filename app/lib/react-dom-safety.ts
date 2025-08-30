/**
 * React DOM 조작을 안전하게 처리하는 유틸리티
 */

/**
 * React 컴포넌트가 마운트된 상태인지 확인
 */
export function isComponentMounted(): boolean {
  try {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  } catch {
    return false;
  }
}

/**
 * DOM 노드가 여전히 문서에 존재하는지 확인
 */
export function isNodeInDocument(node: Node | null): boolean {
  try {
    return node !== null && document.contains(node);
  } catch {
    return false;
  }
}

/**
 * 부모-자식 관계가 유효한지 확인
 */
export function isValidParentChild(parent: Node | null, child: Node | null): boolean {
  try {
    if (!parent || !child) return false;
    return parent.contains(child);
  } catch {
    return false;
  }
}

/**
 * 안전한 DOM 조작을 위한 래퍼
 */
export function safeDOMOperation<T>(
  operation: () => T,
  fallback?: T
): T | undefined {
  try {
    if (!isComponentMounted()) {
      console.warn('DOM operation attempted on unmounted component');
      return fallback;
    }
    return operation();
  } catch (error) {
    console.warn('DOM operation failed:', error);
    return fallback;
  }
}

/**
 * React 컴포넌트의 생명주기를 안전하게 관리하는 클래스
 */
export class SafeComponentLifecycle {
  private isMounted = false;
  private cleanupFunctions: Array<() => void> = [];

  constructor() {
    this.isMounted = true;
  }

  /**
   * 컴포넌트가 마운트된 상태인지 확인
   */
  get mounted(): boolean {
    return this.isMounted;
  }

  /**
   * 정리 함수 등록
   */
  addCleanup(cleanup: () => void): void {
    if (this.isMounted) {
      this.cleanupFunctions.push(cleanup);
    }
  }

  /**
   * 컴포넌트 언마운트 시 정리
   */
  cleanup(): void {
    this.isMounted = false;
    
    // 등록된 정리 함수들을 안전하게 실행
    this.cleanupFunctions.forEach((cleanup, index) => {
      try {
        cleanup();
      } catch (error) {
        console.warn(`Cleanup function ${index} failed:`, error);
      }
    });
    
    this.cleanupFunctions = [];
  }

  /**
   * 안전한 DOM 조작 실행
   */
  safeDOM<T>(operation: () => T, fallback?: T): T | undefined {
    if (!this.isMounted) {
      return fallback;
    }
    return safeDOMOperation(operation, fallback);
  }
}

/**
 * React 컴포넌트에서 안전한 이벤트 리스너 관리
 */
export class SafeEventListenerManager {
  private listeners: Array<{
    target: EventTarget;
    type: string;
    listener: EventListenerOrEventListenerObject;
    options?: boolean | EventListenerOptions;
  }> = [];

  /**
   * 이벤트 리스너 추가
   */
  addEventListener(
    target: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void {
    try {
      target.addEventListener(type, listener, options);
      this.listeners.push({ target, type, listener, options });
    } catch (error) {
      console.warn('Failed to add event listener:', error);
    }
  }

  /**
   * 모든 이벤트 리스너 제거
   */
  removeAllListeners(): void {
    this.listeners.forEach(({ target, type, listener, options }) => {
      try {
        target.removeEventListener(type, listener, options);
      } catch (error) {
        console.warn('Failed to remove event listener:', error);
      }
    });
    this.listeners = [];
  }

  /**
   * 특정 이벤트 리스너 제거
   */
  removeEventListener(
    target: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): boolean {
    try {
      target.removeEventListener(type, listener, options);
      
      // 리스트에서 제거
      const index = this.listeners.findIndex(
        l => l.target === target && l.type === type && l.listener === listener
      );
      
      if (index !== -1) {
        this.listeners.splice(index, 1);
        return true;
      }
      
      return false;
    } catch (error) {
      console.warn('Failed to remove event listener:', error);
      return false;
    }
  }
}
