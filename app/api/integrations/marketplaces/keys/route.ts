import { NextRequest, NextResponse } from 'next/server'

// 간단한 파일 저장 (데모용). 실제 배포에서는 KMS/Secret Manager 또는 DB 사용 권장
import fs from 'fs'
import path from 'path'

const STORE = path.join(process.cwd(), 'backup', 'marketplace-keys.json')

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    fs.mkdirSync(path.dirname(STORE), { recursive: true })
    const payload = { ...body, _meta: { savedAt: new Date().toISOString() } }
    fs.writeFileSync(STORE, JSON.stringify(payload, null, 2))
    return NextResponse.json({ ok: true, savedAt: payload._meta.savedAt })
  } catch (e) {
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}

export async function GET() {
  try {
    if (!fs.existsSync(STORE)) return NextResponse.json({})
    const data = JSON.parse(fs.readFileSync(STORE, 'utf8'))
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({}, { status: 200 })
  }
}


