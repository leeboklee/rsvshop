import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    
    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekStart.getDate() + 7);

    // 병렬로 모든 통계 조회
    const [
      totalReservations,
      todayReservations,
      thisWeekReservations,
      activeRooms,
      packages
    ] = await Promise.all([
      // 총 예약 수
      prisma.booking.count(),
      
      // 오늘 예약 수 (체크인 날짜 기준)
      prisma.booking.count({
        where: {
          checkInDate: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // 이번 주 예약 수
      prisma.booking.count({
        where: {
          checkInDate: {
            gte: thisWeekStart,
            lt: thisWeekEnd
          }
        }
      }),
      
      // 활성 객실 수
      prisma.room.count(),
      
      // 패키지 수
      prisma.package.count()
    ]);

    return NextResponse.json({
      totalReservations,
      todayReservations,
      thisWeekReservations,
      activeRooms,
      packages
    });
  } catch (error) {
    console.error('통계 조회 실패:', error);
    return NextResponse.json(
      { error: '통계를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 