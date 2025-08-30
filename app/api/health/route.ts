import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  const result: { ok: boolean; db: 'up' | 'down'; error?: string } = {
    ok: true,
    db: 'up',
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error: any) {
    result.ok = false;
    result.db = 'down';
    result.error = error?.message || 'Unknown error';
  }

  const status = result.ok ? 200 : 503;
  return NextResponse.json(result, { status });
} 