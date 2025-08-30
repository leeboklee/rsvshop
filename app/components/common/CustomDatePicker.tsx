'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, getDay, addDays, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';

interface CustomDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  showQuickSelect?: boolean;
}

export default function CustomDatePicker({ 
  value, 
  onChange, 
  placeholder = "날짜를 선택하세요", 
  className = "",
  minDate,
  maxDate,
  showQuickSelect = true
}: CustomDatePickerProps) {
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

  // 달력 날짜 생성 (이전/다음 달 포함)
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
    
    // 다음 달의 첫 날들 (총 42개 셀이 되도록)
    const nextMonthDays = [];
    const totalCells = 42; // 6주 x 7일
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

  // 빠른 선택 버튼들
  const quickSelectButtons = [
    { label: '오늘', days: 0, color: 'bg-blue-500 hover:bg-blue-600' },
    { label: '내일', days: 1, color: 'bg-green-500 hover:bg-green-600' },
    { label: '+1주', days: 7, color: 'bg-purple-500 hover:bg-purple-600' },
    { label: '+1개월', days: 30, color: 'bg-indigo-500 hover:bg-indigo-600' }
  ];

  const handleQuickSelect = (days: number) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
    onChange(format(newDate, 'yyyy-MM-dd'));
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
          className="w-full px-4 py-3 text-lg font-medium text-gray-900 bg-white border-2 border-gray-300 rounded-xl cursor-pointer transition-all duration-300 hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 group-hover:border-blue-400 shadow-sm hover:shadow-md"
        />
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      {/* 달력 팝업 */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-3 w-[420px] bg-white border-2 border-gray-200 rounded-2xl shadow-2xl z-50 animate-in slide-in-from-top-2 duration-300">
          {/* 달력 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-t-2xl">
            <button
              onClick={goToPreviousMonth}
              className="p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-xl transition-all duration-300 hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h3 className="text-xl font-bold text-gray-900">
              {format(currentMonth, 'yyyy년 MM월')}
            </h3>
            
            <button
              onClick={goToNextMonth}
              className="p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-xl transition-all duration-300 hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 gap-2 p-4 bg-gray-50">
            {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
              <div
                key={day}
                className={`h-12 flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-700'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 달력 그리드 */}
          <div className="grid grid-cols-7 gap-2 p-4">
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
                    h-14 w-14 rounded-xl text-lg font-semibold transition-all duration-300 flex items-center justify-center relative
                    ${isCurrentMonth 
                      ? isSelectable 
                        ? 'text-gray-900 hover:bg-blue-100 hover:text-blue-700 hover:scale-110 hover:shadow-lg' 
                        : 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-300 hover:bg-gray-50'
                    }
                    ${isSelected 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl scale-110 ring-4 ring-blue-200' 
                      : ''
                    }
                    ${isTodayDate && !isSelected 
                      ? 'bg-blue-50 text-blue-600 border-2 border-blue-300 font-bold hover:bg-blue-100' 
                      : ''
                    }
                    ${!isSelectable ? 'opacity-50' : ''}
                  `}
                >
                  {format(day, 'd')}
                  {isTodayDate && !isSelected && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* 빠른 선택 버튼들 */}
          {showQuickSelect && (
            <div className="grid grid-cols-2 gap-3 p-4 border-t border-gray-100 bg-gray-50">
              {quickSelectButtons.map((button) => (
                <button
                  key={button.label}
                  onClick={() => handleQuickSelect(button.days)}
                  className={`px-4 py-3 text-sm font-bold text-white ${button.color} rounded-xl transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg`}
                >
                  {button.label}
                </button>
              ))}
            </div>
          )}

          {/* 하단 버튼들 */}
          <div className="flex gap-3 p-4 border-t border-gray-100 bg-white rounded-b-2xl">
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 px-6 py-3 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300 hover:scale-105"
            >
              취소
            </button>
            <button
              onClick={goToToday}
              className="flex-1 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
            >
              오늘
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 