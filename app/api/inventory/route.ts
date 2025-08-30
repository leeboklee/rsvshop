import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/inventory?year=2025&month=8&hotelId=&roomId=&packageId=&from=&to=
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || '')
    const month = parseInt(searchParams.get('month') || '')
    const hotelId = searchParams.get('hotelId') || undefined
    const roomId = searchParams.get('roomId') || undefined
    const packageId = searchParams.get('packageId') || undefined
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    let start: Date
    let end: Date
    if (from && to) {
      start = new Date(from)
      end = new Date(to)
    } else if (year && month) {
      start = new Date(Date.UTC(year, month - 1, 1))
      end = new Date(Date.UTC(year, month, 0, 23, 59, 59))
    } else {
      return NextResponse.json({ error: 'from/to 또는 year/month 중 하나는 필수입니다.' }, { status: 400 })
    }

    const list = await prisma.packageInventory.findMany({
      where: { date: { gte: start, lte: end }, hotelId, roomId, packageId },
      orderBy: { date: 'asc' },
    })
    return NextResponse.json(list)
  } catch (e) {
    console.error('inventory.get error', e)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}

// PUT /api/inventory  body: { items: {date, hotelId?, roomId?, packageId?, allotment, closed, note}[] }
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const items: any[] = body?.items || []
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'items empty' }, { status: 400 })
    }
    // Prisma upsert with composite unique including nullable fields can be unsafe in Postgres.
    // Strategy: delete existing rows for the same dates where roomId/packageId are null, then insert fresh.
    const dates = Array.from(new Set(items.map((it) => new Date(it.date).toISOString().slice(0, 10))))
    await prisma.packageInventory.deleteMany({
      where: {
        date: { in: dates.map((d) => new Date(d)) },
        hotelId: null,
        roomId: null,
        packageId: null,
      },
    })

    await prisma.packageInventory.createMany({
      data: items.map((it) => ({
        date: new Date(it.date),
        hotelId: it.hotelId ?? null,
        roomId: it.roomId ?? null,
        packageId: it.packageId ?? null,
        allotment: it.allotment ?? 0,
        closed: !!it.closed,
        note: it.note || null,
      })),
      skipDuplicates: true,
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('inventory.put error', e)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}


