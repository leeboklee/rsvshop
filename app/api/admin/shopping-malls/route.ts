import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import serverLogger from '@/app/lib/serverLogger';

// Ensure Node.js runtime (Prisma is not supported on the edge runtime)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// use shared prisma client

export async function GET() {
  try {
    serverLogger.logApiStart('GET', '/api/admin/shopping-malls');
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
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    serverLogger.log('info', 'shopping-malls:list:ok', { count: shoppingMalls.length });
    
    const res = NextResponse.json({ success: true, shoppingMalls });
    serverLogger.logApiEnd('GET', '/api/admin/shopping-malls', 200);
    return res;
  } catch (error) {
    serverLogger.logApiError('GET', '/api/admin/shopping-malls', error);
    return NextResponse.json({ success: false, error: '쇼핑몰 목록 조회에 실패했습니다.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    serverLogger.logApiStart('POST', '/api/admin/shopping-malls');
    
    const data = await request.json();
    serverLogger.log('debug', 'shopping-malls:create:req', data);
    
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
    
    serverLogger.log('info', 'shopping-malls:create:attempt', { name: name.trim(), commissionRate });
    
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
    
    serverLogger.log('info', 'shopping-malls:create:ok', { id: shoppingMall.id });
    
    const res = NextResponse.json({ success: true, shoppingMall });
    serverLogger.logApiEnd('POST', '/api/admin/shopping-malls', 200);
    return res;
  } catch (error) {
    serverLogger.logApiError('POST', '/api/admin/shopping-malls', error);
    
    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        { error: '이미 존재하는 쇼핑몰명입니다.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ error: '쇼핑몰 등록에 실패했습니다.' }, { status: 500 });
  }
} 