import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: 모든 객실 정보 조회
export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
          },
        },
        bookings: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(rooms);
  } catch (error) {
    console.error('관리자: 객실 조회 오류', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// POST: 신규 객실 생성
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, description, capacity, hotelId, price } = data;

    if (!name || !description || capacity === undefined || !hotelId) {
      return NextResponse.json({ error: '필수 입력값이 누락되었습니다.' }, { status: 400 });
    }

    const newRoom = await prisma.room.create({
      data: {
        name,
        description,
        capacity: Number(capacity),
        price: Number(price) || 0,
        hotelId,
      },
    });

    console.log(`관리자: 신규 객실 생성 완료 - ${name}`);
    return NextResponse.json(newRoom, { status: 201 });
  } catch (error) {
    console.error('관리자: 객실 생성 오류', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 