'use client';

import React from 'react';
import Link from 'next/link';
import SurchargeManagement from '../sections/SurchargeManagement';

export default function SurchargeManagementPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">추가요금 관리</h1>
              <p className="text-gray-600">날짜별 추가요금, 성수기/특별 요금을 관리합니다</p>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/admin"
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ← 관리자 대시보드
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SurchargeManagement />
      </main>
    </div>
  );
}
