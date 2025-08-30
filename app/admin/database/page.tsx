'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Card from '@/app/components/common/Card';

interface DatabaseInfo {
  status: string;
  database: {
    database_name: string;
    current_user: string;
    version: string;
    connected_at: string;
    server_address: string;
    server_port: string;
  };
  tables: any[];
  bookingStats: any;
  backupInfo: any[];
  totalBackupSize: number;
}

interface PrismaStatus {
  status: string;
  connection: {
    isConnected: boolean;
    responseTime: number;
  };
  schema: {
    isGenerated: boolean;
    lastGenerated: string;
  };
  migrations: {
    isUpToDate: boolean;
    pendingMigrations: string[];
  };
  generatedAt: string;
}

export default function DatabaseManagementPage() {
  const [dbInfo, setDbInfo] = useState<DatabaseInfo | null>(null);
  const [dbLoading, setDbLoading] = useState(false);
  const [prismaStatus, setPrismaStatus] = useState<PrismaStatus | null>(null);
  const [prismaLoading, setPrismaLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState<string>('');

  // 클라이언트에서만 날짜 설정 (hydration 오류 방지)
  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('ko-KR'));
  }, []);

  // 메모이제이션으로 불필요한 재렌더링 방지
  const memoizedDbInfo = useMemo(() => dbInfo, [dbInfo]);
  const memoizedPrismaStatus = useMemo(() => prismaStatus, [prismaStatus]);

  // DB 정보 조회
  const fetchDbInfo = useCallback(async () => {
    setDbLoading(true);
    try {
      const response = await fetch('/api/admin/database');
      const data = await response.json();
      if (data.success) {
        setDbInfo(data.data);
      } else {
        console.error('DB 정보 조회 실패:', data.error);
      }
    } catch (error) {
      console.error('DB 정보 조회 오류:', error);
    } finally {
      setDbLoading(false);
    }
  }, []);

  // Prisma 상태 조회
  const fetchPrismaStatus = useCallback(async () => {
    setPrismaLoading(true);
    try {
      const response = await fetch('/api/admin/prisma-status');
      const data = await response.json();
      if (data.success) {
        setPrismaStatus(data.data);
      } else {
        console.error('Prisma 상태 조회 실패:', data.error);
      }
    } catch (error) {
      console.error('Prisma 상태 조회 오류:', error);
    } finally {
      setPrismaLoading(false);
    }
  }, []);

  // AI/오류 보고
  const sendToAI = useCallback(async (payload: any) => {
    try {
      const res = await fetch('/api/admin/error-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data?.success) alert('전송 완료');
      else alert('전송 실패');
    } catch (e: any) {
      alert(`전송 오류: ${e?.message || e}`);
    }
  }, []);

  const handleAiConnect = useCallback(() => {
    sendToAI({
      type: 'ai_connection',
      message: 'DB 관리 페이지 AI 연결',
      url: typeof window !== 'undefined' ? window.location.href : '',
      page: 'admin/database',
      prismaStatus,
      dbInfo,
    });
  }, [sendToAI, prismaStatus, dbInfo]);

  const handleSendStatus = useCallback(() => {
    sendToAI({
      type: 'status_report',
      message: 'DB 상태 보고',
      url: typeof window !== 'undefined' ? window.location.href : '',
      page: 'admin/database',
      prismaStatus,
      dbInfo,
    });
  }, [sendToAI, prismaStatus, dbInfo]);

  const handleSendErrorDetail = useCallback(() => {
    sendToAI({
      type: 'error_detail',
      message: 'DB 오류 상세 전송',
      url: typeof window !== 'undefined' ? window.location.href : '',
      page: 'admin/database',
      prismaStatus,
      dbInfo,
    });
  }, [sendToAI, prismaStatus, dbInfo]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchDbInfo();
    fetchPrismaStatus();
  }, [fetchDbInfo, fetchPrismaStatus]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">데이터베이스 관리</h1>
              <p className="mt-2 text-gray-600">데이터베이스 상태 모니터링 및 관리</p>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={handleAiConnect} className="px-3 py-2 text-sm bg-indigo-500 text-white rounded-md hover:bg-indigo-600">AI 연결</button>
              <button onClick={handleSendStatus} className="px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600">상태 보고</button>
              <button onClick={handleSendErrorDetail} className="px-3 py-2 text-sm bg-rose-500 text-white rounded-md hover:bg-rose-600">오류 상세 전송</button>
              <div className="ml-2 text-sm text-gray-500">{currentDate}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 현재 DB 상태 */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">현재 데이터베이스 상태</h2>
              {dbLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">DB 정보를 불러오는 중...</p>
                </div>
              ) : dbInfo ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">연결 상태</span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${dbInfo.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={`text-sm font-medium ${dbInfo.status === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
                        {dbInfo.status === 'connected' ? '연결됨' : '연결 안됨'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">데이터베이스:</span>
                      <p className="font-medium">{dbInfo.database.database_name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">사용자:</span>
                      <p className="font-medium">{dbInfo.database.current_user}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">버전:</span>
                      <p className="font-medium">{dbInfo.database.version}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">연결 시간:</span>
                      <p className="font-medium">{dbInfo.database.connected_at}</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">테이블 정보</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-2">
                        총 {dbInfo.tables.length}개 테이블
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {dbInfo.tables.slice(0, 6).map((table: any, index: number) => (
                          <div key={index} className="text-sm bg-white px-2 py-1 rounded">
                            {table.table_name}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  DB 정보를 불러올 수 없습니다.
                </div>
              )}
            </div>
          </Card>

          {/* Prisma 상태 */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Prisma 상태</h2>
              {prismaLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Prisma 상태를 불러오는 중...</p>
                </div>
              ) : prismaStatus ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">연결 상태</span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${prismaStatus?.connection?.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={`text-sm font-medium ${prismaStatus?.connection?.isConnected ? 'text-green-600' : 'text-red-600'}`}>
                        {prismaStatus?.connection?.isConnected ? '연결됨' : '연결 안됨'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">응답 시간:</span>
                      <p className="font-medium">{prismaStatus?.connection?.responseTime ?? 0}ms</p>
                    </div>
                    <div>
                      <span className="text-gray-600">스키마 생성:</span>
                      <p className="font-medium">{prismaStatus?.schema?.isGenerated ? '완료' : '미완료'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">마이그레이션:</span>
                      <p className="font-medium">{prismaStatus?.migrations?.isUpToDate ? '최신' : '업데이트 필요'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">생성 시간:</span>
                      <p className="font-medium">{prismaStatus?.generatedAt || ''}</p>
                    </div>
                  </div>

                  {!prismaStatus?.migrations?.isUpToDate && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="text-sm font-medium text-yellow-800 mb-2">대기 중인 마이그레이션</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {(prismaStatus?.migrations?.pendingMigrations ?? []).map((migration: string, index: number) => (
                          <li key={index}>• {migration}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Prisma 상태를 불러올 수 없습니다.
                </div>
              )}
            </div>
          </Card>

          {/* 데이터베이스 성능 모니터링 */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">데이터베이스 성능</h2>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">PostgreSQL 최적화</h4>
                  <p className="text-sm text-blue-700">
                    현재 PostgreSQL 16.9을 사용하여 최적의 성능을 제공합니다.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">연결 풀:</span>
                    <p className="font-medium">활성화</p>
                  </div>
                  <div>
                    <span className="text-gray-600">쿼리 최적화:</span>
                    <p className="font-medium">활성화</p>
                  </div>
                  <div>
                    <span className="text-gray-600">인덱스:</span>
                    <p className="font-medium">자동 생성</p>
                  </div>
                  <div>
                    <span className="text-gray-600">백업:</span>
                    <p className="font-medium">자동화</p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => window.open('/admin/database/backup', '_blank')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    백업 관리
                  </button>
                  <button
                    onClick={() => window.open('/admin/database/recover', '_blank')}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    복구 도구
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* 백업 정보 */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">백업 정보</h2>
              {dbInfo?.backupInfo ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">총 백업 크기</span>
                    <span className="text-sm font-medium">
                      {(dbInfo.totalBackupSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">최근 백업</h4>
                    {dbInfo.backupInfo.slice(0, 5).map((backup: any, index: number) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{backup.filename}</span>
                        <span className="text-gray-500">{(backup.size / 1024).toFixed(1)} KB</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  백업 정보를 불러올 수 없습니다.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 