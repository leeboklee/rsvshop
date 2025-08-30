import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const logFile = path.join(process.cwd(), 'logs', 'server-errors.log');
    
    if (!fs.existsSync(logFile)) {
      return NextResponse.json({ errors: [] });
    }
    
    const content = fs.readFileSync(logFile, 'utf-8');
    const errors = content.split('\n').filter(line => line.trim());
    
    return NextResponse.json({ 
      errors: errors.slice(-100), // 최근 100개만
      totalCount: errors.length 
    });
    
  } catch (error) {
    console.error('서버 오류 로그 읽기 실패:', error);
    return NextResponse.json(
      { error: '로그 읽기에 실패했습니다.' },
      { status: 500 }
    );
  }
}
