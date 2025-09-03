import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('[호텔 API] GET 요청 시작');
    
    // 데이터베이스 연결 확인
    await prisma.$queryRaw`SELECT 1`;
    console.log('[호텔 API] DB 연결 성공');
    
    const hotels = await prisma.hotel.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        email: true,
        description: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            rooms: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('[호텔 API] 조회된 호텔:', hotels);
    
    return NextResponse.json({ hotels });
  } catch (error) {
    console.error('[호텔 API] GET 오류:', error);
    return NextResponse.json(
      { error: '호텔 목록 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[호텔 API] POST 요청 시작');
    
    const data = await request.json();
    console.log('[호텔 API] 요청 데이터:', data);
    
    const { name, address, phone, email, description } = data;
    
    // 필수 필드 검증
    if (!name) {
      return NextResponse.json(
        { error: '호텔명은 필수 항목입니다.' },
        { status: 400 }
      );
    }
    
    // 중복 호텔명 확인
    const existingHotel = await prisma.hotel.findFirst({
      where: { name: name.trim() }
    });
    
    if (existingHotel) {
      return NextResponse.json(
        { error: '이미 존재하는 호텔명입니다.' },
        { status: 400 }
      );
    }
    
    console.log('[호텔 API] 호텔 생성 시도:', {
      name: name.trim(),
      address: address?.trim() || null,
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      description: description?.trim() || null
    });
    
    const hotel = await prisma.hotel.create({
      data: {
        name: name.trim(),
        address: address?.trim() || null,
        phone: phone?.trim() || '미입력',
        email: email?.trim() || null,
        description: description?.trim() || null
      }
    });
    
    console.log('[호텔 API] 생성 성공:', hotel);
    
    return NextResponse.json(hotel);
  } catch (error) {
    console.error('[호텔 API] POST 오류:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: '이미 존재하는 호텔명입니다.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: '호텔 등록에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    console.log('[호텔 API] PATCH 요청 시작');
    
    const data = await request.json();
    console.log('[호텔 API] 수정 요청 데이터:', data);
    
    const { id, name, address, phone, email, description } = data;
    
    // 필수 필드 검증
    if (!id || !name) {
      return NextResponse.json(
        { error: '호텔 ID와 호텔명은 필수 항목입니다.' },
        { status: 400 }
      );
    }
    
    // 호텔 존재 확인
    const existingHotel = await prisma.hotel.findUnique({
      where: { id }
    });
    
    if (!existingHotel) {
      return NextResponse.json(
        { error: '존재하지 않는 호텔입니다.' },
        { status: 404 }
      );
    }
    
    // 중복 호텔명 확인 (자신 제외)
    const duplicateHotel = await prisma.hotel.findFirst({
      where: { 
        name: name.trim(),
        id: { not: id }
      }
    });
    
    if (duplicateHotel) {
      return NextResponse.json(
        { error: '이미 존재하는 호텔명입니다.' },
        { status: 400 }
      );
    }
    
    console.log('[호텔 API] 호텔 수정 시도:', {
      id,
      name: name.trim(),
      address: address?.trim() || null,
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      description: description?.trim() || null
    });
    
    const hotel = await prisma.hotel.update({
      where: { id },
      data: {
        name: name.trim(),
        address: address?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        description: description?.trim() || null
      }
    });
    
    console.log('[호텔 API] 수정 성공:', hotel);
    
    return NextResponse.json(hotel);
  } catch (error) {
    console.error('[호텔 API] PATCH 오류:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: '이미 존재하는 호텔명입니다.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: '호텔 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('[호텔 API] DELETE 요청 시작');
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: '호텔 ID는 필수입니다.' },
        { status: 400 }
      );
    }
    
    // 호텔 존재 확인
    const existingHotel = await prisma.hotel.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            packages: true,
            rooms: true
          }
        }
      }
    });
    
    if (!existingHotel) {
      return NextResponse.json(
        { error: '존재하지 않는 호텔입니다.' },
        { status: 404 }
      );
    }
    
    // 관련 데이터가 있는지 확인
    if (existingHotel._count.packages > 0 || existingHotel._count.rooms > 0) {
      return NextResponse.json(
        { error: '관련된 패키지나 객실이 있어 삭제할 수 없습니다.' },
        { status: 400 }
      );
    }
    
    console.log('[호텔 API] 호텔 삭제 시도:', id);
    
    const hotel = await prisma.hotel.delete({
      where: { id }
    });
    
    console.log('[호텔 API] 삭제 성공:', hotel);
    
    return NextResponse.json({ success: true, message: '호텔이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('[호텔 API] DELETE 오류:', error);
    
    return NextResponse.json(
      { error: '호텔 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
} 