import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // 모든 호텔의 재고 요약 정보 가져오기
    const hotels = await prisma.hotel.findMany({
      include: {
        rooms: {
          include: {
            inventory: {
              where: {
                date: new Date(date)
              }
            }
          }
        }
      }
    });

    const inventorySummary = hotels.map(hotel => {
      let totalInventory = 0;
      let bookedInventory = 0;
      let availableInventory = 0;
      let blockedInventory = 0;

      hotel.rooms.forEach(room => {
        room.inventory.forEach(inv => {
          totalInventory += inv.totalCount;
          bookedInventory += inv.bookedCount;
          availableInventory += inv.totalCount - inv.bookedCount;
          if (inv.isBlocked) {
            blockedInventory += inv.totalCount;
          }
        });
      });

      const utilizationRate = totalInventory > 0 
        ? Math.round((bookedInventory / totalInventory) * 100) 
        : 0;

      return {
        hotelId: hotel.id,
        hotelName: hotel.name,
        totalInventory,
        bookedInventory,
        availableInventory,
        blockedInventory,
        utilizationRate,
        lastUpdated: new Date().toISOString()
      };
    });

    return NextResponse.json({
      success: true,
      data: inventorySummary,
      message: '재고 요약 정보를 성공적으로 가져왔습니다.'
    });

  } catch (error) {
    console.error('재고 요약 정보 조회 실패:', error);
    return NextResponse.json(
      {
        success: false,
        error: '재고 요약 정보를 가져오는데 실패했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
