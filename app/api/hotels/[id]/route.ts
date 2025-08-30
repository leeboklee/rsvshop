import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const hotel = await prisma.hotel.findUnique({ where: { id: params.id } });
    if (!hotel) return NextResponse.json({ success: false, error: 'not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: hotel });
  } catch (e) {
    console.error('GET /api/hotels/[id]', e);
    return NextResponse.json({ success: false, error: 'failed' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { name, address, phone, email, description, rating, imageUrl, status } = body || {};

    const updated = await prisma.hotel.update({
      where: { id: params.id },
      data: {
        ...(name ? { name } : {}),
        ...(address ? { address } : {}),
        ...(phone ? { phone } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(rating !== undefined ? { rating } : {}),
        ...(imageUrl !== undefined ? { imageUrl } : {}),
        ...(status !== undefined ? { status } : {}),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (e) {
    console.error('PUT /api/hotels/[id]', e);
    return NextResponse.json({ success: false, error: 'failed' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.hotel.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('DELETE /api/hotels/[id]', e);
    return NextResponse.json({ success: false, error: 'failed' }, { status: 500 });
  }
}
