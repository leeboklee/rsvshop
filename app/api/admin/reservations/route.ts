import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { calculatePrices } from '@/app/lib/calculations';

const prisma = new PrismaClient();

// GET: 예약 목록 조회 (관리자용)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    // 기본 limit를 20→10으로 낮춰 초기 로딩 개선
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

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

    // 성능 최적화: 병렬 쿼리 실행 및 필요한 필드만 선택
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
          notes: true,
          createdAt: true,
          
          // 쇼핑몰 관련 필드
          shoppingMall: true,
          orderNumber: true,
          externalId: true,
          
          // 가격 관련 필드
          sellingPrice: true,
          depositAmount: true,
          supplyPrice: true,
          
          // 수익 및 부가세 필드
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
            },
          },

          // 리스트 화면에서는 bookingItems 제외하여 페이로드 감소
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    const response = NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

    // 캐시 헤더 추가 (성능 최적화)
    // 브라우저 캐시 60초, CDN 300초
    response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=300');
    response.headers.set('ETag', `"${Date.now()}"`);
    response.headers.set('X-Response-Time', `${Date.now()}`);
    
    return response;
  } catch (error) {
    console.error('관리자: 예약 목록 조회 실패', error);
    return NextResponse.json(
      { error: '예약 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 신규 예약 생성
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      shoppingMall,
      roomId,
      selectedPackages,
      checkInDate,
      checkOutDate,
      totalPrice,
      totalAmount, // 프론트엔드에서 totalAmount로도 보낼 수 있음
      specialRequests,
      status,
      orderNumber,
      externalId,
      sellingPrice,
      depositAmount,
      supplyPrice,
    } = data;

    // 상태값 정규화: 프론트에서 들어올 수 있는 한글/커스텀 상태를 Prisma enum으로 매핑
    const normalizeStatus = (raw: unknown): 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' => {
      if (!raw || typeof raw !== 'string') return 'PENDING';
      const s = raw.toString().trim().toUpperCase();
      // 허용 별칭 매핑
      const aliasMap: Record<string, 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'> = {
        PENDING: 'PENDING',
        RECEIVED: 'PENDING',
        '접수': 'PENDING',
        CONFIRMED: 'CONFIRMED',
        '확정': 'CONFIRMED',
        CANCELLED: 'CANCELLED',
        CANCELED: 'CANCELLED',
        '취소': 'CANCELLED',
        COMPLETED: 'COMPLETED',
        '완료': 'COMPLETED',
      };
      return aliasMap[s] ?? 'PENDING';
    };

    // 고객명 필수 입력 검증
    if (!customerName || customerName.trim() === '') {
      return NextResponse.json({ error: '고객 이름은 필수 입력값입니다.' }, { status: 400 });
    }

    // 날짜 유효성 검사 (선택 입력 허용)
    let checkIn: Date | undefined = undefined;
    let checkOut: Date | undefined = undefined;
    if (checkInDate) {
      const d = new Date(checkInDate);
      if (isNaN(d.getTime())) {
        return NextResponse.json({ error: '체크인 날짜가 유효하지 않습니다.' }, { status: 400 });
      }
      checkIn = d;
    }
    if (checkOutDate) {
      const d = new Date(checkOutDate);
      if (isNaN(d.getTime())) {
        return NextResponse.json({ error: '체크아웃 날짜가 유효하지 않습니다.' }, { status: 400 });
      }
      checkOut = d;
    }
    if (checkIn && checkOut && checkIn >= checkOut) {
      return NextResponse.json({ error: '체크아웃 날짜는 체크인 날짜보다 늦어야 합니다.' }, { status: 400 });
    }

    // 성능 최적화: 단일 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // 1. 사용자 생성 또는 연결
      let user;
      if (customerEmail && customerEmail.trim() !== '') {
        user = await tx.user.upsert({
          where: { email: customerEmail },
          update: {},
          create: {
            email: customerEmail,
            password: 'temp123', // 임시 비밀번호
            name: customerName,
            role: 'USER'
          }
        });
      } else {
        // 이메일이 없는 경우 임시 사용자 생성
        user = await tx.user.create({
          data: {
            email: `temp_${Date.now()}@rsvshop.com`,
            password: 'temp123',
            name: customerName,
            role: 'USER'
          }
        });
      }

      // 2. 예약 생성 전에 객실 ID 검증 (수기 입력 허용)
      let safeRoomId: string | null = null;
      console.log('🔍 받은 roomId:', roomId, '타입:', typeof roomId);
      
      if (roomId && roomId.toString().trim() !== '') {
        try {
          // roomId가 실제 객실 ID인지 확인
          let room = await tx.room.findUnique({ 
            where: { id: roomId.toString() } 
          });
          // 만약 사용자가 객실명을 입력했다면 이름으로도 탐색
          if (!room) {
            room = await tx.room.findFirst({ where: { name: roomId.toString() } });
          }
          
          if (room) {
            safeRoomId = room.id;
            console.log('✅ 객실 검증 성공:', safeRoomId);
          } else {
            console.log('⚠️ 객실을 찾을 수 없음, roomId 제외하고 생성');
            safeRoomId = null;
          }
        } catch (roomError) {
          console.log('❌ 객실 검증 실패:', roomError);
          safeRoomId = null;
        }
      } else {
        console.log('ℹ️ roomId가 비어있음, 객실 없이 예약 생성');
      }

      // 가격 계산
      const priceCalculation = calculatePrices({
        sellingPrice: sellingPrice || totalAmount || totalPrice || 0,
        supplyPrice: supplyPrice || 0,
        commissionRate: 4, // 기본 수수료율 4%
        vatRate: 10        // 기본 부가세율 10%
      });

      // 예약 생성 데이터 준비
      const bookingData: any = {
        userId: user.id,
        guestName: customerName,
        guestEmail: customerEmail || null,
        guestPhone: customerPhone || '',
        checkInDate: checkIn || new Date(),
        checkOutDate: checkOut || new Date(Date.now() + 24*60*60*1000),
        totalAmount: totalAmount || totalPrice || 0, // totalAmount 우선, 없으면 totalPrice
        status: normalizeStatus(status),
        notes: specialRequests || null,
        
        // 쇼핑몰 관련 필드
        shoppingMall: shoppingMall || null,
        orderNumber: orderNumber || null,
        externalId: externalId || null,
        
        // 가격 관련 필드
        sellingPrice: priceCalculation.sellingPrice,
        depositAmount: depositAmount || null,
        supplyPrice: priceCalculation.supplyPrice,
        
        // 수익 및 부가세 필드
        profit: priceCalculation.profit,
        vatAmount: priceCalculation.vatAmount,
        vatRate: priceCalculation.vatRate,
        commission: priceCalculation.commission,
        commissionRate: priceCalculation.commissionRate,
      };

      // roomId가 있을 때만 추가 (null이면 아예 필드를 제외)
      if (safeRoomId) {
        bookingData.roomId = safeRoomId;
        console.log('🏨 객실과 함께 예약 생성:', safeRoomId);
      } else {
        console.log('🏨 객실 없이 예약 생성 (roomId 필드 제외)');
      }

      console.log('예약 생성 데이터:', bookingData);

      // 예약 생성
      const booking = await tx.booking.create({
        data: bookingData
      });

      // 2. 패키지 아이템 생성 (있는 경우에만)
      if (selectedPackages && selectedPackages.length > 0) {
        await tx.bookingItem.createMany({
          data: selectedPackages.map((pkgId: string) => ({
            bookingId: booking.id,
            packageId: pkgId,
            quantity: 1,
            price: 0,
          })),
        });
      }

      // 3. 생성된 예약 정보 반환
      const createdBooking = await tx.booking.findUnique({
        where: { id: booking.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          bookingItems: {
            include: {
              package: true
            }
          }
        }
      });
      return createdBooking;
    });

    const response = NextResponse.json(result, { status: 201 });
    
    // CORS 헤더 추가
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  } catch (error) {
    console.error('관리자: 신규 예약 생성 오류', error);
    console.error('오류 상세 정보:', {
      code: error.code,
      message: error.message,
      meta: error.meta,
      stack: error.stack
    });
    
    // 구체적인 에러 메시지 제공
    if (error.code === 'P2002') {
      return NextResponse.json({ error: '중복된 예약입니다.' }, { status: 400 });
    }
    if (error.code === 'P2003') {
      return NextResponse.json({ error: '존재하지 않는 객실입니다.' }, { status: 400 });
    }
    if (error.code === 'P2011') {
      return NextResponse.json({ error: '필수 필드가 누락되었습니다.' }, { status: 400 });
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: '요청한 레코드를 찾을 수 없습니다.' }, { status: 404 });
    }
    
    // 데이터베이스 연결 오류
    if (error.message && error.message.includes('connect')) {
      return NextResponse.json({ error: '데이터베이스 연결 오류가 발생했습니다.' }, { status: 503 });
    }
    
    return NextResponse.json({ 
      error: '서버 오류가 발생했습니다.',
      details: error.message || '알 수 없는 오류',
      code: error.code || 'UNKNOWN'
    }, { status: 500 });
  }
} 