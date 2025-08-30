import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../lib/prisma';

// 토큰 시크릿 키 (환경 변수에서 가져오거나 기본값 사용)
const JWT_SECRET = process.env.JWT_SECRET || 'reservation-system-secret-key';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderNumber, phone } = body;

    // 입력값 검증
    if (!orderNumber || !phone) {
      return NextResponse.json(
        { message: '주문번호와 전화번호를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // 주문번호와 전화번호로 예약 조회
    const reservations = await prisma.booking.findMany({
      where: {
        orderNumber: orderNumber,
        customerPhone: phone,
      },
      select: {
        id: true,
        orderNumber: true,
        date: true,
        status: true,
        customerName: true,
      }
    });

    if (!reservations.length) {
      return NextResponse.json(
        { message: '해당 정보와 일치하는 예약을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // JWT 토큰 생성 (예약 ID와 전화번호 정보 포함)
    const token = jwt.sign(
      { 
        orderNumber,
        phone,
        reservationIds: reservations.map(res => res.id),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24시간 유효
      },
      JWT_SECRET
    );

    // 성공 응답
    return NextResponse.json({
      message: '예약 정보를 찾았습니다.',
      reservations,
      token,
    });

  } catch (error) {
    console.error('예약 조회 중 오류 발생:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
} 