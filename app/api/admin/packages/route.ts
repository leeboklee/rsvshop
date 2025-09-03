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

// GET: 패키지 목록 조회 (객실별)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // 검색 조건 구성
    const where: any = {};
    if (roomId) {
      where.roomId = roomId;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 패키지 목록 조회 (객실 정보 포함)
    const packages = await prisma.package.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        roomId: true,
        createdAt: true,
        updatedAt: true,
        room: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            bookingItems: true, // 예약된 횟수
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    // 전체 개수 조회
    const total = await prisma.package.count({ where });

    return NextResponse.json({
      packages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('패키지 목록 조회 실패:', error);
    return NextResponse.json(
      { error: '패키지 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 새 패키지 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, roomId } = body;

    // 필수 필드 검증
    if (!name?.trim()) {
      return NextResponse.json(
        { error: '패키지명은 필수입니다.' },
        { status: 400 }
      );
    }

    if (!roomId?.trim()) {
      return NextResponse.json(
        { error: '객실 선택은 필수입니다.' },
        { status: 400 }
      );
    }

    if (!price || price <= 0) {
      return NextResponse.json(
        { error: '유효한 가격을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 객실 존재 여부 확인
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: { id: true, name: true }
    });

    if (!room) {
      return NextResponse.json(
        { error: '선택한 객실을 찾을 수 없습니다.' },
        { status: 400 }
      );
    }

    // 패키지 생성
    const newPackage = await prisma.package.create({
      data: {
        name: name.trim(),
        description: description?.trim() || '',
        price: parseFloat(price),
        roomId: roomId
      },
      include: {
        room: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(newPackage, { status: 201 });
  } catch (error) {
    console.error('패키지 생성 실패:', error);
    return NextResponse.json(
      { error: '패키지 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// PATCH: 패키지 수정
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, price, roomId, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: '패키지 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 패키지 존재 확인
    const existingPackage = await prisma.package.findUnique({
      where: { id },
    });

    if (!existingPackage) {
      return NextResponse.json(
        { error: '존재하지 않는 패키지입니다.' },
        { status: 404 }
      );
    }

    // 업데이트 데이터 구성
    const updateData: any = {};
    if (name?.trim()) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (roomId) {
      // 객실 존재 여부 확인
      const room = await prisma.room.findUnique({
        where: { id: roomId },
        select: { id: true, name: true }
      });
      
      if (!room) {
        return NextResponse.json(
          { error: '선택한 객실을 찾을 수 없습니다.' },
          { status: 400 }
        );
      }
      updateData.roomId = roomId;
    }
    

    // 패키지 업데이트
    const updatedPackage = await prisma.package.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        roomId: true,
        updatedAt: true,
        room: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: '패키지가 성공적으로 수정되었습니다.',
      package: updatedPackage,
    });
  } catch (error) {
    console.error('패키지 수정 실패:', error);
    return NextResponse.json(
      { error: '패키지 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE: 패키지 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: '패키지 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 패키지 존재 확인
    const existingPackage = await prisma.package.findUnique({
      where: { id },
             include: {
         bookingItems: true, // 예약된 패키지 확인
       },
    });

    if (!existingPackage) {
      return NextResponse.json(
        { error: '존재하지 않는 패키지입니다.' },
        { status: 404 }
      );
    }

         // 예약된 패키지가 있는지 확인
     if (existingPackage.bookingItems.length > 0) {
      return NextResponse.json(
        { error: '예약된 패키지는 삭제할 수 없습니다. 비활성화를 사용해주세요.' },
        { status: 400 }
      );
    }

    // 패키지 삭제
    await prisma.package.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: '패키지가 성공적으로 삭제되었습니다.',
    });
  } catch (error) {
    console.error('패키지 삭제 실패:', error);
    return NextResponse.json(
      { error: '패키지 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
} 