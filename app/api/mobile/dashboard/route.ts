import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hotelId = searchParams.get('hotelId');
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // 호텔별 필터 조건
    const hotelFilter = hotelId ? { hotelId } : {};

    // 오늘의 예약 현황
    const todayBookings = await prisma.booking.count({
      where: {
        ...hotelFilter,
        checkInDate: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // 내일의 예약 현황
    const tomorrowBookings = await prisma.booking.count({
      where: {
        ...hotelFilter,
        checkInDate: {
          gte: tomorrow,
          lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });

    // 이번 주 예약 현황
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

    const thisWeekBookings = await prisma.booking.count({
      where: {
        ...hotelFilter,
        checkInDate: {
          gte: weekStart,
          lt: weekEnd
        }
      }
    });

    // 대기 중인 예약
    const pendingBookings = await prisma.booking.count({
      where: {
        ...hotelFilter,
        status: 'PENDING'
      }
    });

    // 오늘 체크아웃
    const todayCheckouts = await prisma.booking.count({
      where: {
        ...hotelFilter,
        checkOutDate: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // 최근 예약 목록 (최근 5개)
    const recentBookings = await prisma.booking.findMany({
      where: {
        ...hotelFilter,
        createdAt: {
          gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // 최근 7일
        }
      },
      select: {
        id: true,
        guestName: true,
        checkInDate: true,
        checkOutDate: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        room: {
          select: {
            name: true,
            hotel: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // 긴급 알림 (체크인 1시간 전)
    const urgentNotifications = await prisma.booking.findMany({
      where: {
        ...hotelFilter,
        status: 'CONFIRMED',
        checkInDate: {
          gte: now,
          lte: new Date(now.getTime() + 60 * 60 * 1000) // 1시간 이내
        }
      },
      select: {
        id: true,
        guestName: true,
        checkInDate: true,
        room: {
          select: {
            name: true,
            hotel: {
              select: {
                name: true
              }
            }
          }
        }
      },
      take: 10
    });

    // 간단한 통계
    const stats = {
      todayBookings,
      tomorrowBookings,
      thisWeekBookings,
      pendingBookings,
      todayCheckouts,
      urgentCount: urgentNotifications.length
    };

    // 모바일 최적화된 응답
    const mobileDashboard = {
      stats,
      recentBookings,
      urgentNotifications,
      lastUpdated: now.toISOString()
    };

    return NextResponse.json({
      success: true,
      data: mobileDashboard
    });

  } catch (error) {
    console.error('모바일 대시보드 조회 실패:', error);
    return NextResponse.json(
      { success: false, error: '모바일 대시보드를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
