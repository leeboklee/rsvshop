import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT: 알림 읽음 처리
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: '알림 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 알림 존재 여부 확인
    const existingNotification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!existingNotification) {
      return NextResponse.json(
        { success: false, error: '해당 알림을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이미 읽은 알림인지 확인
    if (existingNotification.isRead) {
      return NextResponse.json({
        success: true,
        message: '이미 읽은 알림입니다.',
        data: existingNotification
      });
    }

    // 알림 읽음 처리
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: '알림이 읽음 처리되었습니다.',
      data: updatedNotification
    });

  } catch (error) {
    console.error('알림 읽음 처리 실패:', error);
    return NextResponse.json(
      { success: false, error: '알림 읽음 처리에 실패했습니다.' },
      { status: 500 }
    );
  }
}
