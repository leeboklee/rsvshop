// 브라우저 클라이언트 오류 실시간 감지 시스템
export class ErrorMonitor {
  private static instance: ErrorMonitor;
  private errorCount = 0;
  private isMonitoring = false;

  static getInstance(): ErrorMonitor {
    if (!ErrorMonitor.instance) {
      ErrorMonitor.instance = new ErrorMonitor();
    }
    return ErrorMonitor.instance;
  }

  // 전역 오류 이벤트 리스너 설정
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    // 1. JavaScript 오류 감지
    window.addEventListener('error', (event) => {
      this.handleError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    });

    // 2. Promise 오류 감지
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        type: 'promise',
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    });

    // 3. React 오류 경계 감지
    if (typeof window !== 'undefined') {
      window.addEventListener('react-error', (event: any) => {
        this.handleError({
          type: 'react',
          message: event.detail?.message || 'React Error',
          stack: event.detail?.stack,
          componentStack: event.detail?.componentStack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        });
      });
    }

    // 4. 네트워크 오류 감지
    this.monitorNetworkErrors();

    console.log('🛡️ 브라우저 오류 모니터링 시작됨');
  }

  // 네트워크 오류 모니터링
  private monitorNetworkErrors() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        if (!response.ok) {
          this.handleError({
            type: 'network',
            message: `HTTP ${response.status}: ${response.statusText}`,
            url: args[0] as string,
            status: response.status,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
          });
        }
        
        return response;
      } catch (error: any) {
        this.handleError({
          type: 'network',
          message: error.message,
          url: args[0] as string,
          stack: error.stack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        });
        throw error;
      }
    };
  }

  // 오류 처리 및 서버 전송
  private async handleError(errorData: any) {
    this.errorCount++;
    
    console.error('🚨 브라우저 오류 감지:', errorData);
    
    // 서버로 오류 전송
    try {
      await fetch('/api/admin/error-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...errorData,
          errorId: `client-${Date.now()}-${this.errorCount}`,
          sessionId: this.getSessionId()
        })
      });
    } catch (sendError) {
      console.error('오류 전송 실패:', sendError);
    }
  }

  // 세션 ID 생성
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('error-session-id');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('error-session-id', sessionId);
    }
    return sessionId;
  }

  // 모니터링 중지
  stopMonitoring() {
    this.isMonitoring = false;
    console.log('🛡️ 브라우저 오류 모니터링 중지됨');
  }

  // 오류 통계
  getErrorStats() {
    return {
      errorCount: this.errorCount,
      isMonitoring: this.isMonitoring
    };
  }
}

// 전역 인스턴스
export const errorMonitor = ErrorMonitor.getInstance();
