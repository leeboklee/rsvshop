/**
 * 안전한 DOM 조작을 위한 유틸리티 함수들
 */

/**
 * 노드가 실제로 부모의 자식인지 확인
 */
export function isChildOf(parent: Node, child: Node): boolean {
  if (!parent || !child) return false;
  
  let current = child.parentNode;
  while (current) {
    if (current === parent) return true;
    current = current.parentNode;
  }
  return false;
}

/**
 * 안전하게 자식 노드 제거
 */
export function safeRemoveChild(parent: Node, child: Node): boolean {
  try {
    if (parent && child && isChildOf(parent, child)) {
      parent.removeChild(child);
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Failed to remove child node:', error);
    return false;
  }
}

/**
 * 안전하게 이벤트 리스너 제거
 */
export function safeRemoveEventListener(
  target: EventTarget,
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | EventListenerOptions
): boolean {
  try {
    if (target && listener) {
      target.removeEventListener(type, listener, options);
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Failed to remove event listener:', error);
    return false;
  }
}

/**
 * DOM 노드가 여전히 문서에 존재하는지 확인
 */
export function isNodeInDocument(node: Node): boolean {
  try {
    return document.contains(node);
  } catch (error) {
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
    return operation();
  } catch (error) {
    console.warn('DOM operation failed:', error);
    return fallback;
  }
}
