"use client";

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Room, Package, Booking } from '@prisma/client';
import { calculatePrices, formatCurrency } from '@/app/lib/calculations';

type EnrichedBooking = Booking & {
  room: Room;
  items: {
    package: Package;
  }[];
  shoppingMall?: string;
  orderNumber?: string;
  externalId?: string;
  sellingPrice?: number;
  depositAmount?: number;
  supplyPrice?: number;
};

interface NewBooking {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shoppingMall: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  selectedPackages: string[];
  specialRequests: string;
  status: string;
  
  // 쇼핑몰 관련 필드
  orderNumber: string;
  externalId: string;
  
  // 가격 관련 필드
  sellingPrice: number;
  depositAmount: number;
  supplyPrice: number;
  
  // 수익 및 부가세 필드
  profit?: number;
  vatAmount?: number;
  vatRate?: number;
  commission?: number;
  commissionRate?: number;
}

interface ShoppingMall {
  id: string;
  name: string;
  platform: string;
  commissionRate: number;
  isActive: boolean;
}

export const useReservations = () => {
  const [bookings, setBookings] = useState<EnrichedBooking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [shoppingMalls, setShoppingMalls] = useState<ShoppingMall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<any>(null);
  const [roomAvailability, setRoomAvailability] = useState<{[key: string]: boolean}>({});
  const [customerSuggestions, setCustomerSuggestions] = useState<Array<{name: string, email: string, phone: string}>>([]);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);

  const [newBooking, setNewBooking] = useState<NewBooking>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shoppingMall: '',
    roomId: '',
    checkInDate: '',
    checkOutDate: '',
    selectedPackages: [],
    specialRequests: '',
    status: 'RECEIVED',
    
    // 쇼핑몰 관련 필드
    orderNumber: '',
    externalId: '',
    
    // 가격 관련 필드
    sellingPrice: 0,
    depositAmount: 0,
    supplyPrice: 0
  });

  // 데이터 로딩 (최적화된 버전)
  // opts.force: 캐시 무시하고 강제 조회, search/status/page/limit 전달 가능
  const fetchData = useCallback(async (opts?: { force?: boolean; search?: string; status?: string; page?: number; limit?: number }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 파라미터
      const page = opts?.page ?? 1;
      const limit = opts?.limit ?? 20;
      const search = opts?.search ?? '';
      const status = opts?.status ?? '';

      // 캐시된 데이터가 있는지 확인 (10분 이내로 연장)
      const cacheKey = `admin-reservations-cache:v1:${page}:${limit}:${search}:${status}`;
      const cached = opts?.force ? null : sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          const now = Date.now();
          if (now - timestamp < 10 * 60 * 1000) { // 10분 캐시
            setBookings(data.bookings || []);
            setRooms(data.rooms || []);
            setPackages(data.packages || []);
            setShoppingMalls(data.shoppingMalls || []);
            setCustomerSuggestions(data.customerSuggestions || []);
            setIsLoading(false);
            
            // 백그라운드에서 최신 데이터 업데이트
            setTimeout(() => fetchData({ force: true, search, status, page, limit }), 100);
            return;
          }
        } catch (e) {
          // 캐시 파싱 오류 시 캐시 삭제
          sessionStorage.removeItem(cacheKey);
        }
      }
      
      // 우선순위별 데이터 로딩: 예약 목록을 먼저, 나머지는 병렬로
      const params = new URLSearchParams();
      params.set('limit', String(limit));
      params.set('page', String(page));
      if (search) params.set('search', search);
      if (status && status !== 'ALL') params.set('status', status);

      const [bookingsResponse] = await Promise.all([
        fetch(`/api/admin/reservations?${params.toString()}`, {
          headers: { 'Cache-Control': 'no-cache' }
        })
      ]);

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        const bookings = bookingsData.bookings || [];
        
        // 예약 데이터를 먼저 표시 (사용자 경험 개선)
        setBookings(bookings);
        
        // 고객 제안 목록 즉시 생성
        const uniqueCustomers = Array.from(new Set(bookings.map((b: any) => b.guestEmail) || []))
          .map(email => {
            const booking = bookings.find((b: any) => b.guestEmail === email);
            return {
              name: booking?.guestName || '',
              email: booking?.guestEmail || '',
              phone: booking?.guestPhone || '',
            };
          })
          .slice(0, 5);
        setCustomerSuggestions(uniqueCustomers);
      }

      // 나머지 데이터는 백그라운드에서 로딩
      Promise.all([
        fetch('/api/rooms', { headers: { 'Cache-Control': 'max-age=300' } }),
        fetch('/api/packages', { headers: { 'Cache-Control': 'max-age=300' } }),
        // DB 기반 관리자 API로 변경
        fetch('/api/admin/shopping-malls', { headers: { 'Cache-Control': 'no-store' } })
      ]).then(async ([roomsResponse, packagesResponse, shoppingMallsResponse]) => {
        try {
          const [roomsData, packagesData, shoppingMallsData] = await Promise.all([
            roomsResponse.json(),
            packagesResponse.json(),
            shoppingMallsResponse.json()
          ]);

          // API 응답 키 정합성 맞춤
          // /api/rooms → { success, rooms }
          // /api/packages → { success, packages }
          // /api/admin/shopping-malls → { success, shoppingMalls }
          const rooms = roomsData?.success && Array.isArray(roomsData.rooms) ? roomsData.rooms : [];
          const packages = packagesData?.success && Array.isArray(packagesData.packages) ? packagesData.packages : [];
          const shoppingMalls = shoppingMallsData?.success && Array.isArray(shoppingMallsData.shoppingMalls) ? shoppingMallsData.shoppingMalls : [];

          setRooms(rooms);
          setPackages(packages);
          setShoppingMalls(shoppingMalls);
          
          // 디버깅: 쇼핑몰 데이터 로딩 상태 확인
          console.log('🛍️ 쇼핑몰 데이터 로딩:', {
            response: shoppingMallsData,
            parsed: shoppingMalls,
            count: shoppingMalls.length
          });
          
          // 캐시 저장
          sessionStorage.setItem(cacheKey, JSON.stringify({
            data: { 
              bookings: bookings || [], 
              rooms, 
              packages, 
              shoppingMalls, 
              customerSuggestions: uniqueCustomers || [] 
            },
            timestamp: Date.now()
          }));
        } catch (e) {
          console.error('보조 데이터 로딩 실패:', e);
        }
      });
      
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 객실 가용성 체크
  const checkRoomAvailability = useCallback(async () => {
    if (!newBooking.checkInDate || !newBooking.checkOutDate) return;

    try {
      const response = await fetch('/api/rooms/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkInDate: newBooking.checkInDate,
          checkOutDate: newBooking.checkOutDate
        })
      });

      if (response.ok) {
        const availability = await response.json();
        setRoomAvailability(availability);
      }
    } catch (error) {
      console.error('객실 가용성 체크 오류:', error);
    }
  }, [newBooking.checkInDate, newBooking.checkOutDate]);

  // 전화번호 포맷팅
  const formatPhoneNumber = useCallback((value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  }, []);

  // 가격 계산
  const priceCalculation = useMemo(() => {
    return calculatePrices({
      sellingPrice: newBooking.sellingPrice || 0,
      supplyPrice: newBooking.supplyPrice || 0,
      commissionRate: 4, // 기본 수수료율 4%
      vatRate: 10        // 기본 부가세율 10%
    });
  }, [newBooking.sellingPrice, newBooking.supplyPrice]);

  // 고객명 변경 처리
  const handleCustomerNameChange = useCallback((name: string) => {
    setNewBooking(prev => ({ ...prev, customerName: name }));
    
    if (name.length > 1) {
      const suggestions = bookings.filter(booking => 
        booking.guestName.toLowerCase().includes(name.toLowerCase())
      ).slice(0, 5).map(booking => ({
        name: booking.guestName,
        email: booking.guestEmail,
        phone: booking.guestPhone
      }));
      setCustomerSuggestions(suggestions);
      setShowCustomerSuggestions(true);
    } else {
      setShowCustomerSuggestions(false);
    }
  }, [bookings]);

  // 고객 제안 선택
  const selectCustomerSuggestion = useCallback((customer: any) => {
    setNewBooking(prev => ({
      ...prev,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone
    }));
    setShowCustomerSuggestions(false);
  }, []);

  // 입력 변경 처리
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'customerPhone') {
      const formatted = formatPhoneNumber(value);
      setNewBooking(prev => ({ ...prev, [name]: formatted }));
      return;
    }

    if (name === 'roomId') {
      // roomId 입력이 객실명일 수 있으므로 id로 매핑 시도
      const byId = rooms.find(r => String(r.id) === value);
      const byName = rooms.find(r => r.name === value);
      const resolved = byId?.id ?? byName?.id ?? value; // 없으면 그대로 값 유지
      setNewBooking(prev => ({ ...prev, roomId: String(resolved) }));
    } else {
      setNewBooking(prev => ({ ...prev, [name]: value }));
    }
    
    // 판매가 변경 시 자동 수수료 계산
    if (name === 'sellingPrice' && newBooking.shoppingMall) {
      const sellingPrice = Number(value) || 0;
      const selectedMall = shoppingMalls.find(m => m.name === newBooking.shoppingMall);
      
      if (selectedMall && sellingPrice > 0) {
        const commissionRate = selectedMall.commissionRate / 100;
        const commissionAmount = Math.round(sellingPrice * commissionRate);
        const calculatedSupplyPrice = sellingPrice - commissionAmount;
        
        setNewBooking(prev => ({
          ...prev,
          [name]: sellingPrice,
          supplyPrice: calculatedSupplyPrice
        }));
        return;
      }
    }
    
    // 체크인/아웃 날짜 변경 시 객실 가용성 체크
    if (name === 'checkInDate' || name === 'checkOutDate') {
      setTimeout(checkRoomAvailability, 100);
    }
  }, [formatPhoneNumber, checkRoomAvailability, rooms, newBooking.shoppingMall, shoppingMalls]);



  // 총액 계산
  const totalPrice = useMemo(() => {
    let basePrice = 0;
    if (newBooking.roomId) {
      const room = rooms.find(r => r.id === newBooking.roomId);
      if (room) {
        basePrice = room.basePrice || 0;
      }
    }
    
    let packagePrice = 0;
    if (newBooking.packageId) {
      const pkg = packages.find(p => p.id === newBooking.packageId);
      if (pkg) {
        packagePrice = pkg.price || 0;
      }
    }
    
    const discountAmount = Number(newBooking.discountAmount) || 0;
    return Math.max(0, basePrice + packagePrice - discountAmount);
  }, [newBooking.roomId, newBooking.packageId, newBooking.discountAmount, packages, rooms]);

  // 쇼핑몰별 수수료 계산
  const calculateMallFees = useCallback((basePrice: number, mall: string) => {
    // 동적으로 불러온 쇼핑몰 데이터에서 수수료 정보 찾기
    const shoppingMall = shoppingMalls.find(m => m.name === mall);
    
    if (shoppingMall) {
      const commissionRate = shoppingMall.commissionRate / 100;
      const commissionAmount = Math.round(basePrice * commissionRate);
      const supplyPrice = basePrice - commissionAmount;
      
      return {
        sellingPrice: basePrice,
        commissionAmount: commissionAmount,
        supplyPrice: supplyPrice,
        commissionRate: shoppingMall.commissionRate
      };
    }
    
    // 기본값 (수수료 없음)
    return {
      sellingPrice: basePrice,
      commissionAmount: 0,
      supplyPrice: basePrice,
      commissionRate: 0
    };
  }, [shoppingMalls]);

  // 쇼핑몰 변경 시 가격 자동 계산
  const handleShoppingMallChange = useCallback((mall: string) => {
    const currentSellingPrice = newBooking.sellingPrice || totalPrice;
    const prices = calculateMallFees(currentSellingPrice, mall);
    
    setNewBooking(prev => ({
      ...prev,
      shoppingMall: mall,
      sellingPrice: prices.sellingPrice,
      supplyPrice: prices.supplyPrice
    }));
  }, [newBooking.sellingPrice, totalPrice, calculateMallFees]);

  // totalPrice나 쇼핑몰이 변경될 때 가격 자동 업데이트
  useEffect(() => {
    if (newBooking.shoppingMall && newBooking.shoppingMall !== '') {
      const currentSellingPrice = newBooking.sellingPrice || totalPrice;
      const prices = calculateMallFees(currentSellingPrice, newBooking.shoppingMall);
      setNewBooking(prev => ({
        ...prev,
        sellingPrice: prices.sellingPrice,
        supplyPrice: prices.supplyPrice
      }));
    }
  }, [totalPrice, newBooking.shoppingMall, calculateMallFees, newBooking.sellingPrice]);

  // 판매가가 수동으로 변경될 때 공급가 자동 업데이트
  useEffect(() => {
    if (newBooking.sellingPrice && newBooking.shoppingMall && newBooking.shoppingMall !== '') {
      const prices = calculateMallFees(newBooking.sellingPrice, newBooking.shoppingMall);
      setNewBooking(prev => ({
        ...prev,
        supplyPrice: prices.supplyPrice
      }));
    }
  }, [newBooking.sellingPrice, newBooking.shoppingMall, calculateMallFees]);

  // 초기 자동 조회는 하지 않고, 사용자가 조회 버튼을 눌렀을 때만 불러옴
  useEffect(() => {
    // no auto-fetch
  }, []);

  // 폼 제출
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) {
      alert('처리 중입니다. 잠시만 기다려주세요.');
      return;
    }
    
    // 필수 필드 검증
    if (!newBooking.customerName || newBooking.customerName.trim() === '') {
      alert('고객명을 입력해주세요.');
      return;
    }
    
    // roomId는 선택사항으로 변경 (API에서 처리)
    // if (!newBooking.roomId || newBooking.roomId.trim() === '') {
    //   alert('객실을 선택해주세요.');
    //   return;
    // }
    
    setIsSubmitting(true);
    
    try {
      const requestData = {
        ...newBooking,
        totalAmount: totalPrice
      };
      
      console.log('📤 예약 생성 요청 데이터:', requestData);
      console.log('🔍 roomId 검증:', {
        roomId: requestData.roomId,
        type: typeof requestData.roomId,
        isEmpty: !requestData.roomId || requestData.roomId.toString().trim() === ''
      });
      
      const response = await fetch('/api/admin/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const newBookingData = await response.json();
        setBookings(prev => [newBookingData, ...prev]);
        
        // 폼 초기화
        resetForm();
        
        alert('예약이 성공적으로 생성되었습니다.');
        return true; // 성공 시 true 반환
      } else {
        let errorMessage = '서버 오류가 발생했습니다.';
        let errorDetails = '';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          errorDetails = errorData.details || '';
        } catch (parseError) {
          console.error('오류 응답 파싱 실패:', parseError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        console.error('예약 생성 실패:', { 
          status: response.status, 
          error: errorMessage,
          details: errorDetails,
          requestData 
        });
        
        // 서버 오류 정보 저장
        setServerError({
          message: errorMessage,
          details: errorDetails,
          code: response.status.toString(),
          timestamp: new Date().toISOString()
        });
        
        return false;
      }
    } catch (error) {
      console.error('예약 생성 중 예외 발생:', error);
      alert('예약 생성 중 오류가 발생했습니다.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [newBooking, totalPrice, isSubmitting]);

  // 폼 초기화
  const resetForm = useCallback(() => {
    setNewBooking({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      shoppingMall: '',
      roomId: '',
      checkInDate: '',
      checkOutDate: '',
      selectedPackages: [],
      specialRequests: '',
      status: 'RECEIVED',
      discountAmount: 0,
      
      // 쇼핑몰 관련 필드
      orderNumber: '',
      externalId: '',
      
      // 가격 관련 필드
      sellingPrice: 0,
      depositAmount: 0,
      supplyPrice: 0
    });
  }, []);

  // 예약 상태 업데이트
  const updateBookingStatus = useCallback(async (bookingId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/reservations/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        const updatedBooking = await response.json();
        setBookings(prev => prev.map(b => b.id === bookingId ? updatedBooking : b));
      }
    } catch (error) {
      console.error('상태 업데이트 오류:', error);
    }
  }, []);

  return {
    // 상태
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
    priceCalculation,
    
    // 액션
    fetchData,
    setError,
    serverError,
    setServerError,
    setShowCustomerSuggestions,
    handleCustomerNameChange,
    selectCustomerSuggestion,
    handleInputChange,

    handleSubmit,
    updateBookingStatus,
    resetForm,
    handleShoppingMallChange,
    
    // 유틸리티
    formatPhoneNumber
  };
};
