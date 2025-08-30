import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // 백업 스크립트 실행
    const backupProcess = spawn('node', ['scripts/auto-backup-scheduler.js', 'backup'], {
      cwd: process.cwd(),
      stdio: 'pipe'
    });

    return new Promise((resolve, reject) => {
      let output = '';
      let errorOutput = '';

      backupProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      backupProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      backupProcess.on('close', (code) => {
        if (code === 0) {
          resolve(NextResponse.json({ 
            success: true, 
            message: '백업이 성공적으로 생성되었습니다.',
            output: output.trim()
          }));
        } else {
          resolve(NextResponse.json({ 
            success: false, 
            error: '백업 생성에 실패했습니다.',
            details: errorOutput.trim()
          }, { status: 500 }));
        }
      });

      backupProcess.on('error', (error) => {
        resolve(NextResponse.json({ 
          success: false, 
          error: '백업 프로세스 실행 중 오류가 발생했습니다.',
          details: error.message
        }, { status: 500 }));
      });
    });

  } catch (error) {
    console.error('백업 생성 오류:', error);
    return NextResponse.json({ 
      success: false, 
      error: '백업 생성 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
} 