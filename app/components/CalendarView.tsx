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

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // 예약 데이터 가져오기
  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/admin/reservations');
      if (response.ok) {
        const data = await response.json();
        const bookingsData = data.bookings || data || [];
        setBookings(bookingsData);
      }
    } catch (error) {
      console.error('예약 데이터 가져오기 실패:', error);
      setBookings([]);
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
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      return date >= checkIn && date <= checkOut;
    });
  };

  // 예약 상태에 따른 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'RECEIVED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-7 gap-4">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 달력 헤더 */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <button
          onClick={prevMonth}
          className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {format(currentDate, 'yyyy년 M월', { locale: ko })}
          </h2>
          <p className="text-gray-500 mt-1">예약 현황을 한눈에 확인하세요</p>
        </div>
        
        <button
          onClick={nextMonth}
          className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-2 bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
          <div key={day} className={`text-center font-bold p-3 rounded-xl ${
            index === 0 ? 'text-red-500 bg-red-50' : 
            index === 6 ? 'text-blue-500 bg-blue-50' : 
            'text-gray-700 bg-gray-50'
          }`}>
            {day}
          </div>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div className="grid grid-cols-7 gap-2">
        {daysInMonth.map((day, index) => {
          const dayBookings = getBookingsForDate(day);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentDate);
          
          return (
            <div
              key={index}
              className={`min-h-[120px] p-3 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                isToday 
                  ? 'border-blue-500 bg-blue-50 shadow-lg' 
                  : isCurrentMonth 
                    ? 'border-gray-200 bg-white hover:border-blue-300' 
                    : 'border-gray-100 bg-gray-50'
              }`}
            >
              {/* 날짜 표시 */}
              <div className={`text-sm font-bold mb-2 ${
                isToday 
                  ? 'text-blue-600' 
                  : isCurrentMonth 
                    ? 'text-gray-800' 
                    : 'text-gray-400'
              }`}>
                {format(day, 'd')}
              </div>
              
              {/* 예약 목록 */}
              <div className="space-y-1">
                {dayBookings.slice(0, 3).map((booking, bookingIndex) => (
                  <div
                    key={booking.id}
                    className={`text-xs p-2 rounded-lg border ${getStatusColor(booking.status)} cursor-pointer hover:shadow-md transition-all duration-200`}
                    title={`${booking.guestName} - ${booking.status}`}
                  >
                    <div className="font-medium truncate">{booking.guestName}</div>
                    <div className="text-xs opacity-75">{booking.status}</div>
                  </div>
                ))}
                
                {dayBookings.length > 3 && (
                  <div className="text-xs text-gray-500 text-center p-1 bg-gray-100 rounded">
                    +{dayBookings.length - 3}개 더
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 예약 상태 범례 */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">예약 상태 범례</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { status: 'CONFIRMED', label: '확정', color: 'bg-green-100 text-green-800 border-green-200' },
            { status: 'PENDING', label: '대기', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
            { status: 'RECEIVED', label: '접수', color: 'bg-blue-100 text-blue-800 border-blue-200' },
            { status: 'CANCELLED', label: '취소', color: 'bg-red-100 text-red-800 border-red-200' }
          ].map(({ status, label, color }) => (
            <div key={status} className={`flex items-center p-3 rounded-xl border ${color}`}>
              <div className="w-3 h-3 rounded-full bg-current mr-2"></div>
              <span className="font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 