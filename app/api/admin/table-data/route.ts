import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get('table');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!tableName) {
      return NextResponse.json({
        success: false,
        error: '테이블 이름이 필요합니다'
      });
    }

    // 안전한 테이블 이름 검증 (SQL 인젝션 방지)
    const allowedTables = [
      'Reservation', 'Package', 'Room', 'Hotel', 'ShoppingMall', 
      'User', 'Booking', 'Payment', 'Review'
    ];

    if (!allowedTables.includes(tableName)) {
      return NextResponse.json({
        success: false,
        error: '허용되지 않은 테이블입니다'
      });
    }

    // 동적으로 테이블 데이터 조회
    const data = await prisma.$queryRawUnsafe(
      `SELECT * FROM "${tableName}" ORDER BY "createdAt" DESC LIMIT $1 OFFSET $2`,
      limit,
      offset
    );

    // 테이블 스키마 정보 조회
    const columns = await prisma.$queryRaw`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = ${tableName}
      ORDER BY ordinal_position
    `;

    return NextResponse.json({
      success: true,
      data: data,
      meta: {
        table: tableName,
        limit,
        offset,
        columns,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('테이블 데이터 조회 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
}
