'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Payment {
  id: string;
  bookingId: string;
  customerName: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
}

export default function HotelPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      // 샘플 결제 데이터
      const mockPayments: Payment[] = [
        {
          id: '1',
          bookingId: 'BK001',
          customerName: '김철수',
          amount: 150000,
          status: 'completed',
          paymentMethod: '신용카드',
          createdAt: '2024-01-25 14:30',
          updatedAt: '2024-01-25 14:35',
          roomType: '디럭스 더블',
          checkIn: '2024-01-26',
          checkOut: '2024-01-28'
        },
        {
          id: '2',
          bookingId: 'BK002',
          customerName: '이영희',
          amount: 200000,
          status: 'pending',
          paymentMethod: '계좌이체',
          createdAt: '2024-01-25 15:20',
          updatedAt: '2024-01-25 15:20',
          roomType: '스위트',
          checkIn: '2024-01-27',
          checkOut: '2024-01-29'
        },
        {
          id: '3',
          bookingId: 'BK003',
          customerName: '박민수',
          amount: 120000,
          status: 'completed',
          paymentMethod: '신용카드',
          createdAt: '2024-01-25 16:10',
          updatedAt: '2024-01-25 16:15',
          roomType: '스탠다드',
          checkIn: '2024-01-26',
          checkOut: '2024-01-27'
        },
        {
          id: '4',
          bookingId: 'BK004',
          customerName: '최지영',
          amount: 180000,
          status: 'refunded',
          paymentMethod: '신용카드',
          createdAt: '2024-01-25 17:00',
          updatedAt: '2024-01-25 18:30',
          roomType: '디럭스 트윈',
          checkIn: '2024-01-28',
          checkOut: '2024-01-30'
        }
      ];
      setPayments(mockPayments);
    } catch (error) {
      console.error('결제 데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: '대기중', className: 'bg-yellow-100 text-yellow-800' },
      completed: { label: '완료', className: 'bg-green-100 text-green-800' },
      failed: { label: '실패', className: 'bg-red-100 text-red-800' },
      refunded: { label: '환불', className: 'bg-gray-100 text-gray-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const filteredPayments = payments.filter(payment => {
    const matchesFilter = filter === 'all' || payment.status === filter;
    const matchesSearch = payment.customerName.includes(searchTerm) || 
                         payment.bookingId.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const getTotalAmount = (status?: string) => {
    const targetPayments = status ? payments.filter(p => p.status === status) : payments;
    return targetPayments.reduce((sum, p) => sum + p.amount, 0);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">💳 결제 관리</h1>
              <p className="text-gray-600 mt-2">호텔 예약 결제 현황 및 관리</p>
            </div>
            <Link
              href="/hotel-admin"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← 대시보드로
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 결제액</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(getTotalAmount() / 10000)}만원
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">완료된 결제</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(getTotalAmount('completed') / 10000)}만원
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">대기중</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(getTotalAmount('pending') / 10000)}만원
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-2xl">↩️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">환불액</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(getTotalAmount('refunded') / 10000)}만원
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 필터 및 검색 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="고객명 또는 예약번호로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'pending' 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                대기중
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'completed' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                완료
              </button>
              <button
                onClick={() => setFilter('refunded')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'refunded' 
                    ? 'bg-gray-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                환불
              </button>
            </div>
          </div>
        </div>

        {/* 결제 목록 테이블 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    예약 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    고객명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    결제금액
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    결제수단
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    결제일시
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{payment.bookingId}</div>
                        <div className="text-gray-500">{payment.roomType}</div>
                        <div className="text-xs text-gray-400">
                          {payment.checkIn} ~ {payment.checkOut}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.amount.toLocaleString()}원
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.createdAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded-md border border-blue-200 hover:bg-blue-50 transition-colors">
                          상세
                        </button>
                        {payment.status === 'pending' && (
                          <button className="text-green-600 hover:text-green-900 px-3 py-1 rounded-md border border-green-200 hover:bg-green-50 transition-colors">
                            승인
                          </button>
                        )}
                        {payment.status === 'completed' && (
                          <button className="text-red-600 hover:text-red-900 px-3 py-1 rounded-md border border-red-200 hover:bg-red-50 transition-colors">
                            환불
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 결제가 없을 때 */}
        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">💳</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">결제 내역이 없습니다</h3>
            <p className="text-gray-500">검색 조건을 변경하거나 다른 필터를 시도해보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
