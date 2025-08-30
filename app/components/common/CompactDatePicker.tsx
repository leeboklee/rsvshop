'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, getDay, addDays, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';

interface CompactDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
}

export default function CompactDatePicker({ 
  value, 
  onChange, 
  placeholder = "날짜를 선택하세요", 
  className = "",
  minDate,
  maxDate
}: CompactDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 달력 닫기
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  // 안전한 이벤트 리스너 등록
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [handleClickOutside]);

  // 달력 날짜 생성
  const getCalendarDays = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const startDay = getDay(start);
    
    // 이전 달의 마지막 날들
    const prevMonthDays = [];
    for (let i = startDay - 1; i >= 0; i--) {
      prevMonthDays.push(subDays(start, i + 1));
    }
    
    // 현재 달의 모든 날들
    const currentMonthDays = eachDayOfInterval({ start, end });
    
    // 다음 달의 첫 날들 (총 35개 셀이 되도록)
    const nextMonthDays = [];
    const totalCells = 35; // 5주 x 7일
    const remainingCells = totalCells - prevMonthDays.length - currentMonthDays.length;
    for (let i = 1; i <= remainingCells; i++) {
      nextMonthDays.push(addDays(end, i));
    }
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  const calendarDays = getCalendarDays();

  // 이전 달로 이동
  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // 다음 달로 이동
  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // 오늘로 이동
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
    onChange(format(today, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  // 날짜 선택
  const handleDateSelect = (date: Date) => {
    // minDate, maxDate 체크
    if (minDate && date < minDate) return;
    if (maxDate && date > maxDate) return;
    
    setSelectedDate(date);
    onChange(format(date, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  // 날짜가 선택 가능한지 확인
  const isDateSelectable = (date: Date) => {
    if (minDate && date < minDate) return false;
    if (maxDate && date > maxDate) return false;
    return true;
  };

  return (
    <div className={`relative ${className}`} ref={calendarRef}>
      {/* 입력 필드 */}
      <div 
        className="relative cursor-pointer group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <input
          type="text"
          value={value || ''}
          readOnly
          placeholder={placeholder}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg cursor-pointer transition-all duration-300 hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 group-hover:border-blue-400 bg-white shadow-sm text-base"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      {/* 달력 팝업 */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-96 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-50 animate-in slide-in-from-top-2 duration-200">
          {/* 달력 헤더 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
            <button
              onClick={goToPreviousMonth}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h3 className="text-lg font-semibold text-gray-900">
              {format(currentMonth, 'yyyy년 MM월')}
            </h3>
            
            <button
              onClick={goToNextMonth}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 gap-1 p-2 bg-gray-50">
            {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
              <div
                key={day}
                className={`h-10 flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-700'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 달력 그리드 */}
          <div className="grid grid-cols-7 gap-1 p-2">
            {calendarDays.map((day, index) => {
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);
              const isSelectable = isDateSelectable(day);
              
              return (
                <button
                  key={index}
                  onClick={() => handleDateSelect(day)}
                  disabled={!isSelectable}
                  className={`
                    h-10 w-10 rounded-lg text-base font-semibold transition-all duration-200 flex items-center justify-center relative
                    ${isCurrentMonth 
                      ? isSelectable 
                        ? 'text-gray-900 hover:bg-blue-100 hover:text-blue-700 hover:scale-110' 
                        : 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-300 hover:bg-gray-50'
                    }
                    ${isSelected 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md scale-110' 
                      : ''
                    }
                    ${isTodayDate && !isSelected 
                      ? 'bg-blue-50 text-blue-600 border-2 border-blue-200 font-bold' 
                      : ''
                    }
                    ${!isSelectable ? 'opacity-50' : ''}
                  `}
                >
                  {format(day, 'd')}
                  {isTodayDate && !isSelected && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* 빠른 선택 버튼들 */}
          <div className="grid grid-cols-2 gap-2 p-3 border-t border-gray-100 bg-gray-50">
            <button
              onClick={() => handleDateSelect(new Date())}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-all duration-200 hover:scale-105"
            >
              오늘
            </button>
            <button
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                handleDateSelect(tomorrow);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg transition-all duration-200 hover:scale-105"
            >
              내일
            </button>
          </div>

          {/* 하단 버튼들 */}
          <div className="flex gap-2 p-3 border-t border-gray-100">
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              onClick={goToToday}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all duration-200 shadow-sm"
            >
              오늘
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
