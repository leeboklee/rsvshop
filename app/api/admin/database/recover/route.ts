import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

export async function POST(request: NextRequest) {
  try {
    // 자동 복구 스크립트 실행
    const recoverProcess = spawn('node', ['scripts/db-recovery-manager.js', 'recover'], {
      cwd: process.cwd(),
      stdio: 'pipe'
    });

    return new Promise((resolve, reject) => {
      let output = '';
      let errorOutput = '';

      recoverProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      recoverProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      recoverProcess.on('close', (code) => {
        if (code === 0) {
          resolve(NextResponse.json({ 
            success: true, 
            message: '자동 복구가 성공적으로 완료되었습니다.',
            output: output.trim()
          }));
        } else {
          resolve(NextResponse.json({ 
            success: false, 
            error: '자동 복구에 실패했습니다.',
            details: errorOutput.trim()
          }, { status: 500 }));
        }
      });

      recoverProcess.on('error', (error) => {
        resolve(NextResponse.json({ 
          success: false, 
          error: '자동 복구 프로세스 실행 중 오류가 발생했습니다.',
          details: error.message
        }, { status: 500 }));
      });
    });

  } catch (error) {
    console.error('자동 복구 오류:', error);
    return NextResponse.json({ 
      success: false, 
      error: '자동 복구 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
} 