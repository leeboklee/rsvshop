'use client';

import React from 'react';
import { calculateBookingPrices, formatCurrency, formatPercentage } from '@/app/lib/calculations';

interface PriceInfoCardProps {
  booking: {
    sellingPrice?: number;
    supplyPrice?: number;
    profit?: number;
    vatAmount?: number;
    vatRate?: number;
    commission?: number;
    commissionRate?: number;
    totalAmount?: number;
  };
  className?: string;
}

export default function PriceInfoCard({ booking, className = '' }: PriceInfoCardProps) {
  const priceInfo = calculateBookingPrices(booking);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">가격 정보</h3>
      
      {/* 수수료 정보 */}
      <div className="bg-blue-50 rounded-lg p-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-blue-700 font-medium">수수료 정보</span>
          <span className="text-blue-900 font-bold">
            {formatCurrency(priceInfo.commission)} ({formatPercentage(priceInfo.commissionRate)})
          </span>
        </div>
      </div>

      {/* 가격 상세 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">판매가</label>
          <div className="bg-gray-50 rounded-md px-3 py-2 text-gray-900 font-medium">
            {formatCurrency(priceInfo.sellingPrice)}원
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">공급가</label>
          <div className="bg-gray-50 rounded-md px-3 py-2 text-gray-900 font-medium">
            {formatCurrency(priceInfo.supplyPrice)}원
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">수익</label>
          <div className={`rounded-md px-3 py-2 font-medium ${
            priceInfo.profit > 0 
              ? 'bg-green-50 text-green-900' 
              : 'bg-red-50 text-red-900'
          }`}>
            {formatCurrency(priceInfo.profit)}원
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">부가세</label>
          <div className="bg-purple-50 rounded-md px-3 py-2 text-purple-900 font-medium">
            {formatCurrency(priceInfo.vatAmount)}원 ({formatPercentage(priceInfo.vatRate)})
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">수수료</label>
          <div className="bg-blue-50 rounded-md px-3 py-2 text-blue-900 font-medium">
            {formatCurrency(priceInfo.commission)}원
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">순수익</label>
          <div className={`rounded-md px-3 py-2 font-medium ${
            priceInfo.netAmount > 0 
              ? 'bg-emerald-50 text-emerald-900' 
              : 'bg-red-50 text-red-900'
          }`}>
            {formatCurrency(priceInfo.netAmount)}원
          </div>
        </div>
      </div>

      {/* 수익률 정보 */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">수익률:</span>
            <span className={`ml-2 font-medium ${
              priceInfo.profit > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {((priceInfo.profit / priceInfo.sellingPrice) * 100).toFixed(1)}%
            </span>
          </div>
          <div>
            <span className="text-gray-600">ROI:</span>
            <span className={`ml-2 font-medium ${
              priceInfo.profit > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {priceInfo.supplyPrice > 0 
                ? ((priceInfo.profit / priceInfo.supplyPrice) * 100).toFixed(1)
                : 0
              }%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
