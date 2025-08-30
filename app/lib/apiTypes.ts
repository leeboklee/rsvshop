import { NextRequest, NextResponse } from 'next/server';

// API 라우트 핸들러 타입 정의
export type APIHandler = (request: NextRequest) => Promise<NextResponse>;
export type APIHandlerWithParams<T = any> = (
  request: NextRequest, 
  context: { params: T }
) => Promise<NextResponse>;

// 공통 응답 타입
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 에러 응답 생성기
export const createErrorResponse = (
  error: string, 
  status: number = 500
): NextResponse => {
  return NextResponse.json(
    { success: false, error }, 
    { status }
  );
};

// 성공 응답 생성기
export const createSuccessResponse = <T>(
  data?: T, 
  message?: string, 
  status: number = 200
): NextResponse => {
  return NextResponse.json(
    { success: true, data, message }, 
    { status }
  );
};

// 캐시된 응답 생성기
export const createCachedResponse = <T>(
  data: T, 
  maxAge: number = 300
): NextResponse => {
  const response = NextResponse.json(data);
  response.headers.set('Cache-Control', `public, max-age=${maxAge}`);
  return response;
};