import { NextResponse } from 'next/server'

// 가벼운 핑 엔드포인트: DB 접속 없이 서버 생존/업타임만 반환
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
}


