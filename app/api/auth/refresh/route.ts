import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // 쿠키에서 토큰 추출
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: '인증 토큰이 없습니다.' },
        { status: 401 }
      );
    }

    // 토큰 검증 (만료된 토큰도 허용)
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        // 만료된 토큰에서 payload 추출
        const payload = jwt.decode(token) as any;
        if (payload && payload.userId) {
          decoded = payload;
        } else {
          return NextResponse.json(
            { success: false, error: '유효하지 않은 토큰입니다.' },
            { status: 401 }
          );
        }
      } else {
        return NextResponse.json(
          { success: false, error: '유효하지 않은 토큰입니다.' },
          { status: 401 }
        );
      }
    }

    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      );
    }

    // 사용자 존재 여부 확인
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없거나 비활성화된 계정입니다.' },
        { status: 404 }
      );
    }

    // 새로운 토큰 생성
    const newToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    const response = NextResponse.json({
      success: true,
      message: '토큰이 갱신되었습니다.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token: newToken
      }
    });

    // 새로운 토큰을 쿠키에 설정
    response.cookies.set('auth-token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24시간
    });

    return response;

  } catch (error) {
    console.error('토큰 갱신 중 오류:', error);
    return NextResponse.json(
      { success: false, error: '토큰 갱신 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
