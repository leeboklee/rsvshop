import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[패키지 API] PATCH 요청 시작:', params.id);
    
    const data = await request.json();
    console.log('[패키지 API] 수정 요청 데이터:', data);
    
    const { name, description, price, hotelId } = data;
    
    // 필수 필드 검증
    if (!name || !hotelId || !price || price <= 0) {
      return NextResponse.json(
        { error: '패키지명, 호텔, 가격은 필수 항목입니다.' },
        { status: 400 }
      );
    }
    
    // 패키지 존재 확인
    const existingPackage = await prisma.package.findUnique({
      where: { id: params.id }
    });
    
    if (!existingPackage) {
      return NextResponse.json(
        { error: '존재하지 않는 패키지입니다.' },
        { status: 404 }
      );
    }
    
    // 호텔 존재 확인
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId }
    });
    
    if (!hotel) {
      return NextResponse.json(
        { error: '존재하지 않는 호텔입니다.' },
        { status: 400 }
      );
    }
    
    console.log('[패키지 API] 패키지 수정 시도:', {
      id: params.id,
      name: name.trim(),
      description: description?.trim() || null,
      price,
      hotelId
    });
    
    const pkg = await prisma.package.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        price,
        hotelId
      }
    });
    
    console.log('[패키지 API] 수정 성공:', pkg);
    
    return NextResponse.json({ success: true, package: pkg });
  } catch (error) {
    console.error('[패키지 API] PATCH 오류:', error);
    
    return NextResponse.json(
      { error: '패키지 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[패키지 API] DELETE 요청 시작:', params.id);
    
    // 패키지 존재 확인
    const existingPackage = await prisma.package.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            items: true
          }
        }
      }
    });
    
    if (!existingPackage) {
      return NextResponse.json(
        { error: '존재하지 않는 패키지입니다.' },
        { status: 404 }
      );
    }
    
    // 관련 예약이 있는지 확인
    if (existingPackage._count.items > 0) {
      return NextResponse.json(
        { error: '관련된 예약이 있어 삭제할 수 없습니다.' },
        { status: 400 }
      );
    }
    
    console.log('[패키지 API] 패키지 삭제 시도:', params.id);
    
    const pkg = await prisma.package.delete({
      where: { id: params.id }
    });
    
    console.log('[패키지 API] 삭제 성공:', pkg);
    
    return NextResponse.json({ success: true, message: '패키지가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('[패키지 API] DELETE 오류:', error);
    
    return NextResponse.json(
      { error: '패키지 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
} 