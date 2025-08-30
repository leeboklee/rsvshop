import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: 부가세 신고서 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const reportType = searchParams.get('reportType');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    // 필터 조건 구성
    const where: any = {};
    if (reportType) where.reportType = reportType;
    if (status) where.status = status;

    const [reports, total] = await Promise.all([
      prisma.vATReport.findMany({
        where,
        include: {
          vatSettings: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.vATReport.count({ where })
    ]);

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('부가세 신고서 조회 실패:', error);
    return NextResponse.json(
      { error: '부가세 신고서 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 부가세 신고서 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      reportType,
      reportPeriod,
      startDate,
      endDate
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

    // 기간 내 거래 데이터 조회
    const transactions = await prisma.vATTransaction.findMany({
      where: {
        vatSettingsId: vatSettings.id,
        transactionDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }
    });

    // 매출 거래 (SALES)
    const salesTransactions = transactions.filter(t => t.transactionType === 'SALES');
    const totalSupply = salesTransactions.reduce((sum, t) => sum + t.supplyAmount, 0);
    const totalVAT = salesTransactions.reduce((sum, t) => sum + t.vatAmount, 0);

    // 매입 거래 (PURCHASE)
    const purchaseTransactions = transactions.filter(t => t.transactionType === 'PURCHASE');
    const totalPurchase = purchaseTransactions.reduce((sum, t) => sum + t.supplyAmount, 0);
    const totalPurchaseVAT = purchaseTransactions.reduce((sum, t) => sum + t.vatAmount, 0);

    // 납부할 세액 계산
    const netVAT = totalVAT - totalPurchaseVAT;

    const report = await prisma.vATReport.create({
      data: {
        reportType,
        reportPeriod,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalSupply,
        totalVAT,
        totalPurchase,
        totalPurchaseVAT,
        netVAT,
        vatSettingsId: vatSettings.id
      },
      include: {
        vatSettings: true
      }
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error('부가세 신고서 생성 실패:', error);
    return NextResponse.json(
      { error: '부가세 신고서 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
} 