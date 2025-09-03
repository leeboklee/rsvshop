/**
 * API 오류 처리 유틸리티
 */

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

/**
 * API 응답을 처리하고 오류를 표준화
 */
export function handleApiResponse<T>(response: Response, data?: any): ApiResponse<T> {
  if (response.ok) {
    return {
      data: data || response,
      success: true
    };
  }

  const error: ApiError = {
    message: '서버 오류가 발생했습니다.',
    status: response.status,
    code: response.status.toString()
  };

  // 응답 본문에서 오류 정보 추출 시도
  if (data && typeof data === 'object') {
    if (data.error) {
      error.message = data.error;
    }
    if (data.details) {
      error.details = data.details;
    }
    if (data.code) {
      error.code = data.code;
    }
  }

  return {
    error,
    success: false
  };
}

/**
 * fetch 요청을 래핑하여 오류 처리
 */
export async function apiRequest<T = any>(
  url: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    return handleApiResponse<T>(response, data);
  } catch (error) {
    console.error('API 요청 실패:', error);
    
    return {
      error: {
        message: error instanceof Error ? error.message : '네트워크 오류가 발생했습니다.',
        code: 'NETWORK_ERROR'
      },
      success: false
    };
  }
}

/**
 * 사용자 친화적인 오류 메시지 생성
 */
export function getUserFriendlyErrorMessage(error: ApiError): string {
  if (!error) return '알 수 없는 오류가 발생했습니다.';

  // 네트워크 오류
  if (error.code === 'NETWORK_ERROR') {
    return '네트워크 연결을 확인해주세요.';
  }

  // HTTP 상태 코드별 메시지
  switch (error.status) {
    case 400:
      return error.message || '잘못된 요청입니다.';
    case 401:
      return '로그인이 필요합니다.';
    case 403:
      return '접근 권한이 없습니다.';
    case 404:
      return '요청한 리소스를 찾을 수 없습니다.';
    case 409:
      return '데이터 충돌이 발생했습니다.';
    case 422:
      return error.message || '입력 데이터를 확인해주세요.';
    case 429:
      return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
    case 500:
      return '서버 내부 오류가 발생했습니다.';
    case 502:
    case 503:
    case 504:
      return '서버가 일시적으로 사용할 수 없습니다.';
    default:
      return error.message || '알 수 없는 오류가 발생했습니다.';
  }
}

/**
 * 데이터베이스 오류 메시지 변환
 */
export function getDatabaseErrorMessage(error: any): string {
  if (!error) return '데이터베이스 오류가 발생했습니다.';

  // Prisma 오류 코드별 메시지
  switch (error.code) {
    case 'P2002':
      return '중복된 데이터입니다.';
    case 'P2003':
      return '관련 데이터를 찾을 수 없습니다.';
    case 'P2011':
      return '필수 필드가 누락되었습니다.';
    case 'P2025':
      return '요청한 레코드를 찾을 수 없습니다.';
    case 'P2021':
      return '테이블이 존재하지 않습니다.';
    case 'P2022':
      return '컬럼이 존재하지 않습니다.';
    default:
      if (error.message) {
        return error.message;
      }
      return '데이터베이스 오류가 발생했습니다.';
  }
}

/**
 * 오류 로깅
 */
export function logError(error: any, context?: string) {
  const errorInfo = {
    message: error?.message || 'Unknown error',
    stack: error?.stack,
    code: error?.code,
    context,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
    url: typeof window !== 'undefined' ? window.location.href : 'Server'
  };

  console.error('Error logged:', errorInfo);

  // 개발 환경에서만 상세 로그 출력
  if (process.env.NODE_ENV === 'development') {
    console.group('🚨 Error Details');
    console.error('Context:', context);
    console.error('Error:', error);
    console.error('Stack:', error?.stack);
    console.groupEnd();
  }
}

/**
 * 재시도 로직이 포함된 API 요청
 */
export async function apiRequestWithRetry<T = any>(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<ApiResponse<T>> {
  let lastError: ApiError | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await apiRequest<T>(url, options);
    
    if (result.success) {
      return result;
    }

    lastError = result.error || null;

    // 재시도하지 않을 오류들
    if (result.error?.status && [400, 401, 403, 404, 422].includes(result.error.status)) {
      break;
    }

    // 마지막 시도가 아니면 대기
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
    }
  }

  return {
    error: lastError || { message: '요청이 실패했습니다.' },
    success: false
  };
}
