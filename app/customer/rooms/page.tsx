'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  amenities: string[];
  images: string[];
  available: boolean;
}

export default function CustomerRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      // 샘플 데이터
      const mockRooms: Room[] = [
        {
          id: '1',
          name: '디럭스 룸',
          description: '편안하고 아늑한 디럭스 객실',
          price: 150000,
          capacity: 2,
          amenities: ['킹베드', '전용욕실', '무료WiFi', 'TV'],
          images: ['/api/placeholder/400/300'],
          available: true
        },
        {
          id: '2',
          name: '스위트 룸',
          description: '고급스러운 스위트 객실',
          price: 250000,
          capacity: 4,
          amenities: ['킹베드 + 소파베드', '전용욕실', '무료WiFi', 'TV', '미니바'],
          images: ['/api/placeholder/400/300'],
          available: true
        }
      ];
      setRooms(mockRooms);
    } catch (error) {
      console.error('객실 목록 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">객실 목록</h1>
              <p className="text-gray-600">편안한 숙박을 위한 다양한 객실을 확인하세요</p>
            </div>
            <Link
              href="/customer"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ← 고객센터로 돌아가기
            </Link>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                <div className="w-full h-48 bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-500">객실 이미지</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{room.name}</h3>
                <p className="text-gray-600 mb-4">{room.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    {room.price.toLocaleString()}원
                  </span>
                  <span className="text-sm text-gray-500">최대 {room.capacity}명</span>
                </div>
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">편의시설</h4>
                  <div className="flex flex-wrap gap-2">
                    {room.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
                <Link
                  href={`/customer/booking?roomId=${room.id}`}
                  className={`w-full block text-center py-2 px-4 rounded-lg font-medium transition-colors ${
                    room.available
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {room.available ? '예약하기' : '예약 불가'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
