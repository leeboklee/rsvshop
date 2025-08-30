'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface ReservationDetail {
  id: string;
  roomName: string;
  packageName: string;
  checkIn: string;
  checkOut: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  createdAt: string;
  specialRequests?: string;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
}

export default function ReservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [reservation, setReservation] = useState<ReservationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchReservationDetail(params.id as string);
    }
  }, [params.id]);

  const fetchReservationDetail = async (id: string) => {
    try {
      // 실제로는 API 호출
      // const response = await fetch(`/api/customer/reservations/${id}`);
      
      // 임시 데이터 (실제 구현 시 제거)
      setTimeout(() => {
        setReservation({
          id: id,
          roomName: '디럭스 더블룸',
          packageName: '스탠다드 패키지',
          checkIn: '2024-01-15',
          checkOut: '2024-01-17',
          guestName: '홍길동',
          guestEmail: 'hong@example.com',
          guestPhone: '010-1234-5678',
          totalPrice: 150000,
          status: 'confirmed',
          createdAt: '2024-01-10',
          specialRequests: '침대를 두 개로 분리해주세요',
          paymentMethod: '신용카드',
          paymentStatus: 'paid'
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      setError('예약 정보를 불러올 수 없습니다.');
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { text: '확정됨', class: 'bg-green-100 text-green-800' },
      pending: { text: '대기중', class: 'bg-yellow-100 text-yellow-800' },
      cancelled: { text: '취소됨', class: 'bg-red-100 text-red-800' },
      completed: { text: '완료됨', class: 'bg-blue-100 text-blue-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.class}`}>
        {config.text}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const paymentConfig = {
      paid: { text: '결제완료', class: 'bg-green-100 text-green-800' },
      pending: { text: '결제대기', class: 'bg-yellow-100 text-yellow-800' },
      failed: { text: '결제실패', class: 'bg-red-100 text-red-800' }
    };
    
    const config = paymentConfig[status as keyof typeof paymentConfig] || paymentConfig.pending;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.class}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">오류가 발생했습니다</h3>
          <p className="text-gray-500 mb-4">{error || '예약을 찾을 수 없습니다'}</p>
          <Link
            href="/customer/manage"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            예약 목록으로
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
      {/* 헤더 */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">예약 상세정보</h1>
              <p className="text-gray-600 mt-2">예약번호: {reservation.id}</p>
            </div>
            <div className="flex space-x-4">
              <Link 
                href="/customer/manage" 
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← 예약 목록
              </Link>
              <Link 
                href="/customer" 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🏠 고객 페이지
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 예약 상태 및 요약 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">📋 예약 요약</h2>
              <p className="text-gray-600">예약 정보를 확인하고 관리하세요</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  ₩{reservation.totalPrice.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">총 결제 금액</div>
              </div>
              <div className="flex gap-2">
                {getStatusBadge(reservation.status)}
                {getPaymentStatusBadge(reservation.paymentStatus)}
              </div>
            </div>
          </div>
        </div>

        {/* 예약 상세 정보 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 기본 정보 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">🏨 예약 정보</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">객실</label>
                <p className="text-lg font-semibold text-gray-900">{reservation.roomName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">패키지</label>
                <p className="text-lg font-semibold text-gray-900">{reservation.packageName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">체크인</label>
                <p className="text-lg font-semibold text-gray-900">{reservation.checkIn}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">체크아웃</label>
                <p className="text-lg font-semibold text-gray-900">{reservation.checkOut}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">예약일</label>
                <p className="text-lg font-semibold text-gray-900">{reservation.createdAt}</p>
              </div>
            </div>
          </div>

          {/* 투숙객 정보 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">👤 투숙객 정보</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">이름</label>
                <p className="text-lg font-semibold text-gray-900">{reservation.guestName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">이메일</label>
                <p className="text-lg font-semibold text-gray-900">{reservation.guestEmail}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">전화번호</label>
                <p className="text-lg font-semibold text-gray-900">{reservation.guestPhone}</p>
              </div>
              {reservation.specialRequests && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">특별 요청사항</label>
                  <p className="text-lg font-semibold text-gray-900">{reservation.specialRequests}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 결제 정보 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">💳 결제 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500">결제 방법</label>
              <p className="text-lg font-semibold text-gray-900">{reservation.paymentMethod}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">결제 상태</label>
              <div className="mt-1">{getPaymentStatusBadge(reservation.paymentStatus)}</div>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">⚡ 빠른 액션</h3>
          <div className="flex flex-wrap gap-4">
            {reservation.status === 'pending' && (
              <>
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  ✏️ 예약 수정
                </button>
                <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  ❌ 예약 취소
                </button>
              </>
            )}
            {reservation.status === 'confirmed' && (
              <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                📱 체크인 정보 확인
              </button>
            )}
            <button className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              🖨️ 영수증 출력
            </button>
            <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              📧 이메일로 보내기
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
