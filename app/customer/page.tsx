'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PaymentButton from '@/app/components/PaymentButton';

interface Room {
  id: string;
  name: string;
  description: string;
  capacity: number;
  imageUrl?: string;
  price: number;
  packages?: Package[];
}

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  roomId: string;
  closed?: boolean;
  room?: {
    hotel?: {
      name: string;
    };
    name: string;
  };
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
  stock: number;
}

interface Booking {
  id: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  totalAmount: number;
}

export default function CustomerPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'hotel' | 'shop' | 'booking' | 'widget'>('hotel');
  
  // 예약 관련 상태
  const [pkgId, setPkgId] = useState<string>('');
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');
  const [channel, setChannel] = useState<string>('SITE');
  const [includeClosed, setIncludeClosed] = useState<boolean>(false);
  const [filteredPkgs, setFilteredPkgs] = useState<Package[]>([]);
  const [quote, setQuote] = useState<any>(null);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  // 위젯 모드 상태
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [widgetMessage, setWidgetMessage] = useState('');
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);

  useEffect(() => {
    fetchData();
    loadSampleData();
  }, []);

  const fetchData = async () => {
    try {
      const [roomsRes, packagesRes, productsRes] = await Promise.all([
        fetch('/api/rooms'),
        fetch('/api/packages'),
        fetch('/api/customer/products')
      ]);
      
      if (roomsRes.ok && packagesRes.ok) {
        const roomsData = await roomsRes.json();
        const packagesData = await packagesRes.json();
        
        setRooms(roomsData.success ? roomsData.data : []);
        setPackages(packagesData.success ? packagesData.data : []);
        setFilteredPkgs(packagesData.success ? packagesData.data : []);
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.success ? productsData.data : []);
      }
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSampleData = () => {
    // 위젯용 샘플 데이터
    const sampleRooms: Room[] = [
      {
        id: '1',
        name: '디럭스 룸',
        description: '편안한 디럭스 룸입니다.',
        capacity: 2,
        price: 100000,
        packages: [
          { id: '1', name: '기본 패키지', description: '기본적인 편의시설을 포함한 패키지', price: 100000, roomId: '1' },
          { id: '2', name: '프리미엄 패키지', description: '고급 편의시설과 서비스를 포함한 패키지', price: 150000, roomId: '1' }
        ]
      },
      {
        id: '2',
        name: '스위트 룸',
        description: '고급스러운 스위트 룸입니다.',
        capacity: 4,
        price: 200000,
        packages: [
          { id: '3', name: '기본 패키지', description: '기본적인 편의시설을 포함한 패키지', price: 200000, roomId: '2' },
          { id: '4', name: '럭셔리 패키지', description: '최고급 편의시설과 프리미엄 서비스를 포함한 패키지', price: 300000, roomId: '2' }
        ]
      }
    ];

    const sampleBookings: Booking[] = [
      {
        id: '1',
        guestName: '홍길동',
        checkInDate: '2024-01-15',
        checkOutDate: '2024-01-17',
        status: 'CONFIRMED',
        totalAmount: 150000
      },
      {
        id: '2',
        guestName: '김철수',
        checkInDate: '2024-01-20',
        checkOutDate: '2024-01-22',
        status: 'PENDING',
        totalAmount: 200000
      }
    ];

    setRooms(prev => [...prev, ...sampleRooms]);
    setRecentBookings(sampleBookings);
  };

  // 날짜/패키지 변경 시 마감 패키지 필터링
  useEffect(() => {
    const applyFilter = async () => {
      if (!start || !end) { 
        setFilteredPkgs(packages); 
        return; 
      }
      const results: Package[] = [];
      for (const p of packages) {
        try {
          const q = await fetch(`/api/pricing/quote?packageId=${p.id}&startDate=${start}&endDate=${end}&channel=${channel}`);
          if (!q.ok) { 
            results.push({ ...p }); 
            continue; 
          }
          const data = await q.json();
          const closed = (data.days || []).some((d: any) => d.closed);
          if (includeClosed || !closed) {
            results.push({ ...p, closed });
          }
        } catch {
          results.push({ ...p });
        }
      }
      setFilteredPkgs(results);
      if (pkgId && !results.find(r => r.id === pkgId)) setPkgId('');
    };
    applyFilter();
  }, [packages, start, end, channel, includeClosed]);

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoom(roomId);
    setSelectedPackage('');
  };

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId);
  };

  const getRoomPackages = (roomId: string) => {
    return packages.filter(pkg => pkg.roomId === roomId);
  };

  const requestQuote = async () => {
    if (!pkgId || !start || !end) return alert('패키지/기간을 선택하세요');
    const q = await fetch(`/api/pricing/quote?packageId=${pkgId}&startDate=${start}&endDate=${end}&channel=${channel}`);
    const data = await q.json();
    setQuote(data);
  };

  const sum = (quote?.days || []).reduce((a: number, d: any) => a + (d.total || 0), 0);

  const submitBooking = async () => {
    if (!pkgId || !start || !end) return alert('패키지/기간을 선택하세요');
    if (!guestName || !guestPhone) return alert('이름/연락처를 입력하세요');
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch('/api/site/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: pkgId, roomId: null, channel, startDate: start, endDate: end, guestName, guestPhone, guestEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || '예약 실패');
      setResult({ ok: true, data });
    } catch (e: any) {
      setResult({ ok: false, error: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  // 위젯 모드 예약 제출
  const handleWidgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setWidgetMessage('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWidgetMessage('예약이 성공적으로 생성되었습니다!');
      
      setSelectedRoom('');
      setSelectedPackage('');
      setCheckInDate('');
      setCheckOutDate('');
      setGuestName('');
      setGuestEmail('');
      setGuestPhone('');
      setGuestCount(1);
      
      // 최근 예약 목록 새로고침
      loadSampleData();
    } catch (error) {
      setWidgetMessage('예약 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
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
              <h1 className="text-3xl font-bold text-gray-900">RSVShop 고객센터</h1>
              <p className="text-gray-600 mt-1">호텔 예약과 쇼핑몰을 한 곳에서</p>
            </div>
            <div className="flex space-x-4">
              <Link 
                href="/customer/manage" 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                예약 관리
              </Link>
              <Link 
                href="/customer/check" 
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                예약 확인
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('hotel')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'hotel'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            🏨 호텔 예약
          </button>
          <button
            onClick={() => setActiveTab('shop')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'shop'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            🛍️ 쇼핑몰
          </button>
          <button
            onClick={() => setActiveTab('booking')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'booking'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            📅 예약하기
          </button>
          <button
            onClick={() => setActiveTab('widget')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'widget'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            🎯 위젯 모드
          </button>
        </div>
      </div>

      {/* 호텔 예약 탭 */}
      {activeTab === 'hotel' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 객실 선택 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">객실 선택</h2>
                <div className="space-y-3">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      onClick={() => handleRoomSelect(room.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedRoom === room.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {room.imageUrl && (
                        <img
                          src={room.imageUrl}
                          alt={room.name}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                      )}
                      <h3 className="font-semibold text-gray-900">{room.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{room.description}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-500">수용 인원: {room.capacity}명</span>
                        <span className="text-lg font-bold text-blue-600">
                          {room.price?.toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 패키지 선택 */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {selectedRoom ? '패키지 선택' : '객실을 먼저 선택해주세요'}
                </h2>
                {selectedRoom ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getRoomPackages(selectedRoom).map((pkg) => (
                      <div
                        key={pkg.id}
                        onClick={() => handlePackageSelect(pkg.id)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedPackage === pkg.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                        <div className="mt-3 text-right">
                          <span className="text-lg font-bold text-blue-600">
                            {pkg.price?.toLocaleString()}원
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">🏨</div>
                    <p>왼쪽에서 객실을 선택해주세요</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 쇼핑몰 탭 */}
      {activeTab === 'shop' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">쇼핑몰 상품</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">재고: {product.stock}개</span>
                      <span className="text-lg font-bold text-blue-600">
                        {product.price?.toLocaleString()}원
                      </span>
                    </div>
                    <button className="w-full mt-3 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                      장바구니에 추가
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 예약하기 탭 */}
      {activeTab === 'booking' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">예약하기</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">패키지</label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={pkgId} 
                    onChange={(e) => setPkgId(e.target.value)}
                  >
                    <option value="">선택</option>
                    {filteredPkgs.map(p => (
                      <option key={p.id} value={p.id} disabled={p.closed && !includeClosed}>
                        {p.name}{p.closed ? ' (마감)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">채널</label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={channel} 
                    onChange={(e) => setChannel(e.target.value)}
                  >
                    <option value="SITE">SITE</option>
                    <option value="LOTTE">LOTTE</option>
                    <option value="HYUNDAI">HYUNDAI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
                  <input 
                    type="date" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={start} 
                    onChange={(e) => setStart(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
                  <input 
                    type="date" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={end} 
                    onChange={(e) => setEnd(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                  <input 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={guestName} 
                    onChange={(e) => setGuestName(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                  <input 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={guestPhone} 
                    onChange={(e) => setGuestPhone(e.target.value)} 
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">이메일(선택)</label>
                  <input 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={guestEmail} 
                    onChange={(e) => setGuestEmail(e.target.value)} 
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <label className="flex items-center text-sm text-gray-600">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 mr-2 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={includeClosed} 
                    onChange={(e) => setIncludeClosed(e.target.checked)} 
                  />
                  마감 포함 보기
                </label>
                <div className="space-x-2">
                  <button 
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    onClick={requestQuote}
                  >
                    요금 조회
                  </button>
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60" 
                    onClick={submitBooking} 
                    disabled={submitting}
                  >
                    {submitting ? '처리중...' : '예약 접수'}
                  </button>
                </div>
              </div>
            </div>

            {/* 요금 내역 */}
            {quote && (
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <div className="text-lg font-semibold mb-3">요금 내역</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white text-gray-600">
                      <tr>
                        <th className="p-2 text-left">날짜</th>
                        <th className="p-2 text-left">기본가</th>
                        <th className="p-2 text-left">추가요금</th>
                        <th className="p-2 text-left">합계</th>
                        <th className="p-2 text-left">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quote.days.map((d: any) => (
                        <tr key={d.date} className="border-t border-gray-200">
                          <td className="p-2">{d.date}</td>
                          <td className="p-2">{d.basePrice?.toLocaleString()}원</td>
                          <td className="p-2">{d.surcharge?.toLocaleString()}원</td>
                          <td className="p-2">{d.total?.toLocaleString()}원</td>
                          <td className="p-2">{d.closed ? '마감' : `잔여 ${d.allotment}`}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 text-right font-semibold text-lg">
                  총 합계: {sum.toLocaleString()}원
                </div>
              </div>
            )}

            {/* 예약 결과 */}
            {result && (
              <div className={`mt-4 rounded-lg border p-4 ${
                result.ok ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
              }`}>
                {result.ok ? (
                  <div>
                    <p className="text-emerald-800 font-medium">예약이 접수되었습니다.</p>
                    {result.data?.id && (
                      <div className="mt-3 flex items-center gap-2">
                        <PaymentButton
                          amount={sum || 0}
                          orderId={result.data.id}
                          orderName={`예약(${result.data.id.slice(0,6)})`}
                          customerName={guestName || '고객'}
                          customerEmail={guestEmail || undefined}
                          successUrl="/hotel-admin/payment/success"
                          failUrl="/hotel-admin/payment/fail"
                          buttonText="결제하기"
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        />
                        <span className="text-xs text-gray-600">결제 완료 시 예약이 확정됩니다.</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-red-800">오류: {result.error}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 위젯 모드 탭 */}
      {activeTab === 'widget' && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
              <h1 className="text-2xl font-bold">🏨 호텔 예약 위젯</h1>
              <p className="text-blue-100">편리한 온라인 예약 시스템</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">예약하기</h2>
                
                {widgetMessage && (
                  <div className={`p-3 rounded mb-4 ${
                    widgetMessage.includes('성공') 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {widgetMessage}
                  </div>
                )}

                <form onSubmit={handleWidgetSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">객실 선택</label>
                    <select
                      value={selectedRoom}
                      onChange={(e) => setSelectedRoom(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">객실을 선택하세요</option>
                      {rooms.map(room => (
                        <option key={room.id} value={room.id}>
                          {room.name} (수용인원: {room.capacity}명)
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedRoom && (
                    <div>
                      <label className="block text-sm font-medium mb-2">패키지 선택</label>
                      <select
                        value={selectedPackage}
                        onChange={(e) => setSelectedPackage(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">패키지를 선택하세요</option>
                        {rooms.find(r => r.id === selectedRoom)?.packages?.map(pkg => (
                          <option key={pkg.id} value={pkg.id}>
                            {pkg.name} - {pkg.price.toLocaleString()}원
                          </option>
                        )) || []}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">체크인</label>
                      <input
                        type="date"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">체크아웃</label>
                      <input
                        type="date"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">고객명</label>
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">이메일</label>
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">전화번호</label>
                      <input
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">투숙객 수</label>
                      <input
                        type="number"
                        value={guestCount}
                        onChange={(e) => setGuestCount(parseInt(e.target.value))}
                        min="1"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '예약 처리 중...' : '예약하기'}
                  </button>
                </form>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">객실 정보</h2>
                  <div className="space-y-4">
                    {rooms.map(room => (
                      <div key={room.id} className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-lg">{room.name}</h3>
                        <p className="text-gray-600 mb-2">{room.description}</p>
                        <p className="text-sm text-gray-500">수용 인원: {room.capacity}명</p>
                        <div className="mt-2">
                          <p className="text-sm font-medium">패키지:</p>
                          <ul className="text-sm text-gray-600">
                            {room.packages?.map(pkg => (
                              <li key={pkg.id}>• {pkg.name}: {pkg.price.toLocaleString()}원</li>
                            )) || []}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4">최근 예약</h2>
                  <div className="space-y-3">
                    {recentBookings.map(booking => (
                      <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{booking.guestName}</h4>
                            <p className="text-sm text-gray-600">
                              {booking.checkInDate} ~ {booking.checkOutDate}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded ${
                            booking.status === 'CONFIRMED' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.status === 'CONFIRMED' ? '확정' : '대기'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          총 금액: {booking.totalAmount.toLocaleString()}원
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
