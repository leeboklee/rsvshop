import { NextRequest, NextResponse } from 'next/server';
import { confirmPayment } from '@/app/lib/tossPayments';
import { prisma } from '@/app/lib/prisma';
import logger from '@/app/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // 요청 데이터 파싱
    const { paymentKey, orderId, amount } = await request.json();

    if (!paymentKey || !orderId || !amount) {
      logger.error(`결제 확인 API - 필수 정보 누락: ${JSON.stringify({ paymentKey, orderId, amount })}`);
      return NextResponse.json(
        { success: false, message: '필수 결제 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 토스페이먼츠 결제 승인 요청
    const paymentData = await confirmPayment(paymentKey, orderId, amount);
    logger.info(`결제 확인 완료: ${orderId}, ${amount}원`);

    // 주문 정보 찾기
    const booking = await prisma.booking.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!booking) {
      logger.error(`결제 확인 API - 해당 주문을 찾을 수 없음: ${orderId}`);
      return NextResponse.json(
        { success: false, message: '해당 주문 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 금액 검증
    if (booking.totalAmount !== amount) {
      logger.error(`결제 확인 API - 금액 불일치: 예상 ${booking.totalAmount}원, 실제 ${amount}원`);
      
      // 결제 취소 로직 추가할 수 있음
      
      return NextResponse.json(
        { success: false, message: '결제 금액이 일치하지 않습니다.' },
        { status: 400 }
      );
    }

    // 예약 상태 업데이트
    await prisma.booking.update({
      where: { id: orderId },
      data: {
        status: 'CONFIRMED',
        // 추가 결제 정보 저장 가능
      }
    });

    logger.info(`예약 상태 업데이트 완료: ${orderId}`);

    return NextResponse.json({
      success: true,
      message: '결제가 성공적으로 처리되었습니다.',
      data: paymentData
    });
  } catch (error) {
    logger.error(`결제 확인 처리 중 오류: ${error instanceof Error ? error.message : String(error)}`);
    
    return NextResponse.json(
      { 
        success: false, 
        message: '결제 처리 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
} 