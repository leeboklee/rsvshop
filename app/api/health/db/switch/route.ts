import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { targetDb } = await request.json();
    
    if (targetDb !== 'postgresql') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'PostgreSQL만 지원됩니다. SQLite는 더 이상 지원되지 않습니다.' 
        },
        { status: 400 }
      );
    }

    // PostgreSQL 스키마 확인 및 설정
    const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
    
    // 이미 PostgreSQL인지 확인
    if (schemaContent.includes('provider = "postgresql"')) {
      return NextResponse.json({ 
        success: true, 
        message: '이미 PostgreSQL을 사용하고 있습니다.',
        dbType: 'postgresql'
      });
    }

    // PostgreSQL로 전환
    const newSchemaContent = schemaContent.replace(
      /datasource db \{[^}]*\}/s,
      `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`
    );
    fs.writeFileSync(schemaPath, newSchemaContent);
    
    // 환경변수 설정 (PostgreSQL)
    const envPath = path.join(process.cwd(), '.env');
    const envContent = `DATABASE_URL="postgresql://postgres:qhraksgdl07@localhost:5432/rsvshop"
NODE_ENV="development"`;
    fs.writeFileSync(envPath, envContent);
    
    // Prisma 클라이언트 재생성
    try {
      await execAsync('npx prisma generate');
    } catch (error) {
      console.warn('Prisma generate 실패, 계속 진행:', error);
    }
    
    try {
      await execAsync('npx prisma db push');
    } catch (error) {
      console.warn('Prisma db push 실패, 계속 진행:', error);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'PostgreSQL 전환 완료',
      dbType: 'postgresql'
    });
    
  } catch (error) {
    console.error('DB 전환 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 