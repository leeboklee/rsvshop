'use client';

import React, { useState, useEffect } from 'react';
import OptimizedLink from '../components/OptimizedLink';

interface HotelStats {
  totalRooms: number;
  availableRooms: number;
  totalBookings: number;
  todayBookings: number;
  monthlyRevenue: number;
}

interface PaymentStats {
  totalPayments: number;
  pendingPayments: number;
  completedPayments: number;
  refundedPayments: number;
  todayRevenue: number;
}

interface RoomInfo {
  id: string;
  roomNumber: string;
  type: string;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  floor: number;
  price: number;
  lastCleaned: string;
}

interface RecentActivity {
  id: string;
  type: 'booking' | 'payment' | 'checkin' | 'checkout' | 'maintenance';
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info';
}

export default function HotelAdminPage() {
  const [stats, setStats] = useState<HotelStats | null>(null);
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hydration 오류 방지를 위한 마운트 상태 관리
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 모든 데이터를 병렬로 로드
        await Promise.all([
          loadHotelStats(),
          loadPaymentStats(),
          loadRoomData(),
          loadRecentActivities()
        ]);
      } catch (err) {
        setError('데이터 로딩 중 오류가 발생했습니다.');
        console.error('초기화 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [mounted]);

  const loadHotelStats = async () => {
    try {
      const mockStats: HotelStats = {
        totalRooms: 150,
        availableRooms: 45,
        totalBookings: 89,
        todayBookings: 12,
        monthlyRevenue: 45000000
      };
      setStats(mockStats);
    } catch (error) {
      console.error('호텔 통계 로딩 실패:', error);
      throw error;
    }
  };

  const loadPaymentStats = async () => {
    try {
      const mockPaymentStats: PaymentStats = {
        totalPayments: 156,
        pendingPayments: 8,
        completedPayments: 142,
        refundedPayments: 6,
        todayRevenue: 2800000
      };
      setPaymentStats(mockPaymentStats);
    } catch (error) {
      console.error('결제 통계 로딩 실패:', error);
      throw error;
    }
  };

  const loadRoomData = async () => {
    try {
      const mockRooms: RoomInfo[] = [
        { id: '1', roomNumber: '101', type: '스탠다드', status: 'available', floor: 1, price: 80000, lastCleaned: '2024-01-25' },
        { id: '2', roomNumber: '102', type: '스탠다드', status: 'occupied', floor: 1, price: 80000, lastCleaned: '2024-01-24' },
        { id: '3', roomNumber: '201', type: '디럭스', status: 'reserved', floor: 2, price: 120000, lastCleaned: '2024-01-25' },
        { id: '4', roomNumber: '202', type: '디럭스', status: 'maintenance', floor: 2, price: 120000, lastCleaned: '2024-01-23' },
        { id: '5', roomNumber: '301', type: '스위트', status: 'available', floor: 3, price: 200000, lastCleaned: '2024-01-25' },
        { id: '6', roomNumber: '302', type: '스위트', status: 'occupied', floor: 3, price: 200000, lastCleaned: '2024-01-24' }
      ];
      setRooms(mockRooms);
    } catch (error) {
      console.error('객실 데이터 로딩 실패:', error);
      throw error;
    }
  };

  const loadRecentActivities = async () => {
    try {
      const mockActivities: RecentActivity[] = [
        { id: '1', type: 'booking', description: '새로운 예약이 등록되었습니다 (객실 101)', timestamp: '2분 전', status: 'success' },
        { id: '2', type: 'payment', description: '결제가 완료되었습니다 (객실 201)', timestamp: '15분 전', status: 'success' },
        { id: '3', type: 'checkin', description: '체크인 완료 (객실 102)', timestamp: '1시간 전', status: 'info' },
        { id: '4', type: 'checkout', description: '체크아웃 완료 (객실 305)', timestamp: '2시간 전', status: 'info' },
        { id: '5', type: 'maintenance', description: '객실 202 정비 완료', timestamp: '3시간 전', status: 'warning' }
      ];
      setRecentActivities(mockActivities);
    } catch (error) {
      console.error('활동 데이터 로딩 실패:', error);
      throw error;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { label: '가용', className: 'bg-green-100 text-green-800' },
      occupied: { label: '사용중', className: 'bg-red-100 text-red-800' },
      reserved: { label: '예약됨', className: 'bg-blue-100 text-blue-800' },
      maintenance: { label: '정비중', className: 'bg-yellow-100 text-yellow-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.available;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getActivityIcon = (type: string) => {
    const icons = {
      booking: '📅',
      payment: '💳',
      checkin: '✅',
      checkout: '🚪',
      maintenance: '🔧'
    };
    return icons[type as keyof typeof icons] || '📋';
  };

  const getActivityStatusColor = (status: string) => {
    const colors = {
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  // 서버 사이드 렌더링 방지 - Hydration 오류 방지를 위해 더 간단한 구조 사용
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">페이지 로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 오류 상태
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">오류가 발생했습니다</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              페이지 새로고침
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 로딩 상태
  if (loading || !stats || !paymentStats) {
    return (
      <div className="min-h-screen bg-gray-50" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" suppressHydrationWarning>
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🏨 호텔 관리자 대시보드</h1>
              <p className="text-gray-600 mt-2">호텔 운영 및 결제 관리를 위한 통합 관리 시스템입니다</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">A-HOTEL</span>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                설정
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 통계 요약 테이블 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 animate-fade-in">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 호텔 운영 통계</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">구분</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">객실 현황</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">예약 현황</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">결제 현황</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">매출 현황</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="animate-slide-in" style={{ animationDelay: '0.1s' }}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">총계</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stats.totalRooms}실</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stats.totalBookings}건</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{paymentStats.totalPayments}건</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{Math.round(stats.monthlyRevenue / 10000)}만원</td>
                </tr>
                <tr className="animate-slide-in" style={{ animationDelay: '0.2s' }}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">가용/완료</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{stats.availableRooms}실</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{stats.todayBookings}건</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{paymentStats.completedPayments}건</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{Math.round(paymentStats.todayRevenue / 10000)}만원</td>
                </tr>
                <tr className="animate-slide-in" style={{ animationDelay: '0.3s' }}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">대기/처리중</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">{stats.totalRooms - stats.availableRooms}실</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">-</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">{paymentStats.pendingPayments}건</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 객실 현황 테이블 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">🛏️ 객실 현황</h2>
            <OptimizedLink
              href="/hotel-admin/rooms"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              전체 보기
            </OptimizedLink>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">객실번호</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">타입</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">층수</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가격</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">마지막 청소</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rooms.slice(0, 6).map((room) => (
                  <tr key={room.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {room.roomNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.floor}층</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {room.price.toLocaleString()}원
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(room.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.lastCleaned}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded-md border border-blue-200 hover:bg-blue-50 transition-colors">
                          상세
                        </button>
                        <button className="text-green-600 hover:text-green-900 px-3 py-1 rounded-md border border-green-200 hover:bg-green-50 transition-colors">
                          수정
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 최근 활동 테이블 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 최근 활동</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">활동</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">설명</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">시간</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentActivities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getActivityIcon(activity.type)}</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">{activity.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{activity.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.timestamp}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`w-3 h-3 rounded-full ${getActivityStatusColor(activity.status)}`}></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 빠른 작업 버튼 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <OptimizedLink
            href="/hotel-admin/rooms"
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 text-center hover-lift animate-scale-in"
          >
            <div className="text-3xl mb-2">🏨</div>
            <h3 className="font-semibold text-gray-900 mb-2">객실 관리</h3>
            <p className="text-sm text-gray-600">객실 정보 및 상태 관리</p>
          </OptimizedLink>

          <OptimizedLink
            href="/hotel-admin/bookings"
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 text-center hover-lift animate-scale-in"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="text-3xl mb-2">📅</div>
            <h3 className="font-semibold text-gray-900 mb-2">예약 관리</h3>
            <p className="text-sm text-gray-600">예약 현황 및 관리</p>
          </OptimizedLink>

          <OptimizedLink
            href="/hotel-admin/payments"
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 text-center hover-lift animate-scale-in"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="text-3xl mb-2">💳</div>
            <h3 className="font-semibold text-gray-900 mb-2">결제 관리</h3>
            <p className="text-sm text-gray-600">결제 내역 및 환불 처리</p>
          </OptimizedLink>

          <OptimizedLink
            href="/hotel-admin/reports"
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 text-center hover-lift animate-scale-in"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-semibold text-gray-900 mb-2">리포트</h3>
            <p className="text-sm text-gray-600">매출 및 운영 통계</p>
          </OptimizedLink>
        </div>
      </div>
    </div>
  );
}


