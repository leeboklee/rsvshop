import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 예약 상세 조회 시작:', params.id);
    
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        bookingItems: { 
          include: { 
            package: true 
          } 
        },
        room: true,
        user: { 
          select: { 
            id: true, 
            name: true, 
            email: true 
          } 
        }
      }
    });
    
    if (!booking) {
      console.log('❌ 예약을 찾을 수 없음:', params.id);
      return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 });
    }
    
    // 응답 데이터 구조화
    const responseData = {
      id: booking.id,
      userId: booking.userId,
      roomId: booking.roomId,
      totalAmount: booking.totalAmount,
      status: booking.status,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      guestName: booking.guestName,
      guestPhone: booking.guestPhone,
      guestEmail: booking.guestEmail,
      notes: booking.notes,
      shoppingMall: booking.shoppingMall,
      orderNumber: booking.orderNumber,
      externalId: booking.externalId,
      sellingPrice: booking.sellingPrice,
      depositAmount: booking.depositAmount,
      supplyPrice: booking.supplyPrice,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      room: booking.room,
      user: booking.user,
      bookingItems: booking.bookingItems,
      // 추가 계산된 필드들
      totalPrice: booking.totalAmount,
      items: booking.bookingItems.map(item => ({
        package: item.package,
        price: item.price,
        quantity: item.quantity
      }))
    };
    
    console.log('✅ 예약 상세 조회 성공:', responseData.id);
    return NextResponse.json(responseData);
    
  } catch (e) {
    console.error('❌ 예약 상세 조회 실패:', e);
    return NextResponse.json({ 
      error: '조회 실패', 
      details: e instanceof Error ? e.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const data: any = {};
    if (body.status) data.status = body.status;
    if (body.guestName) data.guestName = body.guestName;
    if (body.guestEmail !== undefined) data.guestEmail = body.guestEmail || null;
    if (body.guestPhone !== undefined) data.guestPhone = body.guestPhone || '';
    if (body.shoppingMall !== undefined) data.shoppingMall = body.shoppingMall || null;
    if (body.orderNumber !== undefined) data.orderNumber = body.orderNumber || null;
    if (body.sellingPrice !== undefined) data.sellingPrice = body.sellingPrice ?? null;
    if (body.depositAmount !== undefined) data.depositAmount = body.depositAmount ?? null;
    if (body.supplyPrice !== undefined) data.supplyPrice = body.supplyPrice ?? null;
    if (body.checkInDate) data.checkInDate = new Date(body.checkInDate);
    if (body.checkOutDate) data.checkOutDate = new Date(body.checkOutDate);

    const updated = await prisma.booking.update({ where: { id: params.id }, data });
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: '업데이트 실패' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.bookingItem.deleteMany({ where: { bookingId: params.id } });
    await prisma.booking.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: '삭제 실패' }, { status: 500 });
  }
}