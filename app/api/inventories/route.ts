import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    const packageId = searchParams.get('packageId');
    const start = searchParams.get('startDate');
    const end = searchParams.get('endDate');

    const where: any = {};
    if (roomId) where.roomId = roomId;
    if (packageId) where.packageId = packageId;
    if (start && end) where.date = { gte: new Date(start), lte: new Date(end) };

    const list = await prisma.packageInventory.findMany({ where, orderBy: { date: 'asc' } });
    return NextResponse.json({ success: true, data: list });
  } catch (e) {
    console.error('GET /api/inventories', e);
    return NextResponse.json({ success: false, error: 'failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, roomId, packageId, allotment, closed } = body || {};
    if (!date) return NextResponse.json({ success: false, error: 'date required' }, { status: 400 });

    const created = await prisma.packageInventory.create({
      data: {
        date: new Date(date),
        roomId: roomId || null,
        packageId: packageId || null,
        allotment: typeof allotment === 'number' ? allotment : 0,
        closed: !!closed,
      },
    });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (e) {
    console.error('POST /api/inventories', e);
    return NextResponse.json({ success: false, error: 'failed' }, { status: 500 });
  }
}
