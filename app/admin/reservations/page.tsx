"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';

// 분리된 컴포넌트들 import (지연 로딩으로 성능 향상)
import dynamic from 'next/dynamic';
import LoadingSpinner from './components/LoadingSpinner';
import SkeletonLoader from './components/SkeletonLoader';

// 지연 로딩 컴포넌트들
const PackageItem = dynamic(() => import('./components/PackageItem'), { 
  loading: () => <div className="h-20 bg-gray-100 rounded animate-pulse" />,
  ssr: false 
});
const StatsCard = dynamic(() => import('./components/StatsCard'), { 
  loading: () => <div className="h-24 bg-gray-100 rounded animate-pulse" />,
  ssr: false 
});
const ReservationModal = dynamic(() => import('./components/ReservationModal'), { 
  loading: () => <div className="h-32 bg-gray-100 rounded animate-pulse" />,
  ssr: false 
});

// 커스텀 훅 import
import { useReservations } from './hooks/useReservations';
import ConsoleLogger from '@/app/components/ConsoleLogger';

export default function ManageReservations() {
  // 성능 모니터링
  useEffect(() => {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      console.log(`🏃‍♂️ 예약 관리 페이지 로딩 시간: ${(endTime - startTime).toFixed(2)}ms`);
    };
  }, []);

  // 커스텀 훅 사용
  const {
    bookings,
    rooms,
    packages,
    shoppingMalls,
    isLoading,
    isSubmitting,
    error,
    roomAvailability,
    customerSuggestions,
    showCustomerSuggestions,
    newBooking,
    totalPrice,
    fetchData,
    setError,
    setShowCustomerSuggestions,
    handleCustomerNameChange,
    selectCustomerSuggestion,
    handleInputChange,
    handlePackageChange,
    handleSubmit,
    updateBookingStatus,
    handleShoppingMallChange
  } = useReservations();

  // 로컬 상태
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [checkInDateFilter, setCheckInDateFilter] = useState('');
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);
  
  // DB 상태 관리
  const [dbStatus, setDbStatus] = useState({
    connected: false,
    dbType: 'postgresql' as 'postgresql',
    lastChecked: new Date()
  });
  const [prismaStatus, setPrismaStatus] = useState({
    connected: false,
    lastChecked: new Date()
  });
  const [showDbSelector, setShowDbSelector] = useState(false);

  // DB 상태 확인
  const checkDbStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/health/db');
      if (response.ok) {
        const data = await response.json();
        setDbStatus({
          connected: true,
          dbType: 'postgresql',
          lastChecked: new Date()
        });
      } else {
        setDbStatus({
          connected: false,
          dbType: 'postgresql',
          lastChecked: new Date()
        });
      }
    } catch (error) {
      setDbStatus({
        connected: false,
        dbType: 'postgresql',
        lastChecked: new Date()
      });
    }
  }, []);

  // Prisma 상태 확인
  const checkPrismaStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/health/prisma');
      if (response.ok) {
        const data = await response.json();
        setPrismaStatus({
          connected: data.success || false,
          lastChecked: new Date()
        });
      } else {
        setPrismaStatus({
          connected: false,
          lastChecked: new Date()
        });
      }
    } catch (error) {
      setPrismaStatus({
        connected: false,
        lastChecked: new Date()
      });
    }
  }, []);

  const switchDatabase = useCallback(async (targetDb: 'postgresql') => {
    try {
      setDbStatus(prev => ({
        ...prev,
        dbType: targetDb,
        connected: false,
        lastChecked: new Date()
      }));
      
      const response = await fetch('/api/health/db/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetDb })
      });
      
      if (response.ok) {
        const result = await response.json();
        setDbStatus({
          connected: true,
          dbType: result.dbType || targetDb,
          lastChecked: new Date()
        });
        setShowDbSelector(false);
        
        sessionStorage.removeItem('admin-reservations-cache');
        
        setTimeout(() => {
          fetchData();
        }, 1000);
      } else {
        checkDbStatus();
      }
    } catch (error) {
      console.error('DB 전환 실패:', error);
      checkDbStatus();
    }
  }, [checkDbStatus, fetchData]);

  useEffect(() => {
    fetchData();
    checkDbStatus();
    checkPrismaStatus();
  }, [fetchData, checkDbStatus, checkPrismaStatus]);

  // 디바운스된 검색
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setSearchTerm(term);
    }, 300),
    []
  );

  // 디바운스 cleanup
  useEffect(() => {
    const debouncedFn = debouncedSearch as any;
    return () => {
      if (debouncedFn.cancel) {
        debouncedFn.cancel();
      }
    };
  }, [debouncedSearch]);

  // 성능 최적화: 메모이제이션된 필터링
  const filteredBookings = useMemo(() => {
    let filtered = [...bookings];

    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.guestEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.room.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    if (dateFilter !== 'ALL') {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      filtered = filtered.filter(booking => {
        const checkIn = new Date(booking.checkInDate);
        switch (dateFilter) {
          case 'TODAY':
            return checkIn.toDateString() === today.toDateString();
          case 'TOMORROW':
            return checkIn.toDateString() === tomorrow.toDateString();
          case 'THIS_WEEK':
            return checkIn >= today && checkIn <= nextWeek;
          case 'THIS_MONTH':
            return checkIn >= today && checkIn <= nextMonth;
          default:
            return true;
        }
      });
    }

    if (checkInDateFilter) {
      const filterDate = new Date(checkInDateFilter);
      filtered = filtered.filter(booking => new Date(booking.checkInDate).toDateString() === filterDate.toDateString());
    }

    return filtered;
  }, [bookings, searchTerm, statusFilter, dateFilter, checkInDateFilter]);

  // 디바운스 함수
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // 메모이제이션된 통계 계산
  const stats = useMemo(() => {
    const total = filteredBookings.length;
    const confirmed = filteredBookings.filter(b => b.status === 'CONFIRMED').length;
    const pending = filteredBookings.filter(b => b.status === 'PENDING').length;
    const cancelled = filteredBookings.filter(b => b.status === 'CANCELLED').length;
    const totalRevenue = filteredBookings.reduce((sum, b) => sum + b.totalAmount, 0);

    return {
      total,
      confirmed,
      pending,
      cancelled,
      totalRevenue
    };
  }, [filteredBookings]);

  // 일괄 작업 함수들
  const bulkUpdateStatus = async (status: string) => {
    try {
      const response = await fetch('/api/admin/reservations/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingIds: selectedBookings, status })
      });

      if (response.ok) {
        const updatedBookings = await response.json();
        // 상태 업데이트는 useReservations 훅에서 처리
        setSelectedBookings([]);
        // 데이터 새로고침
        fetchData();
      }
    } catch (error) {
      console.error('일괄 업데이트 오류:', error);
    }
  };

  const toggleSelection = (bookingId: string) => {
    setSelectedBookings(prev => 
      prev.includes(bookingId) 
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const toggleAllSelection = () => {
    setSelectedBookings(prev => 
      prev.length === filteredBookings.length 
        ? [] 
        : filteredBookings.map(b => b.id)
    );
  };

  // 검색 및 필터링 처리
  const handleSearch = useCallback(() => {
    console.log('🔍 검색 실행:', { searchTerm, statusFilter, dateFilter, checkInDateFilter });
    // 검색 조건이 변경되면 데이터를 새로고침
    fetchData();
  }, [searchTerm, statusFilter, dateFilter, checkInDateFilter, fetchData]);

  // 엑셀 내보내기 (동적 import로 서버 번들링 회피)
  const exportToExcel = async () => {
    const data = filteredBookings.map(booking => ({
      '예약 ID': booking.id,
      '고객명': booking.guestName,
      '이메일': booking.guestEmail,
      '연락처': booking.guestPhone,
      '객실': booking.room.name,
      '체크인': new Date(booking.checkInDate).toLocaleDateString(),
      '체크아웃': new Date(booking.checkOutDate).toLocaleDateString(),
      '상태': booking.status,
      '총액': booking.totalAmount.toLocaleString() + '원',
      '생성일': new Date(booking.createdAt).toLocaleDateString()
    }));

    const xlsx = await import('xlsx');
    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, '예약목록');
    xlsx.writeFile(wb, `예약목록_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // 모달 제출 핸들러
  const handleModalSubmit = async (e: React.FormEvent) => {
    const success = await handleSubmit(e);
    if (success) {
      setIsReservationModalOpen(false);
    }
  };

  // 상세보기 열기
  const openDetail = async (bookingId: string) => {
    try {
      console.log('상세보기 열기 시작:', bookingId);
      setSelectedBookingId(bookingId);
      
      const res = await fetch(`/api/admin/reservations/${bookingId}`, { cache: 'no-store' });
      console.log('API 응답 상태:', res.status, res.ok);
      
      if (res.ok) {
        const data = await res.json();
        console.log('받은 데이터:', data);
        
        // 데이터 매핑 및 기본값 설정
        const mappedDetail = {
          id: data.id,
          guestName: data.guestName || '',
          guestEmail: data.guestEmail || '',
          guestPhone: data.guestPhone || '',
          roomId: data.roomId || '',
          checkInDate: data.checkInDate ? new Date(data.checkInDate).toISOString().split('T')[0] : '',
          checkOutDate: data.checkOutDate ? new Date(data.checkOutDate).toISOString().split('T')[0] : '',
          selectedPackages: data.bookingItems?.map((item: any) => item.packageId) || [],
          specialRequests: data.notes || '',
          status: data.status || 'RECEIVED',
          shoppingMall: data.shoppingMall || '',
          orderNumber: data.orderNumber || '',
          externalId: data.externalId || '',
          sellingPrice: data.sellingPrice || 0,
          depositAmount: data.depositAmount || 0,
          supplyPrice: data.supplyPrice || 0,
          totalAmount: data.totalAmount || 0,
          // 추가 필드들
          room: data.room,
          items: data.items || [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        };
        
        setDetail(mappedDetail);
        setIsDetailOpen(true);
      } else {
        // 실패 응답 본문 파싱 시도 (JSON -> TEXT 순서)
        let errorPayload: any = null;
        let rawText: string | null = null;
        try {
          errorPayload = await res.json();
        } catch (_jsonErr) {
          try {
            rawText = await res.text();
            errorPayload = { error: rawText };
          } catch (_textErr) {
            errorPayload = { error: '응답 본문 없음' };
          }
        }
        console.error('API 오류 세부:', { id: bookingId, status: res.status, statusText: res.statusText, body: errorPayload });
        const readable = typeof errorPayload === 'string' ? errorPayload : (errorPayload?.error || JSON.stringify(errorPayload));
        alert(`상세 정보를 불러오지 못했습니다 (ID ${bookingId}, HTTP ${res.status} ${res.statusText}): ${readable}`);
      }
    } catch (e) {
      console.error('상세보기 로딩 오류:', e);
      alert('상세 정보 로딩 중 오류가 발생했습니다.');
    }
  };

  const updateDetailStatus = async (status: string) => {
    if (!selectedBookingId) return;
    try {
      const res = await fetch(`/api/admin/reservations/${selectedBookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updated = await res.json();
        setDetail(updated);
        // 목록 동기화
        fetchData();
      }
    } catch {}
  };

  const deleteBooking = async () => {
    if (!selectedBookingId) return;
    if (!confirm('이 예약을 삭제할까요?')) return;
    try {
      const res = await fetch(`/api/admin/reservations/${selectedBookingId}`, { method: 'DELETE' });
      if (res.ok) {
        setIsDetailOpen(false);
        setDetail(null);
        setSelectedBookingId(null);
        fetchData();
      } else {
        alert('삭제 실패');
      }
    } catch {
      alert('삭제 중 오류');
    }
  };

  return (
    <>
      <ConsoleLogger isActive={true} />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">예약 관리</h1>
            <p className="text-gray-600">예약을 생성, 수정, 관리할 수 있습니다.</p>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
            <button
              onClick={() => setIsReservationModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              신규 예약 추가
            </button>
            <button
              onClick={exportToExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              엑셀 내보내기
            </button>
            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/admin/reservations/test-data', { method: 'POST' });
                  const data = await response.json();
                  if (data.success) {
                    alert('테스트 예약 데이터가 생성되었습니다!');
                    fetchData();
                  } else {
                    alert(data.message);
                  }
                } catch (error) {
                  alert('테스트 데이터 생성 중 오류가 발생했습니다.');
                }
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              🧪 테스트 데이터 생성
            </button>
          </div>
        </div>

        {/* 로딩 상태 */}
        {isLoading && <SkeletonLoader />}

        {/* 오류 상태 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-600 mr-2">⚠️</div>
              <span className="text-red-800">{error}</span>
              <button 
                onClick={() => {
                  setError(null);
                  fetchData();
                }}
                className="ml-auto text-red-600 hover:text-red-800 underline"
              >
                재시도
              </button>
            </div>
          </div>
        )}

        {/* 데이터가 로드된 경우에만 표시 */}
        {!isLoading && !error && (
          <>
            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-6 mb-8">
              <StatsCard title="전체 예약" value={stats.total} color="border-blue-500" />
              <StatsCard title="확정" value={stats.confirmed} color="border-emerald-500" />
              <StatsCard title="대기" value={stats.pending} color="border-amber-500" />
              <StatsCard title="취소" value={stats.cancelled} color="border-red-500" />
              <StatsCard title="총 매출(원)" value={stats.totalRevenue.toLocaleString()} color="border-purple-500" />
              <div className={`p-6 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-all duration-300 cursor-pointer ${
                dbStatus.connected 
                  ? 'bg-gradient-to-br from-green-500 to-green-600' 
                  : 'bg-gradient-to-br from-red-500 to-red-600'
              }`} onClick={() => setShowDbSelector(!showDbSelector)}>
                <div className="text-3xl font-bold mb-1">
                  {dbStatus.connected ? '✓' : '✗'}
                </div>
                <div className="text-sm font-medium">
                  DB: PostgreSQL
                </div>
                <div className="text-xs opacity-75">
                  {dbStatus.connected ? '연결됨' : '연결 실패'}
                </div>
              </div>
              <div className={`p-6 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-all duration-300 cursor-pointer ${
                prismaStatus.connected 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                  : 'bg-gradient-to-br from-red-500 to-red-600'
              }`} onClick={() => setShowDbSelector(!showDbSelector)}>
                <div className="text-3xl font-bold mb-1">
                  {prismaStatus.connected ? '✓' : '✗'}
                </div>
                <div className="text-sm font-medium">
                  Prisma ORM
                </div>
                <div className="text-xs opacity-75">
                  {prismaStatus.connected ? '연결됨' : '연결 실패'}
                </div>
              </div>
            </div>

            {/* DB 선택기 */}
            {showDbSelector && (
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl mb-8 border border-white/20">
                <h3 className="text-xl font-bold mb-4 text-gray-800">데이터베이스 상태</h3>
                <div className="p-4 rounded-xl border-2 border-blue-500 bg-blue-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                    <div>
                      <div className="font-bold text-gray-800">PostgreSQL</div>
                      <div className="text-sm text-gray-600">고성능 관계형 데이터베이스</div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  현재 연결: <span className="font-semibold">POSTGRESQL</span>
                  {dbStatus.connected ? ' (정상)' : ' (오류)'}
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    SQLite는 더 이상 지원되지 않습니다. PostgreSQL을 사용하여 안정적인 데이터베이스 환경을 제공합니다.
                  </p>
                </div>
              </div>
            )}

            {/* 검색 및 필터 */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl mb-8 border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="고객명, 이메일, 객실명 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  />
                </div>
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  >
                    <option value="ALL">전체 상태</option>
                    <option value="CONFIRMED">확정</option>
                    <option value="PENDING">대기</option>
                    <option value="CANCELLED">취소</option>
                  </select>
                </div>
                <div>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  >
                    <option value="ALL">전체 기간</option>
                    <option value="TODAY">오늘</option>
                    <option value="TOMORROW">내일</option>
                    <option value="THIS_WEEK">이번 주</option>
                    <option value="THIS_MONTH">이번 달</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">체크인 날짜</label>
                  <input
                    type="date"
                    placeholder="체크인 날짜로 조회"
                    value={checkInDateFilter}
                    onChange={(e) => setCheckInDateFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchData({ force: true, search: searchTerm, status: statusFilter === 'ALL' ? '' : statusFilter, page: 1, limit: 20 })}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
                  >
                    🔍 조회
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    엑셀 내보내기
                  </button>
                </div>
              </div>
            </div>

            {/* 일괄 작업 */}
            {selectedBookings.length > 0 && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200 mb-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-amber-800 font-medium">{selectedBookings.length}개 예약 선택됨</span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => bulkUpdateStatus('CONFIRMED')}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-md"
                    >
                      확정
                    </button>
                    <button
                      onClick={() => bulkUpdateStatus('CANCELLED')}
                      className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md"
                    >
                      취소
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 예약 목록 */}
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20">
              <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                예약 목록 ({filteredBookings.length}개)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedBookings.length === filteredBookings.length && filteredBookings.length > 0}
                          onChange={toggleAllSelection}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </th>
                      <th className="p-4 font-semibold text-gray-700">고객명</th>
                      <th className="p-4 font-semibold text-gray-700">객실</th>
                      <th className="p-4 font-semibold text-gray-700">체크인</th>
                      <th className="p-4 font-semibold text-gray-700">체크아웃</th>
                      <th className="p-4 font-semibold text-gray-700">상태</th>
                      <th className="p-4 font-semibold text-gray-700">총액</th>
                      <th className="p-4 font-semibold text-gray-700">쇼핑몰</th>
                      <th className="p-4 font-semibold text-gray-700">주문번호</th>
                      <th className="p-4 font-semibold text-gray-700">작업</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredBookings.map(booking => (
                      <tr key={booking.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedBookings.includes(booking.id)}
                            onChange={() => toggleSelection(booking.id)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-gray-900">{booking.guestName}</div>
                            <div className="text-sm text-gray-500">{booking.guestEmail}</div>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-gray-900">{booking.room?.name || '객실 미지정'}</td>
                        <td className="p-4 text-gray-700">{new Date(booking.checkInDate).toLocaleDateString()}</td>
                        <td className="p-4 text-gray-700">{new Date(booking.checkOutDate).toLocaleDateString()}</td>
                        <td className="p-4">
                          <select
                            value={booking.status}
                            onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          >
                            <option value="CONFIRMED">확정</option>
                            <option value="PENDING">대기</option>
                            <option value="CANCELLED">취소</option>
                          </select>
                        </td>
                        <td className="p-4 font-semibold text-gray-900">{booking.totalAmount?.toLocaleString() || '0'}원</td>
                        <td className="p-4">{booking.shoppingMall || 'N/A'}</td>
                        <td className="p-4 text-sm text-gray-600">{booking.orderNumber || 'N/A'}</td>
                        <td className="p-4">
                          <button onClick={() => openDetail(booking.id)} className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200">상세보기</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 신규 예약 추가 모달 */}
      <ReservationModal
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        rooms={rooms}
        packages={packages}
        shoppingMalls={shoppingMalls}
        onSubmit={handleModalSubmit}
        newBooking={newBooking}
        handleInputChange={handleInputChange}
        handleCustomerNameChange={handleCustomerNameChange}
        customerSuggestions={customerSuggestions}
        showCustomerSuggestions={showCustomerSuggestions}
        selectCustomerSuggestion={selectCustomerSuggestion}
        roomAvailability={roomAvailability}
        totalPrice={totalPrice}
        isSubmitting={isSubmitting}
        handlePackageChange={handlePackageChange}
        handleShoppingMallChange={handleShoppingMallChange}
      />

      {/* 상세보기 모달 - ReservationModal 재사용 */}
      {isDetailOpen && detail && (
        <ReservationModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          rooms={rooms}
          packages={packages}
          shoppingMalls={shoppingMalls}
          onSubmit={async (e) => {
            e.preventDefault();
            if(!selectedBookingId) return;
            
            try {
              const body: any = {
                guestName: detail.guestName,
                guestPhone: detail.guestPhone,
                guestEmail: detail.guestEmail,
                orderNumber: detail.orderNumber || null,
                shoppingMall: detail.shoppingMall || null,
                sellingPrice: detail.sellingPrice ?? null,
                depositAmount: detail.depositAmount ?? null,
                supplyPrice: detail.supplyPrice ?? null,
                status: detail.status
              };
              
              if (detail.checkInDate) body.checkInDate = detail.checkInDate;
              if (detail.checkOutDate) body.checkOutDate = detail.checkOutDate;
              
              const res = await fetch(`/api/admin/reservations/${selectedBookingId}`, {
                method: 'PATCH', 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify(body)
              });
              
              if(res.ok){
                const updated = await res.json();
                setDetail(updated);
                fetchData();
                alert('저장되었습니다.');
                setIsDetailOpen(false);
              } else {
                const err = await res.json().catch(()=>({error:'오류'}));
                alert('저장 실패: ' + (err.error || res.status));
              }
            } catch (error) {
              alert('저장 중 오류가 발생했습니다.');
            }
          }}
          newBooking={detail}
          handleInputChange={(e) => {
            const { name, value } = e.target;
            setDetail(prev => ({ ...prev, [name]: value }));
          }}
          handleCustomerNameChange={(value) => setDetail(prev => ({ ...prev, customerName: value }))}
          customerSuggestions={[]}
          showCustomerSuggestions={false}
          selectCustomerSuggestion={() => {}}
          roomAvailability={{}}
          totalPrice={detail.totalAmount || 0}
          isSubmitting={false}
          handlePackageChange={() => {}}
          handleShoppingMallChange={(mall) => {
            setDetail(prev => ({ ...prev, shoppingMall: mall }));
            // 가격 자동 계산 로직 추가
            if (mall && detail.totalAmount) {
              const shoppingMall = shoppingMalls.find(m => m.name === mall);
              if (shoppingMall) {
                const commissionRate = shoppingMall.commissionRate / 100;
                const depositRate = 1 - commissionRate;
                const supplyRate = 0.75;
                
                setDetail(prev => ({
                  ...prev,
                  sellingPrice: detail.totalAmount,
                  depositAmount: Math.round(detail.totalAmount * depositRate),
                  supplyPrice: Math.round(detail.totalAmount * supplyRate)
                }));
              }
            }
          }}
          isEditMode={true}
        />
      )}
    </div>
    </>
  );
}
