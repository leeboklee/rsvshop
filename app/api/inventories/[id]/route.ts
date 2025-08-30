import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { allotment, closed } = body || {};
    const updated = await prisma.packageInventory.update({
      where: { id: params.id },
      data: {
        ...(allotment !== undefined ? { allotment: Number(allotment) } : {}),
        ...(closed !== undefined ? { closed: !!closed } : {}),
      },
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (e) {
    console.error('PUT /api/inventories/[id]', e);
    return NextResponse.json({ success: false, error: 'failed' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.packageInventory.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('DELETE /api/inventories/[id]', e);
    return NextResponse.json({ success: false, error: 'failed' }, { status: 500 });
  }
}
