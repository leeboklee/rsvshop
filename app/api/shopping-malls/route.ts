import { NextRequest, NextResponse } from 'next/server';

// 샘플 쇼핑몰 데이터 (실제로는 데이터베이스에서 가져옴)
const mockShoppingMalls = [
  {
    id: '1',
    name: '스마트스토어',
    platform: '네이버',
    commissionRate: 3.5,
    isActive: true,
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    name: 'G마켓',
    platform: '이베이',
    commissionRate: 5.0,
    isActive: true,
    createdAt: '2024-01-01'
  },
  {
    id: '3',
    name: '11번가',
    platform: 'SK',
    commissionRate: 4.2,
    isActive: true,
    createdAt: '2024-01-01'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly');
    
    let filteredMalls = mockShoppingMalls;
    
    if (activeOnly === 'true') {
      filteredMalls = filteredMalls.filter(mall => mall.isActive);
    }
    
    return NextResponse.json({
      success: true,
      shoppingMalls: filteredMalls,
      total: filteredMalls.length
    });
  } catch (error) {
    console.error('쇼핑몰 목록 조회 실패:', error);
    return NextResponse.json(
      { success: false, error: '쇼핑몰 목록을 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 새 쇼핑몰 생성 로직
    const newMall = {
      id: Date.now().toString(),
      name: body.name,
      platform: body.platform,
      commissionRate: body.commissionRate || 0,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    // 실제로는 데이터베이스에 저장
    mockShoppingMalls.push(newMall);
    
    return NextResponse.json({
      success: true,
      shoppingMall: newMall,
      message: '쇼핑몰이 성공적으로 생성되었습니다.'
    }, { status: 201 });
  } catch (error) {
    console.error('쇼핑몰 생성 실패:', error);
    return NextResponse.json(
      { success: false, error: '쇼핑몰 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}
