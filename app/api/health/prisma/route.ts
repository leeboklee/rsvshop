import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Prisma 연결 테스트
    await prisma.$connect();
    
    // 간단한 쿼리로 연결 상태 확인
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      success: true,
      message: 'Prisma ORM 연결 성공',
      timestamp: new Date().toISOString(),
      test: result
    });
  } catch (error) {
    console.error('Prisma 연결 오류:', error);
    
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('Prisma 연결 해제 오류:', disconnectError);
    }
    
    return NextResponse.json({
      success: false,
      message: 'Prisma ORM 연결 실패',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
