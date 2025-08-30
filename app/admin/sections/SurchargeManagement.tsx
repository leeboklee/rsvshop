'use client';

import React, { useState, useEffect } from 'react';

interface Surcharge {
  id: string;
  name: string;
  type: 'SEASONAL' | 'SPECIAL' | 'WEEKEND';
  amount: number;
  startDate: string;
  endDate: string;
  hotelName: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export default function SurchargeManagement() {
  const [surcharges, setSurcharges] = useState<Surcharge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSurcharges();
  }, []);

  const loadSurcharges = async () => {
    try {
      setLoading(true);
      // 샘플 데이터
      const mockSurcharges: Surcharge[] = [
        {
          id: '1',
          name: '성수기 추가요금',
          type: 'SEASONAL',
          amount: 50000,
          startDate: '2024-07-01',
          endDate: '2024-08-31',
          hotelName: 'A-HOTEL',
          description: '여름 성수기 추가요금',
          status: 'ACTIVE'
        },
        {
          id: '2',
          name: '주말 추가요금',
          type: 'WEEKEND',
          amount: 30000,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          hotelName: 'A-HOTEL',
          description: '금요일~일요일 추가요금',
          status: 'ACTIVE'
        }
      ];
      setSurcharges(mockSurcharges);
    } catch (error) {
      console.error('추가요금 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">추가요금 관리</h1>
          <p className="text-gray-600">날짜별 추가요금, 성수기/특별 요금을 관리합니다</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          새 추가요금 등록
        </button>
      </div>

      {/* 추가요금 목록 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">요금명</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">유형</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">금액</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">적용기간</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">호텔</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {surcharges.map((surcharge) => (
                <tr key={surcharge.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{surcharge.name}</div>
                    <div className="text-sm text-gray-500">{surcharge.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      surcharge.type === 'SEASONAL' 
                        ? 'bg-blue-100 text-blue-800' 
                        : surcharge.type === 'WEEKEND'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {surcharge.type === 'SEASONAL' ? '성수기' : 
                       surcharge.type === 'WEEKEND' ? '주말' : '특별'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {surcharge.amount.toLocaleString()}원
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {surcharge.startDate} ~ {surcharge.endDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {surcharge.hotelName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      surcharge.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {surcharge.status === 'ACTIVE' ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">수정</button>
                    <button className="text-red-600 hover:text-red-900">삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
