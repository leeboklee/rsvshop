'use client';

import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Card from '@/app/components/common/Card';
import dynamic from 'next/dynamic';

// Dynamic imports for performance optimization
const CalendarView = lazy(() => import('../components/CalendarView'));
const CustomDatePicker = lazy(() => import('../components/common/CustomDatePicker'));
const VATManagementPage = lazy(() => import('./vat-management/page'));

// XLSX는 실제 사용할 때만 동적 로드
const loadXLSX = () => import('xlsx');

const Dashboard = dynamic(() => import('./sections/Dashboard').then(m => m.default || m.Dashboard), { ssr: false, loading: () => <div className="p-6">로딩 중...</div> });
const Reservations = dynamic(() => import('./sections/Reservations').then(m => m.default || m.Reservations), { ssr: false, loading: () => <div className="p-6">로딩 중...</div> });
const Packages = dynamic(() => import('./sections/Packages').then(m => m.default || m.Packages), { ssr: false, loading: () => <div className="p-6">로딩 중...</div> });
const HotelManagement = dynamic(() => import('./sections/HotelManagement').then(m => m.default || m.HotelManagement), { ssr: false, loading: () => <div className="p-6">로딩 중...</div> });
const InventoryManagement = dynamic(() => import('./sections/InventoryManagement').then(m => m.default || m.InventoryManagement), { ssr: false, loading: () => <div className="p-6">로딩 중...</div> });
const SurchargeManagement = dynamic(() => import('./sections/SurchargeManagement').then(m => m.default || m.SurchargeManagement), { ssr: false, loading: () => <div className="p-6">로딩 중...</div> });

export default function AdminPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalType, setModalType] = useState('reservation');
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    roomId: '',
    hotelId: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    notes: '',
    shoppingMallId: '',
    sellingPrice: 0,
    commissionRate: 0,
    commissionAmount: 0,
    supplyPrice: 0,
    status: 'RECEIVED',
    orderNumber: '',
    orderDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState<any>({});
  const [statsLoading, setStatsLoading] = useState(false);
  const [shoppingMalls, setShoppingMalls] = useState<any[]>([]);
  const [shoppingMallLoading, setShoppingMallLoading] = useState(false);
  const [showShoppingMallModal, setShowShoppingMallModal] = useState(false);
  const [shoppingMallForm, setShoppingMallForm] = useState({
    id: '',
    name: '',
    commissionRate: 0,
    description: '',
    settlementCycle: 'MONTHLY',
    settlementDay: 1,
    lastSettlementDate: null,
    nextSettlementDate: null,
  });
  const [editingShoppingMall, setEditingShoppingMall] = useState<any>(null);
  const [hotels, setHotels] = useState<any[]>([]);
  const [hotelLoading, setHotelLoading] = useState(false);
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [hotelForm, setHotelForm] = useState({
    id: '',
    name: '',
    address: '',
    phone: '',
    email: '',
    description: ''
  });
  const [editingHotel, setEditingHotel] = useState<any>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [packageLoading, setPackageLoading] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [packageForm, setPackageForm] = useState({
    id: '',
    name: '',
    description: '',
    price: 0,
    hotelId: ''
  });
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [selectedHotelForPackage, setSelectedHotelForPackage] = useState('');
  const [selectedReservations, setSelectedReservations] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'RECEIVED' | 'CONFIRMED' | 'PENDING' | 'CANCELLED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [salesData, setSalesData] = useState<any>({});
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesPeriod, setSalesPeriod] = useState<'monthly' | 'weekly'>('monthly');
  const [salesRange, setSalesRange] = useState<'3months' | '6months' | '12months'>('3months');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date()
  });
  const [isCustomRange, setIsCustomRange] = useState(false);

  const [currentDate, setCurrentDate] = useState<string>('');

  // AI 연결 상태 추가
  const [aiConnected, setAiConnected] = useState<boolean>(false);
  const [aiConnectionTime, setAiConnectionTime] = useState<string>('');

  // DB 관리 상태 추가
  const [dbInfo, setDbInfo] = useState<any>(null);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [prismaStatus, setPrismaStatus] = useState<any>(null);
  const [prismaLoading, setPrismaLoading] = useState(false);

  // 요금표 관리 상태 추가
  const [rateTableData, setRateTableData] = useState<any>(null);
  const [showRateTablePreview, setShowRateTablePreview] = useState(false);
  const [rateTableForm, setRateTableForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    basePrice: '',
    peakPrice: '',
    roomType: '',
    description: ''
  });

  // 클라이언트에서만 날짜 설정 (hydration 오류 방지)
  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('ko-KR'));
  }, []);

  // 필터링된 예약 목록 계산
  const filteredReservations = useMemo(() => {
    let filtered = reservations;
    
    // 상태 필터 적용
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(reservation => reservation.status === statusFilter);
    }
    
    // 검색어 필터 적용
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(reservation => 
        reservation.guestName?.toLowerCase().includes(term) ||
        reservation.guestPhone?.includes(term) ||
        reservation.guestEmail?.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [reservations, statusFilter, searchTerm]);

  // 상태 필터 또는 검색어 변경 시 선택된 예약 초기화
  useEffect(() => {
    setSelectedReservations([]);
  }, [statusFilter, searchTerm]);

  // 캐시 상태 추가
  const [dataCache, setDataCache] = useState({});
  const [lastFetch, setLastFetch] = useState({});

  // 숫자 포맷팅 함수 (천 단위 쉼표)
  const formatNumber = (num: number) => {
    return num.toLocaleString('ko-KR');
  };

  // 숫자 입력에서 쉼표 제거 함수
  const removeCommas = (str: string) => {
    return str.replace(/,/g, '');
  };

  // 전화번호 포맷팅 함수
  const formatPhoneNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, '');
    
    // 길이에 따라 포맷팅
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  // 전화번호에서 하이픈 제거 함수
  const removePhoneFormatting = (value: string) => {
    return value.replace(/[^\d]/g, '');
  };

  // 캐시된 데이터 가져오기 함수
  const getCachedData = useCallback((key: string, maxAge: number = 30000) => {
    const cached = dataCache[key];
    const lastFetchTime = lastFetch[key];
    
    if (cached && lastFetchTime && (Date.now() - lastFetchTime) < maxAge) {
      return cached;
    }
    return null;
  }, [dataCache, lastFetch]);

  // 캐시에 데이터 저장 함수
  const setCachedData = useCallback((key: string, data: any) => {
    setDataCache(prev => ({ ...prev, [key]: data }));
    setLastFetch(prev => ({ ...prev, [key]: Date.now() }));
  }, []);

  // 캐시 무효화 함수 추가
  const invalidateCache = useCallback((key?: string) => {
    if (key) {
      setDataCache(prev => {
        const newCache = { ...prev };
        delete newCache[key];
        return newCache;
      });
      setLastFetch(prev => {
        const newLastFetch = { ...prev };
        delete newLastFetch[key];
        return newLastFetch;
      });
    } else {
      // 모든 캐시 무효화
      setDataCache({});
      setLastFetch({});
    }
  }, []);

  // 요금표 생성 함수
  const handleRateTableGenerate = useCallback(() => {
    if (!rateTableForm.name || !rateTableForm.startDate || !rateTableForm.endDate) {
      alert('요금표명, 시작일, 종료일은 필수입니다.');
      return;
    }

    const newRateTable = {
      id: Date.now().toString(),
      name: rateTableForm.name,
      startDate: rateTableForm.startDate,
      endDate: rateTableForm.endDate,
      basePrice: rateTableForm.basePrice || '0',
      peakPrice: rateTableForm.peakPrice || '0',
      roomType: rateTableForm.roomType || '전체',
      description: rateTableForm.description,
      createdAt: new Date().toISOString(),
      status: '활성'
    };

    setRateTableData(newRateTable);
    setShowRateTablePreview(true);
  }, [rateTableForm]);

  // 요금표 폼 리셋 함수
  const resetRateTableForm = useCallback(() => {
    setRateTableForm({
      name: '',
      startDate: '',
      endDate: '',
      basePrice: '',
      peakPrice: '',
      roomType: '',
      description: ''
    });
    setShowRateTablePreview(false);
    setRateTableData(null);
  }, []);

  // 예약 목록 가져오기 (캐시 적용)
  const fetchReservations = useCallback(async () => {
    const cached = getCachedData('reservations', 10000); // 10초 캐시
    if (cached) {
      setReservations(cached);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/reservations');
      if (response.ok) {
        const data = await response.json();
        // API 응답이 { bookings: [...] } 형태이므로 bookings 배열을 추출
        const reservationsData = data.bookings || data || [];
        setReservations(reservationsData);
        setCachedData('reservations', reservationsData);
      }
    } catch (error) {
      console.error('예약 목록 가져오기 실패:', error);
      setReservations([]); // 오류 시 빈 배열로 설정
    } finally {
      setLoading(false);
    }
  }, []);



  // 통계 가져오기 (캐시 적용)
  const fetchStats = useCallback(async () => {
    const cached = getCachedData('stats', 15000); // 15초 캐시
    if (cached) {
      setStats(cached);
      return;
    }

    setStatsLoading(true);
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setCachedData('stats', data);
      }
    } catch (error) {
      console.error('통계 가져오기 실패:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // 쇼핑몰 목록 가져오기 (캐시 적용)
  const fetchShoppingMalls = useCallback(async () => {
    const cached = getCachedData('shoppingMalls', 60000); // 1분 캐시
    if (cached) {
      setShoppingMalls(cached);
      return;
    }

    setShoppingMallLoading(true);
    try {
      const response = await fetch('/api/admin/shopping-malls');
      if (response.ok) {
        const data = await response.json();
        // API 응답이 { shoppingMalls: [...] } 형태이므로 shoppingMalls 배열을 추출
        const shoppingMallsData = data.shoppingMalls || data || [];
        setShoppingMalls(shoppingMallsData);
        setCachedData('shoppingMalls', shoppingMallsData);
      }
    } catch (error) {
      console.error('쇼핑몰 목록 가져오기 실패:', error);
      setShoppingMalls([]); // 오류 시 빈 배열로 설정
    } finally {
      setShoppingMallLoading(false);
    }
  }, []);

  // 호텔 목록 가져오기 (캐시 적용)
  const fetchHotels = useCallback(async () => {
    const cached = getCachedData('hotels', 60000); // 1분 캐시
    if (cached) {
      setHotels(cached);
      return;
    }

    setHotelLoading(true);
    try {
      const response = await fetch('/api/admin/hotels');
      if (response.ok) {
        const data = await response.json();
        // API 응답이 { hotels: [...] } 형태이므로 hotels 배열을 추출
        const hotelsData = data.hotels || data || [];
        setHotels(hotelsData);
        setCachedData('hotels', hotelsData);
      }
    } catch (error) {
      console.error('호텔 목록 가져오기 실패:', error);
    } finally {
      setHotelLoading(false);
    }
  }, []);

  // 패키지 목록 가져오기 (캐시 적용)
  const fetchPackages = useCallback(async (hotelId?: string) => {
    console.log('fetchPackages 호출됨, hotelId:', hotelId);
    
    const cacheKey = hotelId ? `packages-${hotelId}` : 'packages-all';
    const cached = getCachedData(cacheKey, 30000); // 30초 캐시
    if (cached) {
      console.log('캐시된 패키지 데이터 사용:', cached);
      setPackages(cached);
      return;
    }

    setPackageLoading(true);
    try {
      const url = hotelId 
        ? `/api/admin/packages?hotelId=${hotelId}`
        : '/api/admin/packages';
      console.log('패키지 API 호출 URL:', url);
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        const packagesData = data.packages || data || [];
        console.log('받은 패키지 데이터:', packagesData);
        setPackages(packagesData);
        setCachedData(cacheKey, packagesData);
      } else {
        console.error('패키지 API 응답 오류:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('패키지 목록 가져오기 실패:', error);
      setPackages([]);
    } finally {
      setPackageLoading(false);
    }
  }, []);

  // 매출 데이터 가져오기
  const fetchSalesData = useCallback(async (period: 'monthly' | 'weekly' = 'monthly', range?: '3months' | '6months' | '12months', customRange?: { startDate: Date, endDate: Date }) => {
    setSalesLoading(true);
    try {
      let url = `/api/admin/sales?period=${period}`;
      
      if (customRange) {
        // 커스텀 날짜 범위 사용
        const startDate = customRange.startDate.toISOString().split('T')[0];
        const endDate = customRange.endDate.toISOString().split('T')[0];
        url += `&startDate=${startDate}&endDate=${endDate}&customRange=true`;
      } else {
        // 기존 범위 사용
        url += `&range=${range || '3months'}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setSalesData(data);
      }
    } catch (error) {
      console.error('매출 데이터 가져오기 실패:', error);
      setSalesData({});
    } finally {
      setSalesLoading(false);
    }
  }, []);

  // Prisma 현황 가져오기 - 제거됨 (별도 페이지로 분리)

  // 메뉴 아이템 메모이제이션
  const menuItems = useMemo(() => [
    { id: 'dashboard', label: '대시보드', icon: '📊' },
    { id: 'reservations', label: '예약 관리', icon: '📅' },
    { id: 'calendar', label: '달력 뷰', icon: '📆' },
    { id: 'hotels', label: '호텔 관리', icon: '🏨' },
    { id: 'rooms', label: '객실 관리', icon: '🛏️' },
    { id: 'packages', label: '패키지 관리', icon: '📦' },
    { id: 'rate-table', label: '요금표 관리', icon: '📋' },
    { id: 'hotel-management', label: '호텔 관리 (신규)', icon: '🏨' },
    { id: 'inventory-management', label: '재고 관리 (신규)', icon: '📦' },
    { id: 'surcharge-management', label: '추가요금 관리 (신규)', icon: '💰' },
    { id: 'payments', label: '결제 관리', icon: '💳' },
    { id: 'sales', label: '매출 관리', icon: '💰' },
    { id: 'commission', label: '수수료 관리', icon: '💸' },

    { id: 'vat-management', label: '부가세 관리', icon: '🧾' },
    { id: 'shopping-malls', label: '쇼핑몰 연동', icon: '🛍️' },
    { id: 'integrations', label: '통합 관리', icon: '🔗' },
    { id: 'customers', label: '고객 관리', icon: '👥' },
    { id: 'api-keys', label: 'API 키', icon: '🔑' },
    { id: 'monitoring', label: '시스템 모니터링', icon: '🔍' },
    { id: 'database', label: 'DB 관리', icon: '🗄️' },
    { id: 'logs', label: '로그 뷰어', icon: '📋' }
  ], []);

  // 메뉴 클릭 핸들러 - 실제 라우팅으로 이동
  const handleMenuClick = useCallback((sectionId: string) => {
    // 특정 섹션은 실제 페이지로 이동
    switch (sectionId) {
      case 'reservations':
        router.push('/admin/reservations');
        break;
      case 'hotels':
        router.push('/admin/hotels');
        break;
      case 'rooms':
        router.push('/admin/hotel-rooms');
        break;
      case 'packages':
        router.push('/admin/packages');
        break;
      case 'customers':
        router.push('/admin/customers');
        break;
      case 'payments':
        router.push('/admin/payments');
        break;
      case 'sales':
        router.push('/admin/sales');
        break;
      case 'commission':
        router.push('/admin/commission');
        break;

      case 'vat-management':
        router.push('/admin/vat-management');
        break;
      case 'shopping-malls':
        router.push('/admin/shopping-malls');
        break;
      case 'integrations':
        router.push('/admin/integrations');
        break;
      case 'calendar':
        router.push('/admin/calendar');
        break;
      case 'api-keys':
        router.push('/admin/api-keys');
        break;
      case 'logs':
        router.push('/admin/logs');
        break;
      case 'database':
        router.push('/admin/database');
        break;
      case 'monitoring':
        router.push('/admin/monitoring');
        break;
      default:
        // 대시보드는 현재 페이지에 유지
        setActiveSection(sectionId);
        break;
    }
  }, [router]);

  // DB 정보 조회
  const fetchDbInfo = useCallback(async () => {
    setDbLoading(true);
    setDbError(null);
    try {
      // DB 연결 상태 확인
      const dbResponse = await fetch('/api/health/db');
      const dbData = await dbResponse.json();
      
      // Prisma 상태 확인
      const prismaResponse = await fetch('/api/admin/prisma-status');
      const prismaData = await prismaResponse.json();
      
      if (dbData.status === 'connected' && prismaData.success) {
        setDbInfo({
          dbStatus: dbData,
          prismaStatus: prismaData.data
        });
        console.log('✅ [AI 확인] DB 정보 조회 성공:', { dbData, prismaData });
      } else {
        const errorMsg = `DB 연결 실패: ${dbData.message || 'Unknown error'}`;
        console.error('❌ [AI 확인] DB 정보 조회 실패:', errorMsg);
        setDbError(errorMsg);
        
        // DB 오류를 AI에게 전송
        reportErrorToAI('database', errorMsg, null);
      }
    } catch (error) {
      console.error('❌ [AI 확인] DB 정보 조회 오류:', error);
      setDbError(error instanceof Error ? error.message : 'Unknown error');
      
      // DB 오류를 AI에게 전송
      reportErrorToAI('database', `DB 정보 조회 중 오류 발생: ${error}`, error instanceof Error ? error.stack : null);
    } finally {
      setDbLoading(false);
    }
  }, []);

  // Prisma 상태 조회
  const fetchPrismaStatus = useCallback(async () => {
    setPrismaLoading(true);
    try {
      const response = await fetch('/api/admin/prisma-status');
      const data = await response.json();
      if (data.success) {
        setPrismaStatus(data.data);
        console.log('✅ [AI 확인] Prisma 상태 조회 성공:', data.data);
      } else {
        console.error('❌ [AI 확인] Prisma 상태 조회 실패:', data.error);
        
        // Prisma 오류를 AI에게 전송
        reportErrorToAI('prisma', `Prisma 상태 조회 실패: ${data.error}`, null);
      }
    } catch (error) {
      console.error('❌ [AI 확인] Prisma 상태 조회 오류:', error);
      
      // Prisma 오류를 AI에게 전송
      reportErrorToAI('prisma', `Prisma 상태 조회 중 오류 발생: ${error}`, error instanceof Error ? error.stack : null);
    } finally {
      setPrismaLoading(false);
    }
  }, []);

  // 초기 데이터 로드 (최적화)
  useEffect(() => {
    // 대시보드 데이터만 먼저 로드
    fetchStats();
  }, [fetchStats]);

  // 섹션별 데이터 로드 (lazy loading)
  useEffect(() => {
    if (activeSection === 'reservations') {
      fetchReservations();
    }
  }, [activeSection, fetchReservations]);

  useEffect(() => {
    if (activeSection === 'hotels') {
      fetchHotels();
    }
  }, [activeSection, fetchHotels]);

  useEffect(() => {
    if (activeSection === 'shopping-malls') {
      fetchShoppingMalls();
    }
  }, [activeSection, fetchShoppingMalls]);

  useEffect(() => {
    if (activeSection === 'packages') {
      fetchPackages();
      fetchHotels(); // 호텔 목록도 함께 로드
    }
  }, [activeSection, fetchPackages, fetchHotels]);

  useEffect(() => {
    if (activeSection === 'reservations') {
      fetchShoppingMalls();
      fetchHotels();
    }
  }, [activeSection, fetchShoppingMalls, fetchHotels]);

  useEffect(() => {
    if (activeSection === 'sales') {
      fetchSalesData(salesPeriod, salesRange);
    }
  }, [activeSection, salesPeriod, salesRange, fetchSalesData]);

  useEffect(() => {
    if (activeSection === 'database') {
      fetchDbInfo();
      fetchPrismaStatus();
    }
  }, [activeSection, fetchDbInfo, fetchPrismaStatus]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // 쇼핑몰 선택 시 수수료 자동 계산
    if (name === 'shoppingMallId') {
      const selectedMall = shoppingMalls.find(mall => mall.id === value);
      if (selectedMall) {
        const commissionRate = selectedMall.commissionRate;
        setFormData(prev => {
          const sellingPrice = prev.sellingPrice || 0;
          const commissionAmount = (sellingPrice * commissionRate) / 100;
          const supplyPrice = sellingPrice - commissionAmount;
          
          return {
            ...prev,
            shoppingMallId: value,
            commissionRate: commissionRate,
            commissionAmount: commissionAmount,
            supplyPrice: supplyPrice
          };
        });
        return;
      } else {
        // 쇼핑몰 선택 해제 시
        setFormData(prev => ({
          ...prev,
          shoppingMallId: '',
          commissionRate: 0,
          commissionAmount: 0,
          supplyPrice: prev.sellingPrice || 0
        }));
        return;
      }
    }

    // 판매가 변경 시 수수료 및 공급가 재계산
    if (name === 'sellingPrice') {
      // 앞의 0 제거 및 숫자 변환
      let price = parseFloat(value) || 0;
      
      // 입력값이 0으로 시작하는 경우 처리
      if (value.startsWith('0') && value.length > 1) {
        price = parseFloat(value.replace(/^0+/, '')) || 0;
      }
      
      setFormData(prev => {
        const commissionRate = prev.commissionRate || 0;
        const commissionAmount = (price * commissionRate) / 100;
        const supplyPrice = price - commissionAmount;
        
        return {
          ...prev,
          sellingPrice: price,
          commissionAmount: commissionAmount,
          supplyPrice: supplyPrice
        };
      });
      return;
    }

    // 일반 필드 업데이트
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.customerName || !formData.checkIn || !formData.checkOut) {
      alert('고객명, 체크인, 체크아웃은 필수 항목입니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: formData.customerName,
          customerEmail: formData.customerEmail || null,
          customerPhone: formData.customerPhone,
          roomId: formData.roomId || null,
          checkInDate: formData.checkIn,
          checkOutDate: formData.checkOut,
          guestCount: formData.guests,
          specialRequests: formData.notes,
          status: formData.status,
          totalPrice: formData.sellingPrice,
          originalPrice: formData.sellingPrice,
          commissionRate: formData.commissionRate,
          commissionAmount: formData.commissionAmount,
          shoppingMallId: formData.shoppingMallId || null,
          source: 'ADMIN'
        }),
      });

      if (response.ok) {
        alert('예약이 성공적으로 생성되었습니다!');
        setShowCreateModal(false);
        setFormData({
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          roomId: '',
          hotelId: '',
          checkIn: '',
          checkOut: '',
          guests: 1,
          notes: '',
          shoppingMallId: '',
          sellingPrice: 0,
          commissionRate: 0,
          commissionAmount: 0,
          supplyPrice: 0,
          status: 'RECEIVED',
          orderNumber: '',
          orderDate: ''
        });
        
        // 예약 목록으로 이동
        setActiveSection('reservations');
        
        // 예약 목록 즉시 새로고침 (강제로)
        console.log('예약 생성 완료, 목록 새로고침 시작...');
        
        // 잠시 대기 후 새로고침 (DB 반영 시간 고려)
        // 캐시 무효화 후 새로고침
        invalidateCache('reservations');
        invalidateCache('stats');
        
        setTimeout(async () => {
          console.log('지연된 새로고침 실행...');
          await Promise.all([fetchReservations(), fetchStats()]);
          console.log('목록 새로고침 완료');
        }, 1000);
        
        // 즉시 새로고침도 실행
        await Promise.all([fetchReservations(), fetchStats()]);
        console.log('즉시 새로고침 완료');
      } else {
        const errorData = await response.json();
        alert(`예약 생성 실패: ${errorData.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('예약 생성 오류:', error);
      alert('예약 생성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateReservationStatus = async (reservationId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // 캐시 무효화 후 새로고침
          invalidateCache('reservations');
          invalidateCache('stats');
          
          // 예약 목록과 통계 모두 새로고침
          console.log('예약 상태 변경 완료, 목록 새로고침...');
          await Promise.all([fetchReservations(), fetchStats()]);
          
          // 추가 지연 새로고침
          setTimeout(async () => {
            console.log('상태 변경 후 지연 새로고침...');
            await Promise.all([fetchReservations(), fetchStats()]);
          }, 500);
          
          alert('예약 상태가 변경되었습니다.');
        } else {
          alert('예약 상태 변경에 실패했습니다.');
        }
      } else {
        alert('예약 상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('예약 상태 변경 오류:', error);
      alert('예약 상태 변경 중 오류가 발생했습니다.');
    }
  };

  const handleHotelSubmit = async () => {
    if (!hotelForm.name) {
      alert('호텔명은 필수 항목입니다.');
      return;
    }

    try {
      const isEditing = editingHotel !== null;
      const url = isEditing ? `/api/admin/hotels/${editingHotel.id}` : '/api/admin/hotels';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hotelForm),
      });

      if (response.ok) {
        alert(isEditing ? '호텔이 성공적으로 수정되었습니다!' : '호텔이 성공적으로 등록되었습니다!');
        setShowHotelModal(false);
        setHotelForm({
          id: '',
          name: '',
          address: '',
          phone: '',
          email: '',
          description: ''
        });
        setEditingHotel(null);
        invalidateCache('hotels'); // 캐시 무효화
        await fetchHotels();
      } else {
        const errorData = await response.json();
        alert(`${isEditing ? '호텔 수정' : '호텔 등록'} 실패: ${errorData.message || errorData.error}`);
      }
    } catch (error) {
      console.error('호텔 처리 오류:', error);
      alert('호텔 처리 중 오류가 발생했습니다.');
    }
  };

  const handleHotelEdit = (hotel: any) => {
    setEditingHotel(hotel);
    setHotelForm({
      id: hotel.id,
      name: hotel.name,
      address: hotel.address || '',
      phone: hotel.phone || '',
      email: hotel.email || '',
      description: hotel.description || ''
    });
    setShowHotelModal(true);
  };

  const handleHotelDelete = async (hotelId: string) => {
    if (!confirm('정말로 이 호텔을 삭제하시겠습니까? 관련된 패키지들도 함께 삭제됩니다.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/hotels/${hotelId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('호텔이 성공적으로 삭제되었습니다!');
        invalidateCache('hotels'); // 캐시 무효화
        await fetchHotels();
      } else {
        const errorData = await response.json();
        alert(`호텔 삭제 실패: ${errorData.message || errorData.error}`);
      }
    } catch (error) {
      console.error('호텔 삭제 오류:', error);
      alert('호텔 삭제 중 오류가 발생했습니다.');
    }
  };

  const handlePackageSubmit = async () => {
    if (!packageForm.name.trim()) {
      alert('패키지명은 필수입니다.');
      return;
    }

    if (!packageForm.hotelId) {
      alert('호텔 선택은 필수입니다.');
      return;
    }

    if (!packageForm.price || packageForm.price <= 0) {
      alert('유효한 가격을 입력해주세요.');
      return;
    }

    setPackageLoading(true);
    try {
      const isEditing = editingPackage !== null;
      const url = isEditing ? `/api/admin/packages/${editingPackage.id}` : '/api/admin/packages';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: packageForm.name.trim(),
          description: packageForm.description?.trim() || null,
          price: packageForm.price,
          hotelId: packageForm.hotelId
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(isEditing ? '패키지가 성공적으로 수정되었습니다.' : '패키지가 성공적으로 등록되었습니다.');
        setShowPackageModal(false);
        setPackageForm({ id: '', name: '', description: '', price: 0, hotelId: '' });
        setEditingPackage(null);
        invalidateCache('packages'); // 캐시 무효화
        fetchPackages(selectedHotelForPackage); // 목록 새로고침
      } else {
        alert(`${isEditing ? '패키지 수정' : '패키지 등록'} 실패: ${data.error}`);
      }
    } catch (error) {
      console.error('패키지 처리 오류:', error);
      alert('패키지 처리 중 오류가 발생했습니다.');
    } finally {
      setPackageLoading(false);
    }
  };

  const handlePackageEdit = (pkg: any) => {
    setEditingPackage(pkg);
    setPackageForm({
      id: pkg.id,
      name: pkg.name,
      description: pkg.description || '',
      price: pkg.price,
      hotelId: pkg.hotelId
    });
    setShowPackageModal(true);
  };

  const handlePackageDelete = async (packageId: string) => {
    if (!confirm('정말로 이 패키지를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/packages?id=${packageId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        alert('패키지가 성공적으로 삭제되었습니다!');
        invalidateCache('packages'); // 캐시 무효화
        fetchPackages(selectedHotelForPackage);
      } else {
        alert(`패키지 삭제 실패: ${data.error}`);
      }
    } catch (error) {
      console.error('패키지 삭제 오류:', error);
      alert('패키지 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleShoppingMallSubmit = async () => {
    if (!shoppingMallForm.name.trim()) {
      alert('쇼핑몰명은 필수입니다.');
      return;
    }

    if (shoppingMallForm.commissionRate < 0 || shoppingMallForm.commissionRate > 100) {
      alert('수수료율은 0-100 사이의 값이어야 합니다.');
      return;
    }

    try {
      const isEditing = editingShoppingMall !== null;
      const url = isEditing ? `/api/admin/shopping-malls/${editingShoppingMall.id}` : '/api/admin/shopping-malls';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: shoppingMallForm.name.trim(),
          commissionRate: shoppingMallForm.commissionRate,
          description: shoppingMallForm.description?.trim() || null
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(isEditing ? '쇼핑몰이 성공적으로 수정되었습니다.' : '쇼핑몰이 성공적으로 등록되었습니다.');
        setShowShoppingMallModal(false);
        setShoppingMallForm({ 
          id: '', 
          name: '', 
          commissionRate: 0, 
          description: '',
          settlementCycle: 'MONTHLY',
          settlementDay: 1,
          lastSettlementDate: null,
          nextSettlementDate: null,
        });
        setEditingShoppingMall(null);
        invalidateCache('shoppingMalls'); // 캐시 무효화
        fetchShoppingMalls();
      } else {
        alert(`${isEditing ? '쇼핑몰 수정' : '쇼핑몰 등록'} 실패: ${data.error}`);
      }
    } catch (error) {
      console.error('쇼핑몰 처리 오류:', error);
      alert('쇼핑몰 처리 중 오류가 발생했습니다.');
    }
  };

  const handleShoppingMallEdit = (mall: any) => {
    setEditingShoppingMall(mall);
            setShoppingMallForm({
          id: mall.id,
          name: mall.name,
          commissionRate: mall.commissionRate,
          description: mall.description || '',
          settlementCycle: mall.settlementCycle || 'MONTHLY',
          settlementDay: mall.settlementDay || 1,
          lastSettlementDate: mall.lastSettlementDate,
          nextSettlementDate: mall.nextSettlementDate,
        });
    setShowShoppingMallModal(true);
  };

  const handleShoppingMallDelete = async (mallId: string) => {
    if (!confirm('정말로 이 쇼핑몰을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/shopping-malls/${mallId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        alert('쇼핑몰이 성공적으로 삭제되었습니다!');
        invalidateCache('shoppingMalls'); // 캐시 무효화
        fetchShoppingMalls();
      } else {
        alert(`쇼핑몰 삭제 실패: ${data.error}`);
      }
    } catch (error) {
      console.error('쇼핑몰 삭제 오류:', error);
      alert('쇼핑몰 삭제 중 오류가 발생했습니다.');
    }
  };

  // 전체 선택/해제
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReservations(filteredReservations.map(r => r.id));
    } else {
      setSelectedReservations([]);
    }
  };

  // 개별 선택/해제
  const handleSelectReservation = (reservationId: string, checked: boolean) => {
    if (checked) {
      setSelectedReservations(prev => [...prev, reservationId]);
    } else {
      setSelectedReservations(prev => prev.filter(id => id !== reservationId));
    }
  };

  // 일괄 상태 변경
  const handleBulkStatusChange = async () => {
    if (!bulkAction || selectedReservations.length === 0) {
      alert('선택된 예약과 변경할 상태를 선택해주세요.');
      return;
    }

    if (!confirm(`선택된 ${selectedReservations.length}개 예약을 ${bulkAction === 'CONFIRMED' ? '확정' : bulkAction === 'CANCELLED' ? '취소' : '대기'} 상태로 변경하시겠습니까?`)) {
      return;
    }

    try {
      const promises = selectedReservations.map(id => 
        fetch(`/api/admin/reservations/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: bulkAction })
        })
      );

      await Promise.all(promises);
      alert('일괄 상태 변경이 완료되었습니다.');
      setSelectedReservations([]);
      setBulkAction('');
      fetchReservations();
    } catch (error) {
      console.error('일괄 상태 변경 실패:', error);
      alert('일괄 상태 변경에 실패했습니다.');
    }
  };

  // 일괄 삭제
  const handleBulkDelete = async () => {
    if (selectedReservations.length === 0) {
      alert('삭제할 예약을 선택해주세요.');
      return;
    }

    if (!confirm(`선택된 ${selectedReservations.length}개 예약을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      const promises = selectedReservations.map(id => 
        fetch(`/api/admin/reservations/${id}`, {
          method: 'DELETE'
        })
      );

      await Promise.all(promises);
      alert('일괄 삭제가 완료되었습니다.');
      setSelectedReservations([]);
      fetchReservations();
    } catch (error) {
      console.error('일괄 삭제 실패:', error);
      alert('일괄 삭제에 실패했습니다.');
    }
  };

  // 엑셀 내보내기 함수 (동적 로딩)
  const handleExportToExcel = async () => {
    try {
      const XLSX = await loadXLSX();
      
      // 내보낼 데이터 준비
      const exportData = filteredReservations.map(reservation => ({
        '고객명': reservation.guestName || '',
        '전화번호': reservation.guestPhone || '',
        '이메일': reservation.guestEmail || '',
        '호텔': reservation.hotel?.name || '호텔 미지정',
        '객실': reservation.room?.name || '객실 미지정',
        '체크인': reservation.checkInDate ? new Date(reservation.checkInDate).toLocaleDateString('ko-KR') : '',
        '체크아웃': reservation.checkOutDate ? new Date(reservation.checkOutDate).toLocaleDateString('ko-KR') : '',
        '투숙객 수': reservation.guests || 0,
        '주문번호': reservation.orderNumber || '',
        '주문일': reservation.orderDate ? new Date(reservation.orderDate).toLocaleDateString('ko-KR') : '',
        '쇼핑몰': reservation.shoppingMall?.name || '',
        '판매가': reservation.sellingPrice ? formatNumber(reservation.sellingPrice) + '원' : '',
        '공급가': reservation.supplyPrice ? formatNumber(reservation.supplyPrice) + '원' : '',
        '수수료율': reservation.commissionRate ? reservation.commissionRate + '%' : '',
        '수수료액': reservation.commissionAmount ? formatNumber(reservation.commissionAmount) + '원' : '',
        '상태': getStatusText(reservation.status),
        '메모': reservation.notes || '',
        '등록일': reservation.createdAt ? new Date(reservation.createdAt).toLocaleDateString('ko-KR') : ''
      }));

      // 워크북 생성
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // 열 너비 자동 조정
      const colWidths = [
        { wch: 15 }, // 고객명
        { wch: 15 }, // 전화번호
        { wch: 25 }, // 이메일
        { wch: 20 }, // 호텔
        { wch: 15 }, // 객실
        { wch: 12 }, // 체크인
        { wch: 12 }, // 체크아웃
        { wch: 10 }, // 투숙객 수
        { wch: 15 }, // 주문번호
        { wch: 12 }, // 주문일
        { wch: 15 }, // 쇼핑몰
        { wch: 12 }, // 판매가
        { wch: 12 }, // 공급가
        { wch: 10 }, // 수수료율
        { wch: 12 }, // 수수료액
        { wch: 10 }, // 상태
        { wch: 30 }, // 메모
        { wch: 12 }  // 등록일
      ];
      ws['!cols'] = colWidths;

      // 워크시트를 워크북에 추가
      XLSX.utils.book_append_sheet(wb, ws, '예약목록');

      // 파일명 생성 (현재 날짜 포함)
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const fileName = `예약목록_${dateStr}.xlsx`;

      // 파일 다운로드
      XLSX.writeFile(wb, fileName);

      alert('엑셀 파일이 성공적으로 다운로드되었습니다.');
    } catch (error) {
      console.error('엑셀 내보내기 오류:', error);
      alert('엑셀 내보내기 중 오류가 발생했습니다.');
    }
  };

  // 상태 텍스트 변환 함수
  const getStatusText = (status: string) => {
    switch (status) {
      case 'RECEIVED': return '접수';
      case 'CONFIRMED': return '확정';
      case 'PENDING': return '대기';
      case 'CANCELLED': return '취소';
      default: return status;
    }
  };

  // AI 연결 및 오류 테스트 함수들 (sectionContent보다 먼저 정의)
  const connectToAI = async () => {
    console.log('🤖 [AI 연결] 관리자 페이지에서 AI 연결 요청');
    
    try {
      // 현재 페이지 상태 정보 수집
      const pageInfo = {
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        activeSection: activeSection,
        currentDate: currentDate,
        dbInfo: dbInfo,
        stats: stats
      };

      console.log('🤖 [AI 연결] 페이지 정보:', pageInfo);

      // AI에게 연결 요청 전송
      const response = await fetch('/api/admin/error-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'ai_connection',
          message: '관리자 페이지에서 AI 연결 요청',
          url: window.location.href,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          errorId: `ai-connection-${Date.now()}`,
          pageInfo: pageInfo,
          consoleLog: '[AI 연결] 관리자 페이지 접속 - 실시간 모니터링 시작'
        })
      });

      const data = await response.json();
      console.log('✅ [AI 연결] AI 연결 성공:', data);
      
      // AI 연결 상태 업데이트
      setAiConnected(true);
      setAiConnectionTime(new Date().toLocaleString('ko-KR'));
      
      alert('🤖 AI와 연결되었습니다!\n실시간 모니터링이 시작됩니다.');
      
    } catch (error) {
      console.error('❌ [AI 연결] AI 연결 실패:', error);
      setAiConnected(false);
      setAiConnectionTime('');
      alert('❌ AI 연결 실패');
    }
  };

  const disconnectFromAI = () => {
    console.log('🔌 [AI 연결 해제] AI 연결 해제');
    
    // AI 연결 상태 해제
    setAiConnected(false);
    setAiConnectionTime('');
    
    alert('🔌 AI 연결이 해제되었습니다.');
  };

  // AI 오류 테스트 함수들
  const triggerJavaScriptError = () => {
    console.log('🚨 [AI 확인] JavaScript 오류 테스트 시작');
    try {
      const obj = null;
      obj.nonExistentMethod();
    } catch (error: any) {
      console.error('🚨 [AI 확인] JavaScript 오류 발생:', error);
      console.error('🚨 [AI 확인] 오류 타입: JavaScript 문법 오류');
      console.error('🚨 [AI 확인] 오류 위치: 관리자 페이지 JavaScript 오류 테스트 버튼');
      console.error('🚨 [AI 확인] 발생 시간:', new Date().toLocaleString('ko-KR'));
      console.error('🚨 [AI 확인] 현재 URL:', window.location.href);
      console.error('🚨 [AI 확인] 사용자 에이전트:', navigator.userAgent);
      console.error('🚨 [AI 확인] 스택 트레이스:', error.stack);
      
      // AI에게 전송
      reportErrorToAI('javascript', error.message, error.stack);
    }
  };

  const triggerPromiseError = () => {
    console.log('⚠️ [AI 확인] Promise 오류 테스트 시작');
    Promise.reject(new Error('테스트 Promise 오류 - 관리자 페이지에서 발생'))
      .catch(error => {
        console.error('⚠️ [AI 확인] Promise 오류 발생:', error);
        console.error('⚠️ [AI 확인] 오류 타입: Promise 처리 오류');
        console.error('⚠️ [AI 확인] 오류 위치: 관리자 페이지 Promise 오류 테스트 버튼');
        console.error('⚠️ [AI 확인] 발생 시간:', new Date().toLocaleString('ko-KR'));
        console.error('⚠️ [AI 확인] 현재 URL:', window.location.href);
        console.error('⚠️ [AI 확인] 사용자 에이전트:', navigator.userAgent);
        console.error('⚠️ [AI 확인] 스택 트레이스:', error.stack);
        
        // AI에게 전송
        reportErrorToAI('promise', error.message, error.stack);
      });
  };

  const triggerNetworkError = () => {
    console.log('🌐 [AI 확인] 네트워크 오류 테스트 시작');
    fetch('/api/non-existent-endpoint')
      .then(response => response.json())
      .catch(error => {
        console.error('🌐 [AI 확인] 네트워크 오류 발생:', error);
        console.error('🌐 [AI 확인] 오류 타입: API 호출 오류');
        console.error('🌐 [AI 확인] 오류 위치: 관리자 페이지 네트워크 오류 테스트 버튼');
        console.error('🌐 [AI 확인] 발생 시간:', new Date().toLocaleString('ko-KR'));
        console.error('🌐 [AI 확인] 현재 URL:', window.location.href);
        console.error('🌐 [AI 확인] 사용자 에이전트:', navigator.userAgent);
        console.error('🌐 [AI 확인] 요청 URL: /api/non-existent-endpoint');
        console.error('🌐 [AI 확인] 오류 메시지:', error.message);
        
        // AI에게 전송
        reportErrorToAI('network', error.message, error.stack);
      });
  };

  const reportManualError = () => {
    console.log('📝 [AI 확인] 수동 오류 보고 시작');
    const errorMessage = '관리자 페이지에서 수동으로 오류를 발생시켰습니다!';
    console.error('📝 [AI 확인] 수동 오류 발생:', errorMessage);
    console.error('📝 [AI 확인] 오류 타입: 사용자 수동 오류');
    console.error('📝 [AI 확인] 오류 위치: 관리자 페이지 AI에게 전송 버튼');
    console.error('📝 [AI 확인] 발생 시간:', new Date().toLocaleString('ko-KR'));
    console.error('📝 [AI 확인] 현재 URL:', window.location.href);
    console.error('📝 [AI 확인] 사용자 에이전트:', navigator.userAgent);
    console.error('📝 [AI 확인] 오류 ID: admin-' + Date.now());
    
    // AI에게 전송
    reportErrorToAI('manual', errorMessage, null);
  };

  // AI에게 오류 전송하는 공통 함수
  const reportErrorToAI = (type: string, message: string, stack?: string | null) => {
    fetch('/api/admin/error-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: type,
        message: message,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        errorId: `${type}-${Date.now()}`,
        stack: stack,
        consoleLog: `[${type.toUpperCase()}] ${message} - 관리자 페이지에서 발생`
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log('✅ [AI 확인] 오류가 AI에게 성공적으로 전송되었습니다:', data);
      alert(`🚨 오류가 AI에게 전송되었습니다!\n타입: ${type}\n메시지: ${message}`);
    })
    .catch(error => {
      console.error('❌ [AI 확인] 오류 전송 실패:', error);
      alert('❌ 오류 전송 실패');
    });
  };

  const reportPageStatus = async () => {
    console.log('📊 [AI 확인] 페이지 상태 보고');
    
    try {
      // 현재 페이지의 모든 상태 정보 수집
      const statusInfo = {
        activeSection: activeSection,
        reservations: reservations.length,
        hotels: hotels.length,
        packages: packages.length,
        shoppingMalls: shoppingMalls.length,
        stats: stats,
        dbInfo: dbInfo,
        loading: loading,
        statsLoading: statsLoading
      };

      console.log('📊 [AI 확인] 페이지 상태:', statusInfo);

      // AI에게 상태 정보 전송
      const response = await fetch('/api/admin/error-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'page_status',
          message: '관리자 페이지 상태 보고',
          url: window.location.href,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          errorId: `status-${Date.now()}`,
          statusInfo: statusInfo,
          consoleLog: '[페이지 상태] 관리자 페이지 현재 상태 전송'
        })
      });

      const data = await response.json();
      console.log('✅ [AI 확인] 상태 보고 성공:', data);
      alert('📊 페이지 상태가 AI에게 전송되었습니다!');
      
    } catch (error) {
      console.error('❌ [AI 확인] 상태 보고 실패:', error);
      alert('❌ 상태 보고 실패');
    }
  };

  const reportDBStatus = async () => {
    console.log('🗄️ [AI 확인] DB 상태 확인 및 보고');
    
    try {
      // DB 상태 확인
      const dbResponse = await fetch('/api/health/db');
      const dbData = await dbResponse.json();
      
      // Prisma 상태 확인
      const prismaResponse = await fetch('/api/admin/prisma-status');
      const prismaData = await prismaResponse.json();
      
      // 추가 DB 정보 수집
      const additionalDbInfo = {
        currentUrl: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        activeSection: activeSection,
        dbInfo: dbInfo,
        consoleErrors: [] as string[]
      };
      
      console.log('🗄️ [AI 확인] DB 상태:', dbData);
      console.log('⚙️ [AI 확인] Prisma 상태:', prismaData);
      console.log('📊 [AI 확인] 추가 DB 정보:', additionalDbInfo);

      // AI에게 DB 상태 전송
      const response = await fetch('/api/admin/error-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'db_status',
          message: 'DB 상태 확인 결과 - 상세 분석 필요',
          url: window.location.href,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          errorId: `db-status-${Date.now()}`,
          dbStatus: dbData,
          prismaStatus: prismaData,
          additionalInfo: additionalDbInfo,
          consoleLog: '[DB 상태] DB 및 Prisma 상태 상세 전송 - AI 분석 필요'
        })
      });

      const data = await response.json();
      console.log('✅ [AI 확인] DB 상태 보고 성공:', data);
      
      // 문제가 있는지 확인하고 AI에게 자동 수정 요청
      if (dbData.connected === false || prismaData.schemaGenerated === false) {
        alert('🚨 DB 문제 발견!\nAI가 자동으로 수정을 시도합니다.');
        
        // 추가로 DB 오류를 AI에게 전송
        fetch('/api/admin/error-report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'database',
            message: 'DB 연결 문제 감지 - AI 자동 수정 필요',
            url: window.location.href,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            errorId: `db-fix-${Date.now()}`,
            dbStatus: dbData,
            prismaStatus: prismaData,
            consoleLog: '[DB 오류] DB 문제 감지 - AI 자동 수정 시작'
          })
        });
      } else {
        alert('✅ DB 상태 정상!\n모든 연결이 정상 작동 중입니다.');
      }
      
    } catch (error) {
      console.error('❌ [AI 확인] DB 상태 확인 실패:', error);
      
      // 오류도 AI에게 전송
      fetch('/api/admin/error-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'database',
          message: `DB 상태 확인 중 오류 발생: ${error}`,
          url: window.location.href,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          errorId: `db-error-${Date.now()}`,
          stack: error instanceof Error ? error.stack : undefined,
          consoleLog: '[DB 오류] DB 상태 확인 실패 - AI 수정 필요'
        })
      });
      
      alert('❌ DB 상태 확인 실패\n오류가 AI에게 전송되었습니다.');
    }
  };

  const sectionContent = {
    dashboard: (
      <div className="space-y-8">
        {/* 시스템 현황 테이블 */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800">📊 시스템 현황</h3>
            <p className="text-sm text-gray-600 mt-1">실시간 시스템 상태 및 통계</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    항목
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    수량
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-lg mr-3">📅</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">총 예약</div>
                        <div className="text-sm text-gray-500">전체 예약 건수</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-2xl font-bold text-blue-600">
                      {statsLoading ? '...' : stats.totalReservations}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      정상
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => {
                        setActiveSection('reservations');
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      관리 →
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-lg mr-3">🏨</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">객실</div>
                        <div className="text-sm text-gray-500">등록된 객실 수</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-2xl font-bold text-purple-600">
                      {statsLoading ? '...' : stats.activeRooms}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      정상
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => {
                        setActiveSection('rooms');
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      관리 →
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-lg mr-3">📦</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">패키지</div>
                        <div className="text-sm text-gray-500">등록된 패키지 수</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-2xl font-bold text-orange-600">
                      {statsLoading ? '...' : stats.totalPackages}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      정상
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => {
                        setActiveSection('packages');
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      관리 →
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-lg mr-3">🧾</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">부가세 관리</div>
                        <div className="text-sm text-gray-500">부가세 설정 및 신고</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-2xl font-bold text-red-600">
                      활성
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      정상
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => {
                        setActiveSection('vat');
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      관리 →
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-lg mr-3">🤖</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">AI 연결 상태</div>
                        <div className="text-sm text-gray-500">실시간 모니터링</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-2xl font-bold text-gray-600">
                      {aiConnected ? '연결됨' : '연결 안됨'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${aiConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        aiConnected 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {aiConnected ? '연결됨' : '연결 안됨'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => {
                        setActiveSection('ai-test');
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      테스트 →
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 빠른 액션 */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">🚀 빠른 액션</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <button 
              onClick={() => {
                setModalType('reservation');
                setShowCreateModal(true);
              }}
              className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
            >
              <div className="text-2xl mb-2">📅</div>
              <div className="font-semibold">새 예약</div>
              <div className="text-sm opacity-90">예약 생성</div>
            </button>
            <button 
              onClick={() => {
                setActiveSection('rooms');
              }}
              className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200"
            >
              <div className="text-2xl mb-2">🏨</div>
              <div className="font-semibold">객실 관리</div>
              <div className="text-sm opacity-90">객실 등록/수정</div>
            </button>
            <button 
              onClick={() => {
                setActiveSection('packages');
              }}
              className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
            >
              <div className="text-2xl mb-2">📦</div>
              <div className="font-semibold">패키지 관리</div>
              <div className="text-sm opacity-90">패키지 등록/수정</div>
            </button>
            <button 
              onClick={() => {
                setActiveSection('shopping-malls');
              }}
              className="p-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-200"
            >
              <div className="text-2xl mb-2">🛍️</div>
              <div className="font-semibold">쇼핑몰 관리</div>
              <div className="text-sm opacity-90">수수료 설정</div>
            </button>
            <button 
              onClick={() => {
                setActiveSection('ai-test');
              }}
              className="p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200"
            >
              <div className="text-2xl mb-2">🤖</div>
              <div className="font-semibold">AI 테스트</div>
              <div className="text-sm opacity-90">오류 테스트</div>
            </button>
          </div>
        </div>
      </div>
    ),
    database: (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🗄️ 데이터베이스 관리</h2>
          
          {/* DB 정보 */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">데이터베이스 상태</h3>
            {dbLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">DB 정보를 불러오는 중...</p>
              </div>
            ) : dbInfo ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">연결 상태</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${dbInfo.dbStatus?.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`text-sm font-medium ${dbInfo.dbStatus?.status === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
                      {dbInfo.dbStatus?.status === 'connected' ? '연결됨' : '연결 안됨'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">데이터베이스:</span>
                    <p className="font-medium">{dbInfo.dbStatus?.data?.databaseUrl?.split('/').pop() || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">DB 타입:</span>
                    <p className="font-medium">{dbInfo.dbStatus?.dbType || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">객실 수:</span>
                    <p className="font-medium">{dbInfo.dbStatus?.data?.roomCount || 0}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">패키지 수:</span>
                    <p className="font-medium">{dbInfo.dbStatus?.data?.packageCount || 0}</p>
                  </div>
                </div>

                {dbInfo.prismaStatus?.database?.tables && (
                  <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-800 mb-3">테이블 정보</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-2">
                        총 {dbInfo.prismaStatus.database.tables.length}개 테이블
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {dbInfo.prismaStatus.database.tables.slice(0, 6).map((table: any, index: number) => (
                          <div key={index} className="text-sm bg-white px-2 py-1 rounded">
                            {table.name} ({table.recordCount}개)
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                {dbError ? (
                  <div className="space-y-4">
                    <div className="text-red-600 font-medium">
                      🚨 DB 정보를 불러올 수 없습니다
                    </div>
                    <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
                      오류: {dbError}
                    </div>
                    <div className="text-xs text-gray-600">
                      AI가 자동으로 문제를 분석하고 수정을 시도합니다.
                    </div>
                    <button
                      onClick={() => {
                        fetchDbInfo();
                        reportDBStatus();
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                    >
                      🔄 재시도 및 AI 분석
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    DB 정보를 불러올 수 없습니다.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Prisma 상태 */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Prisma 상태</h3>
            {prismaLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Prisma 상태를 불러오는 중...</p>
              </div>
            ) : prismaStatus ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">연결 상태</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${prismaStatus.connection?.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`text-sm font-medium ${prismaStatus.connection?.isConnected ? 'text-green-600' : 'text-red-600'}`}>
                      {prismaStatus.connection?.isConnected ? '연결됨' : '연결 안됨'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">응답 시간:</span>
                    <p className="font-medium">{prismaStatus.connection?.responseTime || 'N/A'}ms</p>
                  </div>
                  <div>
                    <span className="text-gray-600">스키마 생성:</span>
                    <p className="font-medium">{prismaStatus.schema?.isGenerated ? '완료' : '미완료'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">마이그레이션:</span>
                    <p className="font-medium">{prismaStatus.migrations?.isUpToDate ? '최신' : '업데이트 필요'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">생성 시간:</span>
                    <p className="font-medium">{prismaStatus.generatedAt || 'N/A'}</p>
                  </div>
                </div>

                {prismaStatus.migrations && !prismaStatus.migrations.isUpToDate && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">대기 중인 마이그레이션</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {prismaStatus.migrations.pendingMigrations?.map((migration: string, index: number) => (
                        <li key={index}>• {migration}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Prisma 상태를 불러올 수 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    vat: (
      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96 rounded-lg flex items-center justify-center"><span>VAT 관리 로딩 중...</span></div>}>
        <VATManagementPage />
      </Suspense>
    ),
    'ai-test': (
      <div className="space-y-6">
        {/* AI 연결 및 상태 확인 */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-blue-800 mb-1">
                🤖 AI 연결 및 상태 확인
              </h2>
              <p className="text-blue-600 text-sm">
                AI와 연결하고 현재 상태를 확인합니다
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full ${aiConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-sm font-medium ${
                  aiConnected ? 'text-green-600' : 'text-red-600'
                }`}>
                  {aiConnected ? '연결됨' : '연결 안됨'}
                </span>
              </div>
              <div className="text-2xl">🤖</div>
            </div>
          </div>
          
          {aiConnected && aiConnectionTime && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✅</span>
                <span className="text-sm text-green-800">
                  AI 연결됨 - {aiConnectionTime}
                </span>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <button
              onClick={connectToAI}
              className={`p-3 rounded-lg transition-colors text-sm font-medium ${
                aiConnected 
                  ? 'bg-gray-500 text-white cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
              disabled={aiConnected}
            >
              {aiConnected ? '🤖 연결됨' : '🤖 AI 연결'}
            </button>
            
            <button
              onClick={disconnectFromAI}
              className={`p-3 rounded-lg transition-colors text-sm font-medium ${
                aiConnected 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!aiConnected}
            >
              🔌 연결 해제
            </button>
            
            <button
              onClick={reportPageStatus}
              className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
            >
              📊 페이지 상태
            </button>
            
            <button
              onClick={reportDBStatus}
              className="p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
            >
              🗄️ DB 상태
            </button>
          </div>
        </div>

        {/* AI 오류 테스트 */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-red-800 mb-1">
                🚨 AI 오류 테스트
              </h2>
              <p className="text-red-600 text-sm">
                버튼을 클릭하면 즉시 AI에게 오류가 전송됩니다!
              </p>
            </div>
            <div className="text-2xl">🚨</div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={triggerJavaScriptError}
              className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
            >
              🚨 JavaScript 오류
            </button>
            
            <button
              onClick={triggerPromiseError}
              className="p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
            >
              ⚠️ Promise 오류
            </button>
            
            <button
              onClick={triggerNetworkError}
              className="p-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
            >
              🌐 네트워크 오류
            </button>
            
            <button
              onClick={reportManualError}
              className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              📝 AI에게 전송
            </button>
          </div>
          
          <div className="mt-4 pt-4 border-t border-red-200">
            <div className="text-xs text-red-600">
              💡 AI 리포터가 실행 중이면 즉시 확인할 수 있습니다!
            </div>
            <div className="text-xs text-red-600 mt-1">
              💡 브라우저 콘솔(F12)에서 상세 로그를 확인하세요!
            </div>
          </div>
        </div>

        {/* 오류 모니터링 링크 */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">
                🛡️ 오류 모니터링
              </h2>
              <p className="text-gray-600 text-sm">
                실시간 오류 모니터링 대시보드
              </p>
            </div>
            <div className="text-2xl">🛡️</div>
          </div>
          
          <div className="text-center">
            <a
                              href="/admin/monitoring"
              className="inline-flex items-center px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm font-medium"
            >
              🛡️ 오류 모니터링 대시보드 열기
            </a>
          </div>
          
          <div className="mt-4 text-xs text-gray-600">
            💡 실시간으로 발생하는 모든 오류를 확인할 수 있습니다
          </div>
        </div>
      </div>
    ),
    'create-reservation': (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">➕ 새 예약 생성</h2>
            <p className="text-gray-600">새로운 예약을 생성합니다</p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  고객명 *
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="고객명을 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  전화번호
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formatPhoneNumber(formData.customerPhone)}
                  onChange={(e) => {
                    const rawValue = removePhoneFormatting(e.target.value);
                    if (rawValue.length <= 11) {
                      setFormData(prev => ({ ...prev, customerPhone: rawValue }));
                    }
                  }}
                  placeholder="010-0000-0000"
                  maxLength={13}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="이메일을 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  투숙객 수
                </label>
                <input
                  type="number"
                  name="guests"
                  value={formData.guests}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  체크인 날짜 *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="checkIn"
                    value={formData.checkIn}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium bg-white cursor-pointer hover:border-blue-400 transition-colors"
                    style={{ fontSize: '18px', fontWeight: '500' }}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      setFormData(prev => ({ ...prev, checkIn: today }));
                    }}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    오늘
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                      setFormData(prev => ({ ...prev, checkIn: tomorrow }));
                    }}
                    className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                  >
                    내일
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                      setFormData(prev => ({ ...prev, checkIn: nextWeek }));
                    }}
                    className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                  >
                    다음주
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  체크아웃 날짜 *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="checkOut"
                    value={formData.checkOut}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium bg-white cursor-pointer hover:border-blue-400 transition-colors"
                    style={{ fontSize: '18px', fontWeight: '500' }}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.checkIn) {
                        const checkInDate = new Date(formData.checkIn);
                        const nextDay = new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000);
                        setFormData(prev => ({ ...prev, checkOut: nextDay.toISOString().split('T')[0] }));
                      }
                    }}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    +1일
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.checkIn) {
                        const checkInDate = new Date(formData.checkIn);
                        const nextWeek = new Date(checkInDate.getTime() + 7 * 24 * 60 * 60 * 1000);
                        setFormData(prev => ({ ...prev, checkOut: nextWeek.toISOString().split('T')[0] }));
                      }
                    }}
                    className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                  >
                    +1주
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.checkIn) {
                        const checkInDate = new Date(formData.checkIn);
                        const nextMonth = new Date(checkInDate.getTime() + 30 * 24 * 60 * 60 * 1000);
                        setFormData(prev => ({ ...prev, checkOut: nextMonth.toISOString().split('T')[0] }));
                      }
                    }}
                    className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                  >
                    +1개월
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  판매가 *
                </label>
                <input
                  type="text"
                  name="sellingPrice"
                  value={formatNumber(formData.sellingPrice)}
                  onChange={(e) => {
                    const rawValue = removeCommas(e.target.value);
                    const price = parseFloat(rawValue) || 0;
                    setFormData(prev => {
                      const commissionRate = prev.commissionRate || 0;
                      const commissionAmount = (price * commissionRate) / 100;
                      const supplyPrice = price - commissionAmount;
                      return {
                        ...prev,
                        sellingPrice: price,
                        commissionAmount: commissionAmount,
                        supplyPrice: supplyPrice
                      };
                    });
                  }}
                  onFocus={(e) => {
                    if (e.target.value === '0') {
                      e.target.value = '';
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value === '') {
                      e.target.value = '0';
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="판매가를 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  수수료율 (%)
                </label>
                <input
                  type="text"
                  value={`${formData.commissionRate}%`}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  placeholder="쇼핑몰 선택 시 자동 설정"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  수수료 금액 (원)
                </label>
                <input
                  type="text"
                  value={formatNumber(formData.commissionAmount)}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  placeholder="자동 계산"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  공급가 (원)
                </label>
                <input
                  type="text"
                  value={formatNumber(formData.supplyPrice)}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  placeholder="자동 계산"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  쇼핑몰
                </label>
                <select
                  name="shoppingMallId"
                  value={formData.shoppingMallId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">쇼핑몰을 선택하세요</option>
                  {shoppingMalls.map((mall) => (
                    <option key={mall.id} value={mall.id}>
                      {mall.name} ({mall.commissionRate}% 수수료)
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  주문번호
                </label>
                <input
                  type="text"
                  name="orderNumber"
                  value={formData.orderNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="쇼핑몰 주문번호를 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  주문일시
                </label>
                <input
                  type="datetime-local"
                  name="orderDate"
                  value={formData.orderDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  예약 상태
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="RECEIVED">접수</option>
                  <option value="CONFIRMED">확정</option>
                  <option value="PENDING">대기</option>
                  <option value="CANCELLED">취소</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                특별 요청사항
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="특별 요청사항을 입력하세요"
              />
            </div>
            
            <div className="mt-8 flex justify-center space-x-4">
              <button
                onClick={() => setActiveSection('dashboard')}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => handleSubmit()}
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? '생성 중...' : '예약 생성'}
              </button>
            </div>
          </div>
        </div>
      </div>
    ),
    reservations: (
      <div className="space-y-6">
        {/* 예약 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
            <h3 className="text-lg font-semibold mb-2">총 예약</h3>
            <p className="text-3xl font-bold">{statsLoading ? '...' : stats.totalReservations}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
            <h3 className="text-lg font-semibold mb-2">오늘 예약</h3>
            <p className="text-3xl font-bold">{statsLoading ? '...' : stats.todayReservations}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white">
            <h3 className="text-lg font-semibold mb-2">이번 주</h3>
            <p className="text-3xl font-bold">{statsLoading ? '...' : stats.thisWeekReservations}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">예약 목록</h3>
              {searchTerm && (
                <p className="text-sm text-gray-600 mt-1">
                  '<span className="font-medium">{searchTerm}</span>' 검색 결과: {filteredReservations.length}개
                </p>
              )}
            </div>
          </div>

          {/* 상태별 필터링 탭 */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === 'ALL'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                전체 ({reservations.length})
              </button>
              <button
                onClick={() => setStatusFilter('RECEIVED')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === 'RECEIVED'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                접수 ({reservations.filter(r => r.status === 'RECEIVED').length})
              </button>
              <button
                onClick={() => setStatusFilter('CONFIRMED')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === 'CONFIRMED'
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                확정 ({reservations.filter(r => r.status === 'CONFIRMED').length})
              </button>
              <button
                onClick={() => setStatusFilter('PENDING')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === 'PENDING'
                    ? 'bg-white text-yellow-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                대기 ({reservations.filter(r => r.status === 'PENDING').length})
              </button>
              <button
                onClick={() => setStatusFilter('CANCELLED')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === 'CANCELLED'
                    ? 'bg-white text-red-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                취소 ({reservations.filter(r => r.status === 'CANCELLED').length})
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            {/* 검색 필드 */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="성함, 연락처, 이메일로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => Promise.all([fetchReservations(), fetchStats()])}
                disabled={loading}
                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <span>🔄</span>
                <span>{loading ? '새로고침 중...' : '새로고침'}</span>
              </button>
              {selectedReservations.length > 0 && (
                <div className="flex items-center space-x-2">
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">상태 변경</option>
                    <option value="RECEIVED">접수</option>
                    <option value="CONFIRMED">확정</option>
                    <option value="PENDING">대기</option>
                    <option value="CANCELLED">취소</option>
                  </select>
                  <button
                    onClick={() => handleBulkStatusChange()}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  >
                    일괄 변경
                  </button>
                  <button
                    onClick={() => handleBulkDelete()}
                    className="px-3 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                  >
                    일괄 삭제
                  </button>
                  <span className="text-sm text-gray-600">
                    {selectedReservations.length}개 선택됨
                  </span>
                </div>
              )}
              <button 
                onClick={() => handleExportToExcel()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mr-2"
              >
                📊 엑셀 내보내기
              </button>
              <button 
                onClick={() => {
                  setModalType('reservation');
                  setShowCreateModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                새 예약 생성
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedReservations.length === filteredReservations.length && filteredReservations.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    고객 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    호텔/객실
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    체크인/아웃
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    주문번호
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    쇼핑몰
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    수수료
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-4 text-center">로딩 중...</td>
                  </tr>
                ) : filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-4 text-center">
                      {searchTerm ? (
                        <div>
                          <div className="text-gray-600">'<span className="font-medium">{searchTerm}</span>'에 대한 검색 결과가 없습니다.</div>
                          <button 
                            onClick={() => setSearchTerm('')}
                            className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
                          >
                            검색어 지우기
                          </button>
                        </div>
                      ) : (
                        statusFilter === 'ALL' ? '예약 내역이 없습니다.' : `${statusFilter === 'CONFIRMED' ? '확정' : statusFilter === 'PENDING' ? '대기' : statusFilter === 'RECEIVED' ? '접수' : '취소'} 예약이 없습니다.`
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map((reservation, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedReservations.includes(reservation.id)}
                          onChange={(e) => handleSelectReservation(reservation.id, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{reservation.guestName}</div>
                        <div className="text-sm text-gray-500">{formatPhoneNumber(reservation.guestPhone)}</div>
                        {reservation.guestEmail && (
                          <div className="text-sm text-gray-500">{reservation.guestEmail}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{reservation.room?.hotel?.name || '호텔 미지정'}</div>
                          <div className="text-gray-500">{reservation.room?.name || '객실 미지정'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>체크인: {new Date(reservation.checkInDate).toLocaleDateString()}</div>
                          <div>체크아웃: {new Date(reservation.checkOutDate).toLocaleDateString()}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reservation.orderNumber ? (
                          <div>
                            <div className="font-medium">{reservation.orderNumber}</div>
                            {reservation.orderDate && (
                              <div className="text-xs text-gray-500">
                                {new Date(reservation.orderDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reservation.shoppingMall ? (
                          <div>
                            <div className="text-xs text-gray-500">{reservation.shoppingMall}</div>
                            <div className="font-medium">{formatNumber(reservation.originalPrice || 0)}원</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reservation.commissionRate > 0 ? (
                          <div>
                            <div className="text-xs text-gray-500">{reservation.commissionRate}%</div>
                            <div className="font-medium">{formatNumber(reservation.commissionAmount)}원</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={reservation.status}
                          onChange={(e) => updateReservationStatus(reservation.id, e.target.value)}
                          className={`px-2 py-1 text-xs font-semibold rounded-full border-0 focus:ring-2 focus:ring-offset-2 ${
                            reservation.status === 'CONFIRMED' 
                              ? 'bg-green-100 text-green-800 focus:ring-green-500' 
                              : reservation.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800 focus:ring-yellow-500'
                              : reservation.status === 'RECEIVED'
                              ? 'bg-blue-100 text-blue-800 focus:ring-blue-500'
                              : reservation.status === 'CANCELLED'
                              ? 'bg-red-100 text-red-800 focus:ring-red-500'
                              : 'bg-gray-100 text-gray-800 focus:ring-gray-500'
                          }`}
                        >
                          <option value="RECEIVED">접수</option>
                          <option value="PENDING">대기</option>
                          <option value="CONFIRMED">확정</option>
                          <option value="CANCELLED">취소</option>
                          <option value="COMPLETED">완료</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">수정</button>
                        <button className="text-red-600 hover:text-red-900">삭제</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    ),
    'calendar': (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
          <h2 className="text-2xl font-bold text-blue-900 mb-2">달력 뷰</h2>
          <p className="text-blue-700">체크인/체크아웃 일정과 고객 정보를 달력 형태로 확인합니다.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">예약 달력</h3>
            <a
              href="/admin/calendar"
              target="_blank"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              전체 화면 보기
            </a>
          </div>
          <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>}>
            <CalendarView />
          </Suspense>
        </div>
      </div>
    ),
    'sales': (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
          <h2 className="text-2xl font-bold text-green-900 mb-2">매출 관리</h2>
          <p className="text-green-700">확정된 예약의 월별/주간 매출 통계와 수수료 현황을 확인합니다.</p>
        </div>
        
        {/* 기간 선택 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">매출 통계</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setSalesPeriod('monthly');
                  fetchSalesData('monthly', salesRange);
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  salesPeriod === 'monthly'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                월별
              </button>
              <button
                onClick={() => {
                  setSalesPeriod('weekly');
                  fetchSalesData('weekly', salesRange);
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  salesPeriod === 'weekly'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                주간
              </button>
            </div>
          </div>

          {/* 조회 기간 선택 */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">조회 기간</h4>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setIsCustomRange(false);
                    setSalesRange('3months');
                    fetchSalesData(salesPeriod, '3months');
                  }}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    !isCustomRange && salesRange === '3months'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  3개월
                </button>
                <button
                  onClick={() => {
                    setIsCustomRange(false);
                    setSalesRange('6months');
                    fetchSalesData(salesPeriod, '6months');
                  }}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    !isCustomRange && salesRange === '6months'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  6개월
                </button>
                <button
                  onClick={() => {
                    setIsCustomRange(false);
                    setSalesRange('12months');
                    fetchSalesData(salesPeriod, '12months');
                  }}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    !isCustomRange && salesRange === '12months'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  12개월
                </button>
              </div>

                        {/* 커스텀 기간 선택 버튼 */}
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                isCustomRange
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📅 커스텀 기간
              {isCustomRange && (
                <span className="ml-2 text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                  선택됨
                </span>
              )}
            </button>
            
            {/* 커스텀 기간 초기화 버튼 */}
            {isCustomRange && (
              <button
                onClick={() => {
                  setIsCustomRange(false);
                  setShowDatePicker(false);
                  fetchSalesData(salesPeriod, salesRange);
                }}
                className="px-3 py-2 rounded-lg text-sm bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                title="커스텀 기간 초기화"
              >
                🔄 초기화
              </button>
            )}
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                💡 3개월: 빠른 조회, 6개월: 분기 분석, 12개월: 연간 트렌드
              </p>
              {isCustomRange && (
                <div className="text-sm text-purple-600 font-medium">
                  📅 커스텀 기간 선택됨
                </div>
              )}
            </div>

            {/* 커스텀 날짜 선택기 */}
            {showDatePicker && (
              <div className="mt-4 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-lg font-semibold text-gray-800 mb-3">시작일</label>
                    <CustomDatePicker
                      value={customDateRange.startDate.toISOString().split('T')[0]}
                      onChange={(date) => {
                        const newStartDate = new Date(date);
                        setCustomDateRange(prev => ({ ...prev, startDate: newStartDate }));
                      }}
                      placeholder="시작일을 선택하세요"
                      maxDate={customDateRange.endDate}
                      showQuickSelect={false}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-semibold text-gray-800 mb-3">종료일</label>
                    <CustomDatePicker
                      value={customDateRange.endDate.toISOString().split('T')[0]}
                      onChange={(date) => {
                        const newEndDate = new Date(date);
                        setCustomDateRange(prev => ({ ...prev, endDate: newEndDate }));
                      }}
                      placeholder="종료일을 선택하세요"
                      minDate={customDateRange.startDate}
                      showQuickSelect={false}
                      className="w-full"
                    />
                  </div>
                </div>
                
                {/* 선택된 기간 표시 */}
                <div className="mb-6 p-4 bg-white rounded-lg border border-purple-200">
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-purple-800 mb-2">선택된 기간</h4>
                    <p className="text-2xl font-bold text-gray-900">
                      {customDateRange.startDate.toLocaleDateString('ko-KR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })} ~ {customDateRange.endDate.toLocaleDateString('ko-KR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      총 {Math.ceil((customDateRange.endDate.getTime() - customDateRange.startDate.getTime()) / (1000 * 60 * 60 * 24))}일
                    </p>
                  </div>
                </div>

                {/* 액션 버튼들 */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setIsCustomRange(true);
                      fetchSalesData(salesPeriod, undefined, customDateRange);
                      setShowDatePicker(false);
                    }}
                    className="flex-1 px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    📊 조회하기
                  </button>
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="px-6 py-3 text-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all duration-200"
                  >
                    닫기
                  </button>
                </div>
              </div>
            )}
          </div>

          {salesLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* 매출 요약 카드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-green-500">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">총 매출</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(salesData.summary?.totalSales || 0)}원
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    확정 예약 {salesData.summary?.totalBookings || 0}건
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-blue-500">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">총 수수료</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(salesData.summary?.totalCommission || 0)}원
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    수수료율 평균
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-purple-500">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">총 공급가</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(salesData.summary?.totalSupplyPrice || 0)}원
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    부가세 제외
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-orange-500">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">총 부가세</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(salesData.summary?.totalVAT || 0)}원
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    공급가의 10%
                  </p>
                </div>
              </div>

              {/* 기간 정보 */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">
                      {salesData.periodInfo?.periodName || '기간'} 매출 현황
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {salesData.periodInfo?.startDate && new Date(salesData.periodInfo.startDate).toLocaleDateString()} ~ 
                      {salesData.periodInfo?.endDate && new Date(salesData.periodInfo.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">
                      평균 매출
                    </p>
                    <p className="text-lg font-bold text-green-600">
                      {formatNumber(salesData.summary?.averageSales || 0)}원
                    </p>
                  </div>
                </div>
              </div>

              {/* 상태별 예약 현황 */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">상태별 예약 현황</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {salesData.statusCounts?.RECEIVED || 0}
                    </div>
                    <div className="text-sm text-blue-700">접수</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {salesData.statusCounts?.PENDING || 0}
                    </div>
                    <div className="text-sm text-yellow-700">대기</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {salesData.statusCounts?.CONFIRMED || 0}
                    </div>
                    <div className="text-sm text-green-700">확정</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {salesData.statusCounts?.CANCELLED || 0}
                    </div>
                    <div className="text-sm text-red-700">취소</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    ),
    'shopping-malls': (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-lg border border-teal-200">
          <h2 className="text-2xl font-bold text-teal-900 mb-2">쇼핑몰 관리</h2>
          <p className="text-teal-700">예약 시스템과 연동되는 쇼핑몰을 관리합니다.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-teal-500">
            <h3 className="text-sm font-medium text-gray-600 mb-2">총 쇼핑몰</h3>
            <p className="text-2xl font-bold text-gray-900">
              {shoppingMallLoading ? '...' : shoppingMalls.length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-blue-500">
            <h3 className="text-sm font-medium text-gray-600 mb-2">활성 쇼핑몰</h3>
            <p className="text-2xl font-bold text-gray-900">
              {shoppingMallLoading ? '...' : shoppingMalls.filter((mall) => mall.isActive).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-orange-500">
            <h3 className="text-sm font-medium text-gray-600 mb-2">비활성 쇼핑몰</h3>
            <p className="text-2xl font-bold text-gray-900">
              {shoppingMallLoading ? '...' : shoppingMalls.filter((mall) => !mall.isActive).length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">쇼핑몰 목록</h3>
            <button 
              onClick={() => {
                setModalType('shoppingMall');
                setShowCreateModal(true);
              }}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              새 쇼핑몰 등록
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    쇼핑몰명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    수수료율
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    정산주기
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shoppingMallLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center">로딩 중...</td>
                  </tr>
                ) : shoppingMalls.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center">쇼핑몰 등록이 없습니다.</td>
                  </tr>
                ) : (
                  shoppingMalls.map((mall, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{mall.name}</div>
                        <div className="text-sm text-gray-500">{mall.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {mall.commissionRate}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {mall.settlementCycle === 'MONTHLY' ? '월별' : 
                             mall.settlementCycle === 'WEEKLY' ? '주별' : 
                             mall.settlementCycle === 'DAILY' ? '일별' : '미설정'}
                          </span>
                          {mall.settlementDay && (
                            <span className="text-xs text-gray-500">
                              {mall.settlementCycle === 'MONTHLY' ? `${mall.settlementDay}일` :
                               mall.settlementCycle === 'WEEKLY' ? 
                                 ['월', '화', '수', '목', '금', '토', '일'][mall.settlementDay - 1] + '요일' :
                               ''}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          mall.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {mall.isActive ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleShoppingMallEdit(mall)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          수정
                        </button>
                        <button 
                          onClick={() => handleShoppingMallDelete(mall.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    ),
    packages: (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">패키지 관리</h3>
              <p className="text-sm text-gray-600 mt-1">호텔별 패키지 목록</p>
            </div>
            <button
              onClick={() => setShowPackageModal(true)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              새 패키지 등록
            </button>
          </div>

          {/* 호텔별 필터 */}
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">호텔별 필터:</label>
              <select
                value={selectedHotelForPackage}
                onChange={(e) => {
                  console.log('호텔 선택 변경:', e.target.value);
                  setSelectedHotelForPackage(e.target.value);
                  fetchPackages(e.target.value || undefined);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">전체 호텔</option>
                {hotels.map((hotel: any) => (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  setSelectedHotelForPackage('');
                  fetchPackages();
                }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                전체 보기
              </button>
            </div>
          </div>

          {/* 패키지 목록 */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    패키지명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    호텔
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가격
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    예약 횟수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {packageLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">로딩 중...</td>
                  </tr>
                ) : packages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      등록된 패키지가 없습니다.
                    </td>
                  </tr>
                ) : (
                  packages.map((pkg: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{pkg.name}</div>
                          {pkg.description && (
                            <div className="text-sm text-gray-500">{pkg.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pkg.hotel?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(pkg.price)}원
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pkg._count?.items || 0}회
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          pkg.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {pkg.isActive ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handlePackageEdit(pkg)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          수정
                        </button>
                        <button 
                          onClick={() => handlePackageDelete(pkg.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    ),
    hotels: (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
          <h2 className="text-2xl font-bold text-blue-900 mb-2">호텔 관리</h2>
          <p className="text-blue-700">예약 시스템과 연동되는 호텔을 관리합니다.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-blue-500">
            <h3 className="text-sm font-medium text-gray-600 mb-2">총 호텔</h3>
            <p className="text-2xl font-bold text-gray-900">
              {hotelLoading ? '...' : hotels.length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-purple-500">
            <h3 className="text-sm font-medium text-gray-600 mb-2">활성 호텔</h3>
            <p className="text-2xl font-bold text-gray-900">
              {hotelLoading ? '...' : hotels.filter((hotel) => hotel.isActive).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-orange-500">
            <h3 className="text-sm font-medium text-gray-600 mb-2">비활성 호텔</h3>
            <p className="text-2xl font-bold text-gray-900">
              {hotelLoading ? '...' : hotels.filter((hotel) => !hotel.isActive).length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">호텔 목록</h3>
            <button 
              onClick={() => {
                setModalType('hotel');
                setShowCreateModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              새 호텔 등록
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    호텔명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    주소
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {hotelLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center">로딩 중...</td>
                  </tr>
                ) : hotels.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center">호텔 등록이 없습니다.</td>
                  </tr>
                ) : (
                  hotels.map((hotel, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{hotel.name}</div>
                        <div className="text-sm text-gray-500">{hotel.address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {hotel.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          hotel.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {hotel.isActive ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleHotelEdit(hotel)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          수정
                        </button>
                        <button 
                          onClick={() => handleHotelDelete(hotel.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    ),
    'rate-table': (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
          <h2 className="text-2xl font-bold text-purple-900 mb-2">리조트 요금표 관리</h2>
          <p className="text-purple-700">리조트 요금표를 생성하고 관리합니다.</p>
        </div>
        
        {/* 요금표 생성 폼 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">새 요금표 생성</h3>
            <div className="flex gap-3">
              <button
                onClick={resetRateTableForm}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                리셋
              </button>
              <button
                onClick={handleRateTableGenerate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                생성
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                요금표명 *
              </label>
              <input
                type="text"
                value={rateTableForm.name}
                onChange={(e) => setRateTableForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 2024년 여름 성수기 요금표"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시작일 *
              </label>
              <input
                type="date"
                value={rateTableForm.startDate}
                onChange={(e) => setRateTableForm(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                종료일 *
              </label>
              <input
                type="date"
                value={rateTableForm.endDate}
                onChange={(e) => setRateTableForm(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                기본 요금 (원)
              </label>
              <input
                type="number"
                value={rateTableForm.basePrice}
                onChange={(e) => setRateTableForm(prev => ({ ...prev, basePrice: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="100000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                성수기 요금 (원)
              </label>
              <input
                type="number"
                value={rateTableForm.peakPrice}
                onChange={(e) => setRateTableForm(prev => ({ ...prev, peakPrice: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="150000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                객실 유형
              </label>
              <select
                value={rateTableForm.roomType}
                onChange={(e) => setRateTableForm(prev => ({ ...prev, roomType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">전체</option>
                <option value="standard">스탠다드</option>
                <option value="deluxe">디럭스</option>
                <option value="suite">스위트</option>
                <option value="family">패밀리</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              value={rateTableForm.description}
              onChange={(e) => setRateTableForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="요금표에 대한 상세 설명을 입력하세요"
            />
          </div>
        </div>

        {/* 미리보기 섹션 */}
        {showRateTablePreview && rateTableData && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">미리보기</h3>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xl font-bold text-blue-900 mb-4">{rateTableData.name}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">적용 기간:</span>
                      <span className="font-medium">
                        {new Date(rateTableData.startDate).toLocaleDateString('ko-KR')} ~ {new Date(rateTableData.endDate).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">객실 유형:</span>
                      <span className="font-medium">{rateTableData.roomType || '전체'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">상태:</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">{rateTableData.status}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-lg font-semibold text-gray-800 mb-3">요금 정보</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">기본 요금:</span>
                      <span className="font-medium text-blue-600">{parseInt(rateTableData.basePrice || '0').toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">성수기 요금:</span>
                      <span className="font-medium text-red-600">{parseInt(rateTableData.peakPrice || '0').toLocaleString()}원</span>
                    </div>
                    {rateTableData.description && (
                      <div className="mt-4">
                        <span className="text-gray-600 block mb-1">설명:</span>
                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{rateTableData.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-600">생성일: {new Date(rateTableData.createdAt).toLocaleString('ko-KR')}</span>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                      저장
                    </button>
                    <button className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors">
                      수정
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 기존 요금표 목록 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">등록된 요금표</h3>
          <div className="text-center py-8 text-gray-500">
            등록된 요금표가 없습니다.
          </div>
        </div>
      </div>
    ),
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {currentDate}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* AI 연결 섹션 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-blue-800 mb-1">
                🤖 AI 실시간 연결
              </h2>
              <p className="text-blue-600 text-sm">
                버튼을 클릭하면 AI가 실시간으로 페이지 상태를 확인합니다!
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={connectToAI}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                🤖 AI 연결
              </button>
              <button
                onClick={reportPageStatus}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
              >
                📊 상태 보고
              </button>
              <button
                onClick={reportDBStatus}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
              >
                🗄️ DB 확인
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex">
        {/* 사이드바 - 모바일 전용 (데스크톱은 레이아웃 사이드바 사용) */}
        <div className="w-64 bg-white shadow-lg min-h-screen md:hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">관리자</h1>
            <p className="text-sm text-gray-600 mt-1">예약 시스템 관리</p>
          </div>
          
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleMenuClick(item.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                      activeSection === item.id
                        ? `bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg`
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg mr-3">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {activeSection === 'dashboard' && <Dashboard />}
            {activeSection === 'reservations' && <Reservations />}
            {activeSection === 'packages' && <Packages />}
        {activeSection === 'hotel-management' && <HotelManagement />}
        {activeSection === 'inventory-management' && <InventoryManagement />}
        {activeSection === 'surcharge-management' && <SurchargeManagement />}
            {activeSection !== 'dashboard' && activeSection !== 'reservations' && activeSection !== 'packages' && sectionContent[activeSection]}
          </div>
        </div>
      </div>
      
      {/* 생성 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                {modalType === 'reservation' && '새 예약 생성'}
                {modalType === 'room' && '새 객실 등록'}
                {modalType === 'package' && '새 패키지 생성'}
                {modalType === 'customer' && '새 고객 등록'}
                {modalType === 'api-key' && 'API 키 관리'}
                {modalType === 'shoppingMall' && (editingShoppingMall ? '쇼핑몰 수정' : '새 쇼핑몰 등록')}
                {modalType === 'hotel' && (editingHotel ? '호텔 수정' : '새 호텔 등록')}
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* 예약 생성 폼 */}
            {modalType === 'reservation' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      고객명 *
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="고객명을 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      이메일
                    </label>
                    <input
                      type="email"
                      name="customerEmail"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="이메일을 입력하세요"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      전화번호
                    </label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={formatPhoneNumber(formData.customerPhone)}
                      onChange={(e) => {
                        const rawValue = removePhoneFormatting(e.target.value);
                        // 11자리까지만 입력 가능
                        const limitedValue = rawValue.slice(0, 11);
                        setFormData(prev => ({
                          ...prev,
                          customerPhone: limitedValue
                        }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="010-0000-0000"
                      maxLength={13}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      호텔
                    </label>
                    <select
                      name="hotelId"
                      value={formData.hotelId || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">호텔을 선택하세요</option>
                      {hotels.map((hotel) => (
                        <option key={hotel.id} value={hotel.id}>
                          {hotel.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-semibold text-gray-800 mb-3">
                      체크인 *
                    </label>
                    <CustomDatePicker
                      value={formData.checkIn}
                      onChange={(date) => setFormData(prev => ({ ...prev, checkIn: date }))}
                      placeholder="체크인 날짜를 선택하세요"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-semibold text-gray-800 mb-3">
                      체크아웃 *
                    </label>
                    <CustomDatePicker
                      value={formData.checkOut}
                      onChange={(date) => setFormData(prev => ({ ...prev, checkOut: date }))}
                      placeholder="체크아웃 날짜를 선택하세요"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      투숙객 수
                    </label>
                    <input
                      type="number"
                      name="guests"
                      value={formData.guests}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      쇼핑몰
                    </label>
                    <select
                      name="shoppingMallId"
                      value={formData.shoppingMallId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">쇼핑몰을 선택하세요</option>
                      {shoppingMalls.map((mall) => (
                        <option key={mall.id} value={mall.id}>
                          {mall.name} ({mall.commissionRate}% 수수료)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    예약 상태
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="RECEIVED">접수</option>
                    <option value="CONFIRMED">확정</option>
                    <option value="PENDING">대기</option>
                    <option value="CANCELLED">취소</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      판매가 (원)
                    </label>
                    <input
                      type="text"
                      name="sellingPrice"
                      value={formatNumber(formData.sellingPrice)}
                      onChange={(e) => {
                        const rawValue = removeCommas(e.target.value);
                        const price = parseFloat(rawValue) || 0;
                        
                        setFormData(prev => {
                          const commissionRate = prev.commissionRate || 0;
                          const commissionAmount = (price * commissionRate) / 100;
                          const supplyPrice = price - commissionAmount;
                          
                          return {
                            ...prev,
                            sellingPrice: price,
                            commissionAmount: commissionAmount,
                            supplyPrice: supplyPrice
                          };
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="판매가를 입력하세요"
                      onFocus={(e) => {
                        // 포커스 시 0이면 빈 값으로 변경
                        if (formData.sellingPrice === 0) {
                          e.target.value = '';
                        }
                      }}
                      onBlur={(e) => {
                        // 포커스 아웃 시 빈 값이면 0으로 설정
                        if (e.target.value === '') {
                          setFormData(prev => ({ ...prev, sellingPrice: 0 }));
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      수수료율 (%)
                    </label>
                    <input
                      type="text"
                      name="commissionRate"
                      value={formData.commissionRate}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      수수료 금액 (원)
                    </label>
                    <input
                      type="text"
                      name="commissionAmount"
                      value={formatNumber(formData.commissionAmount)}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      공급가 (원)
                    </label>
                    <input
                      type="text"
                      name="supplyPrice"
                      value={formatNumber(formData.supplyPrice)}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    특이사항
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="특이사항을 입력하세요"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => handleSubmit()}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? '생성 중...' : '예약 생성'}
                  </button>
                </div>
              </div>
            )}

            {/* 쇼핑몰 등록 폼 */}
            {modalType === 'shoppingMall' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    쇼핑몰명 *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={shoppingMallForm.name}
                    onChange={(e) => setShoppingMallForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="쇼핑몰명을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    수수료율 (%) *
                  </label>
                  <input
                    type="number"
                    name="commissionRate"
                    value={shoppingMallForm.commissionRate}
                    onChange={(e) => setShoppingMallForm(prev => ({ ...prev, commissionRate: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    설명
                  </label>
                  <textarea
                    name="description"
                    value={shoppingMallForm.description}
                    onChange={(e) => setShoppingMallForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="쇼핑몰에 대한 설명을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    정산주기
                  </label>
                  <select
                    value={shoppingMallForm.settlementCycle}
                    onChange={(e) => setShoppingMallForm(prev => ({ ...prev, settlementCycle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="MONTHLY">월별</option>
                    <option value="WEEKLY">주별</option>
                    <option value="DAILY">일별</option>
                  </select>
                </div>

                {shoppingMallForm.settlementCycle !== 'DAILY' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      정산일
                    </label>
                    {shoppingMallForm.settlementCycle === 'MONTHLY' ? (
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={shoppingMallForm.settlementDay}
                        onChange={(e) => setShoppingMallForm(prev => ({ ...prev, settlementDay: parseInt(e.target.value) || 1 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="1-31일 중 선택"
                      />
                    ) : (
                      <select
                        value={shoppingMallForm.settlementDay}
                        onChange={(e) => setShoppingMallForm(prev => ({ ...prev, settlementDay: parseInt(e.target.value) || 1 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value={1}>월요일</option>
                        <option value={2}>화요일</option>
                        <option value={3}>수요일</option>
                        <option value={4}>목요일</option>
                        <option value={5}>금요일</option>
                        <option value={6}>토요일</option>
                        <option value={7}>일요일</option>
                      </select>
                    )}
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        console.log('쇼핑몰 등록 시도:', shoppingMallForm);
                        
                        if (!shoppingMallForm.name || shoppingMallForm.commissionRate === undefined) {
                          alert('쇼핑몰명과 수수료율은 필수입니다.');
                          return;
                        }
                        
                        const response = await fetch('/api/admin/shopping-malls', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(shoppingMallForm),
                        });

                        console.log('쇼핑몰 등록 응답 상태:', response.status);
                        
                        if (response.ok) {
                          const result = await response.json();
                          console.log('쇼핑몰 등록 성공:', result);
                          
                          alert('쇼핑몰이 성공적으로 등록되었습니다!');
                          setShowCreateModal(false);
                          setShoppingMallForm({ 
                            id: '', 
                            name: '', 
                            commissionRate: 0, 
                            description: '',
                            settlementCycle: 'MONTHLY',
                            settlementDay: 1,
                            lastSettlementDate: null,
                            nextSettlementDate: null,
                          });
                          
                          // 쇼핑몰 목록 새로고침
                          await fetchShoppingMalls();
                        } else {
                          const errorData = await response.json();
                          console.error('쇼핑몰 등록 실패:', errorData);
                          alert(`쇼핑몰 등록 실패: ${errorData.error || '알 수 없는 오류'}`);
                        }
                      } catch (error) {
                        console.error('쇼핑몰 등록 오류:', error);
                        alert('쇼핑몰 등록 중 오류가 발생했습니다.');
                      }
                    }}
                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                  >
                    쇼핑몰 등록
                  </button>
                </div>
              </div>
            )}

            {/* 호텔 등록 폼 */}
            {modalType === 'hotel' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    호텔명 *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={hotelForm.name}
                    onChange={(e) => setHotelForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="호텔명을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    주소
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={hotelForm.address}
                    onChange={(e) => setHotelForm(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="호텔 주소를 입력하세요"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      전화번호
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={hotelForm.phone}
                      onChange={(e) => setHotelForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="호텔 전화번호를 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      이메일
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={hotelForm.email}
                      onChange={(e) => setHotelForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="호텔 이메일을 입력하세요"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    설명
                  </label>
                  <textarea
                    name="description"
                    value={hotelForm.description}
                    onChange={(e) => setHotelForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="호텔에 대한 설명을 입력하세요"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => handleHotelSubmit()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    호텔 등록
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 패키지 등록 모달 */}
      {showPackageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">새 패키지 등록</h3>
              <button 
                onClick={() => setShowPackageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  패키지명 *
                </label>
                <input
                  type="text"
                  value={packageForm.name}
                  onChange={(e) => setPackageForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="패키지명을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  호텔 선택 *
                </label>
                <select
                  value={packageForm.hotelId}
                  onChange={(e) => setPackageForm(prev => ({ ...prev, hotelId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">호텔을 선택하세요</option>
                  {hotels.map((hotel: any) => (
                    <option key={hotel.id} value={hotel.id}>
                      {hotel.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  가격 (원) *
                </label>
                <input
                  type="number"
                  value={packageForm.price}
                  onChange={(e) => setPackageForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="가격을 입력하세요"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명
                </label>
                <textarea
                  value={packageForm.description}
                  onChange={(e) => setPackageForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="패키지에 대한 설명을 입력하세요"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowPackageModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={() => handlePackageSubmit()}
                  disabled={packageLoading}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                >
                  {packageLoading ? '등록 중...' : '패키지 등록'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DB 전환 모달 - 제거됨 (별도 페이지로 분리) */}
      
      {/* 새로운 관리 페이지 링크 */}
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-40">
        <div className="text-sm font-medium text-gray-700 mb-2">신규 관리 페이지</div>
        <div className="space-y-2">
          <Link
            href="/admin/hotel-management"
            className="block px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
          >
            🏨 호텔 관리
          </Link>
          <Link
            href="/admin/inventory-management"
            className="block px-3 py-2 text-sm bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors"
          >
            📦 재고 관리
          </Link>
          <Link
            href="/admin/surcharge-management"
            className="block px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 transition-colors"
          >
            💰 추가요금 관리
          </Link>
        </div>
      </div>
    </div>
  );
}
