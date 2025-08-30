import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'name';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // 필터 조건 구성
    const where: any = {
      isActive: true,
    };

    // 카테고리 필터: 스키마상 Product에는 category 문자열이 없고 Category 관계만 존재
    if (category && category !== 'all') {
      // 카테고리 이름으로 필터링 (필요 시 ID도 지원 가능)
      where.Category = { name: category };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 정렬 조건 구성
    const orderBy: any = {};
    switch (sortBy) {
      case 'price':
        orderBy.price = 'asc';
        break;
      case 'priceDesc':
        orderBy.price = 'desc';
        break;
      case 'createdAt':
        orderBy.createdAt = 'desc';
        break;
      case 'name':
      default:
        orderBy.name = 'asc';
        break;
    }

    // 상품 조회 (Category 관계 포함)
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          imageUrl: true,
          stock: true,
          createdAt: true,
          updatedAt: true,
          categoryId: true,
          Category: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // 카테고리 목록 조회 (관계 기반 집계)
    const categoriesRaw = await prisma.category.findMany({
      where: {},
      select: {
        id: true,
        name: true,
        _count: { select: { Product: true } },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        imageUrl: p.imageUrl,
        stock: p.stock,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        categoryId: p.categoryId,
        category: p.Category ? { id: p.Category.id, name: p.Category.name } : null,
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      categories: categoriesRaw.map((cat) => ({
        id: cat.id,
        name: cat.name,
        count: cat._count.Product,
      })),
      message: '상품 목록을 성공적으로 가져왔습니다.',
    });

  } catch (error) {
    console.error('상품 목록 조회 실패:', error);
    return NextResponse.json(
      {
        success: false,
        error: '상품 목록을 가져오는데 실패했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
