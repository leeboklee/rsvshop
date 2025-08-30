import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: 매출 데이터 조회 (월별/주간)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'monthly';
    const range = searchParams.get('range') || '3months';
    const customRange = searchParams.get('customRange') === 'true';
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    // 커스텀 날짜 범위 사용
    if (customRange && startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
      endDate.setHours(23, 59, 59, 999); // 종료일의 마지막 시간으로 설정
    } else {
      // 기존 로직 (기간 설정)
      if (period === 'weekly') {
        // 이번 주 (월요일부터)
        const dayOfWeek = now.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startDate = new Date(now);
        startDate.setDate(now.getDate() - daysToMonday);
        startDate.setHours(0, 0, 0, 0);
      } else {
        // 월별 조회 - range에 따른 기간 설정
        switch (range) {
          case '3months':
            startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
            break;
          case '6months':
            startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
            break;
          case '12months':
            startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
            break;
          default:
            startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1); // 기본 3개월
        }
      }
    }

    // 예약 데이터 조회
    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          not: 'CANCELLED', // 취소된 예약 제외
        },
      },
      select: {
        totalAmount: true,
        originalPrice: true,
        commissionAmount: true,
        supplyPrice: true,
        status: true,
        createdAt: true,
      },
    });

    // 확정된 예약만 매출 계산에 사용
    const confirmedBookings = bookings.filter(booking => booking.status === 'CONFIRMED');

    // 매출 통계 계산 (확정된 예약만)
    const totalSales = confirmedBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
    const totalOriginalPrice = confirmedBookings.reduce((sum, booking) => sum + (booking.originalPrice || 0), 0);
    const totalCommission = confirmedBookings.reduce((sum, booking) => sum + (booking.commissionAmount || 0), 0);
    const totalSupplyPrice = confirmedBookings.reduce((sum, booking) => sum + (booking.supplyPrice || 0), 0);
    
    // 부가세 계산 (공급가의 10%)
    const totalVAT = Math.round(totalSupplyPrice * 0.1);

    // 상태별 예약 수 (전체 예약 기준)
    const statusCounts = bookings.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 일별 매출 데이터 (확정된 예약만, 차트용)
    const dailySales = confirmedBookings.reduce((acc, booking) => {
      const date = booking.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          sales: 0,
          commission: 0,
          supplyPrice: 0,
          count: 0,
        };
      }
      acc[date].sales += booking.totalAmount || 0;
      acc[date].commission += booking.commissionAmount || 0;
      acc[date].supplyPrice += booking.supplyPrice || 0;
      acc[date].count += 1;
      return acc;
    }, {} as Record<string, any>);

    // 일별 데이터를 배열로 변환
    const dailySalesArray = Object.entries(dailySales)
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 기간 이름 생성
    const getPeriodName = () => {
      if (customRange && startDateParam && endDateParam) {
        const start = new Date(startDateParam);
        const end = new Date(endDateParam);
        const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= 7) {
          return `${start.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} ~ ${end.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}`;
        } else if (daysDiff <= 31) {
          return `${start.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} ~ ${end.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}`;
        } else {
          return `${start.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' })} ~ ${end.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' })}`;
        }
      }
      
      if (period === 'weekly') return '이번 주';
      switch (range) {
        case '3months': return '최근 3개월';
        case '6months': return '최근 6개월';
        case '12months': return '최근 12개월';
        default: return '최근 3개월';
      }
    };

    return NextResponse.json({
      period,
      range,
      periodInfo: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        periodName: getPeriodName(),
      },
      summary: {
        totalSales,
        totalOriginalPrice,
        totalCommission,
        totalSupplyPrice,
        totalVAT,
        totalBookings: confirmedBookings.length, // 확정된 예약 수
        averageSales: confirmedBookings.length > 0 ? Math.round(totalSales / confirmedBookings.length) : 0,
      },
      statusCounts,
      dailySales: dailySalesArray,
      currency: 'KRW',
    });
  } catch (error) {
    console.error('매출 데이터 조회 실패:', error);
    return NextResponse.json(
      { error: '매출 데이터를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 