import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') as any;
    const roomId = searchParams.get('roomId') || undefined;
    const packageId = searchParams.get('packageId') || undefined;

    const where: any = {};
    if (scope) where.scope = scope;
    if (roomId) where.roomId = roomId;
    if (packageId) where.packageId = packageId;

    const list = await prisma.surchargeRule.findMany({ where, orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }] });
    return NextResponse.json({ success: true, data: list });
  } catch (e) {
    console.error('GET /api/surcharge-rules', e);
    return NextResponse.json({ success: false, error: 'failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const created = await prisma.surchargeRule.create({ data: body });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (e) {
    console.error('POST /api/surcharge-rules', e);
    return NextResponse.json({ success: false, error: 'failed' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const b = await request.json()
    if (!b.id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const rule = await prisma.surchargeRule.update({ where: { id: b.id }, data: b })
    return NextResponse.json(rule)
  } catch (e) {
    console.error('surcharge-rules.put', e)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await prisma.surchargeRule.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('surcharge-rules.delete', e)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}


