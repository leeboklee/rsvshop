'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Reservation {
  id: string;
  roomName: string;
  packageName: string;
  checkIn: string;
  checkOut: string;
  guestName: string;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  createdAt: string;
}

export default function ReservationManagePage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled' | 'completed'>('all');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      // 실제로는 API 호출
      // const response = await fetch('/api/customer/reservations');
      
      // 임시 데이터 (실제 구현 시 제거)
      setTimeout(() => {
        setReservations([
          {
            id: 'RSV2024001',
            roomName: '디럭스 더블룸',
            packageName: '스탠다드 패키지',
            checkIn: '2024-01-15',
            checkOut: '2024-01-17',
            guestName: '홍길동',
            totalPrice: 150000,
            status: 'confirmed',
            createdAt: '2024-01-10'
          },
          {
            id: 'RSV2024002',
            roomName: '스위트 룸',
            packageName: '프리미엄 패키지',
            checkIn: '2024-02-20',
            checkOut: '2024-02-22',
            guestName: '김철수',
            totalPrice: 250000,
            status: 'pending',
            createdAt: '2024-01-12'
          },
          {
            id: 'RSV2024003',
            roomName: '스탠다드 싱글룸',
            packageName: '베이직 패키지',
            checkIn: '2024-01-25',
            checkOut: '2024-01-26',
            guestName: '이영희',
            totalPrice: 80000,
            status: 'completed',
            createdAt: '2024-01-08'
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('예약 목록 로딩 실패:', error);
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
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.class}`}>
        {config.text}
      </span>
    );
  };

  const filteredReservations = reservations.filter(reservation => 
    filter === 'all' || reservation.status === filter
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
              <h1 className="text-3xl font-bold text-gray-900">예약 관리</h1>
              <p className="text-gray-600 mt-2">내 예약을 확인하고 관리하세요</p>
            </div>
            <div className="flex space-x-4">
              <Link 
                href="/customer" 
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← 고객 페이지로
              </Link>
              <Link 
                href="/customer/check" 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔍 예약 확인
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 필터 및 통계 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">📊 예약 현황</h2>
              <p className="text-gray-600">총 {reservations.length}개의 예약</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {(['all', 'confirmed', 'pending', 'cancelled', 'completed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? '전체' : 
                   status === 'confirmed' ? '확정됨' :
                   status === 'pending' ? '대기중' :
                   status === 'cancelled' ? '취소됨' : '완료됨'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 예약 목록 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              예약 목록 ({filteredReservations.length}개)
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">예약번호</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">객실/패키지</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">체크인/아웃</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">투숙객</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">금액</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{reservation.id}</div>
                      <div className="text-sm text-gray-500">{reservation.createdAt}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{reservation.roomName}</div>
                      <div className="text-sm text-gray-500">{reservation.packageName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{reservation.checkIn}</div>
                      <div className="text-sm text-gray-500">~ {reservation.checkOut}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{reservation.guestName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-semibold text-blue-600">
                        ₩{reservation.totalPrice.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(reservation.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Link
                          href={`/customer/reservation/${reservation.id}`}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                        >
                          상세보기
                        </Link>
                        {reservation.status === 'pending' && (
                          <button className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors">
                            취소
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredReservations.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">예약이 없습니다</h3>
              <p className="text-gray-500">새로운 예약을 만들어보세요</p>
              <Link
                href="/customer"
                className="mt-4 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                예약하기
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
