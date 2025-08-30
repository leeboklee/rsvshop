'use client';

import React from 'react';
import Link from 'next/link';
import HotelManagement from '../sections/HotelManagement';

export default function HotelManagementPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">호텔 관리</h1>
              <p className="text-gray-600">호텔 정보를 등록, 수정, 삭제할 수 있습니다</p>
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
        <HotelManagement />
      </main>
    </div>
  );
}
