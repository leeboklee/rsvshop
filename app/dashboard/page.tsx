'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/app/components/common/Card';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(false);

  // 통계 데이터 가져오기
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('통계 데이터 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // 엔드포인트 그룹 정의
  const endpointGroups = [
    {
      title: "🏠 메인 페이지",
      description: "시스템의 주요 진입점",
      endpoints: [
        { path: "/", name: "홈 대시보드", description: "메인 대시보드 및 시스템 개요", color: "blue" },
        { path: "/admin", name: "관리자 페이지", description: "통합 관리자 인터페이스", color: "purple" },
        { path: "/hotel-admin", name: "호텔 관리자", description: "호텔별 관리 인터페이스", color: "green" },
        { path: "/customer", name: "고객 페이지", description: "고객용 예약 인터페이스", color: "orange" },
      ]
    },
    {
      title: "📊 핵심 관리 기능",
      description: "예약 및 호텔 관리의 핵심 기능",
      endpoints: [
        { path: "/admin/dashboard", name: "대시보드", description: "시스템 통계 및 개요", color: "blue" },
        { path: "/admin/reservations", name: "예약 관리", description: "예약 생성, 수정, 삭제", color: "green" },
        { path: "/admin/calendar", name: "달력 뷰", description: "예약 달력 및 일정", color: "sky" },
        { path: "/admin/hotels", name: "호텔 관리", description: "호텔 정보 및 설정", color: "purple" },
        { path: "/admin/rooms", name: "객실 관리", description: "객실 정보 및 가격", color: "indigo" },
        { path: "/admin/packages", name: "패키지 관리", description: "투어 패키지 관리", color: "pink" },
      ]
    },
    {
      title: "💰 재무 및 결제 관리",
      description: "매출, 결제, 수수료 관련 기능",
      endpoints: [
        { path: "/admin/payments", name: "결제 관리", description: "결제 내역 및 처리", color: "emerald" },
        { path: "/admin/sales", name: "매출 관리", description: "매출 통계 및 분석", color: "teal" },
        { path: "/admin/commission", name: "수수료 관리", description: "수수료 설정 및 정산", color: "cyan" },
        { path: "/admin/surcharge-rules", name: "추가요금 규칙", description: "추가요금 정책 관리", color: "amber" },
        { path: "/admin/vat-management", name: "부가세 관리", description: "부가세 설정 및 계산", color: "lime" },
      ]
    },
    {
      title: "🛍️ 쇼핑몰 및 연동",
      description: "외부 쇼핑몰 연동 및 통합 관리",
      endpoints: [
        { path: "/admin/shopping-malls", name: "쇼핑몰 연동", description: "외부 쇼핑몰 연동 관리", color: "rose" },
        { path: "/admin/integrations", name: "통합 관리", description: "외부 시스템 연동", color: "violet" },
        { path: "/shop", name: "쇼핑몰 메인", description: "쇼핑몰 메인 페이지", color: "blue" },
        { path: "/reservations", name: "예약 페이지", description: "고객 예약 인터페이스", color: "green" },
        { path: "/payment", name: "결제 페이지", description: "결제 처리 인터페이스", color: "purple" },
      ]
    },
    {
      title: "👥 고객 및 사용자 관리",
      description: "고객 정보 및 사용자 관리 기능",
      endpoints: [
        { path: "/admin/customers", name: "고객 관리", description: "고객 정보 및 이력", color: "yellow" },
        { path: "/admin/api-keys", name: "API 키 관리", description: "API 키 생성 및 관리", color: "slate" },
        { path: "/auth", name: "인증", description: "로그인/로그아웃 처리", color: "blue" },
      ]
    },
    {
      title: "🔧 시스템 및 모니터링",
      description: "시스템 상태 모니터링 및 관리 도구",
      endpoints: [
        { path: "/admin/logs", name: "로그 뷰어", description: "시스템 로그 및 모니터링", color: "gray" },
        { path: "/admin/database", name: "DB 관리", description: "데이터베이스 상태 및 관리", color: "stone" },
        { path: "/admin/error-monitor", name: "에러 모니터", description: "시스템 오류 추적", color: "red" },
        { path: "/admin/health", name: "시스템 건강 상태", description: "전체 시스템 상태 확인", color: "blue" },
        { path: "/test-error", name: "오류 테스트", description: "오류 처리 테스트", color: "red" },
      ]
    },
    {
      title: "🔌 API 엔드포인트",
      description: "시스템 API 및 데이터 접근",
      endpoints: [
        { path: "/api/admin/stats", name: "관리자 통계", description: "시스템 통계 데이터", color: "blue" },
        { path: "/api/admin/reservations", name: "예약 API", description: "예약 CRUD 작업", color: "green" },
        { path: "/api/admin/hotels", name: "호텔 API", description: "호텔 정보 관리", color: "purple" },
        { path: "/api/admin/packages", name: "패키지 API", description: "투어 패키지 관리", color: "pink" },
        { path: "/api/admin/customers", name: "고객 API", description: "고객 정보 관리", color: "yellow" },
        { path: "/api/admin/payments", name: "결제 API", description: "결제 처리 및 내역", color: "emerald" },
        { path: "/api/admin/sales", name: "매출 API", description: "매출 데이터 및 통계", color: "teal" },
        { path: "/api/admin/logs", name: "로그 API", description: "시스템 로그 스트림", color: "gray" },
        { path: "/api/health", name: "헬스체크", description: "시스템 상태 확인", color: "blue" },
        { path: "/api/ping", name: "핑 테스트", description: "API 응답성 테스트", color: "green" },
      ]
    },
    {
      title: "🌐 외부 연동 API",
      description: "외부 시스템과의 연동 인터페이스",
      endpoints: [
        { path: "/api/external/packages", name: "외부 패키지", description: "외부 시스템 패키지 조회", color: "blue" },
        { path: "/api/external/reservations", name: "외부 예약", description: "외부 시스템 예약 연동", color: "green" },
        { path: "/api/external/rooms", name: "외부 객실", description: "외부 시스템 객실 정보", color: "purple" },
        { path: "/api/integrations/sync", name: "동기화", description: "외부 시스템 데이터 동기화", color: "orange" },
      ]
    },
    {
      title: "🎨 위젯 및 임베드",
      description: "외부 사이트에 임베드 가능한 위젯",
      endpoints: [
        { path: "/widget", name: "위젯 메인", description: "예약 위젯 메인 페이지", color: "blue" },
        { path: "/site", name: "사이트 예약", description: "일반 사이트 예약 페이지", color: "green" },
        { path: "/site/[hotel]", name: "호텔별 예약", description: "특정 호텔 예약 페이지", color: "purple" },
      ]
    }
  ];

  const getColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      green: "bg-green-100 text-green-800 border-green-200",
      purple: "bg-purple-100 text-purple-800 border-purple-200",
      orange: "bg-orange-100 text-orange-800 border-orange-200",
      sky: "bg-sky-100 text-sky-800 border-sky-200",
      indigo: "bg-indigo-100 text-indigo-800 border-indigo-200",
      pink: "bg-pink-100 text-pink-800 border-pink-200",
      emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
      teal: "bg-teal-100 text-teal-800 border-teal-200",
      cyan: "bg-cyan-100 text-cyan-800 border-cyan-200",
      amber: "bg-amber-100 text-amber-800 border-amber-200",
      lime: "bg-lime-100 text-lime-800 border-lime-200",
      rose: "bg-rose-100 text-rose-800 border-rose-200",
      violet: "bg-violet-100 text-violet-800 border-violet-200",
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
      slate: "bg-slate-100 text-slate-800 border-slate-200",
      gray: "bg-gray-100 text-gray-800 border-gray-200",
      stone: "bg-stone-100 text-stone-800 border-stone-200",
      red: "bg-red-100 text-red-800 border-red-200"
    };
    return colorMap[color] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const openInNewTab = (path: string) => {
    const baseUrl = window.location.origin;
    window.open(`${baseUrl}${path}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 RSVShop 프로젝트 엔드포인트 대시보드
          </h1>
          <p className="text-gray-600">
            모든 페이지, API, 클라이언트 엔드포인트를 한눈에 확인하고 빠르게 접근할 수 있습니다.
          </p>
        </div>

        {/* 통계 요약 */}
        {!loading && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-blue-50 border-blue-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalEndpoints || endpointGroups.reduce((acc, group) => acc + group.endpoints.length, 0)}</div>
                <div className="text-sm text-blue-600">총 엔드포인트</div>
              </div>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.apiEndpoints || endpointGroups.find(g => g.title === "🔌 API 엔드포인트")?.endpoints.length || 0}</div>
                <div className="text-sm text-green-600">API 엔드포인트</div>
              </div>
            </Card>
            <Card className="bg-purple-50 border-purple-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.frontendEndpoints || endpointGroups.filter(g => !g.title.includes("API")).reduce((acc, group) => acc + group.endpoints.length, 0)}</div>
                <div className="text-sm text-purple-600">프론트엔드</div>
              </div>
            </Card>
            <Card className="bg-orange-50 border-orange-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.externalEndpoints || endpointGroups.find(g => g.title === "🌐 외부 연동 API")?.endpoints.length || 0}</div>
                <div className="text-sm text-orange-600">외부 연동</div>
              </div>
            </Card>
          </div>
        )}

        {/* 엔드포인트 그룹 */}
        <div className="space-y-8">
          {endpointGroups.map((group, groupIndex) => (
            <Card key={groupIndex} className="p-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{group.title}</h2>
                <p className="text-gray-600 text-sm">{group.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.endpoints.map((endpoint, endpointIndex) => (
                  <div key={endpointIndex} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{endpoint.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getColorClass(endpoint.color)}`}>
                        {endpoint.path}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{endpoint.description}</p>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => openInNewTab(endpoint.path)}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                      >
                        🔗 새탭에서 열기
                      </button>
                      <Link
                        href={endpoint.path}
                        className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                      >
                        📱 현재탭에서 열기
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* 빠른 액세스 푸터 */}
        <div className="mt-8 p-6 bg-white rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 빠른 액세스</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => openInNewTab('/admin')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              🏠 관리자 페이지
            </button>
            <button
              onClick={() => openInNewTab('/customer')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              👥 고객 페이지
            </button>
            <button
              onClick={() => openInNewTab('/api/health')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔍 시스템 상태
            </button>
            <button
              onClick={() => openInNewTab('/widget')}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              🎨 위젯 테스트
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
