import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // 데이터베이스 연결 테스트
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - startTime;

    // 테이블 정보 조회
    const tables = await prisma.$queryRaw`
      SELECT 
        table_name,
        table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    ` as Array<{table_name: string, table_type: string}>;

    // 각 테이블의 레코드 수 조회
    const tableStats = await Promise.all(
      tables.map(async (table) => {
        try {
          const count = await prisma.$queryRawUnsafe(
            `SELECT COUNT(*) as count FROM "${table.table_name}"`
          ) as Array<{count: bigint}>;
          return {
            name: table.table_name,
            type: table.table_type,
            count: Number(count[0].count)
          };
        } catch (error) {
          return {
            name: table.table_name,
            type: table.table_type,
            count: 0,
            error: '접근 불가'
          };
        }
      })
    );

    // 환경 정보
    const environment = {
      nodeEnv: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? '설정됨' : '설정 안됨',
      vercelEnv: process.env.VERCEL_ENV || 'local',
      region: process.env.VERCEL_REGION || 'local'
    };

    // 최근 예약 데이터 샘플
    const recentReservations = await prisma.reservation.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        guestName: true,
        checkInDate: true,
        checkOutDate: true,
        totalAmount: true,
        status: true,
        createdAt: true
      }
    });

    // 최근 패키지 데이터 샘플
    const recentPackages = await prisma.package.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        status: 'connected',
        responseTime,
        environment,
        tables: tableStats,
        recentData: {
          reservations: recentReservations,
          packages: recentPackages
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('DB 정보 조회 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      data: {
        status: 'disconnected',
        responseTime: 0,
        environment: {
          nodeEnv: process.env.NODE_ENV,
          databaseUrl: process.env.DATABASE_URL ? '설정됨' : '설정 안됨',
          vercelEnv: process.env.VERCEL_ENV || 'local',
          region: process.env.VERCEL_REGION || 'local'
        },
        tables: [],
        recentData: {
          reservations: [],
          packages: []
        },
        timestamp: new Date().toISOString()
      }
    });
  }
}
