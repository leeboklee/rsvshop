import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

export async function POST(request: NextRequest) {
  try {
    const { restoreTime } = await request.json();

    if (!restoreTime) {
      return NextResponse.json({ 
        success: false, 
        error: '복구할 시간이 필요합니다.' 
      }, { status: 400 });
    }

    // 시간 기반 복구 스크립트 실행
    const restoreProcess = spawn('node', ['scripts/auto-backup-scheduler.js', 'restore-time', restoreTime], {
      cwd: process.cwd(),
      stdio: 'pipe'
    });

    return new Promise((resolve, reject) => {
      let output = '';
      let errorOutput = '';

      restoreProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      restoreProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      restoreProcess.on('close', (code) => {
        if (code === 0) {
          resolve(NextResponse.json({ 
            success: true, 
            message: '시간 기반 복구가 성공적으로 완료되었습니다.',
            output: output.trim()
          }));
        } else {
          resolve(NextResponse.json({ 
            success: false, 
            error: '시간 기반 복구에 실패했습니다.',
            details: errorOutput.trim()
          }, { status: 500 }));
        }
      });

      restoreProcess.on('error', (error) => {
        resolve(NextResponse.json({ 
          success: false, 
          error: '시간 기반 복구 프로세스 실행 중 오류가 발생했습니다.',
          details: error.message
        }, { status: 500 }));
      });
    });

  } catch (error) {
    console.error('시간 기반 복구 오류:', error);
    return NextResponse.json({ 
      success: false, 
      error: '시간 기반 복구 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
} 