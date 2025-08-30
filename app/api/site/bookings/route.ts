import { NextRequest, NextResponse } from 'next/server'
import { BookingStatus, PrismaClient, SurchargeType } from '@prisma/client'

const prisma = new PrismaClient()

function eachDatesISO(start: Date, end: Date): string[] {
  const res: string[] = []
  const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()))
  const e = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()))
  while (d <= e) {
    res.push(d.toISOString().slice(0, 10))
    d.setUTCDate(d.getUTCDate() + 1)
  }
  return res
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = (searchParams.get('status') as BookingStatus | null) || null
    const channel = searchParams.get('channel') || undefined
    const bookings = await prisma.booking.findMany({
      where: { ...(status ? { status } : {}), ...(channel ? { notes: { contains: `channel=${channel}` } } : {}) },
      orderBy: { createdAt: 'desc' },
      include: { bookingItems: true },
    })
    return NextResponse.json(bookings)
  } catch (e) {
    console.error('site.bookings.get', e)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status } = body as { id: string; status: BookingStatus }
    if (!id || !status) return NextResponse.json({ error: 'id, status required' }, { status: 400 })
    const updated = await prisma.booking.update({ where: { id }, data: { status } })
    return NextResponse.json(updated)
  } catch (e) {
    console.error('site.bookings.patch', e)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { packageId, roomId, channel, startDate, endDate, guestName, guestPhone, guestEmail } = body as any
    if (!packageId || !startDate || !endDate || !guestName || !guestPhone) {
      return NextResponse.json({ error: '필수값 누락' }, { status: 400 })
    }

    const pkg = await prisma.package.findUnique({ where: { id: packageId } })
    if (!pkg) return NextResponse.json({ error: '패키지 없음' }, { status: 404 })

    const start = new Date(startDate)
    const end = new Date(endDate)
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return NextResponse.json({ error: '날짜 범위 오류' }, { status: 400 })
    }

    const dates = eachDatesISO(start, end)

    // inventories and rules
    const invList = await prisma.packageInventory.findMany({
      where: { date: { gte: start, lte: end }, roomId: roomId ?? null, packageId: packageId ?? null },
    })
    const rules = await prisma.surchargeRule.findMany({
      where: {
        enabled: true,
        startDate: { lte: end },
        endDate: { gte: start },
        OR: [
          { scope: 'HOTEL' },
          { scope: 'ROOM', roomId: roomId ?? undefined },
          { scope: 'PACKAGE', packageId },
        ],
        ...(channel ? { OR: [{ channel: null }, { channel }] } : {}),
      },
      orderBy: [{ priority: 'desc' }],
    })

    const items = [] as { date: Date; price: number }[]
    let totalAmount = 0
    for (const iso of dates) {
      const d = new Date(iso)
      const basePrice = Number(pkg.price ?? 0)
      const dow = d.getUTCDay()
      const inv = invList.find((i) => new Date(i.date).toISOString().slice(0, 10) === iso)
      if (inv?.closed) return NextResponse.json({ error: `${iso} 마감됨` }, { status: 409 })
      let surcharge = 0
      for (const r of rules) {
        const inRange = d >= new Date(r.startDate) && d <= new Date(r.endDate)
        if (!inRange) continue
        if (((r.dowMask ?? 127) & (1 << dow)) === 0) continue
        if (r.ruleType === SurchargeType.FIXED) surcharge += r.amount
        else if (r.ruleType === SurchargeType.PERCENT) surcharge += Math.round((basePrice * r.amount) / 100)
      }
      const price = basePrice + surcharge
      items.push({ date: d, price })
      totalAmount += price
    }

    const created = await prisma.booking.create({
      data: {
        userId: (await prisma.user.findFirst({ select: { id: true } }))?.id || (await prisma.user.create({ data: { email: `guest-${Date.now()}@example.com`, password: 'x', name: 'Guest' } })).id,
        totalAmount,
        status: 'PENDING',
        checkInDate: new Date(startDate),
        checkOutDate: new Date(endDate),
        guestName,
        guestPhone,
        guestEmail: guestEmail || null,
        notes: `channel=${channel || 'SITE'}; package=${packageId}`,
        bookingItems: {
          create: items.map((i) => ({ packageId, date: i.date, price: i.price, quantity: 1 })),
        },
      },
      include: { bookingItems: true },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    console.error('site.bookings.post', e)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}


