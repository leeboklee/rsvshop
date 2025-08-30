import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// 모든 예약 조회 (GET)
export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: true,
        bookingItems: {
          include: {
            package: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('예약 조회 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 신규 예약 생성 (POST)
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      userId,
      roomId,
      items, // packageId, quantity, price를 포함한 배열
      totalAmount,
      checkInDate,
      checkOutDate,
      guestName,
      guestPhone,
      guestEmail,
    } = data;

    if (!roomId || !items || items.length === 0 || !totalAmount || !checkInDate || !checkOutDate || !guestName || !guestPhone) {
      return NextResponse.json({ error: '필수 입력값이 누락되었습니다.' }, { status: 400 });
    }

    const newBooking = await prisma.booking.create({
      data: {
        userId,
        roomId,
        totalAmount,
        status: 'PENDING',
        checkInDate: new Date(checkInDate),
        checkOutDate: new Date(checkOutDate),
        guestName,
        guestPhone,
        guestEmail,
        bookingItems: {
          create: items.map((item: { packageId: string; quantity: number; price: number }) => ({
            packageId: item.packageId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        bookingItems: {
          include: {
            package: true,
          },
        },
        user: true,
        room: true,
      },
    });

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error('예약 생성 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 