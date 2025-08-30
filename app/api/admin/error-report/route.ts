import { NextRequest, NextResponse } from 'next/server';

// 오류 데이터 타입 정의
interface ErrorReport {
  type: 'javascript' | 'promise' | 'react' | 'network';
  message: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  stack?: string;
  componentStack?: string;
  url?: string;
  status?: number;
  timestamp: string;
  userAgent: string;
  errorId: string;
  sessionId: string;
}

// 오류 저장소 (실제로는 데이터베이스에 저장해야 함)
const errorStore: ErrorReport[] = [];

export async function POST(request: NextRequest) {
  try {
    const errorData: ErrorReport = await request.json();
    
    // 오류 데이터 검증
    if (!errorData.type || !errorData.message || !errorData.timestamp) {
      return NextResponse.json(
        { error: 'Invalid error data' },
        { status: 400 }
      );
    }

    // 오류 데이터 저장
    errorStore.push(errorData);
    
    // 콘솔에 오류 로그 출력 (개발 환경)
    if (process.env.NODE_ENV === 'development') {
      console.log('🚨 클라이언트 오류 리포트 수신:', {
        type: errorData.type,
        message: errorData.message,
        timestamp: errorData.timestamp,
        errorId: errorData.errorId,
        sessionId: errorData.sessionId
      });
    }

    // 오류 통계 계산
    const stats = {
      total: errorStore.length,
      byType: errorStore.reduce((acc, error) => {
        acc[error.type] = (acc[error.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySession: errorStore.reduce((acc, error) => {
        acc[error.sessionId] = (acc[error.sessionId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: '오류가 성공적으로 보고되었습니다.',
      errorId: errorData.errorId,
      stats
    });

  } catch (error) {
    console.error('오류 리포트 처리 실패:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // 오류 통계 반환
    const stats = {
      total: errorStore.length,
      byType: errorStore.reduce((acc, error) => {
        acc[error.type] = (acc[error.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySession: errorStore.reduce((acc, error) => {
        acc[error.sessionId] = (acc[error.sessionId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      recent: errorStore.slice(-10) // 최근 10개 오류
    };
    
    return NextResponse.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('오류 통계 조회 실패:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
