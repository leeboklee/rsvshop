'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  roomId: string;
  createdAt: string;
}

interface Room {
  id: string;
  name: string;
  description: string;
  capacity: number;
}

export default function RoomPackagesManagement() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;
  
  const [room, setRoom] = useState<Room | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPackage, setNewPackage] = useState({
    name: '',
    description: '',
    price: 0
  });

  useEffect(() => {
    fetchRoomAndPackages();
  }, [roomId]);

  // packages 상태 변경 시 로깅
  useEffect(() => {
    console.log('packages 상태 변경:', packages);
    console.log('packages 타입:', typeof packages);
    console.log('Array.isArray(packages):', Array.isArray(packages));
  }, [packages]);

  const fetchRoomAndPackages = async () => {
    try {
      const [roomRes, packagesRes] = await Promise.all([
        fetch(`/api/rooms/${roomId}`),
        fetch(`/api/packages?roomId=${roomId}`)
      ]);
      
      const roomData = await roomRes.json();
      const packagesData = await packagesRes.json();
      
      setRoom(roomData);
      // API 응답이 배열인지 확인하고 안전하게 설정
      console.log('패키지 API 응답:', packagesData);
      console.log('응답 타입:', typeof packagesData);
      console.log('Array.isArray 결과:', Array.isArray(packagesData));
      
      if (Array.isArray(packagesData)) {
        setPackages(packagesData);
      } else if (packagesData && Array.isArray(packagesData.data)) {
        setPackages(packagesData.data);
      } else if (packagesData && Array.isArray(packagesData.packages)) {
        setPackages(packagesData.packages);
      } else if (packagesData && packagesData.success && Array.isArray(packagesData.packages)) {
        setPackages(packagesData.packages);
      } else {
        console.warn('패키지 데이터가 배열이 아닙니다:', packagesData);
        setPackages([]);
      }
    } catch (error) {
      console.error('데이터 조회 실패:', error);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newPackage,
          roomId
        }),
      });

      if (response.ok) {
        setShowAddForm(false);
        setNewPackage({ name: '', description: '', price: 0 });
        fetchRoomAndPackages();
      }
    } catch (error) {
      console.error('패키지 등록 실패:', error);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-8">로딩 중...</div>;
  }

  if (!room) {
    return <div className="container mx-auto p-8">객실을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">패키지 관리</h1>
          <p className="text-gray-600 mt-2">{room.name} - {room.description}</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/admin/rooms')}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            객실 목록
          </button>
          <button
            onClick={() => router.push('/admin/packages')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            전체 패키지 관리
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            신규 패키지 등록
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4">신규 패키지 등록</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">패키지명</label>
              <input
                type="text"
                value={newPackage.name}
                onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">설명</label>
              <textarea
                value={newPackage.description}
                onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">가격 (원)</label>
              <input
                type="number"
                value={newPackage.price}
                onChange={(e) => setNewPackage({ ...newPackage, price: parseInt(e.target.value) })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                min="0"
                required
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                등록
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(packages) && packages.map((pkg) => (
          <div key={pkg.id} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{pkg.name}</h3>
            <p className="text-gray-600 mb-4">{pkg.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-blue-600">
                {pkg.price.toLocaleString()}원
              </span>
              <button
                onClick={() => router.push(`/admin/packages`)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
              >
                전체 관리
              </button>
            </div>
          </div>
        ))}
      </div>

      {(!Array.isArray(packages) || packages.length === 0) && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">등록된 패키지가 없습니다.</p>
          <p className="text-gray-400 mt-2">신규 패키지를 등록해보세요.</p>
        </div>
      )}
    </div>
  );
} 