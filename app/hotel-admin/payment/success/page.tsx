'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">결제 성공!</h2>
          <p className="mt-2 text-sm text-gray-600">
            예약이 성공적으로 완료되었습니다.
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">예약 번호</span>
              <span className="font-medium">RSV-2024-001</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">결제 금액</span>
              <span className="font-medium text-green-600">150,000원</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">결제 방법</span>
              <span className="font-medium">신용카드</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">결제 시간</span>
              <span className="font-medium">{new Date().toLocaleString('ko-KR')}</span>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <Link
              href="/hotel-admin"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              호텔 관리자로 돌아가기
            </Link>
            <Link
              href="/customer"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              고객센터로 돌아가기
            </Link>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            결제 관련 문의사항이 있으시면 고객센터로 연락해 주세요.
          </p>
        </div>
      </div>
    </div>
  );
}
