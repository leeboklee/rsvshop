import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { ProviderKeyRecord } from '@/app/lib/integrations/types'
import { PrismaClient } from '@prisma/client'
import naverAdapter from '@/app/lib/integrations/adapters/naver'
import gmarketAdapter from '@/app/lib/integrations/adapters/gmarket'

const KEYS = path.join(process.cwd(), 'backup', 'marketplace-keys.json')
const ORDERS = path.join(process.cwd(), 'backup', 'orders.json')

function loadKeys(): ProviderKeyRecord {
  try { return JSON.parse(fs.readFileSync(KEYS,'utf8')) } catch { return {} as any }
}

function loadOrders(): any[] {
  try { return JSON.parse(fs.readFileSync(ORDERS,'utf8')) } catch { return [] }
}

function saveOrders(list: any[]) {
  fs.mkdirSync(path.dirname(ORDERS), { recursive: true })
  fs.writeFileSync(ORDERS, JSON.stringify(list, null, 2))
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url)
  const since = url.searchParams.get('since') || undefined
  const keys = loadKeys()

  const adapters = [naverAdapter, gmarketAdapter]
  const results = await Promise.allSettled(adapters.map(a => a.hasKeys(keys) ? a.listOrders(keys, { since }) : Promise.resolve([])))
  const incoming = results.flatMap(r => r.status === 'fulfilled' ? r.value : [])

  const prev = loadOrders()
  const map = new Map<string, any>()
  for (const o of prev) map.set(`${o.channel}:${o.id}`, o)
  for (const o of incoming) map.set(`${o.channel}:${o.id}`, o)
  const merged = Array.from(map.values()).sort((a,b)=> (a.createdAt>b.createdAt? -1:1))
  saveOrders(merged)

  // DB 영속화 (best-effort)
  try {
    const prisma = new PrismaClient()
    for (const o of incoming) {
      const channel = o.channel === 'naver' ? 'NAVER' : 'GMARKET'
      await prisma.externalOrder.upsert({
        where: { channel_externalId: { channel, externalId: o.id } },
        update: { number: o.number, buyer: o.buyer, total: o.total ?? undefined, orderedAt: new Date(o.createdAt) },
        create: { channel, externalId: o.id, number: o.number, buyer: o.buyer, total: o.total ?? undefined, orderedAt: new Date(o.createdAt) },
      })
    }
  } catch {}

  return NextResponse.json({ added: incoming.length, total: merged.length })
}

export async function GET() {
  return NextResponse.json(loadOrders())
}


