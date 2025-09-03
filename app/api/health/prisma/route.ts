import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import serverLogger from '@/app/lib/serverLogger';

// Force Node runtime to avoid edge limitations
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    serverLogger.logApiStart('GET', '/api/health/prisma');
    // 간단한 쿼리로 연결 상태 확인(연결은 싱글톤이 관리)
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    const res = NextResponse.json({
      success: true,
      message: 'Prisma ORM 연결 성공',
      timestamp: new Date().toISOString(),
      test: result
    });
    serverLogger.logApiEnd('GET', '/api/health/prisma', 200);
    return res;
  } catch (error) {
    serverLogger.logApiError('GET', '/api/health/prisma', error);
    
    return NextResponse.json({
      success: false,
      message: 'Prisma ORM 연결 실패',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
