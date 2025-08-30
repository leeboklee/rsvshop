import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: 알림 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const isRead = searchParams.get('isRead');

    const skip = (page - 1) * limit;

    // 필터 조건 구성
    const where: any = {};
    if (type) where.type = type;
    if (isRead !== null) where.isRead = isRead === 'true';

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.notification.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('알림 목록 조회 실패:', error);
    return NextResponse.json(
      { success: false, error: '알림 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 새 알림 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      title,
      message,
      userId,
      relatedId,
      relatedType,
      priority = 'NORMAL'
    } = body;

    if (!type || !title || !message) {
      return NextResponse.json(
        { success: false, error: '알림 유형, 제목, 메시지는 필수입니다.' },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        message,
        userId,
        relatedId,
        relatedType,
        priority,
        isRead: false
      }
    });

    return NextResponse.json({
      success: true,
      message: '알림이 생성되었습니다.',
      data: notification
    }, { status: 201 });

  } catch (error) {
    console.error('알림 생성 실패:', error);
    return NextResponse.json(
      { success: false, error: '알림 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}
