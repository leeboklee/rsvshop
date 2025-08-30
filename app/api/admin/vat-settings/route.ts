import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: 부가세 설정 조회
export async function GET() {
  try {
    const vatSettings = await prisma.vATSettings.findFirst({
      where: { isActive: true }
    });

    return NextResponse.json(vatSettings || {});
  } catch (error) {
    console.error('부가세 설정 조회 실패:', error);
    return NextResponse.json(
      { error: '부가세 설정 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 부가세 설정 생성/수정
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyName,
      businessNumber,
      representativeName,
      address,
      phone,
      email,
      vatRate = 10.0
    } = body;

    // 기존 설정이 있으면 비활성화
    await prisma.vATSettings.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    // 새 설정 생성
    const vatSettings = await prisma.vATSettings.create({
      data: {
        companyName,
        businessNumber,
        representativeName,
        address,
        phone,
        email,
        vatRate
      }
    });

    return NextResponse.json(vatSettings);
  } catch (error) {
    console.error('부가세 설정 저장 실패:', error);
    return NextResponse.json(
      { error: '부가세 설정 저장에 실패했습니다.' },
      { status: 500 }
    );
  }
} 