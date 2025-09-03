'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/app/components/common/Card';

export default function HomePage() {
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('frontend');

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

  // 탭별 엔드포인트 그룹 정의
  const tabGroups = {
    frontend: {
      title: "🎨 프론트엔드 페이지",
      description: "사용자가 직접 접근하는 웹 페이지들",
      groups: [
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
            { path: "/admin/hotel-rooms", name: "호텔객실관리", description: "호텔과 객실 통합 관리", color: "indigo" },
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
            { path: "/admin/monitoring", name: "시스템 모니터링", description: "통합 시스템 모니터링 및 에러 관리", color: "blue" },
            { path: "/admin/health", name: "시스템 건강 상태", description: "전체 시스템 상태 확인", color: "blue" },
          ]
        }
      ]
    },
    api: {
      title: "🔌 API 엔드포인트",
      description: "시스템 API 및 데이터 접근",
      groups: [
        {
          title: "🌐 핵심 API",
          description: "시스템의 핵심 기능을 제공하는 API",
          endpoints: [
            { path: "/api/ping", name: "서버 상태 확인", description: "서버 연결 상태 체크", color: "green" },
            { path: "/api/health", name: "시스템 건강 상태", description: "전체 시스템 상태 확인", color: "blue" },
            { path: "/api/admin/stats", name: "관리자 통계", description: "관리자 대시보드 통계 데이터", color: "purple" },
          ]
        },
        {
          title: "🏨 호텔 및 객실 API",
          description: "호텔, 객실, 패키지 관련 API",
          endpoints: [
            { path: "/api/hotels", name: "호텔 정보", description: "호텔 목록 및 상세 정보", color: "blue" },
            { path: "/api/rooms", name: "객실 정보", description: "객실 목록 및 가용성", color: "green" },
            { path: "/api/packages", name: "패키지 정보", description: "투어 패키지 목록 및 상세", color: "purple" },
            { path: "/api/admin/hotels", name: "호텔 관리 API", description: "호텔 CRUD 작업", color: "indigo" },
            { path: "/api/rooms", name: "객실 관리 API", description: "객실 CRUD 작업", color: "teal" },
            { path: "/api/admin/packages", name: "패키지 관리 API", description: "패키지 CRUD 작업", color: "pink" },
          ]
        },
        {
          title: "📅 예약 및 결제 API",
          description: "예약 생성, 수정, 결제 관련 API",
          endpoints: [
            { path: "/api/reservations", name: "예약 API", description: "예약 생성 및 조회", color: "green" },
            { path: "/api/admin/reservations", name: "예약 관리 API", description: "관리자용 예약 CRUD", color: "emerald" },
            { path: "/api/payments", name: "결제 API", description: "결제 처리 및 상태 확인", color: "blue" },
            { path: "/api/admin/payments", name: "결제 관리 API", description: "관리자용 결제 관리", color: "cyan" },
          ]
        },
        {
          title: "👥 사용자 및 인증 API",
          description: "사용자 관리, 인증, 권한 관련 API",
          endpoints: [
            { path: "/api/auth", name: "인증 API", description: "로그인/로그아웃 처리", color: "blue" },
            { path: "/api/users", name: "사용자 API", description: "사용자 정보 관리", color: "purple" },
            { path: "/api/admin/users", name: "사용자 관리 API", description: "관리자용 사용자 관리", color: "indigo" },
            { path: "/api/admin/api-keys", name: "API 키 관리", description: "API 키 생성 및 관리", color: "slate" },
          ]
        },
        {
          title: "🛍️ 쇼핑몰 연동 API",
          description: "외부 쇼핑몰 연동 및 통합 API",
          endpoints: [
            { path: "/api/shopping-malls", name: "쇼핑몰 API", description: "쇼핑몰 정보 및 연동", color: "rose" },
            { path: "/api/admin/shopping-malls", name: "쇼핑몰 관리 API", description: "쇼핑몰 연동 관리", color: "violet" },
            { path: "/api/integrations", name: "통합 API", description: "외부 시스템 연동", color: "orange" },
          ]
        },
        {
          title: "📊 모니터링 및 로그 API",
          description: "시스템 모니터링, 로그, 통계 관련 API",
          endpoints: [
            { path: "/api/admin/logs", name: "로그 API", description: "시스템 로그 조회", color: "gray" },
            { path: "/api/admin/monitoring", name: "모니터링 API", description: "시스템 상태 모니터링", color: "blue" },
            { path: "/api/admin/analytics", name: "분석 API", description: "시스템 사용 통계", color: "teal" },
          ]
        }
      ]
    },
    system: {
      title: "⚙️ 시스템 관리",
      description: "시스템 설정, 모니터링, 유지보수 도구",
      groups: [
        {
          title: "🔍 시스템 모니터링",
          description: "시스템 상태 및 성능 모니터링",
          endpoints: [
            { path: "/admin/monitoring", name: "시스템 모니터링", description: "통합 시스템 모니터링", color: "blue" },
            { path: "/admin/health", name: "시스템 건강 상태", description: "전체 시스템 상태 확인", color: "green" },
            { path: "/admin/logs", name: "로그 뷰어", description: "시스템 로그 및 모니터링", color: "gray" },
            { path: "/admin/performance", name: "성능 모니터링", description: "시스템 성능 지표", color: "purple" },
          ]
        },
        {
          title: "🗄️ 데이터베이스 관리",
          description: "데이터베이스 상태 및 관리",
          endpoints: [
            { path: "/admin/database", name: "DB 관리", description: "데이터베이스 상태 및 관리", color: "stone" },
            { path: "/admin/backup", name: "백업 관리", description: "데이터 백업 및 복원", color: "blue" },
            { path: "/admin/migration", name: "마이그레이션", description: "데이터베이스 스키마 관리", color: "green" },
          ]
        },
        {
          title: "🔐 보안 및 권한",
          description: "보안 설정 및 사용자 권한 관리",
          endpoints: [
            { path: "/admin/security", name: "보안 설정", description: "시스템 보안 정책", color: "red" },
            { path: "/admin/permissions", name: "권한 관리", description: "사용자 권한 설정", color: "orange" },
            { path: "/admin/audit", name: "감사 로그", description: "사용자 활동 감사", color: "yellow" },
          ]
        },
        {
          title: "⚡ 성능 최적화",
          description: "시스템 성능 최적화 및 튜닝",
          endpoints: [
            { path: "/admin/cache", name: "캐시 관리", description: "시스템 캐시 설정", color: "cyan" },
            { path: "/admin/optimization", name: "성능 최적화", description: "시스템 성능 튜닝", color: "teal" },
            { path: "/admin/maintenance", name: "유지보수 모드", description: "시스템 유지보수 설정", color: "amber" },
          ]
        }
      ]
    }
  };

  const activeTabData = tabGroups[activeTab as keyof typeof tabGroups];
  const totalEndpoints = activeTabData.groups.reduce((total, group) => total + group.endpoints.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">RSVShop 시스템 대시보드</h1>
              <p className="text-gray-600 mt-1">시스템적으로 분류하고 관리하는 모든 페이지와 API</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/admin" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                관리자 페이지
              </Link>
              <Link href="/hotel-admin" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                호텔 관리자
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="text-2xl font-bold">{stats.totalReservations || 0}</div>
            <div className="text-blue-100">총 예약</div>
          </Card>
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="text-2xl font-bold">{stats.todayReservations || 0}</div>
            <div className="text-green-100">오늘 예약</div>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="text-2xl font-bold">{stats.activeRooms || 0}</div>
            <div className="text-purple-100">활성 객실</div>
          </Card>
          <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
            <div className="text-2xl font-bold">{stats.totalPackages || 0}</div>
            <div className="text-pink-100">패키지</div>
          </Card>
        </div>

        {/* 검색바 */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="페이지 또는 API 검색..."
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {Object.entries(tabGroups).map(([key, tab]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.title}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* 탭 내용 */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{activeTabData.title}</h2>
            <p className="text-gray-600 mt-1">{activeTabData.description}</p>
            <div className="text-sm text-gray-500 mt-2">{totalEndpoints} 총 엔드포인트</div>
          </div>

          <div className="space-y-8">
            {activeTabData.groups.map((group, groupIndex) => (
              <div key={groupIndex} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{group.title}</h3>
                  <p className="text-gray-600 text-sm">{group.description}</p>
                  <div className="text-xs text-gray-500 mt-1">{group.endpoints.length}개 엔드포인트</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.endpoints.map((endpoint, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{endpoint.name}</h4>
                          <p className="text-sm text-gray-600 mb-3">{endpoint.description}</p>
                          <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                            {endpoint.path}
                          </div>
                        </div>
                        <Link
                          href={endpoint.path}
                          className={`ml-3 px-3 py-1 text-xs font-medium rounded-full text-white bg-${endpoint.color}-500 hover:bg-${endpoint.color}-600 transition-colors`}
                        >
                          이동
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
