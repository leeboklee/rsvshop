import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('[쇼핑몰 API] GET 요청 시작');
    
    const shoppingMalls = await prisma.shoppingMall.findMany({
      select: {
        id: true,
        name: true,
        commissionRate: true,
        description: true,
        isActive: true,
        settlementCycle: true,
        settlementDay: true,
        lastSettlementDate: true,
        nextSettlementDate: true,
        createdAt: true,
        _count: {
          select: {
            bookings: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('[쇼핑몰 API] 조회된 쇼핑몰:', shoppingMalls);
    
    return NextResponse.json({ shoppingMalls });
  } catch (error) {
    console.error('[쇼핑몰 API] GET 오류:', error);
    return NextResponse.json(
      { error: '쇼핑몰 목록 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[쇼핑몰 API] POST 요청 시작');
    
    const data = await request.json();
    console.log('[쇼핑몰 API] 요청 데이터:', data);
    
    const { name, commissionRate, description, settlementCycle, settlementDay, lastSettlementDate, nextSettlementDate } = data;
    
    // 필수 필드 검증
    if (!name) {
      return NextResponse.json(
        { error: '쇼핑몰명은 필수 항목입니다.' },
        { status: 400 }
      );
    }
    
    if (commissionRate < 0 || commissionRate > 100) {
      return NextResponse.json(
        { error: '수수료율은 0-100 사이의 값이어야 합니다.' },
        { status: 400 }
      );
    }
    
    // 중복 쇼핑몰명 확인
    const existingMall = await prisma.shoppingMall.findFirst({
      where: { name: name.trim() }
    });
    
    if (existingMall) {
      return NextResponse.json(
        { error: '이미 존재하는 쇼핑몰명입니다.' },
        { status: 400 }
      );
    }
    
    console.log('[쇼핑몰 API] 쇼핑몰 생성 시도:', {
      name: name.trim(),
      commissionRate,
      description: description?.trim() || null
    });
    
    const shoppingMall = await prisma.shoppingMall.create({
      data: {
        name: name.trim(),
        commissionRate,
        description: description?.trim() || null,
        settlementCycle: settlementCycle || 'MONTHLY',
        settlementDay: settlementDay || null,
        lastSettlementDate: lastSettlementDate || null,
        nextSettlementDate: nextSettlementDate || null
      }
    });
    
    console.log('[쇼핑몰 API] 생성 성공:', shoppingMall);
    
    return NextResponse.json({ success: true, shoppingMall });
  } catch (error) {
    console.error('[쇼핑몰 API] POST 오류:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: '이미 존재하는 쇼핑몰명입니다.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: '쇼핑몰 등록에 실패했습니다.' },
      { status: 500 }
    );
  }
} 