import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const hotelId = searchParams.get('hotelId');
    const groupBy = searchParams.get('groupBy') || 'daily'; // daily, weekly, monthly

    // 기본 날짜 범위 설정 (최근 30일)
    const now = new Date();
    const defaultStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const start = startDate ? new Date(startDate) : defaultStartDate;
    const end = endDate ? new Date(endDate) : now;

    // 호텔별 필터 조건
    const where: any = {
      createdAt: {
        gte: start,
        lte: end
      }
    };

    if (hotelId) {
      where.room = {
        hotelId: hotelId
      };
    }

    // 예약 데이터 조회
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        room: {
          select: {
            id: true,
            name: true,
            hotel: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        items: {
          select: {
            quantity: true,
            price: true,
            package: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // 그룹별 데이터 집계
    let summaryData: any[] = [];
    
    if (groupBy === 'daily') {
      // 일별 집계
      const dailyMap = new Map();
      
      bookings.forEach(booking => {
        const date = booking.createdAt.toISOString().split('T')[0];
        const key = `${date}_${booking.room.hotel.id}`;
        
        if (!dailyMap.has(key)) {
          dailyMap.set(key, {
            date,
            hotelId: booking.room.hotel.id,
            hotelName: booking.room.hotel.name,
            totalBookings: 0,
            totalRevenue: 0,
            confirmedBookings: 0,
            pendingBookings: 0,
            cancelledBookings: 0
          });
        }
        
        const dayData = dailyMap.get(key);
        dayData.totalBookings++;
        dayData.totalRevenue += booking.totalAmount || 0;
        
        if (booking.status === 'CONFIRMED') dayData.confirmedBookings++;
        else if (booking.status === 'PENDING') dayData.pendingBookings++;
        else if (booking.status === 'CANCELLED') dayData.cancelledBookings++;
      });
      
      summaryData = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
      
    } else if (groupBy === 'weekly') {
      // 주별 집계
      const weeklyMap = new Map();
      
      bookings.forEach(booking => {
        const date = new Date(booking.createdAt);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        const key = `${weekKey}_${booking.room.hotel.id}`;
        
        if (!weeklyMap.has(key)) {
          weeklyMap.set(key, {
            weekStart: weekKey,
            hotelId: booking.room.hotel.id,
            hotelName: booking.room.hotel.name,
            totalBookings: 0,
            totalRevenue: 0,
            confirmedBookings: 0,
            pendingBookings: 0,
            cancelledBookings: 0
          });
        }
        
        const weekData = weeklyMap.get(key);
        weekData.totalBookings++;
        weekData.totalRevenue += booking.totalAmount || 0;
        
        if (booking.status === 'CONFIRMED') weekData.confirmedBookings++;
        else if (booking.status === 'PENDING') weekData.pendingBookings++;
        else if (booking.status === 'CANCELLED') weekData.cancelledBookings++;
      });
      
      summaryData = Array.from(weeklyMap.values()).sort((a, b) => a.weekStart.localeCompare(b.weekStart));
      
    } else if (groupBy === 'monthly') {
      // 월별 집계
      const monthlyMap = new Map();
      
      bookings.forEach(booking => {
        const date = new Date(booking.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const key = `${monthKey}_${booking.room.hotel.id}`;
        
        if (!monthlyMap.has(key)) {
          monthlyMap.set(key, {
            month: monthKey,
            hotelId: booking.room.hotel.id,
            hotelName: booking.room.hotel.name,
            totalBookings: 0,
            totalRevenue: 0,
            confirmedBookings: 0,
            pendingBookings: 0,
            cancelledBookings: 0
          });
        }
        
        const monthData = monthlyMap.get(key);
        monthData.totalBookings++;
        monthData.totalRevenue += booking.totalAmount || 0;
        
        if (booking.status === 'CONFIRMED') monthData.confirmedBookings++;
        else if (booking.status === 'PENDING') monthData.pendingBookings++;
        else if (booking.status === 'CANCELLED') monthData.cancelledBookings++;
      });
      
      summaryData = Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));
    }

    // 전체 통계 계산
    const totalStats = {
      totalBookings: bookings.length,
      totalRevenue: bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
      confirmedBookings: bookings.filter(b => b.status === 'CONFIRMED').length,
      pendingBookings: bookings.filter(b => b.status === 'PENDING').length,
      cancelledBookings: bookings.filter(b => b.status === 'CANCELLED').length,
      averageRevenue: bookings.length > 0 ? 
        Math.round(bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0) / bookings.length) : 0
    };

    return NextResponse.json({
      success: true,
      data: {
        summary: summaryData,
        totalStats,
        period: {
          start: start.toISOString(),
          end: end.toISOString(),
          groupBy
        }
      }
    });

  } catch (error) {
    console.error('예약 요약 리포트 생성 실패:', error);
    return NextResponse.json(
      { success: false, error: '예약 요약 리포트를 생성하는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
