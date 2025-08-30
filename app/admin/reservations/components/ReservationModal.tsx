"use client";

import React, { memo } from 'react';
import { Room, Package } from '@prisma/client';
import Link from 'next/link';
import PackageItem from './PackageItem';
import CompactDatePicker from '@/app/components/common/CompactDatePicker';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;            
  rooms: Room[];
  packages: Package[];
  shoppingMalls: Array<{id: string, name: string, platform: string, commissionRate: number, isActive: boolean}>;
  onSubmit: (e: React.FormEvent) => void;
  newBooking: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleCustomerNameChange: (value: string) => void;
  customerSuggestions: Array<{name: string, email: string, phone: string}>;
  showCustomerSuggestions: boolean;
  selectCustomerSuggestion: (customer: {name: string, email: string, phone: string}) => void;
  roomAvailability: {[key: string]: boolean};
  totalPrice: number;
  isSubmitting: boolean;
  handlePackageChange: (packageId: string) => void;
  handleShoppingMallChange?: (mall: string) => void;
  isEditMode?: boolean;
}

const ReservationModal = memo(({ 
  isOpen, 
  onClose, 
  rooms, 
  packages, 
  shoppingMalls, 
  onSubmit, 
  newBooking, 
  handleInputChange, 
  handleCustomerNameChange, 
  customerSuggestions, 
  showCustomerSuggestions, 
  selectCustomerSuggestion,
  roomAvailability,
  totalPrice,
  isSubmitting,
  handlePackageChange,
  handleShoppingMallChange,
  isEditMode = false
}: ReservationModalProps) => {
  if (!isOpen) return null;

  // 날짜 변경 핸들러
  const handleDateChange = (field: string, value: string) => {
    const event = {
      target: {
        name: field,
        value: value
      }
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(event);
  };

  // 입력 편의 유틸
  const createChangeEvent = (name: string, value: string | number) => ({
    target: { name, value }
  } as unknown as React.ChangeEvent<HTMLInputElement>);

  const sellingRef = React.useRef<HTMLInputElement>(null);
  const depositRef = React.useRef<HTMLInputElement>(null);
  const supplyRef = React.useRef<HTMLInputElement>(null);

  const formatPrice = (value: any) => {
    if (value === '' || value === null || value === undefined) return '';
    const num = Number(value);
    if (Number.isNaN(num)) return '';
    return num.toLocaleString('ko-KR');
  };

  const handlePriceChange = (
    name: 'sellingPrice' | 'depositAmount' | 'supplyPrice',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const raw = e.target.value.replace(/,/g, '');
    const num = raw === '' ? '' : String(Number(raw));
    handleInputChange(createChangeEvent(name, num));
  };

  const adjustNumeric = (name: 'sellingPrice' | 'depositAmount' | 'supplyPrice', delta: number) => {
    const current = Number((newBooking as any)[name] || 0);
    const next = Math.max(0, current + delta);
    handleInputChange(createChangeEvent(name, String(next)));
  };

  const onPriceKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    name: 'sellingPrice' | 'depositAmount' | 'supplyPrice',
    nextRef?: React.RefObject<HTMLInputElement>
  ) => {
    const step = e.shiftKey ? 10000 : 1000;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      adjustNumeric(name, step);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      adjustNumeric(name, -step);
    } else if (e.key === 'Enter' && nextRef?.current) {
      e.preventDefault();
      nextRef.current.focus();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                {isEditMode ? '예약 상세 수정' : '신규 예약 추가'}
              </h2>
              <p className="text-gray-600 text-sm">
                {isEditMode ? '기존 예약 정보를 수정합니다' : '새로운 고객 예약을 생성합니다'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/80 rounded-xl transition-all duration-300 hover:scale-110"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* 고객 정보 + 예약 상세 정보를 한 줄에 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 고객 정보 섹션 */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  고객 정보
                </h3>
                
                <div className="space-y-4">
                  <div className="relative">
                    <label htmlFor="customerName" className="block text-sm font-semibold text-gray-700 mb-2">
                      고객명 <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="customerName" 
                      id="customerName" 
                      value={newBooking.customerName} 
                      onChange={(e) => handleCustomerNameChange(e.target.value)} 
                      required 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm text-base" 
                      placeholder="고객 이름을 입력하세요"
                    />
                    {showCustomerSuggestions && (
                      <div className="absolute z-20 w-full bg-white border-2 border-blue-200 rounded-lg shadow-xl mt-1 max-h-40 overflow-y-auto">
                        {customerSuggestions
                          .filter(customer => customer.name.toLowerCase().includes(newBooking.customerName.toLowerCase()))
                          .map((customer, index) => (
                            <div
                              key={index}
                              onClick={() => selectCustomerSuggestion(customer)}
                              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 transition-all duration-200"
                            >
                              <div className="font-medium text-gray-900">{customer.name}</div>
                              <div className="text-sm text-gray-600">{customer.email}</div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="customerEmail" className="block text-sm font-semibold text-gray-700 mb-2">이메일</label>
                    <input 
                      type="email" 
                      name="customerEmail" 
                      id="customerEmail" 
                      value={newBooking.customerEmail} 
                      onChange={handleInputChange} 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm text-base" 
                      placeholder="이메일 주소를 입력하세요"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="customerPhone" className="block text-sm font-semibold text-gray-700 mb-2">연락처</label>
                    <input 
                      type="tel" 
                      name="customerPhone" 
                      id="customerPhone" 
                      value={newBooking.customerPhone} 
                      onChange={handleInputChange} 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm text-base" 
                      placeholder="연락처를 입력하세요"
                    />
                  </div>
                  
                                     <div>
                     <label htmlFor="shoppingMall" className="block text-sm font-semibold text-gray-700 mb-2">쇼핑몰</label>
                     <select 
                       name="shoppingMall" 
                       id="shoppingMall" 
                       value={newBooking.shoppingMall || ''} 
                       onChange={(e) => {
                         const mall = e.target.value;
                         if (mall) {
                           // 쇼핑몰 변경 시 가격 자동 계산
                           const event = {
                             target: { name: 'shoppingMall', value: mall }
                           } as React.ChangeEvent<HTMLSelectElement>;
                           handleInputChange(event);
                           
                           // 가격 자동 계산
                           if (handleShoppingMallChange) {
                             handleShoppingMallChange(mall);
                           }
                         }
                       }}
                       className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm text-base"
                     >
                       <option value="">쇼핑몰을 선택하세요</option>
                       {shoppingMalls.map((mall) => (
                         <option key={mall.id} value={mall.name}>
                           {mall.name} ({mall.commissionRate}% 수수료)
                         </option>
                       ))}
                     </select>
                  </div>

                  {/* 주문번호: 고객명 위로 이동 (고객정보 섹션에만 표시) */}
                  <div>
                    <label htmlFor="orderNumberTop" className="block text-sm font-semibold text-gray-700 mb-2">주문번호</label>
                    <input 
                      type="text" 
                      name="orderNumber" 
                      id="orderNumberTop" 
                      value={newBooking.orderNumber || ''} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 bg-white shadow-sm text-base" 
                      placeholder="주문번호를 입력하세요"
                    />
                  </div>

                  {/* 가격 정보: 쇼핑몰 드롭다운 바로 아래 */}
                  <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
                    <h4 className="text-base font-bold text-gray-800 mb-3">가격 정보</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label htmlFor="sellingPrice" className="block text-sm font-semibold text-gray-700 mb-2">판매가</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9,]*"
                          name="sellingPrice"
                          id="sellingPrice"
                          value={formatPrice(newBooking.sellingPrice) || ''}
                          ref={sellingRef}
                          onChange={(e) => handlePriceChange('sellingPrice', e)}
                          onKeyDown={(e) => onPriceKeyDown(e, 'sellingPrice', depositRef)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-300 bg-white shadow-sm text-base"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label htmlFor="depositAmount" className="block text-sm font-semibold text-gray-700 mb-2">입금가</label>
                        <input 
                          type="text" 
                          inputMode="numeric"
                          pattern="[0-9,]*"
                          name="depositAmount" 
                          id="depositAmount" 
                          value={formatPrice(newBooking.depositAmount) || ''} 
                          ref={depositRef}
                          onChange={(e) => handlePriceChange('depositAmount', e)}
                          onKeyDown={(e) => onPriceKeyDown(e, 'depositAmount', supplyRef)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-300 bg-white shadow-sm text-base" 
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label htmlFor="supplyPrice" className="block text-sm font-semibold text-gray-700 mb-2">공급가</label>
                        <input 
                          type="text" 
                          inputMode="numeric"
                          pattern="[0-9,]*"
                          name="supplyPrice" 
                          id="supplyPrice" 
                          value={formatPrice(newBooking.supplyPrice) || ''} 
                          ref={supplyRef}
                          onChange={(e) => handlePriceChange('supplyPrice', e)}
                          onKeyDown={(e) => onPriceKeyDown(e, 'supplyPrice')}
                          placeholder="0"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-300 bg-white shadow-sm text-base" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 예약 상세 정보 섹션 */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  예약 상세 정보
                </h3>
                
                <div className="space-y-4">
                  {/* 객실 선택: 수동 입력 우선 + 선택 지원 (datalist) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">객실 선택 <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                      <input
                        list="roomsList"
                        name="roomId" 
                        value={newBooking.roomId} 
                        onChange={handleInputChange}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-100 focus:border-green-500 transition-all duration-300 bg-white shadow-sm text-base"
                        placeholder="객실명을 직접 입력하거나 선택하세요"
                        required
                      />
                      <datalist id="roomsList">
                        {rooms && rooms.length > 0 && rooms.map((room) => (
                          <option key={room.id} value={room.name}>{room.name}</option>
                        ))}
                      </datalist>
                      <button
                        type="button"
                        onClick={() => {
                          // 모달을 닫고 객실 관리 페이지로 이동
                          onClose();
                          // 약간의 지연 후 페이지 이동 (모달이 완전히 닫힌 후)
                          setTimeout(() => {
                            window.location.href = '/admin/rooms';
                          }, 100);
                        }}
                        className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 hover:scale-105 shadow-md text-sm whitespace-nowrap"
                      >
                        객실 관리
                      </button>
                    </div>
                  </div>

                  {/* 날짜 선택 - 새로운 CompactDatePicker 사용 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">체크인</label>
                      <CompactDatePicker
                        value={newBooking.checkInDate}
                        onChange={(date) => handleDateChange('checkInDate', date)}
                        placeholder="체크인 날짜 선택"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">체크아웃</label>
                      <CompactDatePicker
                        value={newBooking.checkOutDate}
                        onChange={(date) => handleDateChange('checkOutDate', date)}
                        placeholder="체크아웃 날짜 선택"
                        minDate={newBooking.checkInDate ? new Date(newBooking.checkInDate) : undefined}
                      />
                    </div>
                  </div>

                  {/* 판매가 입력은 가격 정보 섹션으로 이동 (한 줄 입력 UX) */}
                </div>
              </div>
            </div>

            {/* 쇼핑몰 주문 정보 + 패키지 선택을 한 줄에 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 쇼핑몰 주문 정보 섹션 (가격 정보 블록 제거) */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center mr-2">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  쇼핑몰 주문 정보
                </h3>
                
                <div className="space-y-4">
                  {/* 중복 제거: 하단 섹션의 주문번호 입력은 제거됨 */}
                  
                  {/* 외부 시스템 ID 필드 삭제 */}
                </div>
              </div>

              {/* 패키지 선택 섹션 */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mr-2">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  패키지 선택
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="spaPackage"
                        className="w-5 h-5 text-purple-600 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-100 focus:ring-offset-0"
                      />
                      <label htmlFor="spaPackage" className="text-base font-semibold text-gray-700">스파 패키지</label>
                    </div>
                    <span className="text-xl font-bold text-purple-600">50,000원</span>
                  </div>
                  
                  <button
                    type="button"
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 shadow-md"
                  >
                    패키지 추가
                  </button>
                </div>
              </div>

              {/* 특별 요청사항 */}
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
              {/* 특별 요청사항 */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mr-2">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  특별 요청사항
                </h3>
                
                <textarea 
                  name="specialRequests" 
                    value={newBooking.specialRequests || ''} 
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all duration-300 bg-white shadow-sm text-base resize-none"
                  placeholder="고객의 특별한 요청사항이 있다면 입력해주세요"
                />
                </div>

                {/* 가격 정보 섹션은 쇼핑몰 석션 아래로 이동 */}
              </div>
            </div>

            {/* 예상 총액 + 제출 버튼 */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border-2 border-indigo-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">예상 총액</h3>
                <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  {totalPrice.toLocaleString()}원
                </div>
              </div>
              {/* 상태 선택 */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">예약 상태</label>
                <select
                  name="status"
                  value={newBooking.status || 'RECEIVED'}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 bg-white shadow-sm text-base"
                >
                  <option value="RECEIVED">접수</option>
                  <option value="CONFIRMED">확정</option>
                  <option value="PENDING">대기</option>
                  <option value="CANCELLED">취소</option>
                </select>
              </div>
              
              {/* 제출 버튼 */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all duration-300 hover:scale-105 shadow-md"
                >
                  취소
                </button>
                {isEditMode && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm('정말로 이 예약을 삭제하시겠습니까?')) {
                        try {
                          const res = await fetch(`/api/admin/reservations/${newBooking.id}`, {
                            method: 'DELETE'
                          });
                          if (res.ok) {
                            alert('예약이 삭제되었습니다.');
                            onClose();
                            // 부모 컴포넌트에서 목록 새로고침을 위해 onSubmit 호출
                            const event = new Event('submit', { bubbles: true });
                            document.querySelector('form')?.dispatchEvent(event);
                          } else {
                            alert('삭제에 실패했습니다.');
                          }
                        } catch (error) {
                          alert('삭제 중 오류가 발생했습니다.');
                        }
                      }
                    }}
                    className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all duration-300 hover:scale-105 shadow-md"
                  >
                    삭제
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting 
                    ? (isEditMode ? '저장 중...' : '예약 생성 중...') 
                    : (isEditMode ? '저장' : '예약 생성')
                  }
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
});

ReservationModal.displayName = 'ReservationModal';

export default ReservationModal;
