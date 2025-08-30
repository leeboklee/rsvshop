import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withApiKeyAuth } from '@/app/lib/apiKeyAuth';

const prisma = new PrismaClient();

// GET: 예약 목록 조회 (외부 API)
export const GET = withApiKeyAuth(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const search = searchParams.get('search') || '';
      const status = searchParams.get('status') || '';
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');

      const skip = (page - 1) * limit;

      // 검색 조건 구성
      const where: any = {};
      if (search) {
        where.OR = [
          { guestName: { contains: search, mode: 'insensitive' } },
          { guestEmail: { contains: search, mode: 'insensitive' } },
          { guestPhone: { contains: search } },
        ];
      }
      if (status && status !== 'ALL') {
        where.status = status;
      }
      if (startDate && endDate) {
        where.AND = [
          { checkInDate: { gte: new Date(startDate) } },
          { checkOutDate: { lte: new Date(endDate) } },
        ];
      }

      // 성능 최적화: 병렬 쿼리 실행
      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          where,
          select: {
            id: true,
            guestName: true,
            guestEmail: true,
            guestPhone: true,
            checkInDate: true,
            checkOutDate: true,
            status: true,
            totalAmount: true,
            guestCount: true,
            specialRequests: true,
            memo: true,
            source: true,
            shoppingMall: true,
            createdAt: true,
            room: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
            items: {
              select: {
                id: true,
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
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.booking.count({ where }),
      ]);

      return NextResponse.json({
        success: true,
        data: {
          bookings,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error('외부 API: 예약 목록 조회 실패', error);
      return NextResponse.json(
        { 
          success: false,
          error: '예약 목록을 불러오는데 실패했습니다.' 
        },
        { status: 500 }
      );
    }
  },
  ['reservations.read']
);

// POST: 신규 예약 생성 (외부 API)
export const POST = withApiKeyAuth(
  async (request: NextRequest) => {
    try {
      const data = await request.json();
      const {
        customerName,
        customerEmail,
        customerPhone,
        roomId,
        selectedPackages,
        checkInDate,
        checkOutDate,
        totalPrice,
        specialRequests,
        paymentMethod,
        discountType,
        discountAmount,
        guestCount,
        memo,
        source,
        status,
        shoppingMall,
      } = data;

      // 유효성 검사
      if (!customerName) {
        return NextResponse.json({ 
          success: false,
          error: '고객 이름은 필수 입력값입니다.' 
        }, { status: 400 });
      }

      // 성능 최적화: 단일 트랜잭션으로 처리
      const result = await prisma.$transaction(async (tx) => {
        // 1. 예약 생성
        const booking = await tx.booking.create({
          data: {
            roomId: roomId || null,
            guestName: customerName,
            guestEmail: customerEmail || '',
            guestPhone: customerPhone || '',
            checkInDate: checkInDate ? new Date(checkInDate) : new Date(),
            checkOutDate: checkOutDate ? new Date(checkOutDate) : new Date(Date.now() + 24 * 60 * 60 * 1000),
            status: status || 'CONFIRMED',
            totalAmount: Number(totalPrice || 0),
            specialRequests: specialRequests || '',
            paymentMethod: paymentMethod || 'CARD',
            discountType: discountType || 'NONE',
            discountAmount: Number(discountAmount || 0),
            guestCount: Number(guestCount || 1),
            memo: memo || '',
            source: source || 'EXTERNAL_API',
            shoppingMall: shoppingMall || '',
          },
        });

        // 2. 패키지 아이템 생성 (있는 경우에만)
        if (selectedPackages && selectedPackages.length > 0) {
          await tx.bookingItem.createMany({
            data: selectedPackages.map((pkgId: number) => ({
              bookingId: booking.id,
              packageId: pkgId.toString(),
              quantity: 1,
              price: 0,
            })),
          });
        }

        // 3. 완성된 예약 정보 반환
        return await tx.booking.findUnique({
          where: { id: booking.id },
          select: {
            id: true,
            guestName: true,
            guestEmail: true,
            guestPhone: true,
            checkInDate: true,
            checkOutDate: true,
            status: true,
            totalAmount: true,
            guestCount: true,
            specialRequests: true,
            memo: true,
            source: true,
            shoppingMall: true,
            createdAt: true,
            room: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
            items: {
              select: {
                id: true,
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
      });

      return NextResponse.json({
        success: true,
        data: result,
        message: '예약이 성공적으로 생성되었습니다.',
      }, { status: 201 });
    } catch (error) {
      console.error('외부 API: 신규 예약 생성 오류', error);
      
      // 구체적인 에러 메시지 제공
      if (error.code === 'P2002') {
        return NextResponse.json({ 
          success: false,
          error: '중복된 예약입니다.' 
        }, { status: 400 });
      }
      if (error.code === 'P2003') {
        return NextResponse.json({ 
          success: false,
          error: '존재하지 않는 객실입니다.' 
        }, { status: 400 });
      }
      
      return NextResponse.json({ 
        success: false,
        error: '서버 오류가 발생했습니다.' 
      }, { status: 500 });
    }
  },
  ['reservations.write']
); 