import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // PostgreSQL 스키마 확인
    const fs = await import('fs');
    const path = await import('path');
    const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
    
    if (!schemaContent.includes('provider = "postgresql"')) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'PostgreSQL 스키마가 아닙니다',
          solution: 'Prisma 스키마를 PostgreSQL로 설정하세요',
          dbType: 'unknown',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
    
    // 환경 변수 확인
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'DATABASE_URL 환경 변수가 설정되지 않았습니다',
          solution: '프로젝트 루트에 .env 파일을 생성하고 DATABASE_URL을 설정하세요',
          example: 'DATABASE_URL="postgresql://postgres:qhraksgdl07@localhost:5432/rsvshop"',
          dbType: 'postgresql',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    // Prisma 클라이언트 생성
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient({
      log: [],
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });

    // 연결 테스트
    await prisma.$connect();
    
    // 간단한 쿼리 테스트
    const roomCount = await prisma.room.count().catch(() => 0);
    const packageCount = await prisma.package.count().catch(() => 0);
    const bookingCount = await prisma.booking.count().catch(() => 0);
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      status: 'connected',
      message: 'PostgreSQL 데이터베이스 연결 성공',
      dbType: 'postgresql',
      data: {
        roomCount,
        packageCount,
        bookingCount,
        databaseUrl: databaseUrl.replace(/\/\/.*@/, '//***:***@'),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    
    let errorMessage = 'PostgreSQL 데이터베이스 연결 실패';
    let solution = '';
    
    if (error instanceof Error) {
      if (error.message.includes('Authentication failed')) {
        errorMessage = 'PostgreSQL 인증 실패';
        solution = 'DATABASE_URL의 사용자명과 비밀번호를 확인하세요';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'PostgreSQL 서버에 연결할 수 없습니다';
        solution = 'PostgreSQL 서버가 실행 중인지 확인하세요 (sudo service postgresql start)';
      } else if (error.message.includes('ENOENT')) {
        errorMessage = '데이터베이스 파일을 찾을 수 없습니다';
        solution = 'npx prisma migrate dev를 실행하여 데이터베이스를 초기화하세요';
      } else if (error.message.includes('database "rsvshop" does not exist')) {
        errorMessage = 'rsvshop 데이터베이스가 존재하지 않습니다';
        solution = 'sudo -u postgres createdb rsvshop 명령어로 데이터베이스를 생성하세요';
      }
    }
    
    return NextResponse.json(
      {
        status: 'disconnected',
        message: errorMessage,
        solution,
        error: error instanceof Error ? error.message : 'Unknown error',
        dbType: 'postgresql',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 