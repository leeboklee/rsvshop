"use client";

import React, { useState, useEffect, useCallback } from 'react';
// import { Card } from '@/app/components/ui/card';

interface DatabaseInfo {
  status: string;
  responseTime: number;
  environment: {
    nodeEnv: string;
    databaseUrl: string;
    vercelEnv: string;
    region: string;
  };
  tables: Array<{
    name: string;
    type: string;
    count: number;
    error?: string;
  }>;
  recentData: {
    reservations: Array<any>;
    packages: Array<any>;
  };
  timestamp: string;
}

export default function EnhancedDatabasePage() {
  const [dbInfo, setDbInfo] = useState<DatabaseInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState(false);

  // DB 정보 조회
  const fetchDbInfo = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/db-info');
      const data = await response.json();
      if (data.success) {
        setDbInfo(data.data);
      }
    } catch (error) {
      console.error('DB 정보 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 테이블 데이터 조회
  const fetchTableData = useCallback(async (tableName: string) => {
    setTableLoading(true);
    try {
      const response = await fetch(`/api/admin/table-data?table=${tableName}&limit=10`);
      const data = await response.json();
      if (data.success) {
        setTableData(data.data);
      }
    } catch (error) {
      console.error('테이블 데이터 조회 오류:', error);
    } finally {
      setTableLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDbInfo();
    const interval = setInterval(fetchDbInfo, 30000); // 30초마다 업데이트
    return () => clearInterval(interval);
  }, [fetchDbInfo]);

  const handleTableClick = (tableName: string) => {
    setSelectedTable(tableName);
    fetchTableData(tableName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🗄️ 데이터베이스 관리</h1>
          <p className="text-gray-600">실시간 데이터베이스 상태 및 데이터 조회</p>
        </div>

        {/* 환경 정보 */}
        {dbInfo && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🌍 환경 정보</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">환경</div>
                <div className="text-lg font-bold text-blue-800">{dbInfo.environment.nodeEnv}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Vercel 환경</div>
                <div className="text-lg font-bold text-green-800">{dbInfo.environment.vercelEnv}</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">지역</div>
                <div className="text-lg font-bold text-purple-800">{dbInfo.environment.region}</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium">응답 시간</div>
                <div className="text-lg font-bold text-orange-800">{dbInfo.responseTime}ms</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 테이블 목록 */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📊 테이블 목록</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">테이블 정보를 불러오는 중...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {dbInfo?.tables.map((table) => (
                  <div
                    key={table.name}
                    onClick={() => handleTableClick(table.name)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      selectedTable === table.name
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-800">{table.name}</div>
                        <div className="text-sm text-gray-500">{table.type}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {table.error ? 'N/A' : table.count.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">레코드</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 테이블 데이터 */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📋 테이블 데이터 {selectedTable && `- ${selectedTable}`}
            </h2>
            {!selectedTable ? (
              <div className="text-center py-8 text-gray-500">
                테이블을 선택하여 데이터를 확인하세요
              </div>
            ) : tableLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">데이터를 불러오는 중...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {tableData.length > 0 && Object.keys(tableData[0]).map((key) => (
                        <th key={key} className="text-left p-2 font-medium text-gray-700">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        {Object.values(row).map((value, cellIndex) => (
                          <td key={cellIndex} className="p-2 text-gray-600">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {tableData.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    데이터가 없습니다
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 최근 데이터 */}
        {dbInfo && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">🏨 최근 예약</h2>
              <div className="space-y-3">
                {dbInfo.recentData.reservations.map((reservation) => (
                  <div key={reservation.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-800">{reservation.guestName}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(reservation.checkInDate).toLocaleDateString()} - 
                          {new Date(reservation.checkOutDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          {reservation.totalAmount?.toLocaleString()}원
                        </div>
                        <div className="text-xs text-gray-500">{reservation.status}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">📦 최근 패키지</h2>
              <div className="space-y-3">
                {dbInfo.recentData.packages.map((pkg) => (
                  <div key={pkg.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-800">{pkg.name}</div>
                        <div className="text-sm text-gray-600">{pkg.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-600">
                          {pkg.price?.toLocaleString()}원
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 새로고침 버튼 */}
        <div className="text-center">
          <button
            onClick={fetchDbInfo}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? '새로고침 중...' : '새로고침'}
          </button>
        </div>
      </div>
    </div>
  );
}
