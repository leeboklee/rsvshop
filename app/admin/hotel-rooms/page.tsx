'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Hotel {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  rooms?: Room[];
}

interface Room {
  id: string;
  name: string;
  description: string;
  capacity: number;
  basePrice: number;
  imageUrl?: string;
  hotelId?: string;
  createdAt: string;
}

export default function HotelRoomsManagement() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showHotelForm, setShowHotelForm] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [selectedHotelId, setSelectedHotelId] = useState<string>('');
  const [newHotel, setNewHotel] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    description: ''
  });
  const [newRoom, setNewRoom] = useState({
    name: '',
    description: '',
    capacity: 2,
    basePrice: 0,
    imageUrl: '',
    hotelId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [hotelsRes, roomsRes] = await Promise.all([
        fetch('/api/admin/hotels'),
        fetch('/api/rooms')
      ]);

      if (hotelsRes.ok) {
        const hotelsData = await hotelsRes.json();
        setHotels(hotelsData.hotels || []);
      }

      if (roomsRes.ok) {
        const roomsData = await roomsRes.json();
        setRooms(roomsData.rooms || []);
      }
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHotelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch('/api/admin/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHotel),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('호텔 추가 성공:', result);
        setNewHotel({ name: '', address: '', phone: '', email: '', description: '' });
        setShowHotelForm(false);
        fetchData();
        alert('호텔이 성공적으로 추가되었습니다!');
      } else {
        const errorData = await response.json();
        console.error('호텔 추가 실패:', errorData);
        alert(`호텔 추가 실패: ${errorData.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('호텔 추가 실패:', error);
      alert('호텔 추가 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRoom),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('객실 추가 성공:', result);
        setNewRoom({ name: '', description: '', capacity: 2, basePrice: 0, imageUrl: '', hotelId: '' });
        setShowRoomForm(false);
        fetchData();
        alert('객실이 성공적으로 추가되었습니다!');
      } else {
        const errorData = await response.json();
        console.error('객실 추가 실패:', errorData);
        alert(`객실 추가 실패: ${errorData.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('객실 추가 실패:', error);
      alert('객실 추가 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoomsForHotel = (hotelId: string) => {
    return rooms.filter(room => room.hotelId === hotelId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 스켈레톤 */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded-lg w-64 mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded-lg w-96 mb-6 animate-pulse"></div>
            <div className="flex gap-4">
              <div className="h-12 bg-gray-200 rounded-xl w-32 animate-pulse"></div>
              <div className="h-12 bg-gray-200 rounded-xl w-32 animate-pulse"></div>
              <div className="h-12 bg-gray-200 rounded-xl w-32 animate-pulse"></div>
            </div>
          </div>
          
          {/* 호텔 카드 스켈레톤 */}
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="h-6 bg-gray-200 rounded-lg w-48 mb-4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded-lg w-32 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded-lg w-24 mb-4 animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="h-5 bg-gray-200 rounded-lg w-32 mb-2 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded-lg w-full mb-2 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded-lg w-3/4 mb-3 animate-pulse"></div>
                      <div className="flex gap-2">
                        <div className="h-8 bg-gray-200 rounded-lg flex-1 animate-pulse"></div>
                        <div className="h-8 bg-gray-200 rounded-lg w-16 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
                호텔객실관리
              </h1>
              <p className="text-gray-600 text-lg">호텔과 객실을 통합 관리하세요</p>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/reservations" className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                예약 관리
              </Link>
              <button
                onClick={() => setShowHotelForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                호텔 추가
              </button>
              <button
                onClick={() => setShowRoomForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                객실 추가
              </button>
            </div>
          </div>
        </div>

        {/* 호텔별 객실 목록 */}
        <div className="space-y-8">
          {hotels.map((hotel) => {
            const hotelRooms = getRoomsForHotel(hotel.id);
            return (
              <div key={hotel.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{hotel.name}</h2>
                    <div className="text-sm text-gray-600 space-y-1">
                      {hotel.address && <p>📍 {hotel.address}</p>}
                      {hotel.phone && <p>📞 {hotel.phone}</p>}
                      {hotel.email && <p>✉️ {hotel.email}</p>}
                    </div>
                    {hotel.description && (
                      <p className="text-gray-600 mt-2">{hotel.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">총 객실 수</span>
                    <div className="text-2xl font-bold text-blue-600">{hotelRooms.length}개</div>
                  </div>
                </div>

                {/* 객실 목록 */}
                {hotelRooms.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {hotelRooms.map((room) => (
                      <div key={room.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <h3 className="font-semibold text-gray-800 mb-2">{room.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{room.description}</p>
                        <div className="space-y-1 text-sm text-gray-500">
                          <div className="flex justify-between">
                            <span>수용 인원: {room.capacity}명</span>
                            <span>{new Date(room.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="text-green-600 font-medium">
                            기본 가격: {room.basePrice ? room.basePrice.toLocaleString() + '원' : '미설정'}
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Link
                            href={`/admin/packages?roomId=${room.id}`}
                            className="flex-1 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-center text-sm"
                          >
                            패키지 관리
                          </Link>
                          <button
                            onClick={async () => {
                              if (confirm('정말 삭제하시겠습니까?')) {
                                try {
                                  const response = await fetch(`/api/rooms/${room.id}`, {
                                    method: 'DELETE',
                                  });
                                  if (response.ok) {
                                    fetchData();
                                  }
                                } catch (error) {
                                  console.error('객실 삭제 실패:', error);
                                }
                              }
                            }}
                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>등록된 객실이 없습니다.</p>
                    <button
                      onClick={() => {
                        setNewRoom(prev => ({ ...prev, hotelId: hotel.id }));
                        setShowRoomForm(true);
                      }}
                      className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      이 호텔에 객실 추가
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 호텔 추가 모달 */}
        {showHotelForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">새 호텔 추가</h2>
              <form onSubmit={handleHotelSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">호텔명</label>
                  <input
                    type="text"
                    value={newHotel.name}
                    onChange={(e) => setNewHotel({ ...newHotel, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">주소</label>
                  <input
                    type="text"
                    value={newHotel.address}
                    onChange={(e) => setNewHotel({ ...newHotel, address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                  <input
                    type="tel"
                    value={newHotel.phone}
                    onChange={(e) => setNewHotel({ ...newHotel, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                  <input
                    type="email"
                    value={newHotel.email}
                    onChange={(e) => setNewHotel({ ...newHotel, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
                  <textarea
                    value={newHotel.description}
                    onChange={(e) => setNewHotel({ ...newHotel, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        추가 중...
                      </>
                    ) : (
                      '추가'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowHotelForm(false)}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    취소
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 객실 추가 모달 */}
        {showRoomForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">새 객실 추가</h2>
              <form onSubmit={handleRoomSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">호텔 선택</label>
                  <select
                    value={newRoom.hotelId}
                    onChange={(e) => setNewRoom({ ...newRoom, hotelId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">호텔을 선택하세요</option>
                    {hotels.map((hotel) => (
                      <option key={hotel.id} value={hotel.id}>
                        {hotel.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">객실명</label>
                  <input
                    type="text"
                    value={newRoom.name}
                    onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
                  <textarea
                    value={newRoom.description}
                    onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">수용 인원</label>
                  <input
                    type="number"
                    value={newRoom.capacity}
                    onChange={(e) => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">기본 가격 (원)</label>
                  <input
                    type="number"
                    value={newRoom.basePrice}
                    onChange={(e) => setNewRoom({ ...newRoom, basePrice: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                    placeholder="예: 100000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">이미지 URL (선택)</label>
                  <input
                    type="url"
                    value={newRoom.imageUrl}
                    onChange={(e) => setNewRoom({ ...newRoom, imageUrl: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        추가 중...
                      </>
                    ) : (
                      '추가'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRoomForm(false)}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    취소
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
