'use client';

import React from 'react';
import Link from 'next/link';

export default function InventoryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">재고 관리</h1>
              <p className="text-gray-600">객실 수량, 예약 가능 여부를 관리합니다</p>
            </div>
            <Link
              href="/hotel-admin"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ← 호텔 관리자 대시보드
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">재고 관리 기능</h3>
          <p className="text-gray-600">객실 수량, 예약 가능 여부 관리 기능이 여기에 구현됩니다.</p>
        </div>
      </main>
    </div>
  );
}
