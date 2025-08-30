'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CompactDatePicker from '@/app/components/common/CompactDatePicker';

interface Room {
  id: string;
  name: string;
  description: string;
  capacity: number;
  price: number;
}

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  roomId: string;
}

interface QuoteDay {
  date: string;
  basePrice: number;
  surcharge: number;
  total: number;
  closed: boolean;
  allotment: number;
}

interface Quote {
  packageId: string;
  roomId: string | null;
  channel: string | null;
  days: QuoteDay[];
}

export default function CustomerBookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [pkg, setPackage] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [checkInDate, setCheckInDate] = useState<string>('');
  const [checkOutDate, setCheckOutDate] = useState<string>('');
  const [guestInfo, setGuestInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const roomId = searchParams.get('room');
  const packageId = searchParams.get('package');

  useEffect(() => {
    if (roomId && packageId) {
      fetchData();
    }
  }, [roomId, packageId]);

  const fetchData = async () => {
    try {
      const [roomsRes, packagesRes] = await Promise.all([
        fetch('/api/rooms'),
        fetch('/api/packages')
      ]);
      
      if (roomsRes.ok && packagesRes.ok) {
        const roomsData = await roomsRes.json();
        const packagesData = await packagesRes.json();
        
        const selectedRoom = roomsData.success ? roomsData.data.find((r: Room) => r.id === roomId) : null;
        const selectedPackage = packagesData.success ? packagesData.data.find((p: Package) => p.id === packageId) : null;
        
        setRoom(selectedRoom);
        setPackage(selectedPackage);
      }
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuote = async () => {
    if (!checkInDate || !checkOutDate || !packageId) return;
    
    try {
      const response = await fetch(`/api/pricing/quote?packageId=${packageId}&roomId=${roomId || ''}&startDate=${checkInDate}&endDate=${checkOutDate}`);
      if (response.ok) {
        const quoteData = await response.json();
        setQuote(quoteData);
      }
    } catch (error) {
      console.error('요금 계산 실패:', error);
    }
  };

  useEffect(() => {
    if (checkInDate && checkOutDate) {
      fetchQuote();
    }
  }, [checkInDate, checkOutDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInDate || !checkOutDate || !guestInfo.name || !guestInfo.phone) {
      alert('필수 정보를 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/site/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId,
          roomId,
          startDate: checkInDate,
          endDate: checkOutDate,
          guestName: guestInfo.name,
          guestPhone: guestInfo.phone,
          guestEmail: guestInfo.email,
          channel: 'CUSTOMER'
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert('예약이 성공적으로 접수되었습니다!');
        router.push('/customer/success');
      } else {
        const error = await response.json();
        alert(`예약 접수 실패: ${error.error}`);
      }
    } catch (error) {
      console.error('예약 접수 실패:', error);
      alert('예약 접수 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const getTotalAmount = () => {
    if (!quote) return 0;
    return quote.days.reduce((sum, day) => sum + day.total, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!room || !pkg) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">잘못된 접근</h2>
          <p className="text-gray-600 mb-6">객실과 패키지를 먼저 선택해주세요.</p>
          <button 
            onClick={() => router.push('/customer')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            객실 선택으로 돌아가기
          </button>
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
              <h1 className="text-3xl font-bold text-gray-900">예약 진행</h1>
              <p className="text-gray-600 mt-2">선택하신 객실과 패키지로 예약을 완료하세요</p>
            </div>
            <button 
              onClick={() => router.push('/customer')}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              객실 선택으로 돌아가기
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 선택된 객실 및 패키지 정보 */}
          <div className="space-y-6">
            {/* 객실 정보 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">선택된 객실</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">객실명:</span>
                  <span className="font-semibold">{room.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">수용 인원:</span>
                  <span className="font-semibold">{room.capacity}명</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">기본 요금:</span>
                  <span className="font-semibold text-blue-600">{room.price.toLocaleString()}원</span>
                </div>
                <p className="text-gray-600 text-sm mt-3">{room.description}</p>
              </div>
            </div>

            {/* 패키지 정보 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">선택된 패키지</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">패키지명:</span>
                  <span className="font-semibold">{pkg.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">패키지 요금:</span>
                  <span className="font-semibold text-purple-600">{pkg.price.toLocaleString()}원</span>
                </div>
                <p className="text-gray-600 text-sm mt-3">{pkg.description}</p>
              </div>
            </div>
          </div>

          {/* 예약 폼 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">예약 정보 입력</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 날짜 선택 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">체크인 <span className="text-red-500">*</span></label>
                  <CompactDatePicker
                    value={checkInDate}
                    onChange={setCheckInDate}
                    placeholder="체크인 날짜 선택"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">체크아웃 <span className="text-red-500">*</span></label>
                  <CompactDatePicker
                    value={checkOutDate}
                    onChange={setCheckOutDate}
                    placeholder="체크아웃 날짜 선택"
                    minDate={checkInDate ? new Date(checkInDate) : undefined}
                  />
                </div>
              </div>

              {/* 고객 정보 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">예약자명 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={guestInfo.name}
                    onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300"
                    placeholder="예약자 이름을 입력하세요"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">연락처 <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    value={guestInfo.phone}
                    onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300"
                    placeholder="연락처를 입력하세요"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">이메일</label>
                  <input
                    type="email"
                    value={guestInfo.email}
                    onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300"
                    placeholder="이메일을 입력하세요 (선택사항)"
                  />
                </div>
              </div>

              {/* 예약 버튼 */}
              <button
                type="submit"
                disabled={submitting || !checkInDate || !checkOutDate || !guestInfo.name || !guestInfo.phone}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? '예약 접수 중...' : '예약 접수하기'}
              </button>
            </form>
          </div>
        </div>

        {/* 날짜별 요금 내역 */}
        {quote && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">날짜별 요금 내역</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="p-3 text-left">날짜</th>
                    <th className="p-3 text-left">기본가</th>
                    <th className="p-3 text-left">추가요금</th>
                    <th className="p-3 text-left">합계</th>
                    <th className="p-3 text-left">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.days.map((day) => (
                    <tr key={day.date} className="border-t">
                      <td className="p-3">{day.date}</td>
                      <td className="p-3">{day.basePrice.toLocaleString()}원</td>
                      <td className="p-3">
                        {day.surcharge > 0 ? (
                          <span className="text-red-600">+{day.surcharge.toLocaleString()}원</span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="p-3 font-semibold">{day.total.toLocaleString()}원</td>
                      <td className="p-3">
                        {day.closed ? (
                          <span className="text-red-600 font-semibold">마감</span>
                        ) : (
                          <span className="text-green-600">잔여 {day.allotment}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-right">
              <span className="text-lg font-semibold text-gray-600">총 합계: </span>
              <span className="text-2xl font-bold text-blue-600">{getTotalAmount().toLocaleString()}원</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
