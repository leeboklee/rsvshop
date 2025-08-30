import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const hotels = await prisma.hotel.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, data: hotels });
  } catch (e) {
    console.error('GET /api/hotels', e);
    return NextResponse.json({ success: false, error: 'failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, address, phone, email, description, rating, imageUrl, status } = body || {};

    if (!name || !phone) {
      return NextResponse.json({ success: false, error: 'name, phone required' }, { status: 400 });
    }

    const created = await prisma.hotel.create({
      data: {
        name,
        address: address || null,
        phone,
        email: email || null,
        description: description || null,
        rating: typeof rating === 'number' ? rating : 5,
        imageUrl: imageUrl || null,
        status: status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
      },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (e) {
    console.error('POST /api/hotels', e);
    return NextResponse.json({ success: false, error: 'failed' }, { status: 500 });
  }
}
