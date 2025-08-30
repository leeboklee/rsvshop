import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import logger from '@/app/lib/logger';

export async function PATCH(request: NextRequest) {
  try {
    const { bookingIds, status } = await request.json();

    if (!bookingIds || !Array.isArray(bookingIds) || bookingIds.length === 0) {
      return NextResponse.json({ error: '예약 ID 목록이 필요합니다.' }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({ error: '상태값이 필요합니다.' }, { status: 400 });
    }

    // 일괄 업데이트
    await prisma.booking.updateMany({
      where: {
        id: {
          in: bookingIds,
        },
      },
      data: {
        status,
      },
    });

    // 업데이트된 예약 목록 조회
    const updatedBookings = await prisma.booking.findMany({
      where: {
        id: {
          in: bookingIds,
        },
      },
      include: {
        room: true,
        items: {
          include: {
            package: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // logger.info(`관리자: 일괄 예약 상태 변경 - ${bookingIds.length}개, 상태: ${status}`);
    return NextResponse.json(updatedBookings);
  } catch (error) {
    logger.error('관리자: 일괄 예약 상태 변경 오류', { error });
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 