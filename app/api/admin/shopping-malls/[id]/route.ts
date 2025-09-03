import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[쇼핑몰 API] PATCH 요청 시작:', params.id);
    
    const data = await request.json();
    console.log('[쇼핑몰 API] 수정 요청 데이터:', data);
    
    const { name, commissionRate, description } = data;
    
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
    
    // 쇼핑몰 존재 확인
    const existingMall = await prisma.shoppingMall.findUnique({
      where: { id: params.id }
    });
    
    if (!existingMall) {
      return NextResponse.json(
        { error: '존재하지 않는 쇼핑몰입니다.' },
        { status: 404 }
      );
    }
    
    // 중복 쇼핑몰명 확인 (자신 제외)
    const duplicateMall = await prisma.shoppingMall.findFirst({
      where: { 
        name: name.trim(),
        id: { not: params.id }
      }
    });
    
    if (duplicateMall) {
      return NextResponse.json(
        { error: '이미 존재하는 쇼핑몰명입니다.' },
        { status: 400 }
      );
    }
    
    console.log('[쇼핑몰 API] 쇼핑몰 수정 시도:', {
      id: params.id,
      name: name.trim(),
      commissionRate,
      description: description?.trim() || null
    });
    
    const shoppingMall = await prisma.shoppingMall.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        commissionRate,
        description: description?.trim() || null
      }
    });
    
    console.log('[쇼핑몰 API] 수정 성공:', shoppingMall);
    
    return NextResponse.json({ success: true, shoppingMall });
  } catch (error) {
    console.error('[쇼핑몰 API] PATCH 오류:', error);
    
    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        { error: '이미 존재하는 쇼핑몰명입니다.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: '쇼핑몰 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[쇼핑몰 API] DELETE 요청 시작:', params.id);
    
    // 쇼핑몰 존재 확인
    const existingMall = await prisma.shoppingMall.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            customers: true
          }
        }
      }
    });
    
    if (!existingMall) {
      return NextResponse.json(
        { error: '존재하지 않는 쇼핑몰입니다.' },
        { status: 404 }
      );
    }
    
    // 관련 고객이 있는지 확인
    if (existingMall._count.customers > 0) {
      return NextResponse.json(
        { error: '관련된 고객이 있어 삭제할 수 없습니다.' },
        { status: 400 }
      );
    }
    
    console.log('[쇼핑몰 API] 쇼핑몰 삭제 시도:', params.id);
    
    const shoppingMall = await prisma.shoppingMall.delete({
      where: { id: params.id }
    });
    
    console.log('[쇼핑몰 API] 삭제 성공:', shoppingMall);
    
    return NextResponse.json({ success: true, message: '쇼핑몰이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('[쇼핑몰 API] DELETE 오류:', error);
    
    return NextResponse.json(
      { error: '쇼핑몰 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
} 