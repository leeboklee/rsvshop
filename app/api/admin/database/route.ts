import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// BigInt 직렬화 문제 해결을 위한 헬퍼 함수
function serializeData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }
  
  if (typeof data === 'bigint') {
    return data.toString();
  }
  
  if (Array.isArray(data)) {
    return data.map(serializeData);
  }
  
  if (typeof data === 'object') {
    const serialized: any = {};
    for (const [key, value] of Object.entries(data)) {
      serialized[key] = serializeData(value);
    }
    return serialized;
  }
  
  return data;
}

// GET: 현재 DB 상태 조회
export async function GET() {
  try {
    // 데이터베이스 연결 정보 (PostgreSQL 호환)
    const databaseInfo = await prisma.$queryRaw`
      SELECT 
        current_database() as database_name,
        current_user as current_user,
        version() as version,
        now() as connected_at,
        inet_server_addr()::text as server_address,
        inet_server_port()::text as server_port
    `;

    // 테이블 목록 (PostgreSQL 호환)
    const tables = await prisma.$queryRaw`
      SELECT 
        table_name,
        table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    // 예약 통계
    const bookingStats = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'CONFIRMED' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_bookings
      FROM "Booking"
    `;

    // 백업 정보
    const backupDir = path.join(process.cwd(), 'backup');
    let backupInfo = [];
    
    if (fs.existsSync(backupDir)) {
      const backupFiles = fs.readdirSync(backupDir)
        .filter(file => file.endsWith('.json') && file.startsWith('backup-') && !file.includes('-info'))
        .map(file => {
          const filePath = path.join(backupDir, file);
          const stats = fs.statSync(filePath);
          const infoFile = path.join(backupDir, file.replace('.json', '-info.json'));
          let info = {};
          
          if (fs.existsSync(infoFile)) {
            info = JSON.parse(fs.readFileSync(infoFile, 'utf8'));
          }

          return {
            filename: file,
            size: stats.size,
            created: stats.mtime,
            info: info
          };
        })
        .sort((a, b) => b.created - a.created)
        .slice(0, 10); // 최근 10개만

      backupInfo = backupFiles;
    }

    // 전체 백업 크기 계산
    let totalBackupSize: number = 0;
    if (fs.existsSync(backupDir)) {
      const allBackupFiles = fs.readdirSync(backupDir)
        .filter(file => file.endsWith('.json') && file.startsWith('backup-') && !file.includes('-info'));
      
      totalBackupSize = allBackupFiles.reduce((sum: number, file: string) => {
        const filePath = path.join(backupDir, file);
        const fileSize = fs.statSync(filePath).size;
        return sum + Number(fileSize || 0);
      }, 0);
    }

    return NextResponse.json({
      success: true,
      data: {
        status: 'connected',
        database: databaseInfo[0],
        tables: tables,
        bookingStats: {
          total_bookings: bookingStats[0].total_bookings.toString(),
          confirmed_bookings: bookingStats[0].confirmed_bookings.toString(),
          pending_bookings: bookingStats[0].pending_bookings.toString()
        },
        backupInfo: backupInfo,
        totalBackupSize: totalBackupSize,
        currentDatabaseUrl: process.env.DATABASE_URL,
        dbDetails: {
          provider: 'postgresql',
          host: databaseInfo[0]?.server_address || 'localhost',
          port: databaseInfo[0]?.server_port || '5432',
          database: databaseInfo[0]?.database_name || 'rsvshop',
          username: databaseInfo[0]?.current_user || 'postgres'
        },
        provider: 'POSTGRESQL',
        connectionType: 'postgresql',
        availableDatabases: [
          {
            name: 'PostgreSQL (운영용)',
            type: 'postgresql',
            url: 'postgresql://postgres:qhraksgdl07@localhost:5432/rsvshop',
            description: 'PostgreSQL 서버 데이터베이스'
          }
        ]
      }
    });

  } catch (error) {
    console.error('Database info error:', error);
    return NextResponse.json(
      { error: '데이터베이스 정보 조회 실패' },
      { status: 500 }
    );
  }
}

// POST: DB 전환 및 연결 테스트
export async function POST(request: NextRequest) {
  try {
    const { action, databaseUrl } = await request.json();

    if (action === 'test') {
      // 연결 테스트
      const testPrisma = new PrismaClient({
        datasources: {
          db: {
            url: databaseUrl
          }
        }
      });

      try {
        // PostgreSQL 쿼리
        await testPrisma.$queryRaw`SELECT 1 as test`;
        
        await testPrisma.$disconnect();
        
        return NextResponse.json({
          success: true,
          message: '데이터베이스 연결 테스트 성공'
        });
      } catch (testError) {
        console.error('DB 연결 테스트 오류:', testError);
        await testPrisma.$disconnect();
        
        // Prisma 오류 타입별 처리
        if (testError instanceof Prisma.PrismaClientInitializationError) {
          return NextResponse.json({
            success: false,
            error: `데이터베이스 초기화 오류: ${testError.message}`
          }, { status: 500 });
        }
        
        if (testError instanceof Prisma.PrismaClientKnownRequestError) {
          return NextResponse.json({
            success: false,
            error: `데이터베이스 쿼리 오류 (${testError.code}): ${testError.message}`
          }, { status: 500 });
        }
        
        throw testError;
      }
    }

    if (action === 'switch') {
      // 환경 변수 업데이트 (실제로는 .env 파일 수정 필요)
      process.env.DATABASE_URL = databaseUrl;
      
      // 새로운 Prisma 클라이언트 생성
      const newPrisma = new PrismaClient({
        datasources: {
          db: {
            url: databaseUrl
          }
        }
      });

      // 연결 테스트
      await newPrisma.$queryRaw`SELECT 1`;
      await newPrisma.$disconnect();

      return NextResponse.json({
        success: true,
        message: 'DB 전환이 완료되었습니다. 서버를 재시작해주세요.'
      });
    }

    return NextResponse.json({
      success: false,
      error: '지원하지 않는 작업입니다.'
    }, { status: 400 });
  } catch (error) {
    console.error('DB 작업 실패:', error);
    
    // Prisma 오류 타입별 처리
    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json({
        success: false,
        error: `데이터베이스 초기화 오류: ${error.message}`
      }, { status: 500 });
    }
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({
        success: false,
        error: `데이터베이스 쿼리 오류 (${error.code}): ${error.message}`
      }, { status: 500 });
    }
    
    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      return NextResponse.json({
        success: false,
        error: `알 수 없는 데이터베이스 오류: ${error.message}`
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: false,
      error: error.message || '알 수 없는 오류가 발생했습니다.'
    }, { status: 500 });
  }
} 