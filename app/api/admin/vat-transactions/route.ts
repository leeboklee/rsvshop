import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: 부가세 거래 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const skip = (page - 1) * limit;

    // 필터 조건 구성
    const where: any = {};
    if (type) where.transactionType = type;
    if (startDate && endDate) {
      where.transactionDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const [transactions, total] = await Promise.all([
      prisma.vATTransaction.findMany({
        where,
        include: {
          vatSettings: true,
          booking: {
            select: {
              id: true,
              guestName: true,
              totalAmount: true,
              checkInDate: true,
              checkOutDate: true
            }
          }
        },
        orderBy: { transactionDate: 'desc' },
        skip,
        take: limit
      }),
      prisma.vATTransaction.count({ where })
    ]);

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('부가세 거래 조회 실패:', error);
    return NextResponse.json(
      { error: '부가세 거래 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 부가세 거래 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      transactionType,
      transactionDate,
      description,
      supplyAmount,
      vatAmount,
      totalAmount,
      documentNumber,
      partnerName,
      partnerNumber,
      bookingId
    } = body;

    // 활성 부가세 설정 조회
    const vatSettings = await prisma.vATSettings.findFirst({
      where: { isActive: true }
    });

    if (!vatSettings) {
      return NextResponse.json(
        { error: '부가세 설정이 없습니다. 먼저 부가세 설정을 완료해주세요.' },
        { status: 400 }
      );
    }

    const transaction = await prisma.vATTransaction.create({
      data: {
        transactionType,
        transactionDate: new Date(transactionDate),
        description,
        supplyAmount,
        vatAmount,
        totalAmount,
        documentNumber,
        partnerName,
        partnerNumber,
        bookingId,
        vatSettingsId: vatSettings.id
      },
      include: {
        vatSettings: true,
        booking: {
          select: {
            id: true,
            guestName: true,
            totalAmount: true
          }
        }
      }
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('부가세 거래 생성 실패:', error);
    return NextResponse.json(
      { error: '부가세 거래 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
} 