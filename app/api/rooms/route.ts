import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Prisma 클라이언트 최적화
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error'],
  errorFormat: 'minimal',
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hotelId = searchParams.get('hotelId');
    const available = searchParams.get('available');

    // 검색 조건 구성
    const where: any = {};
    if (hotelId) {
      where.hotelId = hotelId;
    }
    if (available !== null) {
      where.available = available === 'true';
    }

    // 데이터베이스에서 객실 목록 조회
    const rooms = await prisma.room.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        capacity: true,
        basePrice: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
        hotelId: true,
        hotel: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      rooms,
      total: rooms.length
    });
  } catch (error) {
    console.error('객실 목록 조회 실패:', error);
    return NextResponse.json(
      { success: false, error: '객실 목록을 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, capacity, basePrice, imageUrl, hotelId } = body;

    // 필수 필드 검증
    if (!name?.trim()) {
      return NextResponse.json(
        { error: '객실명은 필수입니다.' },
        { status: 400 }
      );
    }

    // 새 객실 생성
    const newRoom = await prisma.room.create({
      data: {
        name: name.trim(),
        description: description?.trim() || '',
        capacity: capacity || 2,
        basePrice: basePrice || 0,
        imageUrl: imageUrl || '',
        hotelId: hotelId || null,
      },
    });

    return NextResponse.json({
      success: true,
      room: newRoom,
      message: '객실이 성공적으로 생성되었습니다.'
    }, { status: 201 });
  } catch (error) {
    console.error('객실 생성 실패:', error);
    return NextResponse.json(
      { success: false, error: '객실 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
} 