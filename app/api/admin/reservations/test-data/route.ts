import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 테스트 데이터 생성 시작...');
    
    // 기존 예약 데이터 확인
    const existingBookings = await prisma.booking.count();
    console.log('기존 예약 수:', existingBookings);
    
    if (existingBookings > 0) {
      return NextResponse.json({
        success: false,
        message: '이미 예약 데이터가 존재합니다',
        count: existingBookings
      });
    }

    // 기본 사용자 생성 (없는 경우)
    let user = await prisma.user.findFirst();
    if (!user) {
      console.log('사용자 생성 중...');
      user = await prisma.user.create({
        data: {
          id: '1',
          email: 'admin@rsvshop.com',
          name: '관리자',
          password: 'admin123',
          role: 'ADMIN'
        }
      });
      console.log('사용자 생성 완료:', user.id);
    } else {
      console.log('기존 사용자 사용:', user.id);
    }

    // 기본 객실 생성 (없는 경우)
    let rooms = await prisma.room.findMany();
    console.log('기존 객실 수:', rooms.length);
    if (rooms.length === 0) {
      console.log('객실 생성 중...');
      const roomData = [
        { id: '1', name: '디럭스 룸', description: '편안한 디럭스 룸', capacity: 2 },
        { id: '2', name: '스위트 룸', description: '고급 스위트 룸', capacity: 4 },
        { id: '3', name: '스탠다드 룸', description: '기본 스탠다드 룸', capacity: 2 }
      ];
      
      await prisma.room.createMany({
        data: roomData
      });
      
      rooms = await prisma.room.findMany();
      console.log('객실 생성 완료:', rooms.length, '개');
    }

    // 기본 패키지 생성 (없는 경우)
    let packages = await prisma.package.findMany();
    console.log('기존 패키지 수:', packages.length);
    if (packages.length === 0) {
      console.log('패키지 생성 중...');
      const packageData = [
        { id: '1', name: '디럭스 패키지', description: '디럭스 룸 + 조식', price: 150000, roomId: rooms[0]?.id || '1' },
        { id: '2', name: '스위트 패키지', description: '스위트 룸 + 조식+디너', price: 250000, roomId: rooms[1]?.id || '2' },
        { id: '3', name: '스탠다드 패키지', description: '스탠다드 룸 + 조식', price: 100000, roomId: rooms[2]?.id || '3' }
      ];
      
      await prisma.package.createMany({
        data: packageData
      });
      
      packages = await prisma.package.findMany();
      console.log('패키지 생성 완료:', packages.length, '개');
    }

    console.log('사용자 ID:', user.id);
    console.log('객실 ID들:', rooms.map(r => r.id));
    console.log('패키지 ID들:', packages.map(p => p.id));

    // 테스트 예약 데이터 생성
    const testBookings = [
      {
        userId: user.id,
        totalAmount: 150000,
        status: 'CONFIRMED' as const,
        checkInDate: new Date('2024-09-01'),
        checkOutDate: new Date('2024-09-02'),
        guestName: '김테스트',
        guestPhone: '010-1234-5678',
        guestEmail: 'test1@example.com',
        notes: '테스트 예약입니다',
        roomId: rooms[0]?.id || '1',
        depositAmount: 50000,
        externalId: 'TEST001',
        orderNumber: 'ORD001',
        sellingPrice: 150000,
        shoppingMall: '직접 예약',
        supplyPrice: 120000
      },
      {
        userId: user.id,
        totalAmount: 250000,
        status: 'PENDING' as const,
        checkInDate: new Date('2024-09-05'),
        checkOutDate: new Date('2024-09-07'),
        guestName: '이테스트',
        guestPhone: '010-2345-6789',
        guestEmail: 'test2@example.com',
        notes: '테스트 예약 2번',
        roomId: rooms[1]?.id || '2',
        depositAmount: 80000,
        externalId: 'TEST002',
        orderNumber: 'ORD002',
        sellingPrice: 250000,
        shoppingMall: '직접 예약',
        supplyPrice: 200000
      },
      {
        userId: user.id,
        totalAmount: 100000,
        status: 'CONFIRMED' as const,
        checkInDate: new Date('2024-09-10'),
        checkOutDate: new Date('2024-09-11'),
        guestName: '박테스트',
        guestPhone: '010-3456-7890',
        guestEmail: 'test3@example.com',
        notes: '테스트 예약 3번',
        roomId: rooms[2]?.id || '3',
        depositAmount: 30000,
        externalId: 'TEST003',
        orderNumber: 'ORD003',
        sellingPrice: 100000,
        shoppingMall: '직접 예약',
        supplyPrice: 80000
      }
    ];

    console.log('예약 데이터 생성 중...');
    // 예약 데이터 생성
    const createdBookings = await prisma.booking.createMany({
      data: testBookings
    });
    console.log('예약 생성 완료:', createdBookings.count, '개');

    // 예약 아이템 데이터 생성
    const bookingItems = [
      {
        bookingId: (await prisma.booking.findFirst({ where: { externalId: 'TEST001' } }))?.id || '',
        packageId: packages[0]?.id || '1',
        quantity: 1,
        price: 150000
      },
      {
        bookingId: (await prisma.booking.findFirst({ where: { externalId: 'TEST002' } }))?.id || '',
        packageId: packages[1]?.id || '2',
        quantity: 1,
        price: 250000
      },
      {
        bookingId: (await prisma.booking.findFirst({ where: { externalId: 'TEST003' } }))?.id || '',
        packageId: packages[2]?.id || '3',
        quantity: 1,
        price: 100000
      }
    ];

    console.log('예약 아이템 생성 중...');
    // 예약 아이템 생성
    await prisma.bookingItem.createMany({
      data: bookingItems.filter(item => item.bookingId)
    });
    console.log('예약 아이템 생성 완료');

    console.log('🧪 테스트 데이터 생성 완료!');
    return NextResponse.json({
      success: true,
      message: '테스트 예약 데이터가 성공적으로 생성되었습니다',
      bookingsCreated: createdBookings.count,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('테스트 데이터 생성 오류:', error);
    
    return NextResponse.json({
      success: false,
      message: '테스트 데이터 생성 실패',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
