import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function DELETE(request: NextRequest) {
  try {
    const { filename } = await request.json();

    if (!filename) {
      return NextResponse.json({ 
        success: false, 
        error: '삭제할 백업 파일명이 필요합니다.' 
      }, { status: 400 });
    }

    const backupDir = path.join(process.cwd(), 'backup');
    const backupPath = path.join(backupDir, filename);
    const infoPath = path.join(backupDir, filename.replace('.json', '-info.json'));

    // 파일 존재 확인
    if (!fs.existsSync(backupPath)) {
      return NextResponse.json({ 
        success: false, 
        error: '백업 파일을 찾을 수 없습니다.' 
      }, { status: 404 });
    }

    // 백업 파일 삭제
    fs.unlinkSync(backupPath);

    // 정보 파일도 삭제 (존재하는 경우)
    if (fs.existsSync(infoPath)) {
      fs.unlinkSync(infoPath);
    }

    return NextResponse.json({ 
      success: true, 
      message: '백업 파일이 성공적으로 삭제되었습니다.' 
    });

  } catch (error) {
    console.error('백업 삭제 오류:', error);
    return NextResponse.json({ 
      success: false, 
      error: '백업 삭제 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
} 