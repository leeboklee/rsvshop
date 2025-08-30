import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, SurchargeType } from '@prisma/client'

const prisma = new PrismaClient()

type QuoteDay = {
  date: string
  basePrice: number
  surcharge: number
  total: number
  closed: boolean
  allotment: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const packageId = searchParams.get('packageId') || undefined
    const roomId = searchParams.get('roomId') || undefined
    const channel = searchParams.get('channel') || undefined
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!packageId || !startDate || !endDate) {
      return NextResponse.json({ error: 'packageId, startDate, endDate 필수' }, { status: 400 })
    }

    const pkg = await prisma.package.findUnique({ where: { id: packageId } })
    if (!pkg) return NextResponse.json({ error: '패키지 없음' }, { status: 404 })

    const start = new Date(startDate)
    const end = new Date(endDate)
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return NextResponse.json({ error: '날짜 범위 오류' }, { status: 400 })
    }

    // Load inventories in range
    const inventories = await prisma.packageInventory.findMany({
      where: {
        date: { gte: start, lte: end },
        roomId: roomId ?? null,
        packageId: packageId ?? null,
      },
    })

    // Load surcharge rules in range (enabled)
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

    const days: QuoteDay[] = []
    const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()))
    const endUtc = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()))
    while (d <= endUtc) {
      const iso = d.toISOString().slice(0, 10)
      const dow = d.getUTCDay() // 0..6
      const inv = inventories.find((i) => new Date(i.date).toISOString().slice(0, 10) === iso)

      const basePrice = Number(pkg.price ?? 0)
      let surcharge = 0
      for (const r of rules) {
        // date match
        const inRange = d >= new Date(r.startDate) && d <= new Date(r.endDate)
        if (!inRange) continue
        // dowMask match
        if (((r.dowMask ?? 127) & (1 << dow)) === 0) continue
        // scope match already filtered
        if (r.ruleType === SurchargeType.FIXED) surcharge += r.amount
        else if (r.ruleType === SurchargeType.PERCENT) surcharge += Math.round((basePrice * r.amount) / 100)
      }

      const closed = !!inv?.closed
      const allotment = inv?.allotment ?? 0
      const total = basePrice + surcharge
      days.push({ date: iso, basePrice, surcharge, total, closed, allotment })

      d.setUTCDate(d.getUTCDate() + 1)
    }

    return NextResponse.json({ packageId, roomId: roomId ?? null, channel: channel ?? null, days })
  } catch (e) {
    console.error('quote.get error', e)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}


