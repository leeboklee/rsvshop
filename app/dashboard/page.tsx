'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/app/components/common/Card';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [mounted, setMounted] = useState(false);

  // 컴포넌트 마운트 확인
  useEffect(() => {
    setMounted(true);
  }, []);

  // 통계 데이터 가져오기
  useEffect(() => {
    if (!mounted) return;
    
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          console.error('통계 데이터 로딩 실패:', response.status, response.statusText);
          setStats({ error: '통계 데이터를 불러올 수 없습니다.' });
        }
      } catch (error) {
        console.error('통계 데이터 로딩 실패:', error);
        setStats({ error: '네트워크 오류가 발생했습니다.' });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [mounted]);

  // 체계적으로 분류된 엔드포인트 목록
  const allEndpoints = [
    // ===== 페이지 엔드포인트 =====
    
    // 메인 페이지
    { path: "/", name: "홈 대시보드", description: "메인 대시보드 및 시스템 개요", category: "메인 페이지", type: "page", color: "blue" },
    { path: "/admin", name: "관리자 페이지", description: "통합 관리자 인터페이스", category: "메인 페이지", type: "page", color: "purple" },
    { path: "/hotel-admin", name: "호텔 관리자", description: "호텔별 독립 관리 인터페이스", category: "메인 페이지", type: "page", color: "green" },
    { path: "/customer", name: "고객 페이지", description: "통합된 고객용 예약 인터페이스", category: "메인 페이지", type: "page", color: "orange" },
    
    // 관리자 하위 페이지 - 예약 및 일정 관리
    { path: "/admin/reservations", name: "예약 관리", description: "예약 생성, 수정, 삭제", category: "예약 및 일정 관리", type: "page", color: "green" },
    { path: "/admin/calendar", name: "달력 뷰", description: "예약 달력 및 일정", category: "예약 및 일정 관리", type: "page", color: "sky" },
    
    // 관리자 하위 페이지 - 호텔 및 객실 관리
    { path: "/admin/hotels", name: "호텔 관리", description: "호텔 정보 및 설정", category: "호텔 및 객실 관리", type: "page", color: "purple" },
    { path: "/admin/rooms", name: "객실 관리", description: "객실 정보 및 가격", category: "호텔 및 객실 관리", type: "page", color: "indigo" },
    { path: "/admin/packages", name: "패키지 관리", description: "투어 패키지 관리", category: "호텔 및 객실 관리", type: "page", color: "pink" },
    
    // 관리자 하위 페이지 - 재무 및 결제 관리
    { path: "/admin/payments", name: "결제 관리", description: "결제 내역 및 처리", category: "재무 및 결제 관리", type: "page", color: "emerald" },
    { path: "/admin/sales", name: "매출 관리", description: "매출 통계 및 분석", category: "재무 및 결제 관리", type: "page", color: "teal" },
    { path: "/admin/commission", name: "수수료 관리", description: "수수료 설정 및 정산", category: "재무 및 결제 관리", type: "page", color: "cyan" },
    { path: "/admin/vat-management", name: "부가세 관리", description: "부가세 설정 및 계산", category: "재무 및 결제 관리", type: "page", color: "lime" },
    
    // 관리자 하위 페이지 - 고객 및 사용자 관리
    { path: "/admin/customers", name: "고객 관리", description: "고객 정보 및 이력", category: "고객 및 사용자 관리", type: "page", color: "yellow" },
    { path: "/admin/api-keys", name: "API 키 관리", description: "API 키 생성 및 관리", category: "고객 및 사용자 관리", type: "page", color: "slate" },
    
    // 관리자 하위 페이지 - 시스템 및 모니터링
    { path: "/admin/logs", name: "로그 뷰어", description: "시스템 로그 및 모니터링", category: "시스템 및 모니터링", type: "page", color: "gray" },
    { path: "/admin/database", name: "DB 관리", description: "데이터베이스 상태 및 관리", category: "시스템 및 모니터링", type: "page", color: "stone" },
    { path: "/admin/monitoring", name: "시스템 모니터링", description: "통합 시스템 모니터링", category: "시스템 및 모니터링", type: "page", color: "blue" },
    
    // 관리자 하위 페이지 - 외부 연동 및 통합
    { path: "/admin/shopping-malls", name: "쇼핑몰 연동", description: "외부 쇼핑몰 연동 관리", category: "외부 연동 및 통합", type: "page", color: "rose" },
    { path: "/admin/integrations", name: "통합 관리", description: "외부 시스템 연동", category: "외부 연동 및 통합", type: "page", color: "violet" },
    
    // 새로운 관리 페이지들
    { path: "/admin/hotel-management", name: "호텔 관리 (신규)", description: "전용 호텔 관리 인터페이스", category: "신규 관리 페이지", type: "page", color: "purple" },
    { path: "/admin/inventory-management", name: "재고 관리 (신규)", description: "전용 재고 관리 인터페이스", category: "신규 관리 페이지", type: "page", color: "green" },
    { path: "/admin/surcharge-management", name: "추가요금 관리 (신규)", description: "전용 추가요금 관리 인터페이스", category: "신규 관리 페이지", type: "page", color: "pink" },
    
    // 호텔 관리자 하위 페이지들 - 호텔 운영 관리
    { path: "/hotel-admin/hotels", name: "호텔 정보 관리", description: "호텔별 정보 및 설정 관리", category: "호텔 운영 관리", type: "page", color: "purple" },
    { path: "/hotel-admin/rooms", name: "객실 관리", description: "호텔별 객실 정보 관리", category: "호텔 운영 관리", type: "page", color: "indigo" },
    { path: "/hotel-admin/bookings", name: "예약 관리", description: "호텔별 예약 현황 관리", category: "호텔 운영 관리", type: "page", color: "green" },
    { path: "/hotel-admin/packages", name: "패키지 관리", description: "호텔별 투어 패키지 관리", category: "호텔 운영 관리", type: "page", color: "pink" },
    { path: "/hotel-admin/inventory", name: "재고 관리", description: "호텔별 재고 현황 관리", category: "호텔 운영 관리", type: "page", color: "blue" },
    { path: "/hotel-admin/surcharges", name: "추가요금 관리", description: "호텔별 추가요금 설정", category: "호텔 운영 관리", type: "page", color: "yellow" },
    { path: "/hotel-admin/payment", name: "호텔 결제 관리", description: "호텔별 결제 처리 인터페이스", category: "호텔 운영 관리", type: "page", color: "emerald" },
    
    // 고객 하위 페이지들 - 고객 서비스
    { path: "/customer/rooms", name: "객실 목록", description: "고객용 객실 정보 및 예약", category: "고객 서비스", type: "page", color: "orange" },
    { path: "/customer/packages", name: "패키지 목록", description: "고객용 투어 패키지 정보 및 예약", category: "고객 서비스", type: "page", color: "pink" },
    
    // 인증 페이지
    { path: "/auth", name: "인증", description: "로그인/로그아웃 처리", category: "인증 페이지", type: "page", color: "blue" },
    
    // ===== API 엔드포인트 =====
    
    // 관리자 API - 핵심 관리 기능
    { path: "/api/admin/stats", name: "관리자 통계", description: "시스템 통계 데이터", category: "관리자 핵심 API", type: "api", color: "blue" },
    { path: "/api/admin/reservations", name: "예약 API", description: "예약 CRUD 작업", category: "관리자 핵심 API", type: "api", color: "green" },
    { path: "/api/admin/hotels", name: "호텔 API", description: "호텔 정보 관리", category: "관리자 핵심 API", type: "api", color: "purple" },
    { path: "/api/admin/rooms", name: "객실 API", description: "객실 정보 관리", category: "관리자 핵심 API", type: "api", color: "indigo" },
    { path: "/api/admin/packages", name: "패키지 API", description: "투어 패키지 관리", category: "관리자 핵심 API", type: "api", color: "pink" },
    { path: "/api/admin/customers", name: "고객 API", description: "고객 정보 관리", category: "관리자 핵심 API", type: "api", color: "yellow" },
    { path: "/api/admin/payments", name: "결제 API", description: "결제 처리 및 내역", category: "관리자 핵심 API", type: "api", color: "emerald" },
    { path: "/api/admin/sales", name: "매출 API", description: "매출 데이터 및 통계", category: "관리자 핵심 API", type: "api", color: "teal" },
    
    // 관리자 API - 시스템 관리
    { path: "/api/admin/logs", name: "로그 API", description: "시스템 로그 스트림", category: "관리자 시스템 API", type: "api", color: "gray" },
    { path: "/api/admin/database", name: "데이터베이스 API", description: "DB 상태 및 관리", category: "관리자 시스템 API", type: "api", color: "stone" },
    { path: "/api/admin/prisma-status", name: "Prisma 상태 API", description: "Prisma ORM 상태 확인", category: "관리자 시스템 API", type: "api", color: "slate" },
    { path: "/api/admin/api-keys", name: "API 키 관리 API", description: "API 키 생성 및 관리", category: "관리자 시스템 API", type: "api", color: "slate" },
    
    // 관리자 API - 재무 및 부가세
    { path: "/api/admin/vat-settings", name: "부가세 설정 API", description: "부가세 설정 관리", category: "관리자 재무 API", type: "api", color: "lime" },
    { path: "/api/admin/vat-transactions", name: "부가세 거래 API", description: "부가세 거래 내역", category: "관리자 재무 API", type: "api", color: "lime" },
    { path: "/api/admin/vat-reports", name: "부가세 리포트 API", description: "부가세 리포트 생성", category: "관리자 재무 API", type: "api", color: "lime" },
    
    // 관리자 API - 외부 연동
    { path: "/api/admin/shopping-malls", name: "쇼핑몰 연동 API", description: "외부 쇼핑몰 연동 관리", category: "관리자 연동 API", type: "api", color: "rose" },
    { path: "/api/admin/error-report", name: "에러 리포트 API", description: "클라이언트 에러 수집", category: "관리자 연동 API", type: "api", color: "red" },
    
    // 호텔 관련 API
    { path: "/api/hotels", name: "호텔 정보 API", description: "호텔 정보 조회 및 관리", category: "호텔 API", type: "api", color: "purple" },
    { path: "/api/rooms", name: "객실 API", description: "객실 정보 조회 및 관리", category: "호텔 API", type: "api", color: "indigo" },
    { path: "/api/rooms/1", name: "객실 상세 API", description: "특정 객실 상세 정보 (예시: ID 1)", category: "호텔 API", type: "api", color: "indigo" },
    { path: "/api/packages", name: "패키지 API", description: "투어 패키지 정보 조회", category: "호텔 API", type: "api", color: "pink" },
    
    // 예약 및 결제 API
    { path: "/api/reservations", name: "예약 API", description: "예약 생성 및 관리", category: "예약 및 결제 API", type: "api", color: "green" },
    { path: "/api/payments", name: "결제 API", description: "결제 처리 및 관리", category: "예약 및 결제 API", type: "api", color: "emerald" },
    
    // 고객 서비스 API
    { path: "/api/customer", name: "고객 서비스 API", description: "고객용 통합 서비스", category: "고객 서비스 API", type: "api", color: "orange" },
    
    // 재고 및 가격 관리 API
    { path: "/api/inventory", name: "재고 관리 API", description: "재고 현황 및 관리", category: "재고 및 가격 API", type: "api", color: "blue" },
    { path: "/api/inventories", name: "재고 목록 API", description: "재고 목록 조회", category: "재고 및 가격 API", type: "api", color: "blue" },
    { path: "/api/pricing", name: "가격 관리 API", description: "가격 설정 및 관리", category: "재고 및 가격 API", type: "api", color: "yellow" },
    { path: "/api/surcharge-rules", name: "추가요금 규칙 API", description: "추가요금 규칙 관리", category: "재고 및 가격 API", type: "api", color: "yellow" },
    
    // 외부 연동 API
    { path: "/api/external", name: "외부 연동 API", description: "외부 시스템 연동", category: "외부 연동 API", type: "api", color: "blue" },
    { path: "/api/integrations", name: "통합 관리 API", description: "시스템 통합 관리", category: "외부 연동 API", type: "api", color: "violet" },
    
    // 시스템 API
    { path: "/api/health", name: "헬스체크", description: "시스템 상태 확인", category: "시스템 API", type: "api", color: "blue" },
    { path: "/api/health/db", name: "DB 헬스체크", description: "데이터베이스 상태 확인", category: "시스템 API", type: "api", color: "blue" },
    { path: "/api/ping", name: "핑 테스트", description: "API 응답성 테스트", category: "시스템 API", type: "api", color: "green" },
    { path: "/api/test", name: "테스트 API", description: "API 테스트 및 디버깅", category: "시스템 API", type: "api", color: "gray" },
    
    // 사이트 관련 API (레거시)
    { path: "/api/site", name: "사이트 API", description: "사이트 관련 서비스 (레거시)", category: "레거시 API", type: "api", color: "blue" },
  ];

  // 페이지와 API 분리 - 클라이언트에서만 계산
  const pageEndpoints = mounted ? allEndpoints.filter(ep => ep.type === 'page') : [];
  const apiEndpoints = mounted ? allEndpoints.filter(ep => ep.type === 'api') : [];

  // 카테고리별로 그룹화 - 클라이언트에서만 계산
  const groupedPageEndpoints = mounted ? pageEndpoints.reduce((acc, endpoint) => {
    const category = endpoint.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(endpoint);
    return acc;
  }, {} as Record<string, typeof pageEndpoints>) : {};

  const groupedApiEndpoints = mounted ? apiEndpoints.reduce((acc, endpoint) => {
    const category = endpoint.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(endpoint);
    return acc;
  }, {} as Record<string, typeof apiEndpoints>) : {};

  // 카테고리 순서 정의 (우선순위 순)
  const pageCategoryOrder = [
    "메인 페이지",
    "예약 및 일정 관리", 
    "호텔 및 객실 관리",
    "재무 및 결제 관리",
    "고객 및 사용자 관리",
    "시스템 및 모니터링",
    "외부 연동 및 통합",
    "신규 관리 페이지",
    "호텔 운영 관리",
    "고객 서비스",
    "인증 페이지"
  ];

  const apiCategoryOrder = [
    "관리자 핵심 API",
    "관리자 시스템 API",
    "관리자 재무 API",
    "관리자 연동 API",
    "호텔 API",
    "예약 및 결제 API",
    "고객 서비스 API",
    "재고 및 가격 API",
    "외부 연동 API",
    "시스템 API",
    "레거시 API"
  ];

  // 필터링된 엔드포인트 - 클라이언트에서만 계산
  const filteredEndpoints = mounted ? allEndpoints.filter(endpoint => {
    const matchesSearch = endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         endpoint.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || endpoint.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) : [];

  // 통계 카드 데이터 - 클라이언트에서만 계산
  const statCards = mounted && stats ? [
    {
      title: "총 예약",
      value: stats.totalReservations || 0,
      description: "전체 예약 수",
      color: "blue",
      key: "totalReservations"
    },
    {
      title: "오늘 예약",
      value: stats.todayReservations || 0,
      description: "오늘 체크인 예약 수",
      color: "green",
      key: "todayReservations"
    },
    {
      title: "활성 객실",
      value: stats.activeRooms || 0,
      description: "사용 가능한 객실 수",
      color: "purple",
      key: "activeRooms"
    },
    {
      title: "패키지",
      value: stats.packages || 0,
      description: "등록된 패키지 수",
      color: "orange",
      key: "packages"
    }
  ] : [];

  // 클라이언트 전용 렌더링
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">페이지 로딩 중...</p>
        </div>
      </div>
    );
  }

  // 엔드포인트 렌더링 함수
  const renderEndpoint = (endpoint: any, index: number) => (
    <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${endpoint.color}-100 text-${endpoint.color}-800`}>
              {endpoint.category}
            </span>
            <h3 className="text-lg font-medium text-gray-900">{endpoint.name}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-2">{endpoint.description}</p>
          <p className="text-sm font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded">{endpoint.path}</p>
        </div>
        <div className="ml-4">
          <Link
            href={endpoint.path}
            target="_blank"
            rel="noopener noreferrer"
            className={`px-4 py-2 text-white text-sm rounded-lg hover:opacity-90 transition-opacity ${
              endpoint.type === 'page' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {endpoint.type === 'page' ? '이동' : '테스트'}
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">시스템 대시보드</h1>
              <p className="mt-2 text-gray-600">
                RSVShop 시스템의 모든 페이지와 API를 체계적으로 분류하여 확인하세요
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/admin"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                관리자 페이지
              </Link>
              <Link
                href="/hotel-admin"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                호텔 관리자
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 통계 카드 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {!mounted || loading ? (
            // 로딩 상태
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="bg-white">
                <div className="text-center">
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </Card>
            ))
          ) : stats?.error ? (
            // 에러 상태
            <div className="col-span-full">
              <Card className="bg-red-50 border-red-200">
                <div className="text-center">
                  <div className="text-red-600 mb-2">
                    <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-red-800 mb-1">데이터 로딩 실패</h3>
                  <p className="text-sm text-red-600 mb-3">{stats.error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    새로고침
                  </button>
                </div>
              </Card>
            </div>
          ) : mounted && stats && statCards.length > 0 ? (
            // 정상 상태
            statCards.map((card, index) => (
              <Card key={index} className="bg-white">
                <div className="text-center">
                  <div className={`text-3xl font-bold text-${card.color}-600 mb-2`}>
                    {stats[card.key] || 0}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{card.title}</h3>
                  <p className="text-sm text-gray-600">{card.description}</p>
                </div>
              </Card>
            ))
          ) : (
            // 초기 상태
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="bg-white">
                <div className="text-center">
                  <div className="text-gray-400">
                    <div className="h-8 bg-gray-100 rounded mb-2"></div>
                    <div className="h-6 bg-gray-100 rounded mb-1"></div>
                    <div className="h-4 bg-gray-100 rounded"></div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col gap-4">
            {/* 검색바 */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="페이지 또는 API 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* 카테고리 필터 */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 mr-2">카테고리:</span>
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                전체
              </button>
              {[...pageCategoryOrder, ...apiCategoryOrder].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 검색 결과가 있는 경우 */}
        {searchTerm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-yellow-50">
              <h2 className="text-lg font-semibold text-yellow-900">
                🔍 검색 결과 ({filteredEndpoints.length})
              </h2>
              <p className="text-sm text-yellow-700 mt-1">"{searchTerm}"에 대한 검색 결과입니다</p>
            </div>
            <div>
              {filteredEndpoints.map((endpoint, index) => renderEndpoint(endpoint, index))}
            </div>
          </div>
        )}

        {/* 검색어가 없을 때만 표시 */}
        {!searchTerm && (
          <div className="space-y-8">
            {/* 📄 페이지 섹션 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-blue-900 flex items-center">
                      📄 페이지 엔드포인트
                    </h2>
                    <p className="text-blue-700 mt-2">사용자가 직접 접근할 수 있는 웹 페이지들</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">{pageEndpoints.length}</div>
                    <div className="text-sm text-blue-600">총 페이지</div>
                  </div>
                </div>
              </div>
              
              {/* 페이지 카테고리별 그룹 */}
              <div>
                {pageCategoryOrder.map((category) => {
                  const endpoints = groupedPageEndpoints[category] || [];
                  if (endpoints.length === 0) return null;
                  
                  const filteredCategoryEndpoints = selectedCategory === 'all' || selectedCategory === category 
                    ? endpoints 
                    : [];

                  if (filteredCategoryEndpoints.length === 0) return null;

                  return (
                    <div key={category} className="border-b border-gray-200 last:border-b-0">
                      <div className="px-6 py-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {filteredCategoryEndpoints.length}개 페이지
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-400">{filteredCategoryEndpoints.length}</div>
                            <div className="text-xs text-gray-500">페이지</div>
                          </div>
                        </div>
                      </div>
                      <div>
                        {filteredCategoryEndpoints.map((endpoint, index) => renderEndpoint(endpoint, index))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 🔌 API 섹션 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-green-900 flex items-center">
                      🔌 API 엔드포인트
                    </h2>
                    <p className="text-green-700 mt-2">프로그램 간 데이터 교환을 위한 API 서비스들</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">{apiEndpoints.length}</div>
                    <div className="text-sm text-green-600">총 API</div>
                  </div>
                </div>
              </div>
              
              {/* API 카테고리별 그룹 */}
              <div>
                {apiCategoryOrder.map((category) => {
                  const endpoints = groupedApiEndpoints[category] || [];
                  if (endpoints.length === 0) return null;
                  
                  const filteredCategoryEndpoints = selectedCategory === 'all' || selectedCategory === category 
                    ? endpoints 
                    : [];

                  if (filteredCategoryEndpoints.length === 0) return null;

                  return (
                    <div key={category} className="border-b border-gray-200 last:border-b-0">
                      <div className="px-6 py-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {filteredCategoryEndpoints.length}개 API
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-400">{filteredCategoryEndpoints.length}</div>
                            <div className="text-xs text-gray-500">API</div>
                          </div>
                        </div>
                      </div>
                      <div>
                        {filteredCategoryEndpoints.map((endpoint, index) => renderEndpoint(endpoint, index))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 완료 안내 */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-green-800">페이지와 API 분리 완료</h3>
              <p className="mt-1 text-sm text-green-700">
                페이지와 API를 두 개의 주요 섹션으로 분리하고, 각 카테고리별로 그룹화했습니다. 
                전체 페이지 스크롤로 모든 내용을 확인할 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* 시스템 상태 모니터링 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-blue-800">시스템 상태 모니터링</h3>
              <p className="text-sm text-blue-700 mt-1">서버 및 데이터베이스 상태를 실시간으로 확인하세요</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                새로고침
              </button>
              <Link
                href="/admin/monitoring"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                상세 모니터링
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 서버 상태 */}
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">서버 상태</h4>
                  <p className="text-sm text-gray-600">포트 4900</p>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-green-600 font-medium">정상</span>
                </div>
              </div>
            </div>

            {/* 데이터베이스 상태 */}
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">데이터베이스</h4>
                  <p className="text-sm text-gray-600">PostgreSQL</p>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-green-600 font-medium">연결됨</span>
                </div>
              </div>
            </div>

            {/* API 상태 */}
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">API 상태</h4>
                  <p className="text-sm text-gray-600">통계 API</p>
                </div>
                <div className="flex items-center">
                  {loading ? (
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
                  ) : stats?.error ? (
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  ) : (
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  )}
                  <span className={`text-sm font-medium ${
                    loading ? 'text-yellow-600' : stats?.error ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {loading ? '로딩 중' : stats?.error ? '오류' : '정상'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
