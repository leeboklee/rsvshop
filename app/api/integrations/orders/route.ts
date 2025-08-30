import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { ProviderKeyRecord } from '@/app/lib/integrations/types'
import naverAdapter from '@/app/lib/integrations/adapters/naver'
import gmarketAdapter from '@/app/lib/integrations/adapters/gmarket'

const STORE = path.join(process.cwd(), 'backup', 'marketplace-keys.json')

function loadKeys(): ProviderKeyRecord {
  try { return JSON.parse(fs.readFileSync(STORE,'utf8')) } catch { return {} as any }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const since = url.searchParams.get('since') || undefined
  const keys = loadKeys()

  const adapters = [naverAdapter, gmarketAdapter]
  const results = await Promise.allSettled(adapters.map(a => a.hasKeys(keys) ? a.listOrders(keys, { since }) : Promise.resolve([])))

  const merged = results.flatMap(r => r.status === 'fulfilled' ? r.value : [])
  return NextResponse.json(merged)
}


