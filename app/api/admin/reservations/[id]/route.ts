import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
// import { apiErrorHandler } from '@/app/lib/api-error-handler';

const prisma = new PrismaClient();

// 개별 예약 상세 정보 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: '예약 ID가 필요합니다.' }, { status: 400 });
    }
    
    const booking = await prisma.booking.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        totalAmount: true,
        status: true,
        checkInDate: true,
        checkOutDate: true,
        guestName: true,
        guestPhone: true,
        guestEmail: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        roomId: true,
        depositAmount: true,
        externalId: true,
        orderNumber: true,
        sellingPrice: true,
        shoppingMall: true,
        supplyPrice: true,
        profit: true,
        vatAmount: true,
        vatRate: true,
        commission: true,
        commissionRate: true,
        room: {
          select: {
            id: true,
            name: true,
            description: true,
            basePrice: true,
          },
        },
        user: { 
          select: { 
            id: true, 
            name: true, 
            email: true,
          },
        },
        bookingItems: {
          select: {
            id: true,
            packageId: true,
            quantity: true,
            price: true,
            package: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
              },
            },
          },
        },
      },
    });
    
    if (!booking) {
      return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 });
    }
    
    return NextResponse.json(booking);
  } catch (error: any) {
    console.error('개별 예약 조회 오류:', error);
    return NextResponse.json({ error: '예약 정보를 불러오는 중 오류가 발생했습니다.', details: error.message }, { status: 500 });
  }
}

// 예약 정보 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();

    if (!id) {
      return NextResponse.json({ error: '예약 ID가 필요합니다.' }, { status: 400 });
    }

    // 기존 예약 확인
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 수정할 데이터 준비
    const updateData: any = {};

    // 기본 필드들
    if (data.guestName !== undefined) updateData.guestName = data.guestName;
    if (data.guestPhone !== undefined) updateData.guestPhone = data.guestPhone;
    if (data.guestEmail !== undefined) updateData.guestEmail = data.guestEmail;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.shoppingMall !== undefined) updateData.shoppingMall = data.shoppingMall;
    if (data.orderNumber !== undefined) updateData.orderNumber = data.orderNumber;
    if (data.externalId !== undefined) updateData.externalId = data.externalId;

    // 날짜 필드들
    if (data.checkInDate !== undefined) updateData.checkInDate = new Date(data.checkInDate);
    if (data.checkOutDate !== undefined) updateData.checkOutDate = new Date(data.checkOutDate);

    // 가격 필드들
    if (data.sellingPrice !== undefined) updateData.sellingPrice = data.sellingPrice;
    if (data.depositAmount !== undefined) updateData.depositAmount = data.depositAmount;
    if (data.supplyPrice !== undefined) updateData.supplyPrice = data.supplyPrice;
    if (data.totalAmount !== undefined) updateData.totalAmount = data.totalAmount;

    // 수익 및 부가세 필드들
    if (data.sellingPrice !== undefined && data.supplyPrice !== undefined) {
      const profit = Math.max(0, data.sellingPrice - data.supplyPrice);
      const commission = (data.sellingPrice * 4) / 100; // 기본 수수료율 4%
      const vatAmount = (data.supplyPrice * 10) / 100; // 기본 부가세율 10%
      
      updateData.profit = profit;
      updateData.commission = commission;
      updateData.commissionRate = 4;
      updateData.vatAmount = vatAmount;
      updateData.vatRate = 10;
    }

    // 객실 ID
    if (data.roomId !== undefined) {
      if (data.roomId === '' || data.roomId === null) {
        updateData.roomId = null;
      } else {
        // 객실 존재 확인
        const room = await prisma.room.findUnique({
          where: { id: data.roomId },
        });
        if (room) {
          updateData.roomId = data.roomId;
        } else {
          updateData.roomId = null;
        }
      }
    }

    // 예약 업데이트
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        userId: true,
        totalAmount: true,
        status: true,
        checkInDate: true,
        checkOutDate: true,
        guestName: true,
        guestPhone: true,
        guestEmail: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        roomId: true,
        depositAmount: true,
        externalId: true,
        orderNumber: true,
        sellingPrice: true,
        shoppingMall: true,
        supplyPrice: true,
        profit: true,
        vatAmount: true,
        vatRate: true,
        commission: true,
        commissionRate: true,
        room: {
          select: {
            id: true,
            name: true,
            description: true,
            basePrice: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        bookingItems: {
          select: {
            id: true,
            packageId: true,
            quantity: true,
            price: true,
            package: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedBooking);
  } catch (error: any) {
    console.error('예약 수정 오류:', error);
    return NextResponse.json({ error: '예약 정보를 수정하는 중 오류가 발생했습니다.', details: error.message }, { status: 500 });
  }
}

// 예약 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: '예약 ID가 필요합니다.' }, { status: 400 });
    }

    // 기존 예약 확인
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 예약 삭제 (연관된 bookingItems는 onDelete: Cascade로 자동 삭제)
    await prisma.booking.delete({
      where: { id },
    });

    return NextResponse.json({ message: '예약이 성공적으로 삭제되었습니다.' });
  } catch (error: any) {
    console.error('예약 삭제 오류:', error);
    return NextResponse.json({ error: '예약을 삭제하는 중 오류가 발생했습니다.', details: error.message }, { status: 500 });
  }
}