'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ReservationCheckPage() {
  const [reservationNumber, setReservationNumber] = useState('');
  const [email, setEmail] = useState('');
  const [checking, setChecking] = useState(false);
  const [reservation, setReservation] = useState<any>(null);
  const [error, setError] = useState('');

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservationNumber || !email) {
      setError('예약번호와 이메일을 모두 입력해주세요.');
      return;
    }

    setChecking(true);
    setError('');
    
    try {
      // 실제로는 API 호출
      // const response = await fetch(`/api/reservations/check?number=${reservationNumber}&email=${email}`);
      
      // 임시 데이터 (실제 구현 시 제거)
      setTimeout(() => {
        setReservation({
          id: reservationNumber,
          roomName: '디럭스 더블룸',
          packageName: '스탠다드 패키지',
          checkIn: '2024-01-15',
          checkOut: '2024-01-17',
          guestName: '홍길동',
          totalPrice: 150000,
          status: 'confirmed'
        });
        setChecking(false);
      }, 1000);
    } catch (error) {
      setError('예약 확인 중 오류가 발생했습니다.');
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
      {/* 헤더 */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">예약 확인</h1>
              <p className="text-gray-600 mt-2">예약 정보를 확인하고 관리하세요</p>
            </div>
            <Link 
              href="/customer" 
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← 고객 페이지로
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 예약 확인 폼 */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">🔍 예약 확인</h2>
          
          <form onSubmit={handleCheck} className="space-y-6">
            <div>
              <label htmlFor="reservationNumber" className="block text-sm font-medium text-gray-700 mb-2">
                예약번호
              </label>
              <input
                type="text"
                id="reservationNumber"
                value={reservationNumber}
                onChange={(e) => setReservationNumber(e.target.value)}
                placeholder="예: RSV2024001"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일 주소
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="예약 시 사용한 이메일"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={checking}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {checking ? '확인 중...' : '예약 확인하기'}
            </button>
          </form>
        </div>

        {/* 예약 정보 표시 */}
        {reservation && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📋 예약 정보</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">예약번호</label>
                  <p className="text-lg font-semibold text-gray-900">{reservation.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">객실</label>
                  <p className="text-lg font-semibold text-gray-900">{reservation.roomName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">패키지</label>
                  <p className="text-lg font-semibold text-gray-900">{reservation.packageName}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">체크인</label>
                  <p className="text-lg font-semibold text-gray-900">{reservation.checkIn}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">체크아웃</label>
                  <p className="text-lg font-semibold text-gray-900">{reservation.checkOut}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">투숙객</label>
                  <p className="text-lg font-semibold text-gray-900">{reservation.guestName}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-700">총 결제 금액</span>
                <span className="text-2xl font-bold text-blue-600">
                  ₩{reservation.totalPrice.toLocaleString()}
                </span>
              </div>
              
              <div className="mt-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  reservation.status === 'confirmed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {reservation.status === 'confirmed' ? '✅ 확정됨' : '⏳ 대기중'}
                </span>
              </div>
            </div>
            
            <div className="mt-8 flex gap-4">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                예약 수정
              </button>
              <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                예약 취소
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
