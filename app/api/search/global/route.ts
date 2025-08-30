import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type'); // all, hotels, rooms, packages, customers, bookings
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: '검색어는 최소 2자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    const searchQuery = query.trim();
    const results: any = {
      hotels: [],
      rooms: [],
      packages: [],
      customers: [],
      bookings: []
    };

    // 호텔 검색
    if (type === 'all' || type === 'hotels') {
      const hotels = await prisma.hotel.findMany({
        where: {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { address: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          name: true,
          address: true,
          description: true,
          isActive: true,
          _count: {
            select: {
              rooms: true,
              packages: true
            }
          }
        },
        take: limit
      });
      results.hotels = hotels;
    }

    // 객실 검색
    if (type === 'all' || type === 'rooms') {
      const rooms = await prisma.room.findMany({
        where: {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          name: true,
          description: true,
          capacity: true,
          price: true,
          hotel: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              packages: true,
              bookings: true
            }
          }
        },
        take: limit
      });
      results.rooms = rooms;
    }

    // 패키지 검색
    if (type === 'all' || type === 'packages') {
      const packages = await prisma.package.findMany({
        where: {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          room: {
            select: {
              id: true,
              name: true,
              hotel: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          _count: {
            select: {
              bookingItems: true
            }
          }
        },
        take: limit
      });
      results.packages = packages;
    }

    // 고객 검색
    if (type === 'all' || type === 'customers') {
      const customers = await prisma.booking.findMany({
        where: {
          OR: [
            { guestName: { contains: searchQuery, mode: 'insensitive' } },
            { guestEmail: { contains: searchQuery, mode: 'insensitive' } },
            { guestPhone: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          guestName: true,
          guestEmail: true,
          guestPhone: true,
          totalAmount: true,
          status: true,
          createdAt: true,
          room: {
            select: {
              name: true,
              hotel: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        take: limit,
        orderBy: { createdAt: 'desc' }
      });
      results.customers = customers;
    }

    // 예약 검색
    if (type === 'all' || type === 'bookings') {
      const bookings = await prisma.booking.findMany({
        where: {
          OR: [
            { guestName: { contains: searchQuery, mode: 'insensitive' } },
            { guestEmail: { contains: searchQuery, mode: 'insensitive' } },
            { guestPhone: { contains: searchQuery, mode: 'insensitive' } },
            { id: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          guestName: true,
          guestEmail: true,
          guestPhone: true,
          checkInDate: true,
          checkOutDate: true,
          status: true,
          totalAmount: true,
          createdAt: true,
          room: {
            select: {
              name: true,
              hotel: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        take: limit,
        orderBy: { createdAt: 'desc' }
      });
      results.bookings = bookings;
    }

    // 검색 결과 요약
    const summary = {
      totalResults: Object.values(results).reduce((sum: any, arr: any) => sum + arr.length, 0),
      hotels: results.hotels.length,
      rooms: results.rooms.length,
      packages: results.packages.length,
      customers: results.customers.length,
      bookings: results.bookings.length
    };

    // 검색어 하이라이트 처리
    const highlightText = (text: string, query: string) => {
      if (!text) return text;
      const regex = new RegExp(`(${query})`, 'gi');
      return text.replace(regex, '<mark>$1</mark>');
    };

    // 결과에 하이라이트 적용
    Object.keys(results).forEach(key => {
      results[key] = results[key].map((item: any) => {
        const highlighted = { ...item };
        if (item.name) highlighted.nameHighlighted = highlightText(item.name, searchQuery);
        if (item.description) highlighted.descriptionHighlighted = highlightText(item.description, searchQuery);
        if (item.guestName) highlighted.guestNameHighlighted = highlightText(item.guestName, searchQuery);
        if (item.guestEmail) highlighted.guestEmailHighlighted = highlightText(item.guestEmail, searchQuery);
        return highlighted;
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        query: searchQuery,
        summary,
        results,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('통합 검색 실패:', error);
    return NextResponse.json(
      { success: false, error: '검색을 수행하는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
