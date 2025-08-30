'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  includes: string[];
  images: string[];
  available: boolean;
}

export default function CustomerPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      // 샘플 데이터
      const mockPackages: Package[] = [
        {
          id: '1',
          name: '서울 시티투어 패키지',
          description: '서울의 주요 관광지를 둘러보는 패키지',
          price: 80000,
          duration: '1박 2일',
          includes: ['호텔 숙박', '전용 가이드', '교통편', '식사 2회'],
          images: ['/api/placeholder/400/300'],
          available: true
        },
        {
          id: '2',
          name: '부산 해양투어 패키지',
          description: '부산의 아름다운 바다를 즐기는 패키지',
          price: 120000,
          duration: '2박 3일',
          includes: ['호텔 숙박', '해양 투어', '전용 가이드', '식사 3회'],
          images: ['/api/placeholder/400/300'],
          available: true
        }
      ];
      setPackages(mockPackages);
    } catch (error) {
      console.error('패키지 목록 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">투어 패키지</h1>
              <p className="text-gray-600">다양한 투어 패키지를 확인하고 예약하세요</p>
            </div>
            <Link
              href="/customer"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ← 고객센터로 돌아가기
            </Link>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                <div className="w-full h-48 bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-500">패키지 이미지</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{pkg.name}</h3>
                <p className="text-gray-600 mb-4">{pkg.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    {pkg.price.toLocaleString()}원
                  </span>
                  <span className="text-sm text-gray-500">{pkg.duration}</span>
                </div>
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">포함 사항</h4>
                  <div className="space-y-1">
                    {pkg.includes.map((item, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <Link
                  href={`/customer/booking?packageId=${pkg.id}`}
                  className={`w-full block text-center py-2 px-4 rounded-lg font-medium transition-colors ${
                    pkg.available
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {pkg.available ? '패키지 예약하기' : '예약 불가'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
