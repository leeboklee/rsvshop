import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 자동 오류 수정 실행 요청됨');
    
    // Python 스크립트 실행
    const scriptPath = process.cwd() + '/scripts/auto-error-fixer.py';
    
    try {
      const { stdout, stderr } = await execAsync(`python3 ${scriptPath} fix`);
      
      if (stderr) {
        console.warn('자동 오류 수정 경고:', stderr);
      }
      
      console.log('자동 오류 수정 결과:', stdout);
      
      // 결과 분석 (간단한 패턴 매칭)
      const fixedCount = (stdout.match(/✅/g) || []).length;
      const failedCount = (stdout.match(/❌/g) || []).length;
      
      return NextResponse.json({
        success: true,
        message: '자동 오류 수정이 완료되었습니다.',
        fixedCount,
        failedCount,
        output: stdout,
        timestamp: new Date().toISOString()
      });
      
    } catch (execError: any) {
      console.error('Python 스크립트 실행 실패:', execError);
      
      // Python 스크립트가 실패한 경우 대체 방법 시도
      return await fallbackErrorFix();
    }
    
  } catch (error: any) {
    console.error('자동 오류 수정 API 실패:', error);
    return NextResponse.json(
      { 
        error: '자동 오류 수정에 실패했습니다.',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

async function fallbackErrorFix() {
  try {
    console.log('🔄 대체 오류 수정 방법 시도...');
    
    let fixedCount = 0;
    
    // 1. .next 폴더 정리
    try {
      const { stdout } = await execAsync('rm -rf .next');
      console.log('✅ .next 폴더 정리 완료');
      fixedCount++;
    } catch (e) {
      console.log('ℹ️ .next 폴더가 이미 정리됨');
    }
    
    // 2. 의존성 재설치
    try {
      const { stdout } = await execAsync('npm install');
      console.log('✅ 의존성 재설치 완료');
      fixedCount++;
    } catch (e) {
      console.log('⚠️ 의존성 재설치 실패:', e);
    }
    
    // 3. Prisma 스키마 동기화
    try {
      const { stdout } = await execAsync('npx prisma generate');
      console.log('✅ Prisma 스키마 동기화 완료');
      fixedCount++;
    } catch (e) {
      console.log('⚠️ Prisma 스키마 동기화 실패:', e);
    }
    
    return NextResponse.json({
      success: true,
      message: '대체 방법으로 오류 수정을 시도했습니다.',
      fixedCount,
      method: 'fallback',
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('대체 오류 수정 실패:', error);
    return NextResponse.json(
      { 
        error: '모든 오류 수정 방법이 실패했습니다.',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
