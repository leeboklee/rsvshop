import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import logger from '@/app/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { checkInDate, checkOutDate } = await request.json();

    if (!checkInDate || !checkOutDate) {
      return NextResponse.json({ error: '체크인/아웃 날짜가 필요합니다.' }, { status: 400 });
    }

    // 해당 기간에 예약된 객실 조회
    const bookedRooms = await prisma.booking.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                checkInDate: {
                  lt: new Date(checkOutDate),
                },
              },
              {
                checkOutDate: {
                  gt: new Date(checkInDate),
                },
              },
            ],
          },
          {
            status: {
              not: 'CANCELLED',
            },
          },
          {
            roomId: {
              not: null,
            },
          },
        ],
      },
      select: {
        roomId: true,
      },
    });

    // 모든 객실 조회
    const allRooms = await prisma.room.findMany({
      select: {
        id: true,
      },
    });

    // 가용성 맵 생성
    const availability: { [key: string]: boolean } = {};
    const bookedRoomIds = new Set(bookedRooms.map(booking => booking.roomId));

    allRooms.forEach(room => {
      availability[room.id] = !bookedRoomIds.has(room.id);
    });

    // logger.info('객실 가용성 체크 완료', { checkInDate, checkOutDate, availability });
    return NextResponse.json(availability);
  } catch (error) {
    logger.error('객실 가용성 체크 오류', { error });
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 