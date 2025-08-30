import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withApiKeyAuth } from '@/app/lib/apiKeyAuth';

const prisma = new PrismaClient();

// GET: 패키지 목록 조회 (외부 API)
export const GET = withApiKeyAuth(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const roomId = searchParams.get('roomId');

      const where: any = {};
      if (roomId) {
        where.roomId = roomId;
      }

      const packages = await prisma.package.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          roomId: true,
          room: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      });

      const response = NextResponse.json({
        success: true,
        data: packages,
      });
      response.headers.set('Cache-Control', 'public, max-age=300'); // 5분 캐시
      return response;
    } catch (error) {
      console.error('외부 API: 패키지 목록 조회 실패:', error);
      return NextResponse.json(
        { 
          success: false,
          error: '패키지 목록을 불러오는데 실패했습니다.' 
        },
        { status: 500 }
      );
    }
  },
  ['packages.read']
); 