'use client';

import React from 'react';
import Link from 'next/link';
import { XCircleIcon } from '@heroicons/react/24/outline';

export default function PaymentFailPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <XCircleIcon className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">결제 실패</h2>
          <p className="mt-2 text-sm text-gray-600">
            결제 처리 중 오류가 발생했습니다.
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    결제 실패 사유
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>카드 잔액 부족</li>
                      <li>카드 유효기간 만료</li>
                      <li>잘못된 카드 정보</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600">
              <p>다시 시도하거나 다른 결제 방법을 선택해 주세요.</p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <Link
              href="/customer"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              다시 예약하기
            </Link>
            <Link
              href="/hotel-admin"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              호텔 관리자로 돌아가기
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
