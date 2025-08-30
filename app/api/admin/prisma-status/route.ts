import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 1. Prisma 스키마 정보
    const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
    let schemaContent = '';
    let schemaStats = {
      totalModels: 0,
      totalFields: 0,
      totalRelations: 0,
      enums: 0,
      datasources: 0
    };

    try {
      schemaContent = fs.readFileSync(schemaPath, 'utf-8');
      
      // 스키마 통계 계산
      const modelMatches = schemaContent.match(/model\s+\w+/g);
      const fieldMatches = schemaContent.match(/\w+\s+\w+(\?)?(\s+@\w+)?/g);
      const relationMatches = schemaContent.match(/@relation/g);
      const enumMatches = schemaContent.match(/enum\s+\w+/g);
      const datasourceMatches = schemaContent.match(/datasource\s+\w+/g);

      schemaStats = {
        totalModels: modelMatches ? modelMatches.length : 0,
        totalFields: fieldMatches ? fieldMatches.length : 0,
        totalRelations: relationMatches ? relationMatches.length : 0,
        enums: enumMatches ? enumMatches.length : 0,
        datasources: datasourceMatches ? datasourceMatches.length : 0
      };
    } catch (error) {
      console.error('스키마 파일 읽기 실패:', error);
    }

    // 2. 데이터베이스 테이블 정보
    let tables = [];
    let tableStats = {
      totalTables: 0,
      totalRecords: 0,
      totalSize: 0
    };

    try {
      // SQLite의 경우
      if (process.env.DATABASE_URL?.includes('sqlite')) {
        try {
          const tableList = await prisma.$queryRaw`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name NOT LIKE 'sqlite_%'
            ORDER BY name
          `;
          
          tables = await Promise.all(
            (tableList as any[]).map(async (table: any) => {
              try {
                const countResult = await prisma.$queryRaw`
                  SELECT COUNT(*) as count FROM "${table.name}"
                `;
                return {
                  name: table.name,
                  recordCount: (countResult as any[])[0]?.count || 0
                };
              } catch (error) {
                return {
                  name: table.name,
                  recordCount: 0,
                  error: error instanceof Error ? error.message : 'Unknown error'
                };
              }
            })
          );
        } catch (error) {
          console.error('SQLite 테이블 조회 실패:', error);
          tables = [];
        }
      } else {
        // PostgreSQL의 경우 (기본)
        try {
          // 먼저 DB 연결 테스트
          await prisma.$queryRaw`SELECT 1`;
          
          // 더 안전한 테이블 조회 쿼리
          const tableList = await prisma.$queryRaw`
            SELECT 
              table_name,
              table_schema
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
          `;
          
          tables = (tableList as any[]).map((table: any) => ({
            name: table.table_name,
            recordCount: 0, // 기본값, 필요시 별도 쿼리로 조회
            inserts: 0,
            updates: 0,
            deletes: 0
          }));
        } catch (error) {
          console.error('PostgreSQL 테이블 조회 실패:', error);
          // PostgreSQL 연결 실패 시 빈 테이블 목록 반환
          tables = [];
          console.log('PostgreSQL 서버가 실행되지 않았습니다. 로컬 PostgreSQL을 설치하거나 Docker를 실행해주세요.');
        }
      }

      tableStats = {
        totalTables: tables.length,
        totalRecords: tables.reduce((sum, table) => sum + (table.recordCount || 0), 0),
        totalSize: 0 // SQLite에서는 크기 계산이 복잡하므로 생략
      };
    } catch (error) {
      console.error('테이블 정보 조회 실패:', error);
    }

    // 3. Prisma 클라이언트 정보
    const clientInfo = {
      version: require('@prisma/client/package.json').version,
      generatedAt: new Date().toISOString(),
      connectionStatus: 'connected'
    };

    // 4. 마이그레이션 정보
    let migrations = [];
    try {
      const migrationsPath = path.join(process.cwd(), 'prisma', 'migrations');
      if (fs.existsSync(migrationsPath)) {
        const migrationDirs = fs.readdirSync(migrationsPath, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name)
          .sort();
        
        migrations = migrationDirs.map(dir => ({
          name: dir,
          applied: true // 실제로는 더 복잡한 로직이 필요하지만 간단히 처리
        }));
      }
    } catch (error) {
      console.error('마이그레이션 정보 조회 실패:', error);
    }

    // 5. 성능 메트릭 및 연결 상태 확인
    const startTime = Date.now();
    let connectionStatus = 'connected';
    let responseTime = 0;
    let migrationStatus = 'up_to_date';
    let schemaGenerationStatus = 'complete';
    
    try {
      // DB 연결 테스트
      await prisma.$queryRaw`SELECT 1`;
      responseTime = Date.now() - startTime;
      
      // 마이그레이션 상태 확인
      try {
        const migrationCount = await prisma.$queryRaw`
          SELECT COUNT(*) as count FROM _prisma_migrations 
          WHERE finished_at IS NULL
        `;
        if ((migrationCount as any[])[0]?.count > 0) {
          migrationStatus = 'pending';
        }
      } catch (migrationError) {
        console.error('마이그레이션 상태 확인 실패:', migrationError);
        migrationStatus = 'unknown';
      }
      
      // 스키마 생성 상태 확인
      const clientPath = path.join(process.cwd(), 'node_modules', '.prisma', 'client');
      if (!fs.existsSync(clientPath)) {
        schemaGenerationStatus = 'incomplete';
      }
      
    } catch (error) {
      console.error('DB 연결 테스트 실패:', error);
      connectionStatus = 'disconnected';
      responseTime = Date.now() - startTime;
      migrationStatus = 'failed';
      schemaGenerationStatus = 'failed';
    }

    const generatedAtIso = new Date().toISOString();

    const response = {
      success: true,
      data: {
        // 기존 스키마 정보에 UI가 기대하는 필드(isGenerated, lastGenerated)도 함께 제공
        schema: {
          content: schemaContent,
          stats: schemaStats,
          lastModified: fs.existsSync(schemaPath) ? fs.statSync(schemaPath).mtime : null,
          isGenerated: schemaGenerationStatus === 'complete',
          lastGenerated: generatedAtIso,
        },
        database: {
          tables,
          stats: tableStats,
          responseTime: `${responseTime}ms`
        },
        client: {
          ...clientInfo,
          connectionStatus,
          migrationStatus,
          schemaGenerationStatus
        },
        // UI(DatabaseManagementPage)에서 기대하는 형태의 보조 필드들을 함께 노출
        connection: {
          isConnected: connectionStatus === 'connected',
          responseTime,
        },
        migrations: {
          total: migrations.length,
          applied: migrations.filter(m => m.applied).length,
          list: migrations,
          status: migrationStatus,
          isUpToDate: migrationStatus === 'up_to_date',
          pendingMigrations: [] as string[],
        },
        generatedAt: generatedAtIso,
        status: 'healthy',
        timestamp: generatedAtIso,
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Prisma 상태 조회 실패:', error);
    return NextResponse.json(
      { 
        error: 'Prisma 상태를 조회하는데 실패했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 