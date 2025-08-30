import { NextRequest, NextResponse } from 'next/server';

// 샘플 패키지 데이터
const mockPackages = [
  {
    id: '1',
    name: '서울 시티투어 패키지',
    description: '서울의 주요 관광지를 둘러보는 패키지',
    price: 80000,
    duration: '1박 2일',
    includes: ['호텔 숙박', '전용 가이드', '교통편', '식사 2회'],
    available: true,
    hotelId: '1'
  },
  {
    id: '2',
    name: '부산 해양투어 패키지',
    description: '부산의 아름다운 바다를 즐기는 패키지',
    price: 120000,
    duration: '2박 3일',
    includes: ['호텔 숙박', '해양 투어', '전용 가이드', '식사 3회'],
    available: true,
    hotelId: '2'
  },
  {
    id: '3',
    name: '제주 자연투어 패키지',
    description: '제주의 아름다운 자연을 체험하는 패키지',
    price: 150000,
    duration: '3박 4일',
    includes: ['호텔 숙박', '자연 투어', '전용 가이드', '식사 4회', '렌터카'],
    available: true,
    hotelId: '3'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hotelId = searchParams.get('hotelId');
    const roomId = searchParams.get('roomId');
    const available = searchParams.get('available');

    let filteredPackages = mockPackages;

    // 호텔별 필터링
    if (hotelId) {
      filteredPackages = filteredPackages.filter(pkg => pkg.hotelId === hotelId);
    }

    // 객실별 필터링 (roomId가 있으면 해당 객실의 패키지만 반환)
    if (roomId) {
      // 실제로는 roomId로 필터링하는 로직이 필요하지만, 
      // 현재는 mock 데이터이므로 모든 패키지를 반환
      console.log(`roomId ${roomId}로 패키지 조회 요청됨`);
    }

    // 가용성 필터링
    if (available !== null) {
      const isAvailable = available === 'true';
      filteredPackages = filteredPackages.filter(pkg => pkg.available === isAvailable);
    }

    return NextResponse.json({
      success: true,
      packages: filteredPackages,
      total: filteredPackages.length
    });
  } catch (error) {
    console.error('패키지 목록 조회 실패:', error);
    return NextResponse.json(
      { success: false, error: '패키지 목록을 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 새 패키지 생성 로직 (실제로는 데이터베이스에 저장)
    const newPackage = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      package: newPackage,
      message: '패키지가 성공적으로 생성되었습니다.'
    }, { status: 201 });
  } catch (error) {
    console.error('패키지 생성 실패:', error);
    return NextResponse.json(
      { success: false, error: '패키지 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
} 