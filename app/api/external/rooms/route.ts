import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withApiKeyAuth } from '@/app/lib/apiKeyAuth';

const prisma = new PrismaClient();

// GET: 객실 목록 조회 (외부 API)
export const GET = withApiKeyAuth(
  async (request: NextRequest) => {
    try {
      const rooms = await prisma.room.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          capacity: true,
          imageUrl: true,
          createdAt: true,
          updatedAt: true,
          packages: {
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      });

      const response = NextResponse.json({
        success: true,
        data: rooms,
      });
      response.headers.set('Cache-Control', 'public, max-age=300'); // 5분 캐시
      return response;
    } catch (error) {
      console.error('외부 API: 객실 목록 조회 실패:', error);
      return NextResponse.json(
        { 
          success: false,
          error: '객실 목록을 불러오는데 실패했습니다.' 
        },
        { status: 500 }
      );
    }
  },
  ['rooms.read']
); 