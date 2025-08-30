'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Customer {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  totalBookings: number;
  totalSpent: number;
  averageSpent: number;
  lastBookingDate: string;
  shoppingMall: string;
  recentBookings: Array<{
    id: string;
    checkInDate: string;
    checkOutDate: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
  createdAt: string;
}

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mallFilter, setMallFilter] = useState('ALL');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'totalBookings' | 'totalSpent' | 'lastBookingDate'>('totalBookings');

  // 쇼핑몰 목록
  const SHOPPING_MALLS = [
    '직접 예약', '카페24', '고도몰', '아임웹', '스마트스토어', '쿠팡', '11번가', 'G마켓', 
    '옥션', '티몬', '위메프', '네이버쇼핑', '다나와', '쿠팡플레이', 
    'SSG.COM', '롯데온', '신세계몰', '현대몰', '하이마트', '이마트몰', '홈플러스', '기타'
  ];

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterAndSortCustomers();
  }, [customers, searchTerm, mallFilter, sortBy]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/customers');
      if (!response.ok) {
        throw new Error('고객 데이터를 불러오는데 실패했습니다.');
      }
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('고객 데이터 로딩 실패:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCustomers = () => {
    let filtered = [...customers];

    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.guestEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.guestPhone.includes(searchTerm)
      );
    }

    // 쇼핑몰 필터
    if (mallFilter !== 'ALL') {
      filtered = filtered.filter(customer => customer.shoppingMall === mallFilter);
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'totalBookings':
          return b.totalBookings - a.totalBookings;
        case 'totalSpent':
          return b.totalSpent - a.totalSpent;
        case 'lastBookingDate':
          return new Date(b.lastBookingDate).getTime() - new Date(a.lastBookingDate).getTime();
        default:
          return 0;
      }
    });

    setFilteredCustomers(filtered);
  };

  const toggleSelection = (customerId: string) => {
    setSelectedCustomers(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const toggleAllSelection = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.id));
    }
  };

  const exportToExcel = () => {
    // 엑셀 내보내기 기능
    console.log('엑셀 내보내기:', selectedCustomers);
    alert('엑셀 내보내기 기능은 준비 중입니다.');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">고객 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">오류 발생</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchCustomers}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent mb-2">
                고객 관리 (ERP)
              </h1>
              <p className="text-gray-600 text-lg">고객 정보를 관리하고 분석하세요</p>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/reservations" className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                예약 관리
              </Link>
              <Link href="/admin/rooms" className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                객실 관리
              </Link>
            </div>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
            <div className="text-2xl font-bold text-blue-600">{customers.length}</div>
            <div className="text-gray-600">전체 고객</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
            <div className="text-2xl font-bold text-green-600">
              {customers.filter(c => c.totalBookings > 1).length}
            </div>
            <div className="text-gray-600">재방문 고객</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
            <div className="text-2xl font-bold text-purple-600">
              {customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}원
            </div>
            <div className="text-gray-600">총 매출</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
            <div className="text-2xl font-bold text-orange-600">
              {customers.length > 0 ? Math.round(customers.reduce((sum, c) => sum + c.averageSpent, 0) / customers.length).toLocaleString() : 0}원
            </div>
            <div className="text-gray-600">평균 결제액</div>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="고객명, 이메일, 전화번호 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={mallFilter}
                onChange={(e) => setMallFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">전체 쇼핑몰</option>
                {SHOPPING_MALLS.map(mall => (
                  <option key={mall} value={mall}>{mall}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="totalBookings">예약 횟수순</option>
                <option value="totalSpent">총 결제액순</option>
                <option value="lastBookingDate">최근 예약순</option>
              </select>
            </div>
            <button
              onClick={exportToExcel}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300"
            >
              엑셀 내보내기
            </button>
          </div>
        </div>

        {/* 고객 목록 */}
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20">
          <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            고객 목록 ({filteredCustomers.length}명)
          </h2>
          
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">고객이 없습니다</h3>
              <p className="text-gray-500">검색 조건을 변경하거나 새로운 예약을 생성해보세요.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                        onChange={toggleAllSelection}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="p-4 font-semibold text-gray-700">고객명</th>
                    <th className="p-4 font-semibold text-gray-700">연락처</th>
                    <th className="p-4 font-semibold text-gray-700">예약 횟수</th>
                    <th className="p-4 font-semibold text-gray-700">총 결제액</th>
                    <th className="p-4 font-semibold text-gray-700">평균 결제액</th>
                    <th className="p-4 font-semibold text-gray-700">마지막 예약</th>
                    <th className="p-4 font-semibold text-gray-700">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCustomers.map(customer => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedCustomers.includes(customer.id)}
                          onChange={() => toggleSelection(customer.id)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-gray-900">{customer.guestName}</div>
                          <div className="text-sm text-gray-500">{customer.guestEmail}</div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-700">{customer.guestPhone}</td>
                      <td className="p-4 font-medium text-gray-900">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {customer.totalBookings}회
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-gray-900">{customer.totalSpent.toLocaleString()}원</td>
                      <td className="p-4 text-gray-700">{customer.averageSpent.toLocaleString()}원</td>
                      <td className="p-4 text-gray-700">
                        {customer.lastBookingDate ? new Date(customer.lastBookingDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4">
                        <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200">
                          상세보기
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 