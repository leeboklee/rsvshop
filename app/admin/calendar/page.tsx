'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Booking {
  id: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  totalAmount: number;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);

  // 예약 데이터 가져오기
  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/admin/reservations');
      if (response.ok) {
        const data = await response.json();
        // API 응답이 { bookings: [...] } 형태이므로 bookings 배열을 추출
        const bookingsData = data.bookings || data || [];
        console.log('가져온 예약 데이터:', bookingsData);
        
        // "키키키키" 예약 확인
        const kikikikiBooking = bookingsData.find((booking: any) => booking.guestName === '키키키키');
        if (kikikikiBooking) {
          console.log('키키키키 예약 발견:', kikikikiBooking);
        }
        
        setBookings(bookingsData);
      }
    } catch (error) {
      console.error('예약 데이터 가져오기 실패:', error);
      setBookings([]); // 오류 시 빈 배열로 설정
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // 달력 날짜 생성
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // 이전 달로 이동
  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  // 다음 달로 이동
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // 특정 날짜의 예약 찾기
  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => {
      // 날짜 문자열을 직접 파싱 (ISO 형식이 아닐 수 있음)
      let checkIn: Date;
      let checkOut: Date;
      
      try {
        // 다양한 날짜 형식 지원
        checkIn = new Date(booking.checkInDate);
        checkOut = new Date(booking.checkOutDate);
        
        // 유효한 날짜인지 확인
        if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
          console.error('유효하지 않은 날짜:', booking.checkInDate, booking.checkOutDate);
          return false;
        }
      } catch (error) {
        console.error('날짜 파싱 오류:', error, booking);
        return false;
      }
      
      // 날짜만 비교하기 위해 시간 정보 제거
      const checkInDate = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
      const checkOutDate = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());
      const currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      // 디버깅: "키키키키" 예약 확인
      if (booking.guestName === '키키키키') {
        console.log('키키키키 예약 상세:', {
          guestName: booking.guestName,
          originalCheckIn: booking.checkInDate,
          originalCheckOut: booking.checkOutDate,
          parsedCheckIn: checkIn,
          parsedCheckOut: checkOut,
          checkInDate: checkInDate,
          checkOutDate: checkOutDate,
          currentDate: currentDate,
          isInRange: currentDate >= checkInDate && currentDate <= checkOutDate,
          dateString: date.toISOString().split('T')[0]
        });
      }
      
      // 체크아웃 날짜까지 포함 (호텔 예약에서는 체크아웃 당일까지 숙박)
      return currentDate >= checkInDate && currentDate <= checkOutDate;
    });
  };

  // 예약 상태에 따른 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 예약 클릭 핸들러
  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-7 gap-4">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">예약 달력</h1>
          <p className="text-gray-600">체크인/체크아웃 일정과 고객 정보를 한눈에 확인하세요</p>
        </div>

        {/* 달력 네비게이션 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h2 className="text-2xl font-semibold text-gray-900">
            {format(currentDate, 'yyyy년 M월')}
          </h2>
          
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-4 mb-4">
          {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
            <div key={day} className="text-center py-3 font-semibold text-gray-700">
              {day}
            </div>
          ))}
        </div>

        {/* 달력 그리드 */}
        <div className="grid grid-cols-7 gap-4">
          {daysInMonth.map((day) => {
            const dayBookings = getBookingsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className={`min-h-32 p-3 rounded-lg border ${
                  isCurrentMonth ? 'bg-white' : 'bg-gray-100'
                } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
              >
                {/* 날짜 */}
                <div className={`text-sm font-medium mb-2 ${
                  isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                } ${isToday ? 'text-blue-600' : ''}`}>
                  {format(day, 'd')}
                </div>

                {/* 예약 목록 */}
                <div className="space-y-1">
                  {dayBookings.slice(0, 3).map((booking) => (
                    <div
                      key={booking.id}
                      className={`text-xs p-1 rounded border ${getStatusColor(booking.status)} truncate cursor-pointer hover:shadow-md transition-shadow`}
                      title={`${booking.guestName} - ${booking.status} (클릭하여 상세보기)`}
                      onClick={() => handleBookingClick(booking)}
                    >
                      <div className="font-medium truncate">{booking.guestName}</div>
                      <div className="text-xs opacity-75">
                        {format(new Date(booking.checkInDate), 'MM/dd')} ~ {format(new Date(booking.checkOutDate), 'MM/dd')}
                      </div>
                    </div>
                  ))}
                  
                  {dayBookings.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayBookings.length - 3}개 더
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 범례 */}
        <div className="mt-8 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">상태 범례</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-100 border border-green-200 rounded mr-2"></div>
              <span className="text-sm text-gray-700">확정</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded mr-2"></div>
              <span className="text-sm text-gray-700">대기</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-100 border border-red-200 rounded mr-2"></div>
              <span className="text-sm text-gray-700">취소</span>
            </div>
          </div>
        </div>

        {/* 통계 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {bookings.filter(b => b.status === 'CONFIRMED').length}
            </div>
            <div className="text-sm text-gray-600">확정 예약</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {bookings.filter(b => b.status === 'PENDING').length}
            </div>
            <div className="text-sm text-gray-600">대기 예약</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {bookings.filter(b => b.status === 'CANCELLED').length}
            </div>
            <div className="text-sm text-gray-600">취소 예약</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {bookings.length}
            </div>
            <div className="text-sm text-gray-600">총 예약</div>
          </div>
        </div>
      </div>

      {/* 예약 상세 모달 */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">예약 상세 정보</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">고객명</label>
                <p className="text-gray-900 font-medium">{selectedBooking.guestName}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">체크인</label>
                <p className="text-gray-900">{format(new Date(selectedBooking.checkInDate), 'yyyy년 MM월 dd일')}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">체크아웃</label>
                <p className="text-gray-900">{format(new Date(selectedBooking.checkOutDate), 'yyyy년 MM월 dd일')}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedBooking.status)}`}>
                  {selectedBooking.status === 'CONFIRMED' ? '확정' : 
                   selectedBooking.status === 'PENDING' ? '대기' : 
                   selectedBooking.status === 'CANCELLED' ? '취소' : '기타'}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">총 금액</label>
                <p className="text-gray-900 font-semibold">{selectedBooking.totalAmount.toLocaleString()}원</p>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  // 예약 관리 페이지로 이동
                  window.location.href = `/admin/reservations?id=${selectedBooking.id}`;
                }}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                예약 관리
              </button>
              <button
                onClick={closeModal}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 