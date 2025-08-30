import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const logFile = path.join(process.cwd(), 'logs', 'fixed-errors.json');
    
    if (!fs.existsSync(logFile)) {
      return NextResponse.json({ errors: [] });
    }
    
    const content = fs.readFileSync(logFile, 'utf-8');
    const data = JSON.parse(content);
    
    return NextResponse.json({ 
      errors: data,
      totalCount: len(data) 
    });
    
  } catch (error) {
    console.error('수정된 오류 로그 읽기 실패:', error);
    return NextResponse.json(
      { error: '로그 읽기에 실패했습니다.' },
      { status: 500 }
    );
  }
}
