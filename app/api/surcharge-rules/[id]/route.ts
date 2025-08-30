import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const updated = await prisma.surchargeRule.update({ where: { id: params.id }, data: body });
    return NextResponse.json({ success: true, data: updated });
  } catch (e) {
    console.error('PUT /api/surcharge-rules/[id]', e);
    return NextResponse.json({ success: false, error: 'failed' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.surchargeRule.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('DELETE /api/surcharge-rules/[id]', e);
    return NextResponse.json({ success: false, error: 'failed' }, { status: 500 });
  }
}
