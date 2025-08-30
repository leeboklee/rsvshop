import { NextRequest, NextResponse } from 'next/server';

// 샘플 객실 데이터 - 동적으로 관리
let mockRooms = [
  {
    id: '1',
    name: '디럭스 룸',
    description: '편안하고 아늑한 디럭스 객실',
    price: 150000,
    capacity: 2,
    amenities: ['킹베드', '전용욕실', '무료WiFi', 'TV'],
    available: true,
    hotelId: '1'
  },
  {
    id: '2',
    name: '스위트 룸',
    description: '고급스러운 스위트 객실',
    price: 250000,
    capacity: 4,
    amenities: ['킹베드 + 소파베드', '전용욕실', '무료WiFi', 'TV', '미니바'],
    available: true,
    hotelId: '1'
  },
  {
    id: '3',
    name: '스탠다드 룸',
    description: '깔끔하고 실용적인 스탠다드 객실',
    price: 100000,
    capacity: 2,
    amenities: ['더블베드', '전용욕실', '무료WiFi', 'TV'],
    available: true,
    hotelId: '2'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hotelId = searchParams.get('hotelId');
    const available = searchParams.get('available');

    let filteredRooms = mockRooms;

    // 호텔별 필터링
    if (hotelId) {
      filteredRooms = filteredRooms.filter(room => room.hotelId === hotelId);
    }

    // 가용성 필터링
    if (available !== null) {
      const isAvailable = available === 'true';
      filteredRooms = filteredRooms.filter(room => room.available === isAvailable);
    }

    return NextResponse.json({
      success: true,
      rooms: filteredRooms,
      total: filteredRooms.length
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
    
    // 새 객실 생성 로직
    const newRoom = {
      id: Date.now().toString(),
      name: body.name,
      description: body.description,
      capacity: body.capacity || 2,
      imageUrl: body.imageUrl || '',
      price: body.price || 100000,
      amenities: body.amenities || ['기본 편의시설'],
      available: true,
      hotelId: body.hotelId || '1',
      createdAt: new Date().toISOString()
    };

    // mockRooms 배열에 새 객실 추가
    mockRooms.push(newRoom);

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