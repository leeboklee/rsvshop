import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: 고객 목록 조회 (ERP용)
export async function GET(request: NextRequest) {
  try {
    // 모든 예약 데이터 조회 (이메일이 있는 것만)
    const bookings = await prisma.booking.findMany({
      select: {
        id: true,
        guestEmail: true,
        guestName: true,
        guestPhone: true,
        totalAmount: true,
        createdAt: true,
        checkInDate: true,
        checkOutDate: true,
        status: true,
      },
      where: {
        guestEmail: {
          not: null,
          not: ''
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 고객별로 데이터 그룹화
    const customerMap = new Map();
    
    bookings.forEach(booking => {
      const email = booking.guestEmail;
      if (!email) return; // 이메일이 없으면 건너뛰기
      
      if (!customerMap.has(email)) {
        customerMap.set(email, {
          id: email,
          guestName: booking.guestName || '이름 없음',
          guestEmail: email,
          guestPhone: booking.guestPhone || '전화번호 없음',
          shoppingMall: '직접 예약', // 기본값
          totalBookings: 0,
          totalSpent: 0,
          lastBookingDate: booking.createdAt,
          createdAt: booking.createdAt,
          recentBookings: [],
          averageSpent: 0,
        });
      }
      
      const customer = customerMap.get(email);
      customer.totalBookings += 1;
      customer.totalSpent += booking.totalAmount || 0;
      
      // 최근 예약 정보 추가
      customer.recentBookings.push({
        id: booking.id,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        amount: booking.totalAmount,
        status: booking.status,
        createdAt: booking.createdAt
      });
      
      if (booking.createdAt > customer.lastBookingDate) {
        customer.lastBookingDate = booking.createdAt;
      }
    });

    // 평균 지출액 계산 및 최근 예약 정렬
    const customerData = Array.from(customerMap.values()).map(customer => ({
      ...customer,
      averageSpent: customer.totalBookings > 0 ? Math.round(customer.totalSpent / customer.totalBookings) : 0,
      recentBookings: customer.recentBookings
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5) // 최근 5개만
    }));

    // 총 예약 수로 정렬
    customerData.sort((a, b) => b.totalBookings - a.totalBookings);

    return NextResponse.json(customerData);
  } catch (error) {
    console.error('고객 데이터 조회 실패:', error);
    return NextResponse.json(
      { error: '고객 데이터를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 