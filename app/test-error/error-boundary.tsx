'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // 다음 렌더링에서 폴백 UI를 표시하도록 상태를 업데이트
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 오류 로깅
    console.error('ErrorBoundary에서 오류 포착:', error, errorInfo);
    
    // 오류 모니터링 시스템에 보고
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('react-error', {
        detail: {
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack
        }
      }));
    }

    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // 커스텀 폴백 UI가 있으면 사용
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 폴백 UI
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
          <div className="flex items-center space-x-2 mb-3">
            <div className="text-red-600 text-xl">🚨</div>
            <h3 className="text-red-900 font-semibold">
              컴포넌트 오류가 발생했습니다
            </h3>
          </div>
          
          <p className="text-red-700 text-sm mb-3">
            이 컴포넌트에서 예상치 못한 오류가 발생했습니다.
          </p>

          <div className="space-y-2">
            <button
              onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            >
              다시 시도
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-red-600 hover:text-red-800">
                오류 상세 정보 (개발 모드)
              </summary>
              <div className="mt-2 p-3 bg-red-100 rounded text-xs font-mono text-red-800 overflow-auto max-h-32">
                <div><strong>Error:</strong> {this.state.error.message}</div>
                {this.state.error.stack && (
                  <>
                    <div><strong>Stack:</strong></div>
                    <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                  </>
                )}
                {this.state.errorInfo && (
                  <>
                    <div><strong>Component Stack:</strong></div>
                    <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                  </>
                )}
              </div>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
