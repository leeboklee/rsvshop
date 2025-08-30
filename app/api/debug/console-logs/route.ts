import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 로그 파일 경로
    const logDir = path.join(process.cwd(), 'logs');
    const logFile = path.join(logDir, 'console-logs.json');
    
    // 로그 디렉토리가 없으면 생성
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // 기존 로그 읽기
    let existingLogs = [];
    if (fs.existsSync(logFile)) {
      try {
        const content = fs.readFileSync(logFile, 'utf-8');
        existingLogs = JSON.parse(content);
      } catch (e) {
        existingLogs = [];
      }
    }
    
    // 새 로그 추가
    const newLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      receivedAt: new Date().toISOString()
    };
    
    existingLogs.push(newLogEntry);
    
    // 최근 1000개 로그만 유지
    if (existingLogs.length > 1000) {
      existingLogs = existingLogs.slice(-1000);
    }
    
    // 로그 파일에 저장
    fs.writeFileSync(logFile, JSON.stringify(existingLogs, null, 2));
    
    // 서버 콘솔에도 출력
    console.log('📱 브라우저 콘솔 로그 수집:', {
      url: data.url,
      logCount: data.logs.length,
      timestamp: data.timestamp
    });
    
    return NextResponse.json({ 
      success: true, 
      message: '로그가 성공적으로 수집되었습니다.',
      logCount: data.logs.length 
    });
    
  } catch (error) {
    console.error('콘솔 로그 수집 실패:', error);
    return NextResponse.json(
      { error: '로그 수집에 실패했습니다.' },
      { status: 500 }
    );
  }
}
